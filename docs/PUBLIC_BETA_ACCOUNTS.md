# CENTOSY ARENA — Public Beta Test Accounts

---

## 1. Mục tiêu

Tạo 5–10 tài khoản test nội bộ trước khi public beta với nhân sự thật.
Toàn bộ tài khoản do Admin tạo thủ công — không bật đăng ký tự do.

---

## 2. Nguyên tắc

- Không bật Sign Up tự do trên Supabase (Authentication → Settings → tắt "Enable Sign Ups").
- Admin tạo từng tài khoản thủ công trong Supabase Dashboard.
- Mỗi tài khoản phải có profile trong `public.profiles` (trigger `handle_new_user` tự tạo — kiểm tra sau khi tạo user).
- Role mặc định là `staff`. Chỉ tài khoản admin mới đặt `role = 'admin'`.
- Không gửi mật khẩu chung qua nhóm chat khi chạy beta thật.

---

## 3. Danh sách tài khoản test đề xuất

> Thay email bằng email nội bộ thật của Centosy trước khi tạo.
> Cột "Mật khẩu tạm" chỉ dùng cho test — yêu cầu đổi sau lần đăng nhập đầu.

| STT | Họ tên               | Email                    | Phòng ban  | Role  | Mật khẩu tạm   | Ghi chú              |
|-----|----------------------|--------------------------|------------|-------|----------------|----------------------|
| 1   | Admin Centosy        | admin@centosy.vn         | van-phong  | admin | Arena@2026!    | Tài khoản quản trị   |
| 2   | Nhân viên CH 01      | cuahang01@centosy.vn     | cua-hang   | staff | Arena@2026!    | Test Cửa hàng        |
| 3   | Nhân viên CH 02      | cuahang02@centosy.vn     | cua-hang   | staff | Arena@2026!    | Test Cửa hàng        |
| 4   | Nhân viên Kho 01     | kho01@centosy.vn         | kho        | staff | Arena@2026!    | Test Kho             |
| 5   | Nhân viên TMĐT 01    | tmdt01@centosy.vn        | tmdt       | staff | Arena@2026!    | Test TMĐT            |
| 6   | Nhân viên TMĐT 02    | tmdt02@centosy.vn        | tmdt       | staff | Arena@2026!    | Test TMĐT            |
| 7   | Nhân viên KDTT 01    | kdtt01@centosy.vn        | kdtt       | staff | Arena@2026!    | Test KDTT            |
| 8   | Nhân viên VP 01      | vanphong01@centosy.vn    | van-phong  | staff | Arena@2026!    | Test Văn phòng       |

**Giá trị phòng ban hợp lệ (dùng trong DB):**

| Hiển thị    | Giá trị trong DB |
|-------------|-----------------|
| Văn phòng   | `van-phong`     |
| Cửa hàng    | `cua-hang`      |
| Kho         | `kho`           |
| TMĐT        | `tmdt`          |
| KDTT        | `kdtt`          |

---

## 4. Cách tạo tài khoản trên Supabase Dashboard

Làm lần lượt cho từng tài khoản:

**Bước 1 — Vào Supabase Dashboard**
- Truy cập: https://supabase.com/dashboard
- Chọn project CENTOSY ARENA.

**Bước 2 — Vào Authentication**
- Menu trái → **Authentication** → **Users**.

**Bước 3 — Tạo user mới**
- Bấm nút **Add user** (góc trên phải).
- Chọn **Create new user**.

**Bước 4 — Nhập thông tin**
- **Email:** nhập email theo bảng trên (ví dụ `cuahang01@centosy.vn`).
- **Password:** nhập mật khẩu tạm (ví dụ `Arena@2026!`).
- Tick **Auto Confirm User** để bỏ qua bước xác nhận email (phù hợp cho test nội bộ).
- Bấm **Create User**.

**Bước 5 — Kiểm tra profile tự sinh**
- Vào **Table Editor** → bảng `public.profiles`.
- Tìm dòng có `email` vừa tạo.
- Nếu có dòng → trigger `handle_new_user` đã chạy đúng.
- Nếu không có → chạy SQL insert thủ công ở mục 5B bên dưới.

**Bước 6 — Cập nhật thông tin profile**
- Chạy SQL ở mục 5A để update `full_name`, `department`, `title`, `role`.

**Bước 7 — Lặp lại cho từng user**
- Làm lại bước 3–6 cho mỗi tài khoản trong danh sách.

---

## 5. SQL cập nhật profile

### 5A — Update profile đã tồn tại

Chạy trong **Supabase SQL Editor**. Thay `<email>` bằng email thật:

