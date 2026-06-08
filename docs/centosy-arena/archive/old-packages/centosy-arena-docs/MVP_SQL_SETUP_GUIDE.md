# CENTOSY ARENA — SQL Setup Guide
> Dành cho Admin / DevOps khi deploy lên môi trường mới

---

## Thứ tự bắt buộc

Chạy đúng thứ tự dưới đây. Sai thứ tự có thể gây lỗi foreign key hoặc enum.

---

## Bước 0 — Schema gốc (chỉ cần 1 lần khi tạo DB mới)

Nếu là DB mới hoàn toàn:
```sql
-- Chạy file: supabase/schema.sql
```
Nếu đã có DB từ trước → bỏ qua bước này, chạy từ Bước 1.

---

## Bước 1 — Employee Registration (STEP 26A)

**File:** `supabase/employee_registration.sql`

Thêm vào bảng `profiles`:
- Cột `org_group` (text): 'cua-hang' | 'kho' | 'van-phong'
- Cột `office_department` (text): 'tmdt' | 'kdtt' | 'mua-hang' | 'ke-toan' | 'hanh-chinh-nhan-su' | 'marketing' | 'giam-doc'
- Cột `account_status` (text): 'pending' | 'approved' | 'rejected'
- Cột `rejected_reason` (text, nullable)
- RLS policy: nhân viên chỉ đọc profile mình, admin đọc/ghi tất cả

---

## Bước 2 — Role Upgrade (STEP 27)

**File:** `supabase/role_upgrade.sql`

Thêm vào enum `user_role`:
- 'manager'
- 'director'
- 'admin' (nếu chưa có)

Cập nhật RLS policies để manager/director có thêm quyền đọc.

---

## Bước 3 — Missions (STEP 29)

**File:** `supabase/missions.sql`

Tạo bảng:
- `missions`: id, title, description, org_group, points, deadline, status, created_by
- `mission_submissions`: id, mission_id, user_id, evidence_url, note, status, reviewed_by, reviewed_at
- RLS: nhân viên nộp bài, manager duyệt trong khối mình, admin duyệt tất cả
- Seed: 5 nhiệm vụ mẫu

---

## Bước 4 — Mission Points Trigger (STEP 30)

**File:** `supabase/mission_points_trigger.sql`

Tạo:
- Trigger `after_mission_approve`: SECURITY DEFINER, tự động `UPDATE profiles SET score = score + points` khi `mission_submissions.status` chuyển sang 'approved'
- Trigger `after_mission_reject`: trừ điểm nếu đã cộng trước đó (optional)
- View `user_score_breakdown`: tổng hợp điểm game + điểm nhiệm vụ theo user

---

## Bước 5 — Badges (STEP 31)

**File:** `supabase/badges.sql`

Tạo bảng:
- `badge_definitions`: id, name, description, icon, color, criteria
- `user_badges`: id, user_id, badge_id, awarded_by, awarded_at, note
- RLS: user đọc badge của mình, manager+ trao badge
- Seed: 12 badge definitions

---

## Bước 6 — Notifications (STEP 33)

**File:** `supabase/notifications.sql`

Tạo bảng:
- `notifications`: id, user_id, title, body, type, is_read, created_at
- RLS: user chỉ đọc thông báo của mình, manager+ tạo thông báo
- Function `broadcast_notification(title, body, type)`: gửi thông báo đến tất cả approved users
- Seed: 2–3 thông báo mẫu

---

## Kiểm tra sau khi chạy SQL

```sql
-- Xem bảng đã tạo
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Kết quả mong đợi có: profiles, missions, mission_submissions, badge_definitions, user_badges, notifications
```

---

## Troubleshooting

| Lỗi | Nguyên nhân | Fix |
|-----|------------|-----|
| `type "user_role" already exists` | enum đã có → bỏ qua lệnh CREATE TYPE, chỉ chạy ALTER TYPE | Chỉ chạy phần ALTER |
| `column "org_group" already exists` | đã chạy bước này rồi | Bỏ qua |
| `permission denied for table profiles` | RLS chưa đúng hoặc dùng anon key | Dùng service_role key hoặc chạy qua SQL Editor |
| Trigger không chạy | `SECURITY DEFINER` cần owner của function là postgres | Kiểm tra role của function |
