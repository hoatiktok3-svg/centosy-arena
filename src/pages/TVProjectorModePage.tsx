/**
 * TVProjectorModePage — STEP 83
 * Chế độ chiếu TV/Projector: hiển thị bảng xếp hạng live lên màn hình lớn.
 * Full-screen, font lớn, realtime update, auto-refresh mỗi 30s.
 * Không có navigation — dành cho kết nối laptop/projector.
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onClose: () => void
}

interface TVRow {
  rank:      number
  name:      string | null
  orgGroup:  string | null
  score:     number
  initials:  string
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getMonthLabel(): string {
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()
}

const RANK_COLORS = ['#facc15', '#9ca3af', '#d97706']
const RANK_MEDALS = ['🥇', '🥈', '🥉']

export default function TVProjectorModePage({ onClose }: Props) {
  const [rows, setRows]         = useState<TVRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [liveFlag, setLiveFlag] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

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
        const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
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
      setLastUpdate(new Date())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()

    // Auto-refresh every 30s
    const interval = setInterval(() => { void fetchData() }, 30_000)

    // Realtime
    const channel = supabase
      .channel('tv_mode_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sessions' }, () => {
        setLiveFlag(true)
        void fetchData()
        setTimeout(() => setLiveFlag(false), 3000)
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      void supabase.removeChannel(channel)
    }
  }, [fetchData])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {})
      setFullscreen(true)
    } else {
      await document.exitFullscreen().catch(() => {})
      setFullscreen(false)
    }
  }

  const maxScore = rows[0]?.score ?? 1

  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
         style={{ background: '#050505', fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-4 shrink-0"
           style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.3)', fontSize: '20px' }}>
            🏆
          </div>
          <div>
            <p className="font-black text-white" style={{ fontSize: '20px', letterSpacing: '-0.5px' }}>
              CENTOSY ARENA
            </p>
            <p style={{ fontSize: '13px', color: '#585858' }}>
              Bảng xếp hạng mùa · {getMonthLabel()}
            </p>
          </div>
          {liveFlag && (
            <span className="px-3 py-1 rounded-full font-black animate-pulse"
                  style={{ fontSize: '11px', background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', letterSpacing: '0.1em' }}>
              ● LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <p style={{ fontSize: '12px', color: '#383838' }}>
            Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')}
          </p>
          <button
            onClick={() => void toggleFullscreen()}
            className="px-3 py-1.5 rounded-xl font-bold"
            style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #2c2c2c', color: '#888' }}>
            {fullscreen ? '⊡ Thu nhỏ' : '⊞ Toàn màn hình'}
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl font-bold"
            style={{ fontSize: '11px', background: '#1a1a1a', border: '1px solid #2c2c2c', color: '#585858' }}>
            ✕ Đóng
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-6 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <span style={{ fontSize: '48px' }}>⏳</span>
            <p style={{ fontSize: '20px', color: '#484848' }}>Đang tải...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4">
            <span style={{ fontSize: '64px' }}>🎮</span>
            <p className="text-white font-bold" style={{ fontSize: '24px' }}>Chưa có dữ liệu</p>
            <p style={{ fontSize: '16px', color: '#585858' }}>Hãy bắt đầu chơi game!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
            {rows.map((row) => {
              const col   = RANK_COLORS[row.rank - 1] ?? '#585858'
              const medal = RANK_MEDALS[row.rank - 1]
              const barW  = Math.round((row.score / maxScore) * 100)
              const isTop3 = row.rank <= 3

              return (
                <div key={row.rank}
                     className="rounded-2xl px-6 py-4 flex items-center gap-5"
                     style={{
                       background: isTop3 ? `${col}08` : '#111',
                       border:     isTop3 ? `1px solid ${col}25` : '1px solid #1f1f1f',
                     }}>
                  {/* Rank */}
                  <div className="shrink-0 flex items-center justify-center"
                       style={{ width: isTop3 ? '48px' : '36px', fontSize: isTop3 ? '36px' : '18px' }}>
                    {medal ?? <span className="font-black" style={{ color: '#484848' }}>#{row.rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center font-black"
                       style={{ background: isTop3 ? `${col}18` : '#1a1a1a', color: isTop3 ? col : '#484848', fontSize: '18px', border: `1px solid ${isTop3 ? col + '30' : '#252525'}` }}>
                    {row.initials}
                  </div>

                  {/* Name + dept */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black truncate"
                       style={{ fontSize: isTop3 ? '22px' : '18px', letterSpacing: '-0.3px' }}>
                      {row.name ?? '—'}
                    </p>
                    {row.orgGroup && (
                      <p style={{ fontSize: '13px', color: '#585858', marginTop: 2 }}>{row.orgGroup}</p>
                    )}
                    {/* Bar */}
                    <div className="w-full h-1 rounded-full mt-2" style={{ background: '#1f1f1f' }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                           style={{ width: `${barW}%`, background: isTop3 ? col : '#E94E1B' }} />
                    </div>
                  </div>

                  {/* Score */}
                  <p className="font-black shrink-0"
                     style={{ fontSize: isTop3 ? '32px' : '24px', color: isTop3 ? col : '#E94E1B', letterSpacing: '-1px' }}>
                    {row.score.toLocaleString('vi-VN')}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer watermark */}
      <div className="shrink-0 py-3 text-center"
           style={{ borderTop: '1px solid #111' }}>
        <p style={{ fontSize: '12px', color: '#252525', letterSpacing: '0.2em' }}>
          CENTOSY ARENA · TV MODE · {getMonthLabel().toUpperCase()}
        </p>
      </div>
    </div>
  )
}
