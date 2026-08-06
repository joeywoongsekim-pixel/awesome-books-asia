# Awesome Books Asia — Operations Manual

> www.awesomebooks.asia · As of August 2026
> Audience: operators (admin account holders)

---

## 1. Service at a glance

| Item | Detail |
|---|---|
| Production | https://www.awesomebooks.asia (apex redirects to www) |
| Repository | github.com/joeywoongsekim-pixel/awesome-books-asia (`main` branch) |
| Deployment | Push to `main` → Vercel deploys automatically (~40 s) |
| DB / Auth / Files | Supabase project `hbsqmtdnnkzsbqxvclxf` (shared with Awesome AI Asia) |
| DNS | Cloudflare (A `76.76.21.21`, CNAME www `cname.vercel-dns.com`, both DNS only) |
| Languages | 8 — EN · KO · JA · FIL · DE · FR · ES · PT |
| Admins | joey.woongse.kim@awesomeai.asia · akira.murata@awesomeai.asia · contact@awesomebooks.asia |

**Current business model**
- Single-copy sales: not sold on-site → the detail page links out to retail partners (Amazon · Kyobo · YES24 · Aladin)
- Reading access: **invitation coupons only.** No sign-up without a code; redeeming a coupon grants full reading for its subscription period
- Paid subscriptions: switch on when the catalogue reaches 200 titles (code is ready and dormant)

---

## 2. One-time setup (still outstanding)

Supabase dashboard → project → **Authentication**:

1. **URL Configuration**
   - Site URL: `https://www.awesomebooks.asia`
   - Add to Redirect URLs: `https://www.awesomebooks.asia/api/auth/callback`
   - (Without this, confirmation e-mail links point at localhost)
2. **Decide the Confirm email policy** (Sign In / Providers → Email)
   - On (default): new members must click a confirmation e-mail — blocks throwaway accounts, but requires working e-mail
   - Off: instant sign-up — the invite coupon already acts as the gatekeeper, so turning it off is safe (recommended for convenience)
3. **Google login** (optional): register an OAuth client ID/secret under Providers → Google. Until then the Google button errors — fine to postpone

---

## 3. Inviting people (the core workflow)

### 3-1. First admin sign-up (bootstrap)

1. Take one of the bootstrap coupon codes (delivered separately) to https://www.awesomebooks.asia/en/auth/signup
2. Sign up with the code + one of the three admin e-mails + a password
3. (If Confirm email is on) click the link in the confirmation e-mail
4. Once signed in, the coupon redeems automatically and https://www.awesomebooks.asia/en/admin opens

### 3-2. Issuing invite coupons

1. `/en/admin` → **Coupons** tab
2. Pick a type:
   - **365-day subscription** ← the standard for friend invitations (one year of free reading)
   - 30-day subscription / single book (tied to one title) also available
3. Set quantity (1–100) and an optional expiry → **Generate coupons**
4. Copy the `ABA-XXXX-XXXX` codes from the list and send them out

Sample message:
> You're invited to Awesome Books Asia. Sign up at
> https://www.awesomebooks.asia/en/auth/signup with coupon code `ABA-XXXX-XXXX`
> and read everything free for a year.

### 3-3. What invitees experience

Sign-up (code required) → the code redeems automatically at first sign-in → full reading in the library and reader.
If auto-redemption is missed (e.g. the confirmation link was opened on another device), the code can be entered manually at `/en/redeem`.

- Codes are **single-use** — they lock on redemption, recording who used them and when
- Visitors without a coupon can read the first 3 spreads of any book (the sample), then meet a sign-up invitation

---

## 4. Managing books

`/en/admin` → **Books** tab

### 4-1. Adding a book

**New book** → fill in:

| Field | Notes |
|---|---|
| Title / Author | As displayed |
| Slug | URL name (e.g. `ai-bible`) — lowercase and hyphens only; avoid changing after launch |
| Category | `ai` / `edu` / `kids` |
| Price (USD) | Display price for retail; 0 = subscription-only |
| Reading level | 1–3 |
| Pages / Published / Mark as new | Detail-page metadata |

