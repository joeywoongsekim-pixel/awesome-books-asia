import {Suspense} from 'react';
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
  // AuthForm reads ?next= (the reader sends people here), which needs a
  // Suspense boundary or the page cannot be prerendered.
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
