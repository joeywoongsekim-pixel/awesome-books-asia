'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';

// Unambiguous charset (no O/0, I/1, …) for gift codes: ABA-XXXX-XXXX.
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomCode() {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  const pick = (b: number) => CHARS[b % CHARS.length];
  const s = Array.from(buf, pick).join('');
  return `ABA-${s.slice(0, 4)}-${s.slice(4)}`;
}

export default function CouponGenerator({
  books
}: {
  books: {id: string; title: string}[];
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [type, setType] = useState('single_book');
  const [bookId, setBookId] = useState(books[0]?.id ?? '');
  const [count, setCount] = useState('5');
  const [expires, setExpires] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setMsg('');
    const n = Math.min(Math.max(Number(count) || 1, 1), 100);
    const rows = Array.from({length: n}, () => ({
      code: randomCode(),
      type,
      book_id: type === 'single_book' ? bookId || null : null,
      expires_at: expires ? new Date(`${expires}T23:59:59Z`).toISOString() : null
    }));
    const {error} = await supabase.from('coupons').insert(rows);
    setMsg(error ? error.message : t('saved'));
    setBusy(false);
    if (!error) router.refresh();
  }

  return (
    <div className="adm-form adm-gen">
      <div className="adm-grid">
        <label>
          {t('type')}
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="single_book">{t('fieldBook')}</option>
            <option value="subscription_30d">{t('type30')}</option>
            <option value="subscription_365d">{t('type365')}</option>
          </select>
        </label>
        {type === 'single_book' && (
          <label>
            {t('fieldBook')}
            <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          {t('howMany')}
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </label>
        <label>
          {t('expires')}
          <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
        </label>
      </div>
      <div className="adm-actions">
        <button type="button" className="btn-g adm-btn" onClick={generate} disabled={busy}>
          {t('generate')}
        </button>
        {msg && <span className="adm-msg">{msg}</span>}
      </div>
    </div>
  );
}
