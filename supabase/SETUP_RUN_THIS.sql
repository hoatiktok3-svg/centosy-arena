-- ═══════════════════════════════════════════════════════════════════
-- CENTOSY ARENA — SQL SETUP TỔNG HỢP
-- Chạy file này trong Supabase Dashboard > SQL Editor
-- Chạy 1 lần duy nhất (tất cả dùng IF NOT EXISTS / OR REPLACE)
-- ═══════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────
-- PHẦN 1: game_sessions + game_answers (STEP 66)
-- ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS game_sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_key        text NOT NULL,
  game_title      text NOT NULL,
  score           int  NOT NULL DEFAULT 0,
  max_score       int  NOT NULL DEFAULT 0,
  correct_count   int  NOT NULL DEFAULT 0,
  total_questions int  NOT NULL DEFAULT 0,
  duration_ms     int,
  status          text NOT NULL DEFAULT 'in_progress',
  score_credited  boolean NOT NULL DEFAULT false,
  started_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_answers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_index  int  NOT NULL,
  question_text   text,
  chosen_option   int,
  correct_option  int,
  is_correct      boolean NOT NULL,
  points_earned   int  NOT NULL DEFAULT 0,
  time_taken_ms   int,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS game_sessions_user_idx       ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_key_idx        ON game_sessions(game_key);
CREATE INDEX IF NOT EXISTS game_sessions_credited_idx   ON game_sessions(user_id, game_key, score_credited);
CREATE INDEX IF NOT EXISTS game_answers_session_idx     ON game_answers(session_id);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select own sessions"  ON game_sessions;
DROP POLICY IF EXISTS "insert own session"   ON game_sessions;
DROP POLICY IF EXISTS "update own session"   ON game_sessions;
DROP POLICY IF EXISTS "select own answers"   ON game_answers;
DROP POLICY IF EXISTS "insert own answer"    ON game_answers;
DROP POLICY IF EXISTS "admin select sessions" ON game_sessions;
DROP POLICY IF EXISTS "admin select answers"  ON game_answers;

CREATE POLICY "select own sessions"  ON game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own session"   ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own session"   ON game_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "select own answers"   ON game_answers  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own answer"    ON game_answers  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin đọc tất cả sessions/answers
CREATE POLICY "admin select sessions" ON game_sessions FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "admin select answers"  ON game_answers  FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


-- ──────────────────────────────────────────────────────────────────
-- PHẦN 2: RPC add_game_score_safe (STEP 67)
-- ──────────────────────────────────────────────────────────────────

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
  SELECT score_credited INTO v_already_scored
  FROM game_sessions
  WHERE id = p_session_id AND user_id = p_user_id;

  IF v_already_scored IS TRUE THEN
    RETURN jsonb_build_object('status', 'already_credited', 'points_added', 0);
  END IF;

  UPDATE profiles
  SET score = COALESCE(score, 0) + p_points
  WHERE id = p_user_id
  RETURNING score INTO v_new_score;

  UPDATE game_sessions
  SET score_credited = true
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'status',       'credited',
    'points_added', p_points,
    'new_score',    v_new_score
  );
END;
$$;


-- ──────────────────────────────────────────────────────────────────
-- PHẦN 3: RLS FIX — Admin đọc được tất cả profiles
-- ──────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "admin read all profiles" ON profiles;
CREATE POLICY "admin read all profiles" ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );


-- ──────────────────────────────────────────────────────────────────
-- PHẦN 4: game_rooms + room_players + room_answers + question_sets (STEP 94)
-- ──────────────────────────────────────────────────────────────────

