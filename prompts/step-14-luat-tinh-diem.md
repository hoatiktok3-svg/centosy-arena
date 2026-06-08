# STEP 14 - TẠO LUẬT TÍNH ĐIỂM GAME

## Mục tiêu
Chuẩn hóa hệ thống điểm cho các game để xếp hạng công bằng.

## Yêu cầu chức năng
1. Mỗi game có điểm tối đa rõ ràng.
2. Cộng điểm vào tổng điểm nhân viên sau khi chơi.
3. Có điểm theo ngày/tuần/tổng.
4. Có bonus nếu hoàn thành nhanh nếu game có timer.
5. Không cho cộng điểm vô hạn nếu chơi lại quá nhiều lần trong một ngày.

## Quy tắc đề xuất
- Câu đúng: +10 điểm.
- Hoàn thành game: +20 điểm.
- Bonus nhanh: +5 đến +20 điểm.
- Mỗi game chỉ tính điểm chính thức 1 lần/ngày.
- Chơi lại vẫn được nhưng không cộng thêm điểm chính thức.

## Việc cần làm
1. Tạo helper calculateScore.
2. Tạo cấu trúc lưu điểm tạm thời.
3. Gắn tính điểm vào các game đã có.
4. Cập nhật điểm hiển thị ở Home và Ranking.
5. Ghi chú nếu hiện tại chỉ dùng localStorage/mock data.

## Kết quả mong muốn
- Điểm thống nhất.
- Bảng xếp hạng phản ánh điểm sau khi chơi.

## Không được làm
- Không xây backend phức tạp nếu chưa cần.
- Không phá logic game hiện có.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
