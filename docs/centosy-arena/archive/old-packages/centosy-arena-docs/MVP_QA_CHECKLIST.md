# CENTOSY ARENA — MVP QA Checklist
> Version: MVP (STEP 28–34) | Cập nhật: 2026-06-07

---

## Môi trường test
- URL: https://centosy-arena.vercel.app
- Supabase: project `avprramyljytezenekwx` (Singapore)
- Thiết bị: Chrome mobile emulation 390px hoặc điện thoại thật
- Tài khoản test cần: 1 admin, 1 director, 1 manager (cua-hang), 1 employee

---

## Điều kiện tiên quyết (Admin phải làm trước)

- [ ] Chạy `supabase/employee_registration.sql` trên Supabase Dashboard
- [ ] Chạy `supabase/role_upgrade.sql`
- [ ] Chạy `supabase/missions.sql`
- [ ] Chạy `supabase/mission_points_trigger.sql`
- [ ] Chạy `supabase/badges.sql`
- [ ] Chạy `supabase/notifications.sql`
- [ ] Tạo ít nhất 5 tài khoản test qua đăng ký (hoặc seed trực tiếp vào DB)
- [ ] Admin duyệt các tài khoản → status = 'approved'
- [ ] Gán đúng role: admin/director/manager/employee

---

## MODULE 1 — Auth & Onboarding

### 1.1 Đăng ký tài khoản mới
- [ ] Vào trang Login → bấm "Đăng ký"
- [ ] Điền form: họ tên, email, mật khẩu, khối, bộ phận (nếu văn phòng)
- [ ] Submit → thấy màn hình "Chờ duyệt"
- [ ] Login lại với tài khoản vừa đăng ký → vẫn thấy màn "Chờ duyệt"

### 1.2 Admin duyệt tài khoản
- [ ] Login bằng Admin
- [ ] Vào Profile → Admin Panel → tab "Duyệt tài khoản"
- [ ] Thấy danh sách pending
- [ ] Bấm Duyệt → tài khoản chuyển approved
- [ ] Bấm Từ chối → nhập lý do → tài khoản chuyển rejected
- [ ] Tài khoản rejected đăng nhập → thấy màn hình thông báo bị từ chối + lý do

### 1.3 Show/hide mật khẩu
- [ ] Trang Login có icon mắt → toggle hiện/ẩn mật khẩu

---

## MODULE 2 — Home Dashboard (STEP 28)

### Employee view
- [ ] Login employee → trang Home hiển thị: role badge, tên, điểm, rank cá nhân
- [ ] Quick actions: Chơi game, Bảng xếp hạng, Vinh danh
- [ ] Bấm quick action → điều hướng đúng tab

### Manager/Admin view
- [ ] Login manager → quick actions thêm mục quản lý (Team/Admin)
- [ ] Rank cá nhân hiển thị (fetch từ leaderboard RPC)

---

## MODULE 3 — Missions (STEP 29–30)

### Tab Nhiệm vụ (Employee)
- [ ] Vào tab Nhiệm vụ → thấy danh sách missions đang mở
- [ ] Filter theo khối hoạt động
- [ ] Bấm "Nộp" trên 1 nhiệm vụ → sheet mở, hiện điểm sẽ cộng
- [ ] Điền link bằng chứng + ghi chú → Submit
- [ ] Tab "Của tôi" → thấy submission vừa nộp với status "Chờ duyệt"

### Tab Duyệt (Manager/Admin)
- [ ] Login manager → tab "Duyệt" hiện submissions pending
- [ ] Bấm Duyệt (+Nđ) → submission chuyển approved, điểm tự cộng vào profiles.score
- [ ] Bấm Từ chối → submission chuyển rejected
- [ ] Employee reload → điểm tổng tăng đúng

### Edge cases
- [ ] Nộp 2 lần cùng 1 mission → app không crash
- [ ] Mission hết hạn → không cho nộp (hoặc hiển thị rõ "Đã đóng")
- [ ] Mission list rỗng → empty state rõ ràng

---

