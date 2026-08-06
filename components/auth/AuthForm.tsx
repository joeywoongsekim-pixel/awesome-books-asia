'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';
import {INVITE_KEY} from '../../lib/invite';

// Launch phase is invitation-only: signing up (e-mail or Google) requires a
// valid coupon code. The code is checked anonymously via check_invite(), then
// parked in localStorage; NavAuth redeems it on the first signed-in session,
// which grants the invite's subscription/purchase.
export default function AuthForm({mode}: {mode: 'login' | 'signup'}) {
  const t = useTranslations('auth');
  const tRedeem = useTranslations('redeem');
  const locale = useLocale();
  const router = useRouter();
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
        options: {emailRedirectTo: `${location.origin}/api/auth/callback?next=/${locale}/library`}
      });
      if (error) setError(error.message);
      else setNotice(t('checkEmail'));
    } else {
      const {error} = await supabase.auth.signInWithPassword({email, password});
      if (error) setError(error.message);
      else {
        router.push('/library');
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
      options: {redirectTo: `${location.origin}/api/auth/callback?next=/${locale}/library`}
    });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{mode === 'login' ? t('loginTitle') : t('signupTitle')}</h1>

        {mode === 'signup' && (
          <>
            <p className="auth-hint">{t('inviteHint')}</p>
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

        <button
          type="button"
          className="btn-o auth-google"
          onClick={google}
          disabled={mode === 'signup' && !invite}
        >
          {t('google')}
        </button>
        <div className="auth-or">{t('or')}</div>

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
              {t('noAccount')} <Link href="/auth/signup">{t('signupTitle')}</Link>
            </>
          ) : (
            <>
              {t('haveAccount')} <Link href="/auth/login">{t('loginTitle')}</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
