-- M132 — Each admin lands in their own language
--
-- Joey works in Korean, Akira in Japanese. Rather than shipping a map of
-- admin addresses to the browser, the preference lives next to the
-- allowlist and is read back through a security-definer function that only
-- ever answers about the caller.
--
--   * admin_emails.locale  — the console language for that admin
--   * admin_home()         — the caller's locale, or null if not an admin
--
-- Applied via MCP on 2026-09-19. Safe to re-run.

alter table public.admin_emails
  add column if not exists locale text;

update public.admin_emails set locale = 'ko' where email = 'joey.woongse.kim@awesomeai.asia';
update public.admin_emails set locale = 'ja' where email = 'akira.murata@awesomeai.asia';
update public.admin_emails set locale = 'en' where email = 'contact@awesomebooks.asia';

-- Returns the caller's own console language. Non-admins get null, and
-- nobody can read another row: the function selects by the JWT e-mail.
create or replace function public.admin_home()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select locale from public.admin_emails
  where email = coalesce(auth.jwt() ->> 'email', '')
$$;

revoke all on function public.admin_home() from public;
grant execute on function public.admin_home() to authenticated;
