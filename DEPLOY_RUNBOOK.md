# CENTOSY ARENA — Deploy Runbook MVP
**Version:** v1.0-step85  
**Cập nhật:** 2026-06-07

---

## TỔNG QUAN

3 bước chính:
1. **[A] Supabase** — Chạy SQL, tạo admin
2. **[B] Vercel** — Deploy, cấu hình env vars
3. **[C] Test flow** — Đăng ký → duyệt → chơi game → kiểm điểm

---

## [A] SUPABASE SETUP

### A1. Chạy SQL theo đúng thứ tự

Vào **Supabase Dashboard → SQL Editor → New query**. Paste từng file, chạy theo thứ tự dưới đây.

> ⚠️ Chú ý: Tất cả file đều dùng `IF NOT EXISTS` — idempotent, chạy lại không hỏng.

---

#### BƯỚC 1 — Base schema + Auth trigger
**File:** `supabase/schema.sql`
```
Tạo: profiles table, RLS policies, handle_new_user trigger, is_admin() function
```

---

#### BƯỚC 2 — Role nâng cấp (manager, director, employee)
**File:** `supabase/role_upgrade.sql`
```
Thêm: manager, director, employee vào enum user_role
Thêm: is_director(), is_manager() functions
```

---

#### BƯỚC 3 — Self-registration + account_status
**File:** `supabase/employee_registration.sql`
```
Thêm cột: org_group, office_department, account_status
Tạo enum: org_group_type, office_department_type, account_status_type
Cập nhật trigger: handle_new_user → set pending khi tự đăng ký
```

---

#### BƯỚC 4 — User status (inactive, resigned)
**File:** `supabase/user_status.sql`
```
Thêm: resigned_at column
Tạo: set_user_status() RPC function
```

---

#### BƯỚC 5 — Missions + approval
**File:** `supabase/missions.sql`
```
Tạo: missions table, mission_submissions table
RLS: employee tự submit, manager approve
```

---

#### BƯỚC 6 — Mission points trigger
**File:** `supabase/mission_points_trigger.sql`
```
Trigger: tự cộng/trừ điểm khi admin approve/reject mission
Chạy SAU missions.sql
```

---

#### BƯỚC 7 — Badges + Wall of Fame
**File:** `supabase/badges.sql`
```
Tạo: user_badges table
Seed: badge definitions
RLS: user xem badges của mình, admin thêm badge
```

---

#### BƯỚC 8 — Notifications
**File:** `supabase/notifications.sql`
```
Tạo: notifications table
RLS: user xem notifications của mình
```

---

#### BƯỚC 9 — Leaderboard view (optional, tăng performance)
**File:** `supabase/leaderboard_view.sql`
```
Tạo: leaderboard_view (safe public view, không lộ email)
```

---

#### BƯỚC 10 — Game sessions + answer log
**File:** `supabase/game_session_answer_log.sql`
```
Tạo: game_sessions table, game_answers table
Indexes: user_id, game_key
RLS: user tự đọc/ghi session của mình
```

---

#### BƯỚC 11 — score_credited column + RPC chống trùng điểm
**File:** `supabase/rpc_add_game_score_safe.sql`
```
Thêm cột: game_sessions.score_credited (DEFAULT false)
Tạo RPC: add_game_score_safe(user_id, session_id, points) SECURITY DEFINER
Index: game_sessions(user_id, game_key, score_credited)
```
> ⚠️ File này PHẢI chạy sau bước 10 (game_sessions đã tồn tại)

---

#### BƯỚC 12 — Peer Praise
**File:** `supabase/peer_praise.sql`
```
Tạo: peer_praises table
RLS: user gửi lời khen, không tự khen mình
```

---

#### BƯỚC 13 — Stories
**File:** `supabase/stories.sql`
```
Tạo: centosy_stories table
RLS: user submit, admin approve, all read approved
```

---

#### BƯỚC 14 — Inspiration Voting
**File:** `supabase/inspiration_voting.sql`
```
Tạo: inspiration_nominations, inspiration_votes tables
RLS: 1 vote/period/user
```

---

#### BƯỚC 15 — Reward Redemptions
**File:** `supabase/reward_redemptions.sql`
```
Tạo: reward_redemptions table
RLS: user tự redemption của mình, admin xem tất cả
```

---

#### BƯỚC 16 — Daily Checkins
**File:** `supabase/daily_checkins.sql`
```
Tạo: daily_checkins table
RLS: user tự check-in của mình
```

---

#### BƯỚC 17 — Feedback
**File:** `supabase/feedback.sql`
```
Tạo: feedback table
RLS: user submit, admin xem tất cả
```

---

#### BƯỚC 18 — Game Results (legacy, optional)
**File:** `supabase/game_results.sql`
```
Tạo: game_results table (bảng cũ trước STEP 66)
Chạy nếu muốn giữ backward compat — không bắt buộc
```

---

### A2. Thêm Admin RLS cho game_sessions (QUAN TRỌNG)

Sau bước 10, chạy thêm snippet này để admin/manager xem được tất cả sessions trong Game Monitor:

```sql
-- Admin + Manager xem tất cả game sessions
CREATE POLICY "admin select all sessions"
  ON game_sessions FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('admin', 'director', 'manager')
  );

-- Admin + Manager xem tất cả answers
CREATE POLICY "admin select all answers"
  ON game_answers FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid())
    IN ('admin', 'director', 'manager')
  );
```

---

### A3. Tạo tài khoản Admin đầu tiên

