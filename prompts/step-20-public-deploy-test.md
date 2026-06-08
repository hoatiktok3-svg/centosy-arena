# STEP 20 - CHUẨN BỊ PUBLIC DEPLOY ĐỂ TEST

## Mục tiêu
Chuẩn bị app để đưa lên link công khai cho nhân viên test thử.

## Yêu cầu kiểm tra
1. Project có thể build được.
2. Biết lệnh build chính xác.
3. Biết nền tảng deploy phù hợp:
   - Vercel nếu là Next.js/React/Vite frontend
   - Netlify nếu phù hợp
   - Render/Railway nếu có backend
4. Tạo hướng dẫn deploy ngắn cho người dùng.
5. Tạo checklist trước khi gửi link test.

## Việc cần làm
1. Kiểm tra package.json.
2. Xác định lệnh chạy local và build.
3. Tạo file DEPLOY_GUIDE.md.
4. Tạo file TEST_CHECKLIST.md.
5. Không tự deploy nếu chưa có tài khoản/token/quyền.
6. Nếu có thể, chuẩn bị cấu hình Vercel phù hợp.

## Nội dung TEST_CHECKLIST cần có
- Đăng nhập Admin
- Đăng nhập Nhân viên
- Vào game
- Chơi game
- Xem điểm
- Xem bảng xếp hạng
- Kiểm tra trên điện thoại
- Ghi lỗi phản hồi

## Kết quả mong muốn
- Dự án sẵn sàng đưa lên public test.
- Người dùng biết cần bấm gì/làm gì tiếp theo.

## Không được làm
- Không tạo tài khoản Vercel/GitHub thay người dùng nếu không được yêu cầu.
- Không public dữ liệu nhạy cảm.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
