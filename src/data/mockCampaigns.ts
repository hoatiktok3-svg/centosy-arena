export interface Campaign {
  id: string
  title: string
  description: string
  endDate: string
  progress: number   // 0–100
  reward: number     // điểm thưởng
  tag: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  reward: number
  done: boolean
  icon: string
}

export interface HonorItem {
  id: string
  userName: string
  avatar: string
  reason: string
  date: string
  badge: string
}

export const mockCampaigns: Campaign[] = [
  {
    id: 'c01',
    title: 'Quiz Kiến Thức Sản Phẩm',
    description: 'Hoàn thành quiz để nhận điểm thưởng và lên hạng tuần này.',
    endDate: '08/06/2026',
    progress: 68,
    reward: 500,
    tag: 'Đang diễn ra',
  },
  {
    id: 'c02',
    title: 'Tháng Bán Hàng Xuất Sắc',
    description: 'Top doanh số tháng 6 nhận danh hiệu MVP.',
    endDate: '30/06/2026',
    progress: 42,
    reward: 1000,
    tag: 'Tháng 6',
  },
]

export const mockChallenges: Challenge[] = [
  {
    id: 'ch01',
    title: 'Hoàn thành 1 quiz hôm nay',
    description: 'Thi quiz kiến thức sản phẩm',
    reward: 100,
    done: false,
    icon: '🎯',
  },
  {
    id: 'ch02',
    title: 'Đăng nhập liên tiếp 3 ngày',
    description: 'Streak hiện tại: 2 ngày',
    reward: 50,
    done: false,
    icon: '🔥',
  },
  {
    id: 'ch03',
    title: 'Xem bảng xếp hạng',
    description: 'Vào tab Rank 1 lần',
    reward: 20,
    done: true,
    icon: '📊',
  },
]

export const mockHonors: HonorItem[] = [
  {
    id: 'h01',
    userName: 'Nguyễn Văn An',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=an&backgroundColor=1a1a1a',
    reason: 'Nhân viên xuất sắc tuần — doanh số #1 CH Quận 1',
    date: '02/06/2026',
    badge: '🏆',
  },
  {
    id: 'h02',
    userName: 'Phùng Thị Yến',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=yen&backgroundColor=1a1a1a',
    reason: 'Top TMĐT tháng 5 — vượt chỉ tiêu 120%',
    date: '01/06/2026',
    badge: '⭐',
  },
]
