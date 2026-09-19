import {BOOKS, coverFor, type Book} from './books';
import {EDITIONS, type EditionLink} from './retailers';

/* The renewal / India launch popup (M101).

   One campaign, one window, defined here so the component carries no dates
   of its own. The end is the close of 24 September in India, written as the
   UTC instant it falls on: the event is in India, so the popup should not
   vanish at teatime there because a clock in Seoul has already turned over.
   A visitor in Seoul therefore keeps it a few hours into the 25th, which is
   the harmless direction to be wrong in.

   The window is checked in the browser, not at build time. These pages are
   prerendered, so a build-time check would freeze whatever was true the
   moment the site was built and the popup would never expire on its own. */
export const PROMO = {
  id: 'india-launch-2026-09',
  /** Inclusive. 2026-09-19T00:00+05:30. */
  from: Date.parse('2026-09-18T18:30:00Z'),
  /** Exclusive: the first instant of 25 September in India. */
  until: Date.parse('2026-09-24T18:30:00Z')
} as const;

export function promoIsLive(now: number = Date.now()) {
  return now >= PROMO.from && now < PROMO.until;
}

/* ── Which Amazon, and at what price ──────────────────────────────────────

   A reader in Berlin was being sent to amazon.in and shown ₹199. The store
   should be theirs and so should the currency.

   The store part is easy and is done below. The price part is not, and the
   reason is worth writing down: Amazon prices a Kindle title by the
   BUYER's country, not the store's. Opening amazon.de from here returns
   "3,09 USD" and amazon.co.uk "USD 2.37" — those are what an international
   buyer is quoted, not what a German or British reader pays. It is the same
   trap that once put $2.18 on the India edition.

   So only figures a store gave in its own currency are recorded. Where
   there is none the chip carries the store and no number, and Amazon shows
   the reader the price that is actually theirs. A blank is not a gap to be
   filled with a conversion. */

const AMAZON_IN = 'www.amazon.in';

/* Verified: the ASINs resolve to the right book on each of these. Locales
   with no Amazon of their own (ko, fil) and those whose store would not
   answer (en → .com, pt → .com.br, both behind the bot wall) stay on the
   launch storefront, which is at least known to work. */
const STORE_BY_LOCALE: Record<string, string> = {
  hi: AMAZON_IN,
  ja: 'www.amazon.co.jp',
  de: 'www.amazon.de',
  fr: 'www.amazon.fr',
  es: 'www.amazon.es'
};

/* Read from each store, in that store's own currency, on 2026-09-19.
   amazon.co.jp, .de, .co.uk and .com answered in USD or not at all, so they
   have no entry here and show no figure. */
const PRICE_BY_STORE: Record<string, Record<string, string>> = {
  [AMAZON_IN]: {'ai-answer': '₹199', 'ai-bible': '₹449', 'quantum-econ-in': '₹199'},
  'www.amazon.fr': {'ai-answer': '2,69 €', 'ai-bible': '8,99 €', 'quantum-econ-in': '2,69 €'},
  'www.amazon.es': {'ai-answer': '2,69 €', 'ai-bible': '8,99 €', 'quantum-econ-in': '2,69 €'}
};

const asinOf = (url: string) => /\/dp\/([A-Z0-9]{10})/.exec(url)?.[1] ?? null;

export type IndiaEdition = {
  book: Book;
  link: EditionLink;
  /** The edition's own title where it differs from the book's. */
  title: string;
  /** This edition's jacket, or null when none is on file for it. */
  cover: string | null;
  /** The reader's own Amazon, e.g. 'www.amazon.fr'. */
  host: string;
  /** How that store is named on the chip, e.g. 'Amazon.fr'. */
  storeLabel: string;
  /** Same ASIN, the reader's storefront. */
  url: string;
  /** That store's own price, or null when none could be read from it. */
  price: string | null;
};

/* The books in the popup are not a hand-written list: they are every
   edition the catalogue sells on Amazon India. Add a third India edition to
   lib/retailers.ts and it appears here with no further edit. */
export function indiaEditions(locale: string): IndiaEdition[] {
  const host = STORE_BY_LOCALE[locale] ?? AMAZON_IN;
  const out: IndiaEdition[] = [];
  for (const book of BOOKS) {
    for (const link of EDITIONS[book.id] ?? []) {
      if (link.store !== 'Amazon IN') continue;
      const asin = asinOf(link.url);
      out.push({
        book,
        link,
        title: link.note ?? book.title,
        cover: coverFor(book.id, link.lang) ?? null,
        host,
        storeLabel: host.replace(/^www\./, '').replace(/^amazon/, 'Amazon'),
        // Without a parsable ASIN the original link stands rather than a
        // guessed one; every entry in the catalogue has one today.
        url: asin ? `https://${host}/dp/${asin}` : link.url,
        price: (asin && PRICE_BY_STORE[host]?.[book.id]) || null
      });
    }
  }
  return out;
}
