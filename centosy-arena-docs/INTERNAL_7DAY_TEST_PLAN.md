# CENTOSY ARENA — Kế hoạch Test Nội bộ 7 Ngày
> STEP 38 | Dành cho 10 nhân viên tester đầu tiên

---

## Tổng quan

| Hạng mục | Chi tiết |
|----------|---------|
| Thời gian | 7 ngày liên tục (D1–D7) |
| Số tester | 10 nhân viên (đa vai trò) |
| URL | https://centosy-arena.vercel.app |
| Người điều phối | anh Hoá (dev lead) |
| Kênh báo lỗi | App → Profile → "Báo lỗi / Góp ý" |

---

## Thành phần nhóm test

| STT | Vai trò | Số lượng | Mục tiêu |
|-----|---------|---------|---------|
| 1 | Admin | 1 | Quản lý tài khoản, duyệt mission, xem feedback |
| 2 | Director | 1 | Director Dashboard, tổng quan công ty |
| 3 | Manager Cửa hàng | 2 | Team Dashboard, duyệt mission cửa hàng |
| 4 | Manager Kho | 1 | Team Dashboard, duyệt mission kho |
| 5 | Employee Cửa hàng | 3 | Game, nhiệm vụ, bảng xếp hạng |
| 6 | Employee Văn phòng | 2 | Game, nhiệm vụ, notification |

---

## Lịch test 7 ngày

### D1 — Onboarding & Auth

**Mục tiêu:** Toàn bộ 10 người đăng ký và vào được app.

**Nhân viên làm:**
- [ ] Vào https://centosy-arena.vercel.app → bấm "Đăng ký"
- [ ] Điền: họ tên đầy đủ, email công ty, mật khẩu (tối thiểu 6 ký tự), khối, bộ phận
- [ ] Bấm đăng ký → thấy màn "Chờ duyệt" → chụp màn hình gửi admin

**Admin làm:**
- [ ] Vào Profile → Admin Panel → tab duyệt tài khoản
- [ ] Duyệt toàn bộ 10 người (gán đúng role theo bảng trên)
- [ ] Báo nhân viên đã duyệt xong

**Kiểm tra:**
- [ ] Tất cả 10 người login được
- [ ] Role hiển thị đúng trên Profile
- [ ] Khối / bộ phận hiển thị đúng

---

### D2 — Khám phá Home & Profile

**Mục tiêu:** Nắm giao diện chính.

**Nhân viên làm:**
- [ ] Đăng nhập → khám phá tất cả tab bottom nav (Home, Game, Rank, Vinh danh, Nhiệm vụ, Profile)
- [ ] Vào Profile → xem điểm, rank, huy hiệu
- [ ] Bấm "Báo lỗi / Góp ý" → gửi 1 góp ý đầu tiên (dù chưa có vấn đề gì)

**Manager/Director/Admin làm:**
- [ ] Vào Profile → kiểm tra card riêng của role mình (Team Dashboard / Director Dashboard / Admin Panel)
- [ ] Mở xem thử — xác nhận hiển thị đúng

**Admin làm:**
- [ ] Mở Admin Panel → xem phần "Phản hồi nhân viên" → đọc feedback D1

---

### D3 — Game & Bảng xếp hạng

**Mục tiêu:** Test luồng chơi game và leaderboard.

**Nhân viên làm:**
- [ ] Vào tab Game → chọn 1 game → chơi đến hết
- [ ] Chơi ít nhất 3 lượt trong ngày
- [ ] Vào tab Bảng xếp hạng → xem rank cá nhân và toàn bộ danh sách
- [ ] Kiểm tra điểm sau khi chơi có cập nhật không

**Ghi nhận:**
- [ ] Game load nhanh không? (dưới 3 giây)
- [ ] Điểm cộng đúng không?
- [ ] Rank cập nhật sau khi chơi không?

---

### D4 — Nhiệm vụ (Employee)

**Mục tiêu:** Nhân viên nộp mission, manager duyệt.

**Nhân viên làm:**
- [ ] Vào tab Nhiệm vụ → xem danh sách
- [ ] Chọn 1 nhiệm vụ phù hợp khối → bấm "Nộp"
- [ ] Điền link bằng chứng (hoặc nhập mô tả) → submit
- [ ] Vào tab "Của tôi" → xem submission vừa nộp

**Manager làm:**
- [ ] Vào tab Nhiệm vụ → tab "Duyệt"
- [ ] Xem submission của nhân viên khối mình
- [ ] Duyệt 1 cái → xác nhận điểm cộng vào nhân viên đó
- [ ] Từ chối 1 cái (nếu có thể test)

