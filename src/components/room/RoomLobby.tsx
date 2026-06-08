// STEP 95-96: Phòng chờ — Admin + Player view + Luật chơi
import { useState } from 'react'
import { GameRoom, RoomPlayer } from './roomTypes'
import GameRules from './GameRules'

interface Props {
  room:       GameRoom
  players:    RoomPlayer[]
  myUserId:   string
  isAdmin:    boolean
  onStart:    () => void    // Admin only
  onCancel:   () => void
  onLeave:    () => void    // Player only
}

export default function RoomLobby({ room, players, myUserId, isAdmin, onStart, onCancel, onLeave }: Props) {
  const [copied, setCopied]     = useState(false)
  const [showRules, setShowRules] = useState(false)
  const activePlayers = players.filter(p => p.is_active)

  const copyCode = () => {
    void navigator.clipboard.writeText(room.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pb-4 flex items-center gap-3"
           style={{ paddingTop: 'max(20px, env(safe-area-inset-top))', borderBottom: '1px solid #1a1a1a' }}>
        <button
          onClick={isAdmin ? onCancel : onLeave}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontSize: '15px' }}>{room.title}</p>
          <p style={{ fontSize: '11px', color: '#555' }}>
            {isAdmin ? '👑 Admin · ' : ''}Phòng chờ · {activePlayers.length} người
          </p>
        </div>
        {/* Rules button */}
        <button
          onClick={() => setShowRules(true)}
          className="px-3 py-1.5 rounded-xl font-bold"
          style={{ fontSize: '11px', background: '#141414', border: '1px solid #333', color: '#888' }}>
          📋 Luật
        </button>
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
             style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>LIVE</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {/* Room code */}
        <div className="rounded-2xl p-5 text-center"
             style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.3)' }}>
          <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Mã phòng
          </p>
          <p className="font-black text-white tracking-widest" style={{ fontSize: '36px', letterSpacing: '0.2em' }}>
            {room.code}
          </p>
          <button
            onClick={copyCode}
            className="mt-3 px-5 py-1.5 rounded-xl font-bold transition-all active:scale-[0.97]"
            style={{
              fontSize: '12px',
              background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(233,78,27,0.1)',
              border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(233,78,27,0.3)'}`,
              color: copied ? '#4ade80' : '#E94E1B',
            }}>
            {copied ? '✓ Đã sao chép' : '📋 Sao chép'}
          </button>
          <p style={{ fontSize: '10px', color: '#444', marginTop: 8 }}>
            Chia sẻ mã cho nhân viên để vào phòng
          </p>
        </div>

        {/* Info row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Số câu',   value: room.total_questions > 0 ? String(room.total_questions) : '—', icon: '❓' },
            { label: 'Thời gian', value: `${room.question_time_limit_s}s/câu`, icon: '⏱' },
            { label: 'Người chơi', value: String(activePlayers.length), icon: '👥' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
                 style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '16px', marginBottom: 4 }}>{s.icon}</p>
              <p className="font-black text-white" style={{ fontSize: '16px' }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Player list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-white" style={{ fontSize: '13px' }}>
              Người chơi ({activePlayers.length})
            </p>
            <span style={{ fontSize: '11px', color: '#555' }}>
              Cập nhật realtime
            </span>
          </div>

          {activePlayers.length === 0 ? (
            <div className="rounded-2xl py-8 flex flex-col items-center gap-2"
                 style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <p style={{ fontSize: '24px' }}>⏳</p>
              <p style={{ fontSize: '13px', color: '#555' }}>Chưa có người vào phòng</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {activePlayers.map((p, i) => (
                <div key={p.id}
                     className="flex items-center gap-3 rounded-2xl px-4 py-3"
                     style={{
                       background: p.user_id === myUserId ? 'rgba(233,78,27,0.06)' : '#141414',
                       border: `1px solid ${p.user_id === myUserId ? 'rgba(233,78,27,0.3)' : '#1f1f1f'}`,
                     }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0"
                       style={{ background: '#1f1f1f', fontSize: '12px', color: '#888' }}>
                    {i + 1}
                  </div>
                  <p className="flex-1 font-semibold" style={{ fontSize: '13px', color: '#ddd' }}>
                    {p.display_name ?? `Người chơi ${i + 1}`}
                  </p>
                  {p.user_id === myUserId && (
                    <span style={{ fontSize: '10px', color: '#E94E1B', fontWeight: 700 }}>Bạn</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        {isAdmin ? (
          <button
            onClick={onStart}
            disabled={activePlayers.length < 1}
            className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
            {activePlayers.length < 1 ? 'Chờ người chơi vào...' : `▶ Bắt đầu (${activePlayers.length} người)`}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <p style={{ fontSize: '13px', color: '#facc15', fontWeight: 700 }}>
                Chờ Admin bắt đầu...
              </p>
            </div>
            <button
              onClick={onLeave}
              className="px-6 py-2 rounded-xl font-semibold"
              style={{ fontSize: '12px', color: '#555', background: '#141414', border: '1px solid #222' }}>
              Rời phòng
            </button>
          </div>
        )}
      </div>
      {showRules && (
        <GameRules questionTimeLimitS={room.question_time_limit_s} onClose={() => setShowRules(false)} />
      )}
    </div>
  )
}
