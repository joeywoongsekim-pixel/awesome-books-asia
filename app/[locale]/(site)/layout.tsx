import {setRequestLocale} from 'next-intl/server';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';

export default async function SiteLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <div className="wrap">{children}</div>
      <Footer />
    </>
  );
}
