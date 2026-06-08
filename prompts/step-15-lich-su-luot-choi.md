# STEP 15 - TẠO LỊCH SỬ LƯỢT CHƠI

## Mục tiêu
Ghi nhận lịch sử chơi game để Admin và nhân viên xem lại.

## Dữ liệu lịch sử cần có
1. id
2. employeeId
3. employeeName
4. gameType
5. score
6. maxScore
7. playedAt
8. duration nếu có
9. status: completed/failed/retry

## Yêu cầu chức năng
1. Sau khi chơi xong, tạo bản ghi lịch sử.
2. Nhân viên xem được lịch sử của mình.
3. Admin có thể xem lịch sử tổng quan.
4. Nếu chưa có backend, lưu localStorage/mock data.
5. Không làm quá phức tạp.

## Việc cần làm
1. Tạo data structure cho gameHistory.
2. Tạo helper addGameHistory.
3. Gắn vào màn hình kết quả game.
4. Tạo trang Lịch sử của tôi.
5. Tạo hiển thị cơ bản cho Admin nếu phù hợp.

## Kết quả mong muốn
- Sau mỗi lượt chơi có lịch sử rõ ràng.
- Có dữ liệu phục vụ phân tích sau này.

## Không được làm
- Không kết nối database thật nếu chưa có yêu cầu.
- Không thay đổi toàn bộ hệ thống điểm.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
