import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { getRoleLabel, getRoleBadgeStyle } from '../lib/permissions'
import OrgChartPage from './OrgChartPage'

// ── Types ─────────────────────────────────────────────────────
interface DirectoryEntry {
  id:                string
  full_name:         string | null
  title:             string | null
  role:              string | null
  org_group:         string | null
  office_department: string | null
  avatar_initials:   string | null
  score:             number
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

const GROUP_FILTERS = [
  { key: '',           label: 'Tất cả'    },
  { key: 'cua-hang',   label: 'Cửa hàng'  },
  { key: 'kho',        label: 'Kho'       },
  { key: 'van-phong',  label: 'Văn phòng' },
]

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────
export default function DirectoryPage({ onClose }: Props) {
  const [entries,     setEntries]     = useState<DirectoryEntry[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [search,      setSearch]      = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [showOrgChart,setShowOrgChart]= useState(false)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, full_name, title, role, org_group, office_department, avatar_initials, score')
      .eq('account_status', 'approved')
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (err) {
      // Fallback: thử không filter account_status (schema cũ có thể chưa có cột đó)
      const { data: data2 } = await supabase
        .from('profiles')
        .select('id, full_name, title, role, org_group, office_department, avatar_initials, score')
        .eq('is_active', true)
        .order('full_name', { ascending: true })
      setEntries((data2 ?? []) as DirectoryEntry[])
    } else {
      setEntries((data ?? []) as DirectoryEntry[])
    }
    setLoading(false)
  }

  // Filter + search (client-side)
  const filtered = useMemo(() => {
    let list = entries
    if (groupFilter) list = list.filter(e => e.org_group === groupFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(e =>
        (e.full_name ?? '').toLowerCase().includes(q) ||
        (e.title ?? '').toLowerCase().includes(q) ||
        (ORG_GROUP_LABEL[e.org_group ?? ''] ?? '').toLowerCase().includes(q) ||
        (OFFICE_DEPT_LABEL[e.office_department ?? ''] ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [entries, search, groupFilter])

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b border-arena-border">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95"
        >
          ←
        </button>
        <div className="flex-1">
          <p className="text-white font-black text-base">Danh bạ nội bộ</p>
          <p className="text-text-muted text-xs">{loading ? '...' : `${filtered.length} nhân viên`}</p>
        </div>
        <button
          onClick={() => setShowOrgChart(true)}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center active:scale-95"
          title="Sơ đồ tổ chức"
        >
          <span className="text-base">🏗️</span>
        </button>
      </div>

      {showOrgChart && <OrgChartPage onClose={() => setShowOrgChart(false)} />}

      {/* Search + filter */}
      <div className="px-4 py-3 flex flex-col gap-2 border-b border-arena-border">
        {/* Search input */}
        <input
          type="text"
          placeholder="Tìm tên, bộ phận..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-text-muted"
        />
        {/* Group filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {GROUP_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setGroupFilter(f.key)}
              className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={groupFilter === f.key
                ? { background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.4)', color: '#E94E1B' }
                : { background: '#111', border: '1px solid #1f1f1f', color: '#666' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {loading && (
          <p className="text-text-muted text-sm text-center py-12">Đang tải danh bạ...</p>
        )}

        {!loading && error && (
          <div className="arena-card border border-red-700/30 text-center py-6">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={() => void load()} className="text-text-muted text-xs mt-2 underline">Thử lại</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16">
            <span className="text-4xl">🔍</span>
            <p className="text-text-muted text-sm">
              {search || groupFilter ? 'Không tìm thấy kết quả.' : 'Chưa có nhân viên nào.'}
            </p>
          </div>
        )}

        {!loading && filtered.map(e => <EmployeeCard key={e.id} entry={e} />)}
      </div>
    </div>
  )
}

// ── Employee Card ─────────────────────────────────────────────
function EmployeeCard({ entry: e }: { entry: DirectoryEntry }) {
  const roleLabel = getRoleLabel(e.role)
  const roleBadge = getRoleBadgeStyle(e.role)
  const groupLabel = e.org_group ? (ORG_GROUP_LABEL[e.org_group] ?? e.org_group) : null
  const deptLabel  = e.office_department ? (OFFICE_DEPT_LABEL[e.office_department] ?? e.office_department) : null
  const initials   = e.avatar_initials ?? (e.full_name?.slice(0, 2).toUpperCase() ?? '?')

  return (
    <div className="arena-card flex items-center gap-3">
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
        <span className="text-white font-black text-sm">{initials}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{e.full_name ?? '—'}</p>
        {e.title && <p className="text-text-secondary text-xs truncate">{e.title}</p>}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color }}
          >
            {roleLabel}
          </span>
          {groupLabel && <span className="badge-gray">{groupLabel}</span>}
          {deptLabel  && <span className="badge-gray">{deptLabel}</span>}
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="text-brand font-black text-sm">{e.score.toLocaleString('vi-VN')}</p>
        <p className="text-text-muted text-[10px]">điểm</p>
      </div>
    </div>
  )
}
