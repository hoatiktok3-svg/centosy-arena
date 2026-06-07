/**
 * AdminGameMonitorPage — STEP 70
 * Admin xem toàn bộ hoạt động game: sessions gần đây, thống kê hôm nay,
 * top players, realtime update.
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface GameSession {
  id:           string
  user_id:      string
  full_name:    string | null
  org_group:    string | null
  game_key:     string
  game_title:   string
  score:        number
  max_score:    number
  correct_count: number
  total_questions: number
  score_credited: boolean
  completed_at: string | null
  created_at:   string
}

interface DayStat {
  totalSessions: number
  totalCredited: number
  uniquePlayers: number
  totalScore:    number
  avgScore:      number
}

const GAME_COLORS: Record<string, string> = {
  product_quiz:       '#E94E1B',
  difficult_customer: '#8b5cf6',
  training_test:      '#3b82f6',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  if (min < 1)  return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  return `${Math.floor(min / 60)} giờ trước`
}

function pct(score: number, max: number): number {
  return max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0
}

export default function AdminGameMonitorPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [sessions, setSessions]   = useState<GameSession[]>([])
  const [dayStat, setDayStat]     = useState<DayStat | null>(null)
  const [loading, setLoading]     = useState(true)
  const [liveFlag, setLiveFlag]   = useState(false)
  const [tab, setTab]             = useState<'live' | 'stats'>('live')

  const isAdmin = currentUser ? canAccessAdminPanel(currentUser.role) : false

  const fetchData = useCallback(async () => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Fetch recent 50 sessions (all time)
    const { data: raw } = await supabase
      .from('game_sessions')
      .select('id, user_id, game_key, game_title, score, max_score, correct_count, total_questions, score_credited, completed_at, created_at, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(50)

    if (raw) {
      setSessions(raw.map(r => ({
        id:              r.id,
        user_id:         r.user_id,
        full_name:       (r.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
        org_group:       (r.profiles as unknown as { org_group: string | null } | null)?.org_group ?? null,
        game_key:        r.game_key,
        game_title:      r.game_title,
        score:           r.score,
        max_score:       r.max_score,
        correct_count:   r.correct_count,
        total_questions: r.total_questions,
        score_credited:  r.score_credited,
        completed_at:    r.completed_at,
        created_at:      r.created_at,
      })))
    }

    // Today's stats
    const { data: todaySessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, score_credited')
      .eq('status', 'completed')
      .gte('created_at', todayStart.toISOString())

    if (todaySessions) {
      const totalSessions  = todaySessions.length
      const totalCredited  = todaySessions.filter(s => s.score_credited).length
      const uniquePlayers  = new Set(todaySessions.map(s => s.user_id)).size
      const totalScore     = todaySessions.reduce((acc, s) => acc + s.score, 0)
      const avgScore       = totalSessions > 0 ? Math.round(totalScore / totalSessions) : 0
      setDayStat({ totalSessions, totalCredited, uniquePlayers, totalScore, avgScore })
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void fetchData()

    const channel = supabase
      .channel('admin_game_monitor')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_sessions' },
        () => {
          setLiveFlag(true)
          void fetchData()
          setTimeout(() => setLiveFlag(false), 2000)
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [fetchData])

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
           style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="text-center px-6">
          <p style={{ fontSize: '40px' }}>🚫</p>
          <p className="text-white font-bold mt-3">Không có quyền truy cập</p>
          <button onClick={onClose} className="mt-4 btn-primary px-6 py-2">Đóng</button>
        </div>
      </div>
    )
  }

  const gameGroups = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.game_title] = (acc[s.game_title] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.93)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
                Game Monitor
              </p>
              {liveFlag && (
                <span className="shrink-0 px-1.5 py-0.5 rounded font-bold animate-pulse"
                      style={{ fontSize: '9px', background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                  LIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#585858' }}>Admin · theo dõi hoạt động game</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
            🎮
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #151515' }}>
          {(['live', 'stats'] as const).map(t => (
            <button key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: '12px',
                      background: tab === t ? 'rgba(233,78,27,0.15)' : 'transparent',
                      border:     tab === t ? '1px solid rgba(233,78,27,0.3)' : '1px solid transparent',
                      color:      tab === t ? '#E94E1B' : '#585858',
                    }}>
              {t === 'live' ? '🔴 Live Feed' : '📊 Thống kê'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải dữ liệu...</p>
            </div>
          ) : tab === 'live' ? (
            <>
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <span style={{ fontSize: '40px' }}>🎮</span>
                  <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có lượt chơi nào</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
                    50 lượt chơi gần nhất
                  </p>
                  <div className="flex flex-col gap-2">
                    {sessions.map(s => {
                      const p = pct(s.score, s.max_score)
                      const col = GAME_COLORS[s.game_key] ?? '#E94E1B'
                      return (
                        <div key={s.id}
                             className="rounded-xl px-3.5 py-3"
                             style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-black"
                                 style={{ background: `${col}14`, border: `1px solid ${col}30`, color: col, fontSize: '12px' }}>
                              🎮
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>
                                {s.full_name ?? '—'}
                                {s.org_group ? <span style={{ color: '#585858', fontWeight: 400 }}> · {s.org_group}</span> : ''}
                              </p>
                              <p className="truncate" style={{ fontSize: '10px', color: '#585858' }}>
                                {s.game_title} · {s.correct_count}/{s.total_questions} đúng
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-black" style={{ fontSize: '14px', color: col }}>
                                +{s.score}đ
                              </p>
                              {!s.score_credited && (
                                <p style={{ fontSize: '9px', color: '#484848' }}>không tính</p>
                              )}
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-2 w-full h-1 rounded-full" style={{ background: '#1f1f1f' }}>
                            <div className="h-full rounded-full"
                                 style={{ width: `${p}%`, background: p >= 80 ? '#34d399' : p >= 60 ? '#facc15' : col }} />
                          </div>
                          <p style={{ fontSize: '9px', color: '#383838', marginTop: 3 }}>
                            {p}% · {s.completed_at ? timeAgo(s.completed_at) : timeAgo(s.created_at)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Today stats */}
              {dayStat && (
                <>
                  <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
                    Hôm nay
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: 'Lượt chơi', value: dayStat.totalSessions, icon: '🎮' },
                      { label: 'Người chơi', value: dayStat.uniquePlayers, icon: '👥' },
                      { label: 'Được tính điểm', value: dayStat.totalCredited, icon: '✅' },
                      { label: 'Điểm TB', value: `${dayStat.avgScore}đ`, icon: '📊' },
                    ].map(stat => (
                      <div key={stat.label}
                           className="rounded-xl px-3 py-3"
                           style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                        <p style={{ fontSize: '18px' }}>{stat.icon}</p>
                        <p className="font-black text-white mt-1" style={{ fontSize: '20px' }}>
                          {stat.value}
                        </p>
                        <p style={{ fontSize: '10px', color: '#585858' }}>{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Game breakdown */}
              {Object.keys(gameGroups).length > 0 && (
                <>
                  <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
                    Phân loại game (50 lượt gần nhất)
                  </p>
                  <div className="flex flex-col gap-2">
                    {Object.entries(gameGroups)
                      .sort((a, b) => b[1] - a[1])
                      .map(([title, count]) => {
                        const gameKey = sessions.find(s => s.game_title === title)?.game_key ?? ''
                        const col     = GAME_COLORS[gameKey] ?? '#E94E1B'
                        const max     = Math.max(...Object.values(gameGroups))
                        return (
                          <div key={title}
                               className="rounded-xl px-3.5 py-3"
                               style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>{title}</p>
                              <p className="font-black shrink-0" style={{ fontSize: '13px', color: col }}>{count} lượt</p>
                            </div>
                            <div className="w-full h-1 rounded-full" style={{ background: '#1f1f1f' }}>
                              <div className="h-full rounded-full"
                                   style={{ width: `${Math.round((count / max) * 100)}%`, background: col }} />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
