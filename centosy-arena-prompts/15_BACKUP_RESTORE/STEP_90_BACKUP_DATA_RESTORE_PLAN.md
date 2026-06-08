# STEP 90 — Backup Data & Restore Plan

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA đã có roadmap đến STEP 85. Từ đây ưu tiên dữ liệu thật, tự động hóa, AI insight, backup và vận hành chuyên nghiệp.
Không refactor toàn bộ project. Không phá UI hiện tại.

## 3. Mục tiêu
Tạo kế hoạch backup/restore dữ liệu Supabase và export dữ liệu quan trọng trước khi mở rộng test thật.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 90.
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
- Tạo BACKUP_RESTORE_PLAN.md.
- Tạo DATA_EXPORT_CHECKLIST.md.
- Tạo danh sách bảng quan trọng cần backup: profiles, missions, game_results, training, reward, activity_logs.
- Không tự chạy backup production nếu chưa có xác nhận.
- Tạo hướng dẫn export CSV thủ công từ Supabase và từ app.
- Tạo checklist trước deploy/test rộng.
- Kiểm tra git status.
- Kết thúc bằng DONE STEP 90.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không xóa dữ liệu cũ.
- Không gửi dữ liệu thật ra ngoài nếu chưa xác nhận.
- Không làm tính năng ngoài phạm vi STEP 90.

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
F. DONE STEP 90

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy P0-01 — Fix Register Approval Flow
2. Commit checkpoint STEP 90
3. Audit lại STEP 90
