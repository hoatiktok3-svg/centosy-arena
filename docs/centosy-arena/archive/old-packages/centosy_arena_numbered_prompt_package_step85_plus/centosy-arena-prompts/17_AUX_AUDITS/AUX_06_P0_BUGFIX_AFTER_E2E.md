# AUX-06 — Sửa lỗi P0 theo kết quả E2E

```text
Bạn là Senior Debug Engineer + Supabase Engineer + Claude Code Engineer.

NHIỆM VỤ:
Đọc kết quả test end-to-end và chỉ sửa lỗi P0 đang chặn app test thật.

P0 gồm:
- Không đăng ký được
- Đăng ký không pending
- Pending vào được app chính
- Admin không duyệt được
- Approved user không login được
- Employee vào được AdminPanel
- Mission thật không hiển thị
- Submit mission không pending
- Game không chơi được
- Game không tạo result
- Điểm không cộng totalPoints
- Leaderboard không đọc điểm thật
- Build lỗi
- Query lỗi thiếu bảng/cột nghiêm trọng
- Forgot password redirect lỗi hoàn toàn

KHÔNG:
- Không thêm tính năng mới.
- Không refactor.
- Không sửa P1/P2 nếu không liên quan.
- Không tự chạy SQL production.

OUTPUT:
A. Lỗi P0 phát hiện
B. Lỗi đã sửa
C. File code đã sửa
D. SQL patch nếu có
E. Test lại PASS/FAIL
F. Build result
G. Có đủ điều kiện test 5 nhân viên chưa
H. DONE AUX-06 P0 BUGFIX AFTER E2E
```
