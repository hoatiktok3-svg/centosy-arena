import { useEffect, useState } from 'react'
import { mockHonors, honorFilters, HonorFilter, Honor } from '../data/mockHonors'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'
import { BADGE_CONFIG, getBadge } from '../lib/badges'
import PeerPraiseSheet from '../components/praise/PeerPraiseSheet'
import StoriesPage from './StoriesPage'

// ── Types ─────────────────────────────────────────────────────
interface RawUserBadge {
  id:          string
  user_id:     string
  badge_id:    string
  reason:      string | null
  points_bonus: number
  is_featured: boolean
  awarded_at:  string
  profiles: {
    full_name: string | null
    org_group: string | null
    department: string | null
  } | null
  badge_definitions: {
    label: string
    icon:  string
    color: string
  } | null
}

const ORG_GROUP_LABEL: Record<string, string> = {
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'van-phong': 'Văn phòng',
}

function blockLabel(og: string | null, dept: string | null): string {
  if (og) return ORG_GROUP_LABEL[og] ?? og
  if (dept) return dept
  return 'Centosy'
}

function toHonor(r: RawUserBadge): Honor {
  const bc = r.badge_definitions
  const pf = r.profiles
  const color = bc?.color ?? '#585858'
  const d = new Date(r.awarded_at)
  return {
    id:         r.id,
    userName:   pf?.full_name ?? 'Nhân viên',
    avatar:     `https://api.dicebear.com/7.x/thumbs/svg?seed=${r.user_id}&backgroundColor=1a1a1a`,
    title:      (bc?.label ?? r.badge_id) as Honor['title'],
    reason:     r.reason ?? '',
    block:      blockLabel(pf?.org_group ?? null, pf?.department ?? null) as Honor['block'],
    badge:      bc?.icon ?? '🏅',
    badgeColor: color,       // hex — resolveColor handles pass-through
    bgColor:    '',
    pointBonus: r.points_bonus,
    date:       `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`,
    featured:   r.is_featured,
  }
}

// ── Color resolve — supports both hex and Tailwind classes ────
function resolveColor(badgeColor: string): string {
  if (badgeColor.startsWith('#')) return badgeColor   // hex pass-through
  if (badgeColor === 'text-brand')        return '#E94E1B'
  if (badgeColor === 'text-yellow-400')   return '#facc15'
  if (badgeColor === 'text-blue-400')     return '#60a5fa'
  if (badgeColor === 'text-green-400')    return '#4ade80'
  if (badgeColor === 'text-red-400')      return '#f87171'
  if (badgeColor === 'text-purple-400')   return '#c084fc'
  return '#585858'
}

