/**
 * GameLibraryPage — STEP 103/104
 * Admin thêm/sửa/ẩn câu hỏi, tạo question_sets
 * Player chỉ xem (đọc)
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'
import { QuestionSet, RoomQuestion } from '../components/room/roomTypes'

interface Props {
  onClose: () => void
}

// ── Form tạo bộ câu hỏi ────────────────────────────────────────
function CreateSetForm({ onCreated, onCancel }: { onCreated: (s: QuestionSet) => void; onCancel: () => void }) {
  const { currentUser } = useAuth()
  const [title, setTitle]       = useState('')
  const [desc,  setDesc]        = useState('')
  const [loading, setLoading]   = useState(false)

  const handleCreate = async () => {
    if (!title.trim()) return
    setLoading(true)
    const { data } = await supabase.from('question_sets')
      .insert({ title: title.trim(), description: desc.trim() || null, created_by: currentUser!.id })
      .select().single()
    if (data) onCreated(data as QuestionSet)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
         style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.3)' }}>
      <p className="font-bold text-white" style={{ fontSize: '14px' }}>+ Bộ câu hỏi mới</p>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên bộ câu hỏi"
             className="w-full rounded-xl px-4 py-2.5 text-white" style={{ background: '#141414', border: '1px solid #333', fontSize: '13px', outline: 'none' }} />
      <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả (tuỳ chọn)"
             className="w-full rounded-xl px-4 py-2.5 text-white" style={{ background: '#141414', border: '1px solid #333', fontSize: '13px', outline: 'none' }} />
      <div className="flex gap-2">
        <button onClick={() => void handleCreate()} disabled={loading || !title.trim()}
                className="flex-1 font-black text-white rounded-xl py-2.5 disabled:opacity-40"
                style={{ fontSize: '13px', background: '#E94E1B' }}>
          {loading ? 'Đang tạo...' : 'Tạo'}
        </button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl font-semibold"
                style={{ fontSize: '13px', color: '#888', background: '#141414', border: '1px solid #333' }}>
          Hủy
        </button>
      </div>
    </div>
  )
}

// ── Form thêm câu hỏi ──────────────────────────────────────────
function AddQuestionForm({ setId, orderIndex, onAdded, onCancel }: {
  setId: string; orderIndex: number; onAdded: (q: RoomQuestion) => void; onCancel: () => void
}) {
  const [text, setText]         = useState('')
  const [options, setOptions]   = useState(['', '', '', ''])
  const [correct, setCorrect]   = useState(0)
  const [points, setPoints]     = useState(10)
  const [loading, setLoading]   = useState(false)

  const handleAdd = async () => {
    if (!text.trim() || options.some(o => !o.trim())) return
    setLoading(true)
    const { data } = await supabase.from('questions').insert({
      set_id:        setId,
      question_text: text.trim(),
      options:       options.map(o => o.trim()),
      correct_index: correct,
      points,
      order_index:   orderIndex,
    }).select().single()
    if (data) onAdded(data as RoomQuestion)
    setLoading(false)
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3"
         style={{ background: '#141414', border: '1px solid rgba(233,78,27,0.25)' }}>
      <p className="font-bold text-white" style={{ fontSize: '13px' }}>+ Thêm câu hỏi</p>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Nội dung câu hỏi..." rows={2}
                className="w-full rounded-xl px-3 py-2 text-white resize-none"
                style={{ background: '#1f1f1f', border: '1px solid #333', fontSize: '13px', outline: 'none' }} />
      <div className="flex flex-col gap-1.5">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button onClick={() => setCorrect(i)}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black"
                    style={{ fontSize: '11px', background: correct === i ? '#E94E1B' : '#1f1f1f', color: correct === i ? '#fff' : '#555' }}>
              {String.fromCharCode(65 + i)}
            </button>
            <input type="text" value={opt} onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o) }}
                   placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                   className="flex-1 rounded-xl px-3 py-1.5 text-white"
                   style={{ background: '#1f1f1f', border: `1px solid ${correct === i ? 'rgba(233,78,27,0.5)' : '#333'}`, fontSize: '12px', outline: 'none' }} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: '11px', color: '#555' }}>Điểm:</span>
        {[5, 10, 15, 20].map(p => (
          <button key={p} onClick={() => setPoints(p)}
                  className="px-2.5 py-1 rounded-lg font-bold"
                  style={{ fontSize: '11px', background: points === p ? 'rgba(233,78,27,0.2)' : '#1f1f1f', color: points === p ? '#E94E1B' : '#555' }}>
            {p}đ
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => void handleAdd()} disabled={loading || !text.trim() || options.some(o => !o.trim())}
                className="flex-1 font-black text-white rounded-xl py-2 disabled:opacity-40"
                style={{ fontSize: '12px', background: '#E94E1B' }}>
          {loading ? 'Đang thêm...' : 'Thêm câu hỏi'}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-xl"
                style={{ fontSize: '12px', color: '#888', background: '#1f1f1f', border: '1px solid #333' }}>
          Hủy
        </button>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function GameLibraryPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const [sets, setSets]               = useState<QuestionSet[]>([])
  const [activeSet, setActiveSet]     = useState<QuestionSet | null>(null)
  const [questions, setQuestions]     = useState<RoomQuestion[]>([])
  const [loading, setLoading]         = useState(true)
  const [showCreateSet, setShowCreateSet]   = useState(false)
  const [showAddQ, setShowAddQ]             = useState(false)

  useEffect(() => {
    void loadSets()
  }, [])

  const loadSets = async () => {
    const { data } = await supabase.from('question_sets').select('*').order('created_at', { ascending: false })
    if (data) setSets(data as QuestionSet[])
    setLoading(false)
  }

  const loadQuestions = async (setId: string) => {
    const { data } = await supabase.from('questions').select('*').eq('set_id', setId).order('order_index')
    if (data) setQuestions(data as RoomQuestion[])
  }

  const handleSelectSet = (s: QuestionSet) => {
    setActiveSet(s)
    void loadQuestions(s.id)
    setShowAddQ(false)
  }

  const handleToggleActive = async (s: QuestionSet) => {
    await supabase.from('question_sets').update({ is_active: !s.is_active }).eq('id', s.id)
    setSets(prev => prev.map(q => q.id === s.id ? { ...q, is_active: !q.is_active } : q))
    if (activeSet?.id === s.id) setActiveSet(prev => prev ? { ...prev, is_active: !prev.is_active } : null)
  }

  const handleDeleteQuestion = async (qId: string) => {
    await supabase.from('questions').delete().eq('id', qId)
    setQuestions(prev => prev.filter(q => q.id !== qId))
  }

  if (loading) return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center" style={{ background: '#080808' }}>
      <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[160] flex flex-col" style={{ background: '#080808' }}>
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={activeSet ? () => { setActiveSet(null); setQuestions([]) } : onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontSize: '15px' }}>
            {activeSet ? activeSet.title : '📚 Game Library'}
          </p>
          <p style={{ fontSize: '11px', color: '#555' }}>
            {activeSet ? `${questions.length} câu hỏi` : `${sets.length} bộ câu hỏi`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

        {/* Sets list */}
        {!activeSet && (
          <>
            {isAdmin && (
              <button onClick={() => setShowCreateSet(v => !v)}
                      className="w-full font-bold text-white rounded-2xl py-3 transition-all active:scale-[0.98]"
                      style={{ fontSize: '13px', background: showCreateSet ? '#1a1a1a' : 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.35)', color: '#E94E1B' }}>
                {showCreateSet ? '✕ Đóng' : '+ Tạo bộ câu hỏi mới'}
              </button>
            )}
            {showCreateSet && (
              <CreateSetForm
                onCreated={s => { setSets(prev => [s, ...prev]); setShowCreateSet(false) }}
                onCancel={() => setShowCreateSet(false)}
              />
            )}

            {sets.length === 0 && !showCreateSet && (
              <div className="rounded-2xl py-10 flex flex-col items-center gap-2"
                   style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '28px' }}>📚</p>
                <p style={{ fontSize: '13px', color: '#555' }}>Chưa có bộ câu hỏi nào.</p>
              </div>
            )}

            {sets.map(s => (
              <div key={s.id} className="rounded-2xl p-4"
                   style={{ background: '#141414', border: `1px solid ${s.is_active ? 'rgba(233,78,27,0.25)' : '#1f1f1f'}`, opacity: s.is_active ? 1 : 0.6 }}>
                <div className="flex items-start justify-between">
                  <button onClick={() => handleSelectSet(s)} className="flex-1 text-left">
                    <p className="font-bold text-white" style={{ fontSize: '14px' }}>{s.title}</p>
                    {s.description && <p style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>{s.description}</p>}
                  </button>
                  {isAdmin && (
                    <button onClick={() => void handleToggleActive(s)}
                            className="ml-3 px-3 py-1 rounded-xl font-bold"
                            style={{ fontSize: '10px', background: s.is_active ? 'rgba(74,222,128,0.1)' : '#1f1f1f', color: s.is_active ? '#4ade80' : '#555', border: `1px solid ${s.is_active ? 'rgba(74,222,128,0.3)' : '#333'}` }}>
                      {s.is_active ? 'Đang mở' : 'Ẩn'}
                    </button>
                  )}
                </div>
                <button onClick={() => handleSelectSet(s)}
                        className="mt-2 text-left" style={{ fontSize: '11px', color: '#E94E1B' }}>
                  Xem câu hỏi →
                </button>
              </div>
            ))}
          </>
        )}

        {/* Questions list */}
        {activeSet && (
          <>
            {isAdmin && (
              <button onClick={() => setShowAddQ(v => !v)}
                      className="w-full font-bold text-white rounded-2xl py-3"
                      style={{ fontSize: '13px', background: showAddQ ? '#1a1a1a' : 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.35)', color: '#E94E1B' }}>
                {showAddQ ? '✕ Đóng' : '+ Thêm câu hỏi'}
              </button>
            )}
            {showAddQ && (
              <AddQuestionForm
                setId={activeSet.id}
                orderIndex={questions.length}
                onAdded={q => { setQuestions(prev => [...prev, q]); setShowAddQ(false) }}
                onCancel={() => setShowAddQ(false)}
              />
            )}

            {questions.length === 0 && !showAddQ && (
              <div className="rounded-2xl py-8 flex flex-col items-center gap-2"
                   style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '24px' }}>❓</p>
                <p style={{ fontSize: '13px', color: '#555' }}>Chưa có câu hỏi nào.</p>
              </div>
            )}

            {questions.map((q, i) => (
              <div key={q.id} className="rounded-2xl p-4"
                   style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p style={{ fontSize: '13px', color: '#ddd', flex: 1, lineHeight: 1.5 }}>
                    <span style={{ color: '#555', marginRight: 6 }}>#{i + 1}</span>
                    {q.question_text}
                  </p>
                  {isAdmin && (
                    <button onClick={() => void handleDeleteQuestion(q.id)}
                            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '12px', color: '#f87171' }}>
                      ✕
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {q.options.map((opt, j) => (
                    <div key={j} className="rounded-xl px-3 py-1.5"
                         style={{
                           background: j === q.correct_index ? 'rgba(74,222,128,0.08)' : '#1a1a1a',
                           border: `1px solid ${j === q.correct_index ? 'rgba(74,222,128,0.3)' : '#222'}`,
                         }}>
                      <span style={{ fontSize: '10px', color: j === q.correct_index ? '#4ade80' : '#555', fontWeight: 700 }}>
                        {String.fromCharCode(65 + j)}.{' '}
                      </span>
                      <span style={{ fontSize: '11px', color: j === q.correct_index ? '#bbf7d0' : '#888' }}>{opt}</span>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '10px', color: '#444', marginTop: 6 }}>
                  100đ/câu
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
