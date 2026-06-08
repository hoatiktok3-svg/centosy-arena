# STEP 05 - TẠO PHÂN QUYỀN ROUTE THEO VAI TRÒ

## Mục tiêu
Không cho nhân viên truy cập trang Admin và không cho người chưa đăng nhập vào khu vực nội bộ.

## Yêu cầu chức năng
1. Người chưa đăng nhập chỉ thấy trang login.
2. Admin truy cập được dashboard Admin.
3. Nhân viên không truy cập được dashboard Admin.
4. Nếu truy cập sai quyền, hiển thị thông báo hoặc chuyển hướng phù hợp.
5. Có component hoặc helper kiểm tra quyền.

## Việc cần làm
1. Kiểm tra logic auth ở Step 04.
2. Tạo route guard/protected route phù hợp với framework hiện tại.
3. Bảo vệ các trang admin.
4. Bảo vệ các trang nhân viên nếu cần.
5. Test nhanh 3 trường hợp:
   - Chưa đăng nhập
   - Đăng nhập Admin
   - Đăng nhập Nhân viên

## Kết quả mong muốn
- Phân quyền rõ ràng.
- Không bị vào nhầm trang.
- App không crash khi refresh.

## Không được làm
- Không đổi lại toàn bộ auth nếu không cần.
- Không thêm tính năng mới ngoài phân quyền.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
