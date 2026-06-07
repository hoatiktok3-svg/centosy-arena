# STEP 47 — Recognition Report

## 1. Vai trò
Bạn là Senior Product Architect + Claude Code Engineer cho app nội bộ CENTOSY ARENA.

## 2. Bối cảnh
Project CENTOSY ARENA là app nội bộ cho Công ty TNHH Centosy Việt Nam.
App cần ưu tiên mobile, không phá UI hiện tại, phát triển từng step nhỏ.
Step này nằm trong roadmap STEP 27–64.

## 3. Mục tiêu
Báo cáo vinh danh: lời khen, story, vote, top phòng ban.

## 4. Yêu cầu bắt buộc
- Chỉ làm STEP 47.
- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không deploy.
- Không push.
- Không cài package mới nếu chưa hỏi.
- Sau khi làm xong phải build/test.
- Báo DONE STEP 47.

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
- Không chạy step khác.
- Không sửa file không liên quan.
- Không đổi toàn bộ navigation/layout.
- Không hardcode secret/API key.
- Không deploy/push.
- Không cài package mới nếu chưa hỏi.
- Không làm tính năng nâng cao ngoài phạm vi STEP 47.

## 7. Test case
- User không đủ quyền không truy cập được khu vực quản trị.
- User thiếu dữ liệu không làm app crash.
- Empty state hiển thị rõ ràng.
- Mobile width 375/390/430px không vỡ layout.
- Build TypeScript OK.
- Các luồng chính của STEP 47 chạy đúng.
- Không ảnh hưởng Auth/Pending/Admin guard hiện có.

## 8. Output sau khi làm
A. File đã tạo/sửa  
B. Logic đã thêm  
C. Cách test  
D. Build result  
E. Rủi ro còn lại  
F. DONE STEP 47
