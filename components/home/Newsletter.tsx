'use client';

import {useState} from 'react';
import Image from 'next/image';
import {useTranslations} from 'next-intl';
import {useRouter} from '../../i18n/navigation';

// §9.8 — deep-navy band: seal logo with gold ring, serif title, transparent
// input with gold border. Submitting hands off to the signup page.
export default function Newsletter() {
  const t = useTranslations('newsletter');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');

  return (
    <section className="nlband">
      <div className="nl-in">
        <Image src="/logo.jpg" alt="" width={64} height={64} className="nl-logo" />
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
