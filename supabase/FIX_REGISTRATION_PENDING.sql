-- ═══════════════════════════════════════════════════════════════════
-- FIX: New user registration → account_status = 'pending'
-- Chạy trong Supabase Dashboard > SQL Editor
-- ═══════════════════════════════════════════════════════════════════

-- 1. Thêm column account_status (nếu chưa có) + đổi default thành 'pending'
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS org_group text,
  ADD COLUMN IF NOT EXISTS office_department text,
  ADD COLUMN IF NOT EXISTS registration_note text,
  ADD COLUMN IF NOT EXISTS rejected_reason text,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Đổi default của account_status thành 'pending' cho user mới
ALTER TABLE public.profiles
  ALTER COLUMN account_status SET DEFAULT 'pending';
ALTER TABLE public.profiles
  ALTER COLUMN is_active SET DEFAULT false;

-- 2. Giữ admin + approved staff vẫn active (đừng lock lại)
UPDATE public.profiles
  SET account_status = 'approved', is_active = true
  WHERE account_status = 'approved' OR is_active = true OR role = 'admin';

-- Đảm bảo admin luôn active
UPDATE public.profiles
  SET role = 'admin', account_status = 'approved', is_active = true
  WHERE email = 'admin@centosy.vn';

-- 3. Cập nhật trigger handle_new_user để set pending + copy metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    org_group,
    office_department,
    registration_note,
    account_status,
    is_active,
    role
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'org_group', ''),
    COALESCE(new.raw_user_meta_data->>'office_department', ''),
    COALESCE(new.raw_user_meta_data->>'registration_note', ''),
    'pending',   -- chờ admin duyệt
    false,       -- chưa active
    'staff'      -- mặc định staff, admin có thể đổi khi duyệt
  );
  RETURN new;
END;
$$;

-- 4. get_my_role() SECURITY DEFINER (tránh infinite recursion trong RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- 5. Fix RLS profiles: dùng get_my_role() thay vì subquery
DROP POLICY IF EXISTS "admin read all profiles" ON public.profiles;
CREATE POLICY "admin read all profiles" ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR get_my_role() = 'admin'
  );

DROP POLICY IF EXISTS "admin update profiles" ON public.profiles;
CREATE POLICY "admin update profiles" ON public.profiles FOR UPDATE
  USING (get_my_role() = 'admin');

-- 6. admin_set_user_status RPC
CREATE OR REPLACE FUNCTION public.admin_set_user_status(
  p_user_id uuid,
  p_status  text   -- 'approved' | 'inactive' | 'resigned' | 'pending'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF get_my_role() <> 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_status = 'approved' THEN
    UPDATE public.profiles
      SET account_status = 'approved', is_active = true
      WHERE id = p_user_id;
  ELSIF p_status = 'inactive' THEN
    UPDATE public.profiles
      SET account_status = 'inactive', is_active = false
      WHERE id = p_user_id;
  ELSIF p_status = 'resigned' THEN
    UPDATE public.profiles
      SET account_status = 'resigned', is_active = false
      WHERE id = p_user_id;
  ELSIF p_status = 'pending' THEN
    UPDATE public.profiles
      SET account_status = 'pending', is_active = false
      WHERE id = p_user_id;
  ELSE
    RAISE EXCEPTION 'Invalid status: %', p_status;
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- XONG! Reload app và test:
-- 1. Đăng ký user mới → phải thấy màn hình "Chờ duyệt"
-- 2. Admin → Panel → Duyệt → user mới active được
-- ═══════════════════════════════════════════════════════════════════
