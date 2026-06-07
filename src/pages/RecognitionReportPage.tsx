import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface SummaryStats {
  totalPraises:    number
  totalStories:    number
  totalVotes:      number
  topVotedName:    string | null
  topVotedCount:   number
}

interface GroupStat {
  group:       string
  praises:     number
  stories:     number
}

interface Props { onClose: () => void }

const GROUP_LABEL: Record<string, string> = {
  'cua-hang': 'Cửa hàng', kho: 'Kho', 'van-phong': 'Văn phòng',
}

function getCurrentPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ── Component ─────────────────────────────────────────────────
export default function RecognitionReportPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)
  const period  = getCurrentPeriod()

  const [stats,       setStats]       = useState<SummaryStats | null>(null)
  const [groupStats,  setGroupStats]  = useState<GroupStat[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)

    // Praises this week (created_at >= start of this week)
    const weekStart = getWeekStart()
    const { data: praises } = await supabase
      .from('peer_praises')
      .select('id, to_user_id, profiles!peer_praises_to_user_id_fkey(org_group)')
      .gte('created_at', weekStart)

    // Stories approved total
    const { count: storyCount } = await supabase
      .from('centosy_stories')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    // Votes this period
    const { data: votes } = await supabase
      .from('inspiration_votes')
      .select('nominee_id, profiles!inspiration_votes_nominee_id_fkey(full_name)')
      .eq('period', period)

    // Top voted
    const voteCounts: Record<string, { name: string; count: number }> = {}
    for (const v of votes ?? []) {
      const name = (v.profiles as unknown as { full_name: string | null } | null)?.full_name ?? '—'
      if (!voteCounts[v.nominee_id]) {
        voteCounts[v.nominee_id] = { name, count: 0 }
      }
      voteCounts[v.nominee_id].count++
    }
    const sorted = Object.values(voteCounts).sort((a, b) => b.count - a.count)
    const topVoted = sorted[0] ?? null

    // Group stats for praises
    const groupMap: Record<string, number> = {}
    for (const p of praises ?? []) {
      const g = (p.profiles as unknown as { org_group: string | null } | null)?.org_group ?? 'other'
      groupMap[g] = (groupMap[g] ?? 0) + 1
    }

    const gStats: GroupStat[] = Object.entries(groupMap).map(([group, count]) => ({
      group,
      praises: count,
      stories: 0, // simplified: group breakdown for stories requires join
    })).sort((a, b) => b.praises - a.praises)

    setStats({
      totalPraises:  praises?.length ?? 0,
      totalStories:  storyCount ?? 0,
      totalVotes:    votes?.length ?? 0,
      topVotedName:  topVoted?.name ?? null,
      topVotedCount: topVoted?.count ?? 0,
    })
    setGroupStats(gStats)
    setLoading(false)
  }

  function getWeekStart(): string {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString()
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[90] bg-arena-bg flex items-center justify-center" style={{ maxWidth: 430, margin: '0 auto' }}>
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="text-5xl">🔒</span>
          <p className="text-white font-bold">Chỉ admin mới xem được báo cáo.</p>
          <button onClick={onClose} className="btn-primary px-6 mt-2">Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">📊 Báo cáo vinh danh</p>
          <p className="text-text-muted text-xs">Kỳ hiện tại: {period}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {loading && <p className="text-text-muted text-sm text-center py-16">Đang tải...</p>}

        {!loading && stats && (
          <>
            {/* KPI Grid */}
            <div>
              <p className="section-title mb-3">📈 Tổng quan</p>
              <div className="grid grid-cols-2 gap-3">
                <KPICard label="Lời khen tuần này" value={stats.totalPraises} icon="👏" color="#E94E1B" />
                <KPICard label="Stories đã duyệt"   value={stats.totalStories} icon="📖" color="#a78bfa" />
                <KPICard label="Lượt bình chọn"      value={stats.totalVotes}   icon="⭐" color="#fbbf24" />
                <div className="arena-card flex flex-col gap-1">
                  <span className="text-2xl">🏆</span>
                  <p className="text-text-muted text-[10px] uppercase tracking-wider">Dẫn đầu bình chọn</p>
                  <p className="text-white font-black text-sm truncate">{stats.topVotedName ?? '—'}</p>
                  {stats.topVotedCount > 0 && (
                    <p className="text-text-secondary text-xs">{stats.topVotedCount} votes</p>
                  )}
                </div>
              </div>
            </div>

            {/* Group breakdown */}
            {groupStats.length > 0 && (
              <div>
                <p className="section-title mb-3">🏢 Lời khen theo bộ phận (tuần này)</p>
                <div className="flex flex-col gap-2">
                  {groupStats.map(g => (
                    <div key={g.group} className="arena-card flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">
                          {GROUP_LABEL[g.group] ?? g.group}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-brand font-black text-lg">{g.praises}</p>
                        <p className="text-text-muted text-[10px]">lời khen</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupStats.length === 0 && (
              <div className="arena-card flex flex-col items-center gap-2 py-8">
                <span className="text-4xl">💬</span>
                <p className="text-text-muted text-sm text-center">Chưa có lời khen nào tuần này.</p>
              </div>
            )}
          </>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}

function KPICard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="arena-card flex flex-col gap-1">
      <span className="text-2xl">{icon}</span>
      <p className="text-text-muted text-[10px] uppercase tracking-wider leading-tight">{label}</p>
      <p className="font-black text-xl" style={{ color }}>{value}</p>
    </div>
  )
}
