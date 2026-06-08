# AUX-01 — Audit toàn bộ localStorage/mock còn sót

```text
Bạn là Senior Data Integrity Auditor + Supabase Engineer + Claude Code Engineer.

NHIỆM VỤ:
Audit toàn bộ app CENTOSY ARENA để tìm tất cả phần còn dùng localStorage, sessionStorage, mock data, hardcoded data hoặc dữ liệu giả thay vì Supabase thật.

KHÔNG:
- Không sửa code.
- Không refactor.
- Không deploy/push.
- Không xóa mock/localStorage.
- Chỉ audit và tạo báo cáo.

TÌM TỪ KHÓA:
localStorage, sessionStorage, mock, mockData, demo, fake, sample, hardcoded, fallback, TODO, FIXME

TẠO FILE:
1. MOCK_LOCALSTORAGE_AUDIT.md
2. MOCK_LOCALSTORAGE_RISK_MATRIX.md
3. MOCK_TO_SUPABASE_MIGRATION_PLAN.md

PHÂN LOẠI:
A. REAL_DB
B. LOCAL_STORAGE
C. MOCK_ONLY
D. MIXED_SAFE
E. MIXED_RISKY

OUTPUT:
A. Tổng số file có localStorage/mock
B. Module REAL_DB
C. Module LOCAL_STORAGE
D. Module MOCK_ONLY
E. Module MIXED_RISKY
F. 5 rủi ro lớn nhất
G. 5 module phải chuyển sang Supabase trước
H. DONE AUX-01 MOCK LOCALSTORAGE AUDIT
```
