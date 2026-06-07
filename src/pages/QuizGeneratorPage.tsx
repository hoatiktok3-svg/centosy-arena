import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface GeneratedQuestion {
  id:       number
  question: string
  options:  string[]
  answer:   number  // index of correct option
}

interface GeneratedQuiz {
  id:        string
  topic:     string
  questions: GeneratedQuestion[]
  createdAt: string
}

const DRAFT_KEY = 'centosy_quiz_drafts'

function loadDrafts(): GeneratedQuiz[] {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) return JSON.parse(raw) as GeneratedQuiz[]
  } catch {}
  return []
}

function saveDrafts(drafts: GeneratedQuiz[]) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts))
}

// ── Mock quiz generation from topic ──────────────────────────────
// Returns a set of template questions tailored to the topic keyword.
// Real implementation would call an AI API with the topic as prompt.
function generateMockQuiz(topic: string): GeneratedQuestion[] {
  const t = topic.toLowerCase().trim()

  // Generic template questions with topic substitution
  const templates: Array<[string, string[], number]> = [
    [
      `Mục tiêu chính khi học về "${topic}" là gì?`,
      [`Nắm vững kiến thức cơ bản về ${topic}`, 'Ghi nhớ toàn bộ tài liệu', 'Đạt điểm cao nhất', 'Hoàn thành nhanh nhất'],
      0,
    ],
    [
      `Đâu là bước đầu tiên khi tiếp cận "${topic}"?`,
      ['Bắt đầu ngay mà không cần tìm hiểu', `Tìm hiểu tổng quan về ${topic}`, 'Nhờ người khác làm thay', 'Bỏ qua phần khó'],
      1,
    ],
    [
      `Kỹ năng nào quan trọng nhất khi làm việc với "${topic}"?`,
      ['Chỉ cần kinh nghiệm', `Kết hợp lý thuyết và thực hành về ${topic}`, 'Thuộc lòng quy trình', 'Chờ đồng nghiệp hướng dẫn'],
      1,
    ],
    [
      `Khi gặp vấn đề liên quan đến "${topic}", bạn nên làm gì?`,
      ['Bỏ qua vấn đề', 'Chờ ai đó giải quyết', `Phân tích và tìm giải pháp phù hợp với ${topic}`, 'Báo cáo ngay lên cấp trên'],
      2,
    ],
    [
      `Centosy Arena hỗ trợ học "${topic}" thông qua:`,
      ['Chỉ video', 'Chỉ bài kiểm tra', `Tài liệu, bài học, quiz và thực hành về ${topic}`, 'Không có hỗ trợ nào'],
      2,
    ],
  ]

  // Add topic-specific questions if recognizable
  if (t.includes('bán hàng') || t.includes('sales')) {
    templates.push(
      [
        'Trong bán hàng, điều quan trọng nhất khi tư vấn khách hàng là gì?',
        ['Bán được hàng nhanh nhất', 'Hiểu nhu cầu khách hàng và đưa ra giải pháp phù hợp', 'Chỉ giới thiệu sản phẩm đắt nhất', 'Giảm giá để bán được hàng'],
        1,
      ],
      [
        'KPI quan trọng nhất trong công việc bán hàng của Centosy là?',
        ['Số lần khách gọi điện', 'Số cuộc họp tổ chức', 'Doanh số và tỉ lệ chuyển đổi', 'Số email gửi đi'],
        2,
      ]
    )
  }

  if (t.includes('kho') || t.includes('warehouse')) {
    templates.push(
      [
        'Nguyên tắc FIFO trong quản lý kho nghĩa là gì?',
        ['Hàng đến sau xuất trước', 'Hàng đến trước xuất trước', 'Hàng giá rẻ xuất trước', 'Không có thứ tự cụ thể'],
        1,
      ]
    )
  }

  return templates.slice(0, 5).map((t, i) => ({
    id: i + 1,
    question: t[0],
    options:  t[1],
    answer:   t[2],
  }))
}