**Kiểm tra:**
- [ ] Điểm nhân viên tăng ngay sau khi approved không?
- [ ] Notification có gửi cho nhân viên khi được duyệt không?

---

### D5 — Notification & Team Dashboard

**Mục tiêu:** Test thông báo và dashboard đội nhóm.

**Manager/Admin làm (gửi thông báo):**
- [ ] Vào Notification Center (chuông) → mở form gửi thông báo
- [ ] Gửi 1 thông báo chung cho toàn bộ nhân viên
- [ ] Xác nhận nhân viên nhận được (badge đỏ trên chuông)

**Nhân viên làm:**
- [ ] Thấy badge đỏ trên chuông → bấm vào
- [ ] Đọc thông báo → badge giảm
- [ ] "Đánh dấu tất cả đã đọc"

**Manager làm (Team Dashboard):**
- [ ] Profile → Team Dashboard → xem KPI đội mình
- [ ] Sort danh sách theo điểm / tên
- [ ] Xem top performer đúng không

---

### D6 — Director Dashboard & Honor Wall

**Mục tiêu:** Test tính năng cấp cao.

**Director/Admin làm:**
- [ ] Profile → Director Dashboard → xem KPI toàn công ty
- [ ] Kiểm tra breakdown 3 khối có đúng số liệu không
- [ ] Xem Top 5 performers

**Admin làm (trao huy hiệu):**
- [ ] Vào Honor Wall (tab Vinh danh)
- [ ] Trao 1 huy hiệu cho nhân viên có thành tích tốt nhất trong 5 ngày
- [ ] Nhân viên vào Profile → xem huy hiệu mới

**Nhân viên làm:**
- [ ] Kiểm tra Profile → grid huy hiệu cập nhật không

---

### D7 — Tổng kết & Báo cáo

**Mục tiêu:** Thu thập feedback, đánh giá tổng thể.

**Tất cả tester làm:**
- [ ] Vào Profile → "Báo lỗi / Góp ý"
- [ ] Gửi ít nhất 1 phản hồi tổng kết: điều thích nhất, điều cần cải thiện

**Admin làm:**
- [ ] Admin Panel → Phản hồi nhân viên → đọc tất cả
- [ ] Resolve các feedback đã đọc
- [ ] Ghi lại danh sách bug cần fix và tính năng cần bổ sung

**Admin tổng hợp:**
- [ ] Số người active 7 ngày: ___/10
- [ ] Tổng game đã chơi: ___
- [ ] Tổng mission nộp: ___, duyệt: ___
- [ ] Số feedback nhận được: ___
- [ ] Bug nghiêm trọng (high severity): ___

---

## Script mẫu gửi nhân viên (copy & paste)

```
Xin chào team!

Centosy Arena — App nội bộ của công ty đã sẵn sàng để test thử.
Nhờ mọi người dành ~10 phút mỗi ngày trong 7 ngày tới để trải nghiệm nhé.

📱 Link app: https://centosy-arena.vercel.app

Hướng dẫn bắt đầu:
1. Mở link trên điện thoại (Chrome)
2. Bấm "Đăng ký" → điền thông tin
3. Chờ anh [Admin] duyệt (trong vòng 30 phút)
4. Đăng nhập và khám phá!

Nếu gặp lỗi hoặc có góp ý:
→ Vào Profile → "Báo lỗi / Góp ý" → gửi trực tiếp trong app

Cảm ơn mọi người! 🎮
```

---

## Script mẫu cho Admin (D1 setup)

```
Checklist ngày 1 cho Admin:

1. Vào https://centosy-arena.vercel.app
2. Đăng nhập tài khoản Admin
3. Vào Profile → Admin Panel → tab "Tài khoản chờ duyệt"
4. Duyệt lần lượt từng người, gán role đúng:
   - Giám đốc → role: director
   - Trưởng nhóm → role: manager
   - Nhân viên thường → role: employee
5. Sau khi duyệt xong → báo nhân viên thử đăng nhập lại

Lưu ý: Nếu cần đổi role sau khi duyệt →
vào Supabase Dashboard → bảng profiles → sửa cột "role"
```

---

## Tiêu chí đánh giá MVP

| Tiêu chí | Ngưỡng đạt | Kết quả |
|----------|-----------|---------|
| Tỷ lệ đăng ký thành công | ≥ 90% (9/10 người) | |
| Không crash nghiêm trọng | 0 crash làm mất data | |
| Game chạy được | ≥ 80% lượt chơi thành công | |
| Mission flow đầu cuối | Admin duyệt được, điểm cộng đúng | |
| Feedback nhận được | ≥ 5 phản hồi | |
| Thời gian load trang đầu | < 5 giây trên 4G | |
