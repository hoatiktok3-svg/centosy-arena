import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Props {
  gameKey?:   string   // nếu có: lọc theo game cụ thể; nếu null: hiện tổng hợp
  gameTitle?: string
  onClose:    () => void
}

interface LeaderRow {
  user_id:    string
  full_name:  string | null
  org_group:  string | null
  totalScore: number
  playCount:  number
  bestScore:  number
}

interface TopSession {
  id:         string
  user_id:    string
  full_name:  string | null
  score:      number
  game_title: string
  completed_at: string
}

const GAME_KEY_LABELS: Record<string, string> = {
  product_quiz:        'Quiz Sản Phẩm',
  difficult_customer:  'Khách Khó Tính',
  training_test:       'Kiểm Tra Đào Tạo',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1)  return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  return `${Math.floor(min / 60)} giờ trước`
}

export default function GameLeaderboardPage({ gameKey, gameTitle, onClose }: Props) {
  const { currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([])
  const [recentSessions, setRecentSessions] = useState<TopSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [liveFlag, setLiveFlag] = useState(false)  // pulse khi có update realtime

  const title = gameTitle ?? (gameKey ? (GAME_KEY_LABELS[gameKey] ?? gameKey) : 'Tổng hợp')

  const fetchData = useCallback(async () => {
    // 1. Fetch aggregated per-user scores từ game_sessions
    let query = supabase
      .from('game_sessions')
      .select('user_id, score, game_key, game_title, completed_at, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)  // chỉ lấy session đã được cộng điểm

    if (gameKey) query = query.eq('game_key', gameKey)

    const { data: sessions } = await query

    if (sessions) {
      // Aggregate per user
      const map: Record<string, LeaderRow> = {}
      for (const s of sessions) {
        const uid = s.user_id
        const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
        if (!map[uid]) {
          map[uid] = {
            user_id:    uid,
            full_name:  prof?.full_name ?? null,
            org_group:  prof?.org_group ?? null,
            totalScore: 0,
            playCount:  0,
            bestScore:  0,
          }
        }
        map[uid].totalScore += s.score
        map[uid].playCount  += 1
        map[uid].bestScore   = Math.max(map[uid].bestScore, s.score)
      }
      const rows = Object.values(map).sort((a, b) => b.totalScore - a.totalScore)
      setLeaderboard(rows)
    }

    // 2. Recent sessions (top 10 most recent)
    let rQuery = supabase
      .from('game_sessions')
      .select('id, user_id, score, game_title, completed_at, profiles:user_id(full_name)')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10)

    if (gameKey) rQuery = rQuery.eq('game_key', gameKey)

    const { data: recent } = await rQuery
    if (recent) {
      setRecentSessions(recent.map(r => ({
        id:           r.id,
        user_id:      r.user_id,
        full_name:    (r.profiles as { full_name: string | null } | null)?.full_name ?? null,
        score:        r.score,
        game_title:   r.game_title,
        completed_at: r.completed_at,
      })))
    }

    setLoading(false)
  }, [gameKey])

  useEffect(() => {
    void fetchData()

    // Supabase Realtime: lắng nghe insert mới vào game_sessions
    const channel = supabase
      .channel('game_sessions_live')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'game_sessions',
          filter: gameKey ? `game_key=eq.${gameKey}` : undefined,
        },
        () => {
          setLiveFlag(true)
          void fetchData()
          setTimeout(() => setLiveFlag(false), 2000)
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [fetchData, gameKey])

  function rankColor(i: number): string {
    if (i === 0) return '#facc15'
    if (i === 1) return '#9ca3af'
    if (i === 2) return '#d97706'
    return '#484848'
  }

  function initials(name: string | null): string {
    if (!name) return '?'
    return name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()
  }

  const myRankIdx = leaderboard.findIndex(r => r.user_id === currentUser?.id)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.92)' }}>
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
                {title}
              </p>
              {liveFlag && (
                <span className="shrink-0 px-1.5 py-0.5 rounded font-bold animate-pulse"
                      style={{ fontSize: '9px', background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                  LIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#585858' }}>Bảng xếp hạng game · tự cập nhật</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: '16px' }}>
            🏆
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải bảng xếp hạng...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '40px' }}>🎮</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có ai chơi</p>
              <p style={{ fontSize: '12px', color: '#585858' }}>Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <>
              {/* My rank banner nếu không top 10 */}
              {myRankIdx >= 10 && (
                <div className="mt-4 rounded-xl px-4 py-3 flex items-center gap-3"
                     style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)' }}>
                  <p style={{ fontSize: '12px', color: '#E94E1B', fontWeight: 700 }}>
                    Thứ hạng của bạn: #{myRankIdx + 1}
                  </p>
                  <p style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
                    {leaderboard[myRankIdx]?.totalScore.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              )}

              {/* Leaderboard list */}
              <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
                Xếp hạng ({leaderboard.length} người)
              </p>
              <div className="flex flex-col gap-2">
                {leaderboard.slice(0, 20).map((row, i) => {
                  const isMe = row.user_id === currentUser?.id
                  return (
                    <div key={row.user_id}
                         className="rounded-xl px-3.5 py-3 flex items-center gap-3"
                         style={{
                           background: isMe ? 'rgba(233,78,27,0.07)' : '#111',
                           border: isMe ? '1px solid rgba(233,78,27,0.25)' : '1px solid #1f1f1f',
                         }}>
                      <p className="font-black shrink-0 w-7 text-center" style={{ fontSize: '13px', color: rankColor(i) }}>
                        #{i + 1}
                      </p>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black shrink-0"
                           style={{ background: '#1a1a1a', color: rankColor(i), fontSize: '13px' }}>
                        {initials(row.full_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>
                          {row.full_name ?? '—'}{isMe ? ' (bạn)' : ''}
                        </p>
                        <p style={{ fontSize: '10px', color: '#585858' }}>
                          {row.playCount} lượt · best {row.bestScore}đ
                        </p>
                      </div>
                      <p className="font-black shrink-0" style={{ fontSize: '15px', color: '#E94E1B' }}>
                        {row.totalScore.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Recent sessions */}
              {recentSessions.length > 0 && (
                <>
                  <p className="font-bold text-white mt-5 mb-2.5" style={{ fontSize: '13px' }}>
                    Lượt chơi gần đây
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {recentSessions.map(s => (
                      <div key={s.id}
                           className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                           style={{ background: '#111', border: '1px solid #1a1a1a' }}>
                        <span style={{ fontSize: '14px' }}>🎮</span>
                        <p className="flex-1 text-white font-semibold truncate" style={{ fontSize: '11px' }}>
                          {s.full_name ?? '—'}
                        </p>
                        <p className="font-black" style={{ fontSize: '12px', color: '#E94E1B' }}>
                          +{s.score}đ
                        </p>
                        <p style={{ fontSize: '10px', color: '#484848', whiteSpace: 'nowrap' }}>
                          {timeAgo(s.completed_at)}
                        </p>
                      </div>
                    ))}
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
