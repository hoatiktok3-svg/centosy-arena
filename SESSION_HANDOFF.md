# CENTOSY ARENA — SESSION HANDOFF 05
_Cập nhật: 06/06/2026 — Bàn giao sau deploy setup + Supabase setup_

---

## 1. Current Project Summary

CENTOSY ARENA là app nội bộ cho Centosy Việt Nam, dùng chủ yếu trên điện thoại.

Mục tiêu app:
- Thi đua nội bộ
- Vinh danh nhân sự
- Chơi game nội bộ
- Tính điểm
- Bảng xếp hạng
- Kết nối nhân sự

Phong cách:
- Mobile-first
- Dark premium
- Gaming Arena
- Màu chính Centosy #E94E1B
- Logo: public/logo-centosy.png

Tech stack:
- Vite 5 · React 18 · TypeScript 5 · Tailwind CSS 3
- Supabase Auth / Database (@supabase/supabase-js ^2.107.0)
- Vercel deploy

Chạy local: `npm run dev` → `http://localhost:5173`
Thư mục: `F:\CLAUDE CODE HÓA\`
Build: `npm run build` → ✅ 94 modules, 0 lỗi TypeScript

---

## 2. Current Screens / Modules

| Màn hình / Component | File | Trạng thái |
|---|---|---|
| Home Dashboard | `src/pages/HomePage.tsx` | ✅ UI OK, data mock |
| Game Center | `src/pages/GamesPage.tsx` | ✅ 1 game active |
| Leaderboard / Rank | `src/pages/RankPage.tsx` | ✅ Gọi `supabase.rpc('get_leaderboard')` |
| Honor Wall | `src/pages/HonorPage.tsx` | ✅ UI OK, data mock |
| Profile | `src/pages/ProfilePage.tsx` | ✅ Identity Supabase, badges/history mock |
| Bottom Navigation | `src/components/BottomNav.tsx` | ✅ 5 tab cố định |
| Header | `src/components/Header.tsx` | ✅ Logo + CENTOSY ARENA |
| Layout | `src/components/Layout.tsx` | ✅ Phone frame 430px |
| LoginScreen | `src/components/auth/LoginScreen.tsx` | ✅ Supabase Auth thật |
| AdminPanel | `src/components/admin/AdminPanel.tsx` | ✅ Profiles + game stats + KPI cards |
| Game Intro | `src/components/games/DifficultCustomerIntro.tsx` | ✅ |
| Game Play | `src/components/games/DifficultCustomerGame.tsx` | ✅ |
| Game Feedback | `src/components/games/DifficultCustomerFeedback.tsx` | ✅ |
| Game Result | `src/components/games/DifficultCustomerResult.tsx` | ✅ Lưu điểm vào Supabase |
| Supabase client | `src/lib/supabaseClient.ts` | ✅ Dùng VITE_ env vars |
| AuthContext | `src/context/AuthContext.tsx` | ✅ Supabase session thật |
| SQL schemas | `supabase/schema.sql` | ✅ File tồn tại |
| SQL game_results | `supabase/game_results.sql` | ✅ File tồn tại |
| SQL leaderboard | `supabase/leaderboard_view.sql` | ✅ File tồn tại |
| Deploy config | `vercel.json` | ✅ SPA rewrite |
| Deploy guide | `docs/VERCEL_DEPLOY_GUIDE.md` | ✅ |
| Beta accounts | `docs/PUBLIC_BETA_ACCOUNTS.md` | ✅ |

---

## 3. STEP 21 — Supabase Auth Status

**STEP 21A — Setup Supabase client:**
- **DONE**
- Evidence: `src/lib/supabaseClient.ts` dùng `import.meta.env.VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`. `.env.local` đã có giá trị thật.

**STEP 21B — Create schema.sql:**
- **DONE**
- Evidence: `supabase/schema.sql` tồn tại — có `public.profiles`, `user_role`, `department_type`, `is_admin()`, RLS policies, `handle_new_user` trigger.

**STEP 21B-RUN — SQL schema.sql đã chạy trên Supabase:**
- **DONE (xác nhận qua Supabase Management API trong session này)**
- Đã chạy thành công qua browser API calls: enums, profiles table, RLS, is_admin(), trigger đều OK
- Supabase project: `avprramyljytezenekwx` (Singapore region)

**STEP 21C — AuthContext dùng Supabase:**
- **DONE**
- Evidence: `src/context/AuthContext.tsx` — `signInWithPassword`, `getSession`, `onAuthStateChange`, `signOut`. Không còn mockAccounts.

**STEP 21D — LoginScreen dùng Supabase:**
- **DONE**
- Evidence: `src/components/auth/LoginScreen.tsx` — gọi `useAuth().login()` async, lỗi dịch tiếng Việt.

**STEP 21E — Profile dùng role thật:**
- **DONE**
- Evidence: `src/pages/ProfilePage.tsx` — badge ADMIN/NHÂN VIÊN từ `currentUser.role` (Supabase).

**STEP 21F — AdminPanel dùng profiles thật:**
- **DONE**
- Evidence: `src/components/admin/AdminPanel.tsx` — fetch từ `supabase.from('profiles')` và `supabase.from('game_results')`.

**STEP 21G — QA Supabase Auth:**
- **NEED MANUAL TEST** — cần test trên link Vercel thật sau khi redeploy

---

## 4. STEP 23 — Public Beta Data Status

**STEP 23A — game_results SQL file:**
- **DONE**
- Evidence: `supabase/game_results.sql` tồn tại — có table, RLS, 5 policies, 5 indexes.

**STEP 23A-RUN — game_results.sql đã chạy trên Supabase:**
- **DONE (xác nhận qua API trong session này)**
- Bảng `public.game_results` đã tạo, RLS bật, policies đã set.

**STEP 23B — Save game result to Supabase:**
- **DONE**
- Evidence: `src/components/games/DifficultCustomerResult.tsx` — `useEffect` gọi `supabase.from('game_results').insert(...)`, `hasSaved` ref chống duplicate.

**STEP 23C — Rank Page đọc điểm thật:**
- **DONE**
- Evidence: `src/pages/RankPage.tsx` — gọi `supabase.rpc('get_leaderboard', {...})` thay vì mock data.

**STEP 23C-2 — Safe leaderboard function:**
- **DONE**
- Evidence: `supabase/leaderboard_view.sql` tồn tại — SECURITY DEFINER function `get_leaderboard()`, revoke anon, grant authenticated. Đã chạy trên Supabase qua API trong session này.

**STEP 23D — AdminPanel staff status:**
- **DONE**
- Evidence: `src/components/admin/AdminPanel.tsx` — 4 KPI cards, status badge "Đã tham gia/Chưa chơi/Tạm khóa", fetch game_results aggregate.

**STEP 23E — Public beta account guide:**
- **DONE**
- Evidence: `docs/PUBLIC_BETA_ACCOUNTS.md` tồn tại.

**STEP 23F — Internal QA:**
- **DONE (code review)**
- QA score 9/10 — 2 bug đã fix (spinner keyframe + Rank Page RLS). NEED MANUAL TEST trên link thật.

**STEP 23G — Deploy readiness:**
- **DONE** — build pass, security pass, git init, vercel.json, env vars added.

---

## 5. STEP 24 — Deploy Status

**STEP 24A — Pre-deploy readiness check:**
- **DONE** — Build ✅, Env ✅, Security ✅, Git blocker đã fix.

**STEP 24B — Fix deploy blocker:**
- **DONE** — `git init` + initial commit `8181d02` (51 files). `.env.local` không trong commit.

**STEP 24C — Vercel config:**
- **DONE** — `vercel.json` tạo + commit `4d40058`. `.vercel/project.json` đã link project.

**STEP 24D — Vercel deploy guide:**
- **DONE** — `docs/VERCEL_DEPLOY_GUIDE.md` + commit `07b9b66`.

**STEP 24E — Public link QA:**
- **PARTIALLY DONE — CẦN REDEPLOY**
- Deploy đầu tiên (`dpl_ukNo2Tsw1gRFHsKhabbwLeBkCDNp`) → READY nhưng build **trước** khi thêm env vars → app trắng màn hình
- Deploy lần 2 và 3 → BLOCKED (Vercel free tier concurrent limit)
- **Env vars ĐÃ được thêm vào Vercel project settings** — chỉ cần 1 lần redeploy nữa là xong

**STEP 24F — Handoff after deploy:**
- **DONE** (file này)

---

## 6. Supabase — Trạng thái thực tế (đã làm trong session này)

| Hạng mục | Trạng thái | Chi tiết |
|---|---|---|
| Project Supabase | ✅ ĐÃ TẠO | `avprramyljytezenekwx` — Singapore |
| schema.sql (profiles, RLS, trigger) | ✅ ĐÃ CHẠY | Qua Management API |
| game_results.sql | ✅ ĐÃ CHẠY | Bảng + RLS + indexes |
| leaderboard_view.sql | ✅ ĐÃ CHẠY | `get_leaderboard()` function |
| Admin user | ✅ ĐÃ TẠO | `admin@centosy.vn` / `Arena@2026!` |
| Staff test 1 | ✅ ĐÃ TẠO | `cuahang01@centosy.vn` / `Arena@2026!` / Cửa hàng |
| Staff test 2 | ✅ ĐÃ TẠO | `tmdt01@centosy.vn` / `Arena@2026!` / TMĐT |
| Profile admin role | ✅ ĐÃ UPDATE | `role = 'admin'` cho `admin@centosy.vn` |
| Profile staff departments | ✅ ĐÃ UPDATE | `cua-hang` và `tmdt` |

---

## 7. Vercel — Trạng thái thực tế

| Hạng mục | Trạng thái | Chi tiết |
|---|---|---|
| Vercel project | ✅ ĐÃ TẠO | `centosy-arena` · team `anhhoakute-s-projects` |
| `VITE_SUPABASE_URL` | ✅ ĐÃ THÊM | Trong Vercel project settings |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ ĐÃ THÊM | Trong Vercel project settings |
| Deploy READY | ⚠️ BUILD CŨ | `centosy-arena.vercel.app` — build trước env vars |
| Alias production | `centosy-arena.vercel.app` | Trỏ vào build cũ |
| **Cần làm** | 🔴 REDEPLOY | Chạy `vercel deploy --prod --yes` để build lại với env vars |

---

## 8. .env.local (local machine — KHÔNG commit)

```
VITE_SUPABASE_URL=https://avprramyljytezenekwx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_yu8V1W7q-ilBnsTH7WyQzA_lATq8rB4
```

File này đã tồn tại tại `F:\CLAUDE CODE HÓA\.env.local`. Không commit file này.

---

## 9. Current Auth / Data Mode

| Phần | Trạng thái |
|---|---|
| Auth | ✅ Supabase Auth thật (không còn mock) |
| Rank Page | ✅ Dữ liệu thật qua `get_leaderboard()` RPC |
| Game save | ✅ Lưu vào `public.game_results` thật |
| AdminPanel | ✅ Đọc từ Supabase profiles + game_results thật |
| ProfilePage | ⚠️ Identity thật, nhưng weeklyRank/badges/gameHistory vẫn mock |
| HomePage | ⚠️ campaigns + top5 vẫn mock |
| HonorPage | ⚠️ Toàn bộ mock |

---

## 10. Manual Checks Required (sau khi redeploy)

**Supabase — đã xong:**
- [x] schema.sql đã chạy
- [x] game_results.sql đã chạy
- [x] leaderboard_view.sql đã chạy
- [x] Admin user `admin@centosy.vn` đã tạo + role = admin
- [x] 2 staff test đã tạo
- [ ] Cần test đăng nhập thực tế sau khi redeploy

**Vercel — cần làm ngay:**
- [x] Env vars đã thêm vào project settings
- [ ] **REDEPLOY** để build mới pick up env vars
- [ ] Test link `centosy-arena.vercel.app` sau redeploy

---

## 11. Public Beta Readiness

**Ready score: 8/10**

**Passed (code):**
- Auth flow hoàn chỉnh (Supabase)
- Game save điểm thật
- Rank đọc điểm thật
- AdminPanel đọc dữ liệu thật
- Security: không có service_role key trong frontend
- Build 0 lỗi TypeScript
- Supabase project + schema + users đã setup

**Blocking (cần làm ngay):**
1. **REDEPLOY Vercel** — build hiện tại thiếu env vars → app trắng màn hình

**Can fix later:**
2. ProfilePage gameHistory/weeklyRank còn mock
3. HomePage campaigns còn mock
4. HonorPage còn mock
5. Chỉ 1 game active

---

## 12. Recommended Next Step

**Next step duy nhất: REDEPLOY lên Vercel**

```bash
cd "F:\CLAUDE CODE HÓA"
vercel deploy --prod --yes
```

Sau khi deploy xong:
1. Mở `https://centosy-arena.vercel.app` trên điện thoại
2. Đăng nhập bằng `admin@centosy.vn` / `Arena@2026!`
3. Kiểm tra app load được, không trắng màn hình
4. Chơi game → xem điểm lưu vào Rank

