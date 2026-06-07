import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface WeeklyStats {
  totalScore:      number
  newMissions:     number
  newGames:        number
  newCheckins:     number
  activeMembers:   number
  totalMembers:    number
  topMembers:      Array<{ id: string; name: string; score: number; delta: number }>
  zeroMembers:     Array<{ id: string; name: string; dept: string }>
  pendingCount:    number
}

interface ActionItem {
  icon:  string
  color: string
  text:  string
}

function isoWeekStart() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export default function ExecutiveSummaryPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const canView = canAccessAdminPanel(currentUser?.role)

  const [stats,   setStats]   = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const weekStart = isoWeekStart()

  useEffect(() => {
    if (!canView) { setLoading(false); return }
    void fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // 1. All active profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, score, org_group, office_department, is_active')
      .eq('is_active', true)

    const allMembers = profiles ?? []
    const totalMembers = allMembers.length
    const activeMembers = allMembers.filter(p => (p.score ?? 0) > 0).length
    const totalScore = allMembers.reduce((s, p) => s + (p.score ?? 0), 0)
    const zeroMembers = allMembers
      .filter(p => (p.score ?? 0) === 0)
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.full_name ?? '—',
        dept: p.org_group ?? '—',
      }))

    // 2. Top members by score
    const topMembers = [...allMembers]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5)
      .map(p => ({ id: p.id, name: p.full_name ?? '—', score: p.score ?? 0, delta: 0 }))

    // 3. New missions this week
    const { count: newMissions } = await supabase
      .from('mission_submissions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart)

    // 4. New game plays this week
    const { count: newGames } = await supabase
      .from('game_results')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart)

    // 5. Check-ins this week
    const { count: newCheckins } = await supabase
      .from('daily_checkins')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekStart)

    // 6. Pending missions
    const { count: pendingCount } = await supabase
      .from('mission_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    setStats({
      totalScore,
      newMissions:   newMissions ?? 0,
      newGames:      newGames ?? 0,
      newCheckins:   newCheckins ?? 0,
      activeMembers,
      totalMembers,
      topMembers,
      zeroMembers,
      pendingCount:  pendingCount ?? 0,
    })
    setLoading(false)
  }

  // Derive suggested action items
  function buildActions(s: WeeklyStats): ActionItem[] {
    const actions: ActionItem[] = []
    const activeRate = s.totalMembers > 0 ? (s.activeMembers / s.totalMembers) * 100 : 0

    if (activeRate < 60)
      actions.push({ icon: '📣', color: '#f87171', text: `Chỉ ${Math.round(activeRate)}% thành viên đang hoạt động — cần nhắc nhở tham gia.` })
    if (s.pendingCount > 5)
      actions.push({ icon: '⏰', color: '#facc15', text: `${s.pendingCount} nhiệm vụ đang chờ duyệt — xem xét phân quyền duyệt nhanh hơn.` })
    if (s.newMissions === 0)
      actions.push({ icon: '🎯', color: '#fb923c', text: 'Không có nhiệm vụ mới trong tuần — kiểm tra lại nhiệm vụ đang mở.' })
    if (s.zeroMembers.length > 0)
      actions.push({ icon: '💬', color: '#c084fc', text: `${s.zeroMembers.length} thành viên chưa có điểm — cần trao đổi trực tiếp.` })
    if (actions.length === 0)
      actions.push({ icon: '✅', color: '#34d399', text: 'Mọi chỉ số tuần này đều ổn. Tiếp tục duy trì!' })

    return actions
  }

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
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Báo cáo tuần
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>7 ngày qua · Chỉ dành cho Admin/Giám đốc</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', fontSize: '16px' }}>
            📋
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {!canView ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '40px' }}>🔒</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Không có quyền truy cập</p>
              <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
                Tính năng này chỉ dành cho Admin và Giám đốc.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tổng hợp dữ liệu...</p>
            </div>
          ) : stats ? (
            <>
              {/* ── Week activity cards ── */}
              <p className="font-bold text-white mt-5 mb-2.5" style={{ fontSize: '13px' }}>Hoạt động trong tuần</p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: '✅', value: stats.newMissions,  label: 'Nhiệm vụ nộp',   color: '#34d399' },
                  { icon: '🎮', value: stats.newGames,      label: 'Lượt chơi game', color: '#60a5fa' },
                  { icon: '📅', value: stats.newCheckins,   label: 'Check-in',       color: '#facc15' },
                  { icon: '⏳', value: stats.pendingCount,  label: 'Chờ duyệt',      color: '#fb923c' },
                ].map(c => (
                  <div key={c.label}
                       className="rounded-2xl px-3 py-3.5 flex items-center gap-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{c.icon}</span>
                    <div>
                      <p className="font-black leading-none" style={{ fontSize: '22px', color: c.color }}>{c.value}</p>
                      <p style={{ fontSize: '9px', color: '#585858', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Participation summary ── */}
              <div className="mt-3 rounded-2xl px-4 py-3.5 flex items-center gap-4"
                   style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                <div className="flex-1 text-center">
                  <p className="font-black" style={{ fontSize: '22px', color: '#E94E1B' }}>
                    {stats.totalScore.toLocaleString('vi-VN')}
                  </p>
                  <p style={{ fontSize: '9px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>
                    Tổng điểm toàn công ty
                  </p>
                </div>
                <div style={{ width: 1, height: 36, background: '#1f1f1f' }} />
                <div className="flex-1 text-center">
                  <p className="font-black" style={{ fontSize: '22px', color: '#34d399' }}>
                    {stats.activeMembers}<span style={{ color: '#484848', fontSize: '14px' }}>/{stats.totalMembers}</span>
                  </p>
                  <p style={{ fontSize: '9px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>
                    Thành viên hoạt động
                  </p>
                </div>
              </div>

              {/* ── Top 5 members ── */}
              <p className="font-bold text-white mt-5 mb-2.5" style={{ fontSize: '13px' }}>Top thành viên</p>
              <div className="flex flex-col gap-2">
                {stats.topMembers.map((m, i) => (
                  <div key={m.id}
                       className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <p className="font-black shrink-0" style={{ fontSize: '13px', width: 24,
                        color: i === 0 ? '#facc15' : i === 1 ? '#9ca3af' : i === 2 ? '#d97706' : '#484848' }}>
                      #{i + 1}
                    </p>
                    <p className="flex-1 text-white font-semibold truncate" style={{ fontSize: '13px' }}>{m.name}</p>
                    <p className="font-black shrink-0" style={{ fontSize: '14px', color: '#E94E1B' }}>
                      {m.score.toLocaleString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── Members with 0 score ── */}
              {stats.zeroMembers.length > 0 && (
                <>
                  <p className="font-bold mt-5 mb-2.5" style={{ fontSize: '13px', color: '#f87171' }}>
                    ⚠️ Thành viên chưa tham gia ({stats.zeroMembers.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {stats.zeroMembers.map(m => (
                      <div key={m.id}
                           className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                           style={{ background: '#110000', border: '1px solid rgba(248,113,113,0.15)' }}>
                        <span style={{ fontSize: '14px' }}>😶</span>
                        <p className="flex-1 text-white font-semibold truncate" style={{ fontSize: '13px' }}>{m.name}</p>
                        <p style={{ fontSize: '10px', color: '#585858' }}>{m.dept}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Action items ── */}
              <p className="font-bold text-white mt-5 mb-2.5" style={{ fontSize: '13px' }}>Đề xuất hành động</p>
              <div className="flex flex-col gap-2 mb-4">
                {buildActions(stats).map((a, i) => (
                  <div key={i}
                       className="rounded-xl px-3.5 py-3 flex items-start gap-3"
                       style={{ background: '#111', border: `1px solid ${a.color}22` }}>
                    <span style={{ fontSize: '16px', flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                    <p style={{ fontSize: '12px', color: '#ccc', lineHeight: 1.5 }}>{a.text}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