### 4-2. Uploading files (PDF/EPUB)

At the bottom of the book editor, upload **PDF / EPUB per language** (EN/KO/JA).
- Files land in private storage as `slug/locale.pdf` and are served to entitled readers via 10-minute signed URLs
- A ✓ appears when a file is in place

### 4-3. Good to know (important)

- The home and bookstore pages currently show the **six launch titles built into the code.** Books added in the admin count towards entitlements, files and the 200-title counter, but **do not appear on the storefront automatically yet** — when cataloguing begins in earnest, ask for the "wire the storefront to the database" task (planned next step)
- **Reaching 200 titles**: the count is computed live from the database, so registering title #200 satisfies the pricing banner's condition — that is the moment to switch payments on (§6)

---

## 5. Membership & entitlements (reference)

| Concept | Meaning |
|---|---|
| Coupons | Invitation = access pass. Single book / 30 days / 365 days |
| Purchases | Permanent single-book ownership (via coupon, or payment later) |
| Subscriptions | Time-boxed all-you-can-read; expires automatically at `current_period_end` |
| Sample | Anyone can read the first 3 spreads of every book |
| Progress & bookmarks | Saved automatically for signed-in readers |

Admins are added/removed via SQL only (Supabase SQL Editor):

```sql
insert into admin_emails (email) values ('new.admin@example.com');
delete from admin_emails where email = 'old.admin@example.com';
```

---

## 6. Switching payments on (at 200 titles)

The payment code is deployed and dormant — it only lacks environment variables.

1. Choose the processor: Stripe (needs a foreign entity — Japan GK or Estonia OÜ) or Airwallex (Korean entity possible; confirm acceptance availability)
2. For Stripe: in Vercel → project → Settings → Environment Variables, set
   `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `SUPABASE_SERVICE_ROLE_KEY`, then redeploy
3. Register the webhook endpoint in the Stripe dashboard: `https://www.awesomebooks.asia/api/stripe-webhook`
   (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
4. Removing the invite-code requirement from sign-up is a one-line dev task (on request)

---

## 7. Content, translations & deployment (dev workflow)

- Site copy lives in `messages/en.json` (English source) → `npm run i18n` regenerates the seven other languages (committed cache at `scripts/translation-cache.json`; with `ANTHROPIC_API_KEY` set, new strings translate automatically)
- `npm run i18n:check` — fails if any translation is missing
- Confirm `npm run build` passes, then `git push` → Vercel deploys
- Schema history: `supabase/migrations/` (apply via the Supabase SQL Editor, or ask Claude)

---

## 8. Troubleshooting

| Symptom | Check |
|---|---|
| Sign-up rejected ("code not valid") | Is the coupon unused and unexpired? Check the admin coupon list |
| No confirmation e-mail | Supabase Auth logs, spam folder, §2 URL configuration |
| Signed up but books stay locked | Redeem the code manually at `/en/redeem` |
| Admin page says "no access" | Is the signed-in e-mail one of the three admins? E-mail confirmed? |
| File upload fails | Confirm you're on an admin account; check the extension (.pdf/.epub) |
| Stale styles / broken layout | Hard refresh (Ctrl+Shift+R); check the latest deployment in Vercel |
| Domain errors | Cloudflare A/CNAME must match §1 and be "DNS only" |

---

## 9. Accounts & assets

- **GitHub**: joeywoongsekim-pixel / awesome-books-asia
- **Vercel**: project awesome-books-asia (auto-deploy from GitHub)
- **Supabase**: project hbsqmtdnnkzsbqxvclxf (Auth · DB · Storage)
- **Cloudflare**: awesomebooks.asia DNS (⚠️ never touch MX smtp.google.com, the three gabia NS records, or the TXT verification record — company e-mail and nameservers depend on them)
- **Design guide**: `docs/` (brand spec v1.0, prototype)
- **Logo master**: `public/logo.jpg` (circular seal; favicon at `app/icon.png`)
