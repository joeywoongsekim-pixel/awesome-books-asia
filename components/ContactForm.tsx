'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {sendToInbox} from '../lib/inbox';
import {ADMIN_MAIL} from '../lib/contact';

// Writing to us. The address is printed above the form on purpose: some
// people would rather use their own mail client, and if the form ever
// fails they still have somewhere to go.
export default function ContactForm() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'failed'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    const {ok} = await sendToInbox({kind: 'contact', email, name, message, locale});
    setState(ok ? 'done' : 'failed');
    if (ok) {
      setName('');
      setEmail('');
      setMessage('');
    }
  }

  return (
    <div className="ct-card">
      <p className="ct-mail">
        <a href={`mailto:${ADMIN_MAIL}`}>{ADMIN_MAIL}</a>
      </p>

      {state === 'done' ? (
        <div className="auth-notice">{t('thanks')}</div>
      ) : (
        <form onSubmit={submit}>
          <label className="auth-label">
            {t('name')}
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoComplete="name"
            />
          </label>
          <label className="auth-label">
            {t('email')}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            {t('message')}
            <textarea
              required
              rows={6}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>

          {state === 'failed' && (
            <div className="auth-error">
              {t.rich('failed', {
                mail: (chunks) => <a href={`mailto:${ADMIN_MAIL}`}>{chunks}</a>
              })}
            </div>
          )}

          <button type="submit" className="btn-g auth-submit" disabled={state === 'sending'}>
            {t('send')}
          </button>
        </form>
      )}
    </div>
  );
}
