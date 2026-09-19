-- M162 — newest first, decided the same way every time
--
-- The magazine orders by published_at, which is a date the writer chooses.
-- Two articles put up on the same day carried the identical stamp — the
-- console wrote every one at 09:00 — so Postgres was free to return them
-- either way round, and differently on each request. A second piece
-- published in the afternoon could appear underneath the morning's.
--
-- The queries now break the tie on created_at, and the index follows them,
-- or the tie-break would cost a sort on every page.
--
-- Applied via MCP on 2026-09-19.

drop index if exists public.posts_live_idx;
create index if not exists posts_live_idx
  on public.posts (published, published_at desc, created_at desc);
