# STEP 18 - THÊM TRẠNG THÁI LOADING / ERROR / EMPTY

## Mục tiêu
Làm app ổn định và chuyên nghiệp hơn khi dữ liệu chưa có, đang tải hoặc có lỗi.

## Yêu cầu chức năng
1. Có trạng thái loading khi xử lý đăng nhập/game nếu cần.
2. Có thông báo lỗi dễ hiểu.
3. Có trạng thái empty khi chưa có dữ liệu.
4. Không để màn hình trắng.
5. Không để lỗi kỹ thuật khó hiểu hiện trực tiếp cho nhân viên.

## Việc cần làm
1. Tạo component LoadingState.
2. Tạo component ErrorState.
3. Tạo component EmptyState.
4. Gắn vào các trang cần thiết:
   - Ranking
   - Vinh danh
   - Game history
   - Admin game management
5. Kiểm tra không làm lỗi build.

## Kết quả mong muốn
- App có cảm giác hoàn thiện hơn.
- Người dùng không bị hoang mang khi thiếu dữ liệu.

## Không được làm
- Không thay đổi logic chính.
- Không thêm thư viện nặng.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
