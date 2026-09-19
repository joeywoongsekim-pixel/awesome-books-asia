'use client';

import {useEffect, useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, usePathname, useRouter} from '../i18n/navigation';
import {createSupabaseBrowser, supabaseConfigured} from '../lib/supabase/client';
import {redeemParkedInvite} from '../lib/invite';

// Signed in, the bar used to carry three separate chips — library, password,
// sign out — next to the language and the admin switch. Five things to read
// before finding the one you wanted. They now live behind one account menu,
// which leaves the admin switch standing on its own.
//
// `flat` is for the phone sheet, where a dropdown inside a dropdown helps
// nobody: there the same items render as a plain row.
export default function NavAuth({flat = false}: {flat?: boolean}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Without Supabase env the widget renders its signed-out state immediately.
  const [ready, setReady] = useState(() => !supabaseConfigured());

  useEffect(() => {
    if (!supabaseConfigured()) return;
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({data}) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
      if (data.user) void redeemParkedInvite(supabase);
    });
    const {data: sub} = supabase.auth.onAuthStateChange((event, session) => {
      setEmail(session?.user?.email ?? null);
      if (event === 'SIGNED_IN' && session?.user) void redeemParkedInvite(supabase);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  async function signOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  if (!ready) return null;

  if (!email) {
    return (
      <Link href="/auth/login" className="nav-lang-btn nav-auth-link">
        {t('auth.loginTitle')}
      </Link>
    );
  }

  const items = (
    <>
      <Link href="/library" className="nav-auth-link">
        {t('nav.library')}
      </Link>
      <Link href="/account/password" className="nav-auth-link">
        {t('account.link')}
      </Link>
      <button type="button" onClick={signOut}>
        {t('auth.signOut')}
      </button>
    </>
  );

  if (flat) {
    return (
      <>
        <Link href="/library" className="nav-lang-btn nav-auth-link">
          {t('nav.library')}
        </Link>
        <Link href="/account/password" className="nav-lang-btn nav-auth-link">
          {t('account.link')}
        </Link>
        <button type="button" className="nav-lang-btn" onClick={signOut}>
          {t('auth.signOut')}
        </button>
      </>
    );
  }

  return (
    <div className="nav-acct" ref={ref}>
      <button
        type="button"
        className="nav-lang-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nav-acct-who">{email.split('@')[0]}</span> ▾
      </button>
      {open && (
        <div className="nav-lang-menu nav-acct-menu" role="menu">
          <div className="nav-acct-mail">{email}</div>
          {items}
        </div>
      )}
    </div>
  );
}