**Reason:** Env vars đã có trong Vercel settings nhưng build hiện tại không có — cần build mới để app kết nối được Supabase.

**Likely files to touch:** Không cần sửa file nào — chỉ chạy CLI deploy.

**Do not touch:**
- `src/context/AuthContext.tsx`
- `src/components/auth/LoginScreen.tsx`
- `src/components/admin/AdminPanel.tsx`
- `supabase/schema.sql`
- `.env.local` (không commit)
- Tất cả game components

---

## 13. Important Rules For New Session

- Không tự deploy nếu chưa được yêu cầu.
- Không dùng service_role key trong frontend.
- Không hardcode key thật trong source code.
- Không tạo signup public tự do.
- Không refactor toàn bộ project.
- Không phá UI MVP.
- Không sửa nhiều module cùng lúc.
- Mỗi prompt chỉ làm 1 step nhỏ.
- Sau mỗi step báo DONE STEP + files changed + notes + cách test.
- Phần nào nằm trên Supabase/Vercel dashboard thì ghi CANNOT VERIFY IN CODE.

---

## 14. Prompt To Start New Session

Copy đoạn sau sang Claude Code new session:

```
Bạn hãy đọc 2 file trong root project trước:

1. PROJECT_MEMORY.md
2. SESSION_HANDOFF.md

Chưa sửa code.
Chưa tạo file.
Chưa cài package.
Chưa refactor.
Chưa deploy.
Chỉ đọc và xác nhận trạng thái dự án.

Sau khi đọc xong, trả lời đúng format:

READY FOR NEXT STEP

1. Tôi hiểu app CENTOSY ARENA hiện tại:
- ...

2. Trạng thái Supabase Auth:
- ...

3. Trạng thái lưu điểm / Rank / AdminPanel:
- ...

4. Trạng thái deploy:
- ...

5. Việc cần xác nhận thủ công trên Supabase/Vercel:
- ...

6. Step tiếp theo duy nhất:
- REDEPLOY Vercel để build mới pick up env vars (vercel deploy --prod --yes)

7. Những việc không được tự làm:
- ...

Sau đó chờ tôi đưa prompt step tiếp theo.
```
