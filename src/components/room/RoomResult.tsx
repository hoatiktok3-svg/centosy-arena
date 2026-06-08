// STEP 95: Kết quả cuối phòng chơi + vinh danh Top 3
import { RoomPlayer } from './roomTypes'

interface Props {
  players:   RoomPlayer[]
  myUserId:  string
  roomTitle: string
  onClose:   () => void
}

const MEDALS  = ['🥇', '🥈', '🥉']
const CONFETTI = ['🎉', '🎊', '✨', '🏆']

export default function RoomResult({ players, myUserId, roomTitle, onClose }: Props) {
  const sorted = [...players]
    .filter(p => p.is_active)
    .sort((a, b) => b.score - a.score)

  const top3   = sorted.slice(0, 3)
  const me     = sorted.find(p => p.user_id === myUserId)
  const myRank = me ? sorted.indexOf(me) + 1 : null

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 text-center"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '32px', marginBottom: 4 }}>🏁</p>
        <p className="font-black text-white" style={{ fontSize: '20px' }}>Kết quả cuối</p>
        <p style={{ fontSize: '12px', color: '#555', marginTop: 4 }}>{roomTitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {/* Top 3 podium */}
        {top3.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              🏆 Top 3
            </p>
            <div className="flex flex-col gap-2">
              {top3.map((p, i) => {
                const isMe = p.user_id === myUserId
                return (
                  <div key={p.id}
                       className="flex items-center gap-3 rounded-2xl px-4 py-4"
                       style={{
                         background: i === 0 ? 'rgba(250,204,21,0.08)' : i === 1 ? 'rgba(156,163,175,0.08)' : 'rgba(251,146,60,0.08)',
                         border: `1.5px solid ${i === 0 ? 'rgba(250,204,21,0.4)' : i === 1 ? 'rgba(156,163,175,0.3)' : 'rgba(251,146,60,0.3)'}`,
                       }}>
                    <span style={{ fontSize: '28px', flexShrink: 0 }}>{MEDALS[i]}</span>
                    <div className="flex-1">
                      <p className="font-black text-white" style={{ fontSize: '15px' }}>
                        {p.display_name ?? `Người chơi ${i + 1}`}
                        {isMe && <span style={{ marginLeft: 8, fontSize: '10px', color: '#E94E1B' }}>Bạn</span>}
                      </p>
                      <p style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>
                        {p.correct_count} câu đúng
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black" style={{ fontSize: '20px', color: i === 0 ? '#facc15' : i === 1 ? '#9ca3af' : '#fb923c' }}>
                        {p.score}đ
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* My result */}
        {me && myRank && (
          <div className="rounded-2xl p-4"
               style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.3)' }}>
            <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Kết quả của bạn
            </p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="font-black" style={{ fontSize: '32px', color: '#E94E1B' }}>#{myRank}</p>
                <p style={{ fontSize: '10px', color: '#555' }}>Hạng</p>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2 text-center" style={{ background: '#141414' }}>
                  <p className="font-black text-white" style={{ fontSize: '18px' }}>{me.score}</p>
                  <p style={{ fontSize: '10px', color: '#555' }}>Điểm</p>
                </div>
                <div className="rounded-xl p-2 text-center" style={{ background: '#141414' }}>
                  <p className="font-black text-white" style={{ fontSize: '18px' }}>{me.correct_count}</p>
                  <p style={{ fontSize: '10px', color: '#555' }}>Đúng</p>
                </div>
              </div>
            </div>
            {myRank <= 3 && (
              <div className="mt-3 text-center">
                <p style={{ fontSize: '13px', color: '#facc15', fontWeight: 700 }}>
                  {CONFETTI[Math.min(myRank - 1, 3)]} Xuất sắc! Top {myRank} toàn phòng!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Full ranking */}
        {sorted.length > 3 && (
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              Bảng xếp hạng đầy đủ
            </p>
            <div className="flex flex-col gap-1.5">
              {sorted.slice(3).map((p, i) => {
                const isMe = p.user_id === myUserId
                const rank = i + 4
                return (
                  <div key={p.id}
                       className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                       style={{ background: isMe ? 'rgba(233,78,27,0.06)' : '#141414', border: `1px solid ${isMe ? 'rgba(233,78,27,0.25)' : '#1f1f1f'}` }}>
                    <span className="font-black" style={{ fontSize: '12px', color: '#444', width: 20, textAlign: 'right', flexShrink: 0 }}>#{rank}</span>
                    <p style={{ fontSize: '13px', color: isMe ? '#fff' : '#aaa', flex: 1 }}>
                      {p.display_name ?? `Người chơi ${rank}`}
                      {isMe && <span style={{ marginLeft: 6, fontSize: '9px', color: '#E94E1B' }}>Bạn</span>}
                    </p>
                    <span className="font-bold" style={{ fontSize: '13px', color: '#ccc' }}>{p.score}đ</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Close */}
      <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        <button
          onClick={onClose}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
          style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
          ✓ Đóng
        </button>
      </div>
    </div>
  )
}
