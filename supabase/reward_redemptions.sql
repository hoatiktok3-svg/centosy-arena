-- STEP 55: Reward Shop Redemptions
-- Chạy trên Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id     text NOT NULL,        -- ID của ShopItem trong mock/config
  item_title  text NOT NULL,
  point_cost  int  NOT NULL,
  status      text NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  note        text,                  -- ghi chú từ user
  admin_note  text,                  -- ghi chú từ admin khi xử lý
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- User chỉ thấy yêu cầu của mình
CREATE POLICY "select own redemptions"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- User tự tạo yêu cầu
CREATE POLICY "insert own redemption"
  ON reward_redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin xem tất cả (cần service role hoặc SECURITY DEFINER function sau)
