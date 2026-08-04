'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import {createSupabaseBrowser} from '../lib/supabase/client';

export default function RedeemForm() {
  const t = useTranslations('redeem');
  const tLib = useTranslations('library');
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'invalid' | 'expired'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState('busy');
    const supabase = createSupabaseBrowser();
    const {data, error} = await supabase.rpc('redeem_coupon', {p_code: code});
    if (error || data === 'invalid' || data === 'auth') setState('invalid');
    else if (data === 'expired') setState('expired');
    else setState('ok');
  }

  if (state === 'ok') {
    return (
      <div>
        <div className="auth-notice">{t('ok')}</div>
        <Link href="/library" className="btn-g auth-submit" style={{display: 'flex'}}>
          {tLib('title')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label className="auth-label">
        {t('code')}
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABA-XXXX-XXXX"
          autoComplete="off"
          required
        />
      </label>
      {state === 'invalid' && <div className="auth-error">{t('invalid')}</div>}
      {state === 'expired' && <div className="auth-error">{t('expired')}</div>}
      <button type="submit" className="btn-g auth-submit" disabled={state === 'busy'}>
        {t('cta')}
      </button>
    </form>
  );
}
