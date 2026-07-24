import {setRequestLocale, getTranslations} from 'next-intl/server';
import {redirect} from '../../../../i18n/navigation';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {isAdmin} from '../../../../lib/admin';
import AdminTabs from '../../../../components/admin/AdminTabs';

// Every admin route is auth-gated and therefore dynamic.
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
  if (!user) redirect({href: '/auth/login', locale});

  if (!(await isAdmin(supabase))) {
    return (
      <div className="adm">
        <div className="adm-denied">{t('notAdmin')}</div>
      </div>
    );
  }

  return (
    <div className="adm">
      <div className="adm-head">
        <h1 className="adm-title">{t('title')}</h1>
        <AdminTabs />
      </div>
      {children}
    </div>
  );
}
