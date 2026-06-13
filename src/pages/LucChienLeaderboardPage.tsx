/**
 * LucChienLeaderboardPage — STEP A2
 * Bảng xếp hạng Lực Chiến: tổng hợp nhiều chiều hoạt động.
 * Công thức: LC = score×1 + streak×3 + badges×5 + praises_received×2
 * Sub-leaderboard: Cửa hàng / Kho / Văn phòng / Tất cả
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Props { onClose: () => void }

interface LCRow {
  user_id:         string
  full_name:       string | null
  org_group:       string | null
  score:           number
  streak:          number
  badge_count:     number
  praises_received: number
  lc_score:        number
}

const GROUP_TABS = ['Tất cả', 'Cửa hàng', 'Kho', 'Văn phòng'] as const
type GroupTab = typeof GROUP_TABS[number]

const MEDAL = ['🥇','🥈','🥉']

function calcLC(row: Omit<LCRow, 'lc_score'>): number {
  return (row.score * 1) + (row.streak * 3) + (row.badge_count * 5) + (row.praises_received * 2)
}

export default function LucChienLeaderboardPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [rows,     setRows]     = useState<LCRow[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<GroupTab>('Tất cả')
  const [myRank,   setMyRank]   = useState<number | null>(null)
  const [myLC,     setMyLC]     = useState<number | null>(null)

  useEffect(() => { void loadData() }, [])

  async function loadData() {
    setLoading(true)

    // Fetch profiles with score + streak + badge_count
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, org_group, score, streak, badge_count')
      .eq('is_active', true)
      .order('score', { ascending: false })

    if (!profiles) { setLoading(false); return }

    // Fetch praises received per user
    const { data: praiseCounts } = await supabase
      .from('peer_praises')
      .select('to_user_id')

    const praiseMap: Record<string, number> = {}
    for (const p of praiseCounts ?? []) {
      praiseMap[p.to_user_id] = (praiseMap[p.to_user_id] ?? 0) + 1
    }

    const computed: LCRow[] = profiles.map(p => {
      const base: Omit<LCRow, 'lc_score'> = {
        user_id:          p.id,
        full_name:        p.full_name,
        org_group:        p.org_group,
        score:            p.score ?? 0,
        streak:           p.streak ?? 0,
        badge_count:      p.badge_count ?? 0,
        praises_received: praiseMap[p.id] ?? 0,
      }
      return { ...base, lc_score: calcLC(base) }
    })

    computed.sort((a, b) => b.lc_score - a.lc_score)
    setRows(computed)

    const idx = computed.findIndex(r => r.user_id === currentUser?.id)
    if (idx !== -1) { setMyRank(idx + 1); setMyLC(computed[idx].lc_score) }

    setLoading(false)
  }

  const filtered = tab === 'Tất cả' ? rows : rows.filter(r => r.org_group === tab)

  // Re-rank after filter
  const ranked = filtered.map((r, i) => ({ ...r, displayRank: i + 1 }))

  const topLC = ranked[0]?.lc_score ?? 1

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">⚔️ Bảng Lực Chiến</p>
          <p className="text-text-muted text-xs">LC = Điểm + Streak×3 + Huy hiệu×5 + Khen×2</p>
        </div>
      </div>

      {/* My rank strip */}
      {myRank && myLC !== null && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)' }}>
          <span className="text-2xl font-black text-brand">#{myRank}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{currentUser?.full_name ?? 'Bạn'}</p>
            <p className="text-text-muted text-xs">Tổng Lực Chiến</p>
          </div>
          <div className="text-right">
            <p className="text-brand font-black text-lg">{myLC.toLocaleString()}</p>
            <p className="text-text-muted text-[10px]">LC</p>
          </div>
        </div>
      )}

      {/* Group tabs */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto no-scrollbar pb-1">
        {GROUP_TABS.map(g => (
          <button key={g} onClick={() => setTab(g)}
            className={tab === g ? 'filter-pill-active' : 'filter-pill-inactive'}
            style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
            {g}
          </button>
        ))}
      </div>

      {/* Formula explainer */}
      <div className="mx-4 mt-2 mb-1 flex gap-2 flex-wrap">
        {[
          { label: 'Điểm ×1',    color: '#60a5fa' },
          { label: 'Streak ×3',  color: '#34d399' },
          { label: 'Huy hiệu ×5', color: '#fbbf24' },
          { label: 'Khen ×2',   color: '#f472b6' },
        ].map(f => (
          <span key={f.label} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, color: f.color }}>
            {f.label}
          </span>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {loading && (
          <div className="flex flex-col gap-2 mt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: '#111' }} />
            ))}
          </div>
        )}

        {!loading && ranked.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <span className="text-4xl">📊</span>
            <p className="text-text-muted text-sm">Chưa có dữ liệu cho nhóm này</p>
          </div>
        )}

        {!loading && ranked.map(row => {
          const isMe   = row.user_id === currentUser?.id
          const medal  = MEDAL[row.displayRank - 1]
          const pct    = Math.round((row.lc_score / topLC) * 100)

          return (
            <div key={row.user_id}
              className="arena-card overflow-hidden"
              style={isMe ? { border: '1px solid rgba(233,78,27,0.4)', background: 'rgba(233,78,27,0.04)' } : {}}>
              <div className="flex items-center gap-3 mb-2">
                {/* Rank */}
                <div className="w-7 text-center shrink-0">
                  {medal
                    ? <span className="text-xl">{medal}</span>
                    : <span className="text-text-muted font-black text-sm">#{row.displayRank}</span>}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isMe ? 'text-brand' : 'text-white'}`}>
                    {row.full_name ?? 'Ẩn danh'} {isMe && '(bạn)'}
                  </p>
                  <p className="text-text-muted text-[10px]">{row.org_group ?? '—'}</p>
                </div>

                {/* LC score */}
                <div className="text-right shrink-0">
                  <p className={`font-black text-base ${isMe ? 'text-brand' : 'text-white'}`}>
                    {row.lc_score.toLocaleString()}
                  </p>
                  <p className="text-text-muted text-[10px]">LC</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-arena-border overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: isMe ? '#E94E1B' : '#3b82f6' }} />
              </div>

              {/* Stats row */}
              <div className="flex gap-3 mt-2">
                {[
                  { label: '⭐ Điểm',     value: row.score.toLocaleString(),    color: '#60a5fa' },
                  { label: '🔥 Streak',   value: `${row.streak}ngày`,           color: '#34d399' },
                  { label: '🏅 HH',       value: String(row.badge_count),       color: '#fbbf24' },
                  { label: '👏 Khen',     value: String(row.praises_received),  color: '#f472b6' },
                ].map(s => (
                  <div key={s.label} className="flex-1 text-center">
                    <p className="font-bold text-[11px]" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-text-muted text-[9px]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        <div className="h-4" />
      </div>
    </div>
  )
}