## MODULE 4 — Badges & Honor Wall (STEP 31)

### Employee — Huy hiệu
- [ ] Vào Profile → thấy grid 12 huy hiệu
- [ ] Huy hiệu chưa đạt → icon 🔒, mờ
- [ ] Huy hiệu đã nhận → icon + màu rõ

### Honor Wall (HonorPage)
- [ ] Tab Vinh danh → thấy danh sách top nhân viên
- [ ] Admin/Manager thấy nút "Trao huy hiệu"
- [ ] Trao huy hiệu cho nhân viên → thành công (hoặc thông báo lỗi nếu chưa có SQL)

---

## MODULE 5 — Team Dashboard (STEP 32)

- [ ] Login manager → Profile → card "Team Dashboard" màu xanh lá
- [ ] Bấm → overlay mở full-screen
- [ ] Thấy KPI: số thành viên, tổng điểm, điểm TB, top performer
- [ ] Danh sách thành viên có thể sort
- [ ] Admin thấy filter "Toàn công ty" — manager chỉ thấy khối mình
- [ ] Employee (không phải manager) → KHÔNG thấy card Team Dashboard

---

## MODULE 6 — Notification Center (STEP 33)

- [ ] Header có icon chuông 🔔
- [ ] Số đỏ hiển thị nếu có thông báo chưa đọc
- [ ] Bấm chuông → overlay thông báo mở
- [ ] Đánh dấu đã đọc từng thông báo → số đỏ giảm
- [ ] "Đánh dấu tất cả đã đọc" → số về 0
- [ ] Filter "Chưa đọc" hoạt động
- [ ] Manager+ thấy form gửi thông báo → gửi → nhân viên nhận được
- [ ] Employee → KHÔNG thấy form gửi thông báo

---

## MODULE 7 — Director Dashboard (STEP 34)

- [ ] Login director hoặc admin → Profile → card "Director Dashboard" màu tím
- [ ] Bấm → overlay mở
- [ ] KPI tổng công ty: nhân viên active, tổng điểm, điểm TB, nhiệm vụ duyệt
- [ ] Cảnh báo pending accounts hiển thị nếu > 0
- [ ] Breakdown 3 khối với progress bar tương đối
- [ ] Top 5 performers với rank medal
- [ ] Employee/Manager (không phải director/admin) → KHÔNG thấy card

---

## MODULE 8 — Leaderboard & Games

- [ ] Tab Bảng xếp hạng → hiển thị danh sách real từ DB
- [ ] Rank theo điểm đúng thứ tự
- [ ] Tab Games → chọn quiz → chơi được → điểm cộng sau khi thắng
- [ ] Không crash khi không có dữ liệu

---

## Kiểm tra ngang (Cross-cutting)

### Phân quyền
- [ ] Employee không thấy Admin Panel, Team Dashboard, Director Dashboard
- [ ] Manager không thấy Admin Panel, Director Dashboard
- [ ] Director không thấy Admin Panel (chỉ admin)
- [ ] Không có route bypass — tất cả guard qua permissions.ts

### Mobile layout
- [ ] Test ở 375px (iPhone SE) — không vỡ layout
- [ ] Test ở 390px (iPhone 15) — không vỡ layout
- [ ] Test ở 430px (iPhone 15 Plus) — không vỡ layout
- [ ] Bottom nav không che content

### Edge / Empty state
- [ ] DB rỗng hoàn toàn → app không crash ở bất kỳ màn nào
- [ ] Mất mạng → hiển thị thông báo lỗi, không crash
- [ ] Tài khoản thiếu orgGroup (account cũ) → fallback department label

---

## Kết quả test

| Module | Tester | Pass | Fail | Ghi chú |
|--------|--------|------|------|---------|
| Auth & Onboarding | | | | |
| Home Dashboard | | | | |
| Missions | | | | |
| Badges & Honor | | | | |
| Team Dashboard | | | | |
| Notifications | | | | |
| Director Dashboard | | | | |
| Leaderboard & Games | | | | |
| Phân quyền | | | | |
| Mobile layout | | | | |
