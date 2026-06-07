# CURRENT STEP — CENTOSY ARENA

Current Step:           STEP 46 (đang chạy)
Last Completed Step:    STEP 45 — Centosy Stories
Next Recommended Step:  STEP 47
Build Status:           ✅ OK — tsc 0 lỗi, vite build OK (548KB chunk warning — bỏ qua)
Git Status:             ✅ Đã commit đến STEP 37 (3f449c8)

SQL mới cần chạy:
  - supabase/feedback.sql (STEP 37)

Do Not Touch:
  - src/context/AuthContext.tsx
  - src/lib/supabaseClient.ts
  - supabase/schema.sql
  - centosy-arena-prompts/00_PROJECT_RULES/
  - public/

Notes:
  - Phải commit STEP 28-33 trước khi chạy STEP 34
  - Cần chạy 6 file SQL trên Supabase Dashboard (xem PROJECT_STATUS.md)
  - Chunk warning 529KB là cảnh báo, không phải lỗi — bỏ qua đến STEP cuối
  - Tất cả role check dùng src/lib/permissions.ts — không inline role string
