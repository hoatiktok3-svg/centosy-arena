# STEP 91 — Tự chuyển câu mới + cập nhật điểm/thứ hạng tức thời

## Mục tiêu
Sau khi người chơi trả lời, khóa đáp án, tính điểm, cập nhật điểm/thứ hạng ngay,
chờ 500–800ms (flash confirm) → hiển thị feedback 2s → tự chuyển câu tiếp.

## Files sửa
- `src/components/games/DifficultCustomerFeedback.tsx` — thêm auto-advance countdown 2s
- `src/components/games/DifficultCustomerGame.tsx` — score update tức thời sau chọn đáp án

## Constraints
- KHÔNG sửa file ngoài phạm vi trên
- KHÔNG thay đổi scoring logic / saveGameResultSafe
- Người chơi vẫn có thể nhấn nút để chuyển sớm
- Hiển thị countdown bar để user biết còn bao lâu auto-advance

## Test
1. Chơi 1 ván DifficultCustomer
2. Chọn đáp án → điểm tích lũy trên top bar cập nhật ngay
3. Feedback hiện ra → progress bar đếm ngược 2s → tự chuyển câu tiếp
4. Không cần nhấn nút (nhưng nhấn vẫn hoạt động)
5. Câu cuối tự sang màn kết quả
