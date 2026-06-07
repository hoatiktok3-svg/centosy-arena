# CENTOSY ARENA — Vercel Internal Test Guide
> STEP 36 | Dành cho người deploy / QA lead

---

## Trước khi gửi link test cho nhân viên — checklist bắt buộc

---

## 1. Vercel Environment Variables

Vào https://vercel.com → Project `centosy-arena` → Settings → Environment Variables.

Kiểm tra đã có 2 biến sau (cho cả Production + Preview):

| Tên biến | Giá trị | Ghi chú |
|----------|---------|---------|
| `VITE_SUPABASE_URL` | `https://avprramyljytezenekwx.supabase.co` | Không dùng service_role URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` (anon key) | **Chỉ dùng anon key**, KHÔNG dùng service_role key |

**Lấy anon key:** Supabase Dashboard → Project Settings → API → `anon` `public`

> ⚠️ Nếu env vars chưa set → app sẽ hiển thị lỗi kết nối, không crash.

---

## 2. Supabase RLS — bắt buộc kiểm tra

App dùng anon key → mọi truy cập đều qua Row Level Security.

- [ ] Bảng `profiles`: user chỉ đọc profile của mình; admin/manager đọc nhiều hơn
- [ ] Bảng `mission_submissions`: user chỉ xem/tạo của mình; manager xem khối mình
- [ ] Bảng `notifications`: user chỉ đọc của mình; manager+ tạo
- [ ] Bảng `user_badges`: user đọc của mình; manager+ ghi
- [ ] Không có policy `FOR ALL USING (true)` trừ các bảng public read-only

---

## 3. SQL đã chạy chưa?

- [ ] `supabase/employee_registration.sql`
- [ ] `supabase/role_upgrade.sql`
- [ ] `supabase/missions.sql`
- [ ] `supabase/mission_points_trigger.sql`
- [ ] `supabase/badges.sql`
- [ ] `supabase/notifications.sql`

Chi tiết xem `centosy-arena-docs/MVP_SQL_SETUP_GUIDE.md`.

---

## 4. Build & Deploy

```bash
# Local build verify (chạy trước khi push)
npx tsc --noEmit   # phải 0 lỗi
npx vite build     # phải OK

# Push lên master → Vercel tự deploy
git push origin master
```

Sau khi push → vào Vercel dashboard → xem deployment log → chờ "Ready".

---

## 5. Kiểm tra sau khi deploy

- [ ] Mở https://centosy-arena.vercel.app trên Chrome mobile (375px)
- [ ] Trang Login hiển thị → đăng nhập được với tài khoản test
- [ ] Không có lỗi đỏ trong console (F12)
- [ ] Không thấy `[Supabase] ⚠️` warning trong console (nếu thấy → env vars chưa set đúng)
- [ ] Mở app trên thiết bị thật (iPhone/Android)

---

## 6. Tài khoản test cần chuẩn bị

| Role | Email | Mục đích |
|------|-------|---------|
| admin | admin@centosy.vn | Duyệt tài khoản, admin panel |
| director | giamdoc@centosy.vn | Director dashboard |
| manager (cua-hang) | manager.ch@centosy.vn | Team dashboard, duyệt mission |
| employee | nhanvien@centosy.vn | Chơi game, nộp mission |

> Tạo qua đăng ký → Admin duyệt → set role thủ công trong Supabase hoặc Admin Panel.

---

## 7. Link gửi cho tester

```
🎮 CENTOSY ARENA — Internal Test

Link: https://centosy-arena.vercel.app
Tài khoản: đăng ký bằng email công ty

Hướng dẫn:
1. Vào link → bấm "Đăng ký"
2. Điền thông tin → submit
3. Chờ Admin duyệt (có thể mất vài phút)
4. Đăng nhập → khám phá app

Báo lỗi: chat trực tiếp anh Hoá
```

---

## 8. Security notes

- Chỉ dùng **anon key** ở frontend — không bao giờ đưa service_role key vào code
- `.env.local` đã gitignore → không bị push lên GitHub
- App không lưu mật khẩu, không dùng cookie — Supabase Auth JWT tự quản lý
- RLS bảo vệ toàn bộ data ở DB layer — frontend guard chỉ là UX
