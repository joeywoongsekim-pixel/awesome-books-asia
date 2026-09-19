'use client';

import {useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Link, useRouter} from '../../i18n/navigation';
import {createSupabaseBrowser} from '../../lib/supabase/client';

const MIN = 8;

// Changing your own password, without going near the Supabase dashboard.
// Accounts we hand out (the two admin logins, and anyone who signs up with
// a coupon) start on a password somebody else chose, so the first thing a
// new member should be able to do is replace it.
//
// Supabase's updateUser() does not ask for the old password, so this form
// re-authenticates first: a stolen open tab should not be enough to take
// the account over. The success also stamps user_metadata.password_set,
// which is what stops PasswordNudge asking again.
export default function PasswordForm() {
  const t = useTranslations('account');
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({data}) => setEmail(data.user?.email ?? null));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < MIN) return setError(t('tooShort', {min: MIN}));
    if (next !== confirm) return setError(t('mismatch'));
    if (next === current) return setError(t('sameAsOld'));
    if (!email) return setError(t('signedOut'));

    setPending(true);
    const supabase = createSupabaseBrowser();
    // Prove it is really them before the password moves.
    const {error: reauth} = await supabase.auth.signInWithPassword({
      email,
      password: current
    });
    if (reauth) {
      setPending(false);
      return setError(t('wrongCurrent'));
    }
    const {error: failed} = await supabase.auth.updateUser({
      password: next,
      data: {password_set: true}
    });
    setPending(false);
    if (failed) return setError(failed.message);
    setDone(true);
    setCurrent('');
    setNext('');
    setConfirm('');
    router.refresh();
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{t('title')}</h1>
        <p className="auth-hint">{t('intro', {min: MIN})}</p>

        {done ? (
          <>
            <div className="auth-notice">{t('done')}</div>
            <Link href="/library" className="btn-g auth-submit acc-back">
              {t('back')}
            </Link>
          </>
        ) : (
          <form onSubmit={submit}>
            {/* Browsers want the account this password belongs to. */}
            <input type="email" value={email ?? ''} autoComplete="username" readOnly hidden />
            <label className="auth-label">
              {t('current')}
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <label className="auth-label">
              {t('next')}
              <input
                type="password"
                required
                minLength={MIN}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label className="auth-label">
              {t('confirm')}
              <input
                type="password"
                required
                minLength={MIN}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="btn-g auth-submit" disabled={pending}>
              {t('submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