// ── Award Badge Sheet (admin only) ────────────────────────────
interface AwardSheetProps {
  onClose:    () => void
  onAwarded:  () => void
}
function AwardSheet({ onClose, onAwarded }: AwardSheetProps) {
  const { currentUser } = useAuth()
  const [users,      setUsers]      = useState<{ id: string; full_name: string }[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  const [reason,     setReason]     = useState('')
  const [points,     setPoints]     = useState(0)
  const [isFeatured, setIsFeatured] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name')
      setUsers(data ?? [])
    }
    void load()
  }, [])

  async function handleAward() {
    if (!selectedUser || !selectedBadge) { setError('Vui lòng chọn nhân viên và loại huy hiệu'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('user_badges').insert({
      user_id:      selectedUser,
      badge_id:     selectedBadge,
      awarded_by:   currentUser?.id,
      reason:       reason.trim() || null,
      points_bonus: points,
      is_featured:  isFeatured,
    })
    if (err) setError(err.message)
    else onAwarded()
    setLoading(false)
  }

  const badgeList = Object.values(BADGE_CONFIG)

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-[430px] z-10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>
        <div className="px-5 pt-2 pb-1 shrink-0">
          <p className="text-white font-black" style={{ fontSize: '16px' }}>🏅 Trao huy hiệu</p>
          <p style={{ fontSize: '11px', color: '#585858', marginTop: 2 }}>Chỉ Admin/Director có quyền</p>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-8 flex flex-col gap-3 mt-3">
          {/* Chọn nhân viên */}
          <div>
            <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nhân viên</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full outline-none text-white text-sm rounded-xl px-3 py-2.5"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            >
              <option value="">-- Chọn nhân viên --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          {/* Chọn huy hiệu */}
          <div>
            <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Loại huy hiệu</label>
            <div className="grid grid-cols-3 gap-2">
              {badgeList.map(b => (
                <button
                  key={b.id}
                  onClick={() => { setSelectedBadge(b.id); setPoints(p => p === 0 ? (BADGE_CONFIG[b.id]?.points_bonus ?? 0) : p) }}
                  className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-all"
                  style={{
                    background: selectedBadge === b.id ? `${b.color}18` : '#161616',
                    border: selectedBadge === b.id ? `1.5px solid ${b.color}55` : '1px solid #222',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{b.icon}</span>
                  <span style={{ fontSize: '9px', color: selectedBadge === b.id ? b.color : '#585858', fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>
                    {b.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lý do */}
          <div>
            <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Lý do vinh danh</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Mô tả thành tích nổi bật..."
              rows={3}
              className="w-full resize-none outline-none text-white text-sm rounded-xl px-3 py-2.5"
              style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
            />
          </div>

          {/* Điểm thưởng */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Điểm thưởng</label>
              <input
                type="number"
                value={points}
                onChange={e => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full outline-none text-white text-sm rounded-xl px-3 py-2.5"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nổi bật</label>
              <button
                onClick={() => setIsFeatured(v => !v)}
                className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: isFeatured ? 'rgba(233,78,27,0.12)' : '#1a1a1a',
                  border: isFeatured ? '1px solid rgba(233,78,27,0.3)' : '1px solid #2a2a2a',
                  color: isFeatured ? '#E94E1B' : '#585858',
                }}
              >
                {isFeatured ? '⭐ Nổi bật' : 'Không'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2.5">
            <button onClick={onClose}
                    className="flex-1 py-3 rounded-xl font-bold text-sm"
                    style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
              Huỷ
            </button>
            <button onClick={handleAward} disabled={loading}
                    className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                    style={{ background: 'linear-gradient(90deg, #E94E1B, #FF5A28)', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Đang trao...' : '🏅 Trao ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Featured card ───────────────────────────────────────── */
function FeaturedCard({ honor }: { honor: Honor }) {
  const color = resolveColor(honor.badgeColor)

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{
           background: `linear-gradient(145deg, rgba(30,15,0,0.7) 0%, #131313 65%)`,
           border: `1px solid ${color}28`,
           boxShadow: `0 0 30px ${color}0d, 0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)`,
         }}>

      <div className="px-4 pt-4 pb-3 flex items-center justify-between"
           style={{ borderBottom: `1px solid ${color}15` }}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `${color}18`, border: `1px solid ${color}35`, fontSize: '20px' }}>
            {honor.badge}
          </div>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
              {honor.title}
            </p>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '10px', color: '#585858', background: '#1e1e1e', border: '1px solid #2c2c2c', padding: '1px 7px', borderRadius: 99 }}>
                {honor.block}
              </span>
              <span style={{ fontSize: '10px', color: '#484848' }}>{honor.date}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p style={{ fontSize: '9px', color: '#484848', letterSpacing: '0.1em', marginBottom: 2, textTransform: 'uppercase' }}>Thưởng</p>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>+{honor.pointBonus}</p>
          <p style={{ fontSize: '9px', color: '#484848' }}>điểm</p>
        </div>
      </div>

      <div className="px-4 py-4 flex items-start gap-4">
        <img
          src={honor.avatar} alt={honor.userName}
          style={{
            width: 56, height: 56, borderRadius: '16px',
            border: `2px solid ${color}55`,
            boxShadow: `0 0 16px ${color}25`,
            objectFit: 'cover', background: '#141414', flexShrink: 0,
          }}
        />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.3px' }}>
            {honor.userName}
          </p>
          {honor.reason ? (
            <p style={{ fontSize: '12px', color: '#909090', lineHeight: 1.65 }}>{honor.reason}</p>
          ) : (
            <p style={{ fontSize: '12px', color: '#484848', fontStyle: 'italic' }}>Huy hiệu vinh danh đặc biệt</p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
             style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
          <span style={{ fontSize: '10px', color, fontWeight: 700, letterSpacing: '0.06em' }}>
            ✦ Nổi bật tuần này
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Honor card ──────────────────────────────────────────── */
function HonorCard({ honor }: { honor: Honor }) {
  const [expanded, setExpanded] = useState(false)
  const color = resolveColor(honor.badgeColor)

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
         style={{ background: '#181818', border: '1px solid #2c2c2c', boxShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}60, transparent)` }} />
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `${color}14`, border: `1px solid ${color}30`, fontSize: '20px' }}>
            {honor.badge}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {honor.title}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', lineHeight: 1.25, marginBottom: 4 }} className="truncate">
                  {honor.userName}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span style={{ fontSize: '10px', color: '#585858', background: '#1a1a1a', border: '1px solid #2c2c2c', padding: '1px 7px', borderRadius: 99 }}>
                    {honor.block}
                  </span>
                  <span style={{ fontSize: '10px', color: '#484848' }}>{honor.date}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>+{honor.pointBonus}</p>
                <p style={{ fontSize: '9px', color: '#484848', marginTop: 1 }}>điểm</p>
              </div>
            </div>

            {honor.reason && (
              <>
                <button
                  onClick={() => setExpanded(v => !v)}
                  style={{ fontSize: '11px', color: '#585858', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span style={{ fontSize: '9px' }}>{expanded ? '▲' : '▼'}</span>
                  {expanded ? 'Thu gọn' : 'Xem lý do'}
                </button>
                {expanded && (
                  <p style={{ fontSize: '12px', color: '#909090', lineHeight: 1.65, marginTop: 8, paddingTop: 8, borderTop: '1px solid #242424' }}>
                    {honor.reason}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Peer Praise types ────────────────────────────────────────
interface PraiseRow {
  id:          string
  emoji:       string
  message:     string
  created_at:  string
  from_profile: { full_name: string | null } | null
  to_profile:   { full_name: string | null } | null
}

/* ── Main Page ───────────────────────────────────────────── */
export default function HonorPage() {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const [honors,       setHonors]       = useState<Honor[]>([])
  const [useMock,      setUseMock]       = useState(false)
  const [loading,      setLoading]       = useState(true)
  const [filter,       setFilter]        = useState<HonorFilter>('Tất cả')
  const [showAll,      setShowAll]       = useState(false)
  const [showAward,    setShowAward]     = useState(false)
  const [showPraise,   setShowPraise]    = useState(false)
  const [showStories,  setShowStories]   = useState(false)
  const [recentPraises,setRecentPraises] = useState<PraiseRow[] | null>(null)

  // ── Fetch real data ──────────────────────────────────────
  async function fetchHonors() {
    setLoading(true)
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        id, user_id, badge_id, reason, points_bonus, is_featured, awarded_at,
        profiles!user_badges_user_id_fkey ( full_name, org_group, department ),
        badge_definitions ( label, icon, color )
      `)
      .order('awarded_at', { ascending: false })
      .limit(50)

    if (!error && data && data.length > 0) {
      setHonors((data as RawUserBadge[]).map(toHonor))
      setUseMock(false)
    } else {
      // Fallback to mock data while table is empty / not yet set up
      setHonors(mockHonors)
      setUseMock(true)
    }
    setLoading(false)
  }

  useEffect(() => { void fetchHonors() }, [])

  useEffect(() => {
    async function fetchPraises() {
      const { data } = await supabase
        .from('peer_praises')
        .select('id, emoji, message, created_at, from_profile:from_user_id(full_name), to_profile:to_user_id(full_name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10)
      setRecentPraises((data ?? []) as PraiseRow[])
    }
    void fetchPraises()
  }, [])

  // ── Filter logic ─────────────────────────────────────────
  const featured  = honors.find(h => h.featured)
  const nonFeatured = honors.filter(h => !h.featured)

  const filtered = filter === 'Tất cả'
    ? nonFeatured
    : nonFeatured.filter(h => h.block === filter)

  const visible = showAll ? filtered : filtered.slice(0, 4)

  // ── Stats ────────────────────────────────────────────────
  const totalPoints = honors.reduce((s, h) => s + h.pointBonus, 0)

  return (
    <div className="flex flex-col gap-5 py-4">

      {/* Header + admin action */}
      <div className="flex items-start justify-between">
        <div>
          <p className="section-title-brand">⭐ Tường Vinh Danh</p>
          <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
            Centosy Arena · Ghi nhận những đóng góp xuất sắc
          </p>
        </div>
        <div className="flex gap-2 shrink-0 mt-0.5">
          <button
            onClick={() => setShowStories(true)}
            className="py-2 px-3 rounded-xl font-bold text-xs active:scale-95 transition-transform"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.28)', color: '#a78bfa' }}
          >
            📖 Stories
          </button>
          {isAdmin && (
          <button
            onClick={() => setShowAward(true)}
            className="shrink-0 py-2 px-3.5 rounded-xl font-bold text-xs active:scale-95 transition-transform"
            style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', color: '#E94E1B', marginTop: 2 }}
          >
              + Trao huy hiệu
          </button>
          )}
        </div>
      </div>

      {/* Mock data notice */}
      {useMock && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
             style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <span style={{ fontSize: '12px' }}>💡</span>
          <p style={{ fontSize: '10px', color: '#888' }}>Đang hiển thị dữ liệu mẫu. Chạy <strong>badges.sql</strong> để kích hoạt dữ liệu thật.</p>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Tổng vinh danh', value: honors.length,                                    icon: '🏆' },
          { label: 'Nổi bật',        value: honors.filter(h => h.featured).length || '—',     icon: '⭐' },
          { label: 'Điểm đã trao',   value: totalPoints > 0 ? `${(totalPoints/1000).toFixed(1)}K` : '—', icon: '💎' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <p style={{ fontSize: '20px', marginBottom: 4 }}>{s.icon}</p>
            <p className="stat-value" style={{ fontSize: '18px' }}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-8 gap-2">
          <span style={{ fontSize: '28px' }}>⏳</span>
          <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
        </div>
      )}

      {/* Featured */}
      {!loading && featured && (
        <div>
          <p className="section-title mb-3">🔥 Nổi bật hôm nay</p>
          <FeaturedCard honor={featured} />
        </div>
      )}

      {/* Filter tabs */}
      {!loading && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
          {honorFilters.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setShowAll(false) }}
              className={filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}>
              {f}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && (
        <div>
          <p className="section-title mb-3">🎖️ Vinh danh gần đây</p>
          <div className="flex flex-col gap-2.5">
            {visible.map(h => <HonorCard key={h.id} honor={h} />)}
          </div>

          {!showAll && filtered.length > 4 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full mt-3 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
              style={{ fontSize: '13px', color: '#E94E1B', background: 'transparent', border: '1px solid rgba(233,78,27,0.3)' }}>
              Xem tất cả ({filtered.length}) →
            </button>
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl text-center py-10"
                 style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
              <p style={{ fontSize: '32px', marginBottom: 10 }}>🏅</p>
              <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có vinh danh trong nhóm này.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Lời khen đồng đội ────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">👏 Lời khen đồng đội</p>
          <button
            onClick={() => setShowPraise(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
            style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.3)', color: '#E94E1B' }}
          >
            + Gửi lời khen
          </button>
        </div>

        {recentPraises === null && (
          <p className="text-text-muted text-xs text-center py-4">Đang tải...</p>
        )}

        {recentPraises !== null && recentPraises.length === 0 && (
          <div className="arena-card text-center py-6">
            <p className="text-3xl mb-2">👏</p>
            <p className="text-text-muted text-sm">Chưa có lời khen nào. Hãy là người đầu tiên!</p>
          </div>
        )}

        {recentPraises !== null && recentPraises.length > 0 && (
          <div className="flex flex-col gap-2">
            {recentPraises.map(p => {
              const date = new Date(p.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
              return (
                <div key={p.id} className="arena-card flex items-start gap-3">
                  <span className="text-2xl shrink-0 mt-0.5">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm leading-snug">{p.message}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-brand text-[11px] font-bold">
                        {p.from_profile?.full_name ?? '—'}
                      </span>
                      <span className="text-text-muted text-[11px]">→</span>
                      <span className="text-green-400 text-[11px] font-bold">
                        {p.to_profile?.full_name ?? '—'}
                      </span>
                      <span className="text-text-muted text-[10px] ml-auto">{date}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="h-2" />

      {/* Award sheet */}
      {showAward && (
        <AwardSheet
          onClose={() => setShowAward(false)}
          onAwarded={() => { setShowAward(false); void fetchHonors() }}
        />
      )}

      {showStories && <StoriesPage onClose={() => setShowStories(false)} />}

      {showPraise && (
        <PeerPraiseSheet
          onClose={() => setShowPraise(false)}
          onSent={() => {
            setShowPraise(false)
            // Refetch praises sau khi gửi thành công
            supabase
              .from('peer_praises')
              .select('id, emoji, message, created_at, from_profile:from_user_id(full_name), to_profile:to_user_id(full_name)')
              .eq('is_public', true)
              .order('created_at', { ascending: false })
              .limit(10)
              .then(({ data }) => setRecentPraises((data ?? []) as PraiseRow[]))
          }}
        />
      )}
    </div>
  )
}
