# STEP 88 — Zalo/Telegram Internal Notifications

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA đã có roadmap đến STEP 85. Từ đây ưu tiên dữ liệu thật, tự động hóa, AI insight, backup và vận hành chuyên nghiệp.
Không refactor toàn bộ project. Không phá UI hiện tại.

## 3. Mục tiêu
Chuẩn bị kênh thông báo nội bộ qua Telegram/Zalo/Make khi có vinh danh, giải đấu kết thúc, nhiệm vụ pending.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 88.
- Không chạy step khác.
- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không deploy.
- Không push.
- Không cài package mới nếu chưa hỏi.
- Không hardcode API key, webhook URL, service role key, password/token.
- Nếu thiếu dependency từ step trước, dừng lại và báo rõ.
- Sau khi làm xong phải build/test nếu có sửa code.
- Khi DONE phải gợi ý lựa chọn 1-2-3.

## 5. Nhiệm vụ kỹ thuật
- Tạo notification payload templates: recognition, tournament_finished, pending_approval, manager_alert.
- Ưu tiên Make webhook để gửi Telegram/Zalo, không tích hợp SDK trực tiếp nếu chưa cần.
- Admin có nút Send Test Notification.
- Không gửi spam; có throttle/cooldown đơn giản nếu cần.
- Không lộ dữ liệu nhạy cảm trong message.
- Tạo INTERNAL_NOTIFICATION_CHANNEL_GUIDE.md.
- Build TypeScript OK.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không xóa dữ liệu cũ.
- Không gửi dữ liệu thật ra ngoài nếu chưa xác nhận.
- Không làm tính năng ngoài phạm vi STEP 88.

## 7. Test case
- User đúng quyền truy cập được.
- User không đủ quyền bị chặn đúng.
- Empty state không crash.
- Mobile 375/390/430px không vỡ.
- Build TypeScript OK nếu có sửa code.
- Không làm hỏng Auth/Admin guard/Leaderboard hiện có.

## 8. Output sau khi làm
A. File đã tạo/sửa  
B. Logic đã thêm  
C. Cách test  
D. Build result  
E. Rủi ro còn lại  
F. DONE STEP 88

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy STEP 89 — AI Team Insight
2. Commit checkpoint STEP 88
3. Audit lại STEP 88
