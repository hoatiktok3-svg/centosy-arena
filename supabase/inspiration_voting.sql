-- ============================================================
-- CENTOSY ARENA — STEP 46: Weekly Inspiration Voting
-- Bình chọn nhân viên truyền cảm hứng tuần
-- ============================================================

create table if not exists public.inspiration_votes (
  id          uuid        primary key default gen_random_uuid(),
  voter_id    uuid        not null references public.profiles(id) on delete cascade,
  nominee_id  uuid        not null references public.profiles(id) on delete cascade,
  period      text        not null, -- e.g. "2026-W23"
  created_at  timestamptz not null default now(),
  constraint  no_self_vote   check (voter_id <> nominee_id),
  constraint  one_vote_per_period unique (voter_id, period)
);

create index if not exists inspiration_votes_period_idx   on public.inspiration_votes(period);
create index if not exists inspiration_votes_nominee_idx  on public.inspiration_votes(nominee_id);

alter table public.inspiration_votes enable row level security;

-- Mọi active user đọc votes (để hiện top 3)
create policy "read_votes" on public.inspiration_votes
  for select using (true);

-- User bình chọn (không tự bình chọn bản thân — CHECK constraint enforce)
create policy "insert_vote" on public.inspiration_votes
  for insert with check (
    auth.uid() = voter_id
    and voter_id <> nominee_id
  );
