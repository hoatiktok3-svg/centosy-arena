/**
 * LucChienLeaderboardPage — STEP A2 v2
 * LC v2 formula (rolling 30d): score_30d×1 + min(streak,30)×3 + badges_30d×8 + praises_30d×3 + missions_30d×4
 * Dùng SQL view luc_chien_scores_30d để tính toán trên DB (không fetch raw client-side).
 * Fallback về v1 nếu view chưa tồn tại.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Props { onClose: () => void }

interface LCRowV2 {
  user_id:      string
  full_name:    string | null
  org_group:    string | null
  department:   string | null
  score:        number
  streak:       number
  score_30d:    number
  streak_capped: number
  badges_30d:   number
  praises_30d:  number
  missions_30d: number
  lc_score_30d: number
}


const GROUP_TABS = ['Tất cả', 'Cửa hàng', 'Kho', 'Văn phòng'] as const
type GroupTab = typeof GROUP_TABS[number]

const ORG_MAP: Record<string, string> = {
  'cua-hang': 'Cửa hàng',
  'kho': 'Kho',
  'van-phong': 'Văn phòng',
}

const MEDAL = ['🥇','🥈','🥉']

export default function LucChienLeaderboardPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [rows,    setRows]    = useState<LCRowV2[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<GroupTab>('Tất cả')
  const [isV2,    setIsV2]    = useState(true)
  const [myRank,  setMyRank]  = useState<number | null>(null)
  const [myLC,    setMyLC]    = useState<number | null>(null)

  useEffect(() => { void loadData() }, [])

  async function loadData() {
    setLoading(true)

    // Try v2 view first
    const { data: v2, error: v2err } = await supabase
      .from('luc_chien_scores_30d')
      .select('*')
      .order('lc_score_30d', { ascending: false })

    if (!v2err && v2 && v2.length > 0) {
      setIsV2(true)
      const typed = v2 as LCRowV2[]
      setRows(typed)
      const idx = typed.findIndex(r => r.user_id === currentUser?.id)
      if (idx !== -1) { setMyRank(idx + 1); setMyLC(typed[idx].lc_score_30d) }
    } else {
      // Fallback v1: fetch profiles + compute client-side
      setIsV2(false)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, org_group, score, streak, badge_count')
        .eq('is_active', true)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v1rows: LCRowV2[] = (profiles ?? []).map((p: any) => {
        const lc = (p.score ?? 0) + (Math.min(p.streak ?? 0, 30) * 3) + ((p.badge_count ?? 0) * 5)
        return {
          user_id:       p.id ?? '',
          full_name:     p.full_name,
          org_group:     p.org_group,
          department:    null,
          score:         p.score ?? 0,
          streak:        p.streak ?? 0,
          score_30d:     0,
          streak_capped: Math.min(p.streak ?? 0, 30),
          badges_30d:    p.badge_count ?? 0,
          praises_30d:   0,
          missions_30d:  0,
          lc_score_30d:  lc,
        }
      }).sort((a, b) => b.lc_score_30d - a.lc_score_30d)

      setRows(v1rows)
      const idx = v1rows.findIndex(r => r.user_id === currentUser?.id)
      if (idx !== -1) { setMyRank(idx + 1); setMyLC(v1rows[idx].lc_score_30d) }
    }

    setLoading(false)
  }

  const filtered = tab === 'Tất cả'
    ? rows
    : rows.filter(r => {
        const label = r.org_group ? (ORG_MAP[r.org_group] ?? r.org_group) : null
        return label === tab
      })

  const ranked = filtered.map((r, i) => ({ ...r, displayRank: i + 1 }))
  const topLC  = ranked[0]?.lc_score_30d ?? 1

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">⚔️ Bảng Lực Chiến</p>
          <p className="text-text-muted text-xs">
            {isV2 ? 'LC v2 · Rolling 30 ngày · Streak cap 30' : 'LC v1 · Tổng hợp · (chạy SQL để nâng cấp v2)'}
          </p>
        </div>
        {isV2 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(52,211,153,.12)', color: '#34d399', border: '1px solid rgba(52,211,153,.2)' }}>v2</span>
        )}
      </div>

      {/* My rank strip */}
      {myRank && myLC !== null && (
        <div className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)' }}>
          <span className="text-2xl font-black text-brand">#{myRank}</span>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{currentUser?.name ?? 'Bạn'}</p>
            <p className="text-text-muted text-xs">{isV2 ? 'Lực Chiến 30 ngày' : 'Lực Chiến tổng'}</p>
          </div>
          <div className="text-right">
            <p className="text-brand font-black text-lg">{myLC.toLocaleString()}</p>
            <p className="text-text-muted text-[10px]">LC</p>
          </div>
        </div>
      )}

      {/* Formula hint */}
      <div className="mx-4 mt-2 mb-1 flex gap-1.5 flex-wrap">
        {(isV2
          ? [
              { label: 'Score×1', color: '#60a5fa' },
              { label: 'Streak(≤30)×3', color: '#34d399' },
              { label: 'Badge 30d×8', color: '#fbbf24' },
              { label: 'Khen 30d×3', color: '#f472b6' },
              { label: 'Mission 30d×4', color: '#a78bfa' },
            ]
          : [
              { label: 'Điểm×1', color: '#60a5fa' },
              { label: 'Streak(≤30)×3', color: '#34d399' },
              { label: 'Huy hiệu×5', color: '#fbbf24' },
            ]
        ).map(f => (
          <span key={f.label} className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${f.color}15`, border: `1px solid ${f.color}30`, color: f.color }}>
            {f.label}
          </span>
        ))}
      </div>

      {/* Group tabs */}
      <div className="flex gap-2 px-4 mt-2 overflow-x-auto no-scrollbar pb-1">
        {GROUP_TABS.map(g => (
          <button key={g} onClick={() => setTab(g)}
            className={tab === g ? 'filter-pill-active' : 'filter-pill-inactive'}
            style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
            {g}
          </button>
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
          const isMe  = row.user_id === currentUser?.id
          const medal = MEDAL[row.displayRank - 1]
          const pct   = Math.round((row.lc_score_30d / topLC) * 100)
          const orgLabel = row.org_group ? (ORG_MAP[row.org_group] ?? row.org_group) : '—'

          return (
            <div key={row.user_id}
              className="arena-card overflow-hidden"
              style={isMe ? { border: '1px solid rgba(233,78,27,0.4)', background: 'rgba(233,78,27,0.04)' } : {}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-7 text-center shrink-0">
                  {medal
                    ? <span className="text-xl">{medal}</span>
                    : <span className="text-text-muted font-black text-sm">#{row.displayRank}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${isMe ? 'text-brand' : 'text-white'}`}>
                    {row.full_name ?? 'Ẩn danh'} {isMe && '(bạn)'}
                  </p>
                  <p className="text-text-muted text-[10px]">{orgLabel}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black text-base ${isMe ? 'text-brand' : 'text-white'}`}>
                    {row.lc_score_30d.toLocaleString()}
                  </p>
                  <p className="text-text-muted text-[10px]">LC</p>
                </div>
              </div>

              <div className="h-1 rounded-full bg-arena-border overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: isMe ? '#E94E1B' : '#3b82f6' }} />
              </div>

              {/* Stats breakdown */}
              <div className="flex gap-2 mt-2">
                {(isV2
                  ? [
                      { label: '⭐30d', value: row.score_30d.toLocaleString(), color: '#60a5fa' },
                      { label: '🔥St',  value: `${row.streak_capped}d`,        color: '#34d399' },
                      { label: '🏅Bd',  value: String(row.badges_30d),         color: '#fbbf24' },
                      { label: '👏Kh',  value: String(row.praises_30d),        color: '#f472b6' },
                      { label: '📋Ms',  value: String(row.missions_30d),       color: '#a78bfa' },
                    ]
                  : [
                      { label: '⭐Điểm', value: row.score.toLocaleString(), color: '#60a5fa' },
                      { label: '🔥Streak', value: `${row.streak_capped}d`, color: '#34d399' },
                      { label: '🏅HH', value: String(row.badges_30d), color: '#fbbf24' },
                    ]
                ).map(s => (
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
