# STEP 87 — Make Webhook Auto Report

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA đã có roadmap đến STEP 85. Từ đây ưu tiên dữ liệu thật, tự động hóa, AI insight, backup và vận hành chuyên nghiệp.
Không refactor toàn bộ project. Không phá UI hiện tại.

## 3. Mục tiêu
Tạo nền móng gửi báo cáo tự động qua Make webhook: kết quả giải đấu, báo cáo tuần, cảnh báo quản lý.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 87.
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
- Tạo webhookService với sendReportToWebhook(payload).
- Không hardcode webhook URL; đọc từ env hoặc admin settings.
- Tạo 3 report payload: tournament_result, weekly_summary, manager_alerts.
- Admin/director có nút Test Webhook.
- Ghi activity log khi gửi webhook nếu đã có.
- Tạo MAKE_WEBHOOK_REPORT_GUIDE.md.
- Build TypeScript OK.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không xóa dữ liệu cũ.
- Không gửi dữ liệu thật ra ngoài nếu chưa xác nhận.
- Không làm tính năng ngoài phạm vi STEP 87.

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
F. DONE STEP 87

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy STEP 88 — Zalo/Telegram thông báo nội bộ
2. Commit checkpoint STEP 87
3. Audit lại STEP 87
