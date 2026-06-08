/**
 * QuestionUploader — Tải lên bộ câu hỏi từ file JSON / CSV
 * Hỗ trợ file xuất từ ChatGPT, Excel, Google Sheets
 * Format: JSON chuẩn hoặc CSV (câu hỏi, A, B, C, D, đáp án đúng, giải thích)
 */
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface ParsedQuestion {
  question_text: string
  options: string[]        // 4 lựa chọn
  correct_index: number    // 0-3
  explanation: string
}

interface Props {
  onClose:   () => void
  onCreated: (setId: string, setTitle: string) => void
}

// ── Parsers ──────────────────────────────────────────────

function parseJSON(text: string): { title: string; questions: ParsedQuestion[] } | null {
  try {
    const raw = JSON.parse(text)
    // Format 1: { title, questions: [{question_text, options, correct_index, explanation}] }
    if (Array.isArray(raw.questions)) {
      return {
        title: raw.title || raw.name || 'Bộ câu hỏi import',
        questions: raw.questions.map((q: Record<string, unknown>) => ({
          question_text: String(q.question_text || q.question || q.câu_hỏi || ''),
          options: Array.isArray(q.options) ? q.options.map(String)
            : [q.A, q.B, q.C, q.D].filter(Boolean).map(String),
          correct_index: typeof q.correct_index === 'number' ? q.correct_index
            : typeof q.answer === 'number' ? q.answer
            : ['A','B','C','D'].indexOf(String(q.correct || q.answer || 'A').toUpperCase()),
          explanation: String(q.explanation || q.giải_thích || ''),
        })).filter((q: ParsedQuestion) => q.question_text && q.options.length >= 2),
      }
    }
    // Format 2: just an array
    if (Array.isArray(raw)) {
      return {
        title: 'Bộ câu hỏi import',
        questions: raw.map((q: Record<string, unknown>) => ({
          question_text: String(q.question_text || q.question || q.câu_hỏi || ''),
          options: Array.isArray(q.options) ? q.options.map(String)
            : [q.A, q.B, q.C, q.D].filter(Boolean).map(String),
          correct_index: typeof q.correct_index === 'number' ? q.correct_index
            : ['A','B','C','D'].indexOf(String(q.correct || q.answer || 'A').toUpperCase()),
          explanation: String(q.explanation || q.giải_thích || ''),
        })).filter((q: ParsedQuestion) => q.question_text && q.options.length >= 2),
      }
    }
    return null
  } catch { return null }
}

