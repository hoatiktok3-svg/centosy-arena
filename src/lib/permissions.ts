// ============================================================
// CENTOSY ARENA — Permission Helper
// STEP 27: Tập trung toàn bộ logic phân quyền vào 1 file
//
// Quy tắc:
// - Không inline check role rải rác trong component
// - Luôn dùng các hàm can*() / is*() từ file này
// - Không hardcode role string trong component
// ============================================================

export type AppRole = 'admin' | 'director' | 'manager' | 'employee' | 'staff'

// Thứ tự quyền tăng dần (index cao = quyền cao hơn)
const ROLE_RANK: Record<AppRole, number> = {
  employee: 0,
  staff:    0,   // legacy alias cho employee
  manager:  1,
  director: 2,
  admin:    3,
}

function rank(role: AppRole | string | undefined | null): number {
  return ROLE_RANK[(role ?? 'employee') as AppRole] ?? 0
}

// ── Identity checks ──────────────────────────────────────────

export function isAdmin(role?: string | null): boolean {
  return role === 'admin'
}

export function isDirector(role?: string | null): boolean {
  return role === 'director' || role === 'admin'
}

export function isManager(role?: string | null): boolean {
  return rank(role as AppRole) >= rank('manager')
}

export function isEmployee(role?: string | null): boolean {
  return role === 'employee' || role === 'staff'
}

// ── Feature-level gates ──────────────────────────────────────

/** Xem Admin Panel đầy đủ */
export function canAccessAdminPanel(role?: string | null): boolean {
  return isAdmin(role)
}

/** Xem Director Dashboard (tổng quan toàn công ty) */
export function canAccessDirectorDashboard(role?: string | null): boolean {
  return isDirector(role)
}

/** Xem Team Dashboard / quản lý nhóm */
export function canAccessTeamDashboard(role?: string | null): boolean {
  return isManager(role)
}

/** Duyệt/từ chối tài khoản nhân viên */
export function canApproveAccounts(role?: string | null): boolean {
  return isAdmin(role)
}

/** Xem dữ liệu toàn bộ nhân sự */
export function canViewAllProfiles(role?: string | null): boolean {
  return isManager(role)
}

/** Duyệt nhiệm vụ và cộng điểm */
export function canApproveMissions(role?: string | null): boolean {
  return isManager(role)
}

/** Chơi game và nộp nhiệm vụ */
export function canPlayGames(role?: string | null): boolean {
  return true // mọi role đều được chơi
}

/** Xem leaderboard */
export function canViewLeaderboard(role?: string | null): boolean {
  return true // mọi role đều thấy
}

// ── Role display helpers ──────────────────────────────────────

export const ROLE_LABEL: Record<string, string> = {
  admin:    'Quản trị viên',
  director: 'Giám đốc',
  manager:  'Quản lý',
  employee: 'Nhân viên',
  staff:    'Nhân viên',  // legacy
}

export const ROLE_BADGE_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  admin:    { bg: 'rgba(250,204,21,0.2)',  border: 'rgba(250,204,21,0.4)',  color: '#facc15' },
  director: { bg: 'rgba(167,139,250,0.2)', border: 'rgba(167,139,250,0.4)', color: '#a78bfa' },
  manager:  { bg: 'rgba(52,211,153,0.2)',  border: 'rgba(52,211,153,0.4)',  color: '#34d399' },
  employee: { bg: 'rgba(233,78,27,0.2)',   border: 'rgba(233,78,27,0.4)',   color: '#E94E1B' },
  staff:    { bg: 'rgba(233,78,27,0.2)',   border: 'rgba(233,78,27,0.4)',   color: '#E94E1B' },
}

export function getRoleLabel(role?: string | null): string {
  return ROLE_LABEL[(role ?? 'employee')] ?? 'Nhân viên'
}

export function getRoleBadgeStyle(role?: string | null) {
  return ROLE_BADGE_STYLE[(role ?? 'employee')] ?? ROLE_BADGE_STYLE.employee
}
