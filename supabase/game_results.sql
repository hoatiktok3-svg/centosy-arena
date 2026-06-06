-- ============================================================
-- CENTOSY ARENA — game_results table
-- MVP: lưu kết quả chơi game thật vào Supabase
-- Leaderboard sẽ lấy dữ liệu từ bảng này
--
-- QUAN TRỌNG:
-- - Không dùng service_role key ở frontend
-- - Staff chỉ xem được điểm của chính mình
-- - Chỉ Admin xem được toàn bộ điểm công ty
--
-- Prerequisite:
-- - Bảng public.profiles đã tồn tại (từ supabase/schema.sql)
-- - Function public.is_admin() đã tồn tại (từ supabase/schema.sql)
--   Nếu chưa có, hãy chạy supabase/schema.sql trước
-- ============================================================

-- ============================================================
-- 1. CREATE TABLE
-- ============================================================
create table if not exists public.game_results (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.profiles(id) on delete cascade,
  game_key         text        not null,
  game_title       text        not null,
  score            integer     not null default 0,
  max_score        integer,
  correct_count    integer     default 0,
  total_questions  integer     default 0,
  duration_seconds integer,
  title_earned     text,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================
alter table public.game_results enable row level security;

-- ============================================================
-- 3. POLICIES
--
-- Dùng public.is_admin() đã định nghĩa trong supabase/schema.sql
-- Staff chỉ thao tác trên bản ghi của chính mình (user_id = auth.uid())
-- Admin có quyền đầy đủ trên toàn bộ bảng
-- Anon không có quyền gì
-- ============================================================

-- Staff: xem kết quả của chính mình
create policy "Staff can view own game results"
  on public.game_results
  for select
  to authenticated
  using (
    user_id = auth.uid()
  );

-- Staff: insert kết quả của chính mình
create policy "Staff can insert own game results"
  on public.game_results
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
  );

-- Admin: xem toàn bộ kết quả
create policy "Admin can view all game results"
  on public.game_results
  for select
  to authenticated
  using (
    public.is_admin()
  );

-- Admin: update toàn bộ kết quả (nếu cần chỉnh sửa dữ liệu)
create policy "Admin can update all game results"
  on public.game_results
  for update
  to authenticated
  using (
    public.is_admin()
  )
  with check (
    public.is_admin()
  );

-- Admin: delete toàn bộ kết quả (nếu cần dọn dữ liệu test)
create policy "Admin can delete all game results"
  on public.game_results
  for delete
  to authenticated
  using (
    public.is_admin()
  );

-- ============================================================
-- 4. INDEXES
-- ============================================================

-- Tìm theo user
create index if not exists game_results_user_id_idx
  on public.game_results (user_id);

-- Tìm theo loại game
create index if not exists game_results_game_key_idx
  on public.game_results (game_key);

-- Leaderboard: sắp xếp điểm cao nhất
create index if not exists game_results_score_desc_idx
  on public.game_results (score desc);

-- Lịch sử: sắp xếp theo thời gian mới nhất
create index if not exists game_results_created_at_desc_idx
  on public.game_results (created_at desc);

-- Leaderboard per game: user + game_key để aggregate
create index if not exists game_results_user_game_idx
  on public.game_results (user_id, game_key);
