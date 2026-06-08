# STEP 02 - THIẾT LẬP CẤU TRÚC THƯ MỤC CHUẨN

## Mục tiêu
Sắp xếp project thành cấu trúc dễ quản lý, dễ phát triển tiếp và không bị loạn khi thêm nhiều tính năng.

## Việc cần làm
1. Kiểm tra cấu trúc hiện tại.
2. Nếu phù hợp, tạo hoặc chuẩn hóa các thư mục:
   - components/
   - pages/ hoặc app/
   - lib/
   - data/
   - hooks/
   - styles/
   - types/
3. Tạo file data/mockData nếu chưa có database.
4. Tạo file cấu hình role/user nếu cần.
5. Không di chuyển file quan trọng nếu có nguy cơ lỗi build.
6. Nếu có thay đổi đường dẫn import, phải sửa lại import tương ứng.

## Kết quả mong muốn
- Cấu trúc thư mục rõ ràng.
- App vẫn chạy được.
- Các step sau có nơi đặt code hợp lý.

## Không được làm
- Không đổi framework.
- Không viết lại toàn bộ app.
- Không thêm auth/game trong step này.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
