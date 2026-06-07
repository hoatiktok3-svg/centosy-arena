import { useAuth } from '../../context/AuthContext'

type AccountStatus = 'pending' | 'approved' | 'rejected' | 'inactive' | 'resigned'

interface Props {
  status: AccountStatus
  rejectedReason?: string | null
}

const CONFIG: Record<
  Exclude<AccountStatus, 'approved'>,
  { icon: string; title: string; subtitle: string; color: string }
> = {
  pending: {
    icon: '⏳',
    title: 'Đang chờ duyệt',
    subtitle: 'Tài khoản của bạn đang chờ Admin xét duyệt. Vui lòng liên hệ quản lý hoặc phòng Hành chính nhân sự nếu cần hỗ trợ.',
    color: '#E9A21B',
  },
  rejected: {
    icon: '✕',
    title: 'Tài khoản chưa được phê duyệt',
    subtitle: 'Yêu cầu đăng ký của bạn chưa được chấp thuận. Liên hệ quản lý để biết thêm thông tin.',
    color: '#E94E1B',
  },
  inactive: {
    icon: '🔒',
    title: 'Tài khoản đang tạm khóa',
    subtitle: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
    color: '#888',
  },
  resigned: {
    icon: '🚪',
    title: 'Tài khoản đã nghỉ việc',
    subtitle: 'Tài khoản của bạn đã được đánh dấu là nghỉ việc. Liên hệ phòng Hành chính nhân sự nếu có nhầm lẫn.',
    color: '#6b7280',
  },
}

export default function PendingApprovalScreen({ status, rejectedReason }: Props) {
  const { logout, currentUser } = useAuth()

  const cfg = CONFIG[status as Exclude<AccountStatus, 'approved'>]

  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo-centosy.png"
            alt="Centosy"
            className="h-12 w-auto object-contain mb-3"
            style={{
              filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 12px rgba(233,78,27,0.6))',
              mixBlendMode: 'screen',
            }}
          />
          <h1 className="text-lg font-black tracking-widest text-text-primary uppercase">
            CENTOSY ARENA
          </h1>
        </div>

        {/* Status card */}
        <div className="bg-arena-card border border-arena-border rounded-2xl p-6 mb-6 text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: `${cfg.color}18`,
              border: `2px solid ${cfg.color}`,
            }}
          >
            {cfg.icon}
          </div>

          <h2 className="text-xl font-black text-text-primary mb-3">{cfg.title}</h2>
          <p className="text-text-secondary text-sm leading-relaxed">{cfg.subtitle}</p>

          {/* Rejected reason */}
          {status === 'rejected' && rejectedReason && (
            <div className="mt-4 bg-red-900/20 border border-red-700/30 rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Lý do</p>
              <p className="text-red-300 text-sm leading-relaxed">{rejectedReason}</p>
            </div>
          )}
        </div>

        {/* User info */}
        {currentUser && (
          <div className="bg-arena-card border border-arena-border rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: '#E94E1B22', color: '#E94E1B', border: '1.5px solid #E94E1B44' }}
            >
              {currentUser.avatarInitials}
            </div>
            <div className="min-w-0">
              <p className="text-text-primary text-sm font-semibold truncate">{currentUser.name}</p>
              <p className="text-text-muted text-xs truncate">{currentUser.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full border border-arena-border text-text-secondary font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase active:scale-95 transition-transform"
        >
          Đăng xuất
        </button>

        {/* Contact note */}
        <p className="text-text-muted text-xs text-center mt-5 leading-relaxed">
          Cần hỗ trợ? Liên hệ phòng Hành chính nhân sự Centosy.
        </p>

      </div>
    </div>
  )
}
