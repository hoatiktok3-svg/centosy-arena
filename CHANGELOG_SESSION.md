# CHANGELOG SESSION — CENTOSY ARENA
> Session: STEP 28-33 | Date: 2026-06-07

---

## STEP 28 — Employee Personal Dashboard
**Files:** src/pages/HomePage.tsx, src/App.tsx
- Viet lai toan bo HomePage.tsx
- Personal Info Card: ten, email, role badge (tu permissions.ts), orgGroup, officeDepartment
- Score Card: fetch tu game_results + get_leaderboard() RPC, hien rank ca nhan
- Quick Actions: 4 nut (game/rank/honor + admin|manager conditional)
- orgGroupLabel → officeDeptLabel → legacyDept fallback chain
- App.tsx: them onGoToRank, onGoToProfile props cho HomePage

## STEP 29 — Missions Foundation
**Files:** supabase/missions.sql, src/pages/MissionsPage.tsx, src/components/BottomNav.tsx, src/components/Layout.tsx, src/App.tsx
- SQL: bang missions + mission_submissions, UNIQUE(mission_id, user_id), RLS, 5 seed missions
- MissionsPage: 3 inner tab (Nhiem vu / Cua toi / Duyet)
- SubmitSheet: employee nop bai, hien diem se cong, xu ly unique violation
- ManageSheet: manager duyet (approve/reject) + hien lich su
- Filter theo org_group: Tat ca / Cua hang / Kho / Van phong
- BottomNav: them tab missions (6 tabs tong), giam icon/label size de fit 430px
- Tab type cap nhat: them 'missions'

## STEP 30 — Points Approval Trigger
**Files:** supabase/mission_points_trigger.sql
- PostgreSQL trigger AFTER UPDATE tren mission_submissions
- award_mission_points() SECURITY DEFINER function
- pending/rejected → approved: CONG diem vao profiles.score
- approved → rejected/pending: TRU diem (GREATEST 0)
- SQL View: user_score_breakdown (tong diem tu nhieu nguon)
- UI: approve button hien "+Nd", approved state ro rang hon

## STEP 31 — Badges + Recognition Wall
**Files:** supabase/badges.sql, src/lib/badges.ts, src/pages/HonorPage.tsx, src/pages/ProfilePage.tsx
- SQL: bang badge_definitions (12 loai badge) + user_badges, RLS, seed data
- badges.ts: BADGE_CONFIG centralized, getBadge() voi legacy fallback, PROFILE_BADGE_KEYS
- HonorPage: fetch real data tu user_badges JOIN profiles JOIN badge_definitions
- HonorPage: mock fallback neu chua co bang + banner vang thong bao
- HonorPage: AwardSheet cho admin trao badge
- ProfilePage: fetch real user_badges, xoa BADGE_META mock cu
- Fix: resolveColor() xu ly hex string (#xxxxxx) khong phai chi Tailwind class

## STEP 32 — Team Dashboard
**Files:** src/components/team/TeamDashboard.tsx, src/pages/ProfilePage.tsx
- TeamDashboard full-screen modal (z-[90])
- 4 KPI cards: Thanh vien / Tong diem / Diem TB / Nhiem vu xong
- Top performer gold card
- Member list sortable (Diem / NV / Game)
- Avatar mau theo role, rank vang#1/bac#2/dong#3
- Admin: GROUP_FILTERS tabs xem tat ca khoi
- Manager: chi xem khoi minh (defaultGroup = currentUser.orgGroup)
- ProfilePage: them Team Dashboard card (hien voi manager+)

## STEP 33 — Notification Center
**Files:** supabase/notifications.sql, src/components/notifications/NotificationCenter.tsx, src/components/Header.tsx, src/components/Layout.tsx, src/App.tsx
- SQL: bang notifications (fan-out model), RLS, broadcast_notification() SECURITY DEFINER
- broadcast_notification(): validate role → INSERT 1 row moi user phu hop → return count
- NotificationCenter: fetch thong bao, filter all/unread, mark read, mark all read
- SendSheet: manager+ gui thong bao den tung khoi hoac tat ca
- TYPE_ICON / TYPE_LABEL / TYPE_COLOR cho 5 loai thong bao
- Header: unreadCount badge (do khi > 0), "99+" display, onBellClick prop
- Layout: forward unreadCount + onBellClick len Header
- App.tsx: fetch unread count khi currentUser thay doi, render NotificationCenter overlay

---

## Tong ket session

- 6 STEPs hoan thanh (28-33)
- 15+ files da thay doi/tao
- TypeScript: 0 loi
- Build: OK
- RLS: luon ON, SECURITY DEFINER dung dung cho triggers + RPC
- CHUA COMMIT — can commit toan bo truoc STEP 34

---

## Loi da gap va sua

1. resolveColor() trong HonorPage: khong xu ly duoc hex string → them check startsWith('#')
2. BADGE_META con lai trong ProfilePage sau khi chuyen sang badges.ts → da xoa
3. Write tool "File has not been read yet" → phai Read truoc hoac dung node script
4. Node script co van de encoding voi ky tu tieng Viet + backtick trong heredoc

---

## SQL can chay tren Supabase Dashboard

1. supabase/missions.sql
2. supabase/mission_points_trigger.sql
3. supabase/badges.sql
4. supabase/notifications.sql
