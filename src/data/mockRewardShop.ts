export type RewardCategory = 'Ưu đãi' | 'Vật phẩm' | 'Trải nghiệm' | 'Học tập'

export interface ShopItem {
  id: string
  title: string
  description: string
  icon: string
  category: RewardCategory
  pointCost: number
  stock: number | null   // null = không giới hạn
  highlight?: boolean
}

// Mock data — team HR/Admin cập nhật phần tử thực tế
export const shopItems: ShopItem[] = [
  {
    id: 'r01',
    title: 'Nghỉ phép thêm 1 ngày',
    description: 'Đổi 1 ngày nghỉ phép có lương ngoài quota tiêu chuẩn. Áp dụng trong tháng sau khi được duyệt.',
    icon: '🌴',
    category: 'Ưu đãi',
    pointCost: 500,
    stock: null,
    highlight: true,
  },
  {
    id: 'r02',
    title: 'Voucher ăn uống 100K',
    description: 'Voucher dùng bữa trưa/cà phê với đồng nghiệp. Áp dụng tại căng-tin hoặc các điểm được công ty chỉ định.',
    icon: '🍜',
    category: 'Ưu đãi',
    pointCost: 200,
    stock: 20,
  },
  {
    id: 'r03',
    title: 'Áo thun Centosy chính hãng',
    description: 'Áo thun in logo Centosy phiên bản giới hạn, vải cotton cao cấp. Chọn size khi được duyệt.',
    icon: '👕',
    category: 'Vật phẩm',
    pointCost: 300,
    stock: 15,
  },
  {
    id: 'r04',
    title: 'Bình giữ nhiệt Centosy',
    description: 'Bình giữ nhiệt in logo Centosy, dung tích 500ml, giữ nóng/lạnh 12 giờ.',
    icon: '🧊',
    category: 'Vật phẩm',
    pointCost: 250,
    stock: 10,
  },
  {
    id: 'r05',
    title: 'Đặt lịch coaching 1:1 với quản lý',
    description: '30 phút coaching cá nhân về career development, kỹ năng hoặc mục tiêu nghề nghiệp.',
    icon: '🎯',
    category: 'Trải nghiệm',
    pointCost: 150,
    stock: null,
  },
  {
    id: 'r06',
    title: 'Khóa học online miễn phí (tháng)',
    description: 'Đăng ký 1 khóa học online theo chủ đề nghề nghiệp: bán hàng, quản lý kho, marketing số...',
    icon: '📖',
    category: 'Học tập',
    pointCost: 400,
    stock: null,
  },
  {
    id: 'r07',
    title: 'Chọn vị trí ngồi yêu thích trong tháng',
    description: 'Ưu tiên chọn bàn làm việc ưa thích tại văn phòng trong 1 tháng (áp dụng văn phòng).',
    icon: '💺',
    category: 'Ưu đãi',
    pointCost: 180,
    stock: null,
  },
  {
    id: 'r08',
    title: 'Giày patin Centosy (nhân viên)',
    description: 'Một đôi giày patin Centosy tiêu chuẩn cho nhân viên sử dụng cá nhân. Chọn size khi được duyệt.',
    icon: '🛼',
    category: 'Vật phẩm',
    pointCost: 800,
    stock: 5,
    highlight: true,
  },
]

export const shopCategories: Array<RewardCategory | 'Tất cả'> = [
  'Tất cả', 'Ưu đãi', 'Vật phẩm', 'Trải nghiệm', 'Học tập',
]
