-- ═══════════════════════════════════════════════════════════════
-- GAME VISIBILITY CONFIG
-- Chạy 1 lần trong Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Tạo bảng app_config (key-value store cho cấu hình toàn app)
create table if not exists public.app_config (
  key        text        primary key,
  value      jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid        references auth.users(id)
);

-- RLS
alter table public.app_config enable row level security;

-- Tất cả user đã đăng nhập có thể đọc
create policy "app_config_select_authenticated"
  on public.app_config for select
  to authenticated
  using (true);

-- Chỉ admin mới được ghi
create policy "app_config_write_admin"
  on public.app_config for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Mặc định: tất cả game đều ẨN cho người dùng
-- Admin vào Game Center để bật từng game
insert into public.app_config (key, value) values (
  'game_visibility',
  '{
    "g01": false,
    "g02": false,
    "g03": false,
    "g04": false,
    "g05": false,
    "g06": false,
    "g07": false,
    "g08": false
  }'::jsonb
) on conflict (key) do nothing;
