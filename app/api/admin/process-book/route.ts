import {NextRequest, NextResponse} from 'next/server';
import {PDFDocument} from 'pdf-lib';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {isAdmin} from '../../../../lib/admin';
import {parseEpub, sampleOf} from '../../../../lib/epub';

export const maxDuration = 120; // large EPUBs take a moment to unzip

// KDP-style processing step: turns an uploaded source file into reader
// content. EPUB → sanitised chapters + TOC + cover; PDF → validation and
// page count (pages are rendered client-side from a signed URL).
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  if (!(await isAdmin(supabase))) {
    return NextResponse.json({error: 'forbidden'}, {status: 403});
  }

  const body = (await req.json().catch(() => null)) as
    | {slug: string; locale: string}
    | null;
  if (!body?.slug || !['en', 'ko', 'ja'].includes(body.locale)) {
    return NextResponse.json({error: 'bad request'}, {status: 400});
  }

  const {data: book} = await supabase
    .from('books')
    .select('id, slug, title')
    .eq('slug', body.slug)
    .maybeSingle();
  if (!book) return NextResponse.json({error: 'book not found'}, {status: 404});

  const {data: edition} = await supabase
    .from('book_editions')
    .select('id, epub_path, pdf_path')
    .eq('book_id', book.id)
    .eq('locale', body.locale)
    .maybeSingle();
  if (!edition?.epub_path && !edition?.pdf_path) {
    return NextResponse.json({error: 'no uploaded file for this edition'}, {status: 404});
  }

  try {
    if (edition.epub_path) {
      const {data: file, error} = await supabase.storage
        .from('books')
        .download(edition.epub_path);
      if (error || !file) throw new Error(`download failed: ${error?.message}`);

      const parsed = await parseEpub(await file.arrayBuffer());

      if (parsed.cover) {
        const ext = parsed.cover.contentType.includes('png') ? 'png' : 'jpg';
        const coverPath = `${book.slug}.${ext}`;
        const {error: coverErr} = await supabase.storage
          .from('covers')
          .upload(coverPath, parsed.cover.data, {
            upsert: true,
            contentType: parsed.cover.contentType
          });
        if (!coverErr) {
          const {data: pub} = supabase.storage.from('covers').getPublicUrl(coverPath);
          await supabase.from('books').update({cover_url: pub.publicUrl}).eq('id', book.id);
        }
      }

      const {error: upErr} = await supabase.from('book_content').upsert(
        {
          book_id: book.id,
          locale: body.locale,
          kind: 'epub',
          toc: parsed.toc,
          chapters: parsed.chapters,
          sample: sampleOf(parsed.chapters),
          page_count: null,
          processed_at: new Date().toISOString()
        },
        {onConflict: 'book_id,locale'}
      );
      if (upErr) throw new Error(upErr.message);

      return NextResponse.json({
        ok: true,
        kind: 'epub',
        chapters: parsed.chapters.length,
        toc: parsed.toc.length,
        cover: Boolean(parsed.cover)
      });
    }

    // PDF-only edition: validate and record the page count.
    const {data: file, error} = await supabase.storage
      .from('books')
      .download(edition.pdf_path as string);
    if (error || !file) throw new Error(`download failed: ${error?.message}`);
    const pdf = await PDFDocument.load(await file.arrayBuffer(), {
      ignoreEncryption: true
    });
    const pageCount = pdf.getPageCount();

    const {error: upErr} = await supabase.from('book_content').upsert(
      {
        book_id: book.id,
        locale: body.locale,
        kind: 'pdf',
        toc: null,
        chapters: [],
        sample: [],
        page_count: pageCount,
        processed_at: new Date().toISOString()
      },
      {onConflict: 'book_id,locale'}
    );
    if (upErr) throw new Error(upErr.message);

    return NextResponse.json({ok: true, kind: 'pdf', pages: pageCount});
  } catch (e) {
    const message = e instanceof Error ? e.message : 'processing failed';
    return NextResponse.json({error: message}, {status: 422});
  }
}
