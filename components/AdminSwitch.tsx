'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import {createSupabaseBrowser, supabaseConfigured} from '../lib/supabase/client';

// The way into admin mode, in the bar where you would look for it. Renders
// for nobody but a signed-in admin — is_admin() is asked of the database,
// so the browser bundle never carries a list of who that is.
export default function AdminSwitch() {
  const t = useTranslations('admin');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createSupabaseBrowser();
    const check = async () => {
      const {data: userData} = await supabase.auth.getUser();
      if (!userData.user) return setIsAdmin(false);
      const {data} = await supabase.rpc('is_admin');
      setIsAdmin(data === true);
    };
    void check();
    const {data: sub} = supabase.auth.onAuthStateChange(() => void check());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isAdmin) return null;
  return (
    <Link href="/admin" className="nav-lang-btn nav-admin">
      {t('mode')}
    </Link>
  );
}