1. Vào app → đăng ký bình thường với email admin (vd: `admin@centosy.vn`)
2. Vào **Supabase Dashboard → Table Editor → profiles**
3. Tìm row email admin → chỉnh tay:
   ```
   role            = admin
   account_status  = approved
   is_active       = true
   org_group       = van-phong
   full_name       = [Tên Admin]
   title           = Quản trị viên
   ```
4. Login lại → vào Profile → thấy "Khu vực quản trị" ✅

---

### A4. Seed dữ liệu missions ban đầu

Vào SQL Editor, chạy ví dụ:

```sql
INSERT INTO public.missions (title, description, points, target_org_group, mission_type, is_active)
VALUES
  ('Giới thiệu 1 khách mới trong tuần', 'Chụp ảnh kèm note tên khách', 50, 'cua-hang', 'task', true),
  ('Hoàn thành bài kiểm tra sản phẩm', 'Đạt 80% trên Training Test', 30, null, 'challenge', true),
  ('Check-in đúng giờ 5 ngày liên tiếp', 'Không trễ quá 5 phút', 20, null, 'kpi', true);
```

---

### A5. Kiểm tra Supabase Realtime

Vào **Supabase Dashboard → Database → Replication → Supabase Realtime**:
- Bật Realtime cho bảng: `game_sessions`, `game_answers`, `notifications`, `peer_praises`

---

## [B] VERCEL DEPLOY

### B1. Cài Vercel CLI (nếu chưa có)

```bash
npm i -g vercel
```

### B2. Login và link project

```bash
vercel login
vercel link
```

### B3. Set Environment Variables

Vào **Vercel Dashboard → Project → Settings → Environment Variables**, thêm:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_SUPABASE_URL` | `https://avprramyljytezenekwx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_yu8V1W7q-ilBnsTH7WyQzA_lATq8rB4` | Production, Preview, Development |

> ⚠️ Đây là Publishable Key (client-safe). KHÔNG dùng service_role key.

### B4. Deploy

```bash
vercel --prod
```

Hoặc push lên GitHub → Vercel tự build nếu đã kết nối repo.

### B5. Cấu hình Supabase Auth Redirect URL

Vào **Supabase Dashboard → Authentication → URL Configuration**:
- **Site URL:** `https://your-vercel-url.vercel.app`
- **Redirect URLs:** `https://your-vercel-url.vercel.app/**`

---

## [C] TEST FLOW — Kiểm tra end-to-end

### C1. Flow đăng ký + duyệt

```
1. Mở app trên Vercel URL
2. Click "Đăng ký" → điền đầy đủ thông tin
3. Login bằng tài khoản admin → vào Profile → Admin Panel
4. Tab "Chờ duyệt" → Duyệt tài khoản nhân viên vừa đăng ký
5. Nhân viên login lại → vào app bình thường ✅
```

**Kỳ vọng:**
- Sau đăng ký: account_status = `pending` → bị chặn ở PendingApprovalScreen
- Sau khi admin duyệt: vào app được

---

### C2. Flow chơi game → điểm

```
1. Login bằng tài khoản nhân viên
2. Tab Games → "Quiz Kiến Thức Sản Phẩm" → Bắt đầu
3. Trả lời 10 câu
4. Xem điểm + toast (nếu top 3 hoặc personal best)
5. Tab Games → 🏆 Xếp hạng → kiểm tra tên xuất hiện
6. Tab Profile → kiểm tra "Tổng điểm" đã cộng
```

**Kỳ vọng:**
- Điểm xuất hiện trong `game_sessions` (Supabase)
- `score_credited = true` sau lần đầu
- Lần 2 cùng ngày: `score_credited = false`, điểm 0
- Profile score tăng đúng

---

### C3. Flow missions

```
1. Login nhân viên → tab Missions
2. Thấy danh sách nhiệm vụ phù hợp phòng ban
3. Click "Hoàn thành" → điền note → gửi
4. Login admin → AdminPanel → duyệt nhiệm vụ
5. Kiểm tra điểm nhân viên tăng
```

---

### C4. Flow admin tools

```
1. Login admin → Profile → Khu vực quản trị
2. Mở "Game Monitor" → thấy sessions gần đây
3. Mở "Export Kết Quả Giải" → tải CSV Season Leaderboard
4. Mở "TV / Projector Mode" → fullscreen leaderboard
```

---

### C5. Kiểm tra bảo mật cơ bản

```
1. Thử truy cập admin tools bằng tài khoản employee → không thấy nút admin ✅
2. Thử inspect network → không có service_role key trong headers ✅
3. CSV export không chứa password/token ✅
```

---

## CHECKLIST TRƯỚC KHI MỞ CHO NHÂN VIÊN

- [ ] Tất cả 18 bước SQL đã chạy thành công
- [ ] Admin RLS policies cho game_sessions đã thêm
- [ ] Tài khoản admin đầu tiên đã set role=admin thủ công
- [ ] Ít nhất 3 missions đã seed
- [ ] Supabase Realtime đã bật cho game_sessions
- [ ] Vercel env vars đã set đúng
- [ ] Supabase redirect URL đã cấu hình
- [ ] Test flow C1 đăng ký → duyệt thành công
- [ ] Test flow C2 chơi game → điểm cộng đúng
- [ ] Test flow C3 missions → duyệt → điểm tăng

---

## LƯU Ý SAU KHI LAUNCH

- Theo dõi `game_sessions` để phát hiện lỗi sớm
- Nếu điểm không cộng: kiểm tra RPC `add_game_score_safe` đã chạy chưa
- Nếu user pending mãi không được duyệt: admin vào AdminPanel → tab "Chờ duyệt"
- Export CSV chỉ admin mới thấy nút — nhân viên không có quyền
