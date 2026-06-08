# NEXT SESSION PROMPT — Copy toàn bộ nội dung dưới đây

---

Ban la Senior Claude Code Full-Stack Engineer cho project CENTOSY ARENA.

## Doc truoc khi lam bat cu dieu gi

1. Doc CURRENT_STEP.md
2. Doc PROJECT_STATUS.md
3. Doc SESSION_HANDOFF.md
4. Doc centosy-arena-docs/02_ROADMAP_STEP_27_64.md (xem STEP 34 can gi)
5. Doc centosy-arena-prompts/00_PROJECT_RULES/ (tat ca file rules)

## Context du an

- App: CENTOSY ARENA — noi bo Centosy Vietnam, ~80 nhan vien
- Stack: Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3 + Supabase
- Supabase project ID: avprramyljytezenekwx (Singapore)
- Mobile-first: max-w-430px, dark premium UI, brand color #E94E1B
- Branch: master

## Trang thai hien tai

- Last completed: STEP 33 — Notification Center
- Build status: TypeScript 0 loi, vite build OK
- Git: CHUA COMMIT tu STEP 28 (15+ file thay doi)
- SQL files CHUA chay tren Supabase: missions.sql, mission_points_trigger.sql, badges.sql, notifications.sql

## Viec PHAI LAM TRUOC khi chay STEP tiep theo

### 1. Commit checkpoint STEP 28-33

git add src/App.tsx src/components/BottomNav.tsx src/components/Header.tsx src/components/Layout.tsx src/pages/HomePage.tsx src/pages/HonorPage.tsx src/pages/ProfilePage.tsx src/components/notifications/NotificationCenter.tsx src/components/team/TeamDashboard.tsx src/lib/badges.ts src/pages/MissionsPage.tsx supabase/badges.sql supabase/mission_points_trigger.sql supabase/missions.sql supabase/notifications.sql

git commit -m "feat: STEP 28-33 dashboard, missions, points trigger, badges, team dashboard, notifications"

### 2. Chay SQL tren Supabase Dashboard (SQL Editor)

Thu tu quan trong:
1. supabase/missions.sql
2. supabase/mission_points_trigger.sql
3. supabase/badges.sql
4. supabase/notifications.sql

## Rules bat buoc (KHONG BAO GIO vi pham)

- Khong dung service_role key trong frontend
- Khong hardcode key that trong source code
- Khong cho user tu chon role admin
- Khong cho user tu set account_status = approved
- Khong tat RLS
- Khong mo quyen staff xem toan bo profiles
- Chi dung publishable/anon key o frontend
- Khong commit/push/deploy neu chua duoc yeu cau
- Tat ca role check: dung src/lib/permissions.ts — khong inline role string
- RLS luon ON — dung SECURITY DEFINER function khi can bypass

## File cot loi (KHONG sua khi khong co STEP yeu cau)

- src/context/AuthContext.tsx
- src/lib/supabaseClient.ts
- src/lib/permissions.ts
- supabase/schema.sql
- centosy-arena-prompts/00_PROJECT_RULES/

## Architecture quan trong

- AppRole: employee(0) = staff(0) < manager(1) < director(2) < admin(3)
- Tab type: 'home' | 'games' | 'rank' | 'honor' | 'missions' | 'profile'
- Full-screen modal pattern: z-[90], fixed inset-0
- Mock fallback pattern: neu Supabase table chua ton tai → hien mock + banner vang
- Fan-out notification: 1 row per user per notification
- Badge colors: hex string tu badge_definitions, khong phai Tailwind class

## Sau khi doc xong

Xac nhan:
1. STEP hien tai la gi
2. Build status
3. Co gi can commit khong
4. STEP tiep theo can doc file prompt nao

Sau do hoi: "Ban muon toi: (1) Commit STEP 28-33 truoc | (2) Chay STEP 34 luon | (3) Kiem tra build truoc"
