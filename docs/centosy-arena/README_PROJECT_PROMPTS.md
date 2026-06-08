# README — CENTOSY ARENA PROMPT PACK
# Cập nhật: 2026-06-08

---

## ĐÂY LÀ GÌ?

Bộ prompt roadmap cho dự án **CENTOSY ARENA** — app gamification nội bộ Centosy Việt Nam.
Mỗi file `.md` = 1 prompt hoàn chỉnh dành cho Claude Code. Paste từng file theo thứ tự.

---

## QUY TẮC BẮT BUỘC

- **Không chạy tất cả prompt cùng lúc** — chỉ chạy từng STEP/P0/AUX/OPS theo yêu cầu
- **Không deploy/push** nếu chưa được yêu cầu rõ ràng
- **Không tự chạy SQL** — tạo file patch, chờ chủ dự án chạy thủ công
- **Luôn giữ UI hiện tại** — không refactor, không phá component đang dùng
- **Không hardcode secret/key/token** vào source code

---

## 4 LOẠI PROMPT

| Loại | Ký hiệu | Dùng khi nào |
|------|---------|--------------|
| 🟢 **STEP** | `STEP_XX` | Phát triển tính năng mới theo roadmap |
| 🔴 **P0** | `P0_XX` | Sửa lỗi nền móng / audit nguy hiểm / bảo mật |
| 🟡 **AUX** | `AUX_XX` | Audit, checklist, test trước khi lên production |
| 🔵 **OPS** | `OPS_XX` | Tài liệu, vận hành, sắp xếp project |

---

## PACK ĐÃ CÓ

| Pack | Phạm vi | File prompt | Trạng thái |
|------|---------|-------------|-----------|
| Pack 1–4 (cũ) | STEP 27–90, P0-01–05, AUX-01–06, OPS-01–02 | `centosy-arena-prompts/` | ✅ Đã merge vào main |
| **Pack 5** (mới) | STEP 91–111, P0-04–07, AUX-08–13, OPS-03–06 | `docs/centosy-arena/prompts/CENTOSY_ARENA_FULL_PROMPT_PACK_DANH_STT.md` | ✅ Đã sắp xếp, chưa chạy |

---

## CẤU TRÚC TÀI LIỆU

```
docs/centosy-arena/
├── README_PROJECT_PROMPTS.md        ← file này
├── README_CENTOSY_ARENA_PROMPT_PACK.md  ← hướng dẫn từ pack mới
├── README.md                        ← overview cũ (STEP 27-90)
├── RUN_ORDER.md                     ← run order cũ (STEP 27-90)
├── roadmap/
│   ├── README_STEP27_90.md
│   └── RUN_ORDER_STEP27_90.md
├── prompts/
│   └── CENTOSY_ARENA_FULL_PROMPT_PACK_DANH_STT.md  ← FILE CHÍNH PACK 5
├── run-order/
│   └── RUN_ORDER_STEP91_111.md      ← thứ tự 34 items pack 5
└── archive/
    └── CENTOSY_ARENA_FULL_PROMPT_PACK_DANH_STT.txt ← bản TXT dự phòng
```

---

## THỨ TỰ CHẠY PACK 5

Xem chi tiết: `run-order/RUN_ORDER_STEP91_111.md`

Tóm tắt luồng:
```
OPS-06 (done) → STEP 91→96 → AUX-08 → STEP 97→100
→ AUX-09 → P0-04 → STEP 101→103 → AUX-10 → OPS-03
→ STEP 104 → P0-05 → OPS-04 → P0-06 → STEP 105→108
→ AUX-11 → STEP 109→110 → OPS-05 → P0-07 → STEP 111 → AUX-13
```

---

## TRẠNG THÁI HIỆN TẠI (2026-06-08)

- Code app: STEP 47 hoàn thành, STEP 48 là bước tiếp theo
- Prompt pack main (`centosy-arena-prompts/`): STEP 27–90 + P0-01–05 + AUX-01–06 + OPS-01
- Pack 5 mới: sẵn sàng tại `docs/centosy-arena/prompts/`
- STEP 39: missing — cần xác nhận
- STEP 85: có 2 bản khác nhau — chờ quyết định

---

## BƯỚC TIẾP THEO

1. Mở Claude Code → paste `NEXT_SESSION_PROMPT.md` để khởi động session
2. Commit code STEP 38–47 nếu chưa commit
3. Chạy `supabase/feedback.sql` trên Supabase Dashboard
4. Paste **STEP 48** từ `centosy-arena-prompts/05_TRAINING_ACADEMY/STEP_48_PRODUCT_QUIZ.md`
