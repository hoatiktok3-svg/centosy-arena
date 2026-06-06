-- ============================================================
-- CENTOSY ARENA — leaderboard_view.sql
-- Safe leaderboard cho public beta
--
-- Mục đích:
-- Cho phép authenticated user (staff + admin) xem leaderboard
-- toàn công ty mà không cần service_role key ở frontend.
--
-- Cách hoạt động:
-- - Dùng SECURITY DEFINER function thay vì view trực tiếp.
-- - Function chạy với quyền của owner (thường là postgres/supabase
--   service), bypass RLS của game_results và profiles.
-- - Chỉ trả về các field an toàn — KHÔNG có email, KHÔNG có role.
-- - Chỉ authenticated session mới gọi được (revoke từ anon + public).
--
-- Prerequisite:
-- - supabase/schema.sql đã chạy (bảng public.profiles tồn tại)
-- - supabase/game_results.sql đã chạy (bảng public.game_results tồn tại)
-- ============================================================

-- ============================================================
-- 1. DROP nếu đã tồn tại (idempotent)
-- ============================================================
drop function if exists public.get_leaderboard(text, integer);
drop view  if exists public.leaderboard_view;

-- ============================================================
-- 2. SECURITY DEFINER FUNCTION
--    Trả về leaderboard tổng hoặc theo phòng ban
--
--    Params:
--      p_department  text     — filter phòng ban; NULL = toàn công ty
--      p_limit       integer  — số dòng tối đa (default 20)
--
--    Không expose: email, role, password hash, auth data
-- ============================================================
create or replace function public.get_leaderboard(
  p_department  text    default null,
  p_limit       integer default 20
)
returns table (
  user_id        uuid,
  full_name      text,
  department     text,
  title          text,
  avatar_initials text,
  total_score    bigint,
  plays          bigint,
  best_score     integer,
  last_played_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    p.id                          as user_id,
    coalesce(p.full_name, '?')   as full_name,
    coalesce(p.department, '')   as department,
    coalesce(p.title, '')        as title,
    coalesce(p.avatar_initials, upper(left(coalesce(p.full_name, '?'), 2))) as avatar_initials,
    sum(g.score)::bigint         as total_score,
    count(g.id)::bigint          as plays,
    max(g.score)::integer        as best_score,
    max(g.created_at)            as last_played_at
  from public.game_results g
  join public.profiles p on p.id = g.user_id
  where
    -- chỉ lấy nhân sự đang hoạt động
    (p.is_active = true or p.is_active is null)
    -- filter phòng ban nếu có
    and (p_department is null or p.department = p_department)
  group by p.id, p.full_name, p.department, p.title, p.avatar_initials
  order by total_score desc
  limit p_limit;
$$;

-- ============================================================
-- 3. GRANT: chỉ authenticated, không cho anon hay public
-- ============================================================
-- Thu hồi mọi quyền mặc định
revoke all on function public.get_leaderboard(text, integer) from public;
revoke all on function public.get_leaderboard(text, integer) from anon;

-- Chỉ authenticated user mới gọi được
grant execute on function public.get_leaderboard(text, integer) to authenticated;

-- ============================================================
-- 4. COMMENT
-- ============================================================
comment on function public.get_leaderboard is
  'Safe leaderboard function — SECURITY DEFINER, bypass RLS để aggregate game_results. '
  'Không expose email/role. Chỉ authenticated user gọi được. '
  'Không dùng service_role key ở frontend.';
