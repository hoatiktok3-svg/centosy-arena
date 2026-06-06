export type GameCategory = 'Tất cả' | 'Tư duy' | 'Hài hước' | 'Bán hàng' | 'Kho' | 'Văn hóa'
export type GameStatus = 'active' | 'coming_soon'

export interface Game {
  id: string
  title: string
  description: string
  icon: string
  category: Exclude<GameCategory, 'Tất cả'>
  suitableFor: string[]   // các khối phù hợp
  duration: string        // thời gian chơi
  maxScore: number
  aiHard: boolean         // có nhãn "Khó dùng AI"
  status: GameStatus
  gradient: string        // tailwind gradient classes cho card header
}

export const mockGames: Game[] = [
  {
    id: 'g01',
    title: 'Nhìn Nhanh Đoán Đúng',
    description: 'Xem ảnh sản phẩm trong 3 giây và trả lời đúng tên, giá, mã SKU. Test trí nhớ siêu tốc.',
    icon: '👁️',
    category: 'Tư duy',
    suitableFor: ['Cửa hàng', 'TMĐT', 'Kho'],
    duration: '5 phút',
    maxScore: 300,
    aiHard: true,
    status: 'coming_soon',
    gradient: 'from-orange-900/60 to-arena-card',
  },
  {
    id: 'g02',
    title: 'Tìm Lỗi Trong Ảnh',
    description: 'Phát hiện lỗi trưng bày, lỗi đơn hàng, lỗi sắp xếp kho trong bức ảnh thực tế.',
    icon: '🔍',
    category: 'Tư duy',
    suitableFor: ['Kho', 'Cửa hàng', 'Văn phòng'],
    duration: '7 phút',
    maxScore: 350,
    aiHard: true,
    status: 'coming_soon',
    gradient: 'from-blue-900/60 to-arena-card',
  },
  {
    id: 'g03',
    title: 'Ai Là Người Bí Ẩn?',
    description: 'Đọc mô tả hành vi và đoán đồng nghiệp nào. Dựa trên quan sát thực tế, AI không thể chơi thay.',
    icon: '🎭',
    category: 'Văn hóa',
    suitableFor: ['Văn phòng', 'Cửa hàng', 'KDTT', 'TMĐT', 'Kho'],
    duration: '10 phút',
    maxScore: 200,
    aiHard: true,
    status: 'coming_soon',
    gradient: 'from-purple-900/60 to-arena-card',
  },
  {
    id: 'g04',
    title: 'Caption Bá Đạo',
    description: 'Viết caption hài hước nhất cho ảnh tình huống nội bộ. Cộng đồng vote người thắng.',
    icon: '✍️',
    category: 'Hài hước',
    suitableFor: ['TMĐT', 'Văn phòng', 'Cửa hàng'],
    duration: '15 phút',
    maxScore: 250,
    aiHard: true,
    status: 'coming_soon',
    gradient: 'from-pink-900/60 to-arena-card',
  },
  {
    id: 'g05',
    title: 'Khách Hàng Khó Tính',
    description: 'Đóng vai nhân viên xử lý tình huống khách phàn nàn. Trả lời thật — AI trả lời rõ ràng quá.',
    icon: '😤',
    category: 'Bán hàng',
    suitableFor: ['Cửa hàng', 'KDTT', 'TMĐT'],
    duration: '10 phút',
    maxScore: 125,
    aiHard: true,
    status: 'active',
    gradient: 'from-red-900/60 to-arena-card',
  },
  {
    id: 'g06',
    title: 'Soi Đơn Thần Tốc',
    description: 'Kiểm tra đơn hàng có lỗi trong thời gian giới hạn. Ai soi nhanh và đúng nhất thắng.',
    icon: '📦',
    category: 'Kho',
    suitableFor: ['Kho', 'TMĐT'],
    duration: '8 phút',
    maxScore: 300,
    aiHard: false,
    status: 'coming_soon',
    gradient: 'from-yellow-900/60 to-arena-card',
  },
  {
    id: 'g07',
    title: 'Hành Động Nào Đáng Vinh Danh?',
    description: 'Bình chọn câu chuyện thực tế từ đồng đội. Ai nhận vote cao nhất tuần này được ghi danh.',
    icon: '🏆',
    category: 'Văn hóa',
    suitableFor: ['Văn phòng', 'Cửa hàng', 'Kho', 'TMĐT', 'KDTT'],
    duration: '5 phút',
    maxScore: 150,
    aiHard: true,
    status: 'coming_soon',
    gradient: 'from-amber-900/60 to-arena-card',
  },
]

export const gameCategories: GameCategory[] = [
  'Tất cả', 'Tư duy', 'Hài hước', 'Bán hàng', 'Kho', 'Văn hóa',
]
