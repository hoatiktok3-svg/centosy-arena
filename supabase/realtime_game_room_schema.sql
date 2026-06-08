-- ============================================================
-- STEP 94: Realtime Game Room Schema
-- File: supabase/realtime_game_room_schema.sql
-- KHÔNG tự chạy — Admin chạy thủ công trong Supabase SQL Editor
-- ============================================================

-- ── 1. question_sets ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.question_sets (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ── 2. questions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id        uuid NOT NULL REFERENCES public.question_sets(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options       jsonb NOT NULL,   -- ["option A", "option B", "option C", "option D"]
  correct_index int  NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  points        int  NOT NULL DEFAULT 10 CHECK (points > 0),
  order_index   int  NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS questions_set_id_idx ON public.questions(set_id, order_index);

-- ── 3. game_rooms ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.game_rooms (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                        text UNIQUE NOT NULL,  -- 6-char uppercase code
  title                       text NOT NULL,
  status                      text NOT NULL DEFAULT 'waiting'
                                CHECK (status IN ('waiting','playing','showing_leaderboard','finished','cancelled')),
  created_by                  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  question_set_id             uuid REFERENCES public.question_sets(id) ON DELETE SET NULL,
  current_question_index      int  NOT NULL DEFAULT 0,
  current_question_started_at timestamptz,
  question_time_limit_s       int  NOT NULL DEFAULT 15 CHECK (question_time_limit_s BETWEEN 5 AND 60),
  total_questions             int  NOT NULL DEFAULT 0,
  created_at                  timestamptz DEFAULT now(),
  finished_at                 timestamptz
);
CREATE INDEX IF NOT EXISTS game_rooms_code_idx    ON public.game_rooms(code);
CREATE INDEX IF NOT EXISTS game_rooms_status_idx  ON public.game_rooms(status);
CREATE INDEX IF NOT EXISTS game_rooms_created_idx ON public.game_rooms(created_by);

-- ── 4. room_players ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_players (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id       uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  display_name  text,
  joined_at     timestamptz DEFAULT now(),
  total_score   int  NOT NULL DEFAULT 0,
  correct_count int  NOT NULL DEFAULT 0,
  final_rank    int,                    -- null until game finished
  is_active     boolean DEFAULT true,   -- false if player left
  UNIQUE(room_id, user_id)
);
CREATE INDEX IF NOT EXISTS room_players_room_idx ON public.room_players(room_id);
CREATE INDEX IF NOT EXISTS room_players_user_idx ON public.room_players(user_id);

-- ── 5. room_answers ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.room_answers (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          uuid NOT NULL REFERENCES public.game_rooms(id)  ON DELETE CASCADE,
  question_index   int  NOT NULL,
  user_id          uuid NOT NULL REFERENCES public.profiles(id)    ON DELETE CASCADE,
  chosen_option    int  NOT NULL CHECK (chosen_option >= 0 AND chosen_option <= 3),
  is_correct       boolean NOT NULL,
  response_time_ms int  NOT NULL DEFAULT 0,
  points_earned    int  NOT NULL DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  UNIQUE(room_id, question_index, user_id)  -- chống bấm nhiều lần
);
CREATE INDEX IF NOT EXISTS room_answers_room_q_idx ON public.room_answers(room_id, question_index);
CREATE INDEX IF NOT EXISTS room_answers_user_idx   ON public.room_answers(user_id);

-- ── 6. Enable Realtime ────────────────────────────────────────
-- Chạy từng dòng trong Supabase Dashboard → Database → Replication
-- hoặc chạy lệnh sau:
ALTER TABLE public.game_rooms    REPLICA IDENTITY FULL;
ALTER TABLE public.room_players  REPLICA IDENTITY FULL;
ALTER TABLE public.room_answers  REPLICA IDENTITY FULL;

-- ── 7. RLS Policies ──────────────────────────────────────────
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_answers  ENABLE ROW LEVEL SECURITY;

-- question_sets: mọi người đọc, chỉ admin ghi
CREATE POLICY "question_sets_select" ON public.question_sets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "question_sets_admin_all" ON public.question_sets
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- questions: mọi người đọc, chỉ admin ghi
CREATE POLICY "questions_select" ON public.questions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "questions_admin_all" ON public.questions
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- game_rooms: mọi người đọc, chỉ admin INSERT/UPDATE/DELETE
CREATE POLICY "game_rooms_select" ON public.game_rooms
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "game_rooms_admin_write" ON public.game_rooms
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- room_players: đọc tất cả, tự insert/update của mình
CREATE POLICY "room_players_select" ON public.room_players
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "room_players_insert_self" ON public.room_players
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "room_players_update_self" ON public.room_players
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
-- Admin được update rank + score
CREATE POLICY "room_players_admin_update" ON public.room_players
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- room_answers: đọc tất cả, chỉ insert của mình, KHÔNG update/delete
CREATE POLICY "room_answers_select" ON public.room_answers
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "room_answers_insert_self" ON public.room_answers
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
-- KHÔNG có UPDATE/DELETE policy → không ai sửa được đáp án

-- ── 8. RPC: generate_room_code ────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_room_code()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code   text;
  exists bool;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..6 LOOP
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.game_rooms WHERE game_rooms.code = code AND status != 'finished' AND status != 'cancelled')
      INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- ── 9. RPC: add_room_score_safe ──────────────────────────────
-- Cộng điểm vào room_players + profiles.score (chống lặp)
CREATE OR REPLACE FUNCTION public.add_room_score_safe(
  p_room_id      uuid,
  p_user_id      uuid,
  p_points       int,
  p_is_correct   bool
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Cập nhật room_players
  UPDATE public.room_players
  SET total_score   = total_score + p_points,
      correct_count = correct_count + CASE WHEN p_is_correct THEN 1 ELSE 0 END
  WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$;

-- ── CHẠY XONG: thêm các bảng này vào Supabase Realtime ──────
-- Dashboard → Database → Replication → Add tables:
--   game_rooms, room_players, room_answers
