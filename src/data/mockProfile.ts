export interface GameHistory {
  id: string
  gameTitle: string
  icon: string
  score: number
  rank: number
  totalPlayers: number
  playedAt: string
}

export interface RecentAchievement {
  id: string
  title: string
  description: string
  icon: string
  color: string   // tailwind text color
  earnedAt: string
  pointBonus: number
}

export const mockGameHistory: GameHistory[] = [
  {
    id: 'gh01',
    gameTitle: 'Nhìn Nhanh Đoán Đúng',
    icon: '👁️',
    score: 270,
    rank: 2,
    totalPlayers: 18,
    playedAt: '05/06/2026',
  },
  {
    id: 'gh02',
    gameTitle: 'Quiz Kiến Thức Sản Phẩm',
    icon: '🎯',
    score: 300,
    rank: 1,
    totalPlayers: 25,
    playedAt: '04/06/2026',
  },
  {
    id: 'gh03',
    gameTitle: 'Tìm Lỗi Trong Ảnh',
    icon: '🔍',
    score: 210,
    rank: 4,
    totalPlayers: 20,
    playedAt: '03/06/2026',
  },
  {
    id: 'gh04',
    gameTitle: 'Khách Hàng Khó Tính',
    icon: '😤',
    score: 380,
    rank: 1,
    totalPlayers: 15,
    playedAt: '01/06/2026',
  },
  {
    id: 'gh05',
    gameTitle: 'Caption Bá Đạo',
    icon: '✍️',
    score: 180,
    rank: 3,
    totalPlayers: 22,
    playedAt: '30/05/2026',
  },
]

export const mockRecentAchievements: RecentAchievement[] = [
  {
    id: 'ra01',
    title: 'MVP',
    description: 'Dẫn đầu điểm số toàn công ty',
    icon: '👑',
    color: 'text-yellow-400',
    earnedAt: '04/06/2026',
    pointBonus: 500,
  },
  {
    id: 'ra02',
    title: 'Streak 7 ngày',
    description: 'Đăng nhập 7 ngày liên tiếp',
    icon: '🔥',
    color: 'text-brand',
    earnedAt: '03/06/2026',
    pointBonus: 150,
  },
  {
    id: 'ra03',
    title: 'Quiz Master',
    description: 'Đạt điểm tuyệt đối 3 lần liên tiếp',
    icon: '🎯',
    color: 'text-blue-400',
    earnedAt: '02/06/2026',
    pointBonus: 200,
  },
  {
    id: 'ra04',
    title: 'Team Player',
    description: 'Vote vinh danh cho 5 đồng đội',
    icon: '🤝',
    color: 'text-purple-400',
    earnedAt: '01/06/2026',
    pointBonus: 100,
  },
]
