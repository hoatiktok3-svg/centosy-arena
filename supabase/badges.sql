-- ============================================================
-- STEP 31: Badges and Recognition Wall — Schema
-- Chạy trong Supabase Dashboard > SQL Editor
-- Idempotent: IF NOT EXISTS, INSERT ... ON CONFLICT DO NOTHING
-- ============================================================

-- ── 1. badge_definitions ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.badge_definitions (
  id           text PRIMARY KEY,        -- 'mvp', 'streak', 'top-sales', etc.
  label        text NOT NULL,
  icon         text NOT NULL,           -- emoji
  description  text,
  color        text NOT NULL DEFAULT '#585858', -- hex color
  points_bonus integer NOT NULL DEFAULT 0       -- điểm thưởng mặc định khi trao
);

COMMENT ON TABLE public.badge_definitions IS 'Danh sách loại huy hiệu (config)';

-- ── 2. user_badges ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_badges (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id     text NOT NULL REFERENCES public.badge_definitions(id),
  awarded_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason       text,
  points_bonus integer NOT NULL DEFAULT 0, -- điểm thực tế khi trao (có thể khác default)
  is_featured  boolean NOT NULL DEFAULT false,
  awarded_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_badges IS 'Huy hiệu đã được trao cho nhân viên';

CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS user_badges_awarded_at_idx ON public.user_badges(awarded_at DESC);
CREATE INDEX IF NOT EXISTS user_badges_featured_idx ON public.user_badges(is_featured) WHERE is_featured = true;

-- ── 3. RLS ───────────────────────────────────────────────────
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- badge_definitions: tất cả xem được
DROP POLICY IF EXISTS "badge_defs_read_all" ON public.badge_definitions;
CREATE POLICY "badge_defs_read_all" ON public.badge_definitions
  FOR SELECT USING (true);

-- badge_definitions: chỉ admin/director/manager tạo/sửa
DROP POLICY IF EXISTS "badge_defs_write" ON public.badge_definitions;
CREATE POLICY "badge_defs_write" ON public.badge_definitions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director', 'manager')
    )
  );

-- user_badges: tất cả xem được (Wall of Fame public)
DROP POLICY IF EXISTS "user_badges_read_all" ON public.user_badges;
CREATE POLICY "user_badges_read_all" ON public.user_badges
  FOR SELECT USING (true);

-- user_badges: chỉ admin/director trao huy hiệu
DROP POLICY IF EXISTS "user_badges_award" ON public.user_badges;
CREATE POLICY "user_badges_award" ON public.user_badges
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director')
    )
  );

-- user_badges: chỉ admin/director cập nhật (is_featured, reason)
DROP POLICY IF EXISTS "user_badges_update" ON public.user_badges;
CREATE POLICY "user_badges_update" ON public.user_badges
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'director')
    )
  );

-- ── 4. Seed badge_definitions ─────────────────────────────────
INSERT INTO public.badge_definitions (id, label, icon, description, color, points_bonus) VALUES
  ('mvp',          'MVP',                '👑', 'Nhân viên xuất sắc nhất tuần/tháng',            '#facc15', 500),
  ('streak',       'Streak',             '🔥', 'Duy trì phong độ liên tục nhiều ngày',           '#E94E1B', 200),
  ('top-sales',    'Top Sales',          '💰', 'Đứng đầu doanh số trong kỳ',                    '#4ade80', 400),
  ('quiz-master',  'Quiz Master',        '🎯', 'Đạt điểm tuyệt đối quiz kiến thức sản phẩm',    '#60a5fa', 300),
  ('team-player',  'Team Player',        '🤝', 'Hỗ trợ đồng đội xuất sắc',                     '#c084fc', 250),
  ('fast-hand',    'Fast Hand',          '⚡', 'Tốc độ xử lý nhanh nhất đội',                   '#22d3ee', 200),
  ('rookie',       'Rookie',             '🌱', 'Nhân viên mới tiến bộ vượt trội',                '#34d399', 150),
  ('iron-will',    'Iron Will',          '🛡️', 'Kiên trì không bỏ cuộc, vượt qua thử thách',    '#9ca3af', 300),
  ('star-week',    'Ngôi sao tuần',      '⭐', 'Nổi bật nhất trong tuần',                       '#E94E1B', 300),
  ('innovator',    'Văn phòng cải tiến', '💡', 'Đề xuất sáng kiến cải tiến được áp dụng',       '#60a5fa', 400),
  ('warehouse-ace','Kho vận chính xác',  '📦', 'Không sai sót xuất nhập kho',                   '#4ade80', 350),
  ('sales-surge',  'Cửa hàng bứt phá',  '🏆', 'Cửa hàng đạt doanh số vượt chỉ tiêu',          '#facc15', 500)
ON CONFLICT (id) DO NOTHING;
