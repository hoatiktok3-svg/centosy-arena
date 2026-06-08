# README — CENTOSY ARENA PROMPT PACK
# Cập nhật: 2026-06-08

---

## ĐÂY LÀ GÌ?

Đây là bộ prompt roadmap cho dự án **CENTOSY ARENA** — app gamification nội bộ của Centosy Việt Nam.

Mỗi file `.md` trong `centosy-arena-prompts/` là một prompt hoàn chỉnh dành cho Claude Code.
Paste nội dung file vào Claude Code để xây dựng từng tính năng theo thứ tự.

---

## QUY TẮC SỬ DỤNG

### ❌ KHÔNG làm
- Không chạy tất cả prompt cùng lúc
- Không bỏ qua thứ tự STEP
- Không chạy STEP mới khi P0 chưa xong
- Không deploy/push khi anh Hóa chưa yêu cầu rõ ràng
- Không sửa source code ngoài phạm vi từng STEP
- Không refactor toàn bộ project
- Không xóa/đổi tên component đang dùng
- Không hardcode secret, API key, token, password

### ✅ ĐÚNG cách
- Chỉ chạy từng STEP/P0/AUX/OPS theo yêu cầu từng lần
- Đọc `00_PROJECT_RULES/` trước khi bắt đầu session mới
- Báo cáo DONE sau mỗi prompt
- Giữ nguyên UI hiện tại, chỉ thêm không phá

---

## CÁC LOẠI PROMPT

### 🟢 STEP — Tính năng mới
- Xây dựng tính năng theo roadmap
- Chạy tuần tự, không nhảy số
- Mỗi STEP phụ thuộc STEP trước
- Thư mục: `centosy-arena-prompts/01_CORE_ACCESS/` → `18_OPS_PROMPTS/`

### 🔴 P0 — Lỗi nền móng khẩn cấp
- Dùng khi có lỗi NGHIÊM TRỌNG ngăn app hoạt động
- Auth bị hỏng, database mất kết nối, permission sai hoàn toàn
- Chạy P0 TRƯỚC khi tiếp tục STEP mới
- Thư mục: `centosy-arena-prompts/16_P0_FIXES/`

### 🟡 AUX — Audit & chuẩn bị
- Kiểm tra code, SQL, mock data trước khi ra production
- Test nội bộ, E2E, phát hiện lỗi sớm
- Thư mục: `centosy-arena-prompts/17_AUX_AUDITS/`

### 🔵 OPS — Tài liệu & vận hành
- Sắp xếp prompt pack, cập nhật RUN_ORDER, viết hướng dẫn
- Không liên quan đến code app
- Thư mục: `centosy-arena-prompts/18_OPS_PROMPTS/`

---

## CẤU TRÚC TÀI LIỆU

```
docs/centosy-arena/
├── README_PROJECT_PROMPTS.md     ← file này
├── README.md                     ← overview ngắn (cũ)
├── RUN_ORDER.md                  ← run order tổng (cũ, STEP 27-90)
├── roadmap/
│   ├── README_STEP27_90.md       ← guide STEP 27-90
│   └── RUN_ORDER_STEP27_90.md    ← thứ tự chạy STEP 27-90
├── prompts/
│   └── *.md                      ← file prompt pack gốc (MD chính)
├── run-order/
│   └── RUN_ORDER_STEP91_111.md   ← thứ tự chạy STEP 91-111
└── archive/
    └── *.txt                     ← bản TXT dự phòng
```

---

## PACK ĐÃ CÓ

| Pack | STEP | P0 | AUX | OPS | Trạng thái |
|------|------|----|-----|-----|-----------|
| Pack 1 (step 1–26) | 1–26 | — | — | — | ✅ Đã chạy xong |
| Pack 2 (step 27–47) | 27–47 | — | — | — | ✅ Đã chạy xong |
| Pack 3 (step 48–84) | 48–84 | — | — | — | ✅ Đã chạy xong |
| Pack 4 (step 85+) | 85–90 | P0-01–05 | AUX-01–06 | OPS-01–02 | ✅ Đã sắp xếp |
| Pack 5 (step 91–111) | 91–111 | P0-06–07 | AUX-08–13 | OPS-03–05 | ⏳ Chờ giải nén |

---

## BƯỚC TIẾP THEO

1. Giải nén `CENTOSY_ARENA_CLAUDE_CODE_PROMPT_PACK.zip`
2. Copy 3 file vào đúng vị trí (xem `run-order/RUN_ORDER_STEP91_111.md`)
3. Báo Claude để tách từng STEP vào `centosy-arena-prompts/`
4. Bắt đầu chạy theo thứ tự: **P0 → AUX → STEP 91**

---

## LIÊN HỆ
- Giám đốc Marketing: Đỗ Văn Hóa
- Dự án: Centosy Arena — app nội bộ gamification
- Repo: `F:\CLAUDE CODE HÓA\`
