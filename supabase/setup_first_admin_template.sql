-- ============================================================
-- CENTOSY ARENA — Setup First Admin Template
-- P0-03 / J3
--
-- Mục đích: Nâng quyền tài khoản đầu tiên lên admin.
--
-- CÁCH DÙNG:
-- 1. Đăng ký tài khoản qua app trước (email + password)
-- 2. Thay YOUR_ADMIN_EMAIL_HERE bằng email đó
-- 3. Thay YOUR_ADMIN_NAME_HERE bằng tên đúng
-- 4. Chạy trong Supabase Dashboard → SQL Editor
--
-- TUYỆT ĐỐI KHÔNG:
-- - Không hardcode password ở đây
-- - Không dùng service_role key từ frontend
-- - Không tạo user mới qua SQL (dùng Auth thay vào đó)
-- ============================================================


-- Bước 1: Nâng quyền admin
UPDATE public.profiles
SET
  role              = 'admin',
  account_status    = 'approved',
  is_active         = true,
  org_group         = 'van-phong',
  office_department = 'hanh-chinh-nhan-su',
  full_name         = 'YOUR_ADMIN_NAME_HERE',
  title             = 'Quản trị viên'
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';


-- Bước 2: Xác nhận kết quả
-- Chạy query này để kiểm tra xem update đã thành công chưa:
SELECT
  id,
  full_name,
  email,
  role,
  account_status,
  is_active,
  org_group,
  office_department
FROM public.profiles
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';

-- Kết quả mong đợi:
-- role           = 'admin'
-- account_status = 'approved'
-- is_active      = true


-- ── Nếu muốn tạo admin thứ 2 sau này ──────────────────────────
-- (Thay email_admin_2 bằng email thật)
--
-- UPDATE public.profiles
-- SET
--   role           = 'admin',
--   account_status = 'approved',
--   is_active      = true
-- WHERE email = 'email_admin_2@centosy.vn';
