import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { canAccessAdminPanel, getRoleLabel, getRoleBadgeStyle } from '../../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface TeamMember {
  id:                 string
  full_name:          string | null
  role:               string | null
  score:              number
  org_group:          string | null
  office_department:  string | null
  is_active:          boolean
  // computed
  gamePlays:          number
  missionsDone:       number
  rank:               number  // within team
}

interface TeamKPI {
  totalMembers:   number
  totalScore:     number
  avgScore:       number
  totalMissions:  number
  totalGames:     number
  topMember:      TeamMember | null
}

// ── Label maps ────────────────────────────────────────────────
const ORG_GROUP_LABEL: Record<string, string> = {
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'van-phong': 'Văn phòng',
}
const OFFICE_DEPT_LABEL: Record<string, string> = {
  'tmdt':               'TMĐT',
  'kdtt':               'KDTT',
  'mua-hang':           'Mua hàng',
  'ke-toan':            'Kế toán',
  'hanh-chinh-nhan-su': 'HC Nhân sự',
  'marketing':          'Marketing',
  'giam-doc':           'Giám đốc',
}

// Admin/Director có thể xem tất cả khối
const GROUP_FILTERS = [
  { key: null,         label: 'Toàn công ty' },
  { key: 'cua-hang',   label: 'Cửa hàng' },
  { key: 'kho',        label: 'Kho' },
  { key: 'van-phong',  label: 'Văn phòng' },
]

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

