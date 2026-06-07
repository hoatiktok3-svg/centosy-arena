# CENTOSY ARENA — SESSION HANDOFF 06
_Cập nhật: 07/06/2026 — Đóng gói sau STEP 25B + logo fix + password toggle. Chuẩn bị STEP 26._

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
- Logo: public/logo-centosy.png (nền trắng đã xử lý bằng CSS filter)

Tech stack:
- Vite 5 · React 18 · TypeScript 5 · Tailwind CSS 3
- Supabase Auth / Database (@supabase/supabase-js ^2.107.0)
- Vercel deploy

Chạy local: `npm run dev` → `http://localhost:5173`
Thư mục: `F:\CLAUDE CODE HÓA\`
Build: `npm run build` → ✅ 93 modules, 0 lỗi TypeScript

---

## 2. Current App Modules

| Màn hình / Component | File | Trạng thái |
|---|---|---|
| Home Dashboard | `src/pages/HomePage.tsx` | ✅ Dùng Supabase thật — greeting, score, quick stats từ game_results |
| Game Center | `src/pages/GamesPage.tsx` | ✅ 1 game active |
| Leaderboard / Rank | `src/pages/RankPage.tsx` | ✅ Dữ liệu thật qua `get_leaderboard()` RPC |
| Honor Wall | `src/pages/HonorPage.tsx` | ⚠️ UI OK, toàn bộ mock |
| Profile | `src/pages/ProfilePage.tsx` | ⚠️ Identity thật, weeklyRank/badges/gameHistory mock |
| Bottom Navigation | `src/components/BottomNav.tsx` | ✅ 5 tab cố định |
| Header | `src/components/Header.tsx` | ✅ Logo CSS filter (nền trắng biến mất) |
| Layout | `src/components/Layout.tsx` | ✅ Phone frame 430px |
| LoginScreen | `src/components/auth/LoginScreen.tsx` | ✅ Supabase Auth + show/hide password toggle |
| AdminPanel | `src/components/admin/AdminPanel.tsx` | ✅ Profiles + game stats + KPI cards thật |
| Game Intro | `src/components/games/DifficultCustomerIntro.tsx` | ✅ |
| Game Play | `src/components/games/DifficultCustomerGame.tsx` | ✅ Timer 20s |
| Game Feedback | `src/components/games/DifficultCustomerFeedback.tsx` | ✅ |
| Game Result | `src/components/games/DifficultCustomerResult.tsx` | ✅ Lưu điểm Supabase |
| Supabase client | `src/lib/supabaseClient.ts` | ✅ Defensive guard (không crash khi thiếu env) |
| AuthContext | `src/context/AuthContext.tsx` | ✅ Supabase session thật |
| SQL profiles/RLS | `supabase/schema.sql` | ✅ Đã chạy trên Supabase |
| SQL game_results | `supabase/game_results.sql` | ✅ Đã chạy trên Supabase |
| SQL leaderboard | `supabase/leaderboard_view.sql` | ✅ Đã chạy — `get_leaderboard()` function |
| Deploy config | `vercel.json` | ✅ SPA rewrite |

---

## 3. Current Auth Status

| Phần | Trạng thái |
|---|---|
| Auth mode | ✅ Supabase Auth thật — không còn mock accounts |
| LoginScreen | ✅ Supabase `signInWithPassword` + error tiếng Việt + show/hide password |
| Logo trên LoginScreen | ✅ CSS filter: nền trắng biến mất, chỉ còn icon cam |
| Profile role | ✅ Lấy từ `public.profiles` — admin/staff thật |
| AdminPanel guard | ✅ Staff bị chặn hoàn toàn |
| Mock users còn lại | ⚠️ ProfilePage: weeklyRank, badges, gameHistory vẫn mock |
| Mock data còn lại | ⚠️ HonorPage: toàn bộ mock |

---

## 4. Current Data Status

| Phần | Trạng thái |
|---|---|
| `game_results` table | ✅ Tạo xong + RLS + indexes |
| Lưu điểm game | ✅ `DifficultCustomerResult.tsx` lưu vào Supabase |
| Rank Page | ✅ Đọc điểm thật qua `get_leaderboard()` RPC |
| Home Quick Stats | ✅ Fetch từ `game_results` của user hiện tại |
| AdminPanel | ✅ Đọc `profiles` + `game_results` thật |
| HomePage campaigns | ⚠️ Đã xoá mock campaigns — section không còn hiển thị |
| HonorPage | ⚠️ Toàn bộ mock |
| ProfilePage gameHistory | ⚠️ Mock |

---

## 5. Supabase — Trạng thái thực tế

| Hạng mục | Trạng thái | Chi tiết |
|---|---|---|
| Project Supabase | ✅ ĐÃ TẠO | `avprramyljytezenekwx` — Singapore |
| schema.sql (profiles, RLS, trigger) | ✅ ĐÃ CHẠY | |
| game_results.sql | ✅ ĐÃ CHẠY | Bảng + RLS + indexes |
| leaderboard_view.sql | ✅ ĐÃ CHẠY | `get_leaderboard()` function |
| Admin user | ✅ ĐÃ TẠO | `admin@centosy.vn` / `Arena@2026!` / role=admin / Văn phòng |
| Staff test 1 | ✅ ĐÃ TẠO | `cuahang01@centosy.vn` / `Arena@2026!` / Cửa hàng |
| Staff test 2 | ✅ ĐÃ TẠO | `tmdt01@centosy.vn` / `Arena@2026!` / TMĐT |

---

## 6. Vercel — Trạng thái thực tế

| Hạng mục | Trạng thái | Chi tiết |
|---|---|---|
| Vercel project | ✅ ĐÃ TẠO | `centosy-arena` · team `anhhoakute-s-projects` |
| `VITE_SUPABASE_URL` | ✅ ĐÃ THÊM | Trong Vercel project settings |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ ĐÃ THÊM | Trong Vercel project settings |
| Production URL | ✅ LIVE | `https://centosy-arena.vercel.app` |
| Build status | ✅ READY | Deploy `dpl_7vUZexjjAs7cR6jotUEr3FTDBoQQ` |
| Git email đã fix | ✅ | `hoatiktok3@gmail.com` — khớp Vercel account |