function parseCSV(text: string): { title: string; questions: ParsedQuestion[] } | null {
  try {
    const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) return null

    // Detect separator
    const sep = lines[0].includes('\t') ? '\t' : ','

    const header = lines[0].split(sep).map(h => h.toLowerCase().trim().replace(/"/g, ''))
    const colIdx = {
      q:    header.findIndex(h => h.includes('câu') || h.includes('question') || h.includes('nội dung')),
      a:    header.findIndex(h => h === 'a' || h.includes('lựa chọn a') || h === 'option a'),
      b:    header.findIndex(h => h === 'b' || h.includes('lựa chọn b') || h === 'option b'),
      c:    header.findIndex(h => h === 'c' || h.includes('lựa chọn c') || h === 'option c'),
      d:    header.findIndex(h => h === 'd' || h.includes('lựa chọn d') || h === 'option d'),
      ans:  header.findIndex(h => h.includes('đáp') || h.includes('answer') || h.includes('correct') || h === 'đúng'),
      exp:  header.findIndex(h => h.includes('giải') || h.includes('explain') || h.includes('ghi chú')),
    }

    // Fallback: positional (Q, A, B, C, D, answer, explanation)
    if (colIdx.q === -1) colIdx.q = 0
    if (colIdx.a === -1) colIdx.a = 1
    if (colIdx.b === -1) colIdx.b = 2
    if (colIdx.c === -1) colIdx.c = 3
    if (colIdx.d === -1) colIdx.d = 4
    if (colIdx.ans === -1) colIdx.ans = 5
    if (colIdx.exp === -1) colIdx.exp = 6

    const questions: ParsedQuestion[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
      const q = cols[colIdx.q] || ''
      const opts = [cols[colIdx.a], cols[colIdx.b], cols[colIdx.c], cols[colIdx.d]].filter(Boolean)
      if (!q || opts.length < 2) continue

      const ansRaw = cols[colIdx.ans] || 'A'
      const correctIdx = ['A','B','C','D'].indexOf(ansRaw.toUpperCase().trim())

      questions.push({
        question_text: q,
        options: opts,
        correct_index: correctIdx >= 0 ? correctIdx : 0,
        explanation: colIdx.exp >= 0 ? (cols[colIdx.exp] || '') : '',
      })
    }
    return questions.length > 0
      ? { title: 'Bộ câu hỏi import', questions }
      : null
  } catch { return null }
}

// ── ChatGPT prompt template ───────────────────────────────
const CHATGPT_PROMPT = `Tạo 10 câu hỏi trắc nghiệm về chủ đề: [CHỦ ĐỀ CỦA BẠN]

Trả về JSON theo đúng định dạng sau (không thêm text ngoài JSON):
{
  "title": "Tên bộ câu hỏi",
  "questions": [
    {
      "question_text": "Nội dung câu hỏi?",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correct_index": 0,
      "explanation": "Giải thích tại sao đáp án A đúng"
    }
  ]
}`

const BRAND = '#E94E1B'

export default function QuestionUploader({ onClose, onCreated }: Props) {
  const [parsed, setParsed]     = useState<{ title: string; questions: ParsedQuestion[] } | null>(null)
  const [setTitle, setSetTitle] = useState('')
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [fileName, setFileName] = useState('')
  const [step, setStep]         = useState<'upload' | 'preview'>('upload')
  const [copied, setCopied]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError(''); setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      let result: { title: string; questions: ParsedQuestion[] } | null = null

      if (file.name.endsWith('.json')) {
        result = parseJSON(text)
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
        result = parseCSV(text)
        if (!result) result = parseJSON(text) // fallback
      } else {
        // Try both
        result = parseJSON(text) || parseCSV(text)
      }

      if (!result || result.questions.length === 0) {
        setError('Không đọc được file. Kiểm tra định dạng JSON hoặc CSV (xem mẫu bên dưới).')
        return
      }
      setParsed(result)
      setSetTitle(result.title)
      setStep('preview')
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleSave = async () => {
    if (!parsed || !setTitle.trim()) { setError('Nhập tên bộ câu hỏi.'); return }
    setSaving(true); setError('')
    try {
      const { data: qs, error: qsErr } = await supabase
        .from('question_sets')
        .insert({ title: setTitle.trim(), description: `Import từ file · ${parsed.questions.length} câu`, is_active: true })
        .select('id').single()
      if (qsErr || !qs) throw new Error(qsErr?.message || 'Lỗi tạo bộ câu hỏi')

      const rows = parsed.questions.map((q, i) => ({
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
      setError(e instanceof Error ? e.message : 'Lỗi lưu')
      setSaving(false)
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(CHATGPT_PROMPT).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl"
           style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📂</span>
            <div>
              <p className="font-black text-white text-base">Tải lên bộ câu hỏi</p>
              <p className="text-xs text-gray-400">JSON · CSV · TXT từ ChatGPT / Excel</p>
            </div>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {step === 'upload' && (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 py-10 rounded-2xl cursor-pointer transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <span className="text-4xl">📄</span>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">Kéo thả file vào đây</p>
                  <p className="text-gray-500 text-xs mt-1">hoặc click để chọn file</p>
                </div>
                <p className="text-xs text-gray-600">Hỗ trợ: .json · .csv · .txt · .tsv</p>
                <input ref={fileRef} type="file" accept=".json,.csv,.txt,.tsv"
                       className="hidden"
                       onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                     style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                  {error}
                </div>
              )}

              {/* ChatGPT template */}
              <div className="rounded-xl overflow-hidden"
                   style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                     style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💬</span>
                    <p className="text-xs font-bold text-gray-300">Prompt mẫu cho ChatGPT</p>
                  </div>
                  <button onClick={copyPrompt}
                          className="text-xs px-3 py-1 rounded-lg font-bold transition-all"
                          style={{
                            background: copied ? 'rgba(16,185,129,0.15)' : `rgba(233,78,27,0.15)`,
                            color: copied ? '#10b981' : BRAND,
                            border: copied ? '1px solid rgba(16,185,129,0.3)' : `1px solid ${BRAND}44`,
                          }}>
                    {copied ? '✓ Đã copy' : 'Copy prompt'}
                  </button>
                </div>
                <div className="px-4 py-3 max-h-36 overflow-y-auto">
                  <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed font-mono">
                    {CHATGPT_PROMPT}
                  </pre>
                </div>
              </div>

              {/* Instructions */}
              <div className="rounded-xl p-4 space-y-2"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold text-gray-300 mb-2">📋 Hướng dẫn nhanh</p>
                {[
                  ['1', 'Copy prompt ở trên → paste vào ChatGPT, thay [CHỦ ĐỀ]'],
                  ['2', 'ChatGPT trả về JSON → Copy và lưu thành file .json'],
                  ['3', 'Tải file lên đây → xem trước → lưu vào thư viện'],
                ].map(([n, t]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                         style={{ background: `${BRAND}22`, color: BRAND }}>{n}</div>
                    <p className="text-xs text-gray-400 leading-relaxed">{t}</p>
                  </div>
                ))}

                {/* CSV format hint */}
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer select-none">▶ Dùng Excel/Google Sheets? (xem format CSV)</summary>
                  <div className="mt-2 rounded-lg p-3 overflow-x-auto"
                       style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs text-gray-500 mb-1">Header cột (hàng đầu tiên):</p>
                    <code className="text-xs text-green-400 whitespace-nowrap">
                      câu hỏi,A,B,C,D,đáp án đúng,giải thích
                    </code>
                    <p className="text-xs text-gray-500 mt-2 mb-1">Ví dụ hàng dữ liệu:</p>
                    <code className="text-xs text-gray-400 whitespace-nowrap">
                      Thủ đô Việt Nam là gì?,Hà Nội,Huế,Đà Nẵng,TP.HCM,A,Hà Nội là thủ đô từ 1010
                    </code>
                  </div>
                </details>
              </div>
            </>
          )}

          {step === 'preview' && parsed && (
            <>
              {/* Success badge */}
              <div className="flex items-center gap-3 p-3 rounded-xl"
                   style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-white text-sm">Đọc được {parsed.questions.length} câu hỏi</p>
                  <p className="text-xs text-gray-400">từ file <span className="text-gray-300">{fileName}</span></p>
                </div>
                <button onClick={() => { setStep('upload'); setParsed(null); setFileName('') }}
                        className="ml-auto text-xs text-gray-500 underline shrink-0">Đổi file</button>
              </div>

              {/* Title input */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Tên bộ câu hỏi
                </label>
                <input
                  value={setTitle}
                  onChange={e => setSetTitle(e.target.value)}
                  placeholder="VD: Kiến thức sản phẩm tháng 7"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>

              {/* Questions preview */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Xem trước câu hỏi
                </p>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {parsed.questions.map((q, i) => (
                    <div key={i} className="rounded-xl p-3.5"
                         style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p className="text-white text-sm font-semibold mb-2">
                        <span className="text-gray-500 mr-1.5">#{i + 1}</span>{q.question_text}
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5"
                               style={{
                                 background: oi === q.correct_index ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                                 border: oi === q.correct_index ? '1px solid rgba(16,185,129,0.4)' : '1px solid transparent',
                                 color: oi === q.correct_index ? '#10b981' : '#888',
                               }}>
                            {oi === q.correct_index ? '✓' : `${String.fromCharCode(65 + oi)}.`} {opt}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-gray-500 italic mt-1.5">💡 {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}
            </>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="shrink-0 px-5 pb-6 pt-3"
               style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleSave}
              disabled={saving || !setTitle.trim()}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40"
              style={{ background: saving ? '#333' : `linear-gradient(135deg, ${BRAND}, #ff6b35)` }}>
              {saving ? '💾 Đang lưu...' : `💾 Lưu ${parsed?.questions.length} câu vào thư viện`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
