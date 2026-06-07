-- STEP 67: RPC an toàn để cộng điểm game vào profiles.score
-- Chạy trên Supabase Dashboard > SQL Editor

-- Hàm này chạy với SECURITY DEFINER để bypass RLS khi cập nhật profiles.score
-- Chỉ cộng điểm nếu session_id chưa được tính (idempotent)

CREATE OR REPLACE FUNCTION add_game_score_safe(
  p_user_id    uuid,
  p_session_id uuid,
  p_points     int
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_already_scored boolean;
  v_new_score      int;
BEGIN
  -- Kiểm tra session đã được cộng điểm chưa (qua cột score_credited)
  -- Nếu chưa có cột này: ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS score_credited boolean DEFAULT false;
  SELECT score_credited INTO v_already_scored
  FROM game_sessions
  WHERE id = p_session_id AND user_id = p_user_id;

  IF v_already_scored IS TRUE THEN
    RETURN jsonb_build_object('status', 'already_credited', 'points_added', 0);
  END IF;

  -- Cộng điểm vào profiles
  UPDATE profiles
  SET score = COALESCE(score, 0) + p_points
  WHERE id = p_user_id
  RETURNING score INTO v_new_score;

  -- Đánh dấu session đã cộng điểm
  UPDATE game_sessions
  SET score_credited = true
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'status',      'credited',
    'points_added', p_points,
    'new_score',    v_new_score
  );
END;
$$;

-- Thêm cột score_credited vào game_sessions nếu chưa có
ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS score_credited boolean NOT NULL DEFAULT false;

-- Index để check nhanh
CREATE INDEX IF NOT EXISTS game_sessions_credited_idx
  ON game_sessions(user_id, game_key, score_credited);
