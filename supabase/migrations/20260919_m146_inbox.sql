-- M146 — The inbox: letter sign-ups and contact messages
--
-- Until now the newsletter field threw the address away — it pushed to the
-- signup page and nothing was recorded. Everything typed into the band or
-- the contact form now lands here.
--
-- Not public.newsletter_subscribers: that table belongs to another app on
-- this shared project and has no room for a message, a locale or a source.
--
-- Anyone may write (that is the point of a contact form); only admins may
-- read. The length limits are the whole spam defence for now — a public
-- insert endpoint with no ceiling is an invitation.
--
-- Applied via MCP on 2026-09-19.

create table if not exists public.inbox (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('letter', 'contact')),
  email text not null check (char_length(email) between 3 and 254 and email like '%_@_%'),
  name text check (char_length(name) <= 120),
  message text check (char_length(message) <= 4000),
  locale text check (char_length(locale) <= 8),
  created_at timestamptz not null default now(),
  handled boolean not null default false
);

create index if not exists inbox_created_idx on public.inbox (created_at desc);

alter table public.inbox enable row level security;

-- write-only for the public: a visitor can leave a message and nothing else
drop policy if exists "anyone may write to the inbox" on public.inbox;
create policy "anyone may write to the inbox" on public.inbox
  for insert to anon, authenticated with check (true);

drop policy if exists "admins read the inbox" on public.inbox;
create policy "admins read the inbox" on public.inbox
  for select to authenticated using (public.is_admin());

drop policy if exists "admins mark the inbox" on public.inbox;
create policy "admins mark the inbox" on public.inbox
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
