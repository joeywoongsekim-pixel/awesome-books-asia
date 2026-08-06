-- M8 — publishing pipeline: processed book content + publish flag
-- NOT applied automatically. Review, then ask Claude to apply (or run in the
-- Supabase SQL editor).

-- Storefront visibility switch (processed books go live only when published).
alter table public.books
  add column if not exists published boolean not null default false;

-- Processed reader content per edition. `chapters` holds sanitised XHTML
-- sections extracted from the EPUB; `sample` is the free preview subset;
-- `kind` is 'epub' (reflowable chapters) or 'pdf' (page-based, served via
-- signed URL). No SELECT policy on purpose — readers get content through
-- get_book_content(), which enforces sampling.
create table if not exists public.book_content (
  book_id uuid not null references public.books(id) on delete cascade,
  locale text not null check (locale in ('en', 'ko', 'ja')),
  kind text not null default 'epub' check (kind in ('epub', 'pdf')),
  toc jsonb,
  chapters jsonb not null default '[]'::jsonb,
  sample jsonb not null default '[]'::jsonb,
  page_count integer,
  processed_at timestamptz not null default now(),
  primary key (book_id, locale)
);
alter table public.book_content enable row level security;

drop policy if exists "admin select content" on public.book_content;
drop policy if exists "admin insert content" on public.book_content;
drop policy if exists "admin update content" on public.book_content;
drop policy if exists "admin delete content" on public.book_content;
create policy "admin select content" on public.book_content
  for select to authenticated using (public.is_admin());
create policy "admin insert content" on public.book_content
  for insert to authenticated with check (public.is_admin());
create policy "admin update content" on public.book_content
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete content" on public.book_content
  for delete to authenticated using (public.is_admin());

-- Admins must be able to download uploaded source files for processing.
drop policy if exists "admin read book files" on storage.objects;
create policy "admin read book files" on storage.objects
  for select to authenticated
  using (bucket_id = 'books' and public.is_admin());

-- Public covers bucket (storefront images extracted from EPUBs).
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "admin write covers" on storage.objects;
drop policy if exists "admin update covers" on storage.objects;
drop policy if exists "admin delete covers" on storage.objects;
create policy "admin write covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers' and public.is_admin());
create policy "admin update covers" on storage.objects
  for update to authenticated
  using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());
create policy "admin delete covers" on storage.objects
  for delete to authenticated using (bucket_id = 'covers' and public.is_admin());

-- Reader content endpoint: full chapters for entitled readers, the sample
-- for everyone else. Sampling is enforced here, in one place.
create or replace function public.get_book_content(p_slug text, p_locale text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  b public.books%rowtype;
  c public.book_content%rowtype;
  uid uuid := auth.uid();
  entitled boolean := false;
begin
  select * into b from public.books where slug = p_slug;
  if b.id is null then
    return null;
  end if;

  select * into c from public.book_content
   where book_id = b.id and locale = p_locale;
  if c.book_id is null then
    select * into c from public.book_content
     where book_id = b.id and locale = 'en';
  end if;
  if c.book_id is null then
    return null;
  end if;

  if uid is not null then
    entitled := exists (
      select 1 from public.purchases where user_id = uid and book_id = b.id
    ) or exists (
      select 1 from public.subscriptions
      where user_id = uid and status = 'active' and current_period_end > now()
    );
  end if;

  return jsonb_build_object(
    'kind', c.kind,
    'full', entitled,
    'toc', c.toc,
    'page_count', c.page_count,
    'chapters', case when entitled then c.chapters else c.sample end
  );
end;
$$;

revoke all on function public.get_book_content(text, text) from public;
grant execute on function public.get_book_content(text, text) to anon, authenticated;
