# SUPABASE REQUIRED SQL — CHECKLIST
**CENTOSY ARENA** | Cập nhật: 2026-06-08

Checklist này liệt kê 18 SQL files cần chạy trên Supabase.
**Quan trọng:** Chạy đúng thứ tự — xem `SUPABASE_SQL_RUN_ORDER.md`

---

## Nhóm 1 — Base (BẮT BUỘC, chạy trước hết)

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| B1 | `supabase/schema.sql` | Bảng profiles, RLS cơ bản, trigger handle_new_user, is_admin() | ☐ |
| B2 | `supabase/role_upgrade.sql` | Thêm role: employee, manager, director vào enum | ☐ |
| B3 | `supabase/employee_registration.sql` | Thêm org_group, office_department, account_status, pending trigger | ☐ |
| B4 | `supabase/user_status.sql` | Thêm resigned_at, set_user_status() RPC | ☐ |

---

## Nhóm 2 — Game Engine (BẮT BUỘC cho game, chạy trước game features)

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| G1 | `supabase/game_session_answer_log.sql` | Bảng game_sessions + game_answers | ☐ |
| G2 | `supabase/rpc_add_game_score_safe.sql` | RPC add_game_score_safe, cột score_credited | ☐ |

⚠️ G2 phải chạy SAU G1.

---

## Nhóm 3 — Mission System

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| M1 | `supabase/missions.sql` | Bảng missions + mission_submissions | ☐ |
| M2 | `supabase/mission_points_trigger.sql` | Trigger tự cộng điểm khi duyệt mission | ☐ |

⚠️ M2 phải chạy SAU M1.

---

## Nhóm 4 — Culture & Social

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| C1 | `supabase/badges.sql` | Bảng user_badges + badge_definitions, seed badge types | ☐ |
| C2 | `supabase/notifications.sql` | Bảng notifications | ☐ |
| C3 | `supabase/peer_praise.sql` | Bảng peer_praises | ☐ |
| C4 | `supabase/stories.sql` | Bảng centosy_stories | ☐ |
| C5 | `supabase/inspiration_voting.sql` | Bảng inspiration_nominations + inspiration_votes | ☐ |
| C6 | `supabase/daily_checkins.sql` | Bảng daily_checkins | ☐ |
| C7 | `supabase/feedback.sql` | Bảng feedback | ☐ |

---

## Nhóm 5 — Admin Tools

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| A1 | `supabase/leaderboard_view.sql` | View leaderboard_view (tăng performance) | ☐ |
| A2 | `supabase/reward_redemptions.sql` | Bảng reward_redemptions | ☐ |

---

## Nhóm 6 — Optional/Legacy

| # | File | Mục đích | Đã chạy? |
|---|---|---|---|
| L1 | `supabase/game_results.sql` | Bảng game_results CŨ (backward compat) — không bắt buộc | ☐ |

---

## Admin RLS bổ sung (snippet — chạy sau G1)

```sql
-- Xem DEPLOY_RUNBOOK.md → Mục A2
-- Cho phép admin/manager xem tất cả game sessions trong Game Monitor
CREATE POLICY "admin select all sessions"
  ON game_sessions FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('admin', 'director', 'manager')
  );

CREATE POLICY "admin select all answers"
  ON game_answers FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('admin', 'director', 'manager')
  );
```

---

## Seed bổ sung (chạy sau tất cả)

- `supabase/seed_missions_initial.sql` — 5 missions khởi đầu
- `supabase/setup_first_admin_template.sql` — tạo tài khoản admin đầu tiên
