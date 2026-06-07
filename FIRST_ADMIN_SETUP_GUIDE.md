# FIRST ADMIN SETUP — HƯỚNG DẪN TẠO ADMIN ĐẦU TIÊN
**CENTOSY ARENA** | Cập nhật: 2026-06-08

---

## Tại sao cần làm thủ công?

- App dùng **Supabase Auth** — không có seed password mặc định
- Không tạo backdoor admin trong code (vi phạm bảo mật)
- Admin đầu tiên phải đăng ký qua form như nhân viên thường, sau đó được nâng quyền thủ công qua SQL

---

## Quy trình chuẩn (3 bước)

### Bước 1 — Đăng ký tài khoản admin qua app

1. Mở app → Click "Đăng ký tài khoản nhân viên"
2. Điền thông tin:
   - **Họ tên:** tên admin thật (vd: Nguyễn Văn Admin)
   - **SĐT:** số điện thoại admin
   - **Email:** email admin (vd: `admin@centosy.vn`)
   - **Mật khẩu:** mật khẩu mạnh (tối thiểu 8 ký tự, kết hợp chữ + số)
   - **Khối:** Văn phòng → Phòng ban: Hành chính nhân sự
3. Bấm "Đăng ký" → App hiện "Chờ duyệt" — đây là bình thường

### Bước 2 — Nâng quyền admin qua Supabase SQL

Vào **Supabase Dashboard → SQL Editor → New query**, chạy:

```sql
-- ⚠️ Thay YOUR_ADMIN_EMAIL_HERE bằng email thật
UPDATE public.profiles
SET
  role           = 'admin',
  account_status = 'approved',
  is_active      = true,
  org_group      = 'van-phong',
  office_department = 'hanh-chinh-nhan-su',
  full_name      = 'Tên Admin Thật Của Bạn'   -- tùy chỉnh
WHERE email = 'YOUR_ADMIN_EMAIL_HERE';
```

> 📁 Xem file SQL template đầy đủ: `supabase/setup_first_admin_template.sql`

### Bước 3 — Đăng nhập và xác nhận

1. Login lại bằng email admin
2. Vào tab Profile → thấy badge "Quản trị viên" 🛡️
3. Thấy mục "Khu vực quản trị" trong Profile → vào AdminPanel
4. Tab "Chờ duyệt" → duyệt các tài khoản nhân viên đang chờ ✅

---

## Sau khi có admin đầu tiên

Admin có thể tạo admin thứ 2 bằng cách:
1. Duyệt tài khoản bình thường qua AdminPanel
2. Vào Supabase SQL Editor → chạy:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'email_admin_2@centosy.vn';
   ```

---

## Kiểm tra admin hoạt động đúng

| Kiểm tra | Kết quả mong đợi |
|---|---|
| Profile hiện badge Quản trị viên | ✅ |
| Profile có mục "Khu vực quản trị" | ✅ |
| AdminPanel → Tab "Chờ duyệt" hiện user | ✅ |
| Duyệt user → user nhận được `account_status = approved` | ✅ |
| AdminPanel → Tab "Nhân sự" hiện danh sách | ✅ |
| AdminPanel → Tab "Phản hồi" hiện feedback | ✅ |
| TV Mode / Export / Game Monitor hoạt động | ✅ |

---

## Lưu ý bảo mật

- **Không** lưu mật khẩu admin vào file text/Slack/Zalo
- **Không** tạo admin account bằng email chung như `admin@` — dùng email cá nhân
- **Không** tạo tài khoản admin test có mật khẩu yếu như `123456`
- Mỗi người có tài khoản riêng — không dùng chung tài khoản admin
- Nếu muốn reset mật khẩu admin: dùng tính năng "Quên mật khẩu?" trong app
