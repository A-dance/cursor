-- 1. user_id カラムを追加（まだ無い場合）
alter table public.todos
  add column if not exists user_id uuid references auth.users (id);

-- 2. RLS を有効化
alter table public.todos enable row level security;

-- 3. 以前の「全員OK」ポリシーを削除（名前は環境により異なります）
drop policy if exists "Allow public read access on todos" on public.todos;
drop policy if exists "Allow public insert access on todos" on public.todos;
drop policy if exists "Allow public update access on todos" on public.todos;
drop policy if exists "Allow public delete access on todos" on public.todos;

-- 4. 本人のみ読み書き可
drop policy if exists "only_owner_can_access" on public.todos;

create policy "only_owner_can_access"
  on public.todos
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