```sql
-- Cập nhật profile theo email
-- Chạy từng dòng cho từng user

UPDATE public.profiles
SET
  full_name  = 'Admin Centosy',
  department = 'van-phong',
  title      = 'Quản trị viên',
  role       = 'admin',
  is_active  = true
WHERE email = 'admin@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên CH 01',
  department = 'cua-hang',
  title      = 'Tư vấn bán hàng',
  role       = 'staff',
  is_active  = true
WHERE email = 'cuahang01@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên CH 02',
  department = 'cua-hang',
  title      = 'Tư vấn bán hàng',
  role       = 'staff',
  is_active  = true
WHERE email = 'cuahang02@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên Kho 01',
  department = 'kho',
  title      = 'Nhân viên kho',
  role       = 'staff',
  is_active  = true
WHERE email = 'kho01@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên TMĐT 01',
  department = 'tmdt',
  title      = 'Nhân viên TMĐT',
  role       = 'staff',
  is_active  = true
WHERE email = 'tmdt01@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên TMĐT 02',
  department = 'tmdt',
  title      = 'Nhân viên TMĐT',
  role       = 'staff',
  is_active  = true
WHERE email = 'tmdt02@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên KDTT 01',
  department = 'kdtt',
  title      = 'Nhân viên KDTT',
  role       = 'staff',
  is_active  = true
WHERE email = 'kdtt01@centosy.vn';

UPDATE public.profiles
SET
  full_name  = 'Nhân viên VP 01',
  department = 'van-phong',
  title      = 'Nhân viên văn phòng',
  role       = 'staff',
  is_active  = true
WHERE email = 'vanphong01@centosy.vn';
```

### 5B — Insert profile thủ công (nếu trigger không tạo tự động)

Dùng khi profile không xuất hiện sau khi tạo user. Thay `<user_id>` bằng UUID lấy từ **Authentication → Users**:

```sql
-- Thay <user_id> bằng UUID thật từ Authentication → Users
INSERT INTO public.profiles (id, email, full_name, department, title, role, is_active, score)
VALUES (
  '<user_id>',
  'cuahang01@centosy.vn',
  'Nhân viên CH 01',
  'cua-hang',
  'Tư vấn bán hàng',
  'staff',
  true,
  0
)
ON CONFLICT (id) DO NOTHING;
```

### 5C — Kiểm tra toàn bộ profile sau khi tạo

```sql
-- Xem nhanh danh sách profile đã tạo
SELECT id, email, full_name, department, role, is_active
FROM public.profiles
ORDER BY role DESC, department, full_name;
```

---

## 6. Checklist kiểm tra sau khi tạo

Làm với ít nhất 1 tài khoản admin và 1 tài khoản staff:

- [ ] Đăng nhập được bằng email + mật khẩu tạm
- [ ] Tên hiển thị đúng trong Profile Page
- [ ] Phòng ban hiển thị đúng
- [ ] Badge ADMIN hoặc NHÂN VIÊN đúng theo role
- [ ] Staff không thấy nút Admin Panel
- [ ] Admin thấy nút Admin Panel và mở được
- [ ] Admin Panel hiển thị đúng số nhân sự / active / đã chơi
- [ ] Chơi game "Khách hàng khó tính" xong → thấy "Đã lưu điểm vào BXH"
- [ ] Mở Supabase → `public.game_results` → có dòng mới với `user_id` đúng
- [ ] Rank Page hiển thị user vừa chơi với điểm thật
- [ ] Đăng xuất và đăng nhập lại vẫn giữ đúng thông tin

---

## 7. Lưu ý bảo mật

- **Không gửi mật khẩu** qua nhóm Zalo/Messenger chung.
- Gửi riêng cho từng người hoặc dùng kênh nội bộ bảo mật.
- Sau khi beta xong, yêu cầu từng nhân sự đổi mật khẩu.
- **Không bật Sign Up tự do** (Authentication → Settings → Disable Sign Ups).
- **Không dùng service_role key ở frontend** — chỉ dùng `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Không commit file `.env.local` lên git (đã có trong `.gitignore`).
- Khi tạo tài khoản cho nhân sự thật (80 người), cân nhắc dùng Supabase Admin API với script riêng — không làm thủ công từng người.

---

## 8. Sau khi beta nội bộ

Khi 5–10 người test xong và không có lỗi nghiêm trọng:

1. Mở rộng cho toàn bộ 80 nhân sự (cần script bulk import).
2. Cập nhật `SESSION_HANDOFF.md` với trạng thái beta.
3. Tiến hành STEP 23F — QA public beta nội bộ.
4. Tiến hành STEP 23G — Deploy public test.
