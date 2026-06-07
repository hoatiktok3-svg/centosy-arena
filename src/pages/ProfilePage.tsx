import { useState, useEffect } from 'react'
import { getCurrentUser } from '../data/mockUsers'
import { mockGameHistory } from '../data/mockProfile'
import { useAuth } from '../context/AuthContext'
import AdminPanel from '../components/admin/AdminPanel'
import TeamDashboard from '../components/team/TeamDashboard'
import DirectorDashboard from '../components/director/DirectorDashboard'
import FeedbackForm from '../components/feedback/FeedbackForm'
import { canAccessAdminPanel, canAccessTeamDashboard, canAccessDirectorDashboard, getRoleLabel, getRoleBadgeStyle } from '../lib/permissions'
import { supabase } from '../lib/supabaseClient'
import { getBadge, PROFILE_BADGE_KEYS } from '../lib/badges'
import { getLevelInfo } from '../lib/levelSystem'
import RewardShopPage from './RewardShopPage'
import AdminSettingsPage from './AdminSettingsPage'

// me chỉ dùng cho mock data chưa có API: weeklyRank, game history
const me = getCurrentUser()

// ── Types cho nhiệm vụ gần đây ────────────────────────────────
interface RecentMission {
  id:        string
  title:     string
  points:    number
  status:    string
  createdAt: string
}
// Raw shape từ Supabase join
interface MissionSubmissionRow {
  id:        string
  status:    string
  created_at:string
  missions:  { title: string; points: number } | null
}

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
  const [showLogout,    setShowLogout]    = useState(false)
  const [showAdmin,     setShowAdmin]     = useState(false)
  const [showTeam,      setShowTeam]      = useState(false)
  const [showDirector,  setShowDirector]  = useState(false)
  const [showFeedback,  setShowFeedback]  = useState(false)
  const [showRewardShop,   setShowRewardShop]   = useState(false)
  const [showAdminSettings, setShowAdminSettings] = useState(false)
  const [myBadgeIds,      setMyBadgeIds]      = useState<string[] | null>(null) // null = loading
  const [recentMissions,  setRecentMissions]  = useState<RecentMission[] | null>(null)

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

  // Fetch nhiệm vụ gần đây từ Supabase (real data)
  useEffect(() => {
    if (!currentUser?.id) return
    async function fetchMissions() {
      const { data } = await supabase
        .from('mission_submissions')
        .select('id, status, created_at, missions(title, points)')
        .eq('user_id', currentUser!.id)
        .order('created_at', { ascending: false })
        .limit(5)
      setRecentMissions(
        (data ?? []).map((r: MissionSubmissionRow) => ({
          id:        r.id,
          title:     r.missions?.title ?? 'Nhiệm vụ',
          points:    r.missions?.points ?? 0,
          status:    r.status,
          createdAt: r.created_at,
        }))
      )
    }
    void fetchMissions()
  }, [currentUser?.id])

  const winGames = mockGameHistory.filter(g => g.rank === 1).length
  const totalGames = mockGameHistory.length

  // currentUser luôn có giá trị khi đã qua auth guard
  // Nếu title rỗng → profile chưa được Admin tạo đầy đủ trong Supabase
  const isProfileIncomplete = !currentUser?.title

  const isAdmin    = canAccessAdminPanel(currentUser?.role)
  const isManager  = canAccessTeamDashboard(currentUser?.role)
  const isDirector = canAccessDirectorDashboard(currentUser?.role)
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

      {/* ── Level Card ── */}
      {(() => {
        const lvl = getLevelInfo(currentUser?.score ?? 0)
        const isMax = lvl.level === 20
        return (
          <div className="arena-card" style={{ border: `1px solid ${lvl.color}33`, background: `${lvl.color}08` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                   style={{ background: `${lvl.color}15`, border: `1px solid ${lvl.color}40` }}>
                {lvl.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black" style={{ fontSize: '15px', color: lvl.color }}>
                    Level {lvl.level}
                  </p>
                  <span className="rounded-full px-2 py-0.5 font-semibold"
                        style={{ fontSize: '10px', background: `${lvl.color}18`, color: lvl.color, border: `1px solid ${lvl.color}35` }}>
                    {lvl.title}
                  </span>
                </div>
                <p className="text-text-muted" style={{ fontSize: '11px', marginTop: 2 }}>
                  {isMax
                    ? 'Level tối đa — Centosy Legend! 🏯'
                    : `Cần thêm ${lvl.pointsForNext.toLocaleString('vi-VN')}đ để lên Level ${lvl.level + 1}`
                  }
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full mb-1.5" style={{ background: '#1e1e1e' }}>
              <div className="h-full rounded-full transition-all duration-700"
                   style={{ width: `${lvl.progress * 100}%`, background: lvl.color }} />
            </div>
            <div className="flex justify-between">
              <p style={{ fontSize: '10px', color: '#585858' }}>
                {lvl.pointsInLevel.toLocaleString('vi-VN')}đ
              </p>
              <p style={{ fontSize: '10px', color: '#585858' }}>
                {isMax ? '∞' : `${(lvl.maxPoints - lvl.minPoints).toLocaleString('vi-VN')}đ`}
              </p>
            </div>
          </div>
        )
      })()}

      {/* ── Reward Shop card ── */}
      <div className="arena-card" style={{ border: '1px solid rgba(233,78,27,0.25)', background: 'rgba(233,78,27,0.04)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.12)', border: '1px solid rgba(233,78,27,0.28)' }}>
            <span className="text-lg">🎁</span>
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#E94E1B' }}>Reward Shop</p>
            <p className="text-text-muted text-xs">Đổi điểm lấy phần thưởng hấp dẫn</p>
          </div>
        </div>
        <button
          className="w-full py-2.5 rounded-lg font-semibold text-sm active:scale-95 transition-all"
          style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.28)', color: '#E94E1B' }}
          onClick={() => setShowRewardShop(true)}>
          Vào cửa hàng →
        </button>
      </div>

      {/* ── Director Dashboard card (director+) ── */}
      {isDirector && (
        <div className="arena-card" style={{ border: '1px solid rgba(167,139,250,0.25)', background: 'rgba(167,139,250,0.04)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)' }}>
              <span className="text-lg">👑</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#a78bfa' }}>Director Dashboard</p>
              <p className="text-text-muted text-xs">Tổng quan toàn công ty · KPI · Top nhân viên</p>
            </div>
          </div>
          <button
            className="w-full py-2.5 rounded-lg font-semibold text-sm active:scale-95 transition-all"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.28)', color: '#a78bfa' }}
            onClick={() => setShowDirector(true)}
          >
            Xem Director Dashboard →
          </button>
        </div>
      )}

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
          <div className="flex flex-col gap-2">
            <button
              className="w-full py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-600/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-500/20 transition-colors active:scale-95"
              onClick={() => setShowAdmin(true)}
            >
              Mở Admin Panel →
            </button>
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-95"
              style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)', color: '#E94E1B' }}
              onClick={() => setShowAdminSettings(true)}
            >
              ⚙️ Cài đặt hệ thống →
            </button>
          </div>
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

      {/* ── Nhiệm vụ gần đây (real data) ── */}
      <div>
        <p className="section-title mb-2">📋 Nhiệm vụ gần đây</p>
        {recentMissions === null ? (
          <p className="text-text-muted text-xs text-center py-4">Đang tải...</p>
        ) : recentMissions.length === 0 ? (
          <div className="arena-card text-center py-6">
            <p className="text-2xl mb-1">📭</p>
            <p className="text-text-muted text-sm">Chưa có nhiệm vụ nào.</p>
            <p className="text-text-muted text-xs mt-1">Vào tab Nhiệm vụ để bắt đầu!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentMissions.map(m => {
              const statusStyle = m.status === 'approved'
                ? { icon: '✅', color: '#34d399', label: 'Đã duyệt' }
                : m.status === 'rejected'
                ? { icon: '❌', color: '#f87171', label: 'Từ chối' }
                : { icon: '⏳', color: '#fbbf24', label: 'Chờ duyệt' }
              const date = new Date(m.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
              return (
                <div key={m.id} className="arena-card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-arena-bg border border-arena-border flex items-center justify-center text-lg shrink-0">
                    {statusStyle.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{m.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold" style={{ color: statusStyle.color }}>
                        {statusStyle.label}
                      </span>
                      <span className="text-text-muted text-[10px]">{date}</span>
                    </div>
                  </div>
                  {m.status === 'approved' && (
                    <div className="text-right shrink-0">
                      <p className="text-green-400 font-bold text-xs">+{m.points}</p>
                      <p className="text-text-muted text-[10px]">điểm</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Lịch sử game (mock — sẽ thay bằng real data ở step sau) ── */}
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

      {/* ── Báo lỗi / Góp ý ── */}
      <button
        onClick={() => setShowFeedback(true)}
        className="w-full py-3 rounded-xl border border-arena-border text-text-secondary text-sm font-semibold hover:bg-arena-card transition-all active:scale-95"
      >
        💬 Báo lỗi / Góp ý
      </button>

      {/* ── Đăng xuất ── */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full py-3 rounded-xl border border-red-800/50 text-red-400 text-sm font-semibold hover:bg-red-900/20 transition-all active:scale-95"
      >
        🚪 Đăng xuất
      </button>

      <div className="h-2" />

      {showAdmin    && <AdminPanel      onClose={() => setShowAdmin(false)}    />}
      {showTeam     && <TeamDashboard   onClose={() => setShowTeam(false)}     />}
      {showDirector && <DirectorDashboard onClose={() => setShowDirector(false)} />}
      {showFeedback && <FeedbackForm    onClose={() => setShowFeedback(false)} />}
      {showRewardShop     && <RewardShopPage    onClose={() => setShowRewardShop(false)}    />}
      {showAdminSettings  && <AdminSettingsPage onClose={() => setShowAdminSettings(false)} />}

      {showLogout && (
        <LogoutSheet
          onClose={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); void logout() }}
        />
      )}
    </div>
  )
}
