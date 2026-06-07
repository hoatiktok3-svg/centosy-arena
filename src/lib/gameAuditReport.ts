/**
 * STEP 65 — Game Data Flow Audit Report
 *
 * Kết quả kiểm tra luồng dữ liệu game trong CENTOSY ARENA.
 * File này chỉ là tài liệu — không export runtime logic.
 */

/*
╔══════════════════════════════════════════════════════════════╗
║              GAME DATA FLOW AUDIT — STEP 65                  ║
╚══════════════════════════════════════════════════════════════╝

── 1. GAME TABLE HIỆN CÓ ─────────────────────────────────────
  Bảng Supabase: `game_results`
  Cột đang dùng (theo DifficultCustomerResult.tsx):
    - user_id          uuid (FK → profiles)
    - game_key         text  (ví dụ: 'difficult_customer')
    - game_title       text
    - score            int
    - max_score        int
    - correct_count    int
    - total_questions  int
    - duration_seconds int | null
    - title_earned     text

  Bảng Supabase: `profiles`
    - score: int  (tổng điểm tích lũy của user)
    ⚠️ Không có cột: answer_log, play_count, last_played_at

── 2. GAMES HIỆN CÓ TRONG APP ────────────────────────────────
  Game               | Lưu game_results | Cộng profiles.score
  -------------------|-----------------|--------------------
  DifficultCustomer  | ✅ CÓ           | ❓ Chưa rõ (Supabase trigger?)
  ProductQuiz        | ❌ KHÔNG        | ❌ KHÔNG
  TrainingTest       | ❌ KHÔNG        | ❌ KHÔNG (localStorage only)
  SpinWheel*         | ❌ Không tìm thấy component
  MemoryGame*        | ❌ Không tìm thấy component
  TriviaQuiz*        | ❌ Không tìm thấy component

  (* Các game này được list trong mockGames nhưng chưa có page riêng)

── 3. VẤN ĐỀ PHÁT HIỆN ──────────────────────────────────────
  [GAP-01] ProductQuizPage.tsx:
    → Tính điểm nội bộ (state `score`) nhưng KHÔNG insert vào game_results
    → KHÔNG gọi API để cộng điểm vào profiles.score
    → Người dùng chơi xong mất điểm sau khi tắt overlay

  [GAP-02] profiles.score không được cập nhật tự động:
    → Không có RPC/trigger nào được gọi từ frontend khi game kết thúc
    → DifficultCustomer chỉ insert game_results — không rõ
      profiles.score có tăng không (phụ thuộc vào Supabase trigger)
    → Nếu không có trigger → profiles.score = 0 mãi mãi cho game

  [GAP-03] Thiếu anti-duplicate:
    → Không có kiểm tra "đã chơi game này hôm nay chưa?"
    → User có thể replay vô hạn để farm điểm

  [GAP-04] Không có answer_log:
    → Không lưu câu trả lời chi tiết (question_id, chosen_option, time_taken)
    → Không thể phân tích sai ở đâu, không có basis cho AI quiz generator

  [GAP-05] duration_seconds = null:
    → DifficultCustomerResult.tsx truyền null cho duration_seconds
    → Không track thời gian làm bài → không thể làm speed-based scoring

── 4. LUỒNG ĐÚNG CẦN XÂY DỰNG (STEP 66–70) ─────────────────
  Player → game UI
       → on finish: insert game_results (với answers + duration)
       → call RPC add_game_score(user_id, score) → cập nhật profiles.score
       → check anti-duplicate trước khi cho phép lưu điểm
       → realtime broadcast → leaderboard cập nhật live

── 5. FILES CẦN SỬA TRONG STEP 66+ ─────────────────────────
  - src/pages/ProductQuizPage.tsx  → thêm saveGameResult()
  - src/lib/gameService.ts         → tạo mới: helper lưu game + cộng điểm
  - supabase/game_results_v2.sql   → thêm cột: answers_json, duration_ms
  - supabase/rpc_add_game_score.sql → RPC add_game_score nếu chưa có trigger

── 6. GIẢ ĐỊNH VỀ SUPABASE TRIGGER ─────────────────────────
  Chưa đọc được schema.sql đầy đủ (file bị protect).
  Cần xác nhận: có trigger nào tự cập nhật profiles.score
  khi insert vào game_results không?
  → Nếu có: chỉ cần đảm bảo game_results.score đúng
  → Nếu không: cần RPC hoặc frontend gọi update trực tiếp

*/

export const GAME_AUDIT_VERSION = '65.0.0'
export const AUDIT_DATE = '2026-06-07'

export type AuditGap =
  | 'GAP-01-product-quiz-no-save'
  | 'GAP-02-score-not-synced'
  | 'GAP-03-no-anti-duplicate'
  | 'GAP-04-no-answer-log'
  | 'GAP-05-no-duration-tracking'

export const AUDIT_GAPS: AuditGap[] = [
  'GAP-01-product-quiz-no-save',
  'GAP-02-score-not-synced',
  'GAP-03-no-anti-duplicate',
  'GAP-04-no-answer-log',
  'GAP-05-no-duration-tracking',
]
