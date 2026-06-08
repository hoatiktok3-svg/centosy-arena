# P0-03 — Foundation Fix J1–J5

## Mục tiêu
Audit và xử lý nền móng P0: SQL Supabase, redirect forgot password, admin đầu tiên, game score flow, seed mission thật.

## Prompt Claude Code
```text
Bạn là Senior Supabase Engineer + Auth Engineer + Product Stabilization Architect + Claude Code Engineer.

NHIỆM VỤ:
Xử lý P0 FOUNDATION FIX J1–J5 cho CENTOSY ARENA.

J1. Kiểm tra SQL/migration Supabase
- Tạo SUPABASE_REQUIRED_SQL_CHECKLIST.md
- Tạo SUPABASE_SQL_RUN_ORDER.md
- Nếu thiếu SQL quan trọng, tạo supabase/p0_required_schema_patch.sql, p0_required_rpc_patch.sql, p0_required_seed.sql nếu cần

J2. Kiểm tra Forgot Password Redirect URL
- Tạo SUPABASE_AUTH_REDIRECT_GUIDE.md
- Nếu hardcode redirect sai, sửa nhẹ dùng window.location.origin + "/reset-password" hoặc VITE_APP_URL

J3. Tạo/chốt tài khoản admin đầu tiên an toàn
- Tạo FIRST_ADMIN_SETUP_GUIDE.md
- Tạo supabase/setup_first_admin_template.sql với placeholder YOUR_ADMIN_EMAIL_HERE nếu cần

J4. Audit Game Score Flow
- Tạo GAME_SCORE_FLOW_AUDIT.md
- Phân loại game: DB thật + RPC chuẩn / DB chưa RPC / localStorage / mock / bảng cũ
- Sửa lỗi nhỏ an toàn nếu rõ

J5. Seed mission thật vào Supabase
- Tạo supabase/seed_missions_initial.sql
- Tạo MISSION_SEED_GUIDE.md
- Seed 5 mission: Check-in hôm nay, Hoàn thành quiz sản phẩm, Gửi ý tưởng cải tiến, Gửi lời khen, Chia sẻ câu chuyện khách hàng

TUYỆT ĐỐI KHÔNG:
- Không thêm tính năng mới.
- Không refactor.
- Không deploy/push.
- Không tự chạy SQL production.
- Không hardcode key/password.
- Không tạo backdoor admin.

OUTPUT:
A. Tổng quan đã xử lý J1–J5
B. File tài liệu đã tạo
C. File SQL đã tạo
D. File code đã sửa nếu có
E. SQL cần chạy trên Supabase
F. Forgot Password redirect cần cấu hình gì
G. Admin đầu tiên setup thế nào
H. Game score flow đạt/chưa đạt
I. Mission seed ở đâu
J. Build result
K. Git status
L. DONE P0-03 FOUNDATION FIX J1-J5
```