---

## 7. .env.local (local machine — KHÔNG commit)

```
VITE_SUPABASE_URL=https://avprramyljytezenekwx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_yu8V1W7q-ilBnsTH7WyQzA_lATq8rB4
```

---

## 8. Những gì đã làm trong session này (Session 06)

| STEP | Nội dung | Trạng thái |
|---|---|---|
| STEP 25A | Product Completion Audit | ✅ DONE — Ready score 7.5/10 |
| STEP 25B | Upgrade Home Dashboard | ✅ DONE — Dùng Supabase thật, CTA "Chơi ngay" nối Games tab |
| STEP 24-BLOCKER | Fix Vercel env crash + git email BLOCKED | ✅ DONE — App live, không còn màn đen |
| Logo fix | CSS filter xoá nền trắng logo | ✅ DONE — `invert(1) hue-rotate(180deg)` + `mix-blend-mode: screen` |
| Password toggle | Show/hide password trên LoginScreen | ✅ DONE — icon mắt, đổi màu cam khi hiện |

---

## 9. New Feature Goal — STEP 26: Employee Self Registration

Bước tiếp theo là nâng cấp hệ thống đăng ký nhân viên.

**Mục tiêu STEP 26:**
- Nhân viên tự đăng ký tài khoản (email + mật khẩu + họ tên)
- Nhân viên chọn khối tổ chức:
  - Cửa hàng
  - Kho
  - Văn phòng
- Nếu chọn Văn phòng, nhân viên chọn bộ phận:
  - Thương mại điện tử
  - Kinh doanh thị trường
  - Mua hàng
  - Kế toán
  - Hành chính nhân sự
  - Marketing
  - Giám đốc
- Tài khoản mới **không được vào app ngay**
- Tài khoản mới mặc định ở trạng thái `pending`
- Admin duyệt xong mới được vào app
- Admin có thể từ chối hoặc tạm khóa tài khoản
- **Không bật signup public tự do không kiểm soát**

---

## 10. STEP 26 Roadmap

```
STEP 26A — Upgrade profiles schema for employee self-registration
STEP 26B — Create Employee Register Screen
STEP 26C — Connect Login and Register flow
STEP 26D — Block pending accounts from entering app
STEP 26E — Add Admin approval queue for new employee accounts
STEP 26F — Add department filters to Rank and Profile display
STEP 26G — QA employee registration flow
STEP 26H — Update SESSION_HANDOFF after STEP 26
```

Không nhảy bước. Không làm nhiều step cùng lúc.

---

## 11. Recommended Next Step Only

**Next step: STEP 26A — Upgrade profiles schema for employee self-registration**

Reason:
Cần cập nhật database trước khi làm UI RegisterScreen. Profiles cần thêm:
- `org_group` (cửa hàng / kho / văn phòng)
- `office_department` (nullable — chỉ có khi chọn Văn phòng)
- `account_status` enum: `pending` / `approved` / `rejected` / `suspended`
- `reviewed_by` (admin UUID)
- `reviewed_at` (timestamp)

Likely file to create:
- `supabase/employee_registration.sql`

Do not touch (ở STEP 26A):
- AuthContext
- LoginScreen
- RegisterScreen (chưa tồn tại)
- AdminPanel
- Rank Page
- Game logic
- UI tổng thể
- Vercel deploy

---

## 12. Important Rules For STEP 26

- Không dùng `service_role` key trong frontend
- Không hardcode key thật trong source code
- Không cho user tự chọn role `admin`
- Không cho user tự set `account_status = approved`
- Không cho người đăng ký mới vào app khi chưa được duyệt
- Không mở quyền staff xem toàn bộ profiles
- Không tắt RLS
- Không refactor toàn bộ project
- Không phá UI MVP
- Mỗi prompt chỉ làm 1 step nhỏ
- Sau mỗi step báo DONE STEP + files changed + notes + cách test nhanh
- Nếu việc nằm trên Supabase dashboard thì ghi CANNOT VERIFY IN CODE

---

## 13. Prompt To Start New Session

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

2. Trạng thái Auth / Supabase / Deploy:
- ...

3. Trạng thái dữ liệu game / rank / admin:
- ...

4. Tính năng chuẩn bị làm:
- STEP 26 — Employee Self Registration

5. Step tiếp theo duy nhất:
- STEP 26A — Upgrade profiles schema for employee self-registration

6. Những việc không được tự làm:
- ...

Sau đó chờ tôi đưa prompt STEP 26A.
```
