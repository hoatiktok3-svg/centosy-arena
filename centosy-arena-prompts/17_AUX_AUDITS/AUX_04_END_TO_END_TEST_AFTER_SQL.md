# AUX-04 — Test end-to-end sau khi chạy SQL

```text
Bạn là Senior QA Lead + Supabase Integration Tester + Claude Code Engineer.

NHIỆM VỤ:
Test end-to-end app CENTOSY ARENA sau khi đã chạy bộ SQL Supabase production.

KHÔNG:
- Không sửa code ngay.
- Không deploy/push.
- Không chạy SQL mới nếu chưa báo cáo.
- Không xóa dữ liệu thật.

TEST:
1. Database Health
2. Auth Flow: register → pending → admin approve → approved login
3. Forgot Password
4. Mission Flow
5. Game Score Flow
6. Leaderboard / Recognition
7. Training Flow nếu đã chạy SQL
8. Reward Shop nếu đã chạy SQL
9. Admin Settings / Activity Log
10. Mobile UI
11. Security

ĐIỀU KIỆN PASS:
- Register → pending → admin approve → login PASS
- Mission thật hiển thị từ Supabase PASS
- Game score → totalPoints → leaderboard PASS
- Employee không vào AdminPanel PASS
- Build TypeScript OK
- Không còn lỗi P0

OUTPUT:
A. Tổng quan E2E
B. Database Health PASS/FAIL
C. Auth PASS/FAIL
D. Mission PASS/FAIL
E. Game Score PASS/FAIL
F. Leaderboard PASS/FAIL
G. Training/Reward PASS/FAIL nếu có
H. Lỗi P0
I. App đủ test 5 nhân viên chưa
J. DONE AUX-04 END TO END TEST AFTER SQL
```
