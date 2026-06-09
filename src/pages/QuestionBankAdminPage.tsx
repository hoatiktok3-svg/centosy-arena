/**
 * QuestionBankAdminPage — Quản lý ngân hàng câu hỏi
 * Fullscreen overlay, chỉ admin truy cập được.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { canAccessAdminPanel } from '../lib/permissions'
import {
  getQuestionBank,
  getQuestionBankStats,
  getDistinctFilterValues,
  updateQuestion,
  approveQuestion,
  toggleQuestionActive,
  deleteQuestion,
  QuestionBankRow,
  QuestionBankFilters,
  QuestionBankStats,
  UpdateQuestionData,
} from '../services/questionBankService'

const BRAND = '#E94E1B'

interface Props { onClose: () => void }

// ══════════════════════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════════════════════
interface ValidationResult { errors: string[]; warnings: string[] }

function validateQuestion(d: UpdateQuestionData): ValidationResult {
  const errors: string[]   = []
  const warnings: string[] = []

  if (!d.question?.trim())  errors.push('Câu hỏi không được rỗng.')
  if (!d.option_a?.trim())  errors.push('Phương án A không được rỗng.')
  if (!d.option_b?.trim())  errors.push('Phương án B không được rỗng.')
  if (!d.option_c?.trim())  errors.push('Phương án C không được rỗng.')
  if (!d.option_d?.trim())  errors.push('Phương án D không được rỗng.')
  if (!d.correct_answer || !['A','B','C','D'].includes(d.correct_answer.toUpperCase())) {
    errors.push('Đáp án đúng phải là A, B, C hoặc D.')
  }
  if ((d.time_limit ?? 0) <= 0) errors.push('Thời gian trả lời phải > 0 giây.')
  if ((d.score ?? 0) < 0)       errors.push('Điểm phải >= 0.')

  // Check 2 options giống nhau
  const opts = [d.option_a, d.option_b, d.option_c, d.option_d]
    .filter(Boolean).map(s => s!.trim().toLowerCase())
  const seen = new Set<string>()
  for (const o of opts) {
    if (seen.has(o)) { errors.push('Có 2 phương án giống nhau.'); break }
    seen.add(o)
  }

  // Warning: đáp án đúng dài bất thường
  const ans = d.correct_answer?.toUpperCase()
  const ansText = ans === 'A' ? d.option_a : ans === 'B' ? d.option_b
    : ans === 'C' ? d.option_c : d.option_d
  const otherMaxLen = Math.max(
    (d.option_a?.length ?? 0), (d.option_b?.length ?? 0),
    (d.option_c?.length ?? 0), (d.option_d?.length ?? 0),
  )
  if ((ansText?.length ?? 0) > otherMaxLen * 1.5 && (ansText?.length ?? 0) > 60) {
    warnings.push('Đáp án đúng dài bất thường — người dùng thường chọn câu dài nhất.')
  }

  return { errors, warnings }
}

// ══════════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════════
interface Toast { id: number; msg: string; type: 'ok' | 'err' | 'warn' }
let _toastId = 0

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const show = useCallback((msg: string, type: Toast['type'] = 'ok') => {
    const id = ++_toastId
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])
  return { toasts, show }
}

function ToastList({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 w-[90vw] max-w-[360px] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="rounded-2xl px-4 py-3 text-center font-semibold shadow-xl"
             style={{
               fontSize: '13px',
               background: t.type === 'ok' ? 'rgba(52,211,153,0.15)' : t.type === 'err' ? 'rgba(239,68,68,0.15)' : 'rgba(251,146,60,0.15)',
               border: `1px solid ${t.type === 'ok' ? 'rgba(52,211,153,0.35)' : t.type === 'err' ? 'rgba(239,68,68,0.35)' : 'rgba(251,146,60,0.35)'}`,
               color:  t.type === 'ok' ? '#34d399' : t.type === 'err' ? '#f87171' : '#fb923c',
               backdropFilter: 'blur(12px)',
             }}>
          {t.type === 'ok' ? '✅' : t.type === 'err' ? '❌' : '⚠️'} {t.msg}
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════
function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl px-3 py-3 shrink-0"
         style={{ background: `${color}08`, border: `1px solid ${color}22`, minWidth: 80 }}>
      <span style={{ fontSize: '18px', marginBottom: 2 }}>{icon}</span>
      <p className="font-black" style={{ fontSize: '18px', color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '10px', color: '#585858', marginTop: 3, textAlign: 'center', lineHeight: 1.3 }}>{label}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// DIFFICULTY BADGE
// ══════════════════════════════════════════════════════════════
function DiffBadge({ diff }: { diff: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    'dễ':        { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
    'trung bình':{ bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' },
    'khó':       { bg: 'rgba(239,68,68,0.12)',   color: '#f87171' },
  }
  const key = (diff ?? '').toLowerCase()
  const s = map[key] ?? { bg: '#1e1e1e', color: '#585858' }
  return (
    <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', fontWeight: 700, ...s }}>
      {diff ?? '—'}
    </span>
  )
}

// ══════════════════════════════════════════════════════════════
// QUESTION CARD (list item)
// ══════════════════════════════════════════════════════════════
function QuestionCard({ q, onEdit, onApprove, onToggle, onDelete }: {
  q: QuestionBankRow
  onEdit:    (q: QuestionBankRow) => void
  onApprove: (q: QuestionBankRow) => void
  onToggle:  (q: QuestionBankRow) => void
  onDelete:  (q: QuestionBankRow) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const answerMap: Record<string, string> = {
    A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d,
  }
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
         style={{
           background: '#111',
           border: q.is_active
             ? q.is_approved ? '1px solid #2a2a2a' : '1px solid rgba(251,146,60,0.25)'
             : '1px solid #1a1a1a',
           opacity: q.is_active ? 1 : 0.6,
         }}>
      {/* Status bar top */}
      <div style={{ height: 2, background: q.is_approved ? (q.is_active ? 'rgba(52,211,153,0.4)' : '#2a2a2a') : 'rgba(251,146,60,0.4)' }} />

      {/* Header row */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-start gap-2.5">
          {/* Expand toggle */}
          <button onClick={() => setExpanded(e => !e)}
            className="mt-0.5 shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-transform"
            style={{ background: '#1e1e1e', color: '#585858', fontSize: '10px', transform: expanded ? 'rotate(90deg)' : '' }}>
            ›
          </button>
          {/* Question text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-snug" style={{ fontSize: '13px', color: '#e0e0e0' }}>
              {q.question}
            </p>
            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <DiffBadge diff={q.difficulty} />
              {q.department && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', background: '#1e1e1e', color: '#686868', border: '1px solid #2a2a2a' }}>
                  {q.department}
                </span>
              )}
              {q.topic && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', background: '#1e1e1e', color: '#686868', border: '1px solid #2a2a2a' }}>
                  📚 {q.topic}
                </span>
              )}
              <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', background: 'rgba(233,78,27,0.08)', color: BRAND, border: `1px solid rgba(233,78,27,0.2)` }}>
                {q.score}đ · {q.time_limit}s
              </span>
              {q.quality_score != null && (
                <span className="rounded-full px-2 py-0.5" style={{
                  fontSize: '10px', fontWeight: 700,
                  background: q.quality_score >= 80 ? 'rgba(52,211,153,0.1)' : q.quality_score >= 50 ? 'rgba(251,146,60,0.1)' : 'rgba(239,68,68,0.1)',
                  color:      q.quality_score >= 80 ? '#34d399' : q.quality_score >= 50 ? '#fb923c' : '#f87171',
                }}>QC {q.quality_score}</span>
              )}
              {!q.is_approved && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(251,146,60,0.1)', color: '#fb923c' }}>
                  ⏳ Chưa duyệt
                </span>
              )}
              {!q.is_active && (
                <span className="rounded-full px-2 py-0.5" style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                  🔒 Đã khóa
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: options + explanation */}
      {expanded && (
        <div className="px-4 pb-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1.5">
            {(['A','B','C','D'] as const).map(letter => {
              const text = answerMap[letter]
              const isCorrect = q.correct_answer?.toUpperCase() === letter
              return (
                <div key={letter} className="rounded-xl px-3 py-2 flex items-start gap-2"
                     style={{
                       background: isCorrect ? 'rgba(52,211,153,0.1)' : '#161616',
                       border: isCorrect ? '1px solid rgba(52,211,153,0.3)' : '1px solid #222',
                     }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: isCorrect ? '#34d399' : '#484848', flexShrink: 0, marginTop: 1 }}>
                    {letter}
                  </span>
                  <span style={{ fontSize: '11px', color: isCorrect ? '#d0fce8' : '#707070', lineHeight: 1.4 }}>{text}</span>
                </div>
              )
            })}
          </div>
          {q.explanation && (
            <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
              <p style={{ fontSize: '11px', color: '#6b9fd4', fontWeight: 700, marginBottom: 4 }}>💡 Giải thích</p>
              <p style={{ fontSize: '12px', color: '#8cb4d4', lineHeight: 1.6 }}>{q.explanation}</p>
            </div>
          )}
          {(q.skill_tag || q.trap_type) && (
            <div className="flex gap-2 flex-wrap">
              {q.skill_tag  && <span style={{ fontSize: '10px', color: '#686868' }}>🎯 {q.skill_tag}</span>}
              {q.trap_type  && <span style={{ fontSize: '10px', color: '#686868' }}>🪤 {q.trap_type}</span>}
              <span style={{ fontSize: '10px', color: '#484848' }}>src: {q.source_type}</span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 pb-3.5 flex gap-2">
        <button onClick={() => onEdit(q)}
          className="flex-1 rounded-xl py-2 font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: '11px', background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.2)', color: BRAND }}>
          ✏️ Sửa
        </button>
        {!q.is_approved && (
          <button onClick={() => onApprove(q)}
            className="flex-1 rounded-xl py-2 font-semibold transition-all active:scale-[0.97]"
            style={{ fontSize: '11px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
            ✅ Duyệt
          </button>
        )}
        <button onClick={() => onToggle(q)}
          className="flex-1 rounded-xl py-2 font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: '11px', background: '#161616', border: '1px solid #252525', color: q.is_active ? '#fb923c' : '#34d399' }}>
          {q.is_active ? '🔒 Khóa' : '🔓 Mở'}
        </button>
        <button onClick={() => onDelete(q)}
          className="rounded-xl py-2 px-3 font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: '11px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
          🗑
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// EDIT MODAL
// ══════════════════════════════════════════════════════════════
interface EditFormState {
  question:       string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  correct_answer: string
  explanation:    string
  difficulty:     string
  department:     string
  skill_tag:      string
  trap_type:      string
  topic:          string
  time_limit:     number
  score:          number
  quality_score:  number
  is_approved:    boolean
  is_active:      boolean
}

function fromRow(q: QuestionBankRow): EditFormState {
  return {
    question:       q.question,
    option_a:       q.option_a,
    option_b:       q.option_b,
    option_c:       q.option_c,
    option_d:       q.option_d,
    correct_answer: q.correct_answer?.toUpperCase() ?? 'A',
    explanation:    q.explanation ?? '',
    difficulty:     q.difficulty  ?? '',
    department:     q.department  ?? '',
    skill_tag:      q.skill_tag   ?? '',
    trap_type:      q.trap_type   ?? '',
    topic:          q.topic       ?? '',
    time_limit:     q.time_limit,
    score:          q.score,
    quality_score:  q.quality_score ?? 0,
    is_approved:    q.is_approved,
    is_active:      q.is_active,
  }
}

function EditModal({ question, onSave, onClose, saving }: {
  question:  QuestionBankRow
  onSave:    (data: UpdateQuestionData) => Promise<void>
  onClose:   () => void
  saving:    boolean
}) {
  const [form, setForm]           = useState<EditFormState>(() => fromRow(question))
  const [errors, setErrors]       = useState<string[]>([])
  const [warnings, setWarnings]   = useState<string[]>([])
  const [warnAccepted, setWarnAccepted] = useState(false)

  function set<K extends keyof EditFormState>(key: K, val: EditFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }))
    setErrors([]); setWarnings([]); setWarnAccepted(false)
  }

  const handleSave = () => {
    const data: UpdateQuestionData = {
      ...form,
      correct_answer: form.correct_answer.toUpperCase(),
      explanation:    form.explanation.trim() || null,
      difficulty:     form.difficulty.trim()  || null,
      department:     form.department.trim()  || null,
      skill_tag:      form.skill_tag.trim()   || null,
      trap_type:      form.trap_type.trim()   || null,
      topic:          form.topic.trim()       || null,
    }
    const { errors: errs, warnings: warns } = validateQuestion(data)
    if (errs.length > 0) { setErrors(errs); return }
    if (warns.length > 0 && !warnAccepted) { setWarnings(warns); return }
    void onSave(data)
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 bg-[#0e0e0e] border border-[#2a2a2a] text-white placeholder-[#404040] focus:outline-none focus:border-[#E94E1B] transition-colors"
  const inputStyle: React.CSSProperties = { fontSize: '13px' }
  const labelStyle: React.CSSProperties = { fontSize: '11px', color: '#585858', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, display: 'block' }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <div className="max-w-[430px] mx-auto px-4 pt-4 pb-24">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#686868', fontSize: '16px' }}>
              ←
            </button>
            <div>
              <p className="font-black text-white" style={{ fontSize: '15px' }}>Sửa câu hỏi</p>
              <p style={{ fontSize: '11px', color: '#484848' }}>ID: {question.id.slice(0, 8)}…</p>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {errors.map((e,i) => <p key={i} style={{ fontSize: '12px', color: '#f87171', marginBottom: 2 }}>❌ {e}</p>)}
            </div>
          )}

          {/* Warnings + confirm */}
          {warnings.length > 0 && !warnAccepted && (
            <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
              {warnings.map((w,i) => <p key={i} style={{ fontSize: '12px', color: '#fb923c', marginBottom: 2 }}>⚠️ {w}</p>)}
              <button onClick={() => setWarnAccepted(true)}
                className="mt-3 w-full rounded-xl py-2 font-bold"
                style={{ fontSize: '12px', background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.3)', color: '#fb923c' }}>
                Tôi đã hiểu, lưu vẫn được
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Question */}
            <div>
              <label style={labelStyle}>Câu hỏi *</label>
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'none', minHeight: 80 }}
                value={form.question} onChange={e => set('question', e.target.value)} rows={3} />
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {(['A','B','C','D'] as const).map(letter => {
                const key = `option_${letter.toLowerCase()}` as 'option_a' | 'option_b' | 'option_c' | 'option_d'
                const isCorrect = form.correct_answer === letter
                return (
                  <div key={letter}>
                    <label style={{ ...labelStyle, color: isCorrect ? '#34d399' : '#585858' }}>
                      Phương án {letter} {isCorrect ? '✓' : ''} *
                    </label>
                    <textarea className={inputClass}
                      style={{ ...inputStyle, resize: 'none', minHeight: 70,
                        borderColor: isCorrect ? 'rgba(52,211,153,0.4)' : '#2a2a2a' }}
                      value={form[key]} onChange={e => set(key, e.target.value)} rows={2} />
                  </div>
                )
              })}
            </div>

            {/* Correct answer */}
            <div>
              <label style={labelStyle}>Đáp án đúng *</label>
              <div className="grid grid-cols-4 gap-2">
                {(['A','B','C','D'] as const).map(letter => (
                  <button key={letter}
                    onClick={() => set('correct_answer', letter)}
                    className="rounded-xl py-2.5 font-black transition-all active:scale-[0.97]"
                    style={{
                      fontSize: '15px',
                      background: form.correct_answer === letter ? 'rgba(52,211,153,0.15)' : '#161616',
                      border: form.correct_answer === letter ? '1px solid rgba(52,211,153,0.4)' : '1px solid #252525',
                      color:  form.correct_answer === letter ? '#34d399' : '#585858',
                    }}>
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label style={labelStyle}>Giải thích đáp án</label>
              <textarea className={inputClass} style={{ ...inputStyle, resize: 'none', minHeight: 70 }}
                placeholder="Giải thích tại sao đây là đáp án đúng…"
                value={form.explanation} onChange={e => set('explanation', e.target.value)} rows={3} />
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Độ khó</label>
                <select className={inputClass} style={inputStyle} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                  <option value="">— Chọn —</option>
                  <option value="dễ">Dễ</option>
                  <option value="trung bình">Trung bình</option>
                  <option value="khó">Khó</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Phòng ban</label>
                <input className={inputClass} style={inputStyle} placeholder="TMĐT, Kho, Cửa hàng…"
                  value={form.department} onChange={e => set('department', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Thời gian (giây) *</label>
                <input type="number" min={5} max={120} className={inputClass} style={inputStyle}
                  value={form.time_limit} onChange={e => set('time_limit', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Điểm *</label>
                <input type="number" min={0} max={500} className={inputClass} style={inputStyle}
                  value={form.score} onChange={e => set('score', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Nhóm / Topic</label>
                <input className={inputClass} style={inputStyle} placeholder="Sản phẩm, Bán hàng…"
                  value={form.topic} onChange={e => set('topic', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Quality Score</label>
                <input type="number" min={0} max={100} className={inputClass} style={inputStyle}
                  value={form.quality_score} onChange={e => set('quality_score', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Skill Tag</label>
                <input className={inputClass} style={inputStyle} placeholder="upsell, xử lý từ chối…"
                  value={form.skill_tag} onChange={e => set('skill_tag', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Trap Type</label>
                <input className={inputClass} style={inputStyle} placeholder="đánh lạc hướng…"
                  value={form.trap_type} onChange={e => set('trap_type', e.target.value)} />
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-3">
              {([
                { key: 'is_approved' as const, label: 'Đã duyệt',    color: '#34d399' },
                { key: 'is_active'   as const, label: 'Đang hoạt động', color: '#60a5fa' },
              ] as const).map(({ key, label, color }) => (
                <button key={key} onClick={() => set(key, !form[key])}
                  className="flex-1 flex items-center justify-between rounded-xl px-3 py-3 transition-all"
                  style={{
                    background: form[key] ? `${color}12` : '#111',
                    border: `1px solid ${form[key] ? color + '35' : '#2a2a2a'}`,
                  }}>
                  <span style={{ fontSize: '12px', color: form[key] ? color : '#585858', fontWeight: 600 }}>{label}</span>
                  <div style={{
                    width: 36, height: 20, borderRadius: 10, position: 'relative',
                    background: form[key] ? color : '#2a2a2a',
                    border: `1px solid ${form[key] ? color : '#333'}`,
                    transition: 'all 0.2s',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2,
                      left: form[key] ? 18 : 2,
                      width: 14, height: 14, borderRadius: '50%',
                      background: '#fff', transition: 'all 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed save bar */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 z-10"
           style={{ background: 'linear-gradient(0deg, #080808 60%, transparent)', maxWidth: 430, margin: '0 auto' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.97] disabled:opacity-50"
          style={{ fontSize: '14px', letterSpacing: '0.04em', background: `linear-gradient(90deg, ${BRAND}, #FF5A28)`, boxShadow: `0 4px 20px rgba(233,78,27,0.3)` }}>
          {saving ? '⏳ Đang lưu…' : '💾 Lưu thay đổi'}
        </button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// DELETE CONFIRM MODAL
// ══════════════════════════════════════════════════════════════
function DeleteConfirm({ question, onConfirm, onCancel, loading }: {
  question: QuestionBankRow
  onConfirm: () => void
  onCancel:  () => void
  loading:   boolean
}) {
  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-[430px] rounded-t-3xl px-5 pt-5 pb-10"
           style={{ background: '#0e0e0e', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#2a2a2a' }} />
        <p className="font-black text-white mb-1.5" style={{ fontSize: '16px' }}>🗑 Xóa câu hỏi?</p>
        <p style={{ fontSize: '12px', color: '#585858', lineHeight: 1.6, marginBottom: 16 }}>
          Câu hỏi sẽ bị <strong style={{ color: '#fb923c' }}>khóa & bỏ duyệt</strong> (soft delete). Dữ liệu không bị mất vĩnh viễn.
        </p>
        <div className="rounded-2xl px-3 py-2.5 mb-5" style={{ background: '#141414', border: '1px solid #222' }}>
          <p style={{ fontSize: '12px', color: '#909090', lineHeight: 1.5 }} className="line-clamp-2">{question.question}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-2xl py-3.5 font-bold"
            style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#686868', fontSize: '14px' }}>
            Huỷ
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-2xl py-3.5 font-black text-white disabled:opacity-50 transition-all active:scale-[0.97]"
            style={{ fontSize: '14px', background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
            {loading ? '⏳…' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function QuestionBankAdminPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const { toasts, show: showToast } = useToast()

  // ── Data state ─────────────────────────────────────────────
  const [rows,        setRows]        = useState<QuestionBankRow[]>([])
  const [stats,       setStats]       = useState<QuestionBankStats | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [loadError,   setLoadError]   = useState<string | null>(null)
  const [departments, setDepartments] = useState<string[]>([])
  const [difficulties,setDifficulties]= useState<string[]>([])
  const [topics,      setTopics]      = useState<string[]>([])

  // ── Filters ────────────────────────────────────────────────
  const [search,     setSearch]     = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterDiff, setFilterDiff] = useState('')
  const [filterTopic,setFilterTopic]= useState('')
  const [filterSrc,  setFilterSrc]  = useState('')
  const [filterStat, setFilterStat] = useState('')

  // ── Modals ─────────────────────────────────────────────────
  const [editTarget,   setEditTarget]   = useState<QuestionBankRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<QuestionBankRow | null>(null)
  const [saving,       setSaving]       = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Permission guard ───────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: '#080808' }}>
        <p style={{ color: '#585858' }}>Không có quyền truy cập.</p>
      </div>
    )
  }

  // ── Fetch questions ────────────────────────────────────────
  const fetchData = useCallback(async (filters: QuestionBankFilters) => {
    setLoading(true); setLoadError(null)
    const [qResult, sResult, filterResult] = await Promise.all([
      getQuestionBank(filters),
      getQuestionBankStats(),
      getDistinctFilterValues(),
    ])
    if (qResult.error) {
      setLoadError(qResult.error)
    } else {
      setRows(qResult.data)
      setStats(sResult)
      setDepartments(filterResult.departments)
      setDifficulties(filterResult.difficulties)
      setTopics(filterResult.topics)
    }
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => { void fetchData({}) }, [fetchData])

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      void fetchData({ search, department: filterDept || undefined, difficulty: filterDiff || undefined,
        topic: filterTopic || undefined, source_type: filterSrc || undefined, status: filterStat || undefined })
    }, 350)
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current) }
  }, [search, filterDept, filterDiff, filterTopic, filterSrc, filterStat, fetchData])

  // ── Actions ────────────────────────────────────────────────
  const handleApprove = async (q: QuestionBankRow) => {
    const { error } = await approveQuestion(q.id)
    if (error) { showToast(`Lỗi: ${error}`, 'err'); return }
    showToast('Đã duyệt câu hỏi ✅')
    setRows(prev => prev.map(r => r.id === q.id ? { ...r, is_approved: true } : r))
    setStats(prev => prev ? { ...prev, approved: prev.approved + 1, pending: prev.pending - 1 } : prev)
  }

  const handleToggle = async (q: QuestionBankRow) => {
    const { error } = await toggleQuestionActive(q.id, q.is_active)
    if (error) { showToast(`Lỗi: ${error}`, 'err'); return }
    const nowActive = !q.is_active
    showToast(nowActive ? 'Đã mở câu hỏi 🔓' : 'Đã khóa câu hỏi 🔒', 'warn')
    setRows(prev => prev.map(r => r.id === q.id ? { ...r, is_active: nowActive } : r))
    setStats(prev => prev ? {
      ...prev,
      active: prev.active + (nowActive ? 1 : -1),
      locked: prev.locked + (nowActive ? -1 : 1),
    } : prev)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await deleteQuestion(deleteTarget.id)
    setDeleting(false)
    if (error) { showToast(`Lỗi: ${error}`, 'err'); return }
    showToast('Đã xóa (soft delete) câu hỏi 🗑')
    setRows(prev => prev.filter(r => r.id !== deleteTarget.id))
    setStats(prev => prev ? { ...prev, total: prev.total - 1, active: prev.active - (deleteTarget.is_active ? 1 : 0) } : prev)
    setDeleteTarget(null)
  }

  const handleSave = async (data: UpdateQuestionData) => {
    if (!editTarget) return
    setSaving(true)
    const { error } = await updateQuestion(editTarget.id, data)
    setSaving(false)
    if (error) { showToast(`Lỗi lưu: ${error}`, 'err'); return }
    showToast('Đã lưu thay đổi 💾')
    setRows(prev => prev.map(r => r.id === editTarget.id ? { ...r, ...data, updated_at: new Date().toISOString() } as QuestionBankRow : r))
    setEditTarget(null)
  }

  const currentFilters: QuestionBankFilters = {
    search: search || undefined,
    department: filterDept || undefined,
    difficulty: filterDiff || undefined,
    topic: filterTopic || undefined,
    source_type: filterSrc || undefined,
    status: filterStat || undefined,
  }

  const hasFilter = !!(search || filterDept || filterDiff || filterTopic || filterSrc || filterStat)

  // ── SELECT styles ──────────────────────────────────────────
  const selStyle: React.CSSProperties = {
    fontSize: '12px', background: '#111', border: '1px solid #222',
    color: '#e0e0e0', borderRadius: 12, padding: '8px 10px', outline: 'none',
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      <ToastList toasts={toasts} />

      {/* ── Top Header ── */}
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#161616', border: '1px solid #2a2a2a', color: '#686868', fontSize: '18px' }}>
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white truncate" style={{ fontSize: '16px' }}>📚 Ngân hàng câu hỏi</p>
          <p style={{ fontSize: '11px', color: '#484848', marginTop: 2 }}>Quản lý câu hỏi game nội bộ Centosy</p>
        </div>
        <button
          onClick={() => void fetchData(currentFilters)}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 active:scale-90"
          style={{ background: '#161616', border: '1px solid #2a2a2a', fontSize: '14px' }}
          title="Làm mới">
          🔄
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        <div className="px-4 py-4 flex flex-col gap-4 pb-10">

          {/* ── Stats row ── */}
          {stats && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
              <StatCard label="Tổng"        value={stats.total}        color="#e0e0e0" icon="📋" />
              <StatCard label="Đã duyệt"    value={stats.approved}     color="#34d399" icon="✅" />
              <StatCard label="Chưa duyệt"  value={stats.pending}      color="#fb923c" icon="⏳" />
              <StatCard label="Hoạt động"   value={stats.active}       color="#60a5fa" icon="🟢" />
              <StatCard label="Đã khóa"     value={stats.locked}       color="#f87171" icon="🔒" />
              <StatCard label="CSV import"  value={stats.csv_import}   color="#a78bfa" icon="📥" />
              <StatCard label="AI gen"      value={stats.ai_generated} color="#facc15" icon="🤖" />
            </div>
          )}

          {/* ── Search bar ── */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#484848', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm theo nội dung câu hỏi…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl pl-9 pr-4 py-3"
              style={{ fontSize: '13px', background: '#111', border: '1px solid #222', color: '#e0e0e0', outline: 'none' }}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#585858', fontSize: '16px' }}>
                ×
              </button>
            )}
          </div>

          {/* ── Filters ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            <select style={selStyle} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">🏢 Tất cả phòng ban</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={selStyle} value={filterDiff} onChange={e => setFilterDiff(e.target.value)}>
              <option value="">🎯 Tất cả độ khó</option>
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select style={selStyle} value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
              <option value="">📚 Tất cả nhóm</option>
              {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select style={selStyle} value={filterStat} onChange={e => setFilterStat(e.target.value)}>
              <option value="">📌 Trạng thái</option>
              <option value="approved">✅ Đã duyệt</option>
              <option value="pending">⏳ Chưa duyệt</option>
              <option value="active">🟢 Đang mở</option>
              <option value="locked">🔒 Đã khóa</option>
            </select>
            <select style={selStyle} value={filterSrc} onChange={e => setFilterSrc(e.target.value)}>
              <option value="">📂 Tất cả nguồn</option>
              <option value="csv_import">📥 CSV import</option>
              <option value="ai_generated">🤖 AI generated</option>
              <option value="manual">✍️ Manual</option>
            </select>
            {hasFilter && (
              <button onClick={() => { setSearch(''); setFilterDept(''); setFilterDiff(''); setFilterTopic(''); setFilterSrc(''); setFilterStat('') }}
                className="shrink-0 rounded-xl px-3 py-1.5 font-bold"
                style={{ fontSize: '11px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', whiteSpace: 'nowrap' }}>
                ✕ Xóa lọc
              </button>
            )}
          </div>

          {/* ── Result count ── */}
          <div className="flex items-center justify-between">
            <p style={{ fontSize: '11px', color: '#484848' }}>
              {loading ? 'Đang tải…' : `${rows.length} câu hỏi`}
              {hasFilter && !loading ? ` (đang lọc)` : ''}
            </p>
            {loadError && (
              <p style={{ fontSize: '11px', color: '#f87171' }}>
                {loadError.includes('schema cache') || loadError.includes('does not exist')
                  ? '❌ Chưa chạy SQL migration (supabase/question_bank.sql)'
                  : `❌ ${loadError}`}
              </p>
            )}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#111' }} />
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !loadError && rows.length === 0 && (
            <div className="rounded-3xl flex flex-col items-center py-12 px-6 text-center"
                 style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: '36px', marginBottom: 16 }}>📭</span>
              <p className="font-black text-white mb-2" style={{ fontSize: '15px' }}>Chưa có câu hỏi</p>
              {hasFilter
                ? <p style={{ fontSize: '12px', color: '#484848' }}>Không có câu hỏi nào khớp với bộ lọc.<br />Thử xóa bộ lọc để xem tất cả.</p>
                : <p style={{ fontSize: '12px', color: '#484848', lineHeight: 1.7 }}>
                    Chưa có dữ liệu trong bảng.<br />
                    Chạy: <span style={{ color: BRAND, fontFamily: 'monospace' }}>npm run import:questions</span>
                  </p>
              }
            </div>
          )}

          {/* ── Question list ── */}
          {!loading && rows.length > 0 && (
            <div className="flex flex-col gap-3">
              {rows.map(q => (
                <QuestionCard
                  key={q.id}
                  q={q}
                  onEdit={setEditTarget}
                  onApprove={handleApprove}
                  onToggle={handleToggle}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editTarget && (
        <EditModal
          question={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
          saving={saving}
        />
      )}

      {/* ── Delete confirm ── */}
      {deleteTarget && (
        <DeleteConfirm
          question={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
