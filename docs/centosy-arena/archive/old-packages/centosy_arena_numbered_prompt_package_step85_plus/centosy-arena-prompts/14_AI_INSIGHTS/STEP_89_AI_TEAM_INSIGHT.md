# STEP 89 — AI Team Insight

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA đã có roadmap đến STEP 85. Từ đây ưu tiên dữ liệu thật, tự động hóa, AI insight, backup và vận hành chuyên nghiệp.
Không refactor toàn bộ project. Không phá UI hiện tại.

## 3. Mục tiêu
Tạo AI Insight nội bộ giúp admin/director hiểu đội nào mạnh/yếu, ai cần kích hoạt, nhiệm vụ nào hiệu quả.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 89.
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
- Không gọi API thật nếu chưa có env; tạo mock AI insight trước.
- Tạo insightService: buildTeamInsightData, generateTeamInsightMock, generateActionSuggestions.
- Dữ liệu đầu vào: active users, totalPoints, mission completion, game participation, feedback, recognition.
- UI Admin AI Insight gồm: điểm mạnh, điểm yếu, cảnh báo, đề xuất hành động tuần tới.
- Không đưa dữ liệu nhạy cảm ra AI nếu chưa có chính sách.
- Tạo AI_TEAM_INSIGHT_GUIDE.md.
- Build TypeScript OK.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không xóa dữ liệu cũ.
- Không gửi dữ liệu thật ra ngoài nếu chưa xác nhận.
- Không làm tính năng ngoài phạm vi STEP 89.

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
F. DONE STEP 89

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy STEP 90 — Backup Data & Restore Plan
2. Commit checkpoint STEP 89
3. Audit lại STEP 89
