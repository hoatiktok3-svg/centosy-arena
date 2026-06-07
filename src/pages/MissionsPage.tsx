import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessTeamDashboard, getRoleBadgeStyle } from '../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface Mission {
  id:                  string
  title:               string
  description:         string | null
  points:              number
  target_org_group:    string | null
  target_office_dept:  string | null
  mission_type:        string
  deadline:            string | null
  is_active:           boolean
  created_at:          string
}

interface Submission {
  id:           string
  mission_id:   string
  user_id:      string
  status:       'pending' | 'approved' | 'rejected'
  note:         string | null
  reject_reason: string | null
  submitted_at: string
  // joined
  user_name?:   string
  user_email?:  string
}

// ── Label maps ────────────────────────────────────────────────
const ORG_GROUP_LABEL: Record<string, string> = {
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'van-phong': 'Văn phòng',
}
const MISSION_TYPE_LABEL: Record<string, { label: string; icon: string; color: string }> = {
  task:      { label: 'Nhiệm vụ',  icon: '✅', color: '#60a5fa' },
  challenge: { label: 'Thử thách', icon: '⚡', color: '#facc15' },
  kpi:       { label: 'KPI',       icon: '📊', color: '#34d399' },
}

const FILTER_TABS = [
  { key: 'all',      label: 'Tất cả' },
  { key: 'cua-hang', label: 'Cửa hàng' },
  { key: 'kho',      label: 'Kho' },
  { key: 'van-phong',label: 'Văn phòng' },
]

// ── Helpers ───────────────────────────────────────────────────
function formatDeadline(iso: string | null): string {
  if (!iso) return 'Không giới hạn'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / 86400000)
  if (diffDays < 0) return 'Đã hết hạn'
  if (diffDays === 0) return 'Hết hạn hôm nay'
  if (diffDays === 1) return 'Còn 1 ngày'
  if (diffDays <= 7) return `Còn ${diffDays} ngày`
  return d.toLocaleDateString('vi-VN')
}

function deadlineColor(iso: string | null): string {
  if (!iso) return '#585858'
  const diffDays = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  if (diffDays < 0) return '#ef4444'
  if (diffDays <= 3) return '#f97316'
  if (diffDays <= 7) return '#facc15'
  return '#585858'
}

