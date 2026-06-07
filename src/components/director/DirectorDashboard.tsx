import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { canAccessDirectorDashboard } from '../../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface CompanyKPI {
  totalEmployees:   number
  activeEmployees:  number
  totalScore:       number
  avgScore:         number
  totalMissions:    number
  missionsApproved: number
  pendingAccounts:  number
}

interface GroupStat {
  key:     string
  label:   string
  count:   number
  score:   number
  avgScore:number
}

interface TopPerformer {
  id:        string
  full_name: string | null
  score:     number
  org_group: string | null
  office_department: string | null
  role:      string | null
  rank:      number
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

const GROUP_ORDER = ['cua-hang', 'kho', 'van-phong']

const GROUP_COLOR: Record<string, { accent: string; bg: string; border: string }> = {
  'cua-hang':  { accent: '#E94E1B', bg: 'rgba(233,78,27,0.06)',   border: 'rgba(233,78,27,0.2)'  },
  'kho':       { accent: '#34d399', bg: 'rgba(52,211,153,0.06)',  border: 'rgba(52,211,153,0.2)' },
  'van-phong': { accent: '#60a5fa', bg: 'rgba(96,165,250,0.06)',  border: 'rgba(96,165,250,0.2)' },
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────
function getGroupLabel(g: string | null) {
  return g ? (ORG_GROUP_LABEL[g] ?? g) : '—'
}
function getDeptLabel(d: string | null) {
  return d ? (OFFICE_DEPT_LABEL[d] ?? d) : ''
}

// ── Main component ────────────────────────────────────────────
export default function DirectorDashboard({ onClose }: Props) {
  const { currentUser } = useAuth()

  const [kpi,          setKpi]          = useState<CompanyKPI | null>(null)
  const [groupStats,   setGroupStats]   = useState<GroupStat[]>([])
  const [topPerformers,setTopPerformers]= useState<TopPerformer[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  // Quyền truy cập
  if (!canAccessDirectorDashboard(currentUser?.role)) {
    return null
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // 1. Fetch tất cả profiles (approved + active)
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, score, org_group, office_department, role, is_active, account_status')
        .order('score', { ascending: false })

      if (profErr) throw profErr

      const all      = profiles ?? []
      const approved = all.filter((p: Record<string, unknown>) => p.account_status === 'approved' || p.is_active)
      const active   = approved.filter((p: Record<string, unknown>) => p.is_active)

      // 2. Pending accounts
      const { count: pendingCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('account_status', 'pending')

      // 3. Mission stats
      const { count: totalMissions } = await supabase
        .from('mission_submissions')
        .select('id', { count: 'exact', head: true })

      const { count: approvedMissions } = await supabase
        .from('mission_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved')

      // 4. KPI
      const totalScore = active.reduce((s: number, p: Record<string, unknown>) => s + ((p.score as number) ?? 0), 0)
      setKpi({
        totalEmployees:   all.length,
        activeEmployees:  active.length,
        totalScore,
        avgScore:         active.length > 0 ? Math.round(totalScore / active.length) : 0,
        totalMissions:    totalMissions   ?? 0,
        missionsApproved: approvedMissions ?? 0,
        pendingAccounts:  pendingCount     ?? 0,
      })

      // 5. Group stats
      const groupMap: Record<string, { count: number; score: number }> = {}
      for (const g of GROUP_ORDER) groupMap[g] = { count: 0, score: 0 }
      for (const p of active) {
        const g = (p.org_group as string) ?? ''
        if (groupMap[g]) {
          groupMap[g].count++
          groupMap[g].score += (p.score as number) ?? 0
        }
      }
      setGroupStats(GROUP_ORDER.map(key => ({
        key,
        label:    ORG_GROUP_LABEL[key] ?? key,
        count:    groupMap[key].count,
        score:    groupMap[key].score,
        avgScore: groupMap[key].count > 0 ? Math.round(groupMap[key].score / groupMap[key].count) : 0,
      })))

      // 6. Top 5 performers
      const top5 = active.slice(0, 5).map((p: Record<string, unknown>, i: number) => ({
        id:                 p.id as string,
        full_name:          p.full_name as string | null,
        score:              p.score as number,
        org_group:          p.org_group as string | null,
        office_department:  p.office_department as string | null,
        role:               p.role as string | null,
        rank:               i + 1,
      }))
      setTopPerformers(top5)

    } catch (e) {
      console.error('[DirectorDashboard]', e)
      setError('Không thể tải dữ liệu. Kiểm tra kết nối Supabase.')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-white font-black text-base">Director Dashboard</p>
          <p className="text-text-muted text-xs">Tổng quan toàn công ty</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
             style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)' }}>
          <span className="text-lg">👑</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 flex flex-col gap-4">

        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-text-muted text-sm">Đang tải dữ liệu...</p>
          </div>
        )}

        {error && (
          <div className="arena-card border border-red-700/40 bg-red-900/10">
            <p className="text-red-400 text-sm font-semibold">{error}</p>
            <button onClick={() => void loadData()} className="text-xs text-text-muted mt-2 underline">
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && kpi && (
          <>
            {/* ── Cảnh báo ── */}
            {kpi.pendingAccounts > 0 && (
              <div className="arena-card border border-amber-700/40 bg-amber-900/10 flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="text-amber-400 font-bold text-sm">
                    {kpi.pendingAccounts} tài khoản chờ duyệt
                  </p>
                  <p className="text-text-secondary text-xs">Yêu cầu Admin xét duyệt sớm.</p>
                </div>
              </div>
            )}

            {/* ── KPI tổng quan ── */}
            <div>
              <p className="section-title mb-3">📊 Tổng quan công ty</p>
              <div className="grid grid-cols-2 gap-2">
                <KPICard icon="👥" label="Nhân viên active" value={kpi.activeEmployees.toString()} sub={`/ ${kpi.totalEmployees} tổng`} />
                <KPICard icon="🏆" label="Tổng điểm" value={kpi.totalScore.toLocaleString('vi-VN')} sub="toàn công ty" />
                <KPICard icon="📈" label="Điểm trung bình" value={kpi.avgScore.toLocaleString('vi-VN')} sub="mỗi nhân viên" />
                <KPICard icon="✅" label="Nhiệm vụ duyệt" value={kpi.missionsApproved.toString()} sub={`/ ${kpi.totalMissions} nộp`} />
              </div>
            </div>

            {/* ── Breakdown theo khối ── */}
            <div>
              <p className="section-title mb-3">🏢 Hiệu suất theo khối</p>
              <div className="flex flex-col gap-2">
                {groupStats.map(g => {
                  const col = GROUP_COLOR[g.key] ?? GROUP_COLOR['van-phong']
                  return (
                    <div key={g.key}
                         className="arena-card"
                         style={{ background: col.bg, border: `1px solid ${col.border}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-sm" style={{ color: col.accent }}>{g.label}</p>
                        <span className="text-text-muted text-xs">{g.count} người</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-white font-black text-lg">{g.score.toLocaleString('vi-VN')}</p>
                          <p className="text-text-muted text-[10px] uppercase tracking-wide">Tổng điểm</p>
                        </div>
                        <div>
                          <p className="font-black text-lg" style={{ color: col.accent }}>{g.avgScore.toLocaleString('vi-VN')}</p>
                          <p className="text-text-muted text-[10px] uppercase tracking-wide">Trung bình</p>
                        </div>
                      </div>
                      {/* Progress bar tương đối */}
                      {kpi.totalScore > 0 && (
                        <div className="mt-2 h-1.5 rounded-full bg-arena-bg overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.round((g.score / kpi.totalScore) * 100)}%`,
                              background: col.accent,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}

                {groupStats.every(g => g.count === 0) && (
                  <p className="text-text-muted text-sm text-center py-4">Chưa có dữ liệu theo khối.</p>
                )}
              </div>
            </div>

            {/* ── Top performers ── */}
            <div>
              <p className="section-title mb-3">⚡ Top nhân viên toàn công ty</p>
              {topPerformers.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-4">Chưa có dữ liệu.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {topPerformers.map(p => (
                    <TopRow key={p.id} performer={p} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────
function KPICard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div className="arena-card flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <span className="text-base">{icon}</span>
        <p className="text-text-muted text-[10px] uppercase tracking-wide leading-tight">{label}</p>
      </div>
      <p className="text-white font-black text-xl">{value}</p>
      <p className="text-text-muted text-[10px]">{sub}</p>
    </div>
  )
}

function TopRow({ performer: p }: { performer: TopPerformer }) {
  const rankEmoji = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`
  const groupLabel = getGroupLabel(p.org_group)
  const deptLabel  = getDeptLabel(p.office_department)

  return (
    <div className="arena-card flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
        <span className="text-sm font-black">{rankEmoji}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{p.full_name ?? '—'}</p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="badge-gray">{groupLabel}</span>
          {deptLabel && <span className="badge-gray">{deptLabel}</span>}
        </div>
      </div>
      <p className="text-brand font-black text-base shrink-0">{p.score.toLocaleString('vi-VN')}đ</p>
    </div>
  )
}
