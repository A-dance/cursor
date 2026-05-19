-- ユーザーの有料フラグ
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
