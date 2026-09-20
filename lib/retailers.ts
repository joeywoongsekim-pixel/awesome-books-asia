// Curated retailer product links for the published catalogue (M10).
// Keyed by BOOKS id. Every URL was supplied and verified against the live
// store listing — do not swap these for search links.

export type EditionLink = {
  store: 'Amazon' | 'Amazon JP' | 'Amazon IN' | '교보문고' | '교보 eBook' | 'YES24' | '알라딘';
  lang: 'KO' | 'EN' | 'JA';
  format: 'ebook' | 'print';
  note?: string; // regional edition label, e.g. 'UK Edition'
  url: string;
  // Included in Kindle Unlimited. Set only where the listing has been seen
  // saying so — Amazon blocks automated reads, so this cannot be checked
  // from here and a guess would be a claim about someone's subscription.
  // It matters most in India, where KU carries more weight than the price.
  ku?: boolean;
  // List price as the store shows it, checked 2026-09-17. Amazon quotes
  // international buyers in USD, so those carry a $ figure.
  price?: string;
};

export const EDITIONS: Record<string, EditionLink[]> = {
  // Japanese only for now; the ASIN is the Kindle edition published
  // 19 September 2026. No price recorded — amazon.co.jp renders it
  // after load, and the site shows no prices anyway.
  'ai-token': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0HKCDCZTF', ku: true}
  ],
  /* Published 20 September 2026. One ASIN on two storefronts: .in is the
     one the India launch points at, .com is where the rest of the world
     buys the same file. No `ku` on either — the .com listing's only
     mention of Kindle Unlimited is the site's own navigation link, not a
     badge on this book, and this flag is a claim about somebody's
     subscription. No price either: both storefronts render it after load. */
  'ai-token-in': [
    {store: 'Amazon IN', lang: 'EN', format: 'ebook', url: 'https://www.amazon.in/dp/B0HKG3PKRG'},
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0HKG3PKRG'}
  ],
  'ai-answer': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0HJZL583W', price: '$4.96'}
  ],
  'quantum-econ': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0H7RMWBCM', price: '$3.11'}
  ],
  'quantum-econ-uk': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0H86W24T9', price: '$3.34'}
  ],
  // The India edition is sold on Amazon India. Its ASIN was always right;
  // only the domain was wrong. ₹199 is what amazon.in shows a buyer in
  // India — the old $2.18 was amazon.com quoting an international one,
  // which is a different number for the same book.
  'quantum-econ-in': [
    {store: 'Amazon IN', lang: 'EN', format: 'ebook', url: 'https://www.amazon.in/dp/B0H86YMQG9', price: '₹199', ku: true}
  ],
  // One edition on three storefronts: the English ASIN is the same book on
  // .com and on .in, listed twice because the price a reader is quoted is
  // not the same. ₹449 to buy there, or nothing with a subscription.
  'ai-bible': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0GPPXFTYG', price: '$8.05'},
    {store: 'Amazon IN', lang: 'EN', format: 'ebook', url: 'https://www.amazon.in/dp/B0GPPXFTYG', price: '₹449', ku: true}
  ],
  isekai: [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0FJFJT89D', price: '$8.05'},
    {store: '교보 eBook', lang: 'EN', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603438', price: '21,000원'},
    {store: '교보문고', lang: 'EN', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966370', price: '42,000원'},
    {store: 'YES24', lang: 'EN', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366166', price: '21,000원'},
    {store: '알라딘', lang: 'EN', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367023520', price: '21,000원'}
  ],
  'ninja-cat': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FJFSLV5X', price: '$7.73'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011691326', price: '18,000원'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217095912', price: '20,000원'},
    {store: 'YES24', lang: 'JA', format: 'ebook', url: 'https://www.yes24.com/product/goods/149109850', price: '18,000원'},
    {store: '알라딘', lang: 'JA', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367918844', price: '18,000원'}
  ],
  /* The India Special Edition carries an ASIN of its own: a different
     book from the Japanese one, not a translation of it. */
  'ai-answer-in': [
    {
      store: 'Amazon IN',
      lang: 'EN',
      format: 'ebook',
      url: 'https://www.amazon.in/dp/B0HK79Y7KK',
      price: '₹199',
      ku: true
    }
  ],
  'quantum-econ-ja': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0H7RW5W13', price: '$1.93'}
  ],
  'ai-bible-ja': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0GMW6FV26', price: '$6.31'}
  ],
  'isekai-ko': [
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011635511', price: '21,000원'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966371', price: '42,000원'},
    {store: 'YES24', lang: 'KO', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366162', price: '21,000원'},
    {store: '알라딘', lang: 'KO', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367051986', price: '21,000원'}
  ],
  'isekai-ja': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FHZMZ5MW', price: '¥1,800'},
    {store: 'Amazon JP', lang: 'JA', format: 'print', url: 'https://www.amazon.co.jp/dp/B0FHZLF8Q7', price: '$19.13'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603290', price: '14,000원'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966360', price: '28,000원'},
    {store: 'YES24', lang: 'JA', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366167', price: '14,000원'},
    {store: '알라딘', lang: 'JA', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367023574', price: '14,000원'}
  ],
  'ninja-cat-ko': [
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011701844', price: '18,000원'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217178206', price: '20,000원'},
    {store: 'YES24', lang: 'KO', format: 'ebook', url: 'https://www.yes24.com/product/goods/149224600', price: '18,000원'},
    {store: '알라딘', lang: 'KO', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=368007844', price: '18,000원'}
  ]
};

// ── price helpers ───────────────────────────────────────────────────────

/* One rule, every locale: quote a reader a currency they can actually pay
   in, preferring the most local one, and print nothing rather than a third
   country's money.

   Before this, the last resort was "whatever the first listing says", which
   is how ₹199 ended up on the Korean, Japanese and German shelves. A price
   nobody on that page can pay is worse than a blank, because the blank
   still has a working link under it and Amazon then quotes the reader their
   own figure.

   Dollars are the universal second choice. Every Amazon quotes an
   international buyer in USD, so it is the one currency that is never
   simply wrong — and for the locales with no store of their own (en, fil,
   pt, and the European ones until their stores are read) it is the only
   choice. */
const CURRENCY_BY_LOCALE: Record<string, string[]> = {
  ko: ['원', '$'],
  ja: ['¥', '$'],
  hi: ['₹', '$'],
  default: ['$']
};

const numeric = (p: string) => Number(p.replace(/[^\d.]/g, '')) || Infinity;
const cheapest = (links: EditionLink[]) =>
  [...links].sort((a, b) => numeric(a.price!) - numeric(b.price!))[0].price!;

/* Among dollar listings, Amazon US is the one to quote: the rest are other
   storefronts quoting an international buyer, which is close but is not the
   price on the store a reader would actually land on. */
function inCurrency(links: EditionLink[], symbol: string) {
  const matching = links.filter((e) => e.price!.includes(symbol));
  if (!matching.length) return null;
  if (symbol === '$') {
    const us = matching.filter((e) => e.store === 'Amazon');
    if (us.length) return cheapest(us);
  }
  return cheapest(matching);
}

function quote(links: EditionLink[], locale?: string) {
  const priced = links.filter((e) => e.price);
  if (!priced.length) return null;
  for (const symbol of CURRENCY_BY_LOCALE[locale ?? ''] ?? CURRENCY_BY_LOCALE.default) {
    const found = inCurrency(priced, symbol);
    if (found) return found;
  }
  return null;
}

/**
 * Cheapest listed price for a book, in a currency the reader can pay in.
 *
 * Korean pages quote 원 where one of the Korean bookshops carries the title —
 * 교보문고, 교보 eBook, YES24, 알라딘 are the only stores here that price in
 * 원 — Japanese pages ¥, Indian pages ₹, and everyone falls back to dollars
 * off Amazon US. Nothing at all where none of that exists.
 */
export function fromPrice(bookId: string, locale: string): string | null {
  return quote(EDITIONS[bookId] ?? [], locale);
}

/**
 * The same, for one language edition of a book — what the homepage shelf
 * prints under a cover. It takes the locale for the same reason: the shelf
 * stands on the same ground as the cards beside it.
 */
export function priceForLang(
  bookId: string,
  lang?: string,
  locale?: string
): string | null {
  return quote(
    (EDITIONS[bookId] ?? []).filter((l) => !lang || l.lang === lang),
    locale
  );
}
