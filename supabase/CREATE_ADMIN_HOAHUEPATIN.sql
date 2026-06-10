-- ============================================================
-- TẠO TÀI KHOẢN ADMIN: hoahuepatin@centosy.vn
-- ============================================================
-- CÁCH CHẠY:
-- Bước 1: Vào Supabase Dashboard > Authentication > Users > "Add User"
--         Email: hoahuepatin@centosy.vn
--         Password: anhhoakute
--         Tick "Auto Confirm User" để khỏi cần xác nhận email
--         → Lưu lại User UID vừa tạo
--
-- Bước 2: Chạy SQL bên dưới trong Supabase Dashboard > SQL Editor
--         Thay <USER_UID> bằng UID thật từ Bước 1
-- ============================================================

-- Thay <USER_UID> bằng UUID từ Authentication > Users
DO $$
DECLARE
  v_user_id uuid := '<USER_UID>';  -- ← THAY BẰNG UID THẬT
BEGIN
  -- Upsert profile với role admin
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    role,
    account_status,
    is_active,
    department
  )
  VALUES (
    v_user_id,
    'Hoa Hue Patin',
    'hoahuepatin@centosy.vn',
    'admin',
    'approved',
    true,
    'van-phong'
  )
  ON CONFLICT (id) DO UPDATE SET
    role           = 'admin',
    account_status = 'approved',
    is_active      = true,
    full_name      = COALESCE(EXCLUDED.full_name, profiles.full_name);

  RAISE NOTICE 'Admin account created/updated for user %', v_user_id;
END $$;

-- Kiểm tra kết quả
SELECT id, full_name, email, role, account_status, is_active
FROM public.profiles
WHERE email = 'hoahuepatin@centosy.vn';
