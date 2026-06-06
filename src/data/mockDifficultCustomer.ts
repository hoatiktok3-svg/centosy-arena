import type { Block } from './mockUsers'

export type GameBlock = Extract<Block, 'Cửa hàng' | 'TMĐT' | 'KDTT'>

export interface CustomerOption {
  id: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface CustomerScenario {
  id: string
  scenario: string          // Mô tả tình huống
  customerMood: string      // Trạng thái khách hàng (emoji + label)
  options: CustomerOption[] // 4 lựa chọn
  scoreByOption: Record<'A' | 'B' | 'C' | 'D', number> // 25 / 15 / 5 / 0
  bestAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string       // Giải thích tại sao đáp án đó tốt nhất
  targetBlock: GameBlock
  difficulty: 'Dễ' | 'Trung bình' | 'Khó'
}

// ── Thang điểm ─────────────────────────────────────────────
// 25 = Xuất sắc | 15 = Chuẩn | 5 = Tạm được | 0 = Sai

export const mockCustomerScenarios: CustomerScenario[] = [

  // ─── TÌNH HUỐNG 1 ───────────────────────────────────────
  {
    id: 'dc01',
    scenario:
      'Khách mua đôi patin online 3 ngày trước, vừa nhắn tin phàn nàn: "Sản phẩm nhận được khác màu trong ảnh hoàn toàn. Tôi rất thất vọng, muốn hoàn tiền ngay!"',
    customerMood: '😡 Tức giận',
    options: [
      { id: 'A', text: 'Xin lỗi anh/chị, để em kiểm tra lại đơn hàng và ảnh thực tế. Em sẽ đối chiếu ngay và phản hồi trong 15 phút, nếu sai em hỗ trợ đổi hoặc hoàn tiền ngay cho anh/chị.' },
      { id: 'B', text: 'Dạ anh/chị ơi, màu có thể hơi khác do ánh sáng chụp ảnh ạ, anh/chị thông cảm giúp em nhé.' },
      { id: 'C', text: 'Anh/chị gửi ảnh thực tế cho em xem với, nếu đúng là sai màu em sẽ báo cấp trên.' },
      { id: 'D', text: 'Chính sách bên em không hỗ trợ đổi trả do lý do màu sắc ạ.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 15, D: 0 },
    bestAnswer: 'A',
    explanation:
      'Đáp án A thể hiện sự chủ động, cam kết thời gian cụ thể và giải pháp rõ ràng. Khách hàng tức giận cần được lắng nghe và thấy hành động ngay — không đổ lỗi, không trì hoãn.',
    targetBlock: 'TMĐT',
    difficulty: 'Trung bình',
  },

  // ─── TÌNH HUỐNG 2 ───────────────────────────────────────
  {
    id: 'dc02',
    scenario:
      'Khách đến cửa hàng, thử đôi patin 30 phút rồi nói: "Đôi này chạy không êm như tôi nghĩ, tôi muốn đổi ngay sang loại khác nhưng không muốn bù thêm tiền."',
    customerMood: '😤 Bực bội',
    options: [
      { id: 'A', text: 'Dạ em hiểu cảm giác của anh/chị. Để em giới thiệu cho anh/chị xem đôi cùng tầm giá có độ êm tốt hơn nhé, nếu hợp có thể đổi ngay tại quầy.' },
      { id: 'B', text: 'Anh/chị đã dùng thử rồi nên không đổi được theo chính sách ạ.' },
      { id: 'C', text: 'Dạ bên em không có đôi nào cùng giá êm hơn đâu ạ, đây là tốt nhất trong tầm giá rồi.' },
      { id: 'D', text: 'Anh/chị chờ em hỏi quản lý xem có được không nhé.' },
    ],
    scoreByOption: { A: 25, B: 0, C: 5, D: 15 },
    bestAnswer: 'A',
    explanation:
      'Đáp án A thể hiện sự đồng cảm, đưa ra giải pháp thực tế thay vì từ chối. Luôn tìm phương án WIN-WIN trước khi nói không với khách.',
    targetBlock: 'Cửa hàng',
    difficulty: 'Trung bình',
  },

  // ─── TÌNH HUỐNG 3 ───────────────────────────────────────
  {
    id: 'dc03',
    scenario:
      'Đại lý B2B gọi điện phàn nàn: "Tôi đặt 50 đôi từ 2 tuần trước mà chưa giao, bên anh đang làm ăn kiểu gì vậy? Tôi sẽ huỷ đơn và tìm nhà cung cấp khác!"',
    customerMood: '🔥 Nổi giận — sắp mất đơn',
    options: [
      { id: 'A', text: 'Dạ em hoàn toàn hiểu sự thất vọng của anh. Em xin lỗi về sự chậm trễ này. Em sẽ liên hệ ngay bộ phận kho để xác nhận tình trạng hàng và phản hồi anh trong 30 phút với thời gian giao hàng chính xác. Anh có thể cho em cơ hội xử lý không ạ?' },
      { id: 'B', text: 'Dạ do hàng bị tồn ở kho, bên em đang cố gắng xử lý ạ, anh thông cảm.' },
      { id: 'C', text: 'Nếu anh huỷ đơn thì bên em sẽ mất phí huỷ theo hợp đồng ạ.' },
      { id: 'D', text: 'Dạ anh chờ em chuyển máy cho quản lý ạ.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 0, D: 15 },
    bestAnswer: 'A',
    explanation:
      'Với đại lý B2B lớn sắp huỷ đơn, cần nhận lỗi ngay, cam kết thời gian xử lý cụ thể và xin cơ hội. Đừng đổ lỗi hay đe doạ phí huỷ — đó là cách tốt nhất để giữ mối quan hệ.',
    targetBlock: 'KDTT',
    difficulty: 'Khó',
  },

  // ─── TÌNH HUỐNG 4 ───────────────────────────────────────
  {
    id: 'dc04',
    scenario:
      'Khách inbox Shopee: "Sao hàng ghi 2–3 ngày mà 5 ngày chưa tới? Shop bán ảo à? 1 sao đây!" Khách chưa để lại đánh giá nhưng đang rất bực.',
    customerMood: '😠 Đang tức — sắp để 1 sao',
    options: [
      { id: 'A', text: 'Dạ shop xin lỗi anh/chị vì sự chậm trễ! Để shop kiểm tra mã vận đơn ngay. Nếu hàng bị trễ do vận chuyển, shop sẽ liên hệ đơn vị vận chuyển và cập nhật cho anh/chị trong 1 tiếng. Shop cam kết hỗ trợ đến khi anh/chị nhận được hàng ổn thoả ạ.' },
      { id: 'B', text: 'Dạ thời gian giao hàng phụ thuộc vào đơn vị vận chuyển ạ, shop không kiểm soát được.' },
      { id: 'C', text: 'Anh/chị cho shop xin mã đơn để kiểm tra ạ.' },
      { id: 'D', text: 'Dạ shop đã giao cho đơn vị vận chuyển đúng hạn rồi ạ, anh/chị liên hệ họ giúp shop nhé.' },
    ],
    scoreByOption: { A: 25, B: 0, C: 15, D: 0 },
    bestAnswer: 'A',
    explanation:
      'Đáp án A nhận lỗi ngay, hành động ngay và cam kết theo dõi đến cùng. Đừng đổ lỗi cho đơn vị vận chuyển — khách hàng mua từ shop, không mua từ shipper.',
    targetBlock: 'TMĐT',
    difficulty: 'Trung bình',
  },

  // ─── TÌNH HUỐNG 5 ───────────────────────────────────────
  {
    id: 'dc05',
    scenario:
      'Khách tại cửa hàng hỏi giá đôi patin cao cấp rồi nói: "Sao mắc vậy? Bên kia bán rẻ hơn 200k, anh giảm đi không thì tôi mua ngay."',
    customerMood: '🙄 So sánh giá — muốn ép giá',
    options: [
      { id: 'A', text: 'Dạ em hiểu anh/chị muốn có giá tốt nhất. Để em giải thích sự khác biệt: đôi này có bảo hành 12 tháng, vòng bi chính hãng và đế chống trượt cao cấp — những điểm bên kia có thể không có. Nếu anh/chị mua hôm nay em có thể hỗ trợ thêm phụ kiện miễn phí trị giá 100k.' },
      { id: 'B', text: 'Dạ thôi được, em giảm 200k cho anh/chị.' },
      { id: 'C', text: 'Bên đó rẻ hơn chắc chất lượng không bằng bên em đâu ạ.' },
      { id: 'D', text: 'Dạ giá em không giảm được, đây là giá niêm yết rồi ạ.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 5, D: 15 },
    bestAnswer: 'A',
    explanation:
      'Không cắt giá ngay — hãy bán giá trị trước. Giải thích sự khác biệt chất lượng và thêm giá trị thay vì giảm tiền. Giảm giá ngay làm khách nghi ngờ chất lượng và mất biên lợi nhuận.',
    targetBlock: 'Cửa hàng',
    difficulty: 'Khó',
  },

  // ─── TÌNH HUỐNG 6 ───────────────────────────────────────
  {
    id: 'dc06',
    scenario:
      'Khách mua online nhận hàng xong nhắn: "Sản phẩm ổn nhưng thùng bị móp khi giao. Tôi không biết có ảnh hưởng gì không, lo quá." Khách chưa tức, chỉ lo lắng.',
    customerMood: '😟 Lo lắng — cần trấn an',
    options: [
      { id: 'A', text: 'Dạ cảm ơn anh/chị đã báo ngay. Thùng móp thường không ảnh hưởng đến sản phẩm bên trong, nhưng để chắc chắn anh/chị kiểm tra giúp em: sản phẩm có xước, bể hay biến dạng gì không? Em sẽ hỗ trợ đổi mới hoàn toàn nếu phát hiện lỗi ạ.' },
      { id: 'B', text: 'Thùng móp bình thường thôi ạ, hàng bên trong không sao đâu.' },
      { id: 'C', text: 'Anh/chị chụp ảnh gửi em để em báo cấp trên xử lý.' },
      { id: 'D', text: 'Dạ em sẽ phản ánh với bên vận chuyển, anh/chị yên tâm nhé.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 15, D: 5 },
    bestAnswer: 'A',
    explanation:
      'Khách lo lắng cần được trấn an + hướng dẫn kiểm tra cụ thể + cam kết hỗ trợ nếu có vấn đề. Đừng phán định ngay "không sao đâu" mà chưa kiểm tra.',
    targetBlock: 'TMĐT',
    difficulty: 'Dễ',
  },

  // ─── TÌNH HUỐNG 7 ───────────────────────────────────────
  {
    id: 'dc07',
    scenario:
      'Chủ chuỗi 3 cửa hàng đang đàm phán đặt 200 đôi mỗi tháng nói: "Giá anh đưa ra quá cao so với đối thủ, không giảm thêm 15% thì tôi ký với họ rồi."',
    customerMood: '😐 Lạnh lùng — đang đàm phán',
    options: [
      { id: 'A', text: 'Dạ em hiểu anh cần giá cạnh tranh để vận hành tốt. Em không thể quyết định giảm 15% tại đây, nhưng để em trình lên cấp trên phương án hợp tác dài hạn — có thể kết hợp giảm giá + ưu tiên hàng mới + hỗ trợ marketing để tổng giá trị vượt hơn 15%. Anh cho em 24 giờ được không ạ?' },
      { id: 'B', text: 'Dạ được, em giảm 15% luôn cho anh.' },
      { id: 'C', text: 'Giá bên em đã là tốt nhất rồi ạ, anh cân nhắc lại đi.' },
      { id: 'D', text: 'Dạ anh ký với họ đi ạ, bên em không thể giảm được.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 5, D: 0 },
    bestAnswer: 'A',
    explanation:
      'Đàm phán B2B lớn không nên quyết định giảm giá ngay — sẽ tạo tiền lệ xấu. Hãy xin thời gian, đề xuất gói giá trị tổng thể và leo thang lên cấp trên để bảo vệ lợi nhuận đúng quy trình.',
    targetBlock: 'KDTT',
    difficulty: 'Khó',
  },

  // ─── TÌNH HUỐNG 8 ───────────────────────────────────────
  {
    id: 'dc08',
    scenario:
      'Khách comment công khai trên fanpage: "Mua hàng bên này về bị hỏng bánh xe sau 1 tuần, dịch vụ thì lờ tin nhắn suốt. Ai đang nghĩ mua hãy cân nhắc kỹ!" Bài đang có 15 like.',
    customerMood: '😤 Đang bức xúc công khai',
    options: [
      { id: 'A', text: 'Dạ chào anh/chị, shop rất tiếc khi anh/chị gặp trải nghiệm chưa tốt. Shop xin lỗi vì phản hồi chậm. Anh/chị có thể inbox riêng cho shop không ạ? Để shop kiểm tra đơn và hỗ trợ bảo hành bánh xe ngay cho anh/chị. Shop cam kết xử lý trong hôm nay.' },
      { id: 'B', text: 'Dạ shop không có trường hợp nào bị hỏng sau 1 tuần cả ạ, anh/chị dùng có đúng cách không?' },
      { id: 'C', text: 'Dạ anh/chị cho shop xin thông tin đơn hàng để kiểm tra ạ.' },
      { id: 'D', text: 'Dạ shop xin lỗi anh/chị, bên shop sẽ cố gắng cải thiện ạ.' },
    ],
    scoreByOption: { A: 25, B: 0, C: 15, D: 5 },
    bestAnswer: 'A',
    explanation:
      'Phàn nàn công khai cần phản hồi nhanh, chuyên nghiệp, không cãi lại và kéo về kênh riêng để xử lý. Đừng bao giờ đặt câu hỏi nghi ngờ khách trước mặt công chúng.',
    targetBlock: 'TMĐT',
    difficulty: 'Khó',
  },

  // ─── TÌNH HUỐNG 9 ───────────────────────────────────────
  {
    id: 'dc09',
    scenario:
      'Khách phụ huynh mua patin cho con 8 tuổi, lo lắng hỏi: "Sao đôi này không có khóa an toàn hả? Con tôi hay ngã lắm, mua về nhỡ xảy ra chuyện thì sao?"',
    customerMood: '😰 Lo lắng — cần tư vấn chuyên sâu',
    options: [
      { id: 'A', text: 'Dạ anh/chị yên tâm ạ! Đôi này có hệ thống khóa 3 điểm ôm chân rất chắc. Với bé 8 tuổi hay ngã, em khuyên anh/chị nên mua kèm bộ bảo hộ đầu gối + cổ tay — bên em có combo tiết kiệm 15%. Bé sẽ an toàn và học nhanh hơn nhiều ạ.' },
      { id: 'B', text: 'Dạ patin bây giờ an toàn lắm ạ, anh/chị không cần lo.' },
      { id: 'C', text: 'Dạ con bé thì nên mua loại rẻ hơn để tập trước ạ.' },
      { id: 'D', text: 'Anh/chị muốn mua loại có khóa an toàn thì bên em có đôi khác nhưng giá cao hơn ạ.' },
    ],
    scoreByOption: { A: 25, B: 5, C: 5, D: 15 },
    bestAnswer: 'A',
    explanation:
      'Khách lo lắng về an toàn của con — hãy trấn an bằng thông số kỹ thuật cụ thể, rồi upsell bộ bảo hộ một cách tự nhiên vì lợi ích thực sự của bé. Đây là cách bán hàng chân thành và hiệu quả.',
    targetBlock: 'Cửa hàng',
    difficulty: 'Dễ',
  },

  // ─── TÌNH HUỐNG 10 ──────────────────────────────────────
  {
    id: 'dc10',
    scenario:
      'Đại lý cũ liên hệ sau 6 tháng im lặng: "Tôi nghỉ bán hàng của bên anh vì lần trước giao hàng lỗi mà không xử lý tốt. Giờ tôi muốn thử lại nhưng cần cam kết từ bên anh."',
    customerMood: '😶 Lạnh nhạt — đang thử thách',
    options: [
      { id: 'A', text: 'Dạ em thực sự trân trọng việc anh cho bên em cơ hội thứ hai. Em xin lỗi về trải nghiệm lần trước — đó là điều bên em cần làm tốt hơn. Để em trình bày những cải tiến bên em đã làm trong 6 tháng qua và đề xuất cam kết SLA cụ thể cho đơn hàng của anh. Anh có thể gặp em 30 phút tuần này không ạ?' },
      { id: 'B', text: 'Dạ lần trước do tình huống đặc biệt ạ, bình thường bên em không vậy đâu.' },
      { id: 'C', text: 'Dạ anh cứ đặt thử một đơn nhỏ xem bên em có cải thiện chưa nhé.' },
      { id: 'D', text: 'Dạ anh muốn cam kết gì thì bên em cũng đáp ứng được hết ạ.' },
    ],
    scoreByOption: { A: 25, B: 0, C: 15, D: 5 },
    bestAnswer: 'A',
    explanation:
      'Với đại lý cũ quay lại sau sự cố, hãy nhận lỗi thật sự (không biện hộ), chứng minh sự cải thiện bằng con số và xin gặp mặt để xây dựng lại niềm tin. Đừng hứa hão hay đổ lỗi.',
    targetBlock: 'KDTT',
    difficulty: 'Khó',
  },
]

// ── Helpers ────────────────────────────────────────────────
export const SCORE_LABELS: Record<number, string> = {
  25: '⭐ Xuất sắc',
  15: '✅ Chuẩn',
  5:  '🟡 Tạm được',
  0:  '❌ Sai',
}

export const getScenariosByBlock = (block: GameBlock) =>
  mockCustomerScenarios.filter(s => s.targetBlock === block)

export const getScenarioById = (id: string) =>
  mockCustomerScenarios.find(s => s.id === id)

export const TOTAL_SCENARIOS = mockCustomerScenarios.length
export const MAX_SCORE_PER_GAME = mockCustomerScenarios.length * 25 // 250 điểm tối đa
