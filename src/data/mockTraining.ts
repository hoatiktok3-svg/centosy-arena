export type LessonCategory = 'Sản phẩm' | 'Kỹ năng bán hàng' | 'Quy trình' | 'Văn hóa'

export interface TestQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
}

export interface LessonTest {
  lessonId: string
  passThreshold: number   // 0–1, e.g. 0.6 = 60%
  questions: TestQuestion[]
}

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

// ── Tests (3 câu mỗi bài, pass 2/3 = 67%) ────────────────────
export const lessonTests: LessonTest[] = [
  {
    lessonId: 'l01',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Giày patin inline khác giày quad ở điểm gì?',
        options: [
          'Bánh xe xếp thành 1 hàng dọc',
          'Bánh xe xếp 4 góc',
          'Có thêm phanh phía trước',
          'Dành riêng cho người lớn',
        ],
        correctIndex: 0,
      },
      {
        id: 2,
        question: 'Cấu tạo cơ bản của giày patin gồm những bộ phận nào?',
        options: [
          'Đế, quai, mũi, gót',
          'Boot, frame, wheels, bearings',
          'Thân, lót, dây buộc',
          'Vỏ, ruột, van',
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'Khi tư vấn size giày, thông tin quan trọng nhất cần hỏi là gì?',
        options: [
          'Màu sắc yêu thích',
          'Tuổi và chiều cao',
          'Cân nặng và số chân',
          'Trường học của trẻ',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    lessonId: 'l02',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Bánh xe patin cao cấp thường làm từ vật liệu nào?',
        options: ['Nhựa cứng ABS', 'Cao su tự nhiên', 'Polyurethane (PU)', 'Kim loại nhẹ'],
        correctIndex: 2,
      },
      {
        id: 2,
        question: 'Shore A 78A so với 85A: loại nào bền hơn trên mặt nhựa đường?',
        options: ['78A bền hơn', '85A bền hơn', 'Như nhau', 'Phụ thuộc màu sắc'],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'Khi bánh xe kêu cọ cọ, bước xử lý đầu tiên là gì?',
        options: [
          'Thay ngay bánh mới',
          'Tra dầu nhớt ô tô',
          'Vệ sinh và kiểm tra vòng bi',
          'Bảo khách về dùng bình thường',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    lessonId: 'l03',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Bộ bảo hộ tối thiểu cho trẻ mới học patin gồm những gì?',
        options: [
          'Chỉ mũ bảo hiểm',
          'Mũ + bảo vệ cổ tay + bảo vệ gối',
          'Bảo vệ gối + bảo vệ khuỷu tay',
          'Không cần gì',
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'Tại sao bảo vệ cổ tay thường bị bỏ qua nhất?',
        options: [
          'Vì không quan trọng',
          'Vì đắt tiền',
          'Vì phụ huynh ít nghĩ đến, dù đây là bộ phận hay bị chấn thương khi ngã',
          'Vì trẻ không thích đeo',
        ],
        correctIndex: 2,
      },
      {
        id: 3,
        question: 'Cách upsell tự nhiên nhất khi bán giày patin là?',
        options: [
          'Ép mua ngay toàn bộ phụ kiện',
          'Đề xuất combo bảo hộ tiết kiệm + an toàn cho bé',
          'Giảm giá nếu mua thêm',
          'Không cần upsell',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    lessonId: 'l04',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Thời gian tối đa để chào đón khách sau khi vào cửa hàng là?',
        options: ['5 giây', '30 giây', '2 phút', '5 phút'],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'Khi khách chê đắt, phản ứng đúng nhất là?',
        options: [
          'Giảm giá ngay',
          'So sánh giá với đối thủ',
          'Giải thích giá trị: chất lượng, bảo hành, an toàn',
          'Đề xuất sản phẩm rẻ hơn ngay',
        ],
        correctIndex: 2,
      },
      {
        id: 3,
        question: 'Bước cuối cùng trong quy trình bán hàng là gì?',
        options: [
          'Thu tiền và kết thúc',
          'Chào khách ra về',
          'Chốt đơn + bàn giao kèm hướng dẫn bảo hành và vệ sinh',
          'Mời khách mua thêm',
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    lessonId: 'l05',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Nguyên tắc vàng khi xử lý khiếu nại là?',
        options: [
          'Chứng minh khách sai',
          'Không tranh cãi — mục tiêu là giải quyết vấn đề',
          'Từ chối nhận khiếu nại',
          'Chuyển cho quản lý ngay',
        ],
        correctIndex: 1,
      },
      {
        id: 2,
        question: 'Khi khách đang nói về vấn đề, bạn nên làm gì?',
        options: [
          'Ngắt lời và giải thích ngay',
          'Để khách nói hết, lắng nghe, ghi chép nếu cần',
          'Xin lỗi ngay khi khách vừa bắt đầu',
          'Hỏi ngay về chính sách',
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'Sau khi lắng nghe và xác nhận vấn đề, bước tiếp theo là?',
        options: [
          'Từ chối bảo hành',
          'Kiểm tra nguyên nhân trước khi đề xuất giải pháp',
          'Đề xuất giải pháp ngay mà không cần hỏi thêm',
          'Chuyển khách sang bộ phận khác',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    lessonId: 'l06',
    passThreshold: 0.67,
    questions: [
      {
        id: 1,
        question: 'Centosy có bao nhiêu giá trị cốt lõi?',
        options: ['2', '3', '4', '5'],
        correctIndex: 2,
      },
      {
        id: 2,
        question: 'Giá trị "Tận tâm" thể hiện qua hành động nào?',
        options: [
          'Im lặng khi không hoàn thành đúng hạn',
          'Thông báo trước khi không thể hoàn thành đúng cam kết',
          'Làm thêm giờ mà không báo',
          'Chỉ làm việc được giao, không hơn',
        ],
        correctIndex: 1,
      },
      {
        id: 3,
        question: 'Giá trị "Đồng đội" nghĩa là?',
        options: [
          'Thành công cá nhân quan trọng hơn',
          'Không giúp đỡ đồng nghiệp để họ tự tiến bộ',
          'Thành công chung quan trọng hơn thành tích cá nhân',
          'Chỉ làm đúng việc của mình',
        ],
        correctIndex: 2,
      },
    ],
  },
]

export const lessonCategories: LessonCategory[] = [
  'Sản phẩm', 'Kỹ năng bán hàng', 'Quy trình', 'Văn hóa',
]
