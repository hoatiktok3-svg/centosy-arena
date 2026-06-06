# CENTOSY ARENA — SESSION HANDOFF 03
_Cập nhật: 06/06/2026 — Bàn giao sau chuỗi STEP 23A–23H_

---

## 1. Current Project Summary

CENTOSY ARENA là app nội bộ cho Centosy Việt Nam.
App dùng chủ yếu trên điện thoại.
Mục tiêu: Thi đua nội bộ · Vinh danh nhân sự · Chơi game · Tính điểm · Bảng xếp hạng.

Phong cách: Mobile-first · Dark premium · Gaming Arena · Màu chính: #E94E1B · Logo: public/logo-centosy.png

Tech stack:
- Vite 5 · React 18 · TypeScript 5 · Tailwind CSS 3
- Supabase Auth / Database (@supabase/supabase-js ^2.107.0)

Chạy: `npm run dev` → `http://localhost:5173`
Thư mục: `F:\CLAUDE CODE HÓA\`
Build: `npm run build` → ✅ 94 modules, 0 lỗi TypeScript

---

## 2. Current Screens & Component Status

| Màn hình / Component | File | Trạng thái |
|---|---|---|
| Home Dashboard | `src/pages/HomePage.tsx` | ✅ UI OK, data mock |
| Game Center | `src/pages/GamesPage.tsx` | ✅ UI OK, 1 game active |
| Leaderboard / Rank | `src/pages/RankPage.tsx` | ✅ **Đọc điểm thật từ Supabase RPC** |
| Honor Wall | `src/pages/HonorPage.tsx` | ✅ UI OK, data mock |
| Profile | `src/pages/ProfilePage.tsx` | ✅ Identity từ Supabase, badges/history mock |
| Bottom Navigation | `src/components/BottomNav.tsx` | ✅ 5 tab cố định |
| Header | `src/components/Header.tsx` | ✅ Logo + CENTOSY ARENA |
| Layout | `src/components/Layout.tsx` | ✅ Phone frame 430px |
| LoginScreen | `src/components/auth/LoginScreen.tsx` | ✅ Supabase Auth thật |
| AdminPanel | `src/components/admin/AdminPanel.tsx` | ✅ Profiles + game stats + KPI cards |
| Game: Khách hàng khó tính — Intro | `src/components/games/DifficultCustomerIntro.tsx` | ✅ |
| Game: Khách hàng khó tính — Play | `src/components/games/DifficultCustomerGame.tsx` | ✅ Logic OK |
| Game: Khách hàng khó tính — Feedback | `src/components/games/DifficultCustomerFeedback.tsx` | ✅ |
| Game: Khách hàng khó tính — Result | `src/components/games/DifficultCustomerResult.tsx` | ✅ **Lưu điểm thật vào Supabase** |

---

## 3. Supabase Auth Status

| Step | Trạng thái | Evidence |
|---|---|---|
| STEP 21A — Setup client | ✅ DONE | `src/lib/supabaseClient.ts` · `@supabase/supabase-js ^2.107.0` |
| STEP 21B — Schema SQL | ✅ DONE | `supabase/schema.sql` — profiles, RLS, trigger |
| STEP 21C — AuthContext | ✅ DONE | Dùng `signInWithPassword`, `getSession`, `onAuthStateChange` |
| STEP 21D — LoginScreen | ✅ DONE | Gọi `useAuth().login()` async, lỗi tiếng Việt |
| STEP 21E — Role-based UI | ✅ DONE | Badge ADMIN/NHÂN VIÊN từ DB role |
| STEP 21F — AdminPanel | ✅ DONE | Fetch profiles + game stats từ Supabase |
| STEP 21G — QA Auth | ✅ DONE | |

---

## 4. STEP 23 Status

| Step | Trạng thái | File tạo/sửa |
|---|---|---|
| **23A** — game_results SQL | ✅ CODE DONE | `supabase/game_results.sql` tạo mới |
| **23B** — Save game result | ✅ CODE DONE | `src/components/games/DifficultCustomerResult.tsx` |
| **23C** — Rank real data | ✅ CODE DONE | `src/pages/RankPage.tsx` (viết lại) |
| **23C-2** — leaderboard_view | ✅ CODE DONE | `supabase/leaderboard_view.sql` tạo mới |
| **23D** — AdminPanel staff status | ✅ CODE DONE | `src/components/admin/AdminPanel.tsx` |
| **23E** — Beta accounts guide | ✅ CODE DONE | `docs/PUBLIC_BETA_ACCOUNTS.md` tạo mới |
| **23F** — QA + bug fix | ✅ CODE DONE | `src/index.css` + `src/pages/RankPage.tsx` |
| **23G** — Deploy | ⏳ CHƯA LÀM | Chờ xác nhận SQL + tài khoản test |
| **23H** — Update handoff | ✅ CODE DONE | `SESSION_HANDOFF.md` |

---

## 5. Việc cần xác nhận thủ công trên Supabase

> Các bước dưới đây phải làm trên Supabase Dashboard — không tự động từ code.

### SQL cần chạy trong Supabase SQL Editor (theo thứ tự):

| Thứ tự | File | Trạng thái |
|---|---|---|
| 1 | `supabase/schema.sql` | Phải chạy trước (profiles, RLS, trigger) |
| 2 | `supabase/game_results.sql` | **Cần xác nhận đã chạy chưa** |
| 3 | `supabase/leaderboard_view.sql` | **Cần xác nhận đã chạy chưa** — RankPage cần function này |

### Tài khoản test cần tạo:

- Ít nhất **1 admin** và **2 staff** từ các phòng ban khác nhau.
- Xem hướng dẫn đầy đủ: `docs/PUBLIC_BETA_ACCOUNTS.md`
- SQL update profile mẫu: `docs/PUBLIC_BETA_ACCOUNTS.md` — mục 5A, 5B, 5C.

### Kiểm tra sau khi tạo tài khoản:

- [ ] Đăng nhập được
- [ ] Profile đúng tên/phòng ban/role
- [ ] Chơi game → thấy "Đã lưu điểm vào BXH"
- [ ] Rank Page hiển thị điểm thật (cần `leaderboard_view.sql` đã chạy)
- [ ] AdminPanel hiển thị đúng trạng thái nhân sự

### Biến môi trường:

- [ ] `.env.local` có `VITE_SUPABASE_URL`
- [ ] `.env.local` có `VITE_SUPABASE_PUBLISHABLE_KEY`
- Không commit `.env.local` lên git (đã có trong `.gitignore`)

---

## 6. Current Auth Mode & Data Status

**Auth:** Supabase Auth — hoàn toàn thật.

**Dữ liệu thật:**
- `public.profiles` → tên, email, role, department
- `public.game_results` → điểm game, lượt chơi
- Rank Page → gọi `supabase.rpc('get_leaderboard')` — SECURITY DEFINER, bypass RLS an toàn

**Mock data còn lại (chấp nhận được cho beta):**
- `RankPage` → không còn mock ✅
- `ProfilePage` → `weeklyRank`, `mockGameHistory`, `mockRecentAchievements` vẫn mock
- `HomePage` → `mockCampaigns`, top 5 mock
- `HonorPage` → `mockHonors`

---

## 7. Public Beta Readiness

**Mức sẵn sàng: 8/10** _(sau khi SQL đã chạy và tài khoản đã tạo)_

### Chặn deploy (phải xong trước):

1. **Chạy `supabase/game_results.sql`** trên Supabase SQL Editor
2. **Chạy `supabase/leaderboard_view.sql`** trên Supabase SQL Editor
3. **Tạo ít nhất 1 admin + 2 staff** theo `docs/PUBLIC_BETA_ACCOUNTS.md`
4. **Xác nhận `.env.local`** có đủ 2 biến Supabase

### Chấp nhận được cho beta sớm:

5. Profile weeklyRank/badges/gameHistory còn mock
6. Honor Wall còn mock
7. Home Dashboard còn mock
8. Chỉ có 1 game playable (6 game còn "Sắp ra mắt")

### Build status:

- `npm run build` → ✅ PASS (94 modules, ~2s, 0 lỗi TypeScript)
- `npx tsc --noEmit` → ✅ 0 lỗi
- Không có `service_role` key trong source code
- `.gitignore` đã có `.env`, `.env.local`, `.env.production`

---

## 8. Next Roadmap

```
STEP 23G — Deploy public beta lên Vercel / Netlify
STEP 24A — QA public link trên điện thoại thật
STEP 24B — Tạo hàng loạt tài khoản cho 80 nhân sự (script / bulk import)
STEP 24C — ProfilePage đọc game history thật từ game_results
STEP 24D — Honor Wall thật từ Supabase
STEP 24E — Home Dashboard thật (campaigns, top 5)
STEP 24F — Game thứ 2
```

---

## 9. Recommended Next Step

**Next step: STEP 23G — Deploy public beta lên Vercel**

Điều kiện trước khi deploy:
- Tất cả SQL đã chạy trên Supabase
- Ít nhất 1 admin + 2 staff tạo thành công
- Test end-to-end: login → chơi game → thấy điểm trên Rank

Likely steps khi deploy Vercel:
1. `npm run build` → kiểm tra 0 lỗi
2. Push code lên GitHub (chú ý không commit `.env.local`)
3. Kết nối Vercel với repo
4. Thêm env vars trên Vercel dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy → lấy public URL
6. Test trên điện thoại thật

---

## 10. Important Rules (không thay đổi)

- Không dùng `service_role` key trong frontend
- Không hardcode key thật trong source code
- Không tạo signup public tự do cho nhân viên
- Không mở quyền staff xem toàn bộ profiles của người khác
- Không refactor toàn bộ project
- Không phá UI MVP
- Không deploy trước khi SQL đã chạy và tài khoản test đã xác nhận
- Mỗi prompt chỉ làm 1 step nhỏ
- Sau mỗi step phải báo: `DONE STEP [code]` + files changed + notes + cách test nhanh

---

## 11. Files Changed in STEP 23

### Tạo mới:
- `supabase/game_results.sql` — bảng game_results + RLS + indexes
- `supabase/leaderboard_view.sql` — SECURITY DEFINER function get_leaderboard()
- `docs/PUBLIC_BETA_ACCOUNTS.md` — hướng dẫn tạo tài khoản beta

### Sửa:
- `src/components/games/DifficultCustomerResult.tsx` — lưu điểm vào Supabase
- `src/pages/RankPage.tsx` — đọc điểm thật qua RPC, không dùng mock
- `src/components/admin/AdminPanel.tsx` — KPI cards + game stats + status badge
- `src/index.css` — thêm `@keyframes spin` cho spinner
- `SESSION_HANDOFF.md` — file này

### Không sửa:
- `src/context/AuthContext.tsx`
- `src/components/auth/LoginScreen.tsx`
- `supabase/schema.sql`
- `tailwind.config.js`
- `src/components/Layout.tsx`
- `src/components/BottomNav.tsx`
- `src/components/games/DifficultCustomerGame.tsx`

---

## 12. Prompt To Start New Session

Copy đoạn sau sang Claude Code new session:

```
Bạn hãy đọc 2 file trước:
1. PROJECT_MEMORY.md
2. SESSION_HANDOFF.md

Chưa sửa code.
Chưa tạo file.
Chưa cài package.
Chưa refactor.
Chỉ đọc và xác nhận trạng thái dự án.

Sau khi đọc xong, trả lời đúng format:

READY FOR NEXT STEP

1. Tôi hiểu app CENTOSY ARENA hiện tại:
- ...

2. STEP 23 đã hoàn thành:
- ...

3. Việc cần xác nhận thủ công trên Supabase:
- ...

4. Next step duy nhất:
- STEP 23G — Deploy public beta lên Vercel

5. Những việc không được tự làm:
- ...

Sau đó chờ tôi đưa prompt STEP tiếp theo.
```
