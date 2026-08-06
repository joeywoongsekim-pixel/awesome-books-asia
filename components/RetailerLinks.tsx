import {useTranslations} from 'next-intl';

// Single-copy purchases happen at retail partners, not on our site.
// Until per-book product URLs are curated (admin), each chip opens the
// retailer's search for the title.
const RETAILERS = [
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

export default function RetailerLinks({title}: {title: string}) {
  const t = useTranslations('detail');
  const q = encodeURIComponent(title);

  return (
    <div className="stores">
      <span className="stores-l">{t('stores')}</span>
      <div className="stores-row">
        {RETAILERS.map(({name, url}) => (
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
