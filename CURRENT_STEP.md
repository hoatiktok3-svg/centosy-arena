# CURRENT STEP — CENTOSY ARENA

Current Step:           STEP 37 (chưa bắt đầu)
Last Completed Step:    STEP 36 — Safe Vercel Internal Test
Next Recommended Step:  STEP 37 (đọc file centosy-arena-prompts/02_MVP_TESTING/STEP_37_*.md)
Build Status:           ✅ OK — tsc 0 lỗi, vite build OK (539KB chunk warning — bỏ qua)
Git Status:             ✅ Đã commit đến STEP 36 (c135f39)

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
