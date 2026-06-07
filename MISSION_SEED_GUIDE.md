# MISSION SEED GUIDE — HƯỚNG DẪN TẠO NHIỆM VỤ BAN ĐẦU
**CENTOSY ARENA** | Cập nhật: 2026-06-08 | P0-03 / J5

---

## Tại sao cần seed missions?

App mới deploy → bảng `missions` trống → tab "Nhiệm vụ" hiển thị rỗng.  
File `seed_missions_initial.sql` tạo sẵn 5 nhiệm vụ mặc định để app có nội dung ngay từ đầu.

---

## 5 Mission mặc định

| # | Tên | Loại | Điểm | Cần duyệt? |
|---|---|---|---|---|
| 1 | Check-in hôm nay | `daily_checkin` | 10đ | ❌ Tự động |
| 2 | Hoàn thành quiz sản phẩm | `complete_quiz` | 20đ | ❌ Tự động |
| 3 | Gửi ý tưởng cải tiến | `submit_idea` | 30đ | ✅ Admin duyệt |
| 4 | Gửi lời khen đồng nghiệp | `peer_praise` | 15đ | ❌ Tự động |
| 5 | Chia sẻ câu chuyện khách hàng | `share_story` | 25đ | ✅ Admin duyệt |

---

## Cách chạy

### Bước 1 — Đảm bảo đã chạy đúng thứ tự

Trước khi seed, phải chạy:
1. `supabase/missions.sql` — tạo bảng `missions` + `mission_submissions`
2. `supabase/mission_points_trigger.sql` — trigger tự cộng điểm khi duyệt

### Bước 2 — Chạy seed

Vào **Supabase Dashboard → SQL Editor → New query**, paste và chạy:

```
supabase/seed_missions_initial.sql
```

Kết quả mong đợi: `Success. No rows returned.`

### Bước 3 — Xác nhận

Chạy query kiểm tra:
```sql
SELECT id, title, mission_type, points, is_active
FROM public.missions
ORDER BY points ASC;
```

Phải thấy đủ 5 dòng.

---

## An toàn khi chạy lại

File dùng `ON CONFLICT (title) DO NOTHING` — chạy lại nhiều lần **không tạo trùng**.

---

## Thêm mission mới sau này

Có 2 cách:

### Cách 1: Qua AdminPanel trong app
1. Vào Profile → Khu vực quản trị → Tab "Nhiệm vụ"
2. Click "Thêm nhiệm vụ"
3. Điền thông tin → Lưu

### Cách 2: Qua SQL Editor
```sql
INSERT INTO public.missions (title, description, mission_type, points, is_active, requires_approval)
VALUES (
  'Tên nhiệm vụ mới',
  'Mô tả chi tiết...',
  'custom_type',
  50,     -- điểm thưởng
  true,   -- hiển thị
  true    -- cần admin duyệt
);
```

---

## Cấu trúc bảng missions (tham khảo)

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | uuid | PK tự động |
| `title` | text | Tên nhiệm vụ (UNIQUE) |
| `description` | text | Mô tả chi tiết |
| `mission_type` | text | Loại: daily_checkin, complete_quiz, submit_idea, peer_praise, share_story... |
| `points` | int | Điểm thưởng khi hoàn thành |
| `is_active` | bool | Có hiển thị cho user không |
| `max_submissions_per_user` | int | Số lần tối đa/ngày (default 1) |
| `requires_approval` | bool | Có cần admin duyệt không |

---

## Luồng duyệt mission (requires_approval = true)

```
User submit → mission_submissions.status = 'pending'
                          │
                     Admin duyệt
                          │
             status = 'approved'
                          │
              trigger mission_points_trigger
                          │
              profiles.score += mission.points ✅
```

---

## Lưu ý

- Missions với `requires_approval = false` nên được trigger tự động từ code (không cần admin).
- Check-in được xử lý bởi `daily_checkins` table — mission `daily_checkin` chỉ để hiển thị, điểm cộng qua `saveGameResultSafe` hoặc trigger riêng.
- Nếu thấy tab Nhiệm vụ vẫn trống sau khi seed → kiểm tra RLS policy trên bảng `missions`.
