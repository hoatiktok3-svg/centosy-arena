/**
 * AIQuestionGenerator — Tạo bộ câu hỏi bằng AI (Gemini)
 * Admin nhập chủ đề → AI sinh câu hỏi → lưu vào question_sets + room_questions
 */
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface GeneratedQuestion {
  question_text: string
  options: string[]        // 4 options
  correct_index: number    // 0-3
  explanation: string
}

interface Props {
  onClose: () => void
  onCreated: (setId: string, setTitle: string) => void
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_KEY) throw new Error('Chưa cấu hình VITE_GEMINI_API_KEY trong .env.local')
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } })?.error?.message || `Lỗi API: ${res.status}`)
  }
  const data = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function buildPrompt(topic: string, count: number, difficulty: string, language: string): string {
  return `Bạn là chuyên gia tạo câu hỏi trắc nghiệm cho nhân viên công ty Centosy (bán lẻ điện máy, điện gia dụng).

Tạo ${count} câu hỏi trắc nghiệm về chủ đề: "${topic}"
Độ khó: ${difficulty}
Ngôn ngữ: ${language}

Yêu cầu:
- Mỗi câu có đúng 4 lựa chọn (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Câu hỏi thực tế, liên quan đến công việc
- Có giải thích ngắn gọn cho đáp án đúng

Trả về JSON hợp lệ theo định dạng sau (không thêm text ngoài JSON):
{
  "questions": [
    {
      "question_text": "Câu hỏi?",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_index": 0,
      "explanation": "Giải thích tại sao đáp án A đúng"
    }
  ]
}`
}

const TOPIC_SUGGESTIONS = [
  'Quy trình bán hàng tại cửa hàng',
  'Chính sách bảo hành sản phẩm',
  'Kỹ năng xử lý khách hàng khó tính',
  'Kiến thức sản phẩm điện gia dụng',
  'Nội quy và văn hóa công ty',
  'Quy trình kho và kiểm hàng',
  'An toàn lao động',
  'Kỹ năng tư vấn khách hàng',
]

export default function AIQuestionGenerator({ onClose, onCreated }: Props) {
  const [topic, setTopic]         = useState('')
  const [count, setCount]         = useState(10)
  const [difficulty, setDifficulty] = useState('trung bình')
  const [setTitle, setSetTitle]   = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [preview, setPreview]     = useState<GeneratedQuestion[]>([])
  const [error, setError]         = useState('')
  const [step, setStep]           = useState<'form' | 'preview'>('form')
  const noKey = !GEMINI_KEY

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Nhập chủ đề câu hỏi.'); return }
    if (!setTitle.trim()) { setError('Nhập tên bộ câu hỏi.'); return }
    setError(''); setGenerating(true)
    try {
      const raw = await callGemini(buildPrompt(topic.trim(), count, difficulty, 'Tiếng Việt'))
      // Extract JSON from response
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('AI trả về định dạng không hợp lệ. Thử lại.')
      const parsed = JSON.parse(jsonMatch[0]) as { questions: GeneratedQuestion[] }
      if (!parsed.questions?.length) throw new Error('Không tạo được câu hỏi. Thử lại.')
      setPreview(parsed.questions)
      setStep('preview')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!preview.length) return
    setSaving(true); setError('')
    try {
      // 1. Create question_set
      const { data: qs, error: qsErr } = await supabase
        .from('question_sets')
        .insert({ title: setTitle.trim(), description: `Chủ đề: ${topic} · ${preview.length} câu · ${difficulty}`, is_active: true })
        .select('id')
        .single()
      if (qsErr || !qs) throw new Error(qsErr?.message || 'Không tạo được bộ câu hỏi')

      // 2. Insert room_questions
      const rows = preview.map((q, i) => ({
        question_set_id: qs.id,
        question_text:   q.question_text,
        options:         q.options,
        correct_index:   q.correct_index,
        explanation:     q.explanation || '',
        sort_order:      i,
      }))
      const { error: rqErr } = await supabase.from('room_questions').insert(rows)
      if (rqErr) throw new Error(rqErr.message)

      onCreated(qs.id, setTitle.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi lưu câu hỏi')
      setSaving(false)
    }
  }

  const BRAND = '#E94E1B'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl"
           style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
             style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-black text-white text-base">Tạo câu hỏi bằng AI</p>
              <p className="text-xs text-gray-400">Powered by Gemini 1.5 Flash</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>✕</button>
        </div>

        <div className="p-5 space-y-4">

          {/* No API key warning */}
          {noKey && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.3)' }}>
              <p className="font-bold text-orange-400 mb-1">⚠️ Chưa cấu hình Gemini API Key</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Thêm vào file <code className="text-orange-300">.env.local</code>:<br/>
                <code className="text-green-400">VITE_GEMINI_API_KEY=your_key_here</code><br/>
                Lấy key miễn phí tại: <span className="text-blue-400">aistudio.google.com</span>
              </p>
            </div>
          )}

          {step === 'form' && (
            <>
              {/* Set title */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Tên bộ câu hỏi</label>
                <input
                  value={setTitle}
                  onChange={e => setSetTitle(e.target.value)}
                  placeholder="VD: Kiến thức sản phẩm tháng 6"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Chủ đề câu hỏi</label>
                <input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Nhập chủ đề hoặc chọn gợi ý bên dưới..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none mb-2"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => setTopic(s)}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                            style={{
                              background: topic === s ? `${BRAND}22` : 'rgba(255,255,255,0.05)',
                              border: topic === s ? `1px solid ${BRAND}66` : '1px solid rgba(255,255,255,0.08)',
                              color: topic === s ? BRAND : '#aaa',
                            }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count + Difficulty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Số câu hỏi</label>
                  <select value={count} onChange={e => setCount(Number(e.target.value))}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {[5, 8, 10, 15, 20].map(n => <option key={n} value={n}>{n} câu</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Độ khó</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <option value="dễ">Dễ</option>
                    <option value="trung bình">Trung bình</option>
                    <option value="khó">Khó</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-red-400 text-xs px-1">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={generating || noKey}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40"
                style={{ background: generating ? '#333' : `linear-gradient(135deg, ${BRAND}, #ff6b35)` }}>
                {generating ? '⏳ Đang tạo câu hỏi...' : '✨ Tạo câu hỏi bằng AI'}
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-white">✅ {preview.length} câu hỏi đã tạo</p>
                <button onClick={() => setStep('form')} className="text-xs text-gray-400 underline">← Tạo lại</button>
              </div>

              {/* Preview questions */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {preview.map((q, i) => (
                  <div key={i} className="rounded-xl p-3.5 text-sm"
                       style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <p className="text-white font-semibold mb-2">
                      <span className="text-gray-500 mr-1">#{i+1}</span> {q.question_text}
                    </p>
                    <div className="grid grid-cols-1 gap-1 mb-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5"
                             style={{
                               background: oi === q.correct_index ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                               border: oi === q.correct_index ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                               color: oi === q.correct_index ? '#10b981' : '#888',
                             }}>
                          {oi === q.correct_index ? '✓' : String.fromCharCode(65+oi) + '.'} {opt}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-gray-500 italic">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40"
                style={{ background: saving ? '#333' : 'linear-gradient(135deg, #10b981, #059669)' }}>
                {saving ? '💾 Đang lưu...' : `💾 Lưu bộ câu hỏi "${setTitle}"`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
