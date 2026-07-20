# AwesomeBooks — BUILD GUIDE

Spec for building `awesomebooks-web`. Read this fully before writing any code.

**Visual reference: `docs/prototype.html`** — open it and match it. It is the source of truth for layout, spacing, motion and copy. This document covers the parts a rendered page cannot tell you.

---

## 0. What this is

A rebuild of awesomebooks.asia as an eBook platform. The current live site is a Figma Make static site and stays untouched until launch — we build offline, then repoint DNS.

The product's differentiator is the **reader**, not the storefront. Three things no competitor does:

1. Four books open on one desk at once
2. Pages that follow the cursor when dragged (not button-swapped screens)
3. An AI assistant whose context is **every open book**, not the current one

The marketing site exists to explain those three things. Design decisions should serve that.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest, App Router) | Turbopack default |
| Language | TypeScript | strict |
| Styling | Tailwind 4 | `@theme` inline in `globals.css`, no `tailwind.config.js` |
| i18n | next-intl | `app/[locale]`, EN source |
| Auth + DB | Supabase | Seoul region (ap-northeast-2) |
| File storage | Supabase Storage | private bucket, signed URLs only |
| Payments | Stripe | Checkout + Subscriptions |
| PDF viewer | react-pdf | |
| EPUB viewer | epub.js | |
| Deploy | Vercel | |

**Locales:** `en` (source) · `ko` · `ja`. English is authored; KO/JA are generated from `messages/en.json` by script. Never hand-edit `ko.json` or `ja.json`.

---

## 2. Known traps — read before writing code

These have cost real days on sibling projects. They fail silently in dev and break production.

**`setRequestLocale` is mandatory in every route**
Call it in `app/[locale]/layout.tsx` *and* in every single `page.tsx`. Omitting it builds fine locally and throws `DYNAMIC_SERVER_USAGE` 500s only on Vercel.

```tsx
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  // ...
}
```

`generateStaticParams` is also required in the locale layout.

**Middleware file is `proxy.ts`**, not `middleware.ts`, on Next 16.

**SVG cannot use CSS variables in presentation attributes.** `fill="var(--gold)"` renders nothing. Hardcode hex in SVG, or use the `style` attribute.

**Unused TypeScript imports fail the Vercel build.** Lint locally before pushing.

**Turbopack image cache does not clear partially.** If an image is stale: kill node, delete `.next`, restart, hard-refresh in a private window. Do not attempt selective cache clearing.

---

## 3. Design system

### Tokens

Put these in `app/globals.css` under `@theme inline`.

```css
--color-gold:        #F5A623;   /* primary accent, CTAs */
--color-gold-dk:     #C9821A;   /* hover state */
--color-gold-deep:   #9A6210;   /* accent on light backgrounds */
--color-navy:        #0A0F2E;   /* text on gold, book covers */

--color-desk-1:      #070912;   /* page background, top */
--color-desk-2:      #0C0F1D;
--color-desk-3:      #141019;   /* page background, bottom */
--color-panel:       #10131F;   /* AI panel, cards */

--color-paper:       #F7F1E4;   /* light sections, page top */
--color-paper-2:     #EFE7D6;   /* light sections, page bottom */
--color-ink:         #221E18;   /* text on paper */
--color-ink-mid:     #544C3E;
--color-ink-soft:    #8A8171;

--color-line:        rgb(255 255 255 / 0.09);   /* borders on dark */
```

### The desk background

The signature visual. A fixed, page-wide surface everything sits on:

```css
background:
  radial-gradient(ellipse 60% 40% at 50% 0%,  rgb(70 105 185 / .13) 0%, transparent 62%),
  radial-gradient(ellipse 50% 34% at 78% 30%, rgb(185 105 25 / .11) 0%, transparent 60%),
  linear-gradient(168deg, #070912 0%, #0C0F1D 40%, #141019 100%);
```

Plus a vignette overlay: `radial-gradient(circle at 50% 40%, transparent, rgb(0 0 0 / .5))`.

### Concept: paper on a desk

The page is a dark desk. Light sections are **sheets of paper lying on it** — cream gradient, soft grain, and a strong upward shadow (`0 -22px 60px rgb(0 0 0 / .5)`) where they meet the dark. This ties the marketing site to the reader. Keep it consistent; do not introduce a third surface type.

### Type

| Role | Family | Weights |
|---|---|---|
| Display / headings | Playfair Display | 700, 900, + italic |
| Body serif (prose, book text) | Lora | 400, 500, 600, italic |
| UI / labels / buttons | DM Sans | 300–700 |
| Numerals, metadata, code | Space Mono | 400, 700 |
| Korean fallback | Noto Serif KR | 400, 600 |

Serif stack: `'Lora', 'Noto Serif KR', Georgia, serif`.

Headings are Playfair with `letter-spacing: -0.4px` to `-0.6px` at large sizes. Body prose is Lora at `line-height: 1.85–1.95` — generous, it is a reading product.

### Motion

- Section reveals: `IntersectionObserver`, translateY(26px) → 0, 0.7s
- Hover lifts: `translateY(-4px to -6px)`, 0.3s
- Book pickup: `cubic-bezier(.34, 1.3, .5, 1)` — slight overshoot, it should feel physical
- Page turn: `cubic-bezier(.36, .06, .2, 1)`, 0.5s

### Nav

Transparent over the hero, with the hero background running underneath it. Adds a blurred dark backdrop after 40px of scroll. On non-home routes it starts solid. This was an explicit requirement — preserve it.

---

## 4. Routes

