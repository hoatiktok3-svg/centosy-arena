-- ============================================================
-- CENTOSY ARENA — STEP 37: Feedback / Bug Report
-- Chạy file này trên Supabase SQL Editor
-- ============================================================

-- Bảng feedbacks
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

-- Index để admin query nhanh
create index if not exists feedbacks_user_id_idx   on public.feedbacks(user_id);
create index if not exists feedbacks_created_at_idx on public.feedbacks(created_at desc);

-- RLS
alter table public.feedbacks enable row level security;

-- User chỉ đọc/tạo feedback của mình
create policy "user_insert_own_feedback" on public.feedbacks
  for insert with check (auth.uid() = user_id);

create policy "user_read_own_feedback" on public.feedbacks
  for select using (auth.uid() = user_id);

-- Admin đọc tất cả và update (resolve)
create policy "admin_all_feedbacks" on public.feedbacks
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed: vài feedback mẫu (optional — comment ra nếu không muốn seed)
-- insert into public.feedbacks (user_id, type, severity, screen, message)
-- values
--   (auth.uid(), 'bug',        'medium', 'Nhiệm vụ',   'Nút nộp nhiệm vụ đôi khi bị mờ trên iPhone SE'),
--   (auth.uid(), 'suggestion', 'low',    'Bảng xếp hạng', 'Muốn xem rank theo tuần riêng');
