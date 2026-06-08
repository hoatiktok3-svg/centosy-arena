# README_PROJECT_PROMPTS — CENTOSY ARENA

Đây là gói prompt đã đánh số thứ tự để đưa vào Claude Code/Cowork.

## Cách dùng

1. Giải nén file ZIP vào thư mục dự án.
2. Mở Claude Code/Cowork trong đúng thư mục dự án.
3. Dán câu lệnh trong `CLAUDE_READ_THIS_FIRST.txt`.
4. Chạy từng prompt theo thứ tự trong `run-order/RUN_ORDER_STEP91_111.md`.
5. Không chạy toàn bộ prompt cùng lúc.

## Quy ước

- STEP: phát triển tính năng.
- P0: audit/sửa lỗi nền móng, dữ liệu, quyền, hiệu năng.
- AUX: checklist/audit/test.
- OPS: tài liệu/vận hành/sắp xếp project.

## Luật an toàn

- Không refactor toàn bộ project.
- Không phá UI hiện tại.
- Không deploy/push nếu chưa yêu cầu.
- Không tự chạy SQL.
- Nếu cần SQL, tạo file patch riêng và chờ chủ dự án chạy thủ công.
