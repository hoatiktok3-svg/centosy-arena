import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { canAccessAdminPanel, canApproveAccounts, getRoleLabel, getRoleBadgeStyle } from '../../lib/permissions'
import FeedbackList from '../feedback/FeedbackList'

interface AdminPanelProps {
  onClose: () => void
}

interface ProfileRow {
  id:             string
  full_name:      string
  email:          string
  department:     string
  org_group:      string | null
  role:           'admin' | 'staff'
  score:          number
  is_active:      boolean
  title:          string | null
  account_status: string | null
}

interface PendingRow {
  id:                string
  full_name:         string
  email:             string
  phone:             string | null
  org_group:         string | null
  office_department: string | null
  registration_note: string | null
  created_at:        string
}

// Per-user game aggregate fetched from game_results
interface GameStat {
  totalScore: number
  plays:      number
}

const DEPT_LABEL: Record<string, string> = {
  'van-phong': 'Văn phòng',
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'tmdt':      'TMĐT',
  'kdtt':      'KDTT',
}
const DEPT_KEYS = Object.keys(DEPT_LABEL)

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
  'hanh-chinh-nhan-su': 'HC nhân sự',
  'marketing':          'Marketing',
  'giam-doc':           'Giám đốc',
}

const POINT_RULES = [
  { action: 'Hoàn thành game',      points: '+25 – 125 đ' },
  { action: 'Trả lời dưới 10 giây', points: '+5 đ'        },
  { action: 'Đăng nhập mỗi ngày',   points: '+10 đ'       },
  { action: 'Được vinh danh',        points: '+50 đ'       },
  { action: 'Tham gia chiến dịch',   points: '+30 đ'       },
]

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)
  const canApprove = canApproveAccounts(currentUser?.role)

  const [profiles,       setProfiles]       = useState<ProfileRow[]>([])
  const [gameStats,      setGameStats]      = useState<Record<string, GameStat>>({})
  const [loadError,      setLoadError]      = useState<string | null>(null)
  const [gameStatsNote,  setGameStatsNote]  = useState<string | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [filterDept,     setFilterDept]     = useState<string>('all')

  // Pending approval queue
  const [pendingList,    setPendingList]    = useState<PendingRow[]>([])
  const [actionLoading,  setActionLoading]  = useState<string | null>(null)  // id đang xử lý
  const [rejectTarget,   setRejectTarget]   = useState<string | null>(null)  // id đang mở reject form
  const [rejectReason,   setRejectReason]   = useState('')
  const [approveRole,    setApproveRole]    = useState<Record<string, string>>({})  // id → role được assign
  const [statusTarget,   setStatusTarget]   = useState<string | null>(null)  // id đang mở status sheet
  const [statusLoading,  setStatusLoading]  = useState<string | null>(null)
  const [statusNote,     setStatusNote]     = useState('')

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return }

    async function fetchAll() {
      setLoading(true)
      setLoadError(null)
      setGameStatsNote(null)

      // ── 1. Profiles ──────────────────────────────────────
      const { data: pData, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, org_group, role, score, is_active, title, account_status')
        .order('full_name', { ascending: true })

      if (pErr) {
        setLoadError('Không tải được danh sách nhân sự. Kiểm tra quyền RLS hoặc role admin.')
        setLoading(false)
        return
      }
      setProfiles((pData ?? []) as ProfileRow[])

      // ── 2. Pending accounts ───────────────────────────────
      const { data: pendData } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, org_group, office_department, registration_note, created_at')
        .eq('account_status', 'pending')
        .order('created_at', { ascending: true })

      setPendingList((pendData ?? []) as PendingRow[])

      // ── 3. Game results (admin có policy xem all) ────────
      const { data: gData, error: gErr } = await supabase
        .from('game_results')
        .select('user_id, score')

      if (gErr) {
        console.warn('[AdminPanel] Không tải được game_results:', gErr.message)
        setGameStatsNote('Chưa tải được dữ liệu lượt chơi.')
      } else {
        // Aggregate JS-side
        const agg: Record<string, GameStat> = {}
        for (const r of (gData ?? [])) {
          if (!agg[r.user_id]) agg[r.user_id] = { totalScore: 0, plays: 0 }
          agg[r.user_id].totalScore += r.score
          agg[r.user_id].plays     += 1
        }
        setGameStats(agg)
      }

      setLoading(false)
    }

    fetchAll()
  }, [isAdmin])

  // ── Approve / Reject ──────────────────────────────────
  async function handleApprove(id: string) {
    setActionLoading(id)
    const roleToAssign = (approveRole[id] === 'admin' ? 'admin' : 'staff') as 'admin' | 'staff'
    const { error } = await supabase
      .from('profiles')
      .update({
        account_status: 'approved',
        is_active:      true,
        role:           roleToAssign,
        approved_by:    currentUser?.id ?? null,
        approved_at:    new Date().toISOString(),
      })
      .eq('id', id)
    if (!error) {
      setPendingList(prev => prev.filter(p => p.id !== id))
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, account_status: 'approved', is_active: true, role: roleToAssign } : p))
    }
    setActionLoading(null)
  }

  async function handleReject(id: string) {
    if (!rejectReason.trim()) return
    setActionLoading(id)
    const { error } = await supabase
      .from('profiles')
      .update({
        account_status:  'rejected',
        is_active:       false,
        rejected_reason: rejectReason.trim(),
      })
      .eq('id', id)
    if (!error) {
      setPendingList(prev => prev.filter(p => p.id !== id))
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, account_status: 'rejected', is_active: false } : p))
    }
    setActionLoading(null)
    setRejectTarget(null)
    setRejectReason('')
  }

  // ── Guard ──────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-arena-bg z-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-white font-bold text-lg mb-2">Không có quyền truy cập</p>
          <p className="text-text-secondary text-sm mb-6">Bạn không có quyền truy cập khu vực này.</p>
          <button onClick={onClose} className="btn-secondary">Quay lại</button>
        </div>
      </div>
    )
  }

  // ── KPI aggregates ─────────────────────────────────────
  const totalProfiles  = profiles.length
  const totalAdmin     = profiles.filter(p => p.role === 'admin').length
  const totalDirector  = profiles.filter(p => (p.role as string) === 'director').length
  const totalManager   = profiles.filter(p => (p.role as string) === 'manager').length
  const totalStaff     = profiles.filter(p => p.role === 'staff' || (p.role as string) === 'employee').length
  const totalActive    = profiles.filter(p => p.is_active !== false && p.account_status !== 'pending' && p.account_status !== 'rejected').length
  const totalPending   = pendingList.length
  const hasPlayedIds   = new Set(Object.keys(gameStats))
  const totalPlayers   = hasPlayedIds.size
  const totalPlays     = Object.values(gameStats).reduce((s, g) => s + g.plays, 0)

  const filtered = filterDept === 'all'
    ? profiles
    : profiles.filter(p => p.department === filterDept || p.org_group === filterDept)

  // ── Status helper ──────────────────────────────────────
  function getStatus(p: ProfileRow): { label: string; color: string; bg: string } {
    if (p.account_status === 'pending') {
      return { label: '⏳ Chờ duyệt', color: '#E9A21B', bg: 'rgba(233,162,27,0.1)' }
    }
    if (p.account_status === 'rejected') {
      return { label: '✕ Từ chối', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    }
    if (p.account_status === 'resigned') {
      return { label: 'Nghỉ việc', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
    }
    if (p.is_active === false || p.account_status === 'inactive') {
      return { label: '🔒 Tạm khóa', color: '#888', bg: 'rgba(255,255,255,0.06)' }
    }
    if (hasPlayedIds.has(p.id)) {
      return { label: 'Đã chơi', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
    }
    return { label: 'Chưa chơi', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
  }

  // ── KPI card data ──────────────────────────────────────
  const kpiCards = [
    { label: 'Tổng tài khoản', value: loading ? '…' : totalProfiles, sub: `${totalAdmin} admin · ${totalManager} quản lý · ${totalStaff} nhân viên`, color: '#60a5fa' },
    { label: '⏳ Chờ duyệt',   value: loading ? '…' : totalPending,  sub: totalPending > 0 ? 'Cần xem xét ngay' : 'Không có tài khoản chờ',          color: totalPending > 0 ? '#E9A21B' : '#555' },
    { label: 'Đã chơi game',   value: loading ? '…' : totalPlayers,  sub: `${totalProfiles - totalPlayers} chưa tham gia`,                            color: '#E94E1B' },
    { label: 'Tổng lượt chơi', value: loading ? '…' : totalPlays,    sub: gameStatsNote ?? 'Tất cả game',                                              color: '#facc15' },
  ]

  return (
    <div className="fixed inset-0 bg-arena-bg z-50 overflow-y-auto">
      <div className="max-w-[430px] mx-auto px-4 pb-10">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-5 border-b border-arena-border mb-5">
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary hover:text-white transition-colors">
            ←
          </button>
          <div>
            <p className="text-white font-black text-lg">Admin Panel</p>
            <p className="text-text-muted text-xs">Centosy Arena · Quản trị viên</p>
          </div>
          <span className="ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
            ADMIN
          </span>
        </div>

        {/* ── KPI cards (2×2 grid) ───────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {kpiCards.map(card => (
            <div key={card.label}
                 className="rounded-2xl p-4"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <p className="font-black text-white" style={{ fontSize: '28px', lineHeight: 1, color: card.color }}>
                {card.value}
              </p>
              <p style={{ fontSize: '12px', color: '#e0e0e0', fontWeight: 700, marginTop: 4 }}>{card.label}</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: 2, lineHeight: 1.5 }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tài khoản chờ duyệt ──────────────────────── */}
        {!loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">🕐 Tài khoản chờ duyệt</p>
              <span style={{ fontSize: '11px', fontWeight: 700,
                color: pendingList.length > 0 ? '#E9A21B' : '#555',
                background: pendingList.length > 0 ? 'rgba(233,162,27,0.15)' : 'rgba(255,255,255,0.05)',
                padding: '2px 8px', borderRadius: 99 }}>
                {pendingList.length > 0 ? `${pendingList.length} đang chờ` : 'Không có'}
              </span>
            </div>

            {pendingList.length === 0 ? (
              <div className="rounded-2xl px-4 py-6 text-center"
                   style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '24px', marginBottom: 8 }}>✅</p>
                <p style={{ fontSize: '13px', color: '#555' }}>Không có tài khoản nào đang chờ duyệt.</p>
                <p style={{ fontSize: '11px', color: '#3a3a3a', marginTop: 4 }}>
                  Khi nhân viên đăng ký mới, họ sẽ xuất hiện ở đây.
                </p>
              </div>
            ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0E0E0E', border: '1px solid #2a1f00' }}>
              {pendingList.map((p, i) => {
                const isProcessing = actionLoading === p.id
                const isRejectOpen = rejectTarget === p.id
                const deptLabel = p.org_group === 'van-phong' && p.office_department
                  ? `${ORG_GROUP_LABEL[p.org_group] ?? p.org_group} · ${OFFICE_DEPT_LABEL[p.office_department] ?? p.office_department}`
                  : (ORG_GROUP_LABEL[p.org_group ?? ''] ?? p.org_group ?? '—')
                const dateStr = p.created_at
                  ? new Date(p.created_at).toLocaleDateString('vi-VN')
                  : ''

                return (
                  <div key={p.id} style={{ borderBottom: i < pendingList.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                    <div className="flex items-start gap-3 px-4 py-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black"
                           style={{ background: 'rgba(233,162,27,0.1)', border: '1px solid rgba(233,162,27,0.25)', fontSize: '13px', color: '#E9A21B' }}>
                        {p.full_name.split(' ').slice(-2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 700 }} className="truncate">{p.full_name}</p>
                        <p style={{ fontSize: '11px', color: '#555' }} className="truncate">{p.email}</p>
                        {p.phone && (
                          <p style={{ fontSize: '11px', color: '#555' }}>{p.phone}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span style={{ fontSize: '10px', color: '#E9A21B', background: 'rgba(233,162,27,0.1)', padding: '1px 7px', borderRadius: 99 }}>
                            {deptLabel}
                          </span>
                          {dateStr && (
                            <span style={{ fontSize: '10px', color: '#444' }}>{dateStr}</span>
                          )}
                        </div>
                        {p.registration_note && (
                          <p style={{ fontSize: '11px', color: '#666', marginTop: 3, fontStyle: 'italic' }}>
                            "{p.registration_note}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reject reason input */}
                    {isRejectOpen && (
                      <div className="px-4 pb-3">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Lý do từ chối (bắt buộc)"
                          className="w-full bg-arena-bg border border-red-700/40 rounded-xl px-3 py-2 text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-red-500 mb-2"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReject(p.id)}
                            disabled={isProcessing || !rejectReason.trim()}
                            className="flex-1 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-40 active:scale-95 transition-transform"
                            style={{ background: '#E94E1B', color: '#fff' }}
                          >
                            {isProcessing ? '...' : 'Xác nhận từ chối'}
                          </button>
                          <button
                            onClick={() => { setRejectTarget(null); setRejectReason('') }}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase border border-arena-border text-text-secondary active:scale-95 transition-transform"
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Role assign dropdown (chỉ admin mới thấy) */}
                    {!isRejectOpen && canApprove && (
                      <div className="px-4 pb-2">
                        <select
                          value={approveRole[p.id] || 'staff'}
                          onChange={e => setApproveRole(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-full bg-arena-bg border border-arena-border rounded-lg px-3 py-2 text-text-secondary text-xs focus:outline-none focus:border-brand"
                        >
                          <option value="staff">Nhân viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                    )}

                    {/* Action buttons */}
                    {!isRejectOpen && (
                      <div className="flex gap-2 px-4 pb-3">
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase disabled:opacity-40 active:scale-95 transition-transform"
                          style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}
                        >
                          {isProcessing ? '...' : '✓ Duyệt'}
                        </button>
                        <button
                          onClick={() => { setRejectTarget(p.id); setRejectReason('') }}
                          disabled={isProcessing}
                          className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase disabled:opacity-40 active:scale-95 transition-transform"
                          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
                        >
                          ✕ Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            )}
          </div>
        )}

        {/* ── Danh sách nhân sự ─────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Danh sách nhân sự</p>
            {!loading && !loadError && (
              <span className="badge-gray">{filtered.length} người</span>
            )}
          </div>

          {/* Filter khối */}
          {!loading && !loadError && profiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-0 no-scrollbar mb-3">
              <button
                onClick={() => setFilterDept('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${filterDept === 'all' ? 'bg-brand text-white' : 'bg-arena-card border border-arena-border text-text-secondary'}`}>
                Tất cả
              </button>
              {DEPT_KEYS.map(k => (
                <button key={k} onClick={() => setFilterDept(k)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${filterDept === k ? 'bg-brand text-white' : 'bg-arena-card border border-arena-border text-text-secondary'}`}>
                  {DEPT_LABEL[k]}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl py-10 flex flex-col items-center gap-3"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E94E1B', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
            </div>
          )}

          {/* Lỗi */}
          {!loading && loadError && (
            <div className="rounded-2xl px-4 py-4"
                 style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Lỗi tải dữ liệu</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{loadError}</p>
            </div>
          )}

          {/* Danh sách */}
          {!loading && !loadError && (
            filtered.length === 0 ? (
              <div className="rounded-2xl py-8 text-center"
                   style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '13px', color: '#555' }}>Không có nhân sự trong khối này.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden"
                   style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                {filtered.map((p, i) => {
                  const gs     = gameStats[p.id]
                  const status = getStatus(p)
                  return (
                    <div key={p.id}
                         className="flex items-center gap-3 px-4 py-3"
                         style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none' }}>

                      {/* Avatar initials */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black"
                           style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: '13px', color: '#888' }}>
                        {p.full_name.split(' ').slice(-2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 700 }}
                             className="truncate">
                            {p.full_name}
                          </p>
                          {(p.role as string) !== 'employee' && p.role !== 'staff' && (() => {
                            const s = getRoleBadgeStyle(p.role)
                            return (
                              <span style={{ fontSize: '9px', fontWeight: 900, color: s.color, background: s.bg, border: `1px solid ${s.border}`, padding: '2px 6px', borderRadius: 99 }}>
                                {getRoleLabel(p.role).toUpperCase()}
                              </span>
                            )
                          })()}
                        </div>
                        <p style={{ fontSize: '11px', color: '#555' }} className="truncate">{p.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span style={{ fontSize: '10px', color: '#484848' }}>
                            {DEPT_LABEL[p.department] ?? p.department}
                          </span>
                          {/* Status badge */}
                          <span style={{ fontSize: '10px', fontWeight: 600, color: status.color, background: status.bg, padding: '1px 7px', borderRadius: 99 }}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Score + action */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        {gs ? (
                          <>
                            <p style={{ fontSize: '14px', fontWeight: 900, color: '#E94E1B' }}>
                              {gs.totalScore.toLocaleString('vi-VN')}
                            </p>
                            <p style={{ fontSize: '10px', color: '#484848' }}>
                              {gs.plays} lượt
                            </p>
                          </>
                        ) : (
                          <p style={{ fontSize: '10px', color: '#3a3a3a' }}>0 đ</p>
                        )}
                        {/* Quick action buttons */}
                        {p.role !== 'admin' && (
                          <div className="flex gap-1 mt-1">
                            {p.is_active ? (
                              <button
                                onClick={async () => {
                                  setStatusLoading(p.id)
                                  await supabase.rpc('admin_set_user_status', { p_user_id: p.id, p_status: 'inactive' })
                                  setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, is_active: false, account_status: 'inactive' } : x))
                                  setStatusLoading(null)
                                }}
                                disabled={statusLoading === p.id}
                                style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 6, background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.3)', color: '#9ca3af' }}>
                                {statusLoading === p.id ? '...' : '🔒'}
                              </button>
                            ) : (
                              <button
                                onClick={async () => {
                                  setStatusLoading(p.id)
                                  await supabase.rpc('admin_set_user_status', { p_user_id: p.id, p_status: 'approved' })
                                  setProfiles(prev => prev.map(x => x.id === p.id ? { ...x, is_active: true, account_status: 'approved' } : x))
                                  setStatusLoading(null)
                                }}
                                disabled={statusLoading === p.id}
                                style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 6, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}>
                                {statusLoading === p.id ? '...' : '✓'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Note nếu game_results không tải được */}
          {!loading && gameStatsNote && (
            <p style={{ fontSize: '11px', color: '#555', marginTop: 8, textAlign: 'center' }}>
              ⚠️ {gameStatsNote}
            </p>
          )}
        </div>

        {/* ── Quản lý trạng thái tài khoản ─────────────── */}
        {isAdmin && (
          <div className="mb-6">
            <p className="section-title mb-3">🔧 Trạng thái tài khoản</p>
            <p className="text-text-muted text-xs mb-3">
              Đặt tài khoản thành tạm khóa hoặc nghỉ việc. Nhân viên sẽ không thể đăng nhập.
            </p>
            {profiles.length === 0 ? (
              <p className="text-text-muted text-xs text-center py-4">Không có dữ liệu.</p>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                {profiles.slice(0, 15).map((p, i) => {
                  const isOpen = statusTarget === p.id
                  return (
                    <div key={p.id} style={{ borderBottom: i < Math.min(profiles.length, 15) - 1 ? '1px solid #1a1a1a' : 'none' }}>
                      <div className="flex items-center gap-2 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{p.full_name}</p>
                          <p className="text-text-muted text-[10px]">{p.role} · {p.is_active ? 'Active' : 'Không active'}</p>
                        </div>
                        <button
                          onClick={() => { setStatusTarget(isOpen ? null : p.id); setStatusNote('') }}
                          className="text-[11px] px-2.5 py-1 rounded-lg border transition-all"
                          style={{ background: '#111', border: '1px solid #2a2a2a', color: '#888' }}
                        >
                          Đổi trạng thái
                        </button>
                      </div>
                      {isOpen && (
                        <div className="px-4 pb-4 flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Ghi chú (tuỳ chọn)"
                            value={statusNote}
                            onChange={e => setStatusNote(e.target.value)}
                            className="w-full bg-arena-bg border border-arena-border rounded-lg px-3 py-2 text-white text-xs"
                          />
                          <div className="flex gap-2">
                            {(['approved','inactive','resigned'] as const).map(s => (
                              <button
                                key={s}
                                disabled={statusLoading === p.id}
                                onClick={async () => {
                                  setStatusLoading(p.id)
                                  await supabase.rpc('admin_set_user_status', {
                                    p_user_id: p.id,
                                    p_status:  s,
                                    p_note:    statusNote || null,
                                  })
                                  setStatusLoading(null)
                                  setStatusTarget(null)
                                }}
                                className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                                style={
                                  s === 'approved'
                                    ? { background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }
                                    : s === 'inactive'
                                    ? { background: 'rgba(156,163,175,0.1)', border: '1px solid rgba(156,163,175,0.3)', color: '#9ca3af' }
                                    : { background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.3)', color: '#6b7280' }
                                }
                              >
                                {s === 'approved' ? '✓ Active' : s === 'inactive' ? '🔒 Khóa' : '🚪 Nghỉ việc'}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Phản hồi nhân viên ────────────────────────── */}
        <div className="mb-6">
          <FeedbackList />
        </div>

        {/* ── Cài đặt điểm thưởng ───────────────────────── */}
        <div>
          <p className="section-title mb-3">Cài đặt điểm thưởng</p>
          <div className="rounded-2xl overflow-hidden"
               style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
            {POINT_RULES.map((rule, i) => (
              <div key={rule.action}
                   className="flex items-center justify-between px-4 py-3"
                   style={{ borderBottom: i < POINT_RULES.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <p style={{ fontSize: '13px', color: '#ccc' }}>{rule.action}</p>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{rule.points}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#484848', textAlign: 'center', marginTop: 8 }}>
            Chỉnh sửa điểm thưởng sẽ có ở phiên bản tiếp theo
          </p>
        </div>

      </div>
    </div>
  )
}
