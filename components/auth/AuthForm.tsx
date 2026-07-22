'use client';

import {useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';

export default function AuthForm({mode}: {mode: 'login' | 'signup'}) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = createSupabaseBrowser();
    if (mode === 'signup') {
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

        <button type="button" className="btn-o auth-google" onClick={google}>
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
