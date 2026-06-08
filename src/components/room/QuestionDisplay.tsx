// STEP 95+110: Hiển thị câu hỏi + timer đồng bộ server time + mobile polish
import { useState, useEffect } from 'react'
import { RoomQuestion, GameRoom } from './roomTypes'

interface Props {
  room:             GameRoom
  question:         RoomQuestion
  questionIndex:    number
  totalQuestions:   number
  myAnswer:         number | null    // -1 = chưa trả lời
  onAnswer:         (optionIndex: number, responseTimeMs: number) => void
  currentScore:     number
  myRank:           number | null
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']
const OPTION_COLORS = ['#E94E1B', '#4ade80', '#facc15', '#60a5fa']

export default function QuestionDisplay({
  room, question, questionIndex, totalQuestions,
  myAnswer, onAnswer, currentScore, myRank,
}: Props) {
  const timeLimitS = room.question_time_limit_s
  const [timeLeft, setTimeLeft] = useState(timeLimitS)
  const [startedAt] = useState(() => {
    if (room.current_question_started_at) {
      const elapsed = (Date.now() - new Date(room.current_question_started_at).getTime()) / 1000
      return Math.max(0, timeLimitS - elapsed)
    }
    return timeLimitS
  })

  useEffect(() => {
    setTimeLeft(startedAt)
    const id = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 0.05))
    }, 50)
    return () => clearInterval(id)
  }, [questionIndex, startedAt])

  const pct        = (timeLeft / timeLimitS) * 100
  const timerColor = timeLeft > timeLimitS * 0.5 ? '#E94E1B' : timeLeft > timeLimitS * 0.25 ? '#facc15' : '#ef4444'
  const answered   = myAnswer !== null && myAnswer >= 0
  const locked     = answered || timeLeft <= 0

  const handleSelect = (i: number) => {
    if (locked) return
    const elapsed = (timeLimitS - timeLeft) * 1000
    onAnswer(i, Math.round(elapsed))
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* Top bar — safe area */}
      <div className="shrink-0 px-4 pb-3"
           style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: '12px', color: '#888' }}>
            Câu <span className="text-white font-black">{questionIndex + 1}</span>/{totalQuestions}
          </span>
          <div className="flex items-center gap-3">
            {myRank && (
              <span style={{ fontSize: '11px', color: '#facc15' }}>
                #{myRank}
              </span>
            )}
            <span style={{ fontSize: '11px', color: '#E94E1B', fontWeight: 700 }}>
              {currentScore}đ
            </span>
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

        {/* Progress bar (timer) */}
        <div className="w-full h-1 rounded-full" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-none"
               style={{ width: `${pct}%`, background: timerColor }} />
        </div>

        {/* Question progress */}
        <div className="w-full h-1 rounded-full mt-1" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${((questionIndex) / totalQuestions) * 100}%`, background: '#333' }} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

        {/* Question text */}
        <div className="rounded-2xl p-5"
             style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Câu hỏi {questionIndex + 1}
          </p>
          <p className="text-white font-bold leading-snug" style={{ fontSize: '16px' }}>
            {question.question_text}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = myAnswer === i
            const color      = OPTION_COLORS[i]
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={locked}
                className="w-full text-left rounded-2xl px-4 py-5 transition-all active:scale-[0.98] disabled:cursor-default"
                style={{
                  background: isSelected ? `${color}15` : '#141414',
                  border: `1.5px solid ${isSelected ? color : '#222'}`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0"
                       style={{ fontSize: '13px', background: isSelected ? `${color}22` : '#1f1f1f', border: `1.5px solid ${isSelected ? color : '#333'}`, color: isSelected ? color : '#666' }}>
                    {OPTION_LABELS[i]}
                  </div>
                  <p style={{ fontSize: '14px', color: isSelected ? '#fff' : '#ccc', flex: 1, lineHeight: 1.5 }}>
                    {opt}
                  </p>
                  {isSelected && (
                    <span style={{ fontSize: '18px', color, flexShrink: 0 }}>✓</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Answered state */}
        {answered && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <span style={{ fontSize: '18px' }}>⏳</span>
            <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 700 }}>
              Đã chọn! Chờ kết quả câu này...
            </p>
          </div>
        )}

        {timeLeft <= 0 && !answered && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <span style={{ fontSize: '18px' }}>⏰</span>
            <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700 }}>
              Hết giờ! Không nhận được điểm câu này.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
