-- ═══════════════════════════════════════════════════════════════
-- QUESTION BANK — Ngân hàng câu hỏi tổng hợp
-- Chạy 1 lần trong Supabase SQL Editor
-- KHÔNG đụng đến schema cũ (question_sets, questions, room_questions)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.question_bank (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Nội dung câu hỏi
  question       text        NOT NULL,
  option_a       text        NOT NULL,
  option_b       text        NOT NULL,
  option_c       text        NOT NULL,
  option_d       text        NOT NULL,
  correct_answer char(1)     NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation    text,

  -- Metadata phân loại
  topic          text,        -- Nhóm câu hỏi
  department     text,        -- Phòng ban
  difficulty     text,        -- Độ khó: dễ / trung bình / khó
  skill_tag      text,        -- Tag kỹ năng
  trap_type      text,        -- Loại bẫy

  -- Config game
  time_limit     int         NOT NULL DEFAULT 20 CHECK (time_limit > 0),
  score          int         NOT NULL DEFAULT 10 CHECK (score >= 0),

  -- Chất lượng
  quality_score  int         DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),

  -- Import metadata
  source_type    text        NOT NULL DEFAULT 'csv_import',
  is_approved    boolean     NOT NULL DEFAULT true,
  is_active      boolean     NOT NULL DEFAULT true,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Index thường dùng
CREATE INDEX IF NOT EXISTS qbank_topic_idx      ON public.question_bank(topic);
CREATE INDEX IF NOT EXISTS qbank_dept_idx       ON public.question_bank(department);
CREATE INDEX IF NOT EXISTS qbank_diff_idx       ON public.question_bank(difficulty);
CREATE INDEX IF NOT EXISTS qbank_active_idx     ON public.question_bank(is_active, is_approved);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_question_bank_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS qbank_updated_at ON public.question_bank;
CREATE TRIGGER qbank_updated_at
  BEFORE UPDATE ON public.question_bank
  FOR EACH ROW EXECUTE FUNCTION update_question_bank_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- Tất cả user đã đăng nhập được đọc
CREATE POLICY "qbank_select_authenticated"
  ON public.question_bank FOR SELECT
  TO authenticated USING (true);

-- Chỉ admin được ghi/xóa
CREATE POLICY "qbank_admin_all"
  ON public.question_bank FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── Verify ───────────────────────────────────────────────────
-- Sau khi chạy, kiểm tra bằng:
--   SELECT COUNT(*) FROM public.question_bank;
--   \d public.question_bank
