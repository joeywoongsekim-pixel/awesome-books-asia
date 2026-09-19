import {setRequestLocale, getTranslations} from 'next-intl/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import MagazineStudio from '../../../../components/admin/MagazineStudio';
import type {Post} from '../../../../lib/magazine';

export const dynamic = 'force-dynamic';

// Where the magazine is written. The session client is the right one here:
// RLS lets an admin see drafts as well as what is live, which is the whole
// point of the list below.
export default async function AdminMagazine({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  const supabase = await createSupabaseServer();
  const {data} = await supabase
    .from('posts')
    .select('id, slug, cover, title, dek, body, published, published_at')
    // the same tie-break the site uses, so the console lists them in the
    // order a reader meets them
    .order('published_at', {ascending: false})
    .order('created_at', {ascending: false})
    .limit(200);

  return (
    <>
      <div className="ac-head">
        <h1 className="ac-h1">{t('magazine')}</h1>
      </div>
      <MagazineStudio posts={(data ?? []) as Post[]} />
    </>
  );
}
