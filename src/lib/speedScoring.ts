/**
 * speedScoring — STEP 71
 * Tính điểm dựa trên tốc độ trả lời + kiểm tra anti-cheat cơ bản.
 *
 * Nguyên tắc:
 *   - Điểm gốc (base) từ câu hỏi.
 *   - Speed bonus: tỷ lệ với thời gian còn lại trên thời gian tối đa cho phép.
 *     Càng nhanh → càng nhiều bonus, tối đa 50% base points.
 *   - Anti-cheat: nếu trả lời trong < MIN_HUMAN_MS → đánh dấu là suspicious.
 *     Câu hỏi suspicious bị giảm điểm về 0 (không phạt thêm).
 */

// ── Constants ─────────────────────────────────────────────────────
/** Thời gian tối đa để nhận full speed bonus (ms). Quá thời gian này: 0 bonus. */
export const SPEED_WINDOW_MS = 15_000   // 15 giây

/** Khi trả lời trong < MIN_HUMAN_MS: suspicious (không thể phản ứng nhanh hơn). */
export const MIN_HUMAN_MS = 400         // 400 ms

/** Bonus tối đa tính theo % của base points. */
export const MAX_BONUS_RATIO = 0.5      // +50% bonus khi trả lời ngay lập tức

// ── Types ─────────────────────────────────────────────────────────
export interface SpeedScoringInput {
  basePoints:   number    // điểm gốc nếu đúng
  isCorrect:    boolean
  timeTakenMs:  number    // thời gian trả lời câu này (ms)
}

export interface SpeedScoringResult {
  finalPoints:    number    // điểm thực sự được cộng
  basePoints:     number
  speedBonus:     number    // bonus thêm (0 nếu sai hoặc suspicious)
  isSuspicious:   boolean   // true nếu quá nhanh (anti-cheat)
  speedRatio:     number    // 0.0–1.0, tốc độ so với SPEED_WINDOW_MS
}

// ── Core function ──────────────────────────────────────────────────
export function calcSpeedScore(input: SpeedScoringInput): SpeedScoringResult {
  const { basePoints, isCorrect, timeTakenMs } = input

  // Anti-cheat: quá nhanh = suspicious
  const isSuspicious = timeTakenMs < MIN_HUMAN_MS

  if (!isCorrect || isSuspicious) {
    return {
      finalPoints:  0,
      basePoints,
      speedBonus:   0,
      isSuspicious,
      speedRatio:   0,
    }
  }

  // Speed ratio: 1.0 khi gần 0ms, 0.0 khi >= SPEED_WINDOW_MS
  const speedRatio = Math.max(0, 1 - timeTakenMs / SPEED_WINDOW_MS)

  // Bonus: 0 – MAX_BONUS_RATIO * basePoints
  const speedBonus = Math.round(speedRatio * MAX_BONUS_RATIO * basePoints)
  const finalPoints = basePoints + speedBonus

  return { finalPoints, basePoints, speedBonus, isSuspicious, speedRatio }
}

// ── Batch analysis (for a full game session) ───────────────────────
export interface SessionAntiCheatResult {
  isFlagged:         boolean   // true nếu session bị nghi gian lận
  suspiciousCount:   number    // số câu trả lời quá nhanh
  totalQuestions:    number
  flagReason?:       string
}

/** Phân tích toàn bộ session, trả về cờ gian lận nếu cần. */
export function analyzeSessionAntiCheat(
  answers: Array<{ isCorrect: boolean; timeTakenMs: number }>
): SessionAntiCheatResult {
  const totalQuestions = answers.length

  const suspiciousAnswers = answers.filter(
    a => a.isCorrect && a.timeTakenMs < MIN_HUMAN_MS
  )
  const suspiciousCount = suspiciousAnswers.length

  // Flag nếu > 30% câu đúng bị suspicious (hoặc >= 3 câu)
  const suspiciousRatio = totalQuestions > 0 ? suspiciousCount / totalQuestions : 0
  const isFlagged = suspiciousCount >= 3 || suspiciousRatio > 0.3

  const flagReason = isFlagged
    ? `${suspiciousCount}/${totalQuestions} câu trả lời quá nhanh (< ${MIN_HUMAN_MS}ms)`
    : undefined

  return { isFlagged, suspiciousCount, totalQuestions, flagReason }
}

// ── Display helper ─────────────────────────────────────────────────
/** Format speed label để hiển thị trong UI. */
export function getSpeedLabel(timeTakenMs: number): { label: string; color: string } {
  if (timeTakenMs < 2_000) return { label: '⚡ Siêu nhanh!', color: '#facc15' }
  if (timeTakenMs < 5_000) return { label: '🔥 Nhanh', color: '#f97316' }
  if (timeTakenMs < 10_000) return { label: '👍 Ổn', color: '#4ade80' }
  return { label: '🐢 Chậm', color: '#585858' }
}
