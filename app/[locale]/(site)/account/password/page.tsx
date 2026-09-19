import {setRequestLocale} from 'next-intl/server';
import {redirect} from '../../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../../lib/supabase/server';
import PasswordForm from '../../../../../components/auth/PasswordForm';

// Auth-gated, so never prerendered.
export const dynamic = 'force-dynamic';

const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function Page({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);

  const toLogin = () =>
    redirect({href: {pathname: '/auth/login', query: {next: '/account/password'}}, locale});
  if (!hasSupabaseEnv()) return toLogin();

  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) return toLogin();

  return <PasswordForm />;
}
