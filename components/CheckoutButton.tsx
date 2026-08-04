'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from '../i18n/navigation';

type Target =
  | {kind: 'book'; slug: string}
  | {kind: 'sub'; plan: 'monthly' | 'annual'};

// Posts to /api/checkout and follows the Stripe URL. 401 → login;
// 503 (no keys yet) → quiet notice under the button.
export default function CheckoutButton({
  target,
  className,
  children
}: {
  target: Target;
  className: string;
  children: React.ReactNode;
}) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function go() {
    setBusy(true);
    setNotice('');
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...target, locale})
    }).catch(() => null);
    if (res?.status === 401) {
      router.push('/auth/login');
      return;
    }
    const data = res && res.ok ? await res.json().catch(() => null) : null;
    if (data?.url) {
      window.location.href = data.url as string;
      return;
    }
    setNotice(t('unavailable'));
    setBusy(false);
  }

  return (
    <span className="co-wrap">
      <button type="button" className={className} onClick={go} disabled={busy}>
        {children}
      </button>
      {notice && <span className="co-note">{notice}</span>}
    </span>
  );
}
