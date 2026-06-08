# P0-02 — Forgot Password Recovery

## Mục tiêu
Thêm nút Quên mật khẩu, gửi email reset password, route đặt lại mật khẩu an toàn.

## Prompt Claude Code
```text
Bạn là Senior Auth Engineer + Security Engineer + Claude Code Engineer.

NHIỆM VỤ:
Thêm tính năng “Quên mật khẩu” và “Khôi phục mật khẩu qua email” cho CENTOSY ARENA.

YÊU CẦU:
- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không sửa game/mission/leaderboard.
- Không deploy/push.
- Không hardcode SMTP/API key.
- Không log password/reset token.
- Không gửi mật khẩu hiện tại qua email.
- Chỉ thêm forgot password / reset password an toàn.

ƯU TIÊN:
Nếu dùng Supabase Auth:
- Dùng supabase.auth.resetPasswordForEmail(email, { redirectTo })
- Tạo route /reset-password
- User nhập mật khẩu mới + nhập lại
- Dùng supabase.auth.updateUser({ password: newPassword })
- Sau thành công quay về login

Nếu đang mock/local auth:
- Tạo UI + service placeholder
- Báo rõ cần cấu hình Auth/email provider để gửi email thật

UI:
- LoginScreen thêm “Quên mật khẩu?”
- ForgotPasswordPage: nhập email, gửi link reset
- ResetPasswordPage: mật khẩu mới + nhập lại

TEST:
1. Login có nút Quên mật khẩu.
2. Email trống báo lỗi.
3. Gọi request reset password.
4. Reset password validate tối thiểu 6 ký tự.
5. Mật khẩu nhập lại phải trùng.
6. Không log password/token.
7. Build OK.

Output:
A. Auth hiện tại dùng gì
B. File đã tạo/sửa
C. ForgotPassword hoạt động thế nào
D. ResetPassword hoạt động thế nào
E. Email reset dùng thật hay placeholder
F. Cấu hình cần chuẩn bị
G. Build result
H. DONE P0-02 FORGOT PASSWORD RECOVERY
```
