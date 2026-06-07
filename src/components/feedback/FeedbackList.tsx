import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// ── Types ─────────────────────────────────────────────────────
interface FeedbackRow {
  id:          string
  type:        string
  severity:    string
  screen:      string
  message:     string
  is_resolved: boolean
  created_at:  string
  profiles:    { full_name: string | null; email: string } | null
}

// ── Label maps ────────────────────────────────────────────────
const TYPE_LABEL: Record<string, { label: string; icon: string }> = {
  bug:        { label: 'Báo lỗi',  icon: '🐛' },
  suggestion: { label: 'Góp ý',    icon: '💡' },
  other:      { label: 'Khác',     icon: '💬' },
}
const SEVERITY_COLOR: Record<string, string> = {
  low:    '#34d399',
  medium: '#fbbf24',
  high:   '#f87171',
}
const SEVERITY_LABEL: Record<string, string> = {
  low: 'Thấp', medium: 'Trung', high: 'Cao',
}

// ── Main component ────────────────────────────────────────────
export default function FeedbackList() {
  const [feedbacks,   setFeedbacks]   = useState<FeedbackRow[]>([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState<'all' | 'open' | 'resolved'>('open')
  const [resolving,   setResolving]   = useState<string | null>(null)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('feedbacks')
      .select('id, type, severity, screen, message, is_resolved, created_at, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100)
    setFeedbacks((data ?? []) as FeedbackRow[])
    setLoading(false)
  }

  async function resolve(id: string) {
    setResolving(id)
    await supabase.from('feedbacks').update({ is_resolved: true }).eq('id', id)
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_resolved: true } : f))
    setResolving(null)
  }

  const filtered = feedbacks.filter(f => {
    if (filter === 'open')     return !f.is_resolved
    if (filter === 'resolved') return  f.is_resolved
    return true
  })

  const openCount = feedbacks.filter(f => !f.is_resolved).length

  return (
    <div>
      {/* Header + filter */}
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">Phản hồi nhân viên</p>
        {openCount > 0 && (
          <span className="text-[11px] font-bold text-red-400 bg-red-900/20 border border-red-700/30 px-2 py-0.5 rounded-full">
            {openCount} chưa xử lý
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-3">
        {(['open', 'all', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={filter === f
              ? { background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.35)', color: '#E94E1B' }
              : { background: '#111', border: '1px solid #1f1f1f', color: '#555' }}
          >
            {f === 'open' ? 'Chưa xử lý' : f === 'resolved' ? 'Đã xử lý' : 'Tất cả'}
          </button>
        ))}
      </div>

      {loading && <p className="text-text-muted text-sm text-center py-6">Đang tải...</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-text-muted text-sm">
            {filter === 'open' ? 'Không có phản hồi nào chưa xử lý.' : 'Chưa có phản hồi nào.'}
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="flex flex-col gap-2">
          {filtered.map(f => {
            const typeInfo = TYPE_LABEL[f.type] ?? { label: f.type, icon: '💬' }
            const sevColor = SEVERITY_COLOR[f.severity] ?? '#666'
            const sevLabel = SEVERITY_LABEL[f.severity] ?? f.severity
            const date = new Date(f.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

            return (
              <div
                key={f.id}
                className="rounded-xl border p-3"
                style={{
                  background: f.is_resolved ? '#0a0a0a' : '#0E0E0E',
                  borderColor: f.is_resolved ? '#1a1a1a' : '#252525',
                  opacity: f.is_resolved ? 0.65 : 1,
                }}
              >
                {/* Row 1: type + screen + date */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-sm">{typeInfo.icon}</span>
                  <span className="text-text-secondary text-xs font-semibold">{typeInfo.label}</span>
                  {f.type === 'bug' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${sevColor}18`, color: sevColor }}>
                      {sevLabel}
                    </span>
                  )}
                  <span className="badge-gray">{f.screen}</span>
                  <span className="text-text-muted text-[10px] ml-auto">{date}</span>
                </div>

                {/* Message */}
                <p className="text-white text-sm leading-snug mb-2">{f.message}</p>

                {/* Submitter */}
                {f.profiles && (
                  <p className="text-text-muted text-[11px] mb-2">
                    {f.profiles.full_name ?? f.profiles.email}
                  </p>
                )}

                {/* Action */}
                {!f.is_resolved && (
                  <button
                    onClick={() => void resolve(f.id)}
                    disabled={resolving === f.id}
                    className="text-[11px] font-semibold px-3 py-1 rounded-lg transition-all active:scale-95"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
                  >
                    {resolving === f.id ? 'Đang xử lý...' : '✓ Đánh dấu đã xử lý'}
                  </button>
                )}
                {f.is_resolved && (
                  <span className="text-[11px] text-text-muted">✓ Đã xử lý</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
