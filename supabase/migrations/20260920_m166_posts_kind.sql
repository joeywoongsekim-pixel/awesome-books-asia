-- M166 — Awesome News alongside Awesome Magazine
--
-- The house now publishes two things: the magazine, which is editorial and
-- written at length, and news, which is short and dated — a book out, a
-- fair, a price. They are the same object in every way that matters: a
-- slug, a cover, a title, a standfirst and a body, each keyed by locale,
-- written by an admin and translated into the other eight.
--
-- So they share this table rather than getting one of their own. A second
-- table would have meant a second studio, a second translator route and a
-- second set of policies, all of which would then drift apart; what
-- separates them is which section they belong to, which is one column.
--
-- Everything written before this is magazine, which is what the default
-- says, so no row needs touching.
--
-- Applied via MCP on 2026-09-20.

alter table public.posts
  add column if not exists kind text not null default 'magazine';

alter table public.posts drop constraint if exists posts_kind_check;
alter table public.posts add constraint posts_kind_check
  check (kind in ('magazine', 'news'));

-- Every public query now filters on kind first: the magazine list, the
-- news list and both home bands. Leading the index with it keeps them one
-- range scan rather than a scan and a filter.
drop index if exists public.posts_live_idx;
create index if not exists posts_live_idx
  on public.posts (kind, published, published_at desc, created_at desc);
