// LiveLeaderboard — hiển thị sau từng câu hỏi
// - Hiển thị đáp án đúng ở đầu
// - Bảng xếp hạng tạm thời
// - Tự động chuyển câu tiếp sau autoNextMs
import { useEffect, useRef, useState } from 'react'
import { RoomPlayer, RoomQuestion } from './roomTypes'

interface Props {
  players:         RoomPlayer[]
  myUserId:        string
  questionIndex:   number
  totalQuestions:  number
  autoNextMs:      number
  onNextQuestion:  () => void
  isAdmin:         boolean
  question:        RoomQuestion | null    // để hiện đáp án đúng
  myAnswer:        number | null          // câu trả lời của mình
}

const MEDALS      = ['🥇', '🥈', '🥉']
const BRAND       = '#E94E1B'
const OPT_LABELS  = ['A', 'B', 'C', 'D']

export default function LiveLeaderboard({
  players, myUserId, questionIndex, totalQuestions,
  autoNextMs, onNextQuestion, isAdmin,
  question, myAnswer,
}: Props) {
  const [progress, setProgress]   = useState(0)
  const [countdown, setCountdown] = useState(Math.ceil(autoNextMs / 1000))
  const advancedRef               = useRef(false)

  const sorted = [...players]
    .filter(p => p.is_active)
    .sort((a, b) => b.score - a.score)

  useEffect(() => {
    setProgress(0)
    setCountdown(Math.ceil(autoNextMs / 1000))
    advancedRef.current = false

    const step = 100
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (step / autoNextMs) * 100
        return next >= 100 ? 100 : next
      })
      setCountdown(c => Math.max(0, c - step / 1000))
    }, step)

    const timeout = setTimeout(() => {
      if (!advancedRef.current) {
        advancedRef.current = true
        onNextQuestion()
      }
    }, autoNextMs)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [questionIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  const isLastQ = questionIndex + 1 >= totalQuestions

  // Đáp án đúng info
  const correctIdx    = question?.correct_index ?? -1
  const correctText   = correctIdx >= 0 ? question?.options[correctIdx] : null
  const myCorrect     = myAnswer !== null && myAnswer === correctIdx
  const myWrong       = myAnswer !== null && myAnswer !== correctIdx
  const notAnswered   = myAnswer === null

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-5 pb-3 text-center"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Kết quả câu {questionIndex + 1}/{totalQuestions}
        </p>
        <p className="font-black text-white" style={{ fontSize: '20px' }}>
          🏆 Xếp hạng tạm thời
        </p>
        {/* Auto-next bar */}
        <div className="w-full h-1 rounded-full mt-3" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-none"
               style={{ width: `${progress}%`, background: `linear-gradient(90deg,${BRAND},#FF5A28)` }} />
        </div>
        <p style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
          {isLastQ
            ? `🏁 Kết thúc sau ${Math.ceil(countdown)}s...`
            : `⏱ Chuyển câu tiếp sau ${Math.ceil(countdown)}s...`}
        </p>
      </div>

      {/* ── Đáp án đúng ── */}
      {question && correctText && (
        <div className="shrink-0 mx-4 mt-3 rounded-2xl overflow-hidden"
             style={{ border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.07)' }}>
          {/* Correct answer banner */}
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-black shrink-0"
                 style={{ fontSize: '13px', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1.5px solid rgba(16,185,129,0.5)' }}>
              {OPT_LABELS[correctIdx]}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                ✅ Đáp án đúng
              </p>
              <p className="font-bold text-white truncate" style={{ fontSize: '13px' }}>
                {correctText}
              </p>
            </div>
          </div>

          {/* My result */}
          {myCorrect && (
            <div className="px-4 py-2 flex items-center gap-2"
                 style={{ borderTop: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.08)' }}>
              <span style={{ fontSize: '16px' }}>🎉</span>
              <p className="font-bold" style={{ fontSize: '13px', color: '#10b981' }}>
                Bạn trả lời đúng! Nhận được điểm
              </p>
            </div>
          )}
          {myWrong && (
            <div className="px-4 py-2 flex items-center gap-2"
                 style={{ borderTop: '1px solid rgba(16,185,129,0.2)', background: 'rgba(239,68,68,0.05)' }}>
              <span style={{ fontSize: '16px' }}>😢</span>
              <p style={{ fontSize: '13px', color: '#f87171' }}>
                Bạn chọn sai — {OPT_LABELS[myAnswer!]}. {question.options[myAnswer!]}
              </p>
            </div>
          )}
          {notAnswered && (
            <div className="px-4 py-2 flex items-center gap-2"
                 style={{ borderTop: '1px solid rgba(16,185,129,0.2)', background: 'rgba(239,68,68,0.05)' }}>
              <span style={{ fontSize: '16px' }}>⏰</span>
              <p style={{ fontSize: '13px', color: '#888' }}>Bạn không trả lời kịp</p>
            </div>
          )}
        </div>
      )}

      {/* ── Leaderboard ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          Bảng xếp hạng
        </p>
        {sorted.map((p, i) => {
          const isMe = p.user_id === myUserId
          return (
            <div key={p.id}
                 className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                 style={{
                   background: isMe ? `${BRAND}0d` : i === 0 ? 'rgba(250,204,21,0.05)' : '#141414',
                   border: `1px solid ${isMe ? `${BRAND}44` : i === 0 ? 'rgba(250,204,21,0.25)' : '#1f1f1f'}`,
                 }}>
              {/* Rank */}
              <div className="shrink-0 w-8 text-center">
                {i < 3
                  ? <span style={{ fontSize: '20px' }}>{MEDALS[i]}</span>
                  : <span className="font-black" style={{ fontSize: '14px', color: '#555' }}>#{i + 1}</span>}
              </div>
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                   style={{ background: isMe ? `${BRAND}22` : '#1f1f1f', color: isMe ? BRAND : '#666', border: `1px solid ${isMe ? `${BRAND}44` : '#2a2a2a'}` }}>
                {(p.display_name ?? '?')[0]?.toUpperCase()}
              </div>
              {/* Name */}
              <p className="flex-1 font-semibold truncate" style={{ fontSize: '14px', color: isMe ? '#fff' : '#ccc' }}>
                {p.display_name ?? `Người chơi ${i + 1}`}
                {isMe && <span style={{ marginLeft: 6, fontSize: '10px', color: BRAND, fontWeight: 700 }}>Bạn</span>}
              </p>
              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <span style={{ fontSize: '11px', color: '#555' }}>{p.correct_count}✓</span>
                <span className="font-black" style={{ fontSize: '16px', color: isMe ? BRAND : i === 0 ? '#fbbf24' : '#fff' }}>
                  {p.score}đ
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin: manual advance */}
      {isAdmin && (
        <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
          <button
            onClick={onNextQuestion}
            className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
            style={{ fontSize: '14px', background: `linear-gradient(90deg,${BRAND},#FF5A28)` }}>
            {isLastQ ? '🏁 Xem kết quả' : '→ Câu tiếp theo'}
          </button>
        </div>
      )}
    </div>
  )
}
