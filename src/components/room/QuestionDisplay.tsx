// QuestionDisplay — màn hình câu hỏi cho người chơi
// - Timer đồng bộ server
// - Hiển thị đáp án đúng/sai sau khi hết giờ
// - Bảng xếp hạng live bên dưới (cập nhật realtime)
import { useState, useEffect, useMemo } from 'react'
import { RoomQuestion, GameRoom, RoomPlayer } from './roomTypes'

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
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const BRAND = '#E94E1B'
const MEDALS = ['🥇', '🥈', '🥉']

export default function QuestionDisplay({
  room, question, questionIndex, totalQuestions,
  myAnswer, onAnswer, currentScore, myRank,
  players, myUserId,
}: Props) {
  const timeLimitS = room.question_time_limit_s

  const initialTime = useMemo(() => {
    if (room.current_question_started_at) {
      const elapsed = (Date.now() - new Date(room.current_question_started_at).getTime()) / 1000
      return Math.max(0, timeLimitS - elapsed)
    }
    return timeLimitS
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex, room.current_question_started_at, timeLimitS])

  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    setTimeLeft(initialTime)
    const id = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 0.05))
    }, 50)
    return () => clearInterval(id)
  }, [questionIndex, initialTime])

  const pct        = (timeLeft / timeLimitS) * 100
  const timerColor = timeLeft > timeLimitS * 0.5 ? BRAND : timeLeft > timeLimitS * 0.25 ? '#facc15' : '#ef4444'
  const answered   = myAnswer !== null && myAnswer >= 0
  const timeUp     = timeLeft <= 0
  const locked     = answered || timeUp
  const revealNow  = timeUp   // đáp án chỉ lộ khi hết giờ (tránh spoil người chơi khác)

  const isMyAnswerCorrect = myAnswer !== null && myAnswer === question.correct_index

  const handleSelect = (i: number) => {
    if (locked) return
    const elapsed = (timeLimitS - timeLeft) * 1000
    onAnswer(i, Math.round(elapsed))
  }

  // Sắp xếp bảng xếp hạng live
  const sortedPlayers = [...players]
    .filter(p => p.is_active)
    .sort((a, b) => b.score - a.score)

  // Màu nền/viền cho từng option
  const getOptionStyle = (i: number) => {
    const isCorrect  = i === question.correct_index
    const isSelected = myAnswer === i

    if (revealNow) {
      if (isCorrect) return { bg: 'rgba(16,185,129,0.15)', border: '1.5px solid rgba(16,185,129,0.6)', color: '#10b981' }
      if (isSelected && !isCorrect) return { bg: 'rgba(239,68,68,0.12)', border: '1.5px solid rgba(239,68,68,0.5)', color: '#f87171' }
      return { bg: '#0f0f0f', border: '1.5px solid #1a1a1a', color: '#444' }
    }
    if (isSelected) {
      const c = ['#E94E1B', '#4ade80', '#facc15', '#60a5fa'][i]
      return { bg: `${c}15`, border: `1.5px solid ${c}`, color: c }
    }
    return { bg: '#141414', border: '1.5px solid #222', color: '#888' }
  }

  const getBadge = (i: number) => {
    if (!revealNow) return null
    if (i === question.correct_index) return <span style={{ fontSize: '16px', flexShrink: 0 }}>✅</span>
    if (myAnswer === i) return <span style={{ fontSize: '16px', flexShrink: 0 }}>❌</span>
    return null
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pb-3"
           style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: '12px', color: '#888' }}>
            Câu <span className="text-white font-black">{questionIndex + 1}</span>/{totalQuestions}
          </span>
          <div className="flex items-center gap-3">
            {myRank && (
              <span style={{ fontSize: '11px', color: '#facc15' }}>#{myRank}</span>
            )}
            <span style={{ fontSize: '11px', color: BRAND, fontWeight: 700 }}>{currentScore}đ</span>
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                 style={{ background: '#141414', border: `1px solid ${timerColor}44` }}>
              <span style={{ fontSize: '12px' }}>⏱</span>
              <span className="font-black tabular-nums" style={{ fontSize: '16px', color: timerColor, minWidth: '28px' }}>
                {Math.ceil(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        {/* Timer bar */}
        <div className="w-full h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-none"
               style={{ width: `${pct}%`, background: timerColor }} />
        </div>
        {/* Question progress */}
        <div className="w-full h-1 rounded-full mt-1" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${(questionIndex / totalQuestions) * 100}%`, background: '#333' }} />
        </div>
      </div>

      {/* ── Content (cuộn được) ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {/* Question text */}
        <div className="rounded-2xl p-4"
             style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Câu hỏi {questionIndex + 1}
          </p>
          <p className="text-white font-bold leading-snug" style={{ fontSize: '15px' }}>
            {question.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {question.options.map((opt, i) => {
            const s = getOptionStyle(i)
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={locked}
                className="w-full text-left rounded-2xl px-4 py-4 transition-all active:scale-[0.98] disabled:cursor-default"
                style={{ background: s.bg, border: s.border }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0"
                       style={{ fontSize: '13px', background: `${s.color}22`, border: `1.5px solid ${s.color}88`, color: s.color }}>
                    {OPTION_LABELS[i]}
                  </div>
                  <p style={{ fontSize: '14px', color: revealNow ? (i === question.correct_index ? '#d1fae5' : myAnswer === i ? '#fecaca' : '#444') : (myAnswer === i ? '#fff' : '#ccc'), flex: 1, lineHeight: 1.4 }}>
                    {opt}
                  </p>
                  {getBadge(i)}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feedback banner */}
        {revealNow && answered && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={isMyAnswerCorrect
                 ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }
                 : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <span style={{ fontSize: '22px' }}>{isMyAnswerCorrect ? '🎉' : '😢'}</span>
            <div>
              <p className="font-black" style={{ fontSize: '14px', color: isMyAnswerCorrect ? '#10b981' : '#f87171' }}>
                {isMyAnswerCorrect ? 'Chính xác! +điểm' : 'Sai rồi!'}
              </p>
              {!isMyAnswerCorrect && (
                <p style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>
                  Đáp án đúng: <span style={{ color: '#10b981', fontWeight: 700 }}>
                    {OPTION_LABELS[question.correct_index]}. {question.options[question.correct_index]}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {revealNow && !answered && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
            <span style={{ fontSize: '22px' }}>⏰</span>
            <div>
              <p className="font-black" style={{ fontSize: '14px', color: '#f87171' }}>Hết giờ!</p>
              <p style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>
                Đáp án đúng: <span style={{ color: '#10b981', fontWeight: 700 }}>
                  {OPTION_LABELS[question.correct_index]}. {question.options[question.correct_index]}
                </span>
              </p>
            </div>
          </div>
        )}

        {answered && !revealNow && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <span style={{ fontSize: '18px' }}>⏳</span>
            <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700 }}>
              Đã chọn! Chờ hết giờ xem kết quả...
            </p>
          </div>
        )}

        {/* Explanation (nếu có) */}
        {revealNow && question.explanation && (
          <div className="rounded-xl px-4 py-3"
               style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <p style={{ fontSize: '11px', color: '#facc15', fontWeight: 700, marginBottom: 4 }}>💡 Giải thích</p>
            <p style={{ fontSize: '12px', color: '#a3a3a3', lineHeight: 1.6 }}>{question.explanation}</p>
          </div>
        )}
      </div>

      {/* ── Bảng xếp hạng trực tiếp (luôn hiện) ── */}
      <div className="shrink-0" style={{ borderTop: '1px solid #1a1a1a', background: '#060606' }}>
        {/* Label */}
        <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            🏆 Xếp hạng trực tiếp
          </p>
          {sortedPlayers.length > 0 && (
            <p style={{ fontSize: '10px', color: '#444' }}>{sortedPlayers.length} người</p>
          )}
        </div>

        {/* Top players — hiển thị 4 người, cuộn ngang */}
        {sortedPlayers.length === 0 ? (
          <p style={{ fontSize: '12px', color: '#333', textAlign: 'center', padding: '12px 16px' }}>
            Chưa có người chơi...
          </p>
        ) : (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto"
               style={{ scrollbarWidth: 'none', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
            {sortedPlayers.map((p, i) => {
              const isMe = p.user_id === myUserId
              return (
                <div key={p.id}
                     className="shrink-0 rounded-2xl px-3 py-2.5 flex flex-col items-center gap-1 text-center"
                     style={{
                       minWidth: 80,
                       background: isMe ? `${BRAND}12` : '#111',
                       border: `1px solid ${isMe ? `${BRAND}55` : '#1f1f1f'}`,
                     }}>
                  {/* Rank badge */}
                  <div style={{ fontSize: '16px', lineHeight: 1 }}>
                    {i < 3 ? MEDALS[i] : <span style={{ fontSize: '12px', color: '#444', fontWeight: 700 }}>#{i + 1}</span>}
                  </div>
                  {/* Avatar */}
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0"
                       style={{ fontSize: '11px', background: isMe ? `${BRAND}22` : '#1f1f1f', color: isMe ? BRAND : '#666', border: `1px solid ${isMe ? `${BRAND}44` : '#2a2a2a'}` }}>
                    {(p.display_name ?? '?')[0]?.toUpperCase()}
                  </div>
                  {/* Name */}
                  <p style={{ fontSize: '10px', color: isMe ? '#fff' : '#888', fontWeight: isMe ? 700 : 400, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isMe ? 'Bạn' : (p.display_name ?? '?')}
                  </p>
                  {/* Score */}
                  <p className="font-black" style={{ fontSize: '13px', color: isMe ? BRAND : '#ccc' }}>
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
