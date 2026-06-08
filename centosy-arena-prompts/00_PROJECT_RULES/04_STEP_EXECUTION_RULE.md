# Step Execution Rule

## Quy tắc chạy step

- Khi anh Hoá nói "chạy STEP xx", chỉ đọc file STEP_xx tương ứng trong `centosy-arena-prompts/`.
- Không chạy step trước/sau.
- Nếu thiếu dependency, dừng lại và báo cần hoàn thành step nào trước.
- Nếu step đã làm rồi, audit trước, không làm lại từ đầu.

---

## Quy tắc sau khi hoàn thành step

Sau mỗi STEP, Claude PHẢI xuất output theo đúng format trong `03_DONE_FORMAT.md`.

Bắt buộc có đủ 9 mục: A B C D E F G H I.

**Không được kết thúc response mà thiếu mục H (BƯỚC TIẾP THEO — CHỌN 1).**

---

## Quy tắc nhận lệnh từ anh Hoá

| Anh Hoá nói | Claude làm |
|---|---|
| "chạy STEP xx" | Đọc file STEP_xx, thực hiện đúng phạm vi, báo DONE |
| "1" hoặc "chọn 1" | Chạy STEP tiếp theo như đã gợi ý ở mục H |
| "2" hoặc "chọn 2" | Thực hiện commit checkpoint |
| "3" hoặc "chọn 3" | Audit lại step vừa xong |
| "ok" / "tiếp tục" | Hỏi lại — không tự chạy step |
| "commit" | Thực hiện commit với lệnh gợi ý ở mục G |

---

## Thứ tự ưu tiên khi có xung đột

1. Đọc `00_MASTER_RULES.md` trước.
2. Đọc file STEP_xx tương ứng.
3. Không làm gì ngoài phạm vi step được giao.
4. Luôn build/typecheck trước khi báo DONE.
5. Luôn xuất đủ mục G H I ở cuối output.

---

## Quy tắc khi context gần hết (Context Limit Rule)

**Dấu hiệu context sắp hết:**
- Claude bắt đầu quên nội dung đầu session
- Response bị cắt ngắn bất thường
- Claude hỏi lại những gì đã biết

**Khi context còn ~20% (khoảng 15-20 tool calls liên tiếp):**

Claude PHẢI chủ động dừng và thực hiện Session Handoff Package:

1. Cập nhật PROJECT_STATUS.md
2. Cập nhật SESSION_HANDOFF.md (step đã làm, file đã sửa)
3. Cập nhật CURRENT_STEP.md
4. Cập nhật PROMPT_QUEUE.md
5. Tạo/cập nhật NEXT_SESSION_PROMPT.md
6. Tạo CHANGELOG_SESSION.md (log chi tiết session hiện tại)
7. In ra câu lệnh New Session đầy đủ theo format:

---
TÔI MỞ NEW SESSION MỚI — HÃY ĐỌC TRƯỚC KHI LÀM:
[nội dung NEXT_SESSION_PROMPT.md]
---

**Không bao giờ để context hết mà không có handoff.**
Nếu bị forced-summary (Claude tự tóm tắt), đó là dấu hiệu đã quá muộn.
