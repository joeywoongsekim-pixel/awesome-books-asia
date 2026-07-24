-- M7 — Admin access
-- NOT applied automatically. Review, then run in the Supabase SQL editor
-- (or ask Claude to apply it via MCP).
--
-- Grants admin rights by e-mail allowlist:
--   * admin_emails      — allowlist table, no RLS policies (SQL-only writes)
--   * is_admin()        — security-definer check against the caller's JWT e-mail
--   * policies          — admin write on books/book_editions, admin ALL on
--                         coupons, admin read on purchases/subscriptions,
--                         admin write on the private 'books' storage bucket

create table if not exists public.admin_emails (
  email text primary key,
  added_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;
-- no policies on purpose: the allowlist is managed via SQL only

insert into public.admin_emails (email)
values
  ('joey.woongse.kim@awesomeai.asia'),
  ('akira.murata@awesomeai.asia'),
  ('contact@awesomebooks.asia')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_emails
    where email = coalesce(auth.jwt() ->> 'email', '')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- books: catalogue writes
drop policy if exists "admin insert books" on public.books;
drop policy if exists "admin update books" on public.books;
drop policy if exists "admin delete books" on public.books;
create policy "admin insert books" on public.books
  for insert to authenticated with check (public.is_admin());
create policy "admin update books" on public.books
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete books" on public.books
  for delete to authenticated using (public.is_admin());

-- book_editions: edition writes
drop policy if exists "admin insert editions" on public.book_editions;
drop policy if exists "admin update editions" on public.book_editions;
drop policy if exists "admin delete editions" on public.book_editions;
create policy "admin insert editions" on public.book_editions
  for insert to authenticated with check (public.is_admin());
create policy "admin update editions" on public.book_editions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete editions" on public.book_editions
  for delete to authenticated using (public.is_admin());

-- coupons: full admin management (user redemption arrives with M6)
drop policy if exists "admin select coupons" on public.coupons;
drop policy if exists "admin insert coupons" on public.coupons;
drop policy if exists "admin update coupons" on public.coupons;
drop policy if exists "admin delete coupons" on public.coupons;
create policy "admin select coupons" on public.coupons
  for select to authenticated using (public.is_admin());
create policy "admin insert coupons" on public.coupons
  for insert to authenticated with check (public.is_admin());
create policy "admin update coupons" on public.coupons
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete coupons" on public.coupons
  for delete to authenticated using (public.is_admin());

-- revenue summary: admins may read all sales rows
drop policy if exists "admin select purchases" on public.purchases;
drop policy if exists "admin select subscriptions" on public.subscriptions;
create policy "admin select purchases" on public.purchases
  for select to authenticated using (public.is_admin());
create policy "admin select subscriptions" on public.subscriptions
  for select to authenticated using (public.is_admin());

-- private 'books' bucket: admins upload/replace/remove edition files
drop policy if exists "admin write book files" on storage.objects;
drop policy if exists "admin update book files" on storage.objects;
drop policy if exists "admin delete book files" on storage.objects;
create policy "admin write book files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'books' and public.is_admin());
create policy "admin update book files" on storage.objects
  for update to authenticated
  using (bucket_id = 'books' and public.is_admin())
  with check (bucket_id = 'books' and public.is_admin());
create policy "admin delete book files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'books' and public.is_admin());
