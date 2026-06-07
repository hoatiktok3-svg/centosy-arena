/**
 * PublicEventModePage — STEP 84
 * Chế độ sự kiện public: hiển thị read-only, không cần thao tác.
 * Dùng khi chiếu màn hình cho người xem bên ngoài trong sự kiện.
 * Không có nút admin, không có thao tác nhạy cảm.
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onClose: () => void
  /** Tên sự kiện tùy chỉnh */
  eventName?: string
}

interface EventRow {
  rank:     number
  name:     string | null
  orgGroup: string | null
  score:    number
  initials: string
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

const TOP_COLORS: Record<number, { bg: string; text: string; medal: string }> = {
  1: { bg: 'rgba(250,204,21,0.12)', text: '#facc15', medal: '🥇' },
  2: { bg: 'rgba(156,163,175,0.12)', text: '#9ca3af', medal: '🥈' },
  3: { bg: 'rgba(217,119,6,0.12)',   text: '#d97706', medal: '🥉' },
}

export default function PublicEventModePage({ onClose, eventName = 'CENTOSY ARENA' }: Props) {
  const [rows, setRows]             = useState<EventRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [liveFlag, setLiveFlag]     = useState(false)
  const [showTop, setShowTop]       = useState(5)
  const [ticker, setTicker]         = useState(0)  // auto-rotate display

  const fetchData = useCallback(async () => {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    if (sessions) {
      const userScore: Record<string, { name: string | null; org: string | null; score: number }> = {}
      for (const s of sessions) {
        const uid  = s.user_id
        const prof = s.profiles as unknown as { full_name: string | null; org_group: string | null } | null
        if (!userScore[uid]) userScore[uid] = { name: prof?.full_name ?? null, org: prof?.org_group ?? null, score: 0 }
        userScore[uid].score += s.score
      }

      const sorted = Object.entries(userScore)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 10)
        .map(([, d], i) => ({
          rank:     i + 1,
          name:     d.name,
          orgGroup: d.org,
          score:    d.score,
          initials: getInitials(d.name),
        }))

      setRows(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()

    const channel = supabase
      .channel('public_event_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sessions' }, () => {
        setLiveFlag(true)
        void fetchData()
        setTimeout(() => setLiveFlag(false), 3000)
      })
      .subscribe()

    // Animate ticker
    const iv = setInterval(() => setTicker(t => t + 1), 5000)

    return () => {
      clearInterval(iv)
      void supabase.removeChannel(channel)
    }
  }, [fetchData])

  // Auto-rotate between top 5 and top 10
  useEffect(() => {
    setShowTop(ticker % 2 === 0 ? 5 : 10)
  }, [ticker])

  const visibleRows = rows.slice(0, showTop)
  const maxScore    = rows[0]?.score ?? 1

  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
         style={{
           background: 'linear-gradient(135deg, #0a0a0a 0%, #120606 50%, #0a0a0a 100%)',
         }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.3)', fontSize: '20px' }}>
            🏆
          </div>
          <div>
            <p className="font-black text-white" style={{ fontSize: '18px', letterSpacing: '-0.3px' }}>
              {eventName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded font-bold"
                    style={{ fontSize: '9px', background: 'rgba(233,78,27,0.15)', color: '#E94E1B', letterSpacing: '0.1em' }}>
                SỰ KIỆN
              </span>
              {liveFlag && (
                <span className="px-2 py-0.5 rounded font-bold animate-pulse"
                      style={{ fontSize: '9px', background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                  ● LIVE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span style={{ fontSize: '11px', color: '#383838' }}>
            TOP {showTop}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#484848', fontSize: '14px' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span style={{ fontSize: '36px' }}>⏳</span>
            <p style={{ fontSize: '14px', color: '#484848' }}>Đang tải...</p>
          </div>
        ) : visibleRows.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <span style={{ fontSize: '56px' }}>🎮</span>
            <p className="text-white font-black" style={{ fontSize: '20px' }}>Sự kiện đang diễn ra!</p>
            <p style={{ fontSize: '14px', color: '#585858' }}>Hãy tham gia chơi game ngay</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-[430px] mx-auto">
            {visibleRows.map(row => {
              const topStyle = TOP_COLORS[row.rank]
              const isTop3   = row.rank <= 3
              const barW     = Math.round((row.score / maxScore) * 100)

              return (
                <div key={row.rank}
                     className="rounded-2xl px-4 py-4 transition-all duration-500"
                     style={{
                       background: isTop3 ? topStyle?.bg : 'rgba(255,255,255,0.03)',
                       border:     isTop3 ? `1px solid ${topStyle?.text}25` : '1px solid rgba(255,255,255,0.06)',
                     }}>
                  <div className="flex items-center gap-4 mb-2">
                    {/* Medal / rank */}
                    <div className="shrink-0 flex items-center justify-center"
                         style={{ width: '40px', fontSize: isTop3 ? '28px' : '16px' }}>
                      {isTop3
                        ? topStyle?.medal
                        : <span className="font-black" style={{ color: '#484848' }}>#{row.rank}</span>}
                    </div>

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black"
                         style={{
                           background: isTop3 ? `${topStyle?.text}20` : 'rgba(255,255,255,0.05)',
                           color:      isTop3 ? topStyle?.text : '#484848',
                           fontSize:   '16px',
                           border:     `1px solid ${isTop3 ? topStyle?.text + '30' : 'rgba(255,255,255,0.08)'}`,
                         }}>
                      {row.initials}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white truncate"
                         style={{ fontSize: isTop3 ? '17px' : '14px', letterSpacing: '-0.2px' }}>
                        {row.name ?? '—'}
                      </p>
                      {row.orgGroup && (
                        <p style={{ fontSize: '11px', color: '#585858' }}>{row.orgGroup}</p>
                      )}
                    </div>

                    {/* Score */}
                    <p className="font-black shrink-0"
                       style={{ fontSize: isTop3 ? '22px' : '17px', color: isTop3 ? topStyle?.text : '#E94E1B', letterSpacing: '-0.5px' }}>
                      {row.score.toLocaleString('vi-VN')}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                         style={{ width: `${barW}%`, background: isTop3 ? topStyle?.text : '#E94E1B' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 py-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '10px', color: '#1f1f1f', letterSpacing: '0.15em' }}>
          CENTOSY VIETNAM · {eventName.toUpperCase()} · READ-ONLY PUBLIC VIEW
        </p>
      </div>
    </div>
  )
}
