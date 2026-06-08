-- ═══════════════════════════════════════════════════════════════
-- room_invitations table — Gửi lời mời tham gia phòng chơi
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.room_invitations (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id     uuid REFERENCES public.game_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invited_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  room_code   text NOT NULL,
  room_title  text NOT NULL,
  status      text NOT NULL DEFAULT 'pending', -- pending | accepted | declined | expired
  created_at  timestamptz DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS room_invitations_user_idx ON public.room_invitations(user_id, status);
CREATE INDEX IF NOT EXISTS room_invitations_room_idx ON public.room_invitations(room_id);

ALTER TABLE public.room_invitations ENABLE ROW LEVEL SECURITY;

-- User đọc lời mời của mình
DROP POLICY IF EXISTS "read own invitations" ON public.room_invitations;
CREATE POLICY "read own invitations" ON public.room_invitations FOR SELECT
  USING (auth.uid() = user_id OR get_my_role() = 'admin');

-- Admin gửi lời mời
DROP POLICY IF EXISTS "admin manage invitations" ON public.room_invitations;
CREATE POLICY "admin manage invitations" ON public.room_invitations FOR ALL
  USING (get_my_role() = 'admin');

-- User cập nhật status của lời mời của mình (accept/decline)
DROP POLICY IF EXISTS "update own invitation" ON public.room_invitations;
CREATE POLICY "update own invitation" ON public.room_invitations FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER TABLE public.room_invitations REPLICA IDENTITY FULL;