// ── Main Component ────────────────────────────────────────────
export default function TeamDashboard({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  // Admin/director xem tất cả, manager chỉ xem khối của mình
  const defaultGroup = isAdmin ? null : (currentUser?.orgGroup ?? null)

  const [selectedGroup, setSelectedGroup] = useState<string | null>(defaultGroup)
  const [members,       setMembers]        = useState<TeamMember[]>([])
  const [kpi,           setKpi]            = useState<TeamKPI | null>(null)
  const [loading,       setLoading]        = useState(true)
  const [sortBy,        setSortBy]         = useState<'score' | 'missions' | 'games'>('score')
  const [alertsOpen,    setAlertsOpen]     = useState(false)

  // ── Pending missions quá lâu (> 3 ngày) ──────────────────
  interface OldPending {
    id: string; user_name: string; title: string; created_at: string; days: number
  }
  const [oldPendings, setOldPendings] = useState<OldPending[]>([])

  // ── Fetch team data ─────────────────────────────────────────
  async function fetchTeam() {
    setLoading(true)

    // 1. Fetch profiles
    let q = supabase
      .from('profiles')
      .select('id, full_name, role, score, org_group, office_department, is_active')
      .eq('is_active', true)
      .not('role', 'eq', null)

    if (selectedGroup !== null) {
      q = q.eq('org_group', selectedGroup)
    }

    const { data: profiles } = await q
    if (!profiles || profiles.length === 0) {
      setMembers([]); setKpi(null); setLoading(false); return
    }

    const memberIds = profiles.map(p => p.id)

    // 2. Fetch game plays per user
    const { data: gameCounts } = await supabase
      .from('game_results')
      .select('user_id, score')
      .in('user_id', memberIds)

    const gameMap: Record<string, { plays: number }> = {}
    for (const g of gameCounts ?? []) {
      if (!gameMap[g.user_id]) gameMap[g.user_id] = { plays: 0 }
      gameMap[g.user_id].plays++
    }

    // 3. Fetch approved missions per user
    const { data: missionCounts } = await supabase
      .from('mission_submissions')
      .select('user_id')
      .in('user_id', memberIds)
      .eq('status', 'approved')

    const missionMap: Record<string, number> = {}
    for (const m of missionCounts ?? []) {
      missionMap[m.user_id] = (missionMap[m.user_id] ?? 0) + 1
    }

    // 4. Build members list sorted by score
    const builtMembers: TeamMember[] = profiles
      .map(p => ({
        id:               p.id,
        full_name:        p.full_name,
        role:             p.role,
        score:            p.score ?? 0,
        org_group:        p.org_group,
        office_department: p.office_department,
        is_active:        p.is_active,
        gamePlays:        gameMap[p.id]?.plays ?? 0,
        missionsDone:     missionMap[p.id] ?? 0,
        rank:             0,  // assigned below
      }))
      .sort((a, b) => b.score - a.score)
      .map((m, i) => ({ ...m, rank: i + 1 }))

    setMembers(builtMembers)

    // 5. Compute KPIs
    const totalScore   = builtMembers.reduce((s, m) => s + m.score, 0)
    const totalMissions = builtMembers.reduce((s, m) => s + m.missionsDone, 0)
    const totalGames   = builtMembers.reduce((s, m) => s + m.gamePlays, 0)
    setKpi({
      totalMembers:  builtMembers.length,
      totalScore,
      avgScore:      builtMembers.length > 0 ? Math.round(totalScore / builtMembers.length) : 0,
      totalMissions,
      totalGames,
      topMember:     builtMembers[0] ?? null,
    })

    setLoading(false)
  }

  useEffect(() => { void fetchTeam() }, [selectedGroup])

  // ── Fetch old pending missions ──────────────────────────────
  useEffect(() => {
    if (!isAdmin && !currentUser?.role?.includes('manager')) return
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    supabase
      .from('mission_submissions')
      .select('id, title, created_at, profiles:user_id(full_name)')
      .eq('status', 'pending')
      .lt('created_at', cutoff)
      .limit(30)
      .then(({ data }) => {
        if (!data) return
        const now = Date.now()
        setOldPendings(
          data.map((r: { id: string; title: string; created_at: string; profiles: { full_name: string | null } | null }) => ({
            id:         r.id,
            user_name:  r.profiles?.full_name ?? 'Không rõ',
            title:      r.title,
            created_at: r.created_at,
            days:       Math.floor((now - new Date(r.created_at).getTime()) / 86_400_000),
          }))
        )
      })
  }, [selectedGroup])

  // ── Sort members ────────────────────────────────────────────
  const sortedMembers = [...members].sort((a, b) => {
    if (sortBy === 'missions') return b.missionsDone - a.missionsDone
    if (sortBy === 'games')    return b.gamePlays - a.gamePlays
    return b.score - a.score
  })

  // ── Helpers ─────────────────────────────────────────────────
  function deptLabel(m: TeamMember): string {
    if (m.org_group) {
      const og = ORG_GROUP_LABEL[m.org_group] ?? m.org_group
      const od = m.office_department ? (OFFICE_DEPT_LABEL[m.office_department] ?? m.office_department) : null
      return od ? `${og} · ${od}` : og
    }
    return '—'
  }

  function initials(name: string | null): string {
    if (!name) return '?'
    return name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()
  }

  function rankColor(rank: number): string {
    if (rank === 1) return '#facc15'
    if (rank === 2) return '#9ca3af'
    if (rank === 3) return '#d97706'
    return '#585858'
  }

  // ── Current group label ──────────────────────────────────────
  const groupLabel = selectedGroup ? (ORG_GROUP_LABEL[selectedGroup] ?? selectedGroup) : 'Toàn công ty'

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.88)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Team Dashboard
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>{groupLabel}</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '16px' }}>
            👥
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 pb-8">

          {/* Group filter (admin/director only) */}
          {isAdmin && (
            <div className="flex gap-2 pt-4 overflow-x-auto pb-1 no-scrollbar">
              {GROUP_FILTERS.map(f => (
                <button
                  key={String(f.key)}
                  onClick={() => setSelectedGroup(f.key)}
                  className="shrink-0 px-3.5 py-1.5 rounded-full font-bold transition-all"
                  style={{
                    fontSize: '11px',
                    background: selectedGroup === f.key ? 'rgba(52,211,153,0.12)' : '#111',
                    border: selectedGroup === f.key ? '1px solid rgba(52,211,153,0.3)' : '1px solid #222',
                    color: selectedGroup === f.key ? '#34d399' : '#686868',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải dữ liệu đội...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '40px' }}>👥</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có thành viên</p>
              <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
                Khối này chưa có nhân viên nào được phê duyệt.
              </p>
            </div>
          ) : (
            <>
              {/* ── KPI Cards ─────────────────────────── */}
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  { icon: '👥', value: kpi?.totalMembers ?? 0,              label: 'Thành viên',     color: '#60a5fa' },
                  { icon: '📊', value: (kpi?.totalScore ?? 0).toLocaleString('vi-VN'), label: 'Tổng điểm', color: '#E94E1B' },
                  { icon: '⚡', value: kpi?.avgScore ?? 0,                   label: 'Điểm TB/người',  color: '#facc15' },
                  { icon: '✅', value: kpi?.totalMissions ?? 0,              label: 'Nhiệm vụ xong',  color: '#34d399' },
                ].map(s => (
                  <div key={s.label}
                       className="rounded-2xl px-3 py-3.5 flex items-center gap-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <span style={{ fontSize: '20px', flexShrink: 0 }}>{s.icon}</span>
                    <div className="min-w-0">
                      <p className="font-black leading-none" style={{ fontSize: '20px', color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: '9px', color: '#585858', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Top performer highlight ────────────── */}
              {kpi?.topMember && (
                <div className="mt-4 rounded-2xl px-4 py-3.5 flex items-center gap-3"
                     style={{ background: 'linear-gradient(135deg, #1a1000 0%, #111 100%)', border: '1px solid rgba(250,204,21,0.2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0"
                       style={{ background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15' }}>
                    {initials(kpi.topMember.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white font-black text-sm truncate">{kpi.topMember.full_name ?? '—'}</p>
                      <span style={{ fontSize: '12px' }}>👑</span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#888', marginTop: 2 }}>
                      {deptLabel(kpi.topMember)} · {getRoleLabel(kpi.topMember.role)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-black" style={{ fontSize: '18px', color: '#facc15', lineHeight: 1 }}>
                      {kpi.topMember.score.toLocaleString('vi-VN')}
                    </p>
                    <p style={{ fontSize: '9px', color: '#585858', marginTop: 2 }}>điểm</p>
                  </div>
                </div>
              )}

              {/* ── Sort controls ────────────────────── */}
              <div className="mt-4 flex items-center justify-between">
                <p className="font-bold text-white" style={{ fontSize: '13px' }}>
                  Thành viên ({members.length})
                </p>
                <div className="flex gap-1">
                  {([
                    { key: 'score',    label: 'Điểm' },
                    { key: 'missions', label: 'NV' },
                    { key: 'games',    label: 'Game' },
                  ] as { key: typeof sortBy; label: string }[]).map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSortBy(s.key)}
                      className="px-2.5 py-1 rounded-lg font-bold transition-all"
                      style={{
                        fontSize: '10px',
                        background: sortBy === s.key ? 'rgba(52,211,153,0.12)' : 'transparent',
                        border: sortBy === s.key ? '1px solid rgba(52,211,153,0.3)' : '1px solid #222',
                        color: sortBy === s.key ? '#34d399' : '#585858',
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Member list ──────────────────────── */}
              <div className="mt-2 flex flex-col gap-2">
                {sortedMembers.map((m, idx) => {
                  const roleBadge = getRoleBadgeStyle(m.role)
                  const rc = rankColor(sortBy === 'score' ? m.rank : idx + 1)
                  const displayRank = sortBy === 'score' ? m.rank : idx + 1

                  return (
                    <div key={m.id}
                         className="rounded-2xl px-3.5 py-3 flex items-center gap-3"
                         style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                      {/* Rank */}
                      <div className="shrink-0 w-8 text-center">
                        <p className="font-black" style={{ fontSize: '14px', color: rc, lineHeight: 1 }}>
                          #{displayRank}
                        </p>
                      </div>

                      {/* Avatar */}
                      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-black"
                           style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color, fontSize: '14px' }}>
                        {initials(m.full_name)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{m.full_name ?? '—'}</p>
                        <p style={{ fontSize: '10px', color: '#585858' }} className="truncate">
                          {deptLabel(m)}
                        </p>
                      </div>

                      {/* Stats column */}
                      <div className="shrink-0 text-right">
                        <p className="font-black" style={{ fontSize: '15px', color: '#E94E1B', lineHeight: 1 }}>
                          {m.score.toLocaleString('vi-VN')}
                        </p>
                        <p style={{ fontSize: '9px', color: '#484848', marginTop: 2 }}>
                          {m.gamePlays}🎮 · {m.missionsDone}✅
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Manager Alerts ───────────────────── */}
              {(() => {
                const zeroScore    = members.filter(m => m.score === 0)
                const inactive     = members.filter(m => m.gamePlays === 0 && m.missionsDone === 0)
                const totalAlerts  = zeroScore.length + inactive.length + oldPendings.length
                if (totalAlerts === 0) return null

                const SECTION: Array<{ icon: string; color: string; label: string; items: Array<{ id: string; name: string; detail: string }> }> = [
                  {
                    icon: '⚠️', color: '#facc15', label: `0 điểm (${zeroScore.length})`,
                    items: zeroScore.map(m => ({ id: m.id, name: m.full_name ?? '—', detail: deptLabel(m) })),
                  },
                  {
                    icon: '😴', color: '#fb923c', label: `Chưa hoạt động (${inactive.length})`,
                    items: inactive.map(m => ({ id: m.id, name: m.full_name ?? '—', detail: deptLabel(m) })),
                  },
                  {
                    icon: '⏰', color: '#f87171', label: `Nhiệm vụ chờ lâu (${oldPendings.length})`,
                    items: oldPendings.map(p => ({ id: p.id, name: p.user_name, detail: `${p.title} · ${p.days}d` })),
                  },
                ].filter(s => s.items.length > 0)

                return (
                  <div className="mt-4 rounded-2xl overflow-hidden"
                       style={{ border: '1px solid rgba(250,204,21,0.2)', background: '#0f0c00' }}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3"
                      onClick={() => setAlertsOpen(v => !v)}>
                      <span style={{ fontSize: '16px' }}>🔔</span>
                      <p className="flex-1 text-left font-bold" style={{ fontSize: '13px', color: '#facc15' }}>
                        Cảnh báo quản lý
                      </p>
                      <span className="rounded-full px-2 py-0.5 font-black"
                            style={{ fontSize: '10px', background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>
                        {totalAlerts}
                      </span>
                      <span style={{ fontSize: '12px', color: '#585858', marginLeft: 4 }}>
                        {alertsOpen ? '▲' : '▼'}
                      </span>
                    </button>

                    {alertsOpen && (
                      <div style={{ borderTop: '1px solid rgba(250,204,21,0.12)' }}>
                        {SECTION.map(sec => (
                          <div key={sec.label} className="px-4 py-3">
                            <p className="font-bold mb-2" style={{ fontSize: '11px', color: sec.color }}>
                              {sec.icon} {sec.label}
                            </p>
                            <div className="flex flex-col gap-1.5">
                              {sec.items.map(item => (
                                <div key={item.id}
                                     className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                                     style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                                  <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black shrink-0"
                                       style={{ background: `${sec.color}22`, color: sec.color, fontSize: '10px' }}>
                                    {item.name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>{item.name}</p>
                                    <p className="truncate" style={{ fontSize: '10px', color: '#585858' }}>{item.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── Game stats footer ─────────────────── */}
              <div className="mt-4 rounded-2xl px-4 py-3.5 grid grid-cols-2 gap-3"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <div className="flex flex-col items-center">
                  <p className="font-black" style={{ fontSize: '20px', color: '#60a5fa' }}>
                    {kpi?.totalGames ?? 0}
                  </p>
                  <p style={{ fontSize: '9px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Lượt chơi game</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-black" style={{ fontSize: '20px', color: '#34d399' }}>
                    {kpi?.totalMissions ?? 0}
                  </p>
                  <p style={{ fontSize: '9px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nhiệm vụ hoàn thành</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
