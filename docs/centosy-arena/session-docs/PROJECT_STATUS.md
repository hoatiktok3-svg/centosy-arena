# PROJECT STATUS — CENTOSY ARENA
> Cập nhật: Sau STEP 33 | Build: OK | Git: 6 step chưa commit

---

## Tên project
**CENTOSY ARENA** — App nội bộ gamification cho Công ty TNHH Centosy Việt Nam (~80 nhân viên)

## Mục tiêu app
Mobile-first internal app: game quiz kiến thức sản phẩm, bảng xếp hạng, nhiệm vụ phòng ban, vinh danh nhân viên, thông báo nội bộ.

## Tech stack
- Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3
- Supabase Auth + Database (project ID: avprramyljytezenekwx, Singapore)
- Vercel: https://centosy-arena.vercel.app
- Mobile-first, max-w-430px, dark UI, brand color #E94E1B

---

## Roadmap đang dùng
centosy-arena-docs/02_ROADMAP_STEP_27_64.md — STEP 27 đến 64

## Steps đã hoàn thành (chưa commit)
| Step | Nội dung | Status |
|---|---|---|
| STEP 27 | Role permission system | committed d9ebca7 |
| STEP 28 | Employee Dashboard | DONE, chưa commit |
| STEP 29 | Missions Foundation | DONE, chưa commit |
| STEP 30 | Admin Mission Review + Points | DONE, chưa commit |
| STEP 31 | Badges + Recognition Wall | DONE, chưa commit |
| STEP 32 | Team Dashboard | DONE, chưa commit |
| STEP 33 | Notification Center | DONE, chưa commit |

**Last committed: STEP 27 (d9ebca7)**
**Next step: STEP 34**

---

## Trạng thái build
- tsc --noEmit → 0 lỗi
- vite build → OK ~2.1s (chunk warning 529KB — không phải lỗi)

## Trạng thái git
- Branch: master
- 7 file modified + 14 untracked — CHƯA COMMIT từ STEP 28-33
- ⚠️ PHẢI COMMIT TRƯỚC KHI CHẠY STEP 34

---

## SQL cần chạy thủ công (Supabase Dashboard)
1. supabase/employee_registration.sql (STEP 26A)
2. supabase/role_upgrade.sql (STEP 27)
3. supabase/missions.sql (STEP 29)
4. supabase/mission_points_trigger.sql (STEP 30)
5. supabase/badges.sql (STEP 31)
6. supabase/notifications.sql (STEP 33)

## Thư mục KHÔNG được đụng mạnh
- src/context/AuthContext.tsx
- src/lib/supabaseClient.ts
- supabase/schema.sql
- centosy-arena-prompts/00_PROJECT_RULES/
- public/
