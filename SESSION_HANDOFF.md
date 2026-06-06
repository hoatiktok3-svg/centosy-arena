# CENTOSY ARENA — SESSION HANDOFF 04
_Cập nhật: 06/06/2026 — Bàn giao sau chuỗi STEP 24A–24F_

---

## 1. Current Project Summary

CENTOSY ARENA là app nội bộ cho Centosy Việt Nam.
App dùng chủ yếu trên điện thoại.
Mục tiêu: Thi đua nội bộ · Vinh danh nhân sự · Chơi game · Tính điểm · Bảng xếp hạng.

Phong cách: Mobile-first · Dark premium · Gaming Arena · Màu chính: #E94E1B · Logo: public/logo-centosy.png

Tech stack:
- Vite 5 · React 18 · TypeScript 5 · Tailwind CSS 3
- Supabase Auth / Database (@supabase/supabase-js ^2.107.0)

Chạy local: `npm run dev` → `http://localhost:5173`
Thư mục: `F:\CLAUDE CODE HÓA\`
Build: `npm run build` → ✅ 94 modules, 0 lỗi TypeScript

---

## 2. Current Screens & Component Status

| Màn hình / Component | File | Trạng thái |
|---|---|---|
| Home Dashboard | `src/pages/HomePage.tsx` | ✅ UI OK, data mock |
| Game Center | `src/pages/GamesPage.tsx` | ✅ UI OK, 1 game active |
| Leaderboard / Rank | `src/pages/RankPage.tsx` | ✅ Đọc điểm thật qua `get_leaderboard()` RPC |
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
| Game: Khách hàng khó tính — Result | `src/components/games/DifficultCustomerResult.tsx` | ✅ Lưu điểm thật vào Supabase |

---

## 3. STEP 23 Status (đã hoàn thành)

| Step | Trạng thái | File |
|---|---|---|
| 23A — game_results SQL | ✅ DONE | `supabase/game_results.sql` |
| 23B — Save game result | ✅ DONE | `src/components/games/DifficultCustomerResult.tsx` |
| 23C — Rank real data | ✅ DONE | `src/pages/RankPage.tsx` |
| 23C-2 — leaderboard_view | ✅ DONE | `supabase/leaderboard_view.sql` |
| 23D — AdminPanel staff status | ✅ DONE | `src/components/admin/AdminPanel.tsx` |
| 23E — Beta accounts guide | ✅ DONE | `docs/PUBLIC_BETA_ACCOUNTS.md` |
| 23F — QA + bug fix | ✅ DONE | `src/index.css` · `src/pages/RankPage.tsx` |
| 23H — Handoff | ✅ DONE | `SESSION_HANDOFF.md` |

---

## 4. STEP 24 Status

| Step | Trạng thái | Ghi chú |
|---|---|---|
| **24A** — Pre-deploy check | ✅ DONE | Build PASS · Security PASS · Env PASS · Git chưa init |
| **24B** — Fix deploy blocker | ✅ DONE | `git init` · initial commit `8181d02` · 51 files |
| **24C** — Vercel config | ✅ DONE | `vercel.json` tạo mới · commit `4d40058` |
| **24D** — Deploy guide | ✅ DONE | `docs/VERCEL_DEPLOY_GUIDE.md` · commit `07b9b66` |
| **24E** — Public link QA | ⏳ CHỜ URL | Deploy thủ công chưa xong — chờ bạn push GitHub + deploy Vercel |
| **24F** — Handoff update | ✅ DONE | File này |

---

## 5. Deploy Status

### Git repository
- ✅ Đã `git init`
- ✅ Initial commit: `8181d02` — 51 files
- ✅ Vercel config commit: `4d40058`
- ✅ Deploy guide commit: `07b9b66`
- ✅ `.env.local` không nằm trong commit (đúng)
- ⏳ **Chưa push lên GitHub** — bạn cần làm thủ công

### Vercel
- ⏳ **Chưa deploy** — chờ GitHub push xong

### Public URL
- ⏳ **Chưa có** — sẽ cập nhật sau khi deploy

---

## 6. Vercel Environment Variables

Khi deploy, thêm đúng 2 biến sau vào Vercel Dashboard (không ghi giá trị thật vào file này):

| Name | Environments |
|---|---|
| `VITE_SUPABASE_URL` | Production · Preview · Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Production · Preview · Development |

**Tuyệt đối không thêm:**
- `SUPABASE_SERVICE_ROLE_KEY`
- Database password
- JWT secret

---

## 7. Supabase Manual Checklist

Các SQL cần chạy trên Supabase SQL Editor (theo thứ tự):

| Thứ tự | File | Trạng thái |
|---|---|---|
| 1 | `supabase/schema.sql` | **Cần xác nhận thủ công** |
| 2 | `supabase/game_results.sql` | **Cần xác nhận thủ công** |
| 3 | `supabase/leaderboard_view.sql` | **Cần xác nhận thủ công** — Rank Page phụ thuộc file này |

Tài khoản test cần có: ít nhất **1 admin** + **2 staff** từ các phòng ban khác nhau.
Xem hướng dẫn: `docs/PUBLIC_BETA_ACCOUNTS.md`

---

## 8. Mock Data còn lại (chấp nhận được cho beta)

| Page | Phần còn mock |
|---|---|
| ProfilePage | `weeklyRank`, `mockGameHistory`, `mockRecentAchievements` |
| HomePage | `mockCampaigns`, top 5 users |
| HonorPage | Toàn bộ `mockHonors` |

Các phần này không crash app, chỉ hiển thị dữ liệu giả — chấp nhận được cho beta sớm.

---

## 9. Lỗi còn tồn tại

| Lỗi | Mức độ | Ghi chú |
|---|---|---|
| ProfilePage weeklyRank/gameHistory là mock | Chấp nhận được | Không crash, chỉ hiển thị giả |
| Leaderboard filter phòng ban cần `leaderboard_view.sql` đã chạy | Chặn nếu SQL chưa chạy | Rank Page hiện `fetchError` nếu function chưa tồn tại |
| Chỉ 1 game playable (6 game còn "Sắp ra mắt") | Chấp nhận được | Game thứ 2 là roadmap tiếp theo |

---

## 10. Next Roadmap

```
[ĐỢI] Deploy lên Vercel + push GitHub
[ĐỢI] STEP 24E — QA public link trên điện thoại thật
[SAU KHI QA PASS]
  → Mời 5–10 nhân sự test nội bộ
  → Thu thập feedback
  → STEP 25A — Fix lỗi từ beta feedback
  → STEP 25B — ProfilePage đọc game history thật từ game_results
  → STEP 25C — Bulk tạo tài khoản 80 nhân sự
  → STEP 25D — Game thứ 2
