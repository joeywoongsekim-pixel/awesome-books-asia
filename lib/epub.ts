import JSZip from 'jszip';
import {XMLParser} from 'fast-xml-parser';
import sanitizeHtml from 'sanitize-html';

// Server-side EPUB ingest: container → OPF → spine order, metadata, TOC and
// sanitised chapter HTML the desk reader can lay out. Images are dropped in
// this first pass (their captions survive); embedding them is a later step.

export type EpubChapter = {id: string; title: string; html: string};
export type EpubTocEntry = {title: string; index: number};
export type ParsedEpub = {
  title: string | null;
  author: string | null;
  chapters: EpubChapter[];
  toc: EpubTocEntry[];
  cover: {data: Uint8Array; contentType: string} | null;
};

const MAX_TOTAL_HTML = 6_000_000; // ~6 MB of text is plenty for one edition

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true
});

const asArray = <T>(v: T | T[] | undefined): T[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

function dirOf(path: string) {
  const i = path.lastIndexOf('/');
  return i === -1 ? '' : path.slice(0, i + 1);
}

function resolvePath(base: string, href: string) {
  const raw = `${base}${decodeURIComponent(href.split('#')[0])}`;
  const parts: string[] = [];
  for (const seg of raw.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.' && seg !== '') parts.push(seg);
  }
  return parts.join('/');
}

function clean(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'em', 'i', 'strong', 'b',
      'blockquote', 'ul', 'ol', 'li', 'br', 'hr', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub', 'cite',
      'span', 'div', 'section'
    ],
    allowedAttributes: {},
    exclusiveFilter: (frame) =>
      ['span', 'div', 'section'].includes(frame.tag) && !frame.text.trim()
  })
    .replace(/\s+\n/g, '\n')
    .trim();
}

function textOf(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function parseEpub(buf: ArrayBuffer): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(buf);

  const containerXml = await zip.file('META-INF/container.xml')?.async('string');
  if (!containerXml) throw new Error('not an EPUB: META-INF/container.xml missing');
  const container = parser.parse(containerXml);
  const rootfile = asArray(container?.container?.rootfiles?.rootfile)[0];
  const opfPath: string | undefined = rootfile?.['@_full-path'];
  if (!opfPath || !zip.file(opfPath)) throw new Error('OPF package document missing');

  const opf = parser.parse(await zip.file(opfPath)!.async('string'));
  const pkg = opf?.package;
  if (!pkg) throw new Error('invalid OPF package');
  const base = dirOf(opfPath);

  const meta = pkg.metadata ?? {};
  const title = textOf(String(asArray(meta.title)[0]?.['#text'] ?? asArray(meta.title)[0] ?? '')) || null;
  const author = textOf(String(asArray(meta.creator)[0]?.['#text'] ?? asArray(meta.creator)[0] ?? '')) || null;

  type Item = {id: string; href: string; type: string; props: string};
  const items = new Map<string, Item>();
  for (const it of asArray<Record<string, string>>(pkg.manifest?.item)) {
    items.set(it['@_id'], {
      id: it['@_id'],
      href: it['@_href'],
      type: it['@_media-type'] ?? '',
      props: it['@_properties'] ?? ''
    });
  }

  // Cover: EPUB3 cover-image property, else EPUB2 <meta name="cover">.
  let cover: ParsedEpub['cover'] = null;
  let coverItem = [...items.values()].find((i) => i.props.includes('cover-image'));
  if (!coverItem) {
    const coverMeta = asArray<Record<string, string>>(meta.meta).find(
      (m) => m['@_name'] === 'cover'
    );
    if (coverMeta) coverItem = items.get(coverMeta['@_content']);
  }
  if (coverItem?.type.startsWith('image/')) {
    const file = zip.file(resolvePath(base, coverItem.href));
    if (file) {
      cover = {data: await file.async('uint8array'), contentType: coverItem.type};
    }
  }

  // Spine → ordered chapter documents (skip the nav doc itself).
  const navItem = [...items.values()].find((i) => i.props.includes('nav'));
  const chapters: EpubChapter[] = [];
  let total = 0;
  for (const ref of asArray<Record<string, string>>(pkg.spine?.itemref)) {
    const item = items.get(ref['@_idref']);
    if (!item || item === navItem || !item.type.includes('html')) continue;
    const file = zip.file(resolvePath(base, item.href));
    if (!file) continue;
    const raw = await file.async('string');
    const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const html = clean(bodyMatch ? bodyMatch[1] : raw);
    if (!textOf(html)) continue;
    const heading = html.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    chapters.push({
      id: item.id,
      title: heading ? textOf(heading[1]).slice(0, 120) : `${chapters.length + 1}`,
      html
    });
    total += html.length;
    if (total > MAX_TOTAL_HTML) throw new Error('EPUB text exceeds the 6 MB ingest limit');
  }
  if (chapters.length === 0) throw new Error('no readable chapters found in the spine');

  // TOC titles: EPUB3 nav document, else NCX; mapped onto chapter order.
  const toc: EpubTocEntry[] = [];
  const addToc = (title: string) => {
    const t = textOf(title);
    if (t) toc.push({title: t.slice(0, 160), index: toc.length});
  };
  if (navItem) {
    const nav = await zip.file(resolvePath(base, navItem.href))?.async('string');
    if (nav) {
      for (const m of nav.matchAll(/<a [^>]*>([\s\S]*?)<\/a>/gi)) addToc(m[1]);
    }
  } else {
    const ncxId = pkg.spine?.['@_toc'];
    const ncxItem = ncxId ? items.get(ncxId) : undefined;
    if (ncxItem) {
      const ncx = await zip.file(resolvePath(base, ncxItem.href))?.async('string');
      if (ncx) {
        for (const m of ncx.matchAll(/<text>([\s\S]*?)<\/text>/gi)) addToc(m[1]);
      }
    }
  }

  return {title, author, chapters, toc: toc.slice(0, 60), cover};
}

// Free-preview subset: the opening of the book, capped so the paywall
// still has something to protect.
export function sampleOf(chapters: EpubChapter[]): EpubChapter[] {
  const out: EpubChapter[] = [];
  let budget = 14_000;
  for (const ch of chapters) {
    if (budget <= 0) break;
    const html = ch.html.length > budget ? `${ch.html.slice(0, budget)}…` : ch.html;
    out.push({...ch, html});
    budget -= ch.html.length;
  }
  return out.length ? out : chapters.slice(0, 1);
}
