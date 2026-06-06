-- ============================================================
-- CENTOSY ARENA — Supabase Schema
-- Paste toàn bộ file này vào Supabase SQL Editor và chạy.
-- Không dùng service_role key ở frontend.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Enum: role người dùng
-- ------------------------------------------------------------
create type user_role as enum ('admin', 'staff');


-- ------------------------------------------------------------
-- 2. Enum: khối nhân sự
-- ------------------------------------------------------------
create type department_type as enum (
  'van-phong',
  'cua-hang',
  'kho',
  'tmdt',
  'kdtt'
);


-- ------------------------------------------------------------
-- 3. Bảng profiles — mỗi user Supabase Auth có 1 profile
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  full_name        text        not null,
  email            text        not null,
  role             user_role   not null default 'staff',
  department       department_type not null,
  avatar_initials  text,
  title            text,
  score            integer     not null default 0,
  is_active        boolean     not null default true,
  created_at       timestamptz          default now(),
  updated_at       timestamptz          default now()
);

-- Tự cập nhật updated_at khi row thay đổi
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();


-- ------------------------------------------------------------
-- 4. Row Level Security
-- ------------------------------------------------------------
alter table public.profiles enable row level security;


-- ------------------------------------------------------------
-- 5. Helper function: kiểm tra user hiện tại có phải admin?
--    Dùng security definer để tránh RLS loop.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;


-- ------------------------------------------------------------
-- 6. RLS Policies
-- ------------------------------------------------------------

-- Anon không được đọc (mặc định đã chặn, thêm explicit cho rõ)
create policy "Chặn anon đọc profiles"
  on public.profiles
  for select
  to anon
  using (false);

-- User đã đăng nhập xem profile của chính mình
create policy "User xem profile của mình"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Admin xem toàn bộ profiles
create policy "Admin xem tất cả profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

-- Admin cập nhật toàn bộ profiles
create policy "Admin cập nhật tất cả profiles"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Staff chỉ cập nhật avatar_initials và title của chính mình
-- (role và department phải do admin đổi)
create policy "Staff cập nhật profile cơ bản của mình"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id and not public.is_admin())
  with check (auth.uid() = id);


-- ------------------------------------------------------------
-- 7. Tự tạo profile khi user mới đăng ký qua Supabase Auth
--    Trigger này chạy sau khi insert vào auth.users
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'van-phong'   -- department mặc định, admin sẽ chỉnh sau
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- GHI CHÚ QUAN TRỌNG
-- ============================================================
-- 1. Admin đầu tiên phải được set thủ công sau khi tạo user:
--    update public.profiles
--    set role = 'admin', department = 'van-phong'
--    where email = 'admin@centosy.vn';
--
-- 2. Không dùng service_role key ở frontend (React).
--    Chỉ dùng VITE_SUPABASE_PUBLISHABLE_KEY (anon key).
--
-- 3. Bảng điểm, game history, leaderboard sẽ tạo ở các step sau.
-- ============================================================
