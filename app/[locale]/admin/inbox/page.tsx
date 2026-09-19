import {setRequestLocale, getTranslations} from 'next-intl/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import {ADMIN_MAIL} from '../../../../lib/contact';

export const dynamic = 'force-dynamic';

type Row = {
  id: string;
  kind: 'letter' | 'contact';
  email: string;
  name: string | null;
  message: string | null;
  locale: string | null;
  created_at: string;
};

// Everything left on the letter band and the contact form. RLS only lets
// an admin read this table, so the query needs no filter of its own.
export default async function AdminInbox({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const {data} = await supabase
    .from('inbox')
    .select('id, kind, email, name, message, locale, created_at')
    .order('created_at', {ascending: false})
    .limit(200);
  const rows = (data ?? []) as Row[];
  const letters = rows.filter((r) => r.kind === 'letter');

  return (
    <>
      <div className="ac-head">
        <h1 className="ac-h1">{t('inbox')}</h1>
        <div className="ac-acts">
          {/* Every address in one click, for pasting into a mail client. */}
          {letters.length > 0 && (
            <a
              className="ac-btn"
              href={`mailto:${ADMIN_MAIL}?bcc=${encodeURIComponent(
                letters.map((r) => r.email).join(',')
              )}&subject=${encodeURIComponent('Awesome Books Asia')}`}
            >
              {t('mailAll', {n: letters.length})}
            </a>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="ac-empty">{t('nothingYet')}</p>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th>{t('when')}</th>
              <th>{t('type')}</th>
              <th>{t('fieldAuthor')}</th>
              <th>{t('email')}</th>
              <th>{t('messageCol')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="adm-mono">{r.created_at.slice(0, 10)}</td>
                <td>{r.kind === 'letter' ? t('kindLetter') : t('kindContact')}</td>
                <td>{r.name ?? '—'}</td>
                <td className="adm-mono">
                  <a className="adm-link" href={`mailto:${r.email}`}>
                    {r.email}
                  </a>
                  {r.locale && <span className="ac-list-m"> · {r.locale}</span>}
                </td>
                <td className="ac-msg">{r.message ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
