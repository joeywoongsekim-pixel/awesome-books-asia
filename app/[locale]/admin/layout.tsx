import {setRequestLocale, getTranslations} from 'next-intl/server';
import {redirect} from '../../../i18n/navigation';
import {createSupabaseServer} from '../../../lib/supabase/server';
import {isAdmin} from '../../../lib/admin';
import AdminBar from '../../../components/admin/AdminBar';
import AdminNav from '../../../components/admin/AdminNav';
import PasswordNudge from '../../../components/PasswordNudge';

// The console owns its chrome — no shop nav, no marketing footer, no launch
// popup. It lives outside the (site) route group for the same reason the
// reader does: being in admin mode should look nothing like browsing.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) redirect({href: {pathname: '/auth/login', query: {next: '/admin'}}, locale});

  // Signed in but not one of us: say so inside the console chrome rather
  // than pretending the page is not there.
  if (!(await isAdmin(supabase))) {
    return (
      <div className="ac">
        <AdminBar />
        <div className="adm-denied">{t('notAdmin')}</div>
      </div>
    );
  }

  return (
    <div className="ac">
      <AdminBar />
      {/* Still worth asking here: these accounts were handed a password. */}
      <PasswordNudge />
      <div className="ac-body">
        <AdminNav />
        <main className="ac-main">{children}</main>
      </div>
    </div>
  );
}
