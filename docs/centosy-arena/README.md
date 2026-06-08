# CENTOSY ARENA — PROMPT PACK GUIDE
# Cập nhật: 2026-06-08

---

## PROMPT PACK LÀ GÌ?

Thư mục `centosy-arena-prompts/` chứa toàn bộ prompt hướng dẫn Claude Code xây dựng app **Centosy Arena** — hệ thống gamification nội bộ cho nhân viên Centosy Việt Nam.

Mỗi file `.md` = 1 prompt = 1 tính năng hoàn chỉnh. Chạy tuần tự theo RUN_ORDER.

---

## CẤU TRÚC THƯ MỤC

```
centosy-arena-prompts/
├── 00_PROJECT_RULES/        ← Đọc đầu tiên, luôn luôn
│   ├── 00_MASTER_RULES.md
│   ├── 01_NO_REFACTOR_RULE.md
│   ├── 02_UI_SAFETY_RULE.md
│   ├── 03_DONE_FORMAT.md
│   ├── 04_STEP_EXECUTION_RULE.md
│   └── 05_PROMPT_NUMBERING_RULE.md
│
├── 01_CORE_ACCESS/          STEP 27–32
├── 02_MVP_TESTING/          STEP 33–38
├── 03_EMPLOYEE_SYSTEM/      STEP 40–43
├── 04_CULTURE_RECOGNITION/  STEP 44–47
├── 05_TRAINING_ACADEMY/     STEP 48–51
├── 06_GAMIFICATION/         STEP 52–55
├── 07_MANAGEMENT_INTELLIGENCE/ STEP 56–60
├── 08_AUTOMATION_AI/        STEP 61–64
├── 09_GAME_SCORE_REALTIME/  STEP 65–70
├── 10_GAME_COMPETITION_ADVANCED/ STEP 71–75
├── 11_TOURNAMENT_SYSTEM/    STEP 76–80
├── 12_EVENT_EXPERIENCE_POLISH/  STEP 81–85
├── 13_AUTOMATION_REPORTING/ STEP 86–88  🆕
├── 14_AI_INSIGHTS/          STEP 89     🆕
├── 15_BACKUP_RESTORE/       STEP 90     🆕
├── 16_P0_FIXES/             P0-01–05   🆕 (critical bug fixes)
├── 17_AUX_AUDITS/           AUX-01–06  🆕 (audit & prep)
└── 18_OPS_PROMPTS/          OPS-01     🆕 (quản lý pack)
```

---

## CÁCH DÙNG ĐÚNG

### Bước 1 — Đọc rules trước
Mở `00_PROJECT_RULES/00_MASTER_RULES.md` và paste vào đầu mỗi session Claude Code mới.

### Bước 2 — Chạy P0 trước (nếu có lỗi nền tảng)
```
P0_01 → P0_02 → P0_03 → P0_04 → P0_05
```
Chỉ chuyển sang STEP mới khi P0 đã xong và app build OK.

### Bước 3 — Chạy AUX (audit & chuẩn bị production)
```
AUX_01 → AUX_02 → AUX_03 → AUX_04 → AUX_05 → AUX_06
```

### Bước 4 — Chạy STEP theo thứ tự
```
STEP 85 → 86 → 87 → 88 → 89 → 90
```
Xem chi tiết trong `docs/centosy-arena/RUN_ORDER.md`.

---

## QUY TẮC BẮT BUỘC

| Rule | Nội dung |
|------|---------|
| KHÔNG refactor | Không viết lại toàn bộ component/service nếu không cần |
| KHÔNG phá UI | Không xóa/đổi tên component đang dùng |
| KHÔNG hardcode secret | Không đưa API key, token, password vào code |
| KHÔNG deploy | Chỉ deploy khi anh Hóa yêu cầu rõ ràng |
| KHÔNG skip step | Mỗi step phụ thuộc step trước |
| Báo cáo DONE | Sau mỗi step phải in báo cáo theo format `03_DONE_FORMAT.md` |

---

## LOẠI PROMPT

| Loại | Ký hiệu | Mục đích |
|------|---------|---------|
| Feature prompt | `STEP_XX` | Xây tính năng mới theo roadmap |
| Critical fix | `P0_XX` | Sửa lỗi nền tảng ngăn app hoạt động |
| Audit prompt | `AUX_XX` | Kiểm tra, chuẩn bị, test trước production |
| Ops prompt | `OPS_XX` | Quản lý, tổ chức prompt pack |

---

## TRẠNG THÁI HIỆN TẠI (2026-06-08)

- STEP đã có: **27–38, 40–90** (thiếu STEP 39)
- P0: ✅ P0-01 đến P0-05
- AUX: ✅ AUX-01 đến AUX-06
- OPS: ✅ OPS-01 (DONE)
- Rules: ✅ 00–05

**Điểm cần xử lý:**
- STEP 39: missing — xác nhận với anh Hóa
- STEP 85: có 2 bản khác nhau — chờ quyết định giữ bản nào

---

## FILE QUAN TRỌNG

| File | Tác dụng |
|------|---------|
| `RUN_ORDER.md` | Thứ tự chạy đầy đủ toàn bộ prompt pack |
| `00_PROJECT_RULES/00_MASTER_RULES.md` | Rules paste vào đầu mỗi session |
| `00_PROJECT_RULES/05_PROMPT_NUMBERING_RULE.md` | Quy tắc đánh số file prompt |
