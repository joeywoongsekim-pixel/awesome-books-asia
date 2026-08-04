-- M6 — atomic coupon redemption
-- NOT applied automatically. Review, then run in the Supabase SQL editor
-- (or ask Claude to apply it via MCP).
--
-- redeem_coupon(code): single-use, race-safe redemption. The UPDATE claims
-- the row only while is_used is still false, so two concurrent calls can
-- never both succeed. On success the coupon grants either a purchase row
-- (single_book) or an active subscription window (30d / 365d).

create or replace function public.redeem_coupon(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.coupons%rowtype;
  uid uuid := auth.uid();
begin
  if uid is null then
    return 'auth';
  end if;

  update public.coupons
     set is_used = true, used_by = uid, used_at = now()
   where code = upper(trim(p_code))
     and is_used = false
     and (expires_at is null or expires_at > now())
  returning * into c;

  if c.id is null then
    if exists (
      select 1 from public.coupons
      where code = upper(trim(p_code))
        and is_used = false
        and expires_at is not null
        and expires_at <= now()
    ) then
      return 'expired';
    end if;
    return 'invalid';
  end if;

  if c.type = 'single_book' and c.book_id is not null then
    insert into public.purchases (user_id, book_id) values (uid, c.book_id);
  elsif c.type = 'subscription_30d' then
    insert into public.subscriptions (user_id, status, current_period_end)
    values (uid, 'active', now() + interval '30 days');
  elsif c.type = 'subscription_365d' then
    insert into public.subscriptions (user_id, status, current_period_end)
    values (uid, 'active', now() + interval '365 days');
  end if;

  return 'ok';
end;
$$;

revoke all on function public.redeem_coupon(text) from public;
grant execute on function public.redeem_coupon(text) to authenticated;