// ── Submit Sheet ──────────────────────────────────────────────
interface SubmitSheetProps {
  mission: Mission
  onClose: () => void
  onSubmitted: () => void
}
function SubmitSheet({ mission, onClose, onSubmitted }: SubmitSheetProps) {
  const { currentUser } = useAuth()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!currentUser?.id) return
    setLoading(true); setError('')
    const { error: err } = await supabase
      .from('mission_submissions')
      .insert({ mission_id: mission.id, user_id: currentUser.id, note: note.trim() || null })
    if (err) {
      if (err.code === '23505') setError('Bạn đã nộp nhiệm vụ này rồi.')
      else setError(err.message)
    } else {
      onSubmitted()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-[430px] z-10 rounded-t-2xl overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        <div className="px-5 pt-2 pb-6">
          {/* Mission info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: '12px' }}>{MISSION_TYPE_LABEL[mission.mission_type]?.icon ?? '✅'}</span>
              <span className="font-black text-white" style={{ fontSize: '16px' }}>{mission.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black" style={{ fontSize: '18px', color: '#E94E1B' }}>+{mission.points}</span>
              <span style={{ fontSize: '12px', color: '#686868' }}>điểm thưởng</span>
            </div>
          </div>

          {/* Note input */}
          <label className="block mb-1.5" style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>
            Ghi chú / bằng chứng hoàn thành (tuỳ chọn)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Mô tả kết quả bạn đã thực hiện..."
            rows={3}
            className="w-full resize-none outline-none text-white text-sm rounded-xl px-3 py-2.5"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: '14px' }}
          />

          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
          )}

          {/* Points reward note */}
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl"
               style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.15)' }}>
            <span style={{ fontSize: '14px' }}>🏆</span>
            <p style={{ fontSize: '11px', color: '#E94E1B', fontWeight: 600 }}>
              Điểm thưởng <strong>+{mission.points}</strong> sẽ được cộng ngay khi Admin duyệt
            </p>
          </div>

          <div className="flex gap-2.5 mt-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-sm"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}
            >
              Huỷ
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-black text-white text-sm"
              style={{ background: 'linear-gradient(90deg, #E94E1B, #FF5A28)', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Đang nộp...' : 'Nộp nhiệm vụ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mission Card ──────────────────────────────────────────────
interface MissionCardProps {
  mission:    Mission
  myStatus:   Submission | undefined
  isManager:  boolean
  onSubmit:   (m: Mission) => void
  onManage:   (m: Mission) => void
}
function MissionCard({ mission, myStatus, isManager, onSubmit, onManage }: MissionCardProps) {
  const typeMeta = MISSION_TYPE_LABEL[mission.mission_type] ?? MISSION_TYPE_LABEL.task
  const deadlineStr = formatDeadline(mission.deadline)
  const dlColor = deadlineColor(mission.deadline)
  const expired = mission.deadline ? new Date(mission.deadline) < new Date() : false

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
      {/* Header row */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: `${typeMeta.color}18`, border: `1px solid ${typeMeta.color}30`, fontSize: '18px' }}>
            {typeMeta.icon}
          </div>

          {/* Title + badges */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black leading-snug" style={{ fontSize: '14px', marginBottom: 5 }}>
              {mission.title}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${typeMeta.color}18`, border: `1px solid ${typeMeta.color}30`, color: typeMeta.color }}>
                {typeMeta.label}
              </span>
              {mission.target_org_group && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#686868' }}>
                  {ORG_GROUP_LABEL[mission.target_org_group] ?? mission.target_org_group}
                </span>
              )}
              {!mission.target_org_group && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#585858' }}>
                  Toàn công ty
                </span>
              )}
            </div>
          </div>

          {/* Points */}
          <div className="shrink-0 text-right">
            <p className="font-black leading-none" style={{ fontSize: '22px', color: '#E94E1B' }}>+{mission.points}</p>
            <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>điểm</p>
          </div>
        </div>

        {/* Description */}
        {mission.description && (
          <p className="mt-2.5 leading-relaxed" style={{ fontSize: '12px', color: '#686868', lineHeight: 1.55 }}>
            {mission.description}
          </p>
        )}

        {/* Deadline */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span style={{ fontSize: '11px' }}>⏰</span>
          <p style={{ fontSize: '11px', color: dlColor, fontWeight: 600 }}>{deadlineStr}</p>
        </div>
      </div>

      {/* Action row */}
      <div style={{ borderTop: '1px solid #1a1a1a' }}>
        {myStatus ? (
          // Already submitted
          <div className="flex items-center justify-between px-4 py-2.5">
            <span style={{ fontSize: '11px', color: '#585858' }}>Trạng thái nộp:</span>
            <span className="font-bold text-[11px] px-2.5 py-1 rounded-full"
                  style={
                    myStatus.status === 'approved' ? { background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' } :
                    myStatus.status === 'rejected' ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' } :
                    { background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', color: '#facc15' }
                  }>
              {myStatus.status === 'approved'
                ? `✅ Đã duyệt · +${mission.points}đ`
                : myStatus.status === 'rejected'
                ? '❌ Từ chối'
                : '⏳ Chờ duyệt'}
            </span>
          </div>
        ) : expired ? (
          <div className="px-4 py-2.5">
            <p className="text-center text-[11px]" style={{ color: '#484848' }}>Nhiệm vụ đã hết hạn</p>
          </div>
        ) : (
          <button
            onClick={() => onSubmit(mission)}
            className="w-full py-2.5 font-bold text-white transition-all active:opacity-75"
            style={{ fontSize: '13px', color: '#E94E1B', background: 'rgba(233,78,27,0.06)' }}>
            Nộp nhiệm vụ →
          </button>
        )}

        {/* Manager action */}
        {isManager && (
          <button
            onClick={() => onManage(mission)}
            className="w-full py-2 font-semibold transition-all active:opacity-70"
            style={{ fontSize: '11px', color: '#585858', borderTop: '1px solid #141414' }}>
            ⚙️ Xem bài nộp
          </button>
        )}
      </div>
    </div>
  )
}

// ── Manage Sheet (manager view submissions for a mission) ─────
interface ManageSheetProps {
  mission:     Mission   // includes .points
  submissions: Submission[]
  onClose:     () => void
  onRefresh:   () => void
}
function ManageSheet({ mission, submissions, onClose, onRefresh }: ManageSheetProps) {
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})

  async function approve(sub: Submission) {
    setLoading(sub.id)
    await supabase.from('mission_submissions').update({
      status: 'approved',
      reviewed_by: currentUser?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', sub.id)
    onRefresh()
    setLoading(null)
  }

  async function reject(sub: Submission) {
    setLoading(sub.id)
    await supabase.from('mission_submissions').update({
      status: 'rejected',
      reviewed_by: currentUser?.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: rejectReason[sub.id] || null,
    }).eq('id', sub.id)
    onRefresh()
    setLoading(null)
  }

  const pending = submissions.filter(s => s.status === 'pending')
  const done    = submissions.filter(s => s.status !== 'pending')

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-[430px] z-10 rounded-t-3xl max-h-[75vh] flex flex-col overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>
        <div className="px-5 pb-2 shrink-0">
          <p className="text-white font-black" style={{ fontSize: '15px' }}>Bài nộp — {mission.title}</p>
          <p style={{ fontSize: '11px', color: '#585858', marginTop: 2 }}>{submissions.length} bài nộp · {pending.length} chờ duyệt</p>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-8">
          {submissions.length === 0 && (
            <div className="flex flex-col items-center py-8 gap-2">
              <span style={{ fontSize: '32px' }}>📭</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Chưa có bài nộp nào</p>
            </div>
          )}

          {pending.length > 0 && (
            <>
              <p className="font-bold mb-2 mt-2" style={{ fontSize: '11px', color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ⏳ Chờ duyệt ({pending.length})
              </p>
              {pending.map(sub => (
                <div key={sub.id} className="mb-3 rounded-xl p-3.5"
                     style={{ background: '#161616', border: '1px solid #272727' }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                         style={{ background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.25)', color: '#E94E1B' }}>
                      {(sub.user_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">{sub.user_name ?? sub.user_id.slice(0, 8)}</p>
                      <p style={{ fontSize: '10px', color: '#585858' }}>
                        {new Date(sub.submitted_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  {sub.note && (
                    <p className="mb-2 text-xs leading-relaxed" style={{ color: '#888', padding: '6px 8px', background: '#1e1e1e', borderRadius: 8 }}>
                      {sub.note}
                    </p>
                  )}
                  <input
                    placeholder="Lý do từ chối (nếu cần)..."
                    value={rejectReason[sub.id] ?? ''}
                    onChange={e => setRejectReason(p => ({ ...p, [sub.id]: e.target.value }))}
                    className="w-full text-xs mb-2 outline-none px-3 py-1.5 rounded-lg"
                    style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#aaa' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(sub)}
                      disabled={loading === sub.id}
                      className="flex-1 py-2 rounded-lg font-bold text-xs"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                      Từ chối
                    </button>
                    <button
                      onClick={() => approve(sub)}
                      disabled={loading === sub.id}
                      className="flex-1 py-2 rounded-lg font-bold text-xs"
                      style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                      {loading === sub.id ? '...' : `Duyệt +${mission.points}đ`}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {done.length > 0 && (
            <>
              <p className="font-bold mb-2 mt-3" style={{ fontSize: '11px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Đã xử lý ({done.length})
              </p>
              {done.map(sub => (
                <div key={sub.id} className="mb-2 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3"
                     style={{ background: '#161616', border: '1px solid #222' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {sub.user_name ?? sub.user_id.slice(0, 8)}
                    </p>
                    {sub.status === 'approved' && (
                      <p style={{ fontSize: '10px', color: '#34d399', fontWeight: 700, marginTop: 1 }}>
                        +{mission.points}đ đã cộng
                      </p>
                    )}
                    {sub.status === 'rejected' && sub.reject_reason && (
                      <p style={{ fontSize: '10px', color: '#686868', marginTop: 1 }} className="truncate">
                        {sub.reject_reason}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={sub.status === 'approved'
                          ? { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                    {sub.status === 'approved' ? '✅ Duyệt' : '❌ Từ chối'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function MissionsPage() {
  const { currentUser } = useAuth()
  const isManager = canAccessTeamDashboard(currentUser?.role)
  const roleBadge = getRoleBadgeStyle(currentUser?.role)

  const [missions,     setMissions]     = useState<Mission[]>([])
  const [mySubmissions,setMySubmissions] = useState<Submission[]>([])
  const [allSubmissions,setAllSubmissions] = useState<Submission[]>([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('all')
  const [activeTab,    setActiveTab]    = useState<'available' | 'mine' | 'manage'>('available')

  // Sheet state
  const [submitTarget, setSubmitTarget] = useState<Mission | null>(null)
  const [manageTarget, setManageTarget] = useState<Mission | null>(null)

  // ── Fetch ─────────────────────────────────────────────────
  async function fetchData() {
    if (!currentUser?.id) return
    setLoading(true)

    // Fetch missions
    const { data: mData } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    setMissions(mData ?? [])

    // Fetch my submissions
    const { data: myData } = await supabase
      .from('mission_submissions')
      .select('*')
      .eq('user_id', currentUser.id)
    setMySubmissions(myData ?? [])

    // Manager: fetch all submissions + join user name from profiles
    if (isManager) {
      const { data: allData } = await supabase
        .from('mission_submissions')
        .select('*, profiles!mission_submissions_user_id_fkey(full_name, email)')
        .order('submitted_at', { ascending: false })

      const mapped: Submission[] = (allData ?? []).map((r: Submission & { profiles?: { full_name?: string; email?: string } }) => ({
        ...r,
        user_name:  r.profiles?.full_name ?? undefined,
        user_email: r.profiles?.email ?? undefined,
      }))
      setAllSubmissions(mapped)
    }

    setLoading(false)
  }

  useEffect(() => { void fetchData() }, [currentUser?.id])

  // ── Filtered missions ──────────────────────────────────────
  const filteredMissions = missions.filter(m => {
    if (filter === 'all') return true
    if (!m.target_org_group) return true   // null = toàn công ty
    return m.target_org_group === filter
  })

  // My submissions map
  const mySubMap = Object.fromEntries(mySubmissions.map(s => [s.mission_id, s]))

  // ── Tab content ───────────────────────────────────────────
  const myDoneMissions  = missions.filter(m => mySubMap[m.id])
  const pendingCount    = allSubmissions.filter(s => s.status === 'pending').length

  return (
    <div className="flex flex-col gap-4 py-4">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
             style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, fontSize: '20px' }}>
          🎯
        </div>
        <div>
          <p className="text-white font-black" style={{ fontSize: '20px', letterSpacing: '-0.3px' }}>Nhiệm vụ</p>
          <p style={{ fontSize: '11px', color: '#585858' }}>Hoàn thành · Ghi điểm · Vinh danh</p>
        </div>
      </div>

      {/* ── Inner Tabs ─────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
        {([
          { key: 'available', label: 'Nhiệm vụ' },
          { key: 'mine',      label: `Của tôi${myDoneMissions.length ? ` (${myDoneMissions.length})` : ''}` },
          ...(isManager ? [{ key: 'manage', label: `Duyệt${pendingCount ? ` (${pendingCount})` : ''}` }] : []),
        ] as { key: string; label: string }[]).map(t => (
          <button key={t.key}
                  onClick={() => setActiveTab(t.key as typeof activeTab)}
                  className="flex-1 py-2 rounded-xl font-bold transition-all"
                  style={{
                    fontSize: '12px',
                    background: activeTab === t.key ? 'rgba(233,78,27,0.12)' : 'transparent',
                    border: activeTab === t.key ? '1px solid rgba(233,78,27,0.25)' : '1px solid transparent',
                    color: activeTab === t.key ? '#E94E1B' : '#585858',
                  }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filter (chỉ hiện ở tab available) ────────────── */}
      {activeTab === 'available' && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {FILTER_TABS.map(f => (
            <button key={f.key}
                    onClick={() => setFilter(f.key)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full font-bold transition-all"
                    style={{
                      fontSize: '11px',
                      background: filter === f.key ? 'rgba(233,78,27,0.12)' : '#0d0d0d',
                      border: filter === f.key ? '1px solid rgba(233,78,27,0.3)' : '1px solid #1f1f1f',
                      color: filter === f.key ? '#E94E1B' : '#686868',
                    }}>
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center py-12 gap-2">
          <span style={{ fontSize: '28px' }}>⏳</span>
          <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
        </div>
      ) : activeTab === 'available' ? (
        filteredMissions.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span style={{ fontSize: '40px' }}>🎯</span>
            <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có nhiệm vụ</p>
            <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
              Nhiệm vụ sẽ được Admin tạo và giao.<br />Hãy theo dõi thường xuyên nhé!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredMissions.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                myStatus={mySubMap[m.id]}
                isManager={isManager}
                onSubmit={setSubmitTarget}
                onManage={setManageTarget}
              />
            ))}
          </div>
        )

      ) : activeTab === 'mine' ? (
        myDoneMissions.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span style={{ fontSize: '40px' }}>📋</span>
            <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa nộp nhiệm vụ nào</p>
            <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
              Chuyển sang tab "Nhiệm vụ" để tìm và nộp nhiệm vụ của bạn.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {myDoneMissions.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                myStatus={mySubMap[m.id]}
                isManager={isManager}
                onSubmit={setSubmitTarget}
                onManage={setManageTarget}
              />
            ))}
          </div>
        )

      ) : activeTab === 'manage' ? (
        // Manager view: missions with their submissions
        missions.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span style={{ fontSize: '40px' }}>📭</span>
            <p style={{ fontSize: '13px', color: '#484848' }}>Chưa có nhiệm vụ nào được tạo</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Summary card */}
            <div className="rounded-2xl px-4 py-3.5 grid grid-cols-3 gap-3"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              {[
                { value: allSubmissions.length,                               label: 'Tổng bài nộp',  color: '#60a5fa' },
                { value: allSubmissions.filter(s => s.status === 'pending').length, label: 'Chờ duyệt', color: '#facc15' },
                { value: allSubmissions.filter(s => s.status === 'approved').length, label: 'Đã duyệt', color: '#34d399' },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center">
                  <p className="font-black" style={{ fontSize: '22px', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '9px', color: '#585858', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>{s.label}</p>
                </div>
              ))}
            </div>
            {/* Mission list for management */}
            {missions.map(m => {
              const mSubs = allSubmissions.filter(s => s.mission_id === m.id)
              const mPending = mSubs.filter(s => s.status === 'pending').length
              return (
                <button key={m.id}
                        onClick={() => setManageTarget(m)}
                        className="rounded-2xl px-4 py-3.5 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                        style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                       style={{ fontSize: '18px', background: '#1a1a1a', border: '1px solid #252525' }}>
                    {MISSION_TYPE_LABEL[m.mission_type]?.icon ?? '✅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{m.title}</p>
                    <p style={{ fontSize: '11px', color: '#585858' }}>{mSubs.length} bài nộp</p>
                  </div>
                  {mPending > 0 && (
                    <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px]"
                          style={{ background: '#E94E1B', color: '#fff' }}>
                      {mPending}
                    </span>
                  )}
                  <span style={{ fontSize: '16px', color: '#444' }}>›</span>
                </button>
              )
            })}
          </div>
        )
      ) : null}

      <div className="h-1" />

      {/* ── Sheets ─────────────────────────────────────────── */}
      {submitTarget && (
        <SubmitSheet
          mission={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => { setSubmitTarget(null); void fetchData() }}
        />
      )}
      {manageTarget && (
        <ManageSheet
          mission={manageTarget}
          submissions={allSubmissions.filter(s => s.mission_id === manageTarget.id)}
          onClose={() => setManageTarget(null)}
          onRefresh={() => void fetchData()}
        />
      )}
    </div>
  )
}
