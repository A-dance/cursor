-- ① テーブル作成（必ず最初に実行）
-- ② RPC（Stripe 連携の保存用）
-- Supabase SQL Editor にこのファイル全体を貼って Run

-- ========== 1. profiles テーブル ==========
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_paid boolean not null default false,
  stripe_customer_id text
);

alter table public.profiles enable row level security;

drop policy if exists "users_read_own_profile" on public.profiles;
create policy "users_read_own_profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users_update_own_profile" on public.profiles;
create policy "users_update_own_profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 新規登録時に profiles 行を自動作成
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 既存ユーザーの profiles 行を作成
insert into public.profiles (id, is_paid)
select id, false from auth.users
on conflict (id) do nothing;

-- ========== 2. Stripe 保存用 RPC ==========
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
