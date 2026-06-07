-- ============================================================
-- CENTOSY ARENA — STEP 44: Peer Praise
-- Gửi lời khen đồng đội
-- ============================================================

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

create index if not exists peer_praises_to_user_idx  on public.peer_praises(to_user_id);
create index if not exists peer_praises_from_user_idx on public.peer_praises(from_user_id);
create index if not exists peer_praises_created_idx   on public.peer_praises(created_at desc);

alter table public.peer_praises enable row level security;

-- Mọi approved user đều đọc được lời khen public
create policy "read_public_praises" on public.peer_praises
  for select using (is_public = true);

-- User gửi lời khen cho người khác (not self)
create policy "insert_own_praise" on public.peer_praises
  for insert with check (
    auth.uid() = from_user_id
    and from_user_id <> to_user_id
  );

-- Seed mẫu (comment ra nếu không muốn)
-- Cần thay UUID thật khi chạy
