-- ============================================================
-- CENTOSY ARENA — ALL PENDING MIGRATIONS
-- STEP 37 + 43 + 44 + 45 + 46 + A1 (Lucky Spin) + A2 (LC v2)
-- Chạy file này 1 lần trên Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/avprramyljytezenekwx/sql/new
-- ============================================================

-- ══════════════════════════════════════════════
-- FIX 0: Sync user_role enum — thêm các role còn thiếu
-- base schema chỉ có 'admin'/'staff', code dùng 5 roles
-- ══════════════════════════════════════════════
do $$ begin
  if not exists (select 1 from pg_enum where enumlabel = 'employee' and enumtypid = 'public.user_role'::regtype) then
    alter type public.user_role add value 'employee';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_enum where enumlabel = 'manager' and enumtypid = 'public.user_role'::regtype) then
    alter type public.user_role add value 'manager';
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_enum where enumlabel = 'director' and enumtypid = 'public.user_role'::regtype) then
    alter type public.user_role add value 'director';
  end if;
end $$;

-- ══════════════════════════════════════════════
-- STEP 37: Feedbacks
-- ══════════════════════════════════════════════
create table if not exists public.feedbacks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  type        text        not null check (type in ('bug', 'suggestion', 'other')),
  severity    text        not null check (severity in ('low', 'medium', 'high')),
  screen      text        not null,
  message     text        not null,
  is_resolved boolean     not null default false,
  resolved_by uuid        references public.profiles(id),
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists feedbacks_user_id_idx    on public.feedbacks(user_id);
create index if not exists feedbacks_created_at_idx on public.feedbacks(created_at desc);

alter table public.feedbacks enable row level security;

create policy "user_insert_own_feedback" on public.feedbacks
  for insert with check (auth.uid() = user_id);

create policy "user_read_own_feedback" on public.feedbacks
  for select using (auth.uid() = user_id);

create policy "admin_all_feedbacks" on public.feedbacks
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ══════════════════════════════════════════════
-- STEP 43: User Status Management
-- ══════════════════════════════════════════════
alter table public.profiles
  add column if not exists resigned_at  timestamptz;

alter table public.profiles
  add column if not exists status_note  text;

create index if not exists profiles_account_status_idx on public.profiles(account_status);

create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status  text,
  p_note    text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Permission denied';
  end if;

  update profiles set
    account_status = p_status,
    is_active      = (p_status = 'approved'),
    status_note    = p_note,
    resigned_at    = case when p_status = 'resigned' then now() else resigned_at end,
    updated_at     = now()
  where id = p_user_id;
end;
$$;

grant execute on function public.admin_set_user_status to authenticated;

-- ══════════════════════════════════════════════
-- STEP 44: Peer Praise
-- ══════════════════════════════════════════════
create table if not exists public.peer_praises (
  id           uuid        primary key default gen_random_uuid(),
  from_user_id uuid        not null references public.profiles(id) on delete cascade,
  to_user_id   uuid        not null references public.profiles(id) on delete cascade,
  emoji        text        not null default '👏',
  message      text        not null,
  is_public    boolean     not null default true,
  created_at   timestamptz not null default now(),
  constraint   no_self_praise check (from_user_id <> to_user_id)
);

create index if not exists peer_praises_to_user_idx   on public.peer_praises(to_user_id);
create index if not exists peer_praises_from_user_idx on public.peer_praises(from_user_id);
create index if not exists peer_praises_created_idx   on public.peer_praises(created_at desc);

alter table public.peer_praises enable row level security;

create policy "read_public_praises" on public.peer_praises
  for select using (is_public = true);

create policy "insert_own_praise" on public.peer_praises
  for insert with check (
    auth.uid() = from_user_id
    and from_user_id <> to_user_id
  );

