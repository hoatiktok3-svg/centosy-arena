# P0-01 — Fix Register Approval Flow

## Mục tiêu
Sửa form đăng ký đơn giản, bắt buộc mật khẩu, user mới luôn pending, admin/manager có quyền mới được duyệt.

## Prompt Claude Code
```text
Bạn là Senior Auth Engineer + Claude Code Engineer.

NHIỆM VỤ:
Sửa lỗi đăng ký tài khoản trong app CENTOSY ARENA.

VẤN ĐỀ:
1. Form đăng ký quá nhiều tiêu chí.
2. User có thể đăng ký không cần mật khẩu.
3. User đăng ký xong có vẻ được duyệt luôn hoặc vào app luôn dù admin chưa duyệt.
4. Tôi cần user mới bắt buộc ở trạng thái chờ duyệt.
5. Chỉ admin/director/quản lý có quyền duyệt mới được duyệt thành viên.

YÊU CẦU:
- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không sửa game/leaderboard/mission.
- Không deploy/push.
- Không cài package mới.
- Chỉ sửa Register/Login/PendingApproval/AdminApproval.

FORM ĐĂNG KÝ MỚI:
- Họ và tên
- Số điện thoại
- Email
- Mật khẩu
- Nhập lại mật khẩu
- Khối làm việc: Cửa hàng / Văn phòng / Kho
- Phòng ban/vị trí theo khối

LOGIC:
- role mặc định = employee
- account_status/status mặc định = pending
- totalPoints mặc định = 0
- không tự approved
- pending user không vào app chính
- approved user mới vào app
- rejected/inactive/resigned bị chặn

ADMIN APPROVAL:
- AdminPanel có danh sách user pending
- Nút Duyệt / Từ chối
- employee không thấy khu vực duyệt

TEST:
1. Đăng ký thiếu mật khẩu báo lỗi.
2. Mật khẩu nhập lại không trùng báo lỗi.
3. Đăng ký đủ thông tin → pending.
4. Pending user bị chặn khỏi app chính.
5. Admin approve → approved login được.
6. Employee không thấy AdminPanel.
7. Build OK.

Output:
A. Lỗi tìm thấy
B. File đã sửa
C. Luồng đăng ký mới
D. Cách admin duyệt
E. Cách test
F. Build result
G. DONE P0-01 FIX REGISTER APPROVAL FLOW
```
