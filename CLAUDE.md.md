# CLAUDE PROJECT RULES - CENTOSY INTERNAL GAME APP

Bạn đang làm việc trong dự án app nội bộ Centosy.

## Mục tiêu dự án
Xây dựng app nội bộ dùng trên điện thoại là chính, phục vụ:
1. Đăng nhập tài khoản Admin và Nhân viên.
2. Vinh danh nhân viên.
3. Tổ chức game tư duy, vui vẻ, công bằng, không phụ thuộc ChatGPT.
4. Quản lý điểm, bảng xếp hạng, lịch sử chơi.
5. Cho phép công khai link để nhân viên test.

## Nguyên tắc bắt buộc
1. Luôn đọc PROJECT_STATUS.md trước khi làm.
2. Luôn đọc PROMPT_QUEUE.md để biết step tiếp theo.
3. Chỉ làm 1 step tại một thời điểm, trừ khi người dùng yêu cầu rõ làm nhiều step.
4. Không tự nhảy step.
5. Không xóa code cũ nếu chưa giải thích lý do.
6. Không thiết kế lại toàn bộ app khi chỉ cần sửa một lỗi nhỏ.
7. Ưu tiên app chạy ổn trước, làm đẹp sau.
8. Ưu tiên mobile-first, giao diện dễ dùng trên điện thoại.
9. Sau mỗi step phải cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
10. Nếu gặp lỗi, chuyển step sang [ERROR], ghi rõ nguyên nhân và cách sửa đề xuất.

## Quy trình làm việc mặc định
1. Đọc PROJECT_STATUS.md.
2. Đọc PROMPT_QUEUE.md.
3. Tìm step đầu tiên có trạng thái [PENDING].
4. Mở file prompt tương ứng trong thư mục /prompts.
5. Tóm tắt ngắn step sẽ làm.
6. Thực hiện đúng nội dung step.
7. Kiểm tra nhanh app có lỗi build/runtime không.
8. Cập nhật PROJECT_STATUS.md.
9. Cập nhật PROMPT_QUEUE.md.
10. Báo cáo ngắn cho người dùng.

## Quy tắc báo cáo sau mỗi step
Báo cáo theo mẫu:
- Step đã làm:
- File đã tạo/sửa:
- Kết quả:
- Lỗi còn tồn tại:
- Step tiếp theo đề xuất:

## Tài khoản mẫu mặc định
- Admin: admin@centosy.vn / 123456
- Nhân viên: staff@centosy.vn / 123456

## Ưu tiên kỹ thuật
- Code rõ ràng, dễ sửa.
- Component nhỏ, không dồn quá nhiều logic vào 1 file.
- Tên file, tên biến dễ hiểu.
- Không dùng thư viện nặng nếu chưa cần.
- Không tạo database thật nếu project chưa sẵn sàng; có thể dùng mock data trước.
