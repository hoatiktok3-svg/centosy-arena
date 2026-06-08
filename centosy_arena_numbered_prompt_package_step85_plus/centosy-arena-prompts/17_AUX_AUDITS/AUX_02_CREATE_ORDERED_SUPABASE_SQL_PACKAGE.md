# AUX-02 — Tạo bộ SQL Supabase theo thứ tự an toàn

```text
Bạn là Senior Supabase Database Architect + Claude Code Engineer.

NHIỆM VỤ:
Tạo bộ SQL Supabase chạy theo đúng thứ tự an toàn cho CENTOSY ARENA.

KHÔNG:
- Không tự chạy SQL production.
- Không deploy/push.
- Không sửa code app nếu chưa cần.
- Không xóa bảng cũ.
- Không drop data.

TẠO THƯ MỤC:
supabase/production_sql_ordered/

TẠO FILE:
01_profiles_auth_foundation.sql
02_missions.sql
03_game_core.sql
04_score_rpc.sql
05_recognition_badges.sql
06_training.sql
07_reward_shop.sql
08_feedback_notifications.sql
09_admin_settings_activity_logs.sql
10_seed_initial_data.sql
11_first_admin_template.sql
12_verify_database_health.sql

TẠO DOCS:
SUPABASE_SQL_RUNBOOK.md
SUPABASE_SQL_ROLLBACK_NOTES.md
SUPABASE_SQL_VERIFY_CHECKLIST.md

YÊU CẦU SQL:
- create table if not exists
- alter table add column if not exists
- create index if not exists
- insert ... on conflict do nothing cho seed
- không drop bảng
- không xóa data cũ
- không policy quá mở

OUTPUT:
A. Danh sách file SQL đã tạo
B. Thứ tự chạy SQL
C. File bắt buộc chạy trước
D. File seed
E. File verify
F. RPC được tạo
G. Rủi ro trước production
H. DONE AUX-02 CREATE ORDERED SUPABASE SQL PACKAGE
```
