'use client';

import {useEffect, useState} from 'react';
import {usePathname as useRawPathname} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {Link, usePathname} from '../i18n/navigation';
import {createSupabaseBrowser, supabaseConfigured} from '../lib/supabase/client';

// Every account here starts on a password somebody else chose — the two
// admin logins were set by hand, and coupon sign-ups are handed out at
// events. Until PasswordForm stamps user_metadata.password_set, this asks
// once per page, quietly, at the top of the site.
export default function PasswordNudge() {
  const t = useTranslations('account');
  const pathname = usePathname();
  const raw = useRawPathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createSupabaseBrowser();
    const read = (user: {user_metadata?: Record<string, unknown>} | null) =>
      setShow(Boolean(user) && user?.user_metadata?.password_set !== true);
    supabase.auth.getUser().then(({data}) => read(data.user));
    const {data: sub} = supabase.auth.onAuthStateChange((_e, session) =>
      read(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, [raw]);

  // Pointless on the page that fixes it, and in the way on the auth forms.
  const quiet = /^\/(auth|account)(\/|$)/.test(pathname);
  if (!show || quiet) return null;

  return (
    <div className="pw-nudge">
      <span>{t('nudge')}</span>
      <Link href="/account/password">{t('nudgeCta')}</Link>
    </div>
  );
}
