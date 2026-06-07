# CENTOSY ARENA — MVP Release Notes
> Version: MVP v1.0 | Build: STEP 34 | Date: 2026-06-07

---

## Tổng quan MVP

**CENTOSY ARENA** là app nội bộ gamification cho ~80 nhân viên Centosy Việt Nam.  
MVP bao gồm các tính năng core từ STEP 26A đến STEP 34.

**URL:** https://centosy-arena.vercel.app  
**Tech:** Vite 5 + React 18 + TypeScript 5 + Tailwind + Supabase  
**Build:** TypeScript 0 lỗi | Vite OK  

---

## Tính năng đã hoàn thành

### 🔐 Auth & Tài khoản (STEP 26A–26F)
- Đăng ký tự phục vụ: nhân viên tự tạo tài khoản, chọn khối/bộ phận
- Quy trình duyệt: Admin xét duyệt / từ chối (kèm lý do)
- Màn hình pending / rejected rõ ràng
- Hệ thống role: admin | director | manager | employee

### 🎯 Role & Phân quyền (STEP 27)
- `src/lib/permissions.ts` — tập trung toàn bộ logic phân quyền
- Hàm `canAccess*()` / `is*()` cho tất cả feature gate
- Không inline role string trong component

### 🏠 Employee Dashboard (STEP 28)
- Trang Home cá nhân hóa: role badge, điểm tổng, rank, quick actions
- Quick actions thay đổi theo role (employee vs manager vs admin)

### 📋 Nhiệm vụ (STEP 29–30)
- Danh sách nhiệm vụ theo khối, deadline, điểm thưởng
- Nhân viên nộp bằng chứng (link + ghi chú)
- Manager/Admin duyệt → trigger tự động cộng điểm vào `profiles.score`
- View `user_score_breakdown` để audit

### 🏅 Huy hiệu & Vinh danh (STEP 31)
- 12 loại badge với icon + màu sắc riêng
- Profile hiển thị badge đã đạt / chưa đạt
- Honor Wall: top nhân viên, admin có thể trao badge thủ công

### 👥 Team Dashboard (STEP 32)
- Manager+: xem KPI đội nhóm, top performer, danh sách thành viên
- Admin: xem toàn công ty hoặc lọc theo khối
- Manager: chỉ xem khối mình

### 🔔 Notification Center (STEP 33)
- Thông báo nội bộ realtime (Supabase polling)
- Badge đỏ trên chuông cho thông báo chưa đọc
- Mark read / mark all read / filter unread
- Manager+: gửi thông báo broadcast

### 👑 Director Dashboard (STEP 34)
- Tổng quan toàn công ty: nhân viên, điểm, nhiệm vụ
- Breakdown hiệu suất 3 khối (Cửa hàng / Kho / Văn phòng) với progress bar
- Top 5 performers toàn công ty
- Cảnh báo pending accounts

---

## Hướng dẫn setup cho QA / Release

### Bước 1 — Deploy (đã có trên Vercel)
URL: https://centosy-arena.vercel.app (tự động deploy từ branch master)

### Bước 2 — Chạy SQL trên Supabase Dashboard
Vào https://supabase.com → project → SQL Editor, chạy theo thứ tự:

```
1. supabase/employee_registration.sql
2. supabase/role_upgrade.sql
3. supabase/missions.sql
4. supabase/mission_points_trigger.sql
5. supabase/badges.sql
6. supabase/notifications.sql
```

### Bước 3 — Tạo tài khoản test
1. Đăng ký 4 tài khoản: admin, director, manager (cua-hang), employee
2. Trong Supabase → bảng `profiles` → set `account_status = 'approved'` + `role` cho từng account
3. Hoặc dùng Admin Panel sau khi có tài khoản admin

### Bước 4 — QA theo checklist
Xem file `centosy-arena-docs/MVP_QA_CHECKLIST.md`

---

## Known issues / Giới hạn MVP

| # | Vấn đề | Mức độ | Plan |
|---|--------|--------|------|
| 1 | Game quiz chưa lưu lịch sử vào DB (dùng mock) | Medium | STEP 36+ |
| 2 | Chunk JS 538KB — chưa code-split | Low | STEP cuối |
| 3 | Không có real-time notification push (chỉ fetch khi mở app) | Low | STEP 36+ |
| 4 | Honor Wall top nhân viên dùng mock data một phần | Medium | STEP 36+ |
| 5 | Không có tính năng profile edit | Low | Out of MVP scope |

---

## Files SQL cần chạy thủ công

| File | Nội dung | Step |
|------|---------|------|
| `supabase/employee_registration.sql` | Thêm cột org_group, office_department, account_status vào profiles | 26A |
| `supabase/role_upgrade.sql` | Thêm role director, manager vào enum | 27 |
| `supabase/missions.sql` | Bảng missions + mission_submissions + RLS + 5 seed | 29 |
| `supabase/mission_points_trigger.sql` | Trigger auto cộng điểm khi approve + view user_score_breakdown | 30 |
| `supabase/badges.sql` | Bảng badge_definitions + user_badges + RLS + 12 badge seeds | 31 |
| `supabase/notifications.sql` | Bảng notifications + RLS + broadcast_notification() function | 33 |

---

## Liên hệ

- Kỹ thuật: anh Hoá (dev lead)
- App: CENTOSY ARENA internal
