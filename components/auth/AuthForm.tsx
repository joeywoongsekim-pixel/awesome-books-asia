'use client';

import {useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import {INVITE_KEY} from '../../lib/invite';
import {ADMIN_MAIL} from '../../lib/contact';
import {adminHome} from '../../lib/admin';

// Where to go once a session exists. The reader sends people here with
// ?next=/read/<slug>; anything that is not a local path falls back to the
// library, so the parameter can never bounce someone off the site.
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/library';
  return raw;
}

// Google is not enabled on the Supabase project, so the button can only end
// in "Unsupported provider". Now that the reader sends everyone through this
// page, that dead end costs us accounts — so the button appears only once
// NEXT_PUBLIC_GOOGLE_AUTH=1 says the provider is actually configured.
const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_AUTH === '1';

// Launch phase is invitation-only: signing up (e-mail or Google) requires a
// valid coupon code. The code is checked anonymously via check_invite(), then
// parked in localStorage; NavAuth redeems it on the first signed-in session,
// which grants the invite's subscription/purchase.
export default function AuthForm({mode}: {mode: 'login' | 'signup'}) {
  const t = useTranslations('auth');
  const tRedeem = useTranslations('redeem');
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));
  // Set only when something sent them here — the reader, not a nav click.
  const gated = next !== '/library';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invite, setInvite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Validates the invite code and parks it for post-auth redemption.
  async function inviteOk(): Promise<boolean> {
    const supabase = createSupabaseBrowser();
    const {data, error} = await supabase.rpc('check_invite', {p_code: invite});
    if (error || data !== true) {
      setError(tRedeem('invalid'));
      return false;
    }
    try {
      localStorage.setItem(INVITE_KEY, invite.toUpperCase().trim());
    } catch {
      /* private mode — /redeem remains as fallback */
    }
    return true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createSupabaseBrowser();
    if (mode === 'signup') {
      if (!(await inviteOk())) {
        setPending(false);
        return;
      }
      const {error} = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/api/auth/callback?next=/${locale}${next}`
        }
      });
      if (error) setError(error.message);
      else setNotice(t('checkEmail'));
    } else {
      const {error} = await supabase.auth.signInWithPassword({email, password});
      if (error) setError(error.message);
      else {
        // An admin lands in the console, in the language they work in —
        // unless the reader sent them here for a particular book, which
        // still wins; only the language carries over then.
        const home = await adminHome(supabase);
        if (home) router.push(gated ? next : '/admin', {locale: home});
        else router.push(next);
        router.refresh();
      }
    }
    setPending(false);
  }

  async function google() {
    setError(null);
    if (mode === 'signup' && !(await inviteOk())) return;
    const supabase = createSupabaseBrowser();
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {redirectTo: `${location.origin}/api/auth/callback?next=/${locale}${next}`}
    });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{mode === 'login' ? t('loginTitle') : t('signupTitle')}</h1>

        {gated && <p className="auth-gate">{t('membersOnly')}</p>}

        {mode === 'signup' && (
          <>
            <p className="auth-hint">
              {t.rich('inviteHint', {
                mail: (chunks) => <a href={`mailto:${ADMIN_MAIL}`}>{chunks}</a>
              })}
            </p>
            <label className="auth-label">
              {t('invite')}
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value.toUpperCase())}
                placeholder="ABA-XXXX-XXXX"
                autoComplete="off"
                required
              />
            </label>
          </>
        )}

        {GOOGLE && (
          <>
            <button
              type="button"
              className="btn-o auth-google"
              onClick={google}
              disabled={mode === 'signup' && !invite}
            >
              {t('google')}
            </button>
            <div className="auth-or">{t('or')}</div>
          </>
        )}

        <form onSubmit={submit}>
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
            {t('password')}
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <div className="auth-error">{error}</div>}
          {notice && <div className="auth-notice">{notice}</div>}

          <button type="submit" className="btn-g auth-submit" disabled={pending}>
            {mode === 'login' ? t('loginBtn') : t('signupBtn')}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>
              {t('noAccount')}{' '}
              {/* carry the destination across, or the reader is forgotten */}
              <Link href={{pathname: '/auth/signup', query: gated ? {next} : {}}}>
                {t('signupTitle')}
              </Link>
            </>
          ) : (
            <>
              {t('haveAccount')}{' '}
              <Link href={{pathname: '/auth/login', query: gated ? {next} : {}}}>
                {t('loginTitle')}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
