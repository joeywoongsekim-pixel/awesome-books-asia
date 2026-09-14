'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link} from '../i18n/navigation';
import {createSupabaseBrowser, supabaseConfigured} from '../lib/supabase/client';

// Footer entry to the admin studio — rendered only for signed-in admins
// (is_admin RPC), so the public footer stays unchanged for everyone else.
export default function AdminLink() {
  const t = useTranslations('footer');
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
    <li>
      <Link href="/admin" className="f-admin">
        {t('accountLinks.admin')}
      </Link>
    </li>
  );
}
