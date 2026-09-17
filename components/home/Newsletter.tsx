'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';
import BrandLogo from '../BrandLogo';

// §9.8 — a 라피스 band carrying the symbol, the title and one field.
// Submitting hands off to the signup page.
export default function Newsletter() {
  const t = useTranslations('newsletter');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <section className="nlband">
      <div className="nl-in">
        <BrandLogo size={56} symbolOnly className="nl-logo" />
        <div className="nl-eyebrow">{t('eyebrow')}</div>
        <h2 className="nl-t">{t('title')}</h2>
        <p className="nl-lead">{t('lead')}</p>
        <form
          className="nl-form"
          onSubmit={(e) => {
            e.preventDefault();
            router.push('/auth/signup');
          }}
        >
          <input
            type="email"
            required
            placeholder={t('placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">{tAuth('signupTitle')}</button>
        </form>
      </div>
    </section>
  );
}
