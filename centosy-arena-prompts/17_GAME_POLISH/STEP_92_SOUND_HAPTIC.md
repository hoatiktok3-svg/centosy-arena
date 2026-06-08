# STEP 92 — Âm thanh/rung nhẹ khi đúng/sai

## Mục tiêu
Thêm feedback game: âm thanh ngắn, rung nhẹ, nút bật/tắt âm thanh.
Không ảnh hưởng scoring/realtime.

## Files sửa
- `src/components/games/DifficultCustomerGame.tsx` — tích hợp sounds + haptic + mute button

## Logic
- Chọn đáp án: soundSelect() + hapticLight()
- score >= 15: soundCorrect() + hapticSuccess()
- score < 5: soundWrong() + hapticError()
- score 5-14: hapticLight()
- Timer <= 3s: soundTick() mỗi giây
- Game complete: soundComplete() + hapticCelebration()
- Nút 🔊/🔇 ở top bar (lưu localStorage)
