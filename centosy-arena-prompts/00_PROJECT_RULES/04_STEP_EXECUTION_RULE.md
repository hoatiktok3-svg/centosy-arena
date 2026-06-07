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
