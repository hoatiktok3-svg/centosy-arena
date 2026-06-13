-- ============================================================
-- CENTOSY ARENA — Lucky Spin (STEP A1)
-- Vòng Quay May Mắn: 1 lượt miễn phí/tuần, đổi điểm mua thêm
-- ============================================================

create table if not exists public.spin_logs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  prize_type  text        not null, -- 'points' | 'badge' | 'miss' | 'bonus_spin'
  prize_value text        not null, -- e.g. "+50", "badge_gold", "miss", "+1_spin"
  prize_label text        not null, -- human-readable label
  week_period text        not null, -- e.g. "2026-W24"
  is_free     boolean     not null default false,
  points_cost integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists spin_logs_user_week_idx on public.spin_logs(user_id, week_period);
create index if not exists spin_logs_created_idx   on public.spin_logs(created_at desc);

alter table public.spin_logs enable row level security;

-- User xem lịch sử của mình
create policy "user_read_own_spins" on public.spin_logs
  for select using (auth.uid() = user_id);

-- User tạo spin (server-side validate qua RPC)
create policy "user_insert_spin" on public.spin_logs
  for insert with check (auth.uid() = user_id);

-- Admin xem tất cả
create policy "admin_read_all_spins" on public.spin_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ── RPC: Kiểm tra còn lượt quay miễn phí không ──────────────
create or replace function public.check_free_spin(p_week text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select not exists (
    select 1 from spin_logs
    where user_id = auth.uid()
      and week_period = p_week
      and is_free = true
  )
$$;

grant execute on function public.check_free_spin to authenticated;
