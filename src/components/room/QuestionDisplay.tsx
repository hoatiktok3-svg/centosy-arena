// QuestionDisplay — màn hình câu hỏi cho người chơi
// - Timer đồng bộ server, âm thanh tick/hết giờ
// - Reveal đáp án đúng/sai + animation khi hết giờ
// - Streak badge + bonus points display
// - Bảng xếp hạng trực tiếp ở cuối
import { useState, useEffect, useRef, useMemo } from 'react'
import { RoomQuestion, GameRoom, RoomPlayer } from './roomTypes'
import { useGameAudio } from '../../hooks/useGameAudio'

interface Props {
  room:           GameRoom
  question:       RoomQuestion
  questionIndex:  number
  totalQuestions: number
  myAnswer:       number | null
  onAnswer:       (optionIndex: number, responseTimeMs: number) => void
  currentScore:   number
  myRank:         number | null
  players:        RoomPlayer[]
  myUserId:       string
  currentStreak:  number
}

const OPTION_LABELS  = ['A', 'B', 'C', 'D']
const BRAND          = '#E94E1B'
const MEDALS         = ['🥇', '🥈', '🥉']
const STREAK_COLORS  = ['', '#facc15', '#fb923c', '#f87171', '#a78bfa', '#ec4899']

export default function QuestionDisplay({
  room, question, questionIndex, totalQuestions,
  myAnswer, onAnswer, currentScore, myRank,
  players, myUserId, currentStreak,
}: Props) {
  const timeLimitS = room.question_time_limit_s
  const audio      = useGameAudio()

  const initialTime = useMemo(() => {
    if (room.current_question_started_at) {
      const elapsed = (Date.now() - new Date(room.current_question_started_at).getTime()) / 1000
      return Math.max(0, timeLimitS - elapsed)
    }
    return timeLimitS
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, room.current_question_started_at, timeLimitS])

  const [timeLeft, setTimeLeft] = useState(initialTime)
  const tickedRef = useRef<Set<number>>(new Set())
  const timeUpSoundRef = useRef(false)
  const answeredSoundRef = useRef(false)

  useEffect(() => {
    setTimeLeft(initialTime)
    tickedRef.current.clear()
    timeUpSoundRef.current = false
    answeredSoundRef.current = false
    const id = setInterval(() => {
      setTimeLeft(t => {
        const next = Math.max(0, t - 0.05)
        // Tick sounds last 5 seconds
        const secs = Math.ceil(next)
        if (secs <= 5 && secs > 0 && !tickedRef.current.has(secs)) {
          tickedRef.current.add(secs)
          audio.playSfx('tick')
        }
        // Time up sound
        if (next <= 0 && !timeUpSoundRef.current) {
          timeUpSoundRef.current = true
          audio.playSfx('timeup')
        }
        return next
      })
    }, 50)
    return () => clearInterval(id)
  }, [questionIndex, initialTime]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sound on answer submit
  const prevAnswerRef = useRef<number | null>(null)
  useEffect(() => {
    if (myAnswer !== null && prevAnswerRef.current === null && !answeredSoundRef.current) {
      answeredSoundRef.current = true
      const correct = myAnswer === question.correct_index
      audio.playSfx(correct ? 'correct' : 'wrong')
    }
    prevAnswerRef.current = myAnswer
  }, [myAnswer]) // eslint-disable-line react-hooks/exhaustive-deps

  const pct        = (timeLeft / timeLimitS) * 100
  const timerColor = timeLeft > timeLimitS * 0.5 ? BRAND : timeLeft > timeLimitS * 0.25 ? '#facc15' : '#ef4444'
  const answered   = myAnswer !== null && myAnswer >= 0
  const timeUp     = timeLeft <= 0
  const revealNow  = timeUp
  const isCorrect  = myAnswer !== null && myAnswer === question.correct_index

  const handleSelect = (i: number) => {
    if (answered || timeUp) return
    audio.initAudio()
    const elapsed = (timeLimitS - timeLeft) * 1000
    onAnswer(i, Math.round(elapsed))
  }

  // Sorted live leaderboard
  const sortedPlayers = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)

  const getOptionStyle = (i: number) => {
    const isCorrectOpt = i === question.correct_index
    const isSelected   = myAnswer === i
    if (revealNow) {
      if (isCorrectOpt) return { bg: 'rgba(16,185,129,0.18)', border: '1.5px solid rgba(16,185,129,0.7)', textColor: '#6ee7b7' }
      if (isSelected)   return { bg: 'rgba(239,68,68,0.14)', border: '1.5px solid rgba(239,68,68,0.6)', textColor: '#fca5a5' }
      return { bg: '#0d0d0d', border: '1.5px solid #1a1a1a', textColor: '#444' }
    }
    if (isSelected) {
      const c = [BRAND, '#4ade80', '#facc15', '#60a5fa'][i]
      return { bg: `${c}18`, border: `1.5px solid ${c}`, textColor: '#fff' }
    }
    return { bg: '#141414', border: '1.5px solid #222', textColor: '#ccc' }
  }

  const streakLabel = currentStreak >= 2
    ? currentStreak >= 5 ? '🔥 SIÊU STREAK!'
      : currentStreak >= 4 ? '🔥 Streak ×4'
      : currentStreak >= 3 ? '🔥 Streak ×3'
      : '⚡ Streak ×2'
    : null
  const streakColor = STREAK_COLORS[Math.min(currentStreak, 5)]

  // Speed bonus preview
  const speedBonusPreview = answered && isCorrect
    ? Math.floor(Math.max(0, 1 - (timeLimitS - timeLeft) / timeLimitS) * 50) +
      Math.min(currentStreak, 5) * 15
    : 0

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pb-3"
           style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-2">
          {/* Left: câu số + streak */}
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '12px', color: '#888' }}>
              Câu <span className="text-white font-black">{questionIndex + 1}</span>/{totalQuestions}
            </span>
            {streakLabel && (
              <span className="px-2 py-0.5 rounded-full font-black"
                    style={{ fontSize: '10px', background: `${streakColor}22`, color: streakColor, border: `1px solid ${streakColor}55` }}>
                {streakLabel}
              </span>
            )}
          </div>

          {/* Right: rank + score + timer */}
          <div className="flex items-center gap-2">
            {myRank && (
              <span className="px-2 py-0.5 rounded-full font-black"
                    style={{ fontSize: '11px', background: 'rgba(250,204,21,0.1)', color: '#facc15', border: '1px solid rgba(250,204,21,0.3)' }}>
                #{myRank}
              </span>
            )}
            <span className="font-black" style={{ fontSize: '13px', color: BRAND }}>{currentScore}đ</span>
            {/* Timer pill */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                 style={{ background: '#141414', border: `1px solid ${timerColor}55` }}>
              <span style={{ fontSize: '11px' }}>⏱</span>
              <span className="font-black tabular-nums"
                    style={{ fontSize: '17px', color: timerColor, minWidth: 24 }}>
                {Math.ceil(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full"
               style={{ width: `${pct}%`, background: timerColor, transition: 'none' }} />
        </div>
        {/* Question progress dots */}
        <div className="flex gap-1 mt-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div key={i} className="flex-1 h-0.5 rounded-full"
                 style={{ background: i < questionIndex ? '#4ade80' : i === questionIndex ? BRAND : '#1f1f1f' }} />
          ))}
        </div>
      </div>

      {/* ── Content (scrollable) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {/* Question text */}
        <div className="rounded-2xl px-4 py-4"
             style={{ background: '#0d0d0d', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Câu hỏi {questionIndex + 1}
          </p>
          <p className="font-bold leading-snug text-white" style={{ fontSize: '15px' }}>
            {question.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => {
            const s          = getOptionStyle(i)
            const isCorr     = i === question.correct_index
            const isSel      = myAnswer === i
            return (
              <button key={i} onClick={() => handleSelect(i)}
                      disabled={answered || timeUp}
                      className="w-full text-left rounded-2xl px-4 py-4 transition-all active:scale-[0.98] disabled:cursor-default"
                      style={{ background: s.bg, border: s.border }}>
                <div className="flex items-center gap-3">
                  {/* Option label circle */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0"
                       style={{
                         fontSize: '13px',
                         background: revealNow ? (isCorr ? 'rgba(16,185,129,0.25)' : isSel ? 'rgba(239,68,68,0.2)' : '#1f1f1f') : (isSel ? `${[BRAND,'#4ade80','#facc15','#60a5fa'][i]}25` : '#1f1f1f'),
                         border: revealNow ? (isCorr ? '1.5px solid rgba(16,185,129,0.6)' : isSel ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid #2a2a2a') : `1.5px solid ${isSel ? [BRAND,'#4ade80','#facc15','#60a5fa'][i] : '#333'}`,
                         color: revealNow ? (isCorr ? '#10b981' : isSel ? '#f87171' : '#555') : (isSel ? [BRAND,'#4ade80','#facc15','#60a5fa'][i] : '#666'),
                       }}>
                    {OPTION_LABELS[i]}
                  </div>
                  {/* Option text */}
                  <p style={{ fontSize: '14px', color: s.textColor, flex: 1, lineHeight: 1.4 }}>
                    {opt}
                  </p>
                  {/* Reveal badges */}
                  {revealNow && isCorr && <span style={{ fontSize: '18px', flexShrink: 0 }}>✅</span>}
                  {revealNow && isSel && !isCorr && <span style={{ fontSize: '18px', flexShrink: 0 }}>❌</span>}
                  {!revealNow && isSel && <span style={{ fontSize: '18px', color: [BRAND,'#4ade80','#facc15','#60a5fa'][i], flexShrink: 0 }}>✓</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback banners */}
        {revealNow && answered && (
          <div className="rounded-2xl px-4 py-3"
               style={{
                 background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                 border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
               }}>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '22px' }}>{isCorrect ? '🎉' : '😢'}</span>
              <div className="flex-1">
                <p className="font-black" style={{ fontSize: '14px', color: isCorrect ? '#10b981' : '#f87171' }}>
                  {isCorrect ? `Chính xác! +${100 + speedBonusPreview}đ` : 'Sai rồi!'}
                </p>
                {!isCorrect && (
                  <p style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>
                    Đáp án: <span style={{ color: '#10b981', fontWeight: 700 }}>
                      {OPTION_LABELS[question.correct_index]}. {question.options[question.correct_index]}
                    </span>
                  </p>
                )}
              </div>
              {isCorrect && currentStreak >= 2 && (
                <div className="shrink-0 text-right">
                  <p className="font-black" style={{ fontSize: '11px', color: streakColor }}>
                    🔥 ×{currentStreak} streak
                  </p>
                  <p style={{ fontSize: '10px', color: '#555' }}>+{Math.min(currentStreak, 5) * 15} bonus</p>
                </div>
              )}
            </div>
          </div>
        )}

        {revealNow && !answered && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span style={{ fontSize: '22px' }}>⏰</span>
            <div>
              <p className="font-black" style={{ fontSize: '14px', color: '#f87171' }}>Hết giờ — Không được điểm!</p>
              <p style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>
                Đáp án: <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {OPTION_LABELS[question.correct_index]}. {question.options[question.correct_index]}
                </span>
              </p>
            </div>
          </div>
        )}

        {answered && !revealNow && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <span style={{ fontSize: '18px' }}>⏳</span>
            <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700 }}>
              Đã chọn! Chờ hết giờ xem kết quả...
            </p>
          </div>
        )}

        {/* Explanation */}
        {revealNow && question.explanation && (
          <div className="rounded-xl px-4 py-3"
               style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <p style={{ fontSize: '11px', color: '#facc15', fontWeight: 700, marginBottom: 4 }}>💡 Giải thích</p>
            <p style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: 1.6 }}>{question.explanation}</p>
          </div>
        )}
      </div>

      {/* ── Live Leaderboard (pinned bottom) ── */}
      <div className="shrink-0" style={{ borderTop: '1px solid #1a1a1a', background: '#060606' }}>
        <div className="px-4 pt-2.5 pb-1 flex items-center justify-between">
          <p style={{ fontSize: '10px', color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🏆 Xếp hạng trực tiếp
          </p>
          <p style={{ fontSize: '10px', color: '#333' }}>{sortedPlayers.length} người</p>
        </div>

        {sortedPlayers.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#2a2a2a', textAlign: 'center', padding: '10px 16px' }}>
            Chưa có người chơi
          </p>
        ) : (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto"
               style={{ scrollbarWidth: 'none', paddingBottom: 'max(14px,env(safe-area-inset-bottom))' }}>
            {sortedPlayers.map((p, i) => {
              const isMe = p.user_id === myUserId
              return (
                <div key={p.id}
                     className="shrink-0 rounded-2xl px-3 py-2 flex flex-col items-center gap-0.5 text-center"
                     style={{
                       minWidth: 76,
                       background: isMe ? `${BRAND}10` : '#111',
                       border: `1px solid ${isMe ? `${BRAND}44` : '#1f1f1f'}`,
                     }}>
                  <div style={{ fontSize: '15px', lineHeight: 1, marginBottom: 2 }}>
                    {i < 3
                      ? MEDALS[i]
                      : <span style={{ fontSize: '11px', color: '#444', fontWeight: 700 }}>#{i + 1}</span>}
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                       style={{ fontSize: '10px', background: isMe ? `${BRAND}22` : '#1f1f1f', color: isMe ? BRAND : '#555', border: `1px solid ${isMe ? `${BRAND}44` : '#2a2a2a'}` }}>
                    {(p.display_name ?? '?')[0]?.toUpperCase()}
                  </div>
                  <p style={{ fontSize: '10px', color: isMe ? '#fff' : '#666', fontWeight: isMe ? 700 : 400, maxWidth: 68, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isMe ? 'Bạn' : (p.display_name ?? '?')}
                  </p>
                  <p className="font-black" style={{ fontSize: '12px', color: isMe ? BRAND : '#aaa' }}>
                    {p.score}đ
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
