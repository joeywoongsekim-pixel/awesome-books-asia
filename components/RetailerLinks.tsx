import {useTranslations} from 'next-intl';
import {EDITIONS} from '../lib/retailers';

// Single-copy purchases happen at retail partners, not on our site.
// Books in EDITIONS render curated per-edition product links; anything
// else falls back to the retailer's search for the title.
const SEARCH_RETAILERS = [
  {name: 'Amazon', url: (q: string) => `https://www.amazon.com/s?k=${q}`},
  {
    name: '교보문고',
    url: (q: string) => `https://search.kyobobook.co.kr/search?keyword=${q}`
  },
  {
    name: 'YES24',
    url: (q: string) => `https://www.yes24.com/Product/Search?domain=ALL&query=${q}`
  },
  {
    name: '알라딘',
    url: (q: string) =>
      `https://www.aladin.co.kr/search/wsearchresult.aspx?SearchTarget=All&SearchWord=${q}`
  }
] as const;

export default function RetailerLinks({
  bookId,
  title
}: {
  bookId?: string;
  title: string;
}) {
  const t = useTranslations('detail');
  const editions = bookId ? EDITIONS[bookId] : undefined;

  if (editions?.length) {
    return (
      <div className="stores">
        <span className="stores-l">{t('stores')}</span>
        <div className="stores-row">
          {editions.map((e) => (
            <a
              key={e.url}
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`store-chip${e.format === 'print' ? ' store-chip-print' : ''}`}
            >
              {e.store} · {e.lang}
              {e.format === 'print' ? ` · ${t('fmtPrint')}` : ''}
              {e.note ? ` (${e.note})` : ''} ↗
            </a>
          ))}
        </div>
      </div>
    );
  }

  const q = encodeURIComponent(title);
  return (
    <div className="stores">
      <span className="stores-l">{t('stores')}</span>
      <div className="stores-row">
        {SEARCH_RETAILERS.map(({name, url}) => (
          <a
            key={name}
            href={url(q)}
            target="_blank"
            rel="noopener noreferrer"
            className="store-chip"
          >
            {name} ↗
          </a>
        ))}
      </div>
    </div>
  );
}
