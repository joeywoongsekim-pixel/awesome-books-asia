'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import BrandLogo from '../BrandLogo';
import {createSupabaseBrowser, supabaseConfigured} from '../../lib/supabase/client';

// The console's own bar. Deliberately not the site nav: an admin should be
// able to tell at a glance which mode they are in, and nothing here sells
// books. It carries the way back out to the site and the way out of the
// account, and names who is signed in — these two share a laptop.
export default function AdminBar() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({data}) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="ac-bar">
      <Link href="/admin" className="ac-brand" aria-label={t('title')}>
        <BrandLogo size={26} />
        <span className="ac-mode">{t('mode')}</span>
      </Link>

      <div className="ac-who">
        {email && <span className="ac-mail">{email}</span>}
        <Link href="/" className="ac-out">
          {t('exitMode')}
        </Link>
        <button type="button" className="ac-out" onClick={signOut}>
          {t('signOut')}
        </button>
      </div>
    </header>
  );
}
