-- ============================================================
-- STEP 33: Notification Center — Schema
-- Chạy trong Supabase Dashboard > SQL Editor
-- Idempotent: IF NOT EXISTS
-- ============================================================

-- ── notifications table ───────────────────────────────────────
-- user_id NOT NULL: thông báo cá nhân (fan-out từ broadcast)
-- Admin gửi cho group → insert 1 row per user in that group
CREATE TABLE IF NOT EXISTS public.notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  body            text,
  -- 'mission' | 'badge' | 'system' | 'announcement' | 'points'
  type            text NOT NULL DEFAULT 'system',
  -- icon emoji tùy chỉnh; null = default theo type
  icon            text,
  -- deep-link trong app (future): 'missions' | 'honor' | 'rank' | null
  action_tab      text,
  is_read         boolean NOT NULL DEFAULT false,
  created_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'Thông báo nội bộ cá nhân — 1 row per user per notification';

CREATE INDEX IF NOT EXISTS notifications_user_id_idx  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_unread_idx   ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User chỉ đọc thông báo của mình
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY "notifications_read_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- User chỉ update thông báo của mình (mark as read)
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admin/director/manager INSERT (gửi thông báo)
DROP POLICY IF EXISTS "notifications_insert_managers" ON public.notifications;
CREATE POLICY "notifications_insert_managers" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- Admin/director DELETE (thu hồi thông báo)
DROP POLICY IF EXISTS "notifications_delete_admin" ON public.notifications;
CREATE POLICY "notifications_delete_admin" ON public.notifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director')
    )
  );

-- ── Helper function: gửi thông báo cho 1 nhóm ─────────────────
-- Dùng trong backend hoặc SQL Editor (không expose ra frontend)
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_sender_id      uuid,
  p_title          text,
  p_body           text,
  p_type           text DEFAULT 'announcement',
  p_icon           text DEFAULT NULL,
  p_action_tab     text DEFAULT NULL,
  p_org_group      text DEFAULT NULL   -- NULL = toàn công ty
)
RETURNS integer  -- số thông báo đã gửi
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Kiểm tra sender có quyền không
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_sender_id
      AND role IN ('admin', 'director', 'manager')
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to broadcast notifications';
  END IF;

  -- Insert 1 notification per matching active user
  WITH targets AS (
    SELECT id FROM public.profiles
    WHERE is_active = true
      AND (p_org_group IS NULL OR org_group = p_org_group)
      AND id != p_sender_id  -- không gửi cho chính mình
  )
  INSERT INTO public.notifications (user_id, title, body, type, icon, action_tab, created_by)
  SELECT t.id, p_title, p_body, p_type, p_icon, p_action_tab, p_sender_id
  FROM targets t;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.broadcast_notification IS
  'Gửi thông báo broadcast cho 1 nhóm (org_group) hoặc toàn công ty. Chỉ manager+ gọi được.';

-- ── Seed: thông báo hệ thống mẫu ──────────────────────────────
-- Chỉ seed nếu bảng trống VÀ có ít nhất 1 admin
DO $$
DECLARE
  admin_id   uuid;
  sample_uid uuid;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO sample_uid FROM public.profiles WHERE is_active = true LIMIT 1;

  IF NOT EXISTS (SELECT 1 FROM public.notifications LIMIT 1)
     AND admin_id IS NOT NULL
     AND sample_uid IS NOT NULL
  THEN
    INSERT INTO public.notifications (user_id, title, body, type, icon, created_by) VALUES
      (sample_uid, '🎉 Chào mừng đến Centosy Arena!',
       'Bạn đã được duyệt tài khoản. Hãy khám phá game, nhiệm vụ và bảng vinh danh ngay nhé!',
       'system', '🎉', admin_id),
      (sample_uid, '📋 Nhiệm vụ mới chờ bạn',
       'Có 5 nhiệm vụ mới vừa được tạo. Hoàn thành để nhận điểm thưởng!',
       'mission', '📋', admin_id),
      (admin_id, '✅ Tài khoản đã được duyệt',
       'Chào mừng bạn tham gia Centosy Arena. Chúc bạn thi đấu thành công!',
       'system', '✅', admin_id);
  END IF;
END;
$$;