// ── Component ─────────────────────────────────────────────────────
export default function QuizGeneratorPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const canView = canAccessAdminPanel(currentUser?.role)

  const [topic,     setTopic]     = useState('')
  const [generated, setGenerated] = useState<GeneratedQuestion[] | null>(null)
  const [drafts,    setDrafts]    = useState<GeneratedQuiz[]>(loadDrafts)
  const [generating, setGenerating] = useState(false)
  const [savedMsg,   setSavedMsg]   = useState(false)
  const [viewDraft,  setViewDraft]  = useState<GeneratedQuiz | null>(null)

  function handleGenerate() {
    if (!topic.trim()) return
    setGenerating(true)
    // Simulate AI processing delay
    setTimeout(() => {
      setGenerated(generateMockQuiz(topic.trim()))
      setGenerating(false)
    }, 800)
  }

  function handleSaveDraft() {
    if (!generated || !topic.trim()) return
    const newDraft: GeneratedQuiz = {
      id:        `draft_${Date.now()}`,
      topic:     topic.trim(),
      questions: generated,
      createdAt: new Date().toISOString(),
    }
    const updated = [newDraft, ...drafts].slice(0, 20)
    saveDrafts(updated)
    setDrafts(updated)
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  function handleDeleteDraft(id: string) {
    const updated = drafts.filter(d => d.id !== id)
    saveDrafts(updated)
    setDrafts(updated)
    if (viewDraft?.id === id) setViewDraft(null)
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              AI Quiz Generator
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Tạo quiz từ chủ đề · lưu draft</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.25)', fontSize: '16px' }}>
            🤖
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {!canView ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '40px' }}>🔒</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Không có quyền truy cập</p>
            </div>
          ) : viewDraft ? (
            /* ── Draft viewer ── */
            <>
              <button onClick={() => setViewDraft(null)} className="flex items-center gap-2 mt-4 mb-3"
                      style={{ fontSize: '12px', color: '#585858' }}>
                ← Quay lại
              </button>
              <p className="text-white font-black mb-4" style={{ fontSize: '15px' }}>
                📝 {viewDraft.topic}
              </p>
              <div className="flex flex-col gap-3">
                {viewDraft.questions.map(q => (
                  <div key={q.id} className="rounded-xl px-3.5 py-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <p className="text-white font-semibold mb-2" style={{ fontSize: '12px' }}>
                      {q.id}. {q.question}
                    </p>
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 mt-1.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                             style={{
                               background: i === q.answer ? 'rgba(52,211,153,0.2)' : '#1a1a1a',
                               border: i === q.answer ? '1px solid #34d399' : '1px solid #2a2a2a',
                             }}>
                          {i === q.answer && <span style={{ fontSize: '8px', color: '#34d399' }}>✓</span>}
                        </div>
                        <p style={{ fontSize: '11px', color: i === q.answer ? '#34d399' : '#787878' }}>{opt}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* ── Input area ── */}
              <div className="mt-5">
                <p className="font-bold text-white mb-2" style={{ fontSize: '13px' }}>Nhập chủ đề</p>
                <div className="flex gap-2">
                  <input
                    value={topic}
                    onChange={e => { setTopic(e.target.value); setGenerated(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    placeholder="VD: Bán hàng, Quản lý kho, An toàn lao động..."
                    className="flex-1 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-600 outline-none"
                    style={{ background: '#111', border: '1px solid #2a2a2a', fontSize: '13px' }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !topic.trim()}
                    className="shrink-0 px-3 py-2.5 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: '12px',
                      background: generating ? 'rgba(192,132,252,0.08)' : 'rgba(192,132,252,0.15)',
                      border: '1px solid rgba(192,132,252,0.3)',
                      color: '#c084fc',
                      cursor: generating || !topic.trim() ? 'not-allowed' : 'pointer',
                    }}>
                    {generating ? '⏳' : '🤖 Tạo'}
                  </button>
                </div>
                <p style={{ fontSize: '10px', color: '#383838', marginTop: 6 }}>
                  * Đây là mock generator — tích hợp AI API thực trong bản production.
                </p>
              </div>

              {/* ── Generated questions ── */}
              {generated && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-white" style={{ fontSize: '13px' }}>
                      ✨ {generated.length} câu hỏi được tạo
                    </p>
                    <button
                      onClick={handleSaveDraft}
                      className="px-3 py-1.5 rounded-xl font-bold"
                      style={{
                        fontSize: '11px',
                        background: savedMsg ? 'rgba(52,211,153,0.12)' : 'rgba(233,78,27,0.12)',
                        border: savedMsg ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(233,78,27,0.3)',
                        color: savedMsg ? '#34d399' : '#E94E1B',
                      }}>
                      {savedMsg ? '✓ Đã lưu' : '💾 Lưu draft'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {generated.map(q => (
                      <div key={q.id} className="rounded-xl px-3.5 py-3"
                           style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                        <p className="text-white font-semibold mb-2" style={{ fontSize: '12px' }}>
                          {q.id}. {q.question}
                        </p>
                        {q.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2 mt-1.5">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                                 style={{
                                   background: i === q.answer ? 'rgba(52,211,153,0.2)' : '#1a1a1a',
                                   border: i === q.answer ? '1px solid #34d399' : '1px solid #2a2a2a',
                                 }}>
                              {i === q.answer && <span style={{ fontSize: '8px', color: '#34d399' }}>✓</span>}
                            </div>
                            <p style={{ fontSize: '11px', color: i === q.answer ? '#34d399' : '#787878' }}>{opt}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Draft list ── */}
              {drafts.length > 0 && (
                <div className="mt-6">
                  <p className="font-bold text-white mb-3" style={{ fontSize: '13px' }}>
                    Drafts đã lưu ({drafts.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {drafts.map(d => (
                      <div key={d.id}
                           className="rounded-xl px-3.5 py-3 flex items-center gap-3"
                           style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                        <span style={{ fontSize: '16px' }}>📝</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>{d.topic}</p>
                          <p style={{ fontSize: '10px', color: '#585858' }}>
                            {d.questions.length} câu · {new Date(d.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <button
                          onClick={() => setViewDraft(d)}
                          className="px-2.5 py-1 rounded-lg font-bold"
                          style={{ fontSize: '10px', background: '#1a1a1a', border: '1px solid #252525', color: '#888' }}>
                          Xem
                        </button>
                        <button
                          onClick={() => handleDeleteDraft(d.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#484848', fontSize: '12px' }}>
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
