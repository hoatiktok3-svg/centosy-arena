# CENTOSY ARENA — RUN ORDER: STEP 91–111 + P0 + AUX + OPS
# Package: CENTOSY_ARENA_CLAUDE_CODE_PROMPT_PACK
# Cập nhật: 2026-06-08

---

## ⚠️ QUY TẮC TRƯỚC KHI CHẠY

- Đọc `00_PROJECT_RULES/` trong `centosy-arena-prompts/` trước
- Không chạy nhiều STEP cùng lúc — chỉ 1 STEP/lần
- Hoàn thành P0 trước khi chạy STEP mới
- Báo cáo DONE sau mỗi prompt theo format `03_DONE_FORMAT.md`
- Không deploy/push nếu anh Hóa chưa yêu cầu rõ ràng

---

## 🔴 P0 — CRITICAL FIXES (ưu tiên cao nhất)
> Chạy khi có lỗi nền móng ngăn app hoạt động bình thường.
> Không bỏ qua, không gộp 2 P0 cùng lúc.

| Thứ tự | Mã | Mô tả |
|--------|----|--------|
| 1 | P0-04 | Fix Training + Supabase (nếu chưa xong từ pack trước) |
| 2 | P0-05 | Fix Reward Shop + Supabase (nếu chưa xong từ pack trước) |
| 3 | P0-06 | *(nội dung trong file pack — xem prompts/)* |
| 4 | P0-07 | *(nội dung trong file pack — xem prompts/)* |

> File: `centosy-arena-prompts/16_P0_FIXES/`

---

## 🟡 AUX — AUDIT & CHUẨN BỊ
> Chạy sau P0, trước STEP tính năng mới. Không bỏ qua AUX-08 trước AUX-09.

| Thứ tự | Mã | Mô tả |
|--------|----|--------|
| 5 | AUX-08 | *(xem file pack)* |
| 6 | AUX-09 | *(xem file pack)* |
| 7 | AUX-10 | *(xem file pack)* |
| 8 | AUX-11 | *(xem file pack)* |
| 9 | AUX-12 | *(xem file pack)* |
| 10 | AUX-13 | *(xem file pack)* |

> File: `centosy-arena-prompts/17_AUX_AUDITS/`

---

## 🟢 STEP — TÍNH NĂNG MỚI (STEP 91–111)
> Chạy tuần tự. Mỗi STEP phụ thuộc STEP trước.

### Nhóm 19 — *(tên nhóm theo file pack)*
| # | STEP | Ghi chú |
|---|------|---------|
| 11 | STEP 91 | Chạy sau AUX-08 đến AUX-13 xong |
| 12 | STEP 92 | |
| 13 | STEP 93 | |
| 14 | STEP 94 | |
| 15 | STEP 95 | |
| 16 | STEP 96 | |
| 17 | STEP 97 | |
| 18 | STEP 98 | |
| 19 | STEP 99 | |
| 20 | STEP 100 | |
| 21 | STEP 101 | |
| 22 | STEP 102 | |
| 23 | STEP 103 | |
| 24 | STEP 104 | |
| 25 | STEP 105 | |
| 26 | STEP 106 | |
| 27 | STEP 107 | |
| 28 | STEP 108 | |
| 29 | STEP 109 | |
| 30 | STEP 110 | |
| 31 | STEP 111 | |

> ⚠️ Chi tiết từng STEP: xem `centosy-arena-prompts/` sau khi giải nén file pack

---

## 🔵 OPS — QUẢN LÝ & VẬN HÀNH
> Chạy bất cứ lúc nào khi cần tổ chức tài liệu hoặc vận hành.

| Mã | Mô tả | Trạng thái |
|----|--------|-----------|
| OPS-01 | Update and Sort Prompt Files | ✅ DONE 2026-06-08 |
| OPS-02 | *(docs/centosy-arena/ structure)* | ✅ DONE 2026-06-08 |
| OPS-03 | *(xem file pack)* | Chưa chạy |
| OPS-04 | *(xem file pack)* | Chưa chạy |
| OPS-05 | *(xem file pack)* | Chưa chạy |

---

## FILE PACK CẦN GIẢI NÉN
Khi anh copy file vào, đặt theo đúng vị trí:

```
docs/centosy-arena/
├── prompts/
│   └── CENTOSY_ARENA_PROMPT_PACK_STEP91_111_AUX_P0_OPS.md  ← file MD chính
├── archive/
│   └── CENTOSY_ARENA_PROMPT_PACK_STEP91_111_AUX_P0_OPS.txt  ← file TXT dự phòng
└── README_CENTOSY_ARENA_CLAUDE_CODE.txt  ← README từ pack
```

Sau đó báo Claude để tách từng STEP/P0/AUX/OPS vào đúng thư mục `centosy-arena-prompts/`.

---

## LIÊN KẾT
- Pack trước (STEP 27–90): `docs/centosy-arena/roadmap/RUN_ORDER_STEP27_90.md`
- Rules: `centosy-arena-prompts/00_PROJECT_RULES/`
- Numbering rule: `centosy-arena-prompts/00_PROJECT_RULES/05_PROMPT_NUMBERING_RULE.md`
