# Done Format

Output bắt buộc sau mỗi STEP hoàn thành — theo đúng thứ tự A → I.

---

## Phần kết quả

A. File đã tạo/sửa
B. Logic đã thêm
C. Cách test
D. Build result
E. Rủi ro còn lại
F. DONE STEP [SỐ]

---

## Phần điều hướng (BẮT BUỘC sau mỗi STEP)

G. Có nên commit không?

```
Khuyến nghị: Có / Không
Lý do: [build OK / còn lỗi / chưa test xong]

Lệnh commit gợi ý:
git add [các file liên quan]
git commit -m "feat: STEP [SỐ] [short-feature-name]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

H. BƯỚC TIẾP THEO — CHỌN 1:

```
1. Chạy STEP [SỐ TIẾP THEO] — [TÊN STEP TIẾP THEO]
   Khuyến nghị: NÊN CHỌN nếu build OK và không có lỗi
   Lý do: bước tiếp theo đúng roadmap

2. Commit checkpoint STEP [SỐ HIỆN TẠI]
   Khuyến nghị: NÊN LÀM nếu chưa commit và build OK
   Lý do: tạo điểm an toàn trước khi chạy step mới

3. Audit lại STEP [SỐ HIỆN TẠI]
   Khuyến nghị: chọn nếu có lỗi UI / build / logic chưa chắc
   Lý do: kiểm tra kỹ trước khi tiếp tục
```

---

I. Nếu chọn 1, dùng lệnh này:

```
Hãy đọc rules trong centosy-arena-prompts/00_PROJECT_RULES/.
Sau đó chỉ đọc và triển khai file prompt của STEP [SỐ TIẾP THEO].
Không chạy step khác.
Không refactor.
Không phá UI.
Không deploy.
Không push.
Build/test xong báo DONE STEP [SỐ TIẾP THEO].
```

---

## Quy tắc bắt buộc

- Không bỏ qua mục G, H, I dù step ngắn hay dài.
- Số step trong H phải khớp với roadmap trong `centosy-arena-docs/02_ROADMAP_STEP_27_64.md`.
- Lệnh commit trong G phải dùng `git add [file cụ thể]`, không dùng `git add -A` hoặc `git add .` bừa bãi.
- Nếu build FAIL → mục G ghi "Không nên commit" + liệt kê lỗi cần fix.
