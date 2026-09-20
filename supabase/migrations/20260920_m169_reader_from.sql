-- M169 — holding the ebook back from our own reader until a date
--
-- A title published through KDP Select / Kindle Unlimited may not be
-- distributed digitally anywhere else for 90 days, and this site's reader
-- is somewhere else. The book's page, its cover, its blurb and its
-- retailer links are not distribution and stay up from day one; what has
-- to wait is reading it here.
--
-- So each book carries the moment its ebook may be opened in our reader.
-- Null means no restriction, which is every book that never went into
-- KDP Select.
--
-- The gate goes inside get_book_content rather than in the page. That
-- function is SECURITY DEFINER and is the only public way to reach a
-- chapter — book_content itself is admin-only for select — so a check
-- here cannot be called around by anyone holding the anon key. A check in
-- the page could be.
--
-- Applied via MCP on 2026-09-20.

alter table public.books
  add column if not exists reader_from timestamptz;

comment on column public.books.reader_from is
  'The ebook may not be read on this site before this moment (KDP Select / Kindle Unlimited exclusivity). Null means no restriction.';

create or replace function public.get_book_content(p_slug text, p_locale text)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
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

  -- Before anything is read, and before entitlement is even looked at:
  -- an exclusivity window is not a paywall, and being signed in, having
  -- bought the book or holding a subscription does not open it early.
  -- The date comes back so the page can say when, rather than 404.
  if b.reader_from is not null and b.reader_from > now() then
    return jsonb_build_object('locked', true, 'reader_from', b.reader_from);
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
$function$;
