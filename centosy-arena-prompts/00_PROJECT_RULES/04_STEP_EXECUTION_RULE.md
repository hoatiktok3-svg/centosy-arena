# Step Execution Rule

- Khi anh Hoá nói “chạy STEP xx”, chỉ đọc file STEP_xx tương ứng.
- Không chạy step trước/sau.
- Nếu thiếu dependency, dừng lại và báo cần hoàn thành step nào trước.
- Nếu step đã làm rồi, audit trước, không làm lại từ đầu.
