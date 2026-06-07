// ── Level System — Centosy Arena ─────────────────────────────
// Level 1–20 dựa trên totalPoints của user

export interface LevelInfo {
  level:       number
  title:       string
  icon:        string
  color:       string
  minPoints:   number   // điểm tối thiểu để đạt level này
  maxPoints:   number   // điểm tối thiểu để lên level tiếp (0 nếu max level)
  progress:    number   // 0–1, tiến độ trong level hiện tại
  pointsInLevel:   number   // điểm đã có trong level này
  pointsForNext:   number   // số điểm cần thêm để lên level tiếp (0 nếu max)
}

// Ngưỡng điểm tối thiểu để đạt từng level (index 0 = level 1)
const LEVEL_THRESHOLDS: number[] = [
  0,      // L1
  100,    // L2
  250,    // L3
  500,    // L4
  900,    // L5
  1_400,  // L6
  2_100,  // L7
  3_000,  // L8
  4_200,  // L9
  5_700,  // L10
  7_500,  // L11
  9_700,  // L12
  12_300, // L13
  15_400, // L14
  19_000, // L15
  23_200, // L16
  28_100, // L17
  33_700, // L18
  40_200, // L19
  50_000, // L20 (max)
]

const LEVEL_TITLES: string[] = [
  'Tân binh',        // 1
  'Học việc',        // 2
  'Nhân viên',       // 3
  'Nhiệt huyết',     // 4
  'Đáng tin cậy',    // 5
  'Bứt phá',         // 6
  'Chuyên nghiệp',   // 7
  'Cống hiến',       // 8
  'Xuất sắc',        // 9
  'Ngôi sao',        // 10
  'Huyền thoại',     // 11
  'Tinh anh',        // 12
  'Ưu tú',           // 13
  'Tiên phong',      // 14
  'Lãnh đạo',        // 15
  'Champion',        // 16
  'Huyền thoại+',    // 17
  'Vô địch',         // 18
  'Bất bại',         // 19
  'Centosy Legend',  // 20
]

const LEVEL_ICONS: string[] = [
  '🌱','📗','⭐','🌟','💪',
  '🔥','🚀','💎','🏅','🌙',
  '🏆','👑','⚡','🦁','🎖️',
  '🔮','🌈','💫','🦅','🏯',
]

// Màu gradient (from) theo "tier" mỗi 4 level
const LEVEL_COLORS: string[] = [
  '#585858','#585858','#585858','#585858',  // L1–4: grey
  '#60a5fa','#60a5fa','#60a5fa','#60a5fa',  // L5–8: blue
  '#4ade80','#4ade80','#4ade80','#4ade80',  // L9–12: green
  '#facc15','#facc15','#facc15','#facc15',  // L13–16: gold
  '#E94E1B','#E94E1B','#a78bfa','#a78bfa',  // L17–20: brand/purple
]

export function getLevelInfo(totalPoints: number): LevelInfo {
  let level = 1
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1
      break
    }
  }

  const isMax       = level === 20
  const minPoints   = LEVEL_THRESHOLDS[level - 1]
  const maxPoints   = isMax ? 0 : LEVEL_THRESHOLDS[level]
  const range       = isMax ? 1 : maxPoints - minPoints
  const pointsInLevel = totalPoints - minPoints
  const progress    = isMax ? 1 : Math.min(1, pointsInLevel / range)
  const pointsForNext = isMax ? 0 : Math.max(0, maxPoints - totalPoints)

  return {
    level,
    title:        LEVEL_TITLES[level - 1],
    icon:         LEVEL_ICONS[level - 1],
    color:        LEVEL_COLORS[level - 1],
    minPoints,
    maxPoints,
    progress,
    pointsInLevel,
    pointsForNext,
  }
}

export const MAX_LEVEL = 20
