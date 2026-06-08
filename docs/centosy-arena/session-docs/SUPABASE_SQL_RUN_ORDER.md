# SUPABASE SQL — RUN ORDER
**CENTOSY ARENA** | Cập nhật: 2026-06-08

Thứ tự chạy SQL đúng để tránh lỗi foreign key / enum missing.

---

## ⚡ Thứ tự chuẩn (18 bước)

```
Bước 1  →  supabase/schema.sql
Bước 2  →  supabase/role_upgrade.sql          ← phải sau schema.sql
Bước 3  →  supabase/employee_registration.sql ← phải sau role_upgrade.sql
Bước 4  →  supabase/user_status.sql
Bước 5  →  supabase/missions.sql
Bước 6  →  supabase/mission_points_trigger.sql ← PHẢI sau missions.sql
Bước 7  →  supabase/badges.sql
Bước 8  →  supabase/notifications.sql
Bước 9  →  supabase/leaderboard_view.sql
Bước 10 →  supabase/game_session_answer_log.sql
Bước 11 →  supabase/rpc_add_game_score_safe.sql ← PHẢI sau bước 10
Bước 12 →  supabase/peer_praise.sql
Bước 13 →  supabase/stories.sql
Bước 14 →  supabase/inspiration_voting.sql
Bước 15 →  supabase/reward_redemptions.sql
Bước 16 →  supabase/daily_checkins.sql
Bước 17 →  supabase/feedback.sql
Bước 18 →  supabase/game_results.sql            ← optional, legacy
```

**Sau bước 10:** Chạy thêm Admin RLS snippet (xem SUPABASE_REQUIRED_SQL_CHECKLIST.md)

**Sau tất cả:**
```
→  supabase/seed_missions_initial.sql
→  supabase/setup_first_admin_template.sql     (sau khi đăng ký tài khoản admin)
```

---

## ⚠️ Các lỗi phổ biến khi chạy sai thứ tự

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| `type "user_role" does not exist` | Bỏ qua schema.sql | Chạy bước 1 trước |
| `value "manager" is not in enum` | role_upgrade.sql chưa chạy | Chạy bước 2 |
| `column "account_status" does not exist` | employee_registration.sql chưa chạy | Chạy bước 3 |
| `function add_game_score_safe() does not exist` | rpc_add_game_score_safe.sql chưa chạy | Chạy bước 11 |
| `relation "game_sessions" does not exist` | game_session_answer_log.sql chưa chạy | Chạy bước 10 trước |
| `column "score_credited" does not exist` | rpc_add_game_score_safe.sql chưa chạy | Chạy bước 11 |
| `relation "missions" does not exist` | missions.sql chưa chạy | Chạy bước 5 |

---

## Cách chạy trên Supabase Dashboard

1. Vào **Supabase Dashboard → SQL Editor → New query**
2. Paste toàn bộ nội dung file SQL
3. Bấm **Run** (hoặc Ctrl+Enter)
4. Kiểm tra output: `Success. No rows returned.` là OK
5. Nếu lỗi: đọc thông báo lỗi, không chạy tiếp bước sau

---

## Kiểm tra sau khi chạy xong

Vào **Table Editor** và xác nhận các bảng sau tồn tại:
- `profiles` (có cột: role, org_group, office_department, account_status)
- `game_sessions` (có cột: score_credited)
- `game_answers`
- `missions`
- `mission_submissions`
- `notifications`
- `badges` (hoặc `badge_definitions`)
- `peer_praises`
- `daily_checkins`
- `feedback`

---

## Lưu ý quan trọng

- Tất cả SQL files dùng `IF NOT EXISTS` — **idempotent, chạy lại không hỏng**.
- Không cần xóa bảng cũ trước khi chạy.
- Nếu đã chạy schema.sql trên production rồi, chỉ cần chạy từ bước 2 trở đi.
- Sau khi chạy, test ngay bằng cách đăng ký tài khoản mới → kiểm tra trạng thái `pending`.