-- ══════════════════════════════════════════════
-- STEP 45: Centosy Stories
-- ══════════════════════════════════════════════
create table if not exists public.centosy_stories (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  content     text        not null,
  status      text        not null default 'pending' check (status in ('pending','approved','rejected')),
  is_featured boolean     not null default false,
  reviewed_by uuid        references public.profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists stories_status_idx     on public.centosy_stories(status);
create index if not exists stories_created_at_idx on public.centosy_stories(created_at desc);

alter table public.centosy_stories enable row level security;

create policy "read_approved_stories" on public.centosy_stories
  for select using (status = 'approved');

create policy "user_insert_story" on public.centosy_stories
  for insert with check (auth.uid() = user_id);

create policy "admin_all_stories" on public.centosy_stories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ══════════════════════════════════════════════
-- STEP 46: Inspiration Voting
-- ══════════════════════════════════════════════
create table if not exists public.inspiration_votes (
  id          uuid        primary key default gen_random_uuid(),
  voter_id    uuid        not null references public.profiles(id) on delete cascade,
  nominee_id  uuid        not null references public.profiles(id) on delete cascade,
  period      text        not null,
  created_at  timestamptz not null default now(),
  constraint  no_self_vote        check (voter_id <> nominee_id),
  constraint  one_vote_per_period unique (voter_id, period)
);

create index if not exists inspiration_votes_period_idx  on public.inspiration_votes(period);
create index if not exists inspiration_votes_nominee_idx on public.inspiration_votes(nominee_id);

alter table public.inspiration_votes enable row level security;

create policy "read_votes" on public.inspiration_votes
  for select using (true);

create policy "insert_vote" on public.inspiration_votes
  for insert with check (
    auth.uid() = voter_id
    and voter_id <> nominee_id
  );

-- ══════════════════════════════════════════════
-- STEP A1: Lucky Spin
-- ══════════════════════════════════════════════
create table if not exists public.spin_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  prize_type  text        not null, -- 'points' | 'badge' | 'miss' | 'bonus_spin'
  prize_value text        not null,
  prize_label text        not null,
  week_period text        not null, -- e.g. "2026-W24"
  is_free     boolean     not null default false,
  points_cost integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists spin_logs_user_week_idx on public.spin_logs(user_id, week_period);
create index if not exists spin_logs_created_idx   on public.spin_logs(created_at desc);

alter table public.spin_logs enable row level security;

create policy "user_read_own_spins" on public.spin_logs
  for select using (auth.uid() = user_id);

create policy "user_insert_spin" on public.spin_logs
  for insert with check (auth.uid() = user_id);

create policy "admin_read_all_spins" on public.spin_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create or replace function public.check_free_spin(p_week text)
returns boolean language sql security definer set search_path = public
as $$
  select not exists (
    select 1 from spin_logs
    where user_id = auth.uid()
      and week_period = p_week
      and is_free = true
  )
$$;

grant execute on function public.check_free_spin to authenticated;

-- ══════════════════════════════════════════════
-- STEP A2: LC Formula v2 — Rolling 30-day view
-- Công thức: LC = score_30d×1 + min(streak,30)×3 + badges_30d×8 + praises_30d×3 + missions_30d×4
-- ══════════════════════════════════════════════

-- Ensure streak column exists on profiles
alter table public.profiles add column if not exists streak integer not null default 0;

-- Helper: đếm badges cấp trong 30 ngày qua
-- (cần bảng user_badges từ badges.sql đã chạy trước)
create or replace view public.luc_chien_scores_30d as
select
  p.id                                          as user_id,
  p.full_name,
  p.org_group,
  p.department,
  p.score,
  coalesce(p.streak, 0)                         as streak,
  -- Điểm game 30 ngày (từ game_sessions nếu có, fallback về 0)
  coalesce((
    select sum(gs.score)
    from public.game_sessions gs
    where gs.user_id = p.id
      and gs.created_at >= now() - interval '30 days'
      and gs.score_credited = true
  ), 0)::int                                    as score_30d,
  -- Streak capped tại 30
  least(coalesce(p.streak, 0), 30)              as streak_capped,
  -- Badges trong 30 ngày (từ user_badges nếu có)
  coalesce((
    select count(*)
    from public.user_badges ub
    where ub.user_id = p.id
      and ub.awarded_at >= now() - interval '30 days'
  ), 0)::int                                    as badges_30d,
  -- Praises nhận trong 30 ngày
  coalesce((
    select count(*)
    from public.peer_praises pp
    where pp.to_user_id = p.id
      and pp.created_at >= now() - interval '30 days'
  ), 0)::int                                    as praises_30d,
  -- Missions hoàn thành trong 30 ngày
  coalesce((
    select count(*)
    from public.mission_submissions ms
    where ms.user_id = p.id
      and ms.status = 'approved'
      and ms.created_at >= now() - interval '30 days'
  ), 0)::int                                    as missions_30d,
  -- Tổng LC score
  (
    coalesce((
      select sum(gs2.score)
      from public.game_sessions gs2
      where gs2.user_id = p.id
        and gs2.created_at >= now() - interval '30 days'
        and gs2.score_credited = true
    ), 0) * 1
    + least(coalesce(p.streak, 0), 30) * 3
    + coalesce((
        select count(*)
        from public.user_badges ub2
        where ub2.user_id = p.id
          and ub2.awarded_at >= now() - interval '30 days'
      ), 0) * 8
    + coalesce((
        select count(*)
        from public.peer_praises pp2
        where pp2.to_user_id = p.id
          and pp2.created_at >= now() - interval '30 days'
      ), 0) * 3
    + coalesce((
        select count(*)
        from public.mission_submissions ms2
        where ms2.user_id = p.id
          and ms2.status = 'approved'
          and ms2.created_at >= now() - interval '30 days'
      ), 0) * 4
  )::int                                        as lc_score_30d
from public.profiles p
where p.is_active = true;

-- RLS: authenticated users can read the view
grant select on public.luc_chien_scores_30d to authenticated;
