# STEP 86 — Google Sheet Sync thật cho kết quả giải đấu

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA đã có roadmap đến STEP 85. Từ đây ưu tiên dữ liệu thật, tự động hóa, AI insight, backup và vận hành chuyên nghiệp.
Không refactor toàn bộ project. Không phá UI hiện tại.

## 3. Mục tiêu
Đồng bộ kết quả giải đấu, leaderboard, award và suspicious sessions sang Google Sheet hoặc Make webhook an toàn.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 86.
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
- Audit export CSV hiện có từ STEP 85.
- Tạo service layer syncTournamentResultsToGoogleSheet nhưng không hardcode credential.
- Nếu chưa có Google API credential, tạo Make webhook fallback.
- Tạo cấu trúc sheet: TOURNAMENT_SUMMARY, INDIVIDUAL_RESULTS, TEAM_RESULTS, AWARDS, SUSPICIOUS_SESSIONS.
- Admin/director mới thấy nút Sync Google Sheet.
- Tạo GOOGLE_SHEET_TOURNAMENT_SYNC_GUIDE.md.
- Không tự gửi dữ liệu ra ngoài nếu chưa có env/webhook xác nhận.
- Build TypeScript OK.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không xóa dữ liệu cũ.
- Không gửi dữ liệu thật ra ngoài nếu chưa xác nhận.
- Không làm tính năng ngoài phạm vi STEP 86.

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
F. DONE STEP 86

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy STEP 87 — Make Webhook tự động báo cáo
2. Commit checkpoint STEP 86
3. Audit lại STEP 86
