-- ============================================================
-- CENTOSY ARENA — STEP 43: User Status Management
-- Chuẩn hóa account_status: thêm 'inactive' và 'resigned'
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- Đảm bảo cột account_status có đủ các giá trị hợp lệ
-- (Nếu đã có constraint CHECK, cần drop trước rồi add lại)

-- Bước 1: Thêm cột resigned_at để ghi nhận thời điểm nghỉ việc
alter table public.profiles
  add column if not exists resigned_at timestamptz;

-- Bước 2: Thêm cột status_note để ghi ghi chú khi đổi trạng thái
alter table public.profiles
  add column if not exists status_note text;

-- Bước 3: Đảm bảo account_status chấp nhận các giá trị mới
-- (Supabase dùng text, không dùng enum cho account_status nên không cần ALTER TYPE)
-- Chỉ cần đảm bảo app hiểu các giá trị: pending, approved, rejected, inactive, resigned

-- Bước 4: Index để admin filter nhanh theo status
create index if not exists profiles_account_status_idx on public.profiles(account_status);

-- Bước 5: Function admin_set_user_status — cho phép admin đổi status bất kỳ
create or replace function public.admin_set_user_status(
  p_user_id     uuid,
  p_status      text,
  p_note        text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Chỉ admin được gọi function này
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Permission denied';
  end if;

  update profiles set
    account_status = p_status,
    is_active      = (p_status = 'approved'),
    status_note    = p_note,
    resigned_at    = case when p_status = 'resigned' then now() else resigned_at end,
    updated_at     = now()
  where id = p_user_id;
end;
$$;

-- Grant execute cho authenticated users (RLS sẽ check role bên trong)
grant execute on function public.admin_set_user_status to authenticated;