-- question_sets
CREATE TABLE IF NOT EXISTS question_sets (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title       text NOT NULL,
  description text,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- room_questions
CREATE TABLE IF NOT EXISTS room_questions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_set_id uuid REFERENCES question_sets(id) ON DELETE CASCADE NOT NULL,
  question_text   text NOT NULL,
  options         text[] NOT NULL,      -- 4 options
  correct_index   int  NOT NULL,        -- 0-3
  explanation     text,
  sort_order      int  NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- game_rooms
CREATE TABLE IF NOT EXISTS game_rooms (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code                      text NOT NULL UNIQUE,
  title                     text NOT NULL,
  created_by                uuid REFERENCES profiles(id) ON DELETE SET NULL,
  question_set_id           uuid REFERENCES question_sets(id) ON DELETE SET NULL,
  status                    text NOT NULL DEFAULT 'waiting',
  current_question_index    int  NOT NULL DEFAULT 0,
  current_question_started_at timestamptz,
  question_time_limit_s     int  NOT NULL DEFAULT 15,
  total_questions           int  NOT NULL DEFAULT 0,
  final_scores_saved        boolean NOT NULL DEFAULT false,
  created_at                timestamptz DEFAULT now(),
  started_at                timestamptz,
  ended_at                  timestamptz
);

-- room_players
CREATE TABLE IF NOT EXISTS room_players (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id      uuid REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  display_name text,
  score        int  NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0,
  final_rank   int,
  is_active    boolean NOT NULL DEFAULT true,
  joined_at    timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- room_answers
CREATE TABLE IF NOT EXISTS room_answers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id         uuid REFERENCES game_rooms(id) ON DELETE CASCADE NOT NULL,
  question_index  int  NOT NULL,
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  chosen_index    int  NOT NULL,
  is_correct      boolean NOT NULL,
  points_earned   int  NOT NULL DEFAULT 0,
  response_time_ms int,
  answered_at     timestamptz DEFAULT now(),
  UNIQUE(room_id, question_index, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS game_rooms_code_idx         ON game_rooms(code);
CREATE INDEX IF NOT EXISTS room_players_room_idx       ON room_players(room_id);
CREATE INDEX IF NOT EXISTS room_players_user_idx       ON room_players(user_id);
CREATE INDEX IF NOT EXISTS room_answers_room_q_idx     ON room_answers(room_id, question_index);

-- Replica identity for realtime
ALTER TABLE game_rooms   REPLICA IDENTITY FULL;
ALTER TABLE room_players REPLICA IDENTITY FULL;
ALTER TABLE room_answers REPLICA IDENTITY FULL;

-- RLS
ALTER TABLE question_sets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players    ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_answers    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads question_sets"  ON question_sets;
DROP POLICY IF EXISTS "admin manage question_sets"  ON question_sets;
DROP POLICY IF EXISTS "anyone reads room_questions" ON room_questions;
DROP POLICY IF EXISTS "admin manage room_questions" ON room_questions;
DROP POLICY IF EXISTS "anyone reads game_rooms"     ON game_rooms;
DROP POLICY IF EXISTS "admin manages game_rooms"    ON game_rooms;
DROP POLICY IF EXISTS "anyone reads room_players"   ON room_players;
DROP POLICY IF EXISTS "self manage room_player"     ON room_players;
DROP POLICY IF EXISTS "admin manage room_players"   ON room_players;
DROP POLICY IF EXISTS "anyone reads room_answers"   ON room_answers;
DROP POLICY IF EXISTS "insert own answer"           ON room_answers;
DROP POLICY IF EXISTS "admin reads room_answers"    ON room_answers;

CREATE POLICY "anyone reads question_sets"  ON question_sets  FOR SELECT USING (true);
CREATE POLICY "admin manage question_sets"  ON question_sets  FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director'));

CREATE POLICY "anyone reads room_questions" ON room_questions FOR SELECT USING (true);
CREATE POLICY "admin manage room_questions" ON room_questions FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director'));

CREATE POLICY "anyone reads game_rooms"     ON game_rooms     FOR SELECT USING (true);
CREATE POLICY "admin manages game_rooms"    ON game_rooms     FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director'));

CREATE POLICY "anyone reads room_players"   ON room_players   FOR SELECT USING (true);
CREATE POLICY "self manage room_player"     ON room_players   FOR ALL   USING (auth.uid() = user_id);
CREATE POLICY "admin manage room_players"   ON room_players   FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director'));

CREATE POLICY "anyone reads room_answers"   ON room_answers   FOR SELECT USING (true);
CREATE POLICY "insert own answer"           ON room_answers   FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin reads room_answers"    ON room_answers   FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director'));


-- ──────────────────────────────────────────────────────────────────
-- PHẦN 5: RPCs cho Phòng Chơi
-- ──────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code   text := '';
  i      int;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  -- Retry if duplicate
  IF EXISTS (SELECT 1 FROM game_rooms WHERE game_rooms.code = code AND status IN ('waiting','playing')) THEN
    RETURN generate_room_code();
  END IF;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION add_room_score_safe(
  p_room_id   uuid,
  p_user_id   uuid,
  p_points    int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE room_players
  SET score = score + p_points,
      correct_count = correct_count + CASE WHEN p_points > 0 THEN 1 ELSE 0 END
  WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════
-- XONG! Sau khi chạy:
-- 1. Supabase Dashboard → Database → Replication → bật 3 bảng:
--    game_rooms, room_players, room_answers
-- 2. Reload app và test lại
-- ═══════════════════════════════════════════════════════════════════
