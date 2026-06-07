-- ============================================================
-- STEP 30: Mission Points Trigger — Auto-award / revoke điểm
-- Chạy SAU mission.sql (STEP 29)
-- Chạy trong Supabase Dashboard > SQL Editor
-- Idempotent: CREATE OR REPLACE
-- ============================================================

-- ── 1. Hàm cộng/trừ điểm khi submission được duyệt ──────────
-- SECURITY DEFINER: bypass RLS để update profiles.score
-- (RLS ngăn user tự sửa điểm, nhưng trigger chạy với quyền DB owner)
CREATE OR REPLACE FUNCTION public.award_mission_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points integer;
BEGIN
  -- Không làm gì nếu status không thay đổi
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Lấy số điểm của nhiệm vụ
  SELECT points INTO v_points
  FROM public.missions
  WHERE id = NEW.mission_id;

  IF v_points IS NULL THEN
    RETURN NEW; -- nhiệm vụ đã bị xóa, bỏ qua
  END IF;

  -- Pending/Rejected → Approved: CỘNG điểm
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE public.profiles
    SET score = COALESCE(score, 0) + v_points
    WHERE id = NEW.user_id;

  -- Approved → Rejected/Pending: HOÀN điểm (admin đổi ý)
  ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    UPDATE public.profiles
    SET score = GREATEST(0, COALESCE(score, 0) - v_points)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.award_mission_points() IS
  'Tự động cộng/trừ điểm vào profiles.score khi mission_submission được approved/reverted';

-- ── 2. Gắn trigger vào bảng mission_submissions ──────────────
-- Xóa trigger cũ nếu tồn tại (idempotent)
DROP TRIGGER IF EXISTS trg_award_mission_points ON public.mission_submissions;

CREATE TRIGGER trg_award_mission_points
  AFTER UPDATE ON public.mission_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_mission_points();

-- ── 3. Bảo vệ: không cho admin cộng điểm 2 lần ──────────────
-- UNIQUE(mission_id, user_id) đã được đặt trong missions.sql (STEP 29)
-- → mỗi user chỉ có 1 submission per mission → không thể approve 2 lần

-- ── 4. View tổng hợp điểm (mission + game) cho Admin ─────────
-- Giúp Admin thấy nguồn điểm của từng user
CREATE OR REPLACE VIEW public.user_score_breakdown AS
SELECT
  p.id            AS user_id,
  p.full_name,
  p.role,
  p.score         AS total_score,
  COALESCE(g.game_score,     0) AS game_score,
  COALESCE(m.mission_score,  0) AS mission_score,
  COALESCE(g.game_plays,     0) AS game_plays,
  COALESCE(m.missions_done,  0) AS missions_done
FROM public.profiles p
LEFT JOIN (
  SELECT
    user_id,
    SUM(score)  AS game_score,
    COUNT(*)    AS game_plays
  FROM public.game_results
  GROUP BY user_id
) g ON g.user_id = p.id
LEFT JOIN (
  SELECT
    ms.user_id,
    SUM(mi.points) AS mission_score,
    COUNT(*)       AS missions_done
  FROM public.mission_submissions ms
  JOIN public.missions mi ON mi.id = ms.mission_id
  WHERE ms.status = 'approved'
  GROUP BY ms.user_id
) m ON m.user_id = p.id
WHERE p.is_active = true;

COMMENT ON VIEW public.user_score_breakdown IS
  'Tổng điểm mỗi user = game_score (từ game_results) + mission_score (từ approved submissions). NOTE: profiles.score được cộng bởi trigger khi approve mission; game_results không tự cộng vào profiles.score (cần STEP riêng).';

-- RLS cho view (inherit từ base tables — view không cần RLS riêng)
-- Chỉ admin/director/manager có thể truy cập view này
-- → được bảo vệ tại application layer (canAccessTeamDashboard)
