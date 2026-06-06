# CENTOSY ARENA — Vercel Deploy Guide

---

## 1. Điều kiện trước deploy

Xác nhận tất cả mục dưới đây trước khi tiếp tục:

- [ ] `npm run build` chạy thành công trên máy local, không có lỗi TypeScript
- [ ] Supabase Auth đăng nhập được (đã chạy `schema.sql`)
- [ ] Game "Khách hàng khó tính" lưu điểm được (`game_results.sql` đã chạy)
- [ ] Rank Page đọc điểm thật được (`leaderboard_view.sql` đã chạy)
- [ ] Không có `service_role` key trong source code
- [ ] Có `VITE_SUPABASE_URL` — lấy từ Supabase → Project Settings → API → Project URL
- [ ] Có `VITE_SUPABASE_PUBLISHABLE_KEY` — lấy từ Supabase → Project Settings → API → anon/public key
- [ ] Ít nhất 1 tài khoản admin và 1 tài khoản staff đã tạo trên Supabase

---

## 2. Đẩy code lên GitHub

> Nếu đã có git commit rồi (từ STEP 24B), bỏ qua bước init và commit, chỉ cần làm bước 4–6.

**Bước 1 — Tạo repo trên GitHub**
- Vào https://github.com → New repository
- Tên repo: `centosy-arena` (hoặc tên tự chọn)
- Chọn **Private** (không public code nội bộ)
- **Không** tick "Add a README file" (đã có code rồi)
- Bấm **Create repository**

**Bước 2 — Kết nối repo local với GitHub**

