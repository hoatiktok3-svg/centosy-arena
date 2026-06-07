-- STEP 53: Daily Check-in Streak
-- Chạy trên Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS daily_checkins (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  checkin_date  date NOT NULL DEFAULT CURRENT_DATE,
  points_earned int  NOT NULL DEFAULT 5,
  streak        int  NOT NULL DEFAULT 1,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;

-- User chỉ thấy check-in của mình
CREATE POLICY "select own checkins"
  ON daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

-- User tự check-in (chỉ được ngày hôm nay)
CREATE POLICY "insert own checkin today"
  ON daily_checkins FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND checkin_date = CURRENT_DATE
  );
