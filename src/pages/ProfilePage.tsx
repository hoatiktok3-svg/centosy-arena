import { useState, useEffect } from 'react'
import { getCurrentUser } from '../data/mockUsers'
import { mockGameHistory, mockRecentAchievements } from '../data/mockProfile'
import { useAuth } from '../context/AuthContext'
import AdminPanel from '../components/admin/AdminPanel'
import TeamDashboard from '../components/team/TeamDashboard'
import { canAccessAdminPanel, canAccessTeamDashboard, getRoleLabel, getRoleBadgeStyle } from '../lib/permissions'
import { supabase } from '../lib/supabaseClient'
import { getBadge, PROFILE_BADGE_KEYS } from '../lib/badges'

// me chỉ dùng cho mock data chưa có API: weeklyRank, game history
const me = getCurrentUser()

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

// Fallback cho tài khoản cũ dùng trường department
const DEPT_LABEL: Record<string, string> = {
  'van-phong': 'Văn phòng',
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'tmdt':      'TMĐT',
  'kdtt':      'KDTT',
}


function rankLabel(rank: number) {
  if (rank === 1) return { text: '#1', color: 'text-yellow-400' }
  if (rank === 2) return { text: '#2', color: 'text-gray-300' }
  if (rank === 3) return { text: '#3', color: 'text-amber-600' }
  return { text: `#${rank}`, color: 'text-text-muted' }
}

function LogoutSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-arena-card border-t border-arena-border rounded-t-2xl p-5 pb-10 z-10">
        <p className="text-white font-bold text-lg text-center mb-1">Đăng xuất?</p>
        <p className="text-text-secondary text-sm text-center mb-5">
          Bạn sẽ cần đăng nhập lại để vào Centosy Arena.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={onClose}>Huỷ</button>
          <button
            className="flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg active:scale-95 transition-all"
            onClick={onConfirm}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { currentUser, logout } = useAuth()
  const [showLogout,  setShowLogout]  = useState(false)
  const [showAdmin,   setShowAdmin]   = useState(false)
  const [showTeam,    setShowTeam]    = useState(false)
  const [myBadgeIds,  setMyBadgeIds]  = useState<string[] | null>(null) // null = loading

  // Fetch real badges từ Supabase
  useEffect(() => {
    if (!currentUser?.id) return
    async function fetchBadges() {
      const { data } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', currentUser!.id)
      setMyBadgeIds(data ? data.map((r: { badge_id: string }) => r.badge_id) : [])
    }
    void fetchBadges()
  }, [currentUser?.id])

  const winGames = mockGameHistory.filter(g => g.rank === 1).length
  const totalGames = mockGameHistory.length

  // currentUser luôn có giá trị khi đã qua auth guard
  // Nếu title rỗng → profile chưa được Admin tạo đầy đủ trong Supabase
  const isProfileIncomplete = !currentUser?.title

  const isAdmin   = canAccessAdminPanel(currentUser?.role)
  const isManager = canAccessTeamDashboard(currentUser?.role)
  const roleLabel = getRoleLabel(currentUser?.role)
  const roleBadge = getRoleBadgeStyle(currentUser?.role)

  // Ưu tiên org_group mới; fallback về department cũ cho account trước STEP 26A
  const orgGroupLabel = currentUser?.orgGroup
    ? (ORG_GROUP_LABEL[currentUser.orgGroup] ?? currentUser.orgGroup)
    : null
  const officeDeptLabel = currentUser?.officeDepartment
    ? (OFFICE_DEPT_LABEL[currentUser.officeDepartment] ?? currentUser.officeDepartment)
    : null
  const legacyDeptLabel = currentUser
    ? (DEPT_LABEL[currentUser.department] ?? currentUser.department)
    : ''
  // Nhãn hiển thị chính
  const deptLabel = orgGroupLabel ?? legacyDeptLabel

  return (
    <div className="flex flex-col gap-4 py-4">

      {/* ── Cảnh báo profile chưa đầy đủ ── */}
      {isProfileIncomplete && (
        <div className="arena-card border border-amber-700/40 bg-amber-900/10 flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">⚠️</span>
          <div>
            <p className="text-amber-400 font-bold text-sm">Hồ sơ chưa đầy đủ</p>
            <p className="text-text-secondary text-xs mt-0.5">
              Tài khoản đã đăng nhập nhưng chưa có hồ sơ nhân sự.
              Vui lòng liên hệ Admin để được cấu hình.
            </p>
          </div>
        </div>
      )}

      {/* ── Hero: Avatar + tên + role ── */}
      <div className="arena-card-glow flex flex-col items-center text-center py-6 gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-[3px] border-brand shadow-glow bg-arena-bg flex items-center justify-center">
            <span className="text-white font-black text-3xl">
              {currentUser?.avatarInitials ?? '?'}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand rounded-full border-2 border-arena-card flex items-center justify-center">
            <span className="text-white font-black text-xs">#{me.weeklyRank}</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-white font-black text-xl">{currentUser?.name}</p>
          <p className="text-text-secondary text-xs mt-0.5">{currentUser?.email}</p>
          {currentUser?.title && (
            <p className="text-text-secondary text-sm mt-0.5">{currentUser.title}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider"
              style={{ background: roleBadge.bg, border: `1px solid ${roleBadge.border}`, color: roleBadge.color }}
            >
              {roleLabel}
            </span>
            {deptLabel && <span className="badge-gray">{deptLabel}</span>}
            {/* Bộ phận văn phòng — chỉ hiện khi thuộc Văn phòng */}
            {officeDeptLabel && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', color: '#E94E1B' }}>
                {officeDeptLabel}
              </span>
            )}
          </div>
        </div>

        {/* Score + stats row */}
        <div className="w-full grid grid-cols-3 gap-2 mt-1">
          <div className="flex flex-col items-center">
            <p className="text-brand font-black text-2xl">
              {(currentUser?.score ?? 0).toLocaleString('vi-VN')}
            </p>
            <p className="text-text-muted text-[10px] uppercase tracking-wide">Tổng điểm</p>
          </div>
          <div className="flex flex-col items-center border-x border-arena-border">
            <p className="text-yellow-400 font-black text-2xl">#{me.weeklyRank}</p>
            <p className="text-text-muted text-[10px] uppercase tracking-wide">Hạng tuần</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-white font-black text-2xl">{totalGames}</p>
            <p className="text-text-muted text-[10px] uppercase tracking-wide">Game đã chơi</p>
          </div>
        </div>
      </div>

      {/* ── Team Dashboard card (manager+) ── */}
      {isManager && (
        <div className="arena-card" style={{ border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(52,211,153,0.04)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.28)' }}>
              <span className="text-lg">👥</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#34d399' }}>Team Dashboard</p>
              <p className="text-text-muted text-xs">KPI đội nhóm · top nhân viên</p>
            </div>
          </div>
          <button
            className="w-full py-2.5 rounded-lg font-semibold text-sm active:scale-95 transition-all"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', color: '#34d399' }}
            onClick={() => setShowTeam(true)}
          >
            Xem Team Dashboard →
          </button>
        </div>
      )}

      {/* ── Admin Panel card (chỉ admin thấy) ── */}
      {isAdmin && (
        <div className="arena-card border border-yellow-700/30 bg-yellow-900/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-600/30 flex items-center justify-center">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <p className="text-yellow-400 font-bold text-sm">Khu vực quản trị</p>
              <p className="text-text-muted text-xs">Chỉ Admin mới thấy mục này</p>
            </div>
          </div>
          <button
            className="w-full py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-600/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-colors active:scale-95"
            onClick={() => setShowAdmin(true)}
          >
            Mở Admin Panel →
          </button>
        </div>
      )}

      {/* ── Huy hiệu ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">🏅 Huy hiệu đã đạt</p>
          {myBadgeIds !== null && myBadgeIds.length > 0 && (
            <span style={{ fontSize: '10px', color: '#E94E1B', fontWeight: 700 }}>{myBadgeIds.length} huy hiệu</span>
          )}
        </div>
        {myBadgeIds === null ? (
          <p style={{ fontSize: '12px', color: '#484848' }}>Đang tải huy hiệu...</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {PROFILE_BADGE_KEYS.map(badgeId => {
              const owned = myBadgeIds.includes(badgeId)
              const badge = getBadge(badgeId)
              return (
                <div key={badgeId}
                     className="flex flex-col items-center gap-1 rounded-xl border p-2"
                     style={owned
                       ? { background: `${badge.color}10`, borderColor: `${badge.color}35` }
                       : { background: '#111', borderColor: '#1f1f1f', opacity: 0.35 }}>
                  <span className="text-2xl">{owned ? badge.icon : '🔒'}</span>
                  <span className="text-[10px] font-bold text-center leading-tight"
                        style={{ color: owned ? badge.color : '#484848' }}>
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Thành tích gần đây ── */}
      <div>
        <p className="section-title mb-2">⚡ Thành tích gần đây</p>
        <div className="flex flex-col gap-2">
          {mockRecentAchievements.map(a => (
            <div key={a.id} className="arena-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-arena-bg border border-arena-border flex items-center justify-center text-xl shrink-0">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${a.color}`}>{a.title}</p>
                <p className="text-text-secondary text-xs">{a.description}</p>
                <p className="text-text-muted text-[10px] mt-0.5">{a.earnedAt}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-green-400 font-bold text-xs">+{a.pointBonus}</p>
                <p className="text-text-muted text-[10px]">điểm</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Lịch sử game ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="section-title">🎮 Lịch sử game</p>
          <span className="badge-brand">{winGames} chiến thắng</span>
        </div>
        <div className="arena-card p-0 overflow-hidden divide-y divide-arena-border">
          {mockGameHistory.map(g => {
            const rl = rankLabel(g.rank)
            return (
              <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xl shrink-0">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{g.gameTitle}</p>
                  <p className="text-text-muted text-[10px]">{g.playedAt} · {g.totalPlayers} người chơi</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-black text-sm ${rl.color}`}>{rl.text}</p>
                  <p className="text-brand text-xs font-bold">{g.score} đ</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Đăng xuất ── */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full py-3 rounded-xl border border-red-800/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 transition-all active:scale-95"
      >
        🚪 Đăng xuất
      </button>

      <div className="h-2" />

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showTeam  && <TeamDashboard onClose={() => setShowTeam(false)} />}

      {showLogout && (
        <LogoutSheet
          onClose={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); void logout() }}
        />
      )}
    </div>
  )
}
