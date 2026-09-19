'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import BrandLogo from '../BrandLogo';
import {sendToInbox} from '../../lib/inbox';
import {ADMIN_MAIL} from '../../lib/contact';

// §9.8 — the letter band.
//
// The field used to be decorative: it pushed to the signup page and the
// address went nowhere, which also dropped anyone who wanted the letter
// but had no coupon. It now records into public.inbox, where the console
// reads it and the address can be written to.
export default function Newsletter() {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    const {ok} = await sendToInbox({kind: 'letter', email, locale});
    setState(ok ? 'done' : 'failed');
    if (ok) setEmail('');
  }

  return (
    <section className="nlband">
      <div className="nl-in">
        <BrandLogo size={56} symbolOnly className="nl-logo" />
        <div className="nl-eyebrow">{t('eyebrow')}</div>
        <h2 className="nl-t">{t('title')}</h2>
        <p className="nl-lead">{t('lead')}</p>

        {state === 'done' ? (
          <p className="nl-done">{t('thanks')}</p>
        ) : (
          <>
            <form className="nl-form" onSubmit={submit}>
              <input
                type="email"
                required
                placeholder={t('placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <button type="submit" disabled={state === 'sending'}>
                {t('cta')}
              </button>
            </form>
            {state === 'failed' && (
              <p className="nl-done nl-fail">
                {t.rich('failed', {
                  mail: (chunks) => <a href={`mailto:${ADMIN_MAIL}`}>{chunks}</a>
                })}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
