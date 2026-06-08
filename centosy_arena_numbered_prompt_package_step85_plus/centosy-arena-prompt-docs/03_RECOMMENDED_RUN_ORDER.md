# Recommended Run Order

## Nếu app còn lỗi nền móng
1. P0-03 — Foundation Fix J1–J5
2. AUX-01 — Audit Mock/localStorage
3. AUX-02 — Create Ordered Supabase SQL Package
4. AUX-03 — Audit SQL Before Production
5. Chạy SQL thủ công trên Supabase Dashboard
6. AUX-04 — E2E Test After SQL
7. AUX-06 — P0 Bugfix After E2E nếu còn lỗi
8. AUX-05 — Prepare 5 User Internal Test

## Nếu app đã ổn định sau STEP 85
1. STEP 86
2. STEP 87
3. STEP 88
4. STEP 89
5. STEP 90

## Nếu đang sửa auth
1. P0-01
2. P0-02
3. P0-03
