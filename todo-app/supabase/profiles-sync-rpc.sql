-- Stripe 連携: ログインユーザー自身の profiles を安全に更新（RLS 不要）
-- SQL Editor で実行（profiles.sql 実行済みであること）

create or replace function public.update_my_stripe_profile(
  p_customer_id text,
  p_is_paid boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.profiles (id, stripe_customer_id, is_paid)
  values (auth.uid(), p_customer_id, p_is_paid)
  on conflict (id) do update
  set
    stripe_customer_id = excluded.stripe_customer_id,
    is_paid = excluded.is_paid;
end;
$$;

revoke all on function public.update_my_stripe_profile(text, boolean) from public;
grant execute on function public.update_my_stripe_profile(text, boolean) to authenticated;
