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
  'ai-answer': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0HJZL583W', price: '$4.96'},
    {
      store: 'Amazon IN',
      lang: 'EN',
      format: 'ebook',
      note: 'What Do Humans Add to AI’s Answers?',
      url: 'https://www.amazon.in/dp/B0HK79Y7KK',
      price: '₹199',
      ku: true
    }
  ],
  'quantum-econ': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0H7RMWBCM', price: '$3.11'},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0H7RW5W13', price: '$1.93'}
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
    {store: 'Amazon IN', lang: 'EN', format: 'ebook', url: 'https://www.amazon.in/dp/B0GPPXFTYG', price: '₹449', ku: true},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0GMW6FV26', price: '$6.31'}
  ],
  isekai: [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0FJFJT89D', price: '$8.05'},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FHZMZ5MW', price: '¥1,800'},
    {store: 'Amazon JP', lang: 'JA', format: 'print', url: 'https://www.amazon.co.jp/dp/B0FHZLF8Q7', price: '$19.13'},
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011635511', price: '21,000원'},
    {store: '교보 eBook', lang: 'EN', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603438', price: '21,000원'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603290', price: '14,000원'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966371', price: '42,000원'},
    {store: '교보문고', lang: 'EN', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966370', price: '42,000원'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966360', price: '28,000원'},
    {store: 'YES24', lang: 'KO', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366162', price: '21,000원'},
    {store: 'YES24', lang: 'EN', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366166', price: '21,000원'},
    {store: 'YES24', lang: 'JA', format: 'ebook', url: 'https://www.yes24.com/product/goods/148366167', price: '14,000원'},
    {store: '알라딘', lang: 'KO', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367051986', price: '21,000원'},
    {store: '알라딘', lang: 'EN', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367023520', price: '21,000원'},
    {store: '알라딘', lang: 'JA', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367023574', price: '14,000원'}
  ],
  'ninja-cat': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FJFSLV5X', price: '$7.73'},
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011701844', price: '18,000원'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011691326', price: '18,000원'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217178206', price: '20,000원'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217095912', price: '20,000원'},
    {store: 'YES24', lang: 'KO', format: 'ebook', url: 'https://www.yes24.com/product/goods/149224600', price: '18,000원'},
    {store: 'YES24', lang: 'JA', format: 'ebook', url: 'https://www.yes24.com/product/goods/149109850', price: '18,000원'},
    {store: '알라딘', lang: 'KO', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=368007844', price: '18,000원'},
    {store: '알라딘', lang: 'JA', format: 'ebook', url: 'https://www.aladin.co.kr/shop/wproduct.aspx?ItemId=367918844', price: '18,000원'}
  ]
};

// ── price helpers ───────────────────────────────────────────────────────
const CURRENCY_ORDER: Record<string, string[]> = {
  ja: ['¥', '$', '원'],
  default: ['$', '¥', '원']
};

/** The Korean bookshops, as against the Amazons. */
const KOREAN_STORES: ReadonlySet<EditionLink['store']> = new Set([
  '교보문고',
  '교보 eBook',
  'YES24',
  '알라딘'
]);

const numeric = (p: string) => Number(p.replace(/[^\d.]/g, '')) || Infinity;
const cheapest = (links: EditionLink[]) =>
  links.sort((a, b) => numeric(a.price!) - numeric(b.price!))[0].price!;

/**
 * Cheapest listed price for a book, in the currency closest to the reader.
 *
 * Korean pages have a rule of their own, because Korea has no Amazon of its
 * own: a title the Korean bookshops carry is quoted in 원, and anything they
 * do not carry is quoted in dollars off Amazon US, which is where a reader
 * here would buy it as an international customer. If neither exists the card
 * shows no price at all rather than quoting ₹ or ¥ at someone who cannot
 * pay in either.
 */
export function fromPrice(bookId: string, locale: string): string | null {
  const priced = (EDITIONS[bookId] ?? []).filter((e) => e.price);
  if (!priced.length) return null;

  if (locale === 'ko') {
    const won = priced.filter((e) => KOREAN_STORES.has(e.store));
    if (won.length) return cheapest(won);
    const us = priced.filter((e) => e.store === 'Amazon');
    if (us.length) return cheapest(us);
    // No .com listing on file. A dollar figure from another Amazon is an
    // international buyer's quote, which is what a reader in Korea is, so
    // it stands in — but only a dollar one. Quoting ₹ or ¥ at someone who
    // can pay in neither is the thing this rule exists to stop.
    const dollars = priced.filter((e) => e.price!.includes('$'));
    return dollars.length ? cheapest(dollars) : null;
  }

  for (const symbol of CURRENCY_ORDER[locale] ?? CURRENCY_ORDER.default) {
    const inCurrency = priced.filter((e) => e.price!.includes(symbol));
    if (inCurrency.length) return cheapest(inCurrency);
  }
  return priced[0].price!;
}

/**
 * The cheapest listing for one language edition of a book, as printed.
 *
 * Takes the locale too, because the shelf stands on the same ground as the
 * cards beside it: a Korean page quotes 원 where a Korean bookshop carries
 * that edition and dollars where none does, rather than whatever currency
 * happens to be cheapest.
 */
export function priceForLang(
  bookId: string,
  lang?: string,
  locale?: string
): string | null {
  const links = (EDITIONS[bookId] ?? []).filter(
    (l) => (!lang || l.lang === lang) && l.price
  );
  if (!links.length) return null;

  if (locale === 'ko') {
    const won = links.filter((e) => KOREAN_STORES.has(e.store));
    if (won.length) return cheapest(won);
    const us = links.filter((e) => e.store === 'Amazon');
    if (us.length) return cheapest(us);
    const dollars = links.filter((e) => e.price!.includes('$'));
    return dollars.length ? cheapest(dollars) : null;
  }
  return cheapest(links);
}
