// RoomResult — Kết quả cuối phòng chơi + vinh danh Top 3
// Tự fetch fresh player data từ DB khi mở để tránh stale state
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { RoomPlayer } from './roomTypes'

interface Props {
  players:   RoomPlayer[]   // initial data (có thể stale)
  myUserId:  string
  roomTitle: string
  roomId:    string
  onClose:   () => void
}

const MEDALS   = ['🥇', '🥈', '🥉']
const CONFETTI = ['🏆', '🥈', '🥉', '🎉']
const BRAND    = '#E94E1B'

export default function RoomResult({ players: initialPlayers, myUserId, roomTitle, roomId, onClose }: Props) {
  const [players, setPlayers] = useState<RoomPlayer[]>(initialPlayers)
  const [loading, setLoading] = useState(true)

  // Fetch fresh data từ DB — tránh stale state
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      // Đợi 1s để admin kịp lưu final_rank
      await new Promise(r => setTimeout(r, 1200))
      const { data } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_active', true)
      if (data && data.length > 0) setPlayers(data as RoomPlayer[])
      setLoading(false)
    }
    void load()
  }, [roomId])

  const sorted  = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)
  const top3    = sorted.slice(0, 3)
  const me      = sorted.find(p => p.user_id === myUserId)
  const myRank  = me ? sorted.indexOf(me) + 1 : null

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 text-center"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '36px', marginBottom: 4 }}>🏁</p>
        <p className="font-black text-white" style={{ fontSize: '22px' }}>Kết quả cuối</p>
        <p style={{ fontSize: '12px', color: '#555', marginTop: 4 }}>{roomTitle}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
          <p style={{ fontSize: '13px', color: '#555' }}>Đang tổng hợp kết quả...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                🏆 TOP 3
              </p>
              <div className="flex flex-col gap-2">
                {top3.map((p, i) => {
                  const isMe = p.user_id === myUserId
                  const colors = [
                    { bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.4)', score: '#facc15' },
                    { bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.3)', score: '#9ca3af' },
                    { bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.3)', score: '#fb923c' },
                  ]
                  const c = colors[i]
                  return (
                    <div key={p.id}
                         className="flex items-center gap-3 rounded-2xl px-4 py-4"
                         style={{ background: c.bg, border: `1.5px solid ${c.border}` }}>
                      <span style={{ fontSize: '28px', flexShrink: 0 }}>{MEDALS[i]}</span>
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black shrink-0"
                           style={{ fontSize: '13px', background: `${c.score}22`, color: c.score, border: `1.5px solid ${c.score}55` }}>
                        {(p.display_name ?? '?')[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-white truncate" style={{ fontSize: '15px' }}>
                          {p.display_name ?? `Người chơi ${i + 1}`}
                          {isMe && <span style={{ marginLeft: 8, fontSize: '10px', color: BRAND }}>Bạn</span>}
                        </p>
                        <p style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>
                          {p.correct_count} câu đúng
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black" style={{ fontSize: '22px', color: c.score }}>
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
                 style={{ background: `${BRAND}0d`, border: `1px solid ${BRAND}44` }}>
              <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                KẾT QUẢ CỦA BẠN
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0">
                  <p className="font-black" style={{ fontSize: '36px', color: BRAND, lineHeight: 1 }}>
                    #{myRank}
                  </p>
                  <p style={{ fontSize: '10px', color: '#555', marginTop: 2 }}>Hạng</p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="rounded-xl p-3 text-center" style={{ background: '#141414' }}>
                    <p className="font-black text-white" style={{ fontSize: '22px' }}>{me.score}</p>
                    <p style={{ fontSize: '10px', color: '#555' }}>Điểm</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: '#141414' }}>
                    <p className="font-black text-white" style={{ fontSize: '22px' }}>{me.correct_count}</p>
                    <p style={{ fontSize: '10px', color: '#555' }}>Đúng</p>
                  </div>
                </div>
              </div>
              {myRank === 1 && (
                <div className="mt-3 rounded-xl py-2 text-center"
                     style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)' }}>
                  <p style={{ fontSize: '14px', color: '#facc15', fontWeight: 700 }}>
                    🏆 Vô địch toàn phòng! Xuất sắc!
                  </p>
                </div>
              )}
              {myRank === 2 && (
                <div className="mt-3 rounded-xl py-2 text-center"
                     style={{ background: 'rgba(156,163,175,0.08)', border: '1px solid rgba(156,163,175,0.2)' }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 700 }}>
                    {CONFETTI[1]} Á quân! Tuyệt vời!
                  </p>
                </div>
              )}
              {myRank === 3 && (
                <div className="mt-3 rounded-xl py-2 text-center"
                     style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
                  <p style={{ fontSize: '14px', color: '#fb923c', fontWeight: 700 }}>
                    {CONFETTI[2]} Hạng 3! Rất giỏi!
                  </p>
                </div>
              )}
              {myRank > 3 && (
                <div className="mt-3 rounded-xl py-2 text-center" style={{ background: '#141414' }}>
                  <p style={{ fontSize: '13px', color: '#888' }}>
                    {CONFETTI[3]} Cố gắng hơn ở lần tiếp!
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
                         style={{ background: isMe ? `${BRAND}0a` : '#141414', border: `1px solid ${isMe ? `${BRAND}33` : '#1f1f1f'}` }}>
                      <span className="font-black shrink-0" style={{ fontSize: '12px', color: '#444', width: 24, textAlign: 'center' }}>#{rank}</span>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold shrink-0"
                           style={{ fontSize: '10px', background: '#1f1f1f', color: '#666' }}>
                        {(p.display_name ?? '?')[0]?.toUpperCase()}
                      </div>
                      <p style={{ fontSize: '13px', color: isMe ? '#fff' : '#aaa', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.display_name ?? `Người chơi ${rank}`}
                        {isMe && <span style={{ marginLeft: 6, fontSize: '9px', color: BRAND }}>Bạn</span>}
                      </p>
                      <div className="shrink-0 text-right">
                        <p className="font-bold" style={{ fontSize: '13px', color: '#ccc' }}>{p.score}đ</p>
                        <p style={{ fontSize: '10px', color: '#555' }}>{p.correct_count}✓</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Close */}
      <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        <button
          onClick={onClose}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
          style={{ fontSize: '15px', background: `linear-gradient(90deg,${BRAND},#FF5A28)`, boxShadow: `0 4px 20px ${BRAND}55` }}>
          ✓ Đóng & Quay về
        </button>
      </div>
    </div>
  )
}
