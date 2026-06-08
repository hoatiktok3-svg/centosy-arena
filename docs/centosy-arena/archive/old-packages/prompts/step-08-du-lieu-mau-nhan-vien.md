# STEP 08 - TẠO DỮ LIỆU MẪU NHÂN VIÊN

## Mục tiêu
Tạo bộ dữ liệu mẫu để app có thể hiển thị như hệ thống thật trước khi kết nối database.

## Dữ liệu cần có
Mỗi nhân viên gồm:
1. id
2. name
3. email
4. role
5. department
6. avatar hoặc initials
7. totalScore
8. weeklyScore
9. rank
10. badges
11. gamePlayed
12. lastActive

## Phòng ban mẫu
- Marketing
- KDCH
- KDTT
- TMĐT
- Kho
- Kế toán
- Nhân sự
- CSKH

## Việc cần làm
1. Tạo file mockEmployees.
2. Tạo tối thiểu 36 nhân viên mẫu nếu phù hợp.
3. Tạo helper lấy nhân viên theo id/email.
4. Dùng dữ liệu này cho Home, Ranking, Admin Dashboard.
5. Không kết nối database thật trong step này.

## Kết quả mong muốn
- App có dữ liệu đủ sống động để test.
- Có thể dùng cho bảng xếp hạng và vinh danh.

## Không được làm
- Không tạo API backend nếu chưa cần.
- Không thay đổi logic auth lớn.

## Sau khi hoàn thành
Cập nhật PROJECT_STATUS.md và PROMPT_QUEUE.md.
