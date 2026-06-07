-- ============================================================
-- CENTOSY ARENA — STEP 45: Centosy Stories
-- ============================================================

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

-- Mọi user đọc stories đã approved
create policy "read_approved_stories" on public.centosy_stories
  for select using (status = 'approved');

-- User gửi story của mình
create policy "user_insert_story" on public.centosy_stories
  for insert with check (auth.uid() = user_id);

-- Admin đọc + duyệt tất cả
create policy "admin_all_stories" on public.centosy_stories
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Seed mẫu (optional)
-- insert into public.centosy_stories (user_id, title, content, status, is_featured)
-- values (auth.uid(), 'Ngày đầu đi làm ở Centosy', 'Câu chuyện về ngày đầu tiên...', 'approved', true);
