export type LessonCategory = 'Sản phẩm' | 'Kỹ năng bán hàng' | 'Quy trình' | 'Văn hóa'

export interface Lesson {
  id: string
  title: string
  category: LessonCategory
  duration: string   // ví dụ "5 phút"
  icon: string
  summary: string
  content: string[]  // paragraphs
  keyPoints: string[]
}

export const mockLessons: Lesson[] = [
  {
    id: 'l01',
    title: 'Giới thiệu dòng giày patin inline',
    category: 'Sản phẩm',
    duration: '5 phút',
    icon: '🛼',
    summary: 'Tổng quan về giày patin inline — cấu tạo, phân loại, ưu điểm.',
    content: [
      'Giày patin inline (rollerblades) có bánh xe xếp thành 1 hàng dọc, giúp di chuyển nhanh và linh hoạt hơn so với giày quad truyền thống.',
      'Cấu tạo cơ bản gồm: phần giày (boot), khung (frame/chassis), bánh xe (wheels) và vòng bi (bearings). Chất lượng từng bộ phận ảnh hưởng trực tiếp đến trải nghiệm người dùng.',
      'Centosy cung cấp các dòng inline cho trẻ em từ 5–12 tuổi, phù hợp với nhiều mức giá và cường độ sử dụng. Dòng phổ thông phù hợp trẻ mới học, dòng nâng cao cho trẻ đã quen.',
      'Khi tư vấn, ưu tiên hỏi cân nặng và số chân của trẻ — đây là 2 yếu tố quyết định loại giày phù hợp, không chỉ dựa vào độ tuổi.',
    ],
    keyPoints: [
      'Bánh inline xếp dọc — bám đường tốt hơn, tốc độ cao hơn',
      'Chất lượng vòng bi ảnh hưởng đến tiếng ồn và độ trơn',
      'Size giày theo cân nặng + số chân, không chỉ theo tuổi',
      'Dòng cơ bản vs nâng cao phù hợp cường độ sử dụng khác nhau',
    ],
  },
  {
    id: 'l02',
    title: 'Bánh xe và vòng bi — hiểu để tư vấn đúng',
    category: 'Sản phẩm',
    duration: '6 phút',
    icon: '⚙️',
    summary: 'Phân biệt các loại bánh PU, cứng độ, và thông số vòng bi ABEC.',
    content: [
      'Bánh xe patin làm từ polyurethane (PU) — vật liệu tổng hợp có độ đàn hồi cao, bền, êm khi lăn trên mặt đường. Bánh PU tốt hơn nhiều so với bánh nhựa cứng thông thường.',
      'Độ cứng bánh (hardness) đo bằng đơn vị Shore A (ví dụ 78A, 82A, 85A). Bánh mềm (78A) bám đường, êm hơn nhưng mòn nhanh. Bánh cứng (85A+) bền hơn, phù hợp mặt đường nhựa.',
      'Vòng bi (bearings) ảnh hưởng đến độ trơn. Thông số ABEC (ABEC-3, ABEC-5, ABEC-7) càng cao thì độ chính xác gia công càng tốt, lăn trơn và ít ồn hơn. ABEC-5 là tiêu chuẩn phổ thông.',
      'Khi khách than bánh xe kêu hoặc nặng, nguyên nhân phổ biến là vòng bi bẩn hoặc khô dầu. Vệ sinh + tra dầu vòng bi thường giải quyết được mà không cần thay.',
    ],
    keyPoints: [
      'Bánh PU = tiêu chuẩn — không dùng bánh nhựa cứng',
      'Shore A: mềm hơn = êm hơn, cứng hơn = bền hơn',
      'ABEC-5 là mức tối thiểu cho chất lượng tốt',
      'Tiếng kêu = vòng bi bẩn → vệ sinh trước khi thay',
    ],
  },
  {
    id: 'l03',
    title: 'Trang bị bảo hộ — bán đúng, bán đủ',
    category: 'Sản phẩm',
    duration: '4 phút',
    icon: '🦺',
    summary: 'Bộ bảo hộ cần thiết và cách tư vấn combo hiệu quả.',
    content: [
      'Bộ bảo hộ cơ bản gồm 3 thứ: mũ bảo hiểm (helmet), bảo vệ cổ tay (wrist guards), bảo vệ gối (knee pads). Đây là bộ tối thiểu cho trẻ mới học — không nên bỏ qua.',
      'Nhiều phụ huynh bỏ qua bảo vệ cổ tay — nhưng đây là bộ phận dễ bị gãy nhất khi ngã vì trẻ bản năng chống tay xuống. Nhấn mạnh điều này khi tư vấn.',
      'Cách upsell tự nhiên: sau khi khách chọn giày, đề xuất "Bé cần thêm bộ bảo hộ để học an toàn hơn — mình có combo tiết kiệm hơn mua lẻ". Không ép mua, trình bày như quan tâm đến an toàn.',
      'Túi đựng giày cũng là sản phẩm đi kèm tốt — tăng giá trị đơn hàng, giúp khách bảo quản giày tốt hơn.',
    ],
    keyPoints: [
      'Bộ 3 cơ bản: mũ + bảo vệ cổ tay + bảo vệ gối',
      'Bảo vệ cổ tay hay bị bỏ qua nhất — hãy nhấn mạnh',
      'Upsell tự nhiên: combo tiết kiệm + an toàn cho bé',
      'Túi đựng giày = upsell nhẹ, ít bị từ chối',
    ],
  },
  {
    id: 'l04',
    title: 'Quy trình tiếp nhận khách hàng tại cửa hàng',
    category: 'Quy trình',
    duration: '7 phút',
    icon: '🏪',
    summary: 'Các bước chuẩn từ lúc khách vào cửa đến chốt đơn và bàn giao.',
    content: [
      'Bước 1 — Chào đón: Nhân viên chủ động chào khi khách vào, không để khách đứng chờ quá 30 giây. Nụ cười và thái độ thân thiện tạo ấn tượng đầu tiên.',
      'Bước 2 — Khai thác nhu cầu: Hỏi "Bé bao nhiêu tuổi, nặng bao nhiêu kg và số chân bao nhiêu?". Nếu khách không biết cân nặng, ước lượng qua quan sát. Hỏi thêm mục đích dùng: học mới hay đã biết.',
      'Bước 3 — Tư vấn và thử: Đề xuất 1–2 sản phẩm phù hợp thay vì liệt kê hết. Cho trẻ thử giày, kiểm tra độ vừa vặn. Đôi giày tốt: ngón chân không chạm đầu giày, không quá rộng.',
      'Bước 4 — Xử lý từ chối: Nếu khách chê đắt, so sánh theo giá trị (chất lượng, bảo hành, an toàn) thay vì giảm giá ngay. Nếu khách cần suy nghĩ, hỏi "Điều gì khiến anh/chị chưa quyết định?".',
      'Bước 5 — Chốt và bàn giao: Xác nhận thông tin đơn, hướng dẫn bảo hành, hướng dẫn vệ sinh cơ bản. Nhắc nhở chính sách đổi trả.',
    ],
    keyPoints: [
      'Chào trong 30 giây — đừng để khách chờ',
      'Hỏi cân nặng + số chân trước khi giới thiệu sản phẩm',
      'Đề xuất 1–2 lựa chọn, không liệt kê tất cả',
      'Xử lý từ chối bằng giá trị, không giảm giá vội',
      'Bàn giao kèm hướng dẫn bảo hành + vệ sinh',
    ],
  },
  {
    id: 'l05',
    title: 'Xử lý khiếu nại khách hàng',
    category: 'Kỹ năng bán hàng',
    duration: '6 phút',
    icon: '🤝',
    summary: 'Cách lắng nghe, xác nhận vấn đề và đưa ra giải pháp không làm mất khách.',
    content: [
      'Nguyên tắc vàng: KHÔNG tranh cãi với khách, dù khách sai. Nhiệm vụ là giải quyết vấn đề, không phải thắng cuộc tranh luận. Khách có thể sai nhưng vẫn cần được tôn trọng.',
      'Bước 1 — Lắng nghe hết: Để khách nói xong, không ngắt giữa chừng. Gật đầu, ghi chép nếu cần. Sau khi khách nói xong mới phản hồi.',
      'Bước 2 — Xác nhận và đồng cảm: "Em hiểu anh/chị không hài lòng về [vấn đề]. Đây là điều không đáng ra xảy ra và em xin lỗi vì trải nghiệm này."',
      'Bước 3 — Kiểm tra nguyên nhân: Hỏi thêm thông tin để xác định nguyên nhân thực sự — lỗi sản phẩm, lỗi vận chuyển, hay do sử dụng sai cách.',
      'Bước 4 — Đề xuất giải pháp: Tùy nguyên nhân — bảo hành, đổi hàng, hoàn tiền một phần, hay hướng dẫn lại. Luôn ưu tiên giải pháp nhanh và thực tế.',
    ],
    keyPoints: [
      'Không tranh cãi — mục tiêu là giải quyết, không phải thắng',
      'Để khách nói hết trước khi phản hồi',
      'Xác nhận vấn đề + đồng cảm trước khi giải thích',
      'Đề xuất giải pháp cụ thể, không mơ hồ',
    ],
  },
  {
    id: 'l06',
    title: 'Giá trị cốt lõi của Centosy',
    category: 'Văn hóa',
    duration: '4 phút',
    icon: '🎯',
    summary: 'Hiểu và sống đúng 4 giá trị cốt lõi trong công việc hàng ngày.',
    content: [
      'Centosy xây dựng văn hóa dựa trên 4 giá trị cốt lõi: Trung thực, Tận tâm, Sáng tạo, và Đồng đội. Đây không chỉ là khẩu hiệu — đây là cách chúng ta làm việc mỗi ngày.',
      'Trung thực: Phản hồi thật với đồng đội và cấp trên. Nếu có sai sót, chủ động báo cáo thay vì che giấu. Tin tưởng được xây dựng từ sự trung thực nhỏ hàng ngày.',
      'Tận tâm: Làm đúng việc, đúng giờ, đúng cam kết. Nếu không thể hoàn thành đúng hạn, báo trước để team điều chỉnh — không im lặng đến phút chót.',
      'Sáng tạo: Đề xuất cải tiến nhỏ trong quy trình là sáng tạo, không cần phải có ý tưởng lớn. Centosy khuyến khích mọi người lên tiếng khi thấy cách làm tốt hơn.',
      'Đồng đội: Thành công của team quan trọng hơn thành tích cá nhân. Hỗ trợ đồng nghiệp khi cần, chia sẻ kiến thức không phải tạo ra cạnh tranh nội bộ.',
    ],
    keyPoints: [
      'Trung thực — báo cáo sai sót thay vì che giấu',
      'Tận tâm — cam kết đúng hạn hoặc thông báo sớm',
      'Sáng tạo — đề xuất cải tiến nhỏ cũng được trân trọng',
      'Đồng đội — thành công chung quan trọng hơn thành tích cá nhân',
    ],
  },
]

export const lessonCategories: LessonCategory[] = [
  'Sản phẩm', 'Kỹ năng bán hàng', 'Quy trình', 'Văn hóa',
]
