# STEP 73 — Season Leaderboard

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA là app nội bộ cho Công ty TNHH Centosy Việt Nam.
App đang được triển khai theo roadmap sau STEP 47.
Nhân viên dùng trên điện thoại là chính.
Không được phá UI hiện tại, không refactor toàn bộ project.

## 3. Mục tiêu
Bảng xếp hạng theo mùa thi đua.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 73.
- Không chạy step khác.
- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không deploy.
- Không push.
- Không cài package mới nếu chưa hỏi.
- Nếu phát hiện thiếu dependency từ step trước, dừng lại và báo rõ.
- Sau khi làm xong phải build/test.
- Khi DONE phải gợi ý lựa chọn 1-2-3.

## 5. Nhiệm vụ kỹ thuật
- Đọc rules trong `centosy-arena-prompts/00_PROJECT_RULES/` trước khi làm.
- Kiểm tra project hiện tại có sẵn model/component/service liên quan chưa.
- Tận dụng code hiện có, không tạo trùng logic nếu không cần.
- Tạo hoặc cập nhật component/service/helper theo đúng mục tiêu step.
- Áp dụng phân quyền theo role nếu tính năng liên quan dữ liệu quản trị.
- Ưu tiên giao diện mobile-friendly, card/list đơn giản.
- Nếu cần mock data thì ghi rõ phần nào là mock, phần nào là dữ liệu thật.
- Nếu cần schema/migration thì chỉ làm nhẹ nhàng, không phá bảng cũ.
- Chạy build/typecheck sau khi hoàn thành.

## 6. Không được làm
- Không sửa lan sang module khác nếu không cần.
- Không đổi toàn bộ layout/navigation.
- Không hardcode secret/API key.
- Không xóa dữ liệu cũ.
- Không làm tính năng ngoài phạm vi STEP 73.
- Không deploy/push khi chưa có yêu cầu.

## 7. Test case
- User đúng quyền truy cập được.
- User không đủ quyền bị chặn đúng.
- Empty state không crash.
- Mobile 375/390/430px không vỡ.
- Build TypeScript OK.
- Luồng chính của STEP 73 chạy đúng.
- Không làm hỏng Auth/Admin guard/Leaderboard hiện có.

## 8. Output sau khi làm
A. File đã tạo/sửa  
B. Logic đã thêm  
C. Cách test  
D. Build result  
E. Rủi ro còn lại  
F. DONE STEP 73

## 9. BƯỚC TIẾP THEO — CHỌN 1
1. Chạy STEP 74 — bước tiếp theo theo roadmap
2. Commit checkpoint STEP 73
3. Audit lại STEP 73
