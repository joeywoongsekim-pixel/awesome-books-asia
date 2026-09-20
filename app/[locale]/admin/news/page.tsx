import {setRequestLocale, getTranslations} from 'next-intl/server';
import {createSupabaseServer} from '../../../../lib/supabase/server';
import PostStudio from '../../../../components/admin/PostStudio';
import {COLUMNS, type Post} from '../../../../lib/posts';

export const dynamic = 'force-dynamic';

// Where the news is written. The session client is the right one here:
// RLS lets an admin see drafts as well as what is live, which is the whole
// point of the list below. The two sections share one studio and one
// table, so this page is the studio pointed at one of them.
export default async function AdminNews({
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
    .select(COLUMNS)
    .eq('kind', 'news')
    // the same tie-break the site uses, so the console lists them in the
    // order a reader meets them
    .order('published_at', {ascending: false})
    .order('created_at', {ascending: false})
    .limit(200);

  return (
    <>
      <div className="ac-head">
        <h1 className="ac-h1">{t('news')}</h1>
      </div>
      <PostStudio kind="news" posts={(data ?? []) as Post[]} />
    </>
  );
}
