# GAME SCORE FLOW AUDIT
**CENTOSY ARENA** | Cập nhật: 2026-06-08 | P0-03 / J4

Tài liệu này phân loại từng game theo tình trạng lưu điểm thực tế.

---

## Phân loại

| Game | File | Lưu DB | RPC chuẩn | Score cộng vào profiles | Trạng thái |
|---|---|---|---|---|---|
| Product Quiz | `ProductQuizResult.tsx` | ✅ game_sessions + game_answers | ✅ saveGameResultSafe | ✅ | 🟢 CHUẨN |
| Difficult Customer | `DifficultCustomerResult.tsx` | ❌ game_results (bảng cũ) | ❌ insert trực tiếp | ❌ profiles.score không tăng | 🔴 LỖI → đã sửa trong P0-03 |
| Speed Price | `SpeedPriceResult.tsx` | ? | ? | ? | ⚠️ Cần kiểm tra |
| Flash Quiz | `FlashQuizResult.tsx` | ? | ? | ? | ⚠️ Cần kiểm tra |

> Chú thích: SpeedPriceResult và FlashQuizResult chưa được audit trong P0-03 — cần kiểm tra sau.

---

## Chi tiết từng game

### 1. Product Quiz — 🟢 CHUẨN

**File:** `src/components/games/ProductQuizResult.tsx`

**Flow:**
```
saveGameResultSafe(input)
  → shouldCreditScore() — anti-duplicate theo ngày
  → saveGameSession() → game_sessions + game_answers
  → RPC add_game_score_safe() → score_credited = true
  → fallback: addGameScore() nếu RPC lỗi
```

**Tables:**
- `game_sessions` — 1 row per play
- `game_answers` — 1 row per question per play

**Anti-duplicate:** ✅ Chỉ cộng điểm lần đầu trong ngày (theo `score_credited`)

---

### 2. Difficult Customer — 🔴 LỖI (đã sửa trong P0-03)

**File:** `src/components/games/DifficultCustomerResult.tsx`

**Trước khi sửa (lỗi):**
```
supabase.from('game_results').insert({...})
→ Bảng CŨ (deprecated), không cộng profiles.score
→ Không anti-duplicate
→ profiles.score không bao giờ tăng khi chơi game này
```

**Sau khi sửa (P0-03 J4):**
```
saveGameResultSafe(input)
  → shouldCreditScore() — anti-duplicate theo ngày
  → saveGameSession() → game_sessions + game_answers
  → RPC add_game_score_safe() → score_credited = true
```

**Mapping GameAnswer → AnswerLog:**
- `questionIndex` = index trong mảng answers
- `chosenOption` = OPTION_INDEX[chosen] hoặc -1 nếu timeout
- `correctOption` = -1 (game này không có "đáp án đúng duy nhất", scoring theo level)
- `isCorrect` = score >= 15 (25đ = xuất sắc, 15đ = chuẩn, 5đ = tạm được, 0đ = sai)
- `pointsEarned` = a.score

---

## Luồng điểm chuẩn (tham khảo)

```
[Game kết thúc]
       │
       ▼
shouldCreditScore(userId, gameKey)
       │
  ┌────┴────┐
  │ false   │ true
  │         │
  ▼         ▼
score=0   score=thật
  │         │
  └────┬────┘
       ▼
saveGameSession() → game_sessions + game_answers
       │
       ▼
(nếu credit=true) RPC add_game_score_safe()
       │ lỗi RPC?
       ▼
  fallback: addGameScore()
       │
       ▼
profiles.score += points ✅
```

---

## Cách kiểm tra sau khi sửa

1. Chơi game "Khách hàng khó tính" lần đầu trong ngày
2. Kiểm tra `profiles` → `score` phải tăng
3. Kiểm tra `game_sessions` → có row mới với `score_credited = true`
4. Chơi lại lần 2 cùng ngày → `score_credited = false`, `profiles.score` không đổi
5. Kiểm tra `game_answers` → có các row chi tiết từng câu

---

## SQL để kiểm tra

```sql
-- Xem các session gần nhất
SELECT id, user_id, game_key, score, score_credited, completed_at
FROM game_sessions
ORDER BY completed_at DESC
LIMIT 20;

-- Xem điểm user
SELECT id, full_name, score FROM profiles ORDER BY score DESC LIMIT 10;

-- Xem chi tiết answers
SELECT session_id, question_index, chosen_option, is_correct, points_earned
FROM game_answers
WHERE session_id = '<session_id_từ_query_trên>';
```
