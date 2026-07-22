import {setRequestLocale} from 'next-intl/server';
import AuthForm from '../../../../../components/auth/AuthForm';

export default async function Page({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  // Mandatory in every page.tsx, not just the layout.
  setRequestLocale(locale);
  return <AuthForm mode="login" />;
}
