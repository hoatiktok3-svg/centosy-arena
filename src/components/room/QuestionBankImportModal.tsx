/**
 * QuestionBankImportModal — Tạo bộ câu hỏi từ question_bank để dùng trong game room
 *
 * Bridge giữa question_bank (admin import) và room_questions (game engine)
 * Mapping: question → question_text, option_a/b/c/d → options[], correct_answer (A/B/C/D) → correct_index (0-3)
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface QBankRow {
  id:             string
  question:       string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  correct_answer: string  // 'A'|'B'|'C'|'D'
  explanation:    string | null
  topic:          string | null
  department:     string | null
  difficulty:     string | null
  quality_score:  number | null
}

interface Props {
  onClose:   () => void
  onCreated: (setId: string, setTitle: string) => void
}

const BRAND = '#E94E1B'

function correctAnswerToIndex(ca: string): number {
  return ['A','B','C','D'].indexOf((ca || 'A').toUpperCase().trim())
}

export default function QuestionBankImportModal({ onClose, onCreated }: Props) {
  const [questions, setQuestions]     = useState<QBankRow[]>([])
  const [filtered, setFiltered]       = useState<QBankRow[]>([])
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [setTitle, setSetTitle]       = useState('Bộ câu từ Question Bank')

  // Filters
  const [filterDept,    setFilterDept]    = useState('')
  const [filterDiff,    setFilterDiff]    = useState('')
  const [filterTopic,   setFilterTopic]   = useState('')
  const [filterSearch,  setFilterSearch]  = useState('')

  // Unique filter values
  const [depts,   setDepts]   = useState<string[]>([])
  const [diffs,   setDiffs]   = useState<string[]>([])
  const [topics,  setTopics]  = useState<string[]>([])

  // Load question_bank
  useEffect(() => {
    setLoading(true)
    void supabase
      .from('question_bank')
      .select('id,question,option_a,option_b,option_c,option_d,correct_answer,explanation,topic,department,difficulty,quality_score')
      .eq('is_active', true)
      .eq('is_approved', true)
      .order('quality_score', { ascending: false })
      .limit(500)
      .then(({ data, error: err }) => {
        setLoading(false)
        if (err) { setError(`Không tải được câu hỏi: ${err.message}`); return }
        const rows = (data ?? []) as QBankRow[]
        setQuestions(rows)
        setFiltered(rows)
        setDepts([...new Set(rows.map(r => r.department).filter(Boolean) as string[])].sort())
        setDiffs([...new Set(rows.map(r => r.difficulty).filter(Boolean) as string[])].sort())
        setTopics([...new Set(rows.map(r => r.topic).filter(Boolean) as string[])].sort())
      })
  }, [])

  // Apply filters
  useEffect(() => {
    let result = questions
    if (filterDept)   result = result.filter(q => q.department === filterDept)
    if (filterDiff)   result = result.filter(q => q.difficulty === filterDiff)
    if (filterTopic)  result = result.filter(q => q.topic === filterTopic)
    if (filterSearch.trim()) {
      const s = filterSearch.toLowerCase()
      result = result.filter(q => q.question.toLowerCase().includes(s))
    }
    setFiltered(result)
  }, [questions, filterDept, filterDiff, filterTopic, filterSearch])

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = useCallback(() => {
    setSelected(new Set(filtered.map(q => q.id)))
  }, [filtered])

  const clearAll = () => setSelected(new Set())

  const handleCreate = async () => {
    if (selected.size === 0) { setError('Chọn ít nhất 1 câu hỏi.'); return }
    if (!setTitle.trim()) { setError('Nhập tên bộ câu hỏi.'); return }
    setSaving(true); setError('')

    try {
      // 1. Create question_set
      const { data: qs, error: qsErr } = await supabase
        .from('question_sets')
        .insert({ title: setTitle.trim(), description: `Import từ Question Bank (${selected.size} câu)`, is_active: true })
        .select().single()
      if (qsErr || !qs) throw new Error(qsErr?.message ?? 'Không tạo được bộ câu hỏi')

      // 2. Get selected questions in order
      const selectedRows = filtered.filter(q => selected.has(q.id))

      // 3. Insert room_questions (map question_bank → room_questions schema)
      const roomQs = selectedRows.map((q, i) => ({
        question_set_id: (qs as { id: string }).id,
        question_text:   q.question,
        options:         [q.option_a, q.option_b, q.option_c, q.option_d],
        correct_index:   correctAnswerToIndex(q.correct_answer),
        explanation:     q.explanation ?? '',
        sort_order:      i,
      }))

      // Insert in batches of 50
      for (let i = 0; i < roomQs.length; i += 50) {
        const batch = roomQs.slice(i, i + 50)
        const { error: rqErr } = await supabase.from('room_questions').insert(batch)
        if (rqErr) throw new Error(`Lỗi insert câu ${i + 1}-${i + batch.length}: ${rqErr.message}`)
      }

      onCreated((qs as { id: string }).id, setTitle.trim())
    } catch (e: unknown) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  const diffColor = (d: string | null) => {
    if (!d) return '#555'
    const dl = d.toLowerCase()
    if (dl.includes('dễ') || dl.includes('easy')) return '#4ade80'
    if (dl.includes('trung') || dl.includes('medium')) return '#facc15'
    if (dl.includes('khó') || dl.includes('hard')) return '#f87171'
    return '#888'
  }

  return (
    <div className="fixed inset-0 z-[220] flex flex-col" style={{ background: '#080808' }}>
      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div className="flex-1">
          <p className="font-black text-white" style={{ fontSize: '15px' }}>📚 Import từ Ngân hàng câu hỏi</p>
          <p style={{ fontSize: '11px', color: '#555' }}>
            {loading ? 'Đang tải...' : `${questions.length} câu có sẵn · Đã chọn: ${selected.size}`}
          </p>
        </div>
        {/* Select all / clear */}
        {!loading && filtered.length > 0 && (
          <div className="flex gap-2">
            <button onClick={selectAll}
                    className="px-3 py-1.5 rounded-lg font-bold"
                    style={{ fontSize: '11px', background: 'rgba(233,78,27,0.1)', color: BRAND, border: `1px solid rgba(233,78,27,0.3)` }}>
              Chọn tất cả ({filtered.length})
            </button>
            {selected.size > 0 && (
              <button onClick={clearAll}
                      className="px-3 py-1.5 rounded-lg font-bold"
                      style={{ fontSize: '11px', background: '#141414', color: '#666', border: '1px solid #333' }}>
                Bỏ chọn
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="shrink-0 px-4 py-3 flex flex-col gap-2"
           style={{ borderBottom: '1px solid #141414', background: '#0a0a0a' }}>
        {/* Search */}
        <input
          type="text"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full rounded-xl px-3 py-2 text-white"
          style={{ background: '#141414', border: '1px solid #2a2a2a', fontSize: '13px', outline: 'none' }}
        />
        {/* Filter dropdowns */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: 'Phòng ban', value: filterDept, set: setFilterDept, options: depts },
            { label: 'Độ khó',    value: filterDiff, set: setFilterDiff, options: diffs },
            { label: 'Chủ đề',   value: filterTopic, set: setFilterTopic, options: topics },
          ].map(f => (
            <select
              key={f.label}
              value={f.value}
              onChange={e => f.set(e.target.value)}
              className="shrink-0 rounded-lg px-2 py-1.5"
              style={{ background: '#141414', border: '1px solid #2a2a2a', color: f.value ? '#E94E1B' : '#666', fontSize: '12px', outline: 'none' }}>
              <option value="">{f.label}</option>
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          {(filterDept || filterDiff || filterTopic || filterSearch) && (
            <button onClick={() => { setFilterDept(''); setFilterDiff(''); setFilterTopic(''); setFilterSearch('') }}
                    className="shrink-0 px-3 py-1.5 rounded-lg"
                    style={{ fontSize: '11px', background: '#141414', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              Xoá filter
            </button>
          )}
        </div>
        {/* Filtered count */}
        <p style={{ fontSize: '11px', color: '#444' }}>
          Hiển thị: <span style={{ color: '#888' }}>{filtered.length}</span> câu
          {(filterDept || filterDiff || filterTopic || filterSearch) && ' (đã lọc)'}
        </p>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
            <p style={{ fontSize: '13px', color: '#555' }}>Đang tải câu hỏi từ ngân hàng...</p>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p style={{ fontSize: '32px', marginBottom: 8 }}>📭</p>
            <p style={{ fontSize: '13px', color: '#555' }}>
              {questions.length === 0
                ? 'Ngân hàng câu hỏi trống. Hãy import CSV trước.'
                : 'Không tìm thấy câu hỏi với bộ lọc này.'}
            </p>
          </div>
        )}
        {!loading && filtered.map(q => {
          const isSelected = selected.has(q.id)
          return (
            <button
              key={q.id}
              onClick={() => toggleOne(q.id)}
              className="w-full text-left rounded-2xl px-4 py-3.5 transition-all active:scale-[0.99]"
              style={{
                background: isSelected ? 'rgba(233,78,27,0.08)' : '#111',
                border: `1.5px solid ${isSelected ? 'rgba(233,78,27,0.4)' : '#1a1a1a'}`,
              }}>
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div className="shrink-0 w-5 h-5 rounded-md mt-0.5 flex items-center justify-center"
                     style={{
                       background: isSelected ? BRAND : '#1f1f1f',
                       border: `2px solid ${isSelected ? BRAND : '#333'}`,
                     }}>
                  {isSelected && <span style={{ fontSize: '10px', color: '#fff', fontWeight: 900 }}>✓</span>}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: '13px', color: '#e0e0e0', lineHeight: 1.5, fontWeight: 500 }}>
                    {q.question}
                  </p>
                  {/* Options preview */}
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {[q.option_a, q.option_b, q.option_c, q.option_d].map((opt, i) => {
                      const label = ['A','B','C','D'][i]
                      const isCorrect = label === (q.correct_answer || 'A').toUpperCase().trim()
                      return (
                        <div key={i}
                             className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                             style={{
                               background: isCorrect ? 'rgba(74,222,128,0.07)' : 'transparent',
                               border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.25)' : '#222'}`,
                             }}>
                          <span style={{ fontSize: '10px', color: isCorrect ? '#4ade80' : '#555', fontWeight: 700 }}>{label}.</span>
                          <span className="truncate" style={{ fontSize: '11px', color: isCorrect ? '#4ade80' : '#666' }}>{opt}</span>
                          {isCorrect && <span style={{ fontSize: '10px', marginLeft: 'auto' }}>✓</span>}
                        </div>
                      )
                    })}
                  </div>
                  {/* Tags */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {q.department && (
                      <span style={{ fontSize: '10px', color: '#666', background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>
                        {q.department}
                      </span>
                    )}
                    {q.difficulty && (
                      <span style={{ fontSize: '10px', color: diffColor(q.difficulty), background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>
                        {q.difficulty}
                      </span>
                    )}
                    {q.topic && (
                      <span style={{ fontSize: '10px', color: '#888', background: '#1a1a1a', padding: '2px 6px', borderRadius: 4 }}>
                        {q.topic}
                      </span>
                    )}
                    {q.quality_score != null && (
                      <span style={{ fontSize: '10px', color: q.quality_score >= 80 ? '#4ade80' : q.quality_score >= 60 ? '#facc15' : '#f87171', marginLeft: 'auto' }}>
                        QC: {q.quality_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer — set name + create button */}
      {selected.size > 0 && (
        <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-3"
             style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Tên bộ câu hỏi
            </label>
            <input
              type="text"
              value={setTitle}
              onChange={e => setSetTitle(e.target.value)}
              placeholder="Tên bộ câu..."
              className="w-full rounded-xl px-3 py-2.5 mt-1.5 text-white"
              style={{ background: '#141414', border: '1px solid #333', fontSize: '13px', outline: 'none' }}
            />
          </div>
          {error && (
            <p style={{ fontSize: '12px', color: '#f87171' }}>{error}</p>
          )}
          <button
            onClick={() => void handleCreate()}
            disabled={saving}
            className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ fontSize: '15px', background: `linear-gradient(90deg,${BRAND},#FF5A28)` }}>
            {saving ? 'Đang tạo bộ câu...' : `✓ Tạo bộ ${selected.size} câu hỏi này`}
          </button>
        </div>
      )}
    </div>
  )
}
