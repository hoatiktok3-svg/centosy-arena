/**
 * SeasonLeaderboardPage — STEP 73 + STEP 74
 * Bảng xếp hạng theo mùa (tháng hiện tại) + phần thưởng mùa.
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

// ── Season Reward Tiers ────────────────────────────────────────
interface RewardTier {
  rank:        string     // display label, e.g. "Hạng 1"
  rankRange:   [number, number]  // [min, max] 1-indexed
  icon:        string
  title:       string
  description: string
  color:       string
  bonus:       string     // e.g. "+500 điểm thưởng"
}

const SEASON_REWARDS: RewardTier[] = [
  {
    rank: 'Hạng 1',
    rankRange: [1, 1],
    icon: '🥇',
    title: 'Quán quân mùa',
    description: 'Badge Quán quân độc quyền + điểm thưởng đặc biệt',
    color: '#facc15',
    bonus: '+500 điểm thưởng',
  },
  {
    rank: 'Hạng 2–3',
    rankRange: [2, 3],
    icon: '🥈',
    title: 'Top 3 xuất sắc',
    description: 'Badge Top 3 + điểm thưởng',
    color: '#9ca3af',
    bonus: '+200 điểm thưởng',
  },
  {
    rank: 'Hạng 4–10',
    rankRange: [4, 10],
    icon: '🏅',
    title: 'Top 10',
    description: 'Badge Top 10 mùa + điểm thưởng nhỏ',
    color: '#d97706',
    bonus: '+100 điểm thưởng',
  },
  {
    rank: 'Tham gia',
    rankRange: [11, 9999],
    icon: '🎖️',
    title: 'Người tham gia',
    description: 'Badge tham gia mùa (yêu cầu ≥ 1 lượt chơi)',
    color: '#585858',
    bonus: '+20 điểm thưởng',
  },
]

function getMyReward(rank: number | null): RewardTier | null {
  if (rank === null) return null
  return SEASON_REWARDS.find(r => rank >= r.rankRange[0] && rank <= r.rankRange[1]) ?? null
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
  const [tab, setTab]         = useState<'rank' | 'rewards'>('rank')
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
        const prof = s.profiles as unknown as { full_name: string | null; org_group: string | null } | null
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

  const myRank    = rows.findIndex(r => r.user_id === currentUser?.id)
  const myRow     = myRank >= 0 ? rows[myRank] : null
  const myReward  = getMyReward(myRank >= 0 ? myRank + 1 : null)

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

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #151515' }}>
          {(['rank', 'rewards'] as const).map(t => (
            <button key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: '12px',
                      background: tab === t ? 'rgba(233,78,27,0.15)' : 'transparent',
                      border:     tab === t ? '1px solid rgba(233,78,27,0.3)' : '1px solid transparent',
                      color:      tab === t ? '#E94E1B' : '#585858',
                    }}>
              {t === 'rank' ? '🏆 Xếp hạng' : '🎁 Phần thưởng'}
            </button>
          ))}
        </div>

        {/* My rank banner */}
        {tab === 'rank' && myRow && (
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
        <div className="flex-1 overflow-y-auto px-4 pb-10 mt-3" style={{ display: tab === 'rewards' ? 'none' : undefined }}>
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

        {/* Rewards tab */}
        {tab === 'rewards' && (
          <div className="flex-1 overflow-y-auto px-4 pb-10 mt-3">
            {/* My current reward */}
            {myReward && (
              <>
                <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
                  Phần thưởng của bạn mùa này
                </p>
                <div className="rounded-xl px-4 py-4 mb-4"
                     style={{ background: `${myReward.color}0f`, border: `1px solid ${myReward.color}30` }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: '28px' }}>{myReward.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-white" style={{ fontSize: '15px' }}>{myReward.title}</p>
                      <p style={{ fontSize: '11px', color: '#888' }}>Hạng #{myRank + 1} · {seasonLabel}</p>
                    </div>
                    <span className="font-bold shrink-0 px-2 py-1 rounded-lg"
                          style={{ fontSize: '11px', background: `${myReward.color}18`, color: myReward.color }}>
                      {myReward.bonus}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#888' }}>{myReward.description}</p>
                </div>
              </>
            )}

            {/* All tiers */}
            <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
              Tất cả phần thưởng mùa
            </p>
            <div className="flex flex-col gap-2.5">
              {SEASON_REWARDS.map((tier) => {
                const isMyTier = myReward?.rank === tier.rank
                return (
                  <div key={tier.rank}
                       className="rounded-xl px-4 py-3.5"
                       style={{
                         background: isMyTier ? `${tier.color}10` : '#111',
                         border:     isMyTier ? `1px solid ${tier.color}35` : '1px solid #1f1f1f',
                       }}>
                    <div className="flex items-start gap-3">
                      <span style={{ fontSize: '24px', flexShrink: 0 }}>{tier.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-white" style={{ fontSize: '13px' }}>{tier.title}</p>
                          {isMyTier && (
                            <span className="px-1.5 py-0.5 rounded font-bold"
                                  style={{ fontSize: '8px', background: 'rgba(233,78,27,0.15)', color: '#E94E1B' }}>
                              BẠN
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#888', marginBottom: 6 }}>{tier.description}</p>
                        <div className="flex items-center justify-between">
                          <span style={{ fontSize: '11px', color: '#585858' }}>{tier.rank}</span>
                          <span className="font-bold px-2 py-0.5 rounded-lg"
                                style={{ fontSize: '10px', background: `${tier.color}15`, color: tier.color }}>
                            {tier.bonus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-center mt-4" style={{ fontSize: '11px', color: '#383838' }}>
              Phần thưởng được trao vào cuối {seasonLabel}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
