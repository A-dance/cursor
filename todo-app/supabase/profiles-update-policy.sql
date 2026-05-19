-- profiles を自分で更新できるようにする（Stripe 連携用）
-- SQL Editor で profiles.sql のあとに実行

drop policy if exists "users_update_own_profile" on public.profiles;

create policy "users_update_own_profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
