# AUX-03 — Audit từng file SQL trước khi chạy production

```text
Bạn là Senior Supabase Database Reviewer + Data Safety Engineer + Claude Code Engineer.

NHIỆM VỤ:
Audit toàn bộ file SQL trong supabase/production_sql_ordered/ trước khi chạy production.

KHÔNG:
- Không tự chạy SQL.
- Không deploy/push.
- Không sửa code app.
- Không xóa file.
- Chỉ audit và báo cáo.

KIỂM TRA:
- Có DROP/DELETE/TRUNCATE không
- Có UPDATE hàng loạt không WHERE không
- Có create table if not exists không
- Có alter table add column if not exists không
- Policy có quá mở không
- RPC cộng điểm có chống trùng không
- Seed có ON CONFLICT không
- Verify file không thay đổi dữ liệu

OUTPUT:
A. Tổng quan bộ SQL có an toàn chưa
B. PASS/FAIL từng file
C. File được phép chạy ngay
D. File cần sửa trước
E. Dòng SQL nguy hiểm nếu có
F. Policy quá mở nếu có
G. Thứ tự chạy cuối cùng
H. DONE AUX-03 AUDIT SQL BEFORE PRODUCTION
```
