# STEP 04 - TẠO HỆ THỐNG ĐĂNG NHẬP ADMIN VÀ NHÂN VIÊN

## Mục tiêu
Tạo hệ thống đăng nhập cơ bản có 2 vai trò: Admin và Nhân viên.

## Tài khoản mẫu
- Admin: admin@centosy.vn / 123456
- Nhân viên: staff@centosy.vn / 123456

## Yêu cầu chức năng
1. Có màn hình đăng nhập.
2. Người dùng nhập email và mật khẩu.
3. Xác định role sau khi đăng nhập.
4. Lưu trạng thái đăng nhập ở localStorage/sessionStorage hoặc state phù hợp.
5. Có nút đăng xuất.
6. Sai tài khoản/mật khẩu thì báo lỗi rõ ràng.

## Việc cần làm
1. Tạo dữ liệu user mẫu.
2. Tạo logic login/logout.
3. Tạo màn hình login mobile-friendly.
4. Sau đăng nhập:
   - Admin vào dashboard admin
   - Nhân viên vào home nhân viên
5. Không cần bảo mật nâng cao trong step này.

## Kết quả mong muốn
- Đăng nhập được bằng 2 tài khoản mẫu.
- Phân biệt được Admin/Nhân viên.
- Có đăng xuất.

## Không được làm
- Không tích hợp backend thật nếu chưa có yêu cầu.
- Không thêm đăng ký tài khoản trong step này.
- Không làm game trong step này.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
