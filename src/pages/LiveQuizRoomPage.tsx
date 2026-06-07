/**
 * LiveQuizRoomPage — STEP 77
 * Phòng thi live: admin tạo phòng + mã, player join bằng mã.
 * Realtime: Supabase Broadcast + Presence theo dõi người vào phòng.
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface RoomPresence {
  userId:   string
  name:     string
  joinedAt: number
}

type RoomStatus = 'waiting' | 'started' | 'ended'

function generateCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

// ── Admin: Create Room ─────────────────────────────────────────
function AdminRoomHost({
  roomCode, participants, roomStatus,
  onStart, onEnd,
}: {
  roomCode:     string
  participants: RoomPresence[]
  roomStatus:   RoomStatus
  onStart:      () => void
  onEnd:        () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    void navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-10">
      {/* Room code */}
      <div className="rounded-2xl p-5 text-center"
           style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.25)' }}>
        <p style={{ fontSize: '11px', color: '#585858', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
          Mã phòng thi
        </p>
        <p className="font-black text-white" style={{ fontSize: '40px', letterSpacing: '0.15em', fontVariantNumeric: 'tabular-nums' }}>
          {roomCode}
        </p>
        <button
          onClick={copyCode}
          className="mt-3 px-4 py-1.5 rounded-xl font-bold transition-all active:scale-[0.97]"
          style={{ fontSize: '12px', background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(233,78,27,0.1)', border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(233,78,27,0.3)'}`, color: copied ? '#4ade80' : '#E94E1B' }}>
          {copied ? '✓ Đã sao chép' : '📋 Sao chép mã'}
        </button>
      </div>

      {/* Participants */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="font-bold text-white" style={{ fontSize: '13px' }}>
            Người tham gia ({participants.length})
          </p>
          {roomStatus === 'waiting' && (
            <span className="px-2 py-0.5 rounded-full font-bold animate-pulse"
                  style={{ fontSize: '9px', background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>
              Chờ vào phòng
            </span>
          )}
        </div>

        {participants.length === 0 ? (
          <div className="rounded-xl py-6 flex flex-col items-center gap-2"
               style={{ background: '#111', border: '1px solid #1f1f1f' }}>
            <span style={{ fontSize: '28px' }}>👋</span>
            <p style={{ fontSize: '12px', color: '#585858' }}>Chưa có ai vào phòng</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {participants.map((p, i) => (
              <div key={p.userId}
                   className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <p className="font-bold shrink-0" style={{ fontSize: '11px', color: '#585858', width: '20px' }}>
                  {i + 1}
                </p>
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black"
                     style={{ background: 'rgba(233,78,27,0.12)', color: '#E94E1B', fontSize: '11px' }}>
                  {p.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                </div>
                <p className="flex-1 text-white font-semibold truncate" style={{ fontSize: '12px' }}>
                  {p.name}
                </p>
                <span className="shrink-0" style={{ fontSize: '8px', color: '#34d399' }}>● online</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      {roomStatus === 'waiting' && (
        <button
          onClick={onStart}
          disabled={participants.length === 0}
          className="w-full py-3.5 rounded-2xl font-black transition-all active:scale-[0.98]"
          style={{ fontSize: '15px', background: participants.length > 0 ? '#E94E1B' : '#1a1a1a', color: participants.length > 0 ? '#fff' : '#484848', border: 'none', opacity: 1 }}>
          {participants.length > 0 ? `🚀 Bắt đầu thi (${participants.length} người)` : 'Chờ người tham gia...'}
        </button>
      )}

      {roomStatus === 'started' && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
             style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div className="flex-1">
            <p className="font-bold" style={{ fontSize: '13px', color: '#34d399' }}>Phòng thi đã bắt đầu!</p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Người chơi đang thi...</p>
          </div>
          <button onClick={onEnd}
                  className="px-3 py-1.5 rounded-xl font-bold"
                  style={{ fontSize: '11px', background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
            Kết thúc
          </button>
        </div>
      )}

      {roomStatus === 'ended' && (
        <div className="rounded-xl px-4 py-3 flex items-center gap-3"
             style={{ background: 'rgba(88,88,88,0.08)', border: '1px solid #2c2c2c' }}>
          <span style={{ fontSize: '20px' }}>🏁</span>
          <p className="font-bold" style={{ fontSize: '13px', color: '#888' }}>Phòng thi đã kết thúc</p>
        </div>
      )}
    </div>
  )
}

// ── Player: Join Room ──────────────────────────────────────────
function PlayerJoinView({
  onJoin,
}: {
  onJoin: (code: string) => void
}) {
  const [code, setCode] = useState('')

  return (
    <div className="px-4 py-6 flex flex-col gap-4">
      <div className="rounded-2xl p-5 text-center"
           style={{ background: '#111', border: '1px solid #2c2c2c' }}>
        <p style={{ fontSize: '32px', marginBottom: 8 }}>🎮</p>
        <p className="text-white font-black" style={{ fontSize: '16px' }}>Tham gia phòng thi</p>
        <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>Nhập mã phòng từ admin</p>
      </div>

      <input
        type="text"
        placeholder="Nhập mã phòng (VD: AB3XY)"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase().slice(0, 5))}
        className="w-full px-4 py-3.5 rounded-2xl text-white text-center font-black"
        style={{ fontSize: '24px', letterSpacing: '0.2em', background: '#181818', border: '1px solid #2c2c2c', outline: 'none' }}
        maxLength={5}
      />

      <button
        onClick={() => { if (code.length >= 4) onJoin(code) }}
        disabled={code.length < 4}
        className="w-full py-3.5 rounded-2xl font-black"
        style={{ fontSize: '15px', background: code.length >= 4 ? '#E94E1B' : '#1a1a1a', color: code.length >= 4 ? '#fff' : '#484848', border: 'none' }}>
        Vào phòng →
      </button>
    </div>
  )
}

// ── Player: Waiting Room ───────────────────────────────────────
function PlayerWaiting({
  roomCode, participants, roomStatus, myName,
}: {
  roomCode:     string
  participants: RoomPresence[]
  roomStatus:   RoomStatus
  myName:       string
}) {
  return (
    <div className="px-4 py-6 flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-center"
           style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.2)' }}>
        <p style={{ fontSize: '11px', color: '#585858' }}>Phòng</p>
        <p className="font-black text-white" style={{ fontSize: '28px', letterSpacing: '0.15em' }}>{roomCode}</p>
        {roomStatus === 'waiting' && (
          <p style={{ fontSize: '12px', color: '#facc15' }} className="animate-pulse mt-1">
            ⏳ Chờ admin bắt đầu...
          </p>
        )}
        {roomStatus === 'started' && (
          <p style={{ fontSize: '12px', color: '#34d399' }} className="mt-1">
            ✅ Phòng thi đã bắt đầu!
          </p>
        )}
        {roomStatus === 'ended' && (
          <p style={{ fontSize: '12px', color: '#888' }} className="mt-1">
            🏁 Phòng thi đã kết thúc
          </p>
        )}
      </div>

      <div>
        <p className="font-bold text-white mb-2" style={{ fontSize: '13px' }}>
          Đang trong phòng ({participants.length})
        </p>
        <div className="flex flex-col gap-1.5">
          {participants.map(p => (
            <div key={p.userId}
                 className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                 style={{
                   background: p.name === myName ? 'rgba(233,78,27,0.06)' : '#111',
                   border: p.name === myName ? '1px solid rgba(233,78,27,0.2)' : '1px solid #1f1f1f',
                 }}>
              <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-black"
                   style={{ background: '#1a1a1a', color: '#E94E1B', fontSize: '11px' }}>
                {p.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 text-white font-semibold truncate" style={{ fontSize: '12px' }}>
                {p.name}{p.name === myName ? ' (bạn)' : ''}
              </p>
              <span style={{ fontSize: '8px', color: '#34d399' }}>● online</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────
export default function LiveQuizRoomPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin   = currentUser ? canAccessAdminPanel(currentUser.role) : false
  const myName    = currentUser?.user_metadata?.full_name ?? currentUser?.email ?? 'Ẩn danh'

  const [view, setView]           = useState<'choose' | 'host' | 'join' | 'waiting'>('choose')
  const [roomCode, setRoomCode]   = useState('')
  const [participants, setParticipants] = useState<RoomPresence[]>([])
  const [roomStatus, setRoomStatus]    = useState<RoomStatus>('waiting')
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const leaveChannel = useCallback(() => {
    if (channelRef.current) {
      void supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [])

  const joinChannel = useCallback((code: string) => {
    leaveChannel()
    const ch = supabase.channel(`quiz_room_${code}`, { config: { presence: { key: currentUser?.id ?? 'anon' } } })

    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState<{ name: string; joinedAt: number }>()
      const list: RoomPresence[] = Object.entries(state).map(([uid, presences]) => ({
        userId:   uid,
        name:     presences[0]?.name ?? '—',
        joinedAt: presences[0]?.joinedAt ?? 0,
      }))
      setParticipants(list.sort((a, b) => a.joinedAt - b.joinedAt))
    })

    ch.on('broadcast', { event: 'room_status' }, (payload: { payload: { status: RoomStatus } }) => {
      setRoomStatus(payload.payload.status)
    })

    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ name: myName, joinedAt: Date.now() })
      }
    })

    channelRef.current = ch
  }, [currentUser?.id, leaveChannel, myName])

  const handleHost = () => {
    const code = generateCode()
    setRoomCode(code)
    setRoomStatus('waiting')
    setParticipants([])
    joinChannel(code)
    setView('host')
  }

  const handleJoin = (code: string) => {
    setRoomCode(code)
    joinChannel(code)
    setView('waiting')
  }

  const handleStart = () => {
    setRoomStatus('started')
    void channelRef.current?.send({ type: 'broadcast', event: 'room_status', payload: { status: 'started' } })
  }

  const handleEnd = () => {
    setRoomStatus('ended')
    void channelRef.current?.send({ type: 'broadcast', event: 'room_status', payload: { status: 'ended' } })
  }

  useEffect(() => () => { leaveChannel() }, [leaveChannel])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.93)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={() => { leaveChannel(); onClose() }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Live Quiz Room
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>
              {view === 'host' ? `Mã: ${roomCode} · ${participants.length} người` : 'Thi trực tiếp qua mã phòng'}
            </p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
            🎯
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {view === 'choose' && (
            <div className="px-4 py-6 flex flex-col gap-3">
              <p className="text-white font-bold text-center mb-2" style={{ fontSize: '15px' }}>
                Bạn muốn làm gì?
              </p>
              {isAdmin && (
                <button
                  onClick={handleHost}
                  className="w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98]"
                  style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.3)', color: '#E94E1B', fontSize: '14px' }}>
                  🏠 Tạo phòng thi (Admin)
                </button>
              )}
              <button
                onClick={() => setView('join')}
                className="w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98]"
                style={{ background: '#111', border: '1px solid #2c2c2c', color: '#c0c0c0', fontSize: '14px' }}>
                🔑 Tham gia bằng mã
              </button>
            </div>
          )}

          {view === 'host' && (
            <AdminRoomHost
              roomCode={roomCode}
              participants={participants}
              roomStatus={roomStatus}
              onStart={handleStart}
              onEnd={handleEnd}
            />
          )}

          {view === 'join' && (
            <PlayerJoinView onJoin={handleJoin} />
          )}

          {view === 'waiting' && (
            <PlayerWaiting
              roomCode={roomCode}
              participants={participants}
              roomStatus={roomStatus}
              myName={myName}
            />
          )}
        </div>
      </div>
    </div>
  )
}
