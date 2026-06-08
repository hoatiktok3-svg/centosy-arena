// STEP 95: Leaderboard realtime hiển thị sau từng câu
import { useEffect, useState } from 'react'
import { RoomPlayer } from './roomTypes'

interface Props {
  players:         RoomPlayer[]
  myUserId:        string
  questionIndex:   number
  totalQuestions:  number
  autoNextMs:      number    // ms trước khi tự chuyển câu tiếp
  onNextQuestion:  () => void   // Admin only
  isAdmin:         boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function LiveLeaderboard({
  players, myUserId, questionIndex, totalQuestions,
  autoNextMs, onNextQuestion, isAdmin,
}: Props) {
  const [progress, setProgress] = useState(0)
  const sorted = [...players]
    .filter(p => p.is_active)
    .sort((a, b) => b.total_score - a.total_score)

  useEffect(() => {
    setProgress(0)
    const step = 100
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (step / autoNextMs) * 100
        return next >= 100 ? 100 : next
      })
    }, step)
    const timeout = setTimeout(() => onNextQuestion(), autoNextMs)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [questionIndex])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 text-center"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Sau câu {questionIndex + 1}/{totalQuestions}
        </p>
        <p className="font-black text-white" style={{ fontSize: '20px' }}>
          🏆 Xếp hạng tạm thời
        </p>
        {/* Auto-next bar */}
        <div className="w-full h-1 rounded-full mt-3" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-none"
               style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }} />
        </div>
        <p style={{ fontSize: '10px', color: '#444', marginTop: 4 }}>
          {questionIndex + 1 < totalQuestions ? 'Tự chuyển câu tiếp...' : 'Câu cuối — chuẩn bị kết quả...'}
        </p>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
        {sorted.map((p, i) => {
          const isMe = p.user_id === myUserId
          return (
            <div key={p.id}
                 className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                 style={{
                   background: isMe ? 'rgba(233,78,27,0.08)' : '#141414',
                   border: `1px solid ${isMe ? 'rgba(233,78,27,0.35)' : '#1f1f1f'}`,
                 }}>
              {/* Rank */}
              <div className="shrink-0 w-8 text-center">
                {i < 3
                  ? <span style={{ fontSize: '20px' }}>{MEDALS[i]}</span>
                  : <span className="font-black" style={{ fontSize: '14px', color: '#555' }}>#{i + 1}</span>
                }
              </div>
              {/* Name */}
              <p className="flex-1 font-semibold" style={{ fontSize: '14px', color: isMe ? '#fff' : '#ccc' }}>
                {p.display_name ?? `Người chơi ${i + 1}`}
                {isMe && <span style={{ marginLeft: 6, fontSize: '10px', color: '#E94E1B', fontWeight: 700 }}>Bạn</span>}
              </p>
              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0">
                <span style={{ fontSize: '11px', color: '#555' }}>
                  {p.correct_count}✓
                </span>
                <span className="font-black" style={{ fontSize: '16px', color: isMe ? '#E94E1B' : '#fff' }}>
                  {p.total_score}đ
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
            style={{ fontSize: '14px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }}>
            {questionIndex + 1 < totalQuestions ? '→ Câu tiếp theo' : '🏁 Xem kết quả'}
          </button>
        </div>
      )}
    </div>
  )
}
