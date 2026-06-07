-- STEP 66: Game Session + Answer Log
-- Chạy trên Supabase Dashboard > SQL Editor

-- ── Bảng game_sessions ────────────────────────────────────────
-- Mỗi lần user bắt đầu 1 game = 1 session
CREATE TABLE IF NOT EXISTS game_sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_key        text NOT NULL,           -- 'product_quiz', 'difficult_customer', ...
  game_title      text NOT NULL,
  score           int  NOT NULL DEFAULT 0,
  max_score       int  NOT NULL DEFAULT 0,
  correct_count   int  NOT NULL DEFAULT 0,
  total_questions int  NOT NULL DEFAULT 0,
  duration_ms     int,                     -- milliseconds
  status          text NOT NULL DEFAULT 'in_progress', -- in_progress | completed | abandoned
  started_at      timestamptz DEFAULT now(),
  completed_at    timestamptz,
  created_at      timestamptz DEFAULT now()
);

-- ── Bảng game_answers ─────────────────────────────────────────
-- Chi tiết từng câu trả lời trong 1 session
CREATE TABLE IF NOT EXISTS game_answers (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id      uuid REFERENCES game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  question_index  int  NOT NULL,           -- 0-based
  question_text   text,
  chosen_option   int,                     -- index của đáp án chọn
  correct_option  int,                     -- index của đáp án đúng
  is_correct      boolean NOT NULL,
  points_earned   int  NOT NULL DEFAULT 0,
  time_taken_ms   int,                     -- ms để trả lời câu này
  created_at      timestamptz DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS game_sessions_user_idx ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS game_sessions_key_idx  ON game_sessions(game_key);
CREATE INDEX IF NOT EXISTS game_answers_session_idx ON game_answers(session_id);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_answers  ENABLE ROW LEVEL SECURITY;

-- Users chỉ đọc được session của mình
CREATE POLICY "select own sessions"
  ON game_sessions FOR SELECT USING (auth.uid() = user_id);

-- Users tự tạo session
CREATE POLICY "insert own session"
  ON game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users tự update session của mình (để đánh dấu completed)
CREATE POLICY "update own session"
  ON game_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Tương tự cho answers
CREATE POLICY "select own answers"
  ON game_answers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert own answer"
  ON game_answers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin / manager đọc tất cả (dùng service role hoặc SECURITY DEFINER RPC)
-- Cần thêm policy cho admin nếu dùng qua API thường:
-- CREATE POLICY "admin select all sessions" ON game_sessions FOR SELECT
--   USING ( (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','director','manager') );
