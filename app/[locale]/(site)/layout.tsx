import {setRequestLocale} from 'next-intl/server';
import Nav from '../../../components/Nav';
import Footer from '../../../components/Footer';
import PromoPopup from '../../../components/PromoPopup';
import PasswordNudge from '../../../components/PasswordNudge';

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
      {/* Asks once, for anyone still on a password we handed them. */}
      <PasswordNudge />
      <div className="wrap">{children}</div>
      <Footer />
      {/* Site-wide, not just the homepage: the announcement is the reason
          someone might arrive on a book page from a link. It shows once
          and remembers being dismissed. */}
      <PromoPopup />
    </>
  );
}
