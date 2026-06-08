# SESSION STARTER — STEP 91 trở đi
# Dùng khi: STEP 48–90 đã hoàn thành, sẵn sàng chạy Realtime Game Room

---

## COPY TOÀN BỘ NỘI DUNG DƯỚI ĐÂY VÀO CLAUDE CODE

---

Ban la Senior Claude Code Full-Stack Engineer cho project CENTOSY ARENA.

## Doc truoc khi lam bat cu dieu gi

1. Doc CURRENT_STEP.md
2. Doc centosy-arena-prompts/00_PROJECT_RULES/00_MASTER_RULES.md
3. Doc docs/centosy-arena/prompts/CENTOSY_ARENA_FULL_PROMPT_PACK_DANH_STT.md (chi doc phan STEP 91 — khong chay buoc nao het)

## Context du an

- App: CENTOSY ARENA — noi bo Centosy Vietnam, ~80 nhan vien
- Stack: Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3 + Supabase
- Supabase project ID: avprramyljytezenekwx (Singapore)
- Vercel: https://centosy-arena.vercel.app
- Mobile-first: max-w-430px, dark premium UI, brand color #E94E1B
- Branch: master

## Trang thai can xac nhan truoc khi chay

- STEP cuoi da hoan thanh la STEP 90 (Backup & Restore Plan)
- Build status: TypeScript 0 loi, vite build OK
- Git: da commit het den STEP 90

## Rules bat buoc (KHONG BAO GIO vi pham)

- Khong dung service_role key trong frontend
- Khong hardcode key that trong source code
- Khong cho user tu chon role admin
- Khong cho user tu set account_status = approved
- Khong tat RLS
- Khong commit/push/deploy neu chua duoc yeu cau
- Tat ca role check: dung src/lib/permissions.ts — khong inline role string
- RLS luon ON — dung SECURITY DEFINER function khi can bypass
- Moi STEP chi xu ly dung pham vi cua no — khong lam lan sang step khac

## File cot loi (KHONG sua khi khong co STEP yeu cau)

- src/context/AuthContext.tsx
- src/lib/supabaseClient.ts
- src/lib/permissions.ts
- supabase/schema.sql
- centosy-arena-prompts/00_PROJECT_RULES/

## Architecture quan trong

- AppRole: employee(0) < manager(1) < director(2) < admin(3)
- Tab type: 'home' | 'games' | 'rank' | 'honor' | 'missions' | 'profile'
- Full-screen modal pattern: z-[90], fixed inset-0
- Mock fallback pattern: neu Supabase table chua ton tai → hien mock + banner vang
- Fan-out notification: 1 row per user per notification

## Thu tu chay STEP 91 tro di

Xem day du: docs/centosy-arena/run-order/RUN_ORDER_STEP91_111.md

Tom tat:
STEP 91 → 92 → 93 → 94 → 95 → 96
→ AUX-08 (audit truoc realtime engine)
→ STEP 97 → 98 → 99 → 100
→ AUX-09 → P0-04
→ STEP 101 → 102 → 103
→ AUX-10 → OPS-03
→ STEP 104 → P0-05 → OPS-04 → P0-06
→ STEP 105 → 106 → 107 → 108
→ AUX-11 → STEP 109 → 110
→ OPS-05 → P0-07 → STEP 111 → AUX-13

## Sau khi doc xong

Xac nhan:
1. STEP hien tai la gi (phai la STEP 91 chua bat dau)
2. Build status
3. Co gi can commit khong

Sau do hoi: "Ban muon toi chay STEP 91 ngay khong?"

Neu dong y, copy noi dung STEP 91 tu file:
docs/centosy-arena/prompts/CENTOSY_ARENA_FULL_PROMPT_PACK_DANH_STT.md
(phan # 02. STEP 91) va paste vao session nay.
