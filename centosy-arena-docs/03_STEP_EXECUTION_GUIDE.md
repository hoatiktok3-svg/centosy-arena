# Step Execution Guide

---

## Lệnh chạy step chuẩn

```text
Hãy đọc rules trong centosy-arena-prompts/00_PROJECT_RULES/.
Sau đó chỉ đọc và triển khai file prompt của STEP [SỐ].
Không chạy step khác.
Không refactor.
Không phá UI.
Không deploy.
Không push.
Build/test xong báo DONE STEP [SỐ].
```

---

## Cách chọn bước tiếp theo (sau mỗi STEP)

Sau khi Claude báo DONE STEP, output sẽ có mục **H. BƯỚC TIẾP THEO — CHỌN 1**.

Anh Hoá chỉ cần gõ số để thực hiện:

| Gõ | Hành động |
|---|---|
| `1` | Chạy STEP tiếp theo theo roadmap |
| `2` | Commit checkpoint step vừa xong |
| `3` | Audit lại step vừa xong trước khi tiếp tục |

---

## Workflow khuyến nghị mỗi session

```
1. Đọc: centosy-arena-docs/00_READ_ME_FIRST.md
2. Kiểm tra git status
3. Chạy STEP theo roadmap
4. Claude báo DONE → chọn 2 (commit) → chọn 1 (step tiếp theo)
5. Lặp lại
```

---

## Lưu ý quan trọng

- **Không gõ "ok" hay "tiếp tục"** — Claude sẽ hỏi lại.
- **Gõ đúng số 1, 2, hoặc 3** để Claude hành động ngay.
- **Hoặc gõ "chạy STEP xx"** để chỉ định step cụ thể.
- Mỗi session chỉ nên chạy 1-2 step để dễ kiểm soát.

---

## Ví dụ session mẫu

```
Anh Hoá: "chạy STEP 28"
Claude:   [thực hiện STEP 28] → DONE STEP 28 → hiện H. BƯỚC TIẾP THEO

Anh Hoá: "2"
Claude:   [commit checkpoint STEP 28]

Anh Hoá: "1"
Claude:   [thực hiện STEP 29] → DONE STEP 29 → hiện H. BƯỚC TIẾP THEO
```
