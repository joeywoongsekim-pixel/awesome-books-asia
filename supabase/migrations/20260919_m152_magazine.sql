-- M152 — Awesome Magazine: the house's articles
--
-- The home page carried three hand-written editors' notes that lived in
-- the translation files, so publishing a note meant a deploy. Articles
-- belong in the database, written in the console.
--
-- Title, standfirst and body are jsonb keyed by locale — the same shape
-- as lib/blurbs.ts, and for the same reason: an article is written in one
-- language and gains the others later, so a page asks for its locale and
-- falls back to English rather than showing an empty column.
--
-- The body is HTML, authored by an admin. Only an admin can write here
-- (RLS below), and lib/magazine.ts strips scripts and handlers on the way
-- out, so a stored article cannot run anything in a reader's browser.
--
-- Applied via MCP on 2026-09-19.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 80),
  -- a path under /public or an absolute URL; the bands and the list read it
  cover text check (char_length(cover) <= 400),
  title jsonb not null default '{}'::jsonb,
  dek jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- the one query the public makes: published, newest first
create index if not exists posts_live_idx
  on public.posts (published, published_at desc);

alter table public.posts enable row level security;

drop policy if exists "anyone may read published articles" on public.posts;
create policy "anyone may read published articles" on public.posts
  for select to anon, authenticated using (published);

drop policy if exists "admins read every article" on public.posts;
create policy "admins read every article" on public.posts
  for select to authenticated using (public.is_admin());

drop policy if exists "admins write articles" on public.posts;
create policy "admins write articles" on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- keep updated_at honest without the console having to remember
create or replace function public.posts_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.posts_touch();
