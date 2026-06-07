/**
 * gameService — helper chuẩn hóa lưu game session + answers
 * STEP 66: Thay thế việc insert thẳng vào game_results mỗi nơi một kiểu.
 * STEP 67: Score engine + anti-duplicate (daily play limit).
 */
import { supabase } from './supabaseClient'

// ── Types ────────────────────────────────────────────────────────
export interface AnswerLog {
  questionIndex:  number
  questionText?:  string
  chosenOption:   number   // index
  correctOption:  number   // index
  isCorrect:      boolean
  pointsEarned:   number
  timeTakenMs?:   number
}

export interface GameSessionInput {
  userId:         string
  gameKey:        string
  gameTitle:      string
  score:          number
  maxScore:       number
  correctCount:   number
  totalQuestions: number
  durationMs?:    number
  answers:        AnswerLog[]
}

export interface SaveGameResult {
  sessionId: string | null
  error:     string | null
}

// ── saveGameSession ───────────────────────────────────────────────
// Lưu 1 session game hoàn chỉnh (session + answers).
// Không tự cộng profiles.score — dùng addGameScore() riêng.
export async function saveGameSession(input: GameSessionInput): Promise<SaveGameResult> {
  // 1. Insert session
  const { data: session, error: sessionErr } = await supabase
    .from('game_sessions')
    .insert({
      user_id:         input.userId,
      game_key:        input.gameKey,
      game_title:      input.gameTitle,
      score:           input.score,
      max_score:       input.maxScore,
      correct_count:   input.correctCount,
      total_questions: input.totalQuestions,
      duration_ms:     input.durationMs ?? null,
      status:          'completed',
      completed_at:    new Date().toISOString(),
    })
    .select('id')
    .single()

  if (sessionErr || !session) {
    console.error('[gameService] session insert error:', sessionErr?.message)
    return { sessionId: null, error: sessionErr?.message ?? 'unknown' }
  }

  const sessionId = session.id

  // 2. Insert answers (batch)
  if (input.answers.length > 0) {
    const answerRows = input.answers.map(a => ({
      session_id:     sessionId,
      user_id:        input.userId,
      question_index: a.questionIndex,
      question_text:  a.questionText ?? null,
      chosen_option:  a.chosenOption,
      correct_option: a.correctOption,
      is_correct:     a.isCorrect,
      points_earned:  a.pointsEarned,
      time_taken_ms:  a.timeTakenMs ?? null,
    }))

    const { error: answersErr } = await supabase
      .from('game_answers')
      .insert(answerRows)

    if (answersErr) {
      // Session đã lưu OK — chỉ warn, không fail
      console.warn('[gameService] answers insert warning:', answersErr.message)
    }
  }

  return { sessionId, error: null }
}

// ── addGameScore ──────────────────────────────────────────────────
// Cộng điểm vào profiles.score. Gọi sau saveGameSession().
// Dùng Supabase RPC nếu có trigger, fallback dùng fetch current + update.
export async function addGameScore(userId: string, points: number): Promise<{ error: string | null }> {
  if (points <= 0) return { error: null }

  // Fetch current score
  const { data: profile, error: fetchErr } = await supabase
    .from('profiles')
    .select('score')
    .eq('id', userId)
    .single()

  if (fetchErr || !profile) {
    console.error('[gameService] fetch score error:', fetchErr?.message)
    return { error: fetchErr?.message ?? 'profile not found' }
  }

  const newScore = (profile.score ?? 0) + points

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ score: newScore })
    .eq('id', userId)

  if (updateErr) {
    console.error('[gameService] update score error:', updateErr.message)
    return { error: updateErr.message }
  }

  return { error: null }
}

// ── saveGameResult (convenience) ──────────────────────────────────
// Gộp saveGameSession + addGameScore vào 1 call.
// Trả về sessionId. Dùng cho ProductQuiz và các game mới.
export async function saveGameResult(input: GameSessionInput): Promise<SaveGameResult> {
  const result = await saveGameSession(input)
  if (!result.error) {
    const { error: scoreErr } = await addGameScore(input.userId, input.score)
    if (scoreErr) {
      console.warn('[gameService] score update warning:', scoreErr)
    }
  }
  return result
}

// ── STEP 67: Anti-duplicate ───────────────────────────────────────

export interface PlayLimitResult {
  canPlay:        boolean
  todayPlayCount: number
  maxPlaysPerDay: number
  reason?:        string
}

// Mặc định: mỗi game được chơi tối đa MAX_PLAYS_PER_DAY lần/ngày
// Chỉ lần đầu tiên trong ngày được cộng điểm
const MAX_PLAYS_PER_DAY = 3

// Kiểm tra số lần chơi hôm nay của user cho 1 game_key cụ thể
export async function checkDailyPlayLimit(
  userId:  string,
  gameKey: string,
  maxPlays = MAX_PLAYS_PER_DAY
): Promise<PlayLimitResult> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('game_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('game_key', gameKey)
    .eq('status', 'completed')
    .gte('completed_at', todayStart.toISOString())

  if (error) {
    console.warn('[gameService] play limit check error:', error.message)
    // Nếu không check được → cho phép chơi (fail open)
    return { canPlay: true, todayPlayCount: 0, maxPlaysPerDay: maxPlays }
  }

  const todayPlayCount = count ?? 0
  const canPlay = todayPlayCount < maxPlays

  return {
    canPlay,
    todayPlayCount,
    maxPlaysPerDay: maxPlays,
    reason: canPlay ? undefined : `Đã đạt giới hạn ${maxPlays} lượt/ngày cho game này`,
  }
}

// Kiểm tra xem lần chơi này có được cộng điểm không
// (chỉ lần đầu trong ngày mới cộng điểm — các lần sau vẫn chơi được nhưng 0đ)
export async function shouldCreditScore(
  userId:  string,
  gameKey: string
): Promise<boolean> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('game_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('game_key', gameKey)
    .eq('status', 'completed')
    .eq('score_credited', true)
    .gte('completed_at', todayStart.toISOString())

  return (count ?? 0) === 0  // chỉ cộng nếu chưa có session nào được credited hôm nay
}

// ── saveGameResultSafe (STEP 67 version) ─────────────────────────
// Lưu session + chỉ cộng điểm khi lần đầu chơi trong ngày.
// Vẫn cho lưu session (để track lịch sử) nhưng score = 0 cho lần 2+.
export async function saveGameResultSafe(input: GameSessionInput): Promise<SaveGameResult & { scoreCredited: boolean }> {
  const credit = await shouldCreditScore(input.userId, input.gameKey)
  const scoreToRecord = credit ? input.score : 0

  const result = await saveGameSession({ ...input, score: scoreToRecord })

  if (!result.error && credit && scoreToRecord > 0) {
    // Dùng RPC nếu có, fallback sang addGameScore
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('add_game_score_safe', {
        p_user_id:    input.userId,
        p_session_id: result.sessionId,
        p_points:     scoreToRecord,
      })

    if (rpcErr) {
      // Fallback: cộng điểm trực tiếp
      console.warn('[gameService] RPC fallback:', rpcErr.message)
      await addGameScore(input.userId, scoreToRecord)
    } else {
      console.info('[gameService] score credited via RPC:', rpcData)
    }
  }

  return { ...result, scoreCredited: credit }
}
