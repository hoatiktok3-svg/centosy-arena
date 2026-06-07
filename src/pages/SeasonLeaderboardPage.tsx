/**
 * SeasonLeaderboardPage — STEP 73
 * Bảng xếp hạng theo mùa (tháng hiện tại).
 * Aggregates game_sessions.score for score_credited=true trong tháng.
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onClose: () => void
}

interface SeasonRow {
  user_id:    string
  full_name:  string | null
  org_group:  string | null
  totalScore: number
  playCount:  number
  gameCount:  number   // số game khác nhau đã chơi
}

function getSeasonLabel(): string {
  const now = new Date()
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function rankMedal(i: number): string {
  return ['🥇','🥈','🥉'][i] ?? `#${i + 1}`
}

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

export default function SeasonLeaderboardPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [rows, setRows]       = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)
  const seasonLabel = getSeasonLabel()

  const fetchData = useCallback(async () => {
    const seasonStart = getSeasonStart()

    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, game_key, score, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', seasonStart)

    if (sessions) {
      const map: Record<string, SeasonRow> = {}
      for (const s of sessions) {
        const uid  = s.user_id
        const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
        if (!map[uid]) {
          map[uid] = {
            user_id:    uid,
            full_name:  prof?.full_name ?? null,
            org_group:  prof?.org_group ?? null,
            totalScore: 0,
            playCount:  0,
            gameCount:  0,
          }
        }
        map[uid].totalScore += s.score
        map[uid].playCount  += 1
      }

      // Count distinct game_keys per user
      const gamesByUser: Record<string, Set<string>> = {}
      for (const s of sessions) {
        if (!gamesByUser[s.user_id]) gamesByUser[s.user_id] = new Set()
        gamesByUser[s.user_id].add(s.game_key)
      }
      for (const uid of Object.keys(map)) {
        map[uid].gameCount = gamesByUser[uid]?.size ?? 0
      }

      const sorted = Object.values(map).sort((a, b) => b.totalScore - a.totalScore)
      setRows(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const myRank = rows.findIndex(r => r.user_id === currentUser?.id)
  const myRow  = myRank >= 0 ? rows[myRank] : null

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
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Bảng xếp hạng mùa
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>{seasonLabel} · điểm game được tính</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: '16px' }}>
            🏆
          </div>
        </div>

        {/* My rank banner */}
        {myRow && (
          <div className="mx-4 mt-3 rounded-xl px-4 py-3 shrink-0 flex items-center gap-3"
               style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)' }}>
            <p style={{ fontSize: '20px' }}>{rankMedal(myRank)}</p>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold" style={{ fontSize: '13px' }}>
                Bạn — hạng #{myRank + 1}
              </p>
              <p style={{ fontSize: '10px', color: '#585858' }}>
                {myRow.playCount} lượt · {myRow.gameCount} loại game
              </p>
            </div>
            <p className="font-black shrink-0" style={{ fontSize: '18px', color: '#E94E1B' }}>
              {myRow.totalScore.toLocaleString('vi-VN')}đ
            </p>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 mt-3">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '40px' }}>🎮</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có dữ liệu mùa này</p>
              <p style={{ fontSize: '12px', color: '#585858' }}>Hãy chơi game để lên bảng!</p>
            </div>
          ) : (
            <>
              <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
                Xếp hạng ({rows.length} người)
              </p>
              <div className="flex flex-col gap-2">
                {rows.map((row, i) => {
                  const isMe = row.user_id === currentUser?.id
                  return (
                    <div key={row.user_id}
                         className="rounded-xl px-3.5 py-3 flex items-center gap-3"
                         style={{
                           background: isMe ? 'rgba(233,78,27,0.07)' : '#111',
                           border: isMe ? '1px solid rgba(233,78,27,0.25)' : '1px solid #1f1f1f',
                         }}>
                      <p className="font-black shrink-0 w-8 text-center" style={{ fontSize: i < 3 ? '18px' : '12px', color: rankColor(i) }}>
                        {rankMedal(i)}
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
                          {row.playCount} lượt · {row.gameCount} game
                          {row.org_group ? ` · ${row.org_group}` : ''}
                        </p>
                      </div>
                      <p className="font-black shrink-0" style={{ fontSize: '15px', color: '#E94E1B' }}>
                        {row.totalScore.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
