// ── Centralized badge configuration ──────────────────────────
// Source of truth cho tất cả badge icon / label / color
// Used by: ProfilePage, HonorPage, AdminPanel, MissionsPage

export interface BadgeConfig {
  id:          string
  label:       string
  icon:        string   // emoji
  color:       string   // hex
  description: string
}

// Phải khớp với badge_definitions seeds trong badges.sql
export const BADGE_CONFIG: Record<string, BadgeConfig> = {
  'mvp':           { id: 'mvp',           label: 'MVP',                icon: '👑', color: '#facc15', description: 'Nhân viên xuất sắc nhất' },
  'streak':        { id: 'streak',        label: 'Streak',             icon: '🔥', color: '#E94E1B', description: 'Duy trì phong độ liên tục' },
  'top-sales':     { id: 'top-sales',     label: 'Top Sales',          icon: '💰', color: '#4ade80', description: 'Đứng đầu doanh số' },
  'quiz-master':   { id: 'quiz-master',   label: 'Quiz Master',        icon: '🎯', color: '#60a5fa', description: 'Đạt điểm tuyệt đối quiz' },
  'team-player':   { id: 'team-player',   label: 'Team Player',        icon: '🤝', color: '#c084fc', description: 'Hỗ trợ đồng đội xuất sắc' },
  'fast-hand':     { id: 'fast-hand',     label: 'Fast Hand',          icon: '⚡', color: '#22d3ee', description: 'Tốc độ xử lý nhanh nhất' },
  'rookie':        { id: 'rookie',        label: 'Rookie',             icon: '🌱', color: '#34d399', description: 'Nhân viên mới tiến bộ vượt trội' },
  'iron-will':     { id: 'iron-will',     label: 'Iron Will',          icon: '🛡️', color: '#9ca3af', description: 'Kiên trì không bỏ cuộc' },
  'star-week':     { id: 'star-week',     label: 'Ngôi sao tuần',      icon: '⭐', color: '#E94E1B', description: 'Nổi bật nhất trong tuần' },
  'innovator':     { id: 'innovator',     label: 'Văn phòng cải tiến', icon: '💡', color: '#60a5fa', description: 'Sáng kiến cải tiến' },
  'warehouse-ace': { id: 'warehouse-ace', label: 'Kho vận chính xác',  icon: '📦', color: '#4ade80', description: 'Không sai sót xuất nhập kho' },
  'sales-surge':   { id: 'sales-surge',   label: 'Cửa hàng bứt phá',  icon: '🏆', color: '#facc15', description: 'Doanh số vượt chỉ tiêu' },
}

// Backward-compat: map old ProfilePage badge keys → new ids
export const LEGACY_BADGE_MAP: Record<string, string> = {
  MVP:        'mvp',
  Streak:     'streak',
  TopSales:   'top-sales',
  QuizMaster: 'quiz-master',
  TeamPlayer: 'team-player',
  FastHand:   'fast-hand',
  Rookie:     'rookie',
  IronWill:   'iron-will',
}

export function getBadge(id: string): BadgeConfig {
  // Try direct lookup; try legacy map; fallback
  return BADGE_CONFIG[id]
    ?? BADGE_CONFIG[LEGACY_BADGE_MAP[id] ?? '']
    ?? { id, label: id, icon: '🏅', color: '#585858', description: '' }
}

// For ProfilePage grid (8 slots)
export const PROFILE_BADGE_KEYS = [
  'mvp', 'streak', 'top-sales', 'quiz-master',
  'team-player', 'fast-hand', 'rookie', 'iron-will',
]
