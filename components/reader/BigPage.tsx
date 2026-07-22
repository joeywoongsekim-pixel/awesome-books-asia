import type {Book} from '../../lib/books';

// One large reader page — same DOM as the prototype's bigPage().
export default function BigPage({book, index}: {book: Book; index: number}) {
  const p = book.sp[index];
  if (!p) return null;
  const body = (p.fig ? `<div class="big-fig"><i>${p.fig.i}</i>${p.fig.t}</div>` : '') + p.x;
  return (
    <div className="big">
      {p.ch && <div className="big-ch">{p.ch}</div>}
      {p.h && <div className="big-h" dangerouslySetInnerHTML={{__html: p.h}} />}
      <div className="big-t" dangerouslySetInnerHTML={{__html: body}} />
      <div className="big-n">{index + 1}</div>
    </div>
  );
}

// Running context for a shelf book: nearest chapter + heading at/before page.
export function ctxOf(book: Book, pageIndex: number) {
  let ch: string | null = null;
  let h: string | null = null;
  for (let i = Math.min(pageIndex, book.sp.length - 1); i >= 0; i--) {
    if (!ch && book.sp[i].ch) ch = book.sp[i].ch!;
    if (!h && book.sp[i].h) h = book.sp[i].h!;
    if (ch && h) break;
  }
  return {ch: ch ?? book.title, h: (h ?? '').replace(/<br>/g, ' ')};
}
