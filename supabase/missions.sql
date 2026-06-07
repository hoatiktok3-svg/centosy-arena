-- ============================================================
-- STEP 29: Missions and Reward Points — Schema
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- Idempotent: dùng IF NOT EXISTS / DO $$ ... END $$
-- ============================================================

-- ── 1. missions table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.missions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  description      text,
  points           integer NOT NULL DEFAULT 50,
  -- null = tất cả khối; 'cua-hang' | 'kho' | 'van-phong'
  target_org_group text,
  -- null = tất cả bộ phận văn phòng; hoặc giá trị office_department_type
  target_office_dept text,
  -- 'task' | 'challenge' | 'kpi'
  mission_type     text NOT NULL DEFAULT 'task',
  deadline         timestamptz,
  is_active        boolean NOT NULL DEFAULT true,
  created_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.missions IS 'Nhiệm vụ / Thử thách công ty';
COMMENT ON COLUMN public.missions.target_org_group   IS 'Null = áp dụng cho tất cả khối';
COMMENT ON COLUMN public.missions.target_office_dept IS 'Null = tất cả bộ phận văn phòng';

-- ── 2. mission_submissions table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.mission_submissions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id    uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- 'pending' | 'approved' | 'rejected'
  status        text NOT NULL DEFAULT 'pending',
  note          text,
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  reject_reason text,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mission_id, user_id)
);

COMMENT ON TABLE public.mission_submissions IS 'Kết quả nộp nhiệm vụ của nhân viên';

-- ── 3. updated_at trigger cho missions ───────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'missions_updated_at' AND tgrelid = 'public.missions'::regclass
  ) THEN
    CREATE TRIGGER missions_updated_at
      BEFORE UPDATE ON public.missions
      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
  END IF;
END;
$$;

-- ── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions ENABLE ROW LEVEL SECURITY;

-- missions: nhân viên chỉ thấy nhiệm vụ đang active
DROP POLICY IF EXISTS "missions_read" ON public.missions;
CREATE POLICY "missions_read" ON public.missions
  FOR SELECT USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- missions: chỉ manager+ mới tạo/sửa
DROP POLICY IF EXISTS "missions_write" ON public.missions;
CREATE POLICY "missions_write" ON public.missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- submissions: user đọc của chính mình; manager+ đọc tất cả
DROP POLICY IF EXISTS "submissions_read" ON public.mission_submissions;
CREATE POLICY "submissions_read" ON public.mission_submissions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- submissions: user tự nộp của mình
DROP POLICY IF EXISTS "submissions_insert_own" ON public.mission_submissions;
CREATE POLICY "submissions_insert_own" ON public.mission_submissions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- submissions: manager+ duyệt (update status, reviewed_by, reviewed_at, reject_reason)
DROP POLICY IF EXISTS "submissions_approve" ON public.mission_submissions;
CREATE POLICY "submissions_approve" ON public.mission_submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- ── 5. Seed dữ liệu mẫu (chỉ chạy lần đầu nếu bảng trống) ──
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Lấy ID của tài khoản admin
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.missions LIMIT 1) AND admin_id IS NOT NULL THEN
    INSERT INTO public.missions (title, description, points, target_org_group, mission_type, deadline, created_by) VALUES
      ('Chào đón khách hàng đúng chuẩn',
       'Thực hiện quy trình chào đón khách hàng theo đúng 5 bước tiêu chuẩn. Ghi chép lại và nộp báo cáo.',
       100, 'cua-hang', 'task',
       now() + interval '7 days', admin_id),

      ('Kiểm kê kho tháng 6',
       'Hoàn thành kiểm kê hàng hóa tại kho, đối chiếu với hệ thống. Nộp biên bản kiểm kê có ký tên.',
       150, 'kho', 'kpi',
       now() + interval '14 days', admin_id),

      ('Hoàn thành khóa học nội bộ',
       'Hoàn thành toàn bộ module đào tạo nội bộ trên hệ thống và đạt điểm thi tối thiểu 80%.',
       200, null, 'task',
       now() + interval '30 days', admin_id),

      ('Thử thách tốc độ xử lý đơn hàng',
       'Xử lý tối thiểu 50 đơn hàng trong 1 ngày làm việc với tỷ lệ lỗi < 2%.',
       120, 'cua-hang', 'challenge',
       now() + interval '3 days', admin_id),

      ('Báo cáo đề xuất cải tiến',
       'Viết báo cáo đề xuất ít nhất 1 cải tiến quy trình trong bộ phận, kèm phân tích lợi ích.',
       180, 'van-phong', 'kpi',
       now() + interval '21 days', admin_id);
  END IF;
END;
$$;
