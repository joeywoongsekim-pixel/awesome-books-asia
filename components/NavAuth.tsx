'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../i18n/navigation';
import {createSupabaseBrowser, supabaseConfigured} from '../lib/supabase/client';

export default function NavAuth() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  // Without Supabase env the widget renders its signed-out state immediately.
  const [ready, setReady] = useState(() => !supabaseConfigured());

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({data}) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
    const {data: sub} = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (!ready) return null;

  return email ? (
    <>
      <Link href="/library" className="nav-lang-btn nav-auth-link">
        {t('nav.library')}
      </Link>
      <button type="button" className="nav-lang-btn" onClick={signOut}>
        {t('auth.signOut')}
      </button>
    </>
  ) : (
    <Link href="/auth/login" className="nav-lang-btn nav-auth-link">
      {t('auth.loginTitle')}
    </Link>
  );
}
