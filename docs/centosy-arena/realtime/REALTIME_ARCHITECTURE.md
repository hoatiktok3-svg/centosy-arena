# STEP 93 — Kiến trúc Phòng Chơi Realtime CENTOSY ARENA

## Tổng quan

Admin tạo phòng → người chơi vào phòng → câu hỏi đồng bộ đến tất cả → leaderboard mỗi 3s.

---

## Các thực thể chính

### game_rooms
| Column | Type | Ghi chú |
|---|---|---|
| id | uuid PK | |
| code | text UNIQUE | 6 ký tự IN HOA, người chơi dùng để vào phòng |
| title | text | Tên buổi chơi |
| status | text | `waiting` → `playing` → `showing_leaderboard` → `finished` |
| created_by | uuid FK profiles | Admin tạo phòng |
| question_set_id | uuid FK | Bộ câu hỏi |
| current_question_index | int | Câu hỏi đang chạy (0-based) |
| current_question_started_at | timestamptz | Server time lúc bắt đầu câu |
| question_time_limit_s | int | default 15 |
| created_at | timestamptz | |
| finished_at | timestamptz | |

### room_players
| Column | Type | Ghi chú |
|---|---|---|
| id | uuid PK | |
| room_id | uuid FK game_rooms | |
| user_id | uuid FK profiles | |
| display_name | text | |
| joined_at | timestamptz | |
| total_score | int | default 0 |
| correct_count | int | default 0 |
| final_rank | int | null until finished |
| is_active | bool | false nếu thoát giữa chừng |

### room_answers
| Column | Type | Ghi chú |
|---|---|---|
| id | uuid PK | |
| room_id | uuid FK | |
| question_index | int | |
| user_id | uuid FK | |
| chosen_option | int | 0–3 |
| is_correct | bool | |
| response_time_ms | int | |
| points_earned | int | base + speed bonus |
| created_at | timestamptz | |
| UNIQUE(room_id, question_index, user_id) | | Chống bấm nhiều lần |

### question_sets
| Column | Type | Ghi chú |
|---|---|---|
| id | uuid PK | |
| title | text | |
| created_by | uuid | |
| is_active | bool | |

### questions
| Column | Type | Ghi chú |
|---|---|---|
| id | uuid PK | |
| set_id | uuid FK question_sets | |
| question_text | text | |
| options | jsonb | `["A","B","C","D"]` |
| correct_index | int | 0–3 |
| points | int | default 10 |
| order_index | int | |

---

## Flow trạng thái phòng

```
[waiting]
  Admin tạo phòng → người chơi vào (real-time subscribe)
  Admin nhấn "Bắt đầu" → status = playing, current_question_index = 0

[playing]
  current_question_started_at = NOW()
  Timer 15s client-side (sync với server time)
  Người chơi bấm → INSERT room_answers (UNIQUE bảo vệ)
  Sau 15s hoặc all answered → status = showing_leaderboard

[showing_leaderboard]
  Hiện top N người chơi 3s
  Auto → current_question_index++ → status = playing (câu tiếp)
  Hoặc nếu hết câu → status = finished

[finished]
  Hiện màn kết quả cuối
  Lưu final_rank vào room_players
  Cộng điểm vào profiles.score (qua RPC add_game_score_safe)
```

---

## Realtime subscriptions

### Admin view
```
supabase.channel('room:{room_id}')
  .on('postgres_changes', { event: '*', table: 'room_players' }, updatePlayerList)
  .on('postgres_changes', { event: 'UPDATE', table: 'game_rooms', filter: 'id=eq.{room_id}' }, handleRoomStateChange)
```

### Player view
```
supabase.channel('room:{room_id}:player')
  .on('postgres_changes', { event: 'UPDATE', table: 'game_rooms', filter: 'id=eq.{room_id}' }, handleRoomStateChange)
```

---

## Tính điểm tốc độ

```
base_points = question.points (default 10)
time_remaining = question_time_limit_s - response_time_ms/1000
speed_bonus = Math.floor(time_remaining / question_time_limit_s * base_points * 0.5)
total = is_correct ? base_points + speed_bonus : 0
```

Tối đa = base_points * 1.5 (trả lời ngay lập tức).

---

## Components cần tạo

```
src/
  pages/
    GameRoomPage.tsx          — Admin: tạo/quản lý phòng
    JoinRoomPage.tsx          — Player: nhập mã phòng
  components/
    room/
      RoomLobby.tsx           — Phòng chờ (admin + player)
      QuestionDisplay.tsx     — Hiển thị câu hỏi + timer
      AnswerGrid.tsx          — 4 lựa chọn A/B/C/D
      LiveLeaderboard.tsx     — Bảng xếp hạng realtime
      RoomResult.tsx          — Kết quả cuối + top 3
      RoomHistory.tsx         — Lịch sử phòng (admin)
```

---

## RLS Policy tối thiểu

- `game_rooms`: SELECT cho authenticated, INSERT/UPDATE chỉ admin
- `room_players`: SELECT cho authenticated, INSERT/UPDATE chỉ chính mình
- `room_answers`: SELECT cho authenticated, INSERT chỉ chính mình, UPDATE/DELETE KHÔNG
- `questions`: SELECT cho authenticated, INSERT/UPDATE chỉ admin
