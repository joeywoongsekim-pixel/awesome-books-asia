import type {Metadata} from 'next';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {redirect} from '../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import RedeemForm from '../../../../components/RedeemForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>;
}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'footer.accountLinks'});
  return {title: `${t('redeem')} — Awesome Books Asia`};
}

export default async function RedeemPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('footer.accountLinks');

  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) redirect({href: '/auth/login', locale});

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="auth-title">{t('redeem')}</h1>
        <RedeemForm />
      </div>
    </div>
  );
}