```
app/[locale]/
  layout.tsx           nav + footer + desk background
  page.tsx             home
  books/page.tsx       bookstore (filters)
  books/[slug]/page.tsx  book detail
  read/[slug]/page.tsx   reader (own chrome, no site nav)
  library/page.tsx     my library          [auth]
  account/page.tsx     profile, billing    [auth]
  plans/page.tsx       pricing + checkout
  redeem/page.tsx      coupon entry        [auth]
  partners/page.tsx    publisher enquiry
  about/page.tsx
admin/                 book + coupon management  [admin only]
```

---

## 5. Data model (Supabase)

```
books
  id uuid pk · slug text unique · title · author · category
  cover_url · icon · level int · is_new bool
  price_cents int          -- 0 means subscription-only
  page_count int · published_at date
  created_at timestamptz

book_editions              -- one row per language per book
  id · book_id fk · locale ('en'|'ko'|'ja')
  title · blurb · toc jsonb
  pdf_path text · epub_path text     -- storage keys, never public URLs

purchases
  id · user_id fk · book_id fk · stripe_payment_intent
  created_at

subscriptions
  id · user_id fk · stripe_subscription_id
  status · current_period_end

coupons
  id uuid pk
  code varchar(50) unique
  type ('single_book'|'subscription_30d'|'subscription_365d')
  book_id uuid null           -- only for single_book
  is_used bool default false  -- one use, then permanently locked
  used_by uuid null fk
  used_at timestamptz null
  expires_at timestamptz
  created_by uuid fk
  created_at timestamptz

reading_progress
  user_id · book_id · locale · spread_index · updated_at
  primary key (user_id, book_id, locale)

bookmarks
  id · user_id · book_id · locale · page_index · note · created_at
```

**Coupons are single-use.** Redemption must be an atomic conditional update — `UPDATE coupons SET is_used = true WHERE code = $1 AND is_used = false RETURNING *`. If zero rows come back, it was already used. Do not read-then-write; that races.

**Row Level Security on everything.** A user may only select their own purchases, subscriptions, progress and bookmarks.

**Files are never public.** `read_file` access issues a signed URL valid for 10 minutes, and only after verifying the user has a purchase or an active subscription. The bucket stays private.

---

## 6. Milestones

Do one milestone at a time. End each with `npm run build` passing, then stop and report before starting the next.

### M1 — Scaffold and shell
- `create-next-app`, TypeScript, Tailwind 4, App Router, no `src/`, no import alias
- next-intl with `[locale]` routing, `en`/`ko`/`ja`, `proxy.ts`
- Design tokens in `globals.css`, fonts via `next/font`
- Desk background component (fixed, full page)
- Nav (transparent → blurred on scroll) and footer
- Dev server on port 3001 — 3000 is Awesome AI Asia
- **Done when:** all three locales route, nav behaves on scroll, build passes

### M2 — Home
Sections in order: hero → pillars → books → how it works → plans → partners.

The hero contains a **live miniature desk** — three tilted books above, an open spread below, click to swap, auto page-turn on a 5.6s interval. Not a static image. It is the entire pitch.

Book data can be a local `lib/books.ts` for now; Supabase comes in M5.

**Done when:** matches `docs/prototype.html` home screen, reveals animate, responsive down to 380px.

### M3 — Bookstore and detail
- Grid with working subject × language filters, empty state
- Detail page: 3D-tilted cover, blurb, language tabs, contents, metadata, related books
- All CTAs route to `/read/[slug]` for now

### M4 — Reader
Largest milestone. Break into four commits:

1. **Desk layout** — three books tilted back on `rotateX(17deg)`, main spread below, click to swap
2. **Page turn** — drag the bottom-right corner, angle follows the cursor, releases past 78° commit and below it snap back. Keyboard and arrows too
3. **Book moving** — pick any book up and drop it in any slot, including main → shelf via the grip handle. Ghost follows cursor, drop targets highlight
4. **AI panel** — desk contents listed as context, cross-book answers with book+page citations

Use **pointer events**, not mouse events. The prototype is mouse-only and does not work on touch — fix that here.

Page turn animates on the main spread only. The three shelf books stay static, or performance collapses on mobile.

Shelf book text renders at ~10px with the page **cropped and faded at the bottom**, not scaled down. Scaling a full page to thumbnail size drops the type below 7px and it becomes unreadable — this was tested.

### M5 — Auth and real data
- Supabase auth (email + Google), RLS policies
- Books and editions moved to Supabase, seeded with the 6 titles
- Private storage bucket, signed-URL endpoint with entitlement check
- My Library, reading progress, bookmarks

### M6 — Payments
- Stripe Checkout for single books
- Stripe Subscriptions monthly/annual, webhook → `subscriptions` table
- Coupon redemption (atomic, single-use)
- Sample preview: first 3 spreads readable without entitlement

### M7 — Admin
Book CRUD, file upload, coupon generation with usage tracking, basic revenue summary.

---

## 7. Content rules

- **British English** throughout — organisation, colour, programme, specialise, catalogue. Matches Awesome AI Asia.
- No em-dash-heavy marketing voice. Plain, confident sentences.
- Prices are USD. Single books $7–15, monthly $9.99, annual $79.99.
- Never describe the AI as reading "the book". It reads **the desk**. That distinction is the product.

---

## 8. Before every push

```bash
npm run build          # unused imports will fail here, not in dev
git add -A
git commit -m "..."
git push
```

Confirm the git committer identity is correct for this repo before the first commit — a sibling project had Vercel reject deploys over a mismatched author email.
