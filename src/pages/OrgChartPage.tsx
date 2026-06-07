import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getRoleBadgeStyle } from '../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface OrgMember {
  id:                string
  full_name:         string | null
  title:             string | null
  role:              string | null
  org_group:         string | null
  office_department: string | null
  avatar_initials:   string | null
}

interface GroupSection {
  key:        string
  label:      string
  icon:       string
  color:      string
  bg:         string
  border:     string
  members:    OrgMember[]
  subGroups?: SubGroup[]
}

interface SubGroup {
  key:     string
  label:   string
  members: OrgMember[]
}

// ── Label maps ────────────────────────────────────────────────
const OFFICE_DEPT_LABEL: Record<string, string> = {
  'tmdt':               'TMĐT',
  'kdtt':               'KDTT',
  'mua-hang':           'Mua hàng',
  'ke-toan':            'Kế toán',
  'hanh-chinh-nhan-su': 'HC Nhân sự',
  'marketing':          'Marketing',
  'giam-doc':           'Giám đốc',
}
const OFFICE_DEPT_ORDER = ['giam-doc', 'kdtt', 'tmdt', 'marketing', 'mua-hang', 'ke-toan', 'hanh-chinh-nhan-su']

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────
export default function OrgChartPage({ onClose }: Props) {
  const [groups,   setGroups]   = useState<GroupSection[]>([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'cua-hang':  true,
    'kho':       true,
    'van-phong': true,
  })

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, title, role, org_group, office_department, avatar_initials')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    const members = (data ?? []) as OrgMember[]

    const cua  = members.filter(m => m.org_group === 'cua-hang')
    const kho  = members.filter(m => m.org_group === 'kho')
    const vp   = members.filter(m => m.org_group === 'van-phong')
    const other= members.filter(m => !m.org_group || !['cua-hang','kho','van-phong'].includes(m.org_group))

    // Văn phòng → chia theo office_department
    const vpSubGroups: SubGroup[] = OFFICE_DEPT_ORDER
      .map(key => ({
        key,
        label:   OFFICE_DEPT_LABEL[key] ?? key,
        members: vp.filter(m => m.office_department === key),
      }))
      .filter(sg => sg.members.length > 0)

    // Các thành viên VP không có office_department
    const vpNoSub = vp.filter(m => !m.office_department)
    if (vpNoSub.length > 0) {
      vpSubGroups.push({ key: 'other', label: 'Khác', members: vpNoSub })
    }

    const built: GroupSection[] = [
      {
        key: 'cua-hang', label: 'Cửa hàng', icon: '🏪',
        color: '#E94E1B', bg: 'rgba(233,78,27,0.05)', border: 'rgba(233,78,27,0.18)',
        members: cua,
      },
      {
        key: 'kho', label: 'Kho', icon: '📦',
        color: '#34d399', bg: 'rgba(52,211,153,0.05)', border: 'rgba(52,211,153,0.18)',
        members: kho,
      },
      {
        key: 'van-phong', label: 'Văn phòng', icon: '🏢',
        color: '#60a5fa', bg: 'rgba(96,165,250,0.05)', border: 'rgba(96,165,250,0.18)',
        members: vp,
        subGroups: vpSubGroups,
      },
    ]

    if (other.length > 0) {
      built.push({
        key: 'other', label: 'Khác', icon: '👤',
        color: '#888', bg: 'rgba(128,128,128,0.05)', border: 'rgba(128,128,128,0.15)',
        members: other,
      })
    }

    setGroups(built)
    setLoading(false)
  }

  function toggle(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[95] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-white font-black text-base">Sơ đồ tổ chức</p>
          <p className="text-text-muted text-xs">
            {loading ? '...' : `${groups.reduce((s,g)=>s+g.members.length,0)} nhân viên · ${groups.filter(g=>g.members.length>0).length} khối`}
          </p>
        </div>
        <span className="text-xl">🏗️</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading && (
          <p className="text-text-muted text-sm text-center py-12">Đang tải sơ đồ...</p>
        )}

        {!loading && groups.filter(g => g.members.length > 0).length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-2">🏗️</p>
            <p className="text-text-muted text-sm">Chưa có dữ liệu nhân sự.</p>
          </div>
        )}

        {!loading && groups.filter(g => g.members.length > 0).map(group => (
          <div key={group.key}
               className="rounded-2xl overflow-hidden"
               style={{ background: group.bg, border: `1px solid ${group.border}` }}>

            {/* Group header — toggle */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => toggle(group.key)}
            >
              <span className="text-xl">{group.icon}</span>
              <p className="flex-1 font-black text-sm" style={{ color: group.color }}>{group.label}</p>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${group.color}18`, color: group.color }}>
                {group.members.length} người
              </span>
              <span className="text-text-muted text-xs">{expanded[group.key] ? '▲' : '▼'}</span>
            </button>

            {/* Group body */}
            {expanded[group.key] && (
              <div className="border-t" style={{ borderColor: group.border }}>
                {/* Văn phòng: render theo sub-departments */}
                {group.subGroups && group.subGroups.length > 0 ? (
                  group.subGroups.map(sg => (
                    <div key={sg.key}>
                      <p className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider"
                         style={{ color: group.color, background: `${group.color}08`, borderBottom: `1px solid ${group.border}` }}>
                        {sg.label} · {sg.members.length} người
                      </p>
                      {sg.members.map((m, i) => (
                        <MemberRow key={m.id} member={m} isLast={i === sg.members.length - 1} borderColor={group.border} />
                      ))}
                    </div>
                  ))
                ) : (
                  /* Cửa hàng / Kho: flat list */
                  group.members.map((m, i) => (
                    <MemberRow key={m.id} member={m} isLast={i === group.members.length - 1} borderColor={group.border} />
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        <div className="h-4" />
      </div>
    </div>
  )
}

// ── Member Row ─────────────────────────────────────────────────
function MemberRow({ member: m, isLast, borderColor }: {
  member:      OrgMember
  isLast:      boolean
  borderColor: string
}) {
  const initials   = m.avatar_initials ?? (m.full_name?.slice(0,2).toUpperCase() ?? '?')
  const roleBadge  = getRoleBadgeStyle(m.role)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5"
         style={{ borderBottom: isLast ? 'none' : `1px solid ${borderColor}` }}>
      <div className="w-8 h-8 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
        <span className="text-white font-black text-xs">{initials}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{m.full_name ?? '—'}</p>
        {m.title && <p className="text-text-muted text-[10px] truncate">{m.title}</p>}
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color }}>
        {m.role ?? 'employee'}
      </span>
    </div>
  )
}
