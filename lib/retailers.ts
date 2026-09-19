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
  ko: ['원', '$', '¥'],
  ja: ['¥', '$', '원'],
  default: ['$', '¥', '원']
};

const numeric = (p: string) => Number(p.replace(/[^\d.]/g, '')) || Infinity;

/**
 * Cheapest listed price for a book, in the currency closest to the reader:
 * Korean pages quote 원, Japanese ¥ (then $), everyone else $.
 */
export function fromPrice(bookId: string, locale: string): string | null {
  const priced = (EDITIONS[bookId] ?? []).filter((e) => e.price);
  if (!priced.length) return null;
  for (const symbol of CURRENCY_ORDER[locale] ?? CURRENCY_ORDER.default) {
    const inCurrency = priced.filter((e) => e.price!.includes(symbol));
    if (inCurrency.length) {
      return inCurrency.sort((a, b) => numeric(a.price!) - numeric(b.price!))[0].price!;
    }
  }
  return priced[0].price!;
}

/** The cheapest listing for one language edition of a book, as printed. */
export function priceForLang(bookId: string, lang?: string): string | null {
  const links = (EDITIONS[bookId] ?? []).filter((l) => !lang || l.lang === lang);
  const priced = links.map((l) => l.price).filter(Boolean) as string[];
  if (!priced.length) return null;
  const num = (p: string) => Number(p.replace(/[^\d.]/g, '')) || Infinity;
  return priced.sort((a, b) => num(a) - num(b))[0];
}