```

---

## 11. Recommended Next Step

**Nếu QA public link PASS:**
→ Mời 5–10 nhân sự Centosy test theo hướng dẫn `docs/PUBLIC_BETA_ACCOUNTS.md`

**Nếu QA public link FAIL (lỗi cụ thể):**
→ Paste lỗi vào Claude Code → sửa đúng 1 lỗi → redeploy

**Việc cần làm ngay (thủ công):**
1. Tạo repo GitHub → push code
2. Deploy lên Vercel + thêm 2 env vars
3. Chạy 3 file SQL trên Supabase nếu chưa chạy
4. Tạo tài khoản test theo `docs/PUBLIC_BETA_ACCOUNTS.md`
5. Test trên điện thoại thật → báo kết quả

---

## 12. Files Changed in STEP 24

### Tạo mới:
- `vercel.json` — SPA rewrite config
- `docs/VERCEL_DEPLOY_GUIDE.md` — hướng dẫn deploy 8 bước + 7 lỗi thường gặp

### Git commits:
- `8181d02` — Initial commit (51 files)
- `4d40058` — Add vercel.json
- `07b9b66` — Add VERCEL_DEPLOY_GUIDE.md

### Không sửa:
- Toàn bộ `src/` (không có thay đổi code trong STEP 24)
- `supabase/` SQL files
- `tailwind.config.js`

---

## 13. Prompt To Start New Session

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

2. STEP 24 đã hoàn thành:
- ...

3. Việc còn cần làm thủ công:
- ...

4. Lỗi còn tồn tại:
- ...

5. Next step duy nhất:
- STEP 24E — QA public link trên điện thoại thật (sau khi deploy Vercel)

6. Những việc không được tự làm:
- ...

Sau đó chờ tôi đưa prompt tiếp theo.
```
