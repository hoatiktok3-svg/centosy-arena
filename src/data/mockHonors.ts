import type { Block } from './mockUsers'

export type HonorTitle =
  | 'Ngôi sao tuần'
  | 'Chiến binh sản phẩm'
  | 'Người hỗ trợ đồng đội'
  | 'Kho vận chính xác'
  | 'Cửa hàng bứt phá'
  | 'Văn phòng cải tiến'

export interface Honor {
  id: string
  userName: string
  avatar: string
  title: HonorTitle
  reason: string
  block: Block
  badge: string        // emoji
  badgeColor: string   // tailwind text color
  bgColor: string      // tailwind bg for card accent
  pointBonus: number
  date: string
  featured: boolean    // nổi bật hôm nay
}

const av = (seed: string) =>
  `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}&backgroundColor=1a1a1a`

export const mockHonors: Honor[] = [
  {
    id: 'h01',
    userName: 'Nguyễn Văn An',
    avatar: av('an'),
    title: 'Cửa hàng bứt phá',
    reason: 'Đạt doanh số cao nhất CH Quận 1 trong tháng 5 — vượt chỉ tiêu 135%. Tinh thần chiến đấu kiên cường, không ngại khó.',
    block: 'Cửa hàng',
    badge: '🏆',
    badgeColor: 'text-yellow-400',
    bgColor: 'from-yellow-900/30',
    pointBonus: 500,
    date: '05/06/2026',
    featured: true,
  },
  {
    id: 'h02',
    userName: 'Phùng Thị Yến',
    avatar: av('yen'),
    title: 'Ngôi sao tuần',
    reason: 'Top điểm TMĐT tuần 22 — liên tục dẫn đầu 3 tuần liên tiếp. Luôn hoàn thành nhiệm vụ trước deadline.',
    block: 'TMĐT',
    badge: '⭐',
    badgeColor: 'text-brand',
    bgColor: 'from-orange-900/30',
    pointBonus: 300,
    date: '04/06/2026',
    featured: false,
  },
  {
    id: 'h03',
    userName: 'Nguyễn Thị Lan',
    avatar: av('lan'),
    title: 'Văn phòng cải tiến',
    reason: 'Đề xuất quy trình onboarding mới giúp rút ngắn 40% thời gian nhân sự. Triển khai thành công cho 3 bộ phận.',
    block: 'Văn phòng',
    badge: '💡',
    badgeColor: 'text-blue-400',
    bgColor: 'from-blue-900/30',
    pointBonus: 400,
    date: '03/06/2026',
    featured: false,
  },
  {
    id: 'h04',
    userName: 'Đinh Văn Khoa',
    avatar: av('khoa'),
    title: 'Kho vận chính xác',
    reason: 'Không có sai sót xuất nhập kho trong toàn bộ tháng 5. Tỉ lệ chính xác 100% — kỷ lục phòng Kho.',
    block: 'Kho',
    badge: '📦',
    badgeColor: 'text-green-400',
    bgColor: 'from-green-900/30',
    pointBonus: 350,
    date: '02/06/2026',
    featured: false,
  },
  {
    id: 'h05',
    userName: 'Trần Thị Bích',
    avatar: av('bich'),
    title: 'Chiến binh sản phẩm',
    reason: 'Đạt điểm tuyệt đối Quiz Kiến Thức Sản Phẩm 3 tuần liên tiếp. Thuộc làu toàn bộ SKU patin cao cấp.',
    block: 'Cửa hàng',
    badge: '⚔️',
    badgeColor: 'text-red-400',
    bgColor: 'from-red-900/30',
    pointBonus: 300,
    date: '01/06/2026',
    featured: false,
  },
  {
    id: 'h06',
    userName: 'Huỳnh Thị Ngọc',
    avatar: av('ngoc'),
    title: 'Người hỗ trợ đồng đội',
    reason: 'Hỗ trợ 5 thành viên mới KDTT trong tháng đầu onboarding, chia sẻ script bán hàng và cùng đi thực địa.',
    block: 'KDTT',
    badge: '🤝',
    badgeColor: 'text-purple-400',
    bgColor: 'from-purple-900/30',
    pointBonus: 250,
    date: '30/05/2026',
    featured: false,
  },
  {
    id: 'h07',
    userName: 'Cao Trọng Nghĩa',
    avatar: av('nghia'),
    title: 'Ngôi sao tuần',
    reason: 'Mang về hợp đồng đại lý lớn nhất Q2/2026 cho kênh Lazada. Tăng trưởng 80% so với cùng kỳ.',
    block: 'TMĐT',
    badge: '⭐',
    badgeColor: 'text-brand',
    bgColor: 'from-orange-900/30',
    pointBonus: 300,
    date: '28/05/2026',
    featured: false,
  },
  {
    id: 'h08',
    userName: 'Trần Minh Đức',
    avatar: av('duc'),
    title: 'Văn phòng cải tiến',
    reason: 'Xây dựng bộ báo cáo tài chính tự động bằng Google Sheet, tiết kiệm 8 giờ/tuần cho bộ phận kế toán.',
    block: 'Văn phòng',
    badge: '💡',
    badgeColor: 'text-blue-400',
    bgColor: 'from-blue-900/30',
    pointBonus: 400,
    date: '26/05/2026',
    featured: false,
  },
]

export const honorFilters = ['Tất cả', 'Văn phòng', 'Cửa hàng', 'Kho', 'TMĐT', 'KDTT'] as const
export type HonorFilter = typeof honorFilters[number]