Mở terminal trong thư mục project (`F:\CLAUDE CODE HÓA\`):

```bash
git remote add origin https://github.com/<your-username>/centosy-arena.git
```

Thay `<your-username>` bằng username GitHub thật.

**Bước 3 — Kiểm tra `.env.local` chưa bị commit**

```bash
git status
```

Nếu thấy `.env.local` trong danh sách → **DỪNG LẠI**, không push. File này phải bị ignore bởi `.gitignore`.

**Bước 4 — Push lên GitHub**

```bash
git push -u origin master
```

Nếu GitHub yêu cầu xác thực: dùng Personal Access Token (Settings → Developer settings → Personal access tokens → Generate new token).

**Bước 5 — Xác nhận trên GitHub**
- Vào repo vừa tạo trên GitHub
- Kiểm tra thấy `src/`, `supabase/`, `vercel.json`, `.env.example`
- Kiểm tra **KHÔNG** thấy `.env.local` hay key thật

---

## 3. Import project vào Vercel

**Bước 1 — Vào Vercel**
- Truy cập: https://vercel.com
- Đăng nhập (dùng GitHub account để kết nối nhanh hơn)

**Bước 2 — Tạo project mới**
- Bấm **Add New…** → **Project**

**Bước 3 — Import GitHub repo**
- Bấm **Continue with GitHub** nếu chưa kết nối
- Tìm repo `centosy-arena` → bấm **Import**

**Bước 4 — Cài đặt project**

Vercel tự detect Vite. Kiểm tra đúng các giá trị sau:

| Setting | Giá trị đúng |
|---|---|
| Framework Preset | **Vite** |
| Root Directory | *(để trống)* |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> Nếu Vercel tự điền sai, sửa thủ công theo bảng trên.

---

## 4. Khai báo Environment Variables

**Đây là bước quan trọng nhất — thiếu biến này app sẽ trắng màn hình.**

Trong màn hình cài đặt project (trước khi bấm Deploy), kéo xuống phần **Environment Variables**.

Thêm đúng 2 biến sau:

| Name | Value | Environments |
|---|---|---|
| `VITE_SUPABASE_URL` | URL project Supabase thật | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon/public key thật | Production, Preview, Development |

**Cách lấy giá trị:**
- Vào Supabase Dashboard → Project → **Project Settings** → **API**
- `Project URL` → paste vào `VITE_SUPABASE_URL`
- `Project API keys` → `anon` `public` → paste vào `VITE_SUPABASE_PUBLISHABLE_KEY`

**Tuyệt đối KHÔNG thêm các biến sau vào Vercel:**

```
SUPABASE_SERVICE_ROLE_KEY  ← nguy hiểm, bypass toàn bộ RLS
database password          ← lộ DB
JWT secret                 ← lộ auth
```

---

## 5. Deploy

**Bước 1 — Bấm Deploy**
- Bấm nút **Deploy** (màu đen)
- Vercel bắt đầu clone code → install → build → publish

**Bước 2 — Theo dõi build log**
- Chờ đến khi thấy: `✓ Build completed` hoặc **Congratulations!**
- Thời gian build thường: 1–3 phút
- Nếu thấy lỗi đỏ → xem mục 7 bên dưới

**Bước 3 — Lấy public URL**
- Sau khi deploy xong, Vercel hiển thị URL dạng:
  `https://centosy-arena-xxxx.vercel.app`
- Bấm **Visit** để mở thử trên browser
- Copy URL → gửi cho 5–10 người test nội bộ

---

## 6. Checklist test sau deploy

Làm trên điện thoại thật (không phải desktop), ít nhất 1 admin và 1 staff:

**Auth:**
- [ ] Mở link → thấy LoginScreen (không trắng màn hình)
- [ ] Nhập sai mật khẩu → thấy thông báo lỗi tiếng Việt
- [ ] Admin đăng nhập được → thấy badge ADMIN
- [ ] Staff đăng nhập được → thấy badge NHÂN VIÊN
- [ ] Reload trang → vẫn giữ session, không bị đá ra

**Permission:**
- [ ] Admin thấy nút "Mở Admin Panel" trong Profile
- [ ] Staff không thấy nút Admin Panel
- [ ] Admin mở AdminPanel → thấy danh sách nhân sự

**Game:**
- [ ] Staff vào Games → bấm "Khách hàng khó tính" → chơi được
- [ ] Timer đếm ngược 20 giây
- [ ] Kết thúc 5 câu → Result Screen → thấy "Đã lưu điểm vào BXH"

**Rank:**
- [ ] Vào tab Rank → thấy spinner → load bảng xếp hạng thật
- [ ] User vừa chơi xuất hiện với điểm đúng
- [ ] Chơi thêm lượt → Rank cập nhật

**Logout:**
- [ ] Bấm Đăng xuất → thấy confirmation → xác nhận → về LoginScreen

---

## 7. Xử lý lỗi thường gặp

### Trắng màn hình hoàn toàn
**Nguyên nhân:** `VITE_SUPABASE_URL` hoặc `VITE_SUPABASE_PUBLISHABLE_KEY` chưa khai báo trên Vercel, hoặc khai báo sai.

**Sửa:**
- Vercel Dashboard → Project → Settings → Environment Variables
- Kiểm tra đúng tên biến (phân biệt chữ hoa/thường)
- Sau khi sửa → vào **Deployments** → **Redeploy**

---

### Env thiếu / sai
**Dấu hiệu:** Console log có `[Supabase] VITE_SUPABASE_URL chưa được cấu hình.`

**Sửa:** Như mục "Trắng màn hình" ở trên.

---

### Login Supabase fail — "Email hoặc mật khẩu không đúng"
**Nguyên nhân A:** Tài khoản chưa tạo trên Supabase.
→ Vào Supabase → Authentication → Users → Add user.

**Nguyên nhân B:** `VITE_SUPABASE_URL` trỏ sai project.
→ Kiểm tra URL trên Vercel vs URL trong Supabase.

**Nguyên nhân C:** Email chưa được confirm.
→ Vào Supabase → Authentication → Users → tìm user → bấm **Confirm email**.

---

### Build fail trên Vercel
**Dấu hiệu:** Build log có lỗi đỏ.

**Sửa:**
1. Copy lỗi từ Vercel build log
2. Chạy `npm run build` trên máy local để tái hiện lỗi
3. Sửa lỗi → commit → push → Vercel tự redeploy

---

### Rank Page không có dữ liệu / thấy "Chưa tải được bảng xếp hạng"
**Nguyên nhân:** `supabase/leaderboard_view.sql` chưa được chạy trên Supabase.

**Sửa:**
- Vào Supabase → SQL Editor → paste nội dung `supabase/leaderboard_view.sql` → Run
- Reload Rank Page

---

### 404 khi refresh trang
**Nguyên nhân:** `vercel.json` chưa có hoặc bị thiếu trong commit.

**Sửa:**
- Kiểm tra repo GitHub có file `vercel.json` với nội dung:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```
- Nếu thiếu: thêm file → commit → push → redeploy.

---

## 8. Sau khi public beta thành công

Khi 5–10 người test xong và không có lỗi nghiêm trọng:

1. Thu thập feedback từ người test.
2. Ghi nhận lỗi cần sửa vào backlog.
3. Tiếp tục STEP 24E — Mở rộng tài khoản cho 80 nhân sự.
4. Cân nhắc custom domain (Settings → Domains trên Vercel).
