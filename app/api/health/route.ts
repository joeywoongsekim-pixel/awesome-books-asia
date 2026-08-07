import {NextResponse} from 'next/server';
import {createSupabaseServer} from '../../../lib/supabase/server';

// Ops diagnostic: confirms the server runtime can see the Supabase env and
// reach the database. Exposes no data beyond a public-catalogue row count.
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const report: Record<string, unknown> = {
    env: {url: Boolean(url), key: Boolean(key), urlHost: url ? new URL(url).host : null}
  };
  if (url && key) {
    try {
      const supabase = await createSupabaseServer();
      const {count, error} = await supabase
        .from('books')
        .select('id', {count: 'exact', head: true});
      report.db = error ? {ok: false, error: error.message} : {ok: true, books: count};
    } catch (e) {
      report.db = {ok: false, thrown: e instanceof Error ? e.message : String(e)};
    }
  }
  return NextResponse.json(report);
}
