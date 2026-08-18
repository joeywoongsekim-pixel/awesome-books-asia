// Curated retailer product links for the published catalogue (M10).
// Keyed by BOOKS id. Every URL was supplied and verified against the live
// store listing — do not swap these for search links.

export type EditionLink = {
  store: 'Amazon' | 'Amazon JP' | '교보문고' | '교보 eBook';
  lang: 'KO' | 'EN' | 'JA';
  format: 'ebook' | 'print';
  note?: string; // regional edition label, e.g. 'UK Edition'
  url: string;
};

export const EDITIONS: Record<string, EditionLink[]> = {
  'quantum-econ': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0H7RMWBCM'},
    {store: 'Amazon', lang: 'EN', format: 'ebook', note: 'UK Edition', url: 'https://www.amazon.com/dp/B0H86W24T9'},
    {store: 'Amazon', lang: 'EN', format: 'ebook', note: 'India Edition', url: 'https://www.amazon.com/dp/B0H86YMQG9'},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0H7RW5W13'}
  ],
  'ai-bible': [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0GPPXFTYG'},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0GMW6FV26'}
  ],
  isekai: [
    {store: 'Amazon', lang: 'EN', format: 'ebook', url: 'https://www.amazon.com/dp/B0FJFJT89D'},
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FHZMZ5MW'},
    {store: 'Amazon JP', lang: 'JA', format: 'print', url: 'https://www.amazon.co.jp/dp/B0FHZLF8Q7'},
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011635511'},
    {store: '교보 eBook', lang: 'EN', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603438'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011603290'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966371'},
    {store: '교보문고', lang: 'EN', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966370'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000216966360'}
  ],
  'ninja-cat': [
    {store: 'Amazon JP', lang: 'JA', format: 'ebook', url: 'https://www.amazon.co.jp/dp/B0FJFSLV5X'},
    {store: '교보 eBook', lang: 'KO', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011701844'},
    {store: '교보 eBook', lang: 'JA', format: 'ebook', url: 'https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000011691326'},
    {store: '교보문고', lang: 'KO', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217178206'},
    {store: '교보문고', lang: 'JA', format: 'print', url: 'https://product.kyobobook.co.kr/detail/S000217095912'}
  ]
};
