import { useState } from 'react'
import { getCurrentUser } from '../data/mockUsers'
import { mockGameHistory, mockRecentAchievements } from '../data/mockProfile'
import { useAuth } from '../context/AuthContext'
import AdminPanel from '../components/admin/AdminPanel'

// me chỉ dùng cho mock data chưa có API: badges, weeklyRank, game history
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

const BADGE_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  MVP:        { icon: '👑', label: 'MVP',          color: 'text-yellow-400', bg: 'bg-yellow-900/30 border-yellow-700/40' },
  Streak:     { icon: '🔥', label: 'Streak',       color: 'text-brand',      bg: 'bg-orange-900/30 border-brand/30' },
  TopSales:   { icon: '💰', label: 'Top Sales',    color: 'text-green-400',  bg: 'bg-green-900/30 border-green-700/40' },
  QuizMaster: { icon: '🎯', label: 'Quiz Master',  color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-700/40' },
  TeamPlayer: { icon: '🤝', label: 'Team Player',  color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/40' },
  FastHand:   { icon: '⚡', label: 'Fast Hand',    color: 'text-cyan-400',   bg: 'bg-cyan-900/30 border-cyan-700/40' },
  Rookie:     { icon: '🌱', label: 'Rookie',       color: 'text-emerald-400',bg: 'bg-emerald-900/30 border-emerald-700/40' },
  IronWill:   { icon: '🛡️', label: 'Iron Will',   color: 'text-gray-300',   bg: 'bg-gray-800/60 border-gray-600/40' },
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
  const [showLogout, setShowLogout] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  const winGames = mockGameHistory.filter(g => g.rank === 1).length
  const totalGames = mockGameHistory.length

  // currentUser luôn có giá trị khi đã qua auth guard
  // Nếu title rỗng → profile chưa được Admin tạo đầy đủ trong Supabase
  const isProfileIncomplete = !currentUser?.title

  const isAdmin = currentUser?.role === 'admin'

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
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
                ADMIN
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/20 border border-brand/40 text-brand">
                NHÂN VIÊN
              </span>
            )}
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
        <p className="section-title mb-3">🏅 Huy hiệu đã đạt</p>
        <div className="grid grid-cols-4 gap-2">
          {me.badges.map(b => {
            const meta = BADGE_META[b]
            return (
              <div key={b} className={`flex flex-col items-center gap-1 rounded-xl border p-2 ${meta.bg}`}>
                <span className="text-2xl">{meta.icon}</span>
                <span className={`text-[10px] font-bold text-center leading-tight ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
            )
          })}
          {Array.from({ length: Math.max(0, 8 - me.badges.length) }).map((_, i) => (
            <div key={`lock-${i}`} className="flex flex-col items-center gap-1 rounded-xl border border-arena-border p-2 opacity-30">
              <span className="text-2xl">🔒</span>
              <span className="text-[10px] text-text-muted text-center">Khoá</span>
            </div>
          ))}
        </div>
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

      {showLogout && (
        <LogoutSheet
          onClose={() => setShowLogout(false)}
          onConfirm={() => { setShowLogout(false); void logout() }}
        />
      )}
    </div>
  )
}
