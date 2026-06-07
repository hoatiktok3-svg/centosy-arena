# SUPABASE AUTH REDIRECT — HƯỚNG DẪN CẤU HÌNH
**CENTOSY ARENA** | Cập nhật: 2026-06-08

Bước bắt buộc để tính năng **Quên mật khẩu** hoạt động trên production.

---

## Tại sao cần cấu hình?

Khi user nhấn "Gửi link đặt lại mật khẩu", Supabase gửi email chứa link dạng:
```
https://centosy-arena.vercel.app/#access_token=xxx&type=recovery
```

Supabase **chặn** link này trừ khi URL đã được thêm vào allowlist trong Dashboard.

---

## Kiểm tra code hiện tại

`ForgotPasswordScreen.tsx` dùng:
```typescript
const redirectTo = `${window.location.origin}${window.location.pathname}`
```

- Local dev:  `http://localhost:5173/`  ✅
- Vercel:     `https://centosy-arena.vercel.app/` ✅

Code này tự động đúng cho cả local lẫn production. **Không cần sửa code.**

---

## Các bước cấu hình trên Supabase Dashboard

### Bước 1 — Cấu hình Site URL

1. Vào **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL** → đặt thành:
   ```
   https://centosy-arena.vercel.app
   ```

### Bước 2 — Thêm Redirect URLs

Trong mục **Redirect URLs**, thêm các URL sau (click **Add URL** mỗi dòng):

```
https://centosy-arena.vercel.app/**
http://localhost:5173/**
http://localhost:5174/**
```

> ⚠️ Dấu `/**` là wildcard pattern — bắt buộc để Supabase nhận các URL con.

### Bước 3 — Lưu thay đổi

Click **Save** ở góc phải. Thay đổi có hiệu lực ngay lập tức.

---

## Kiểm tra tính năng hoạt động đúng

1. Mở app → Login → Click "Quên mật khẩu?"
2. Nhập email đã đăng ký
3. Mở hộp thư → Tìm email từ Supabase
4. Click link trong email → App mở → Tự chuyển sang màn "Đặt mật khẩu mới"
5. Nhập mật khẩu mới → Xác nhận → "Đổi mật khẩu thành công"
6. Login lại bằng mật khẩu mới ✅

---

## Tùy chỉnh email template (khuyến nghị)

1. Vào **Supabase Dashboard → Authentication → Email Templates**
2. Chọn **Reset Password**
3. Chỉnh nội dung email tiếng Việt:
   ```
   Tiêu đề: [Centosy Arena] Đặt lại mật khẩu của bạn
   
   Xin chào,
   
   Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản này.
   
   Nhấn vào link dưới đây để đặt mật khẩu mới (hiệu lực 1 giờ):
   {{ .ConfirmationURL }}
   
   Nếu bạn không yêu cầu, hãy bỏ qua email này.
   
   Đội ngũ Centosy Arena
   ```

---

## Lưu ý bảo mật

- Link reset có hiệu lực **1 giờ** (mặc định Supabase, không thể thay đổi qua code)
- Sau khi dùng xong, link tự hết hạn
- Người dùng được logout tự động sau khi đổi mật khẩu thành công (thiết kế an toàn)
- Không log password hoặc token ở bất kỳ đâu trong code ✅

---

## Nếu dùng custom domain sau này

Thêm domain mới vào Redirect URLs:
```
https://your-custom-domain.com/**
```
