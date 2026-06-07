import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
interface Story {
  id:          string
  title:       string
  content:     string
  is_featured: boolean
  status:      string
  created_at:  string
  profiles:    { full_name: string | null; avatar_initials: string | null } | null
}

// ── Props ─────────────────────────────────────────────────────
interface Props { onClose: () => void }

// ── Component ─────────────────────────────────────────────────
export default function StoriesPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const [stories,    setStories]    = useState<Story[]>([])
  const [pending,    setPending]    = useState<Story[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitDone, setSubmitDone] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true)
    const { data: approved } = await supabase
      .from('centosy_stories')
      .select('id, title, content, is_featured, status, created_at, profiles(full_name, avatar_initials)')
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
    setStories((approved ?? []) as Story[])

    if (isAdmin) {
      const { data: pend } = await supabase
        .from('centosy_stories')
        .select('id, title, content, is_featured, status, created_at, profiles(full_name, avatar_initials)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      setPending((pend ?? []) as Story[])
    }
    setLoading(false)
  }

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    setSubmitting(true)
    await supabase.from('centosy_stories').insert({
      user_id: currentUser!.id,
      title:   title.trim(),
      content: content.trim(),
    })
    setSubmitting(false)
    setSubmitDone(true)
    setTitle('')
    setContent('')
  }

  async function approve(id: string, featured = false) {
    setActionLoading(id)
    await supabase.from('centosy_stories').update({
      status: 'approved', is_featured: featured, reviewed_at: new Date().toISOString(),
    }).eq('id', id)
    await load()
    setActionLoading(null)
  }

  async function reject(id: string) {
    setActionLoading(id)
    await supabase.from('centosy_stories').update({ status: 'rejected' }).eq('id', id)
    setPending(prev => prev.filter(s => s.id !== id))
    setActionLoading(null)
  }

  const featured = stories.filter(s => s.is_featured)
  const normal   = stories.filter(s => !s.is_featured)

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">Câu chuyện Centosy</p>
          <p className="text-text-muted text-xs">Chia sẻ khoảnh khắc · Truyền cảm hứng</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95"
          style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.3)', color: '#E94E1B' }}>
          + Chia sẻ
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {loading && <p className="text-text-muted text-sm text-center py-12">Đang tải...</p>}

        {/* Admin: pending queue */}
        {isAdmin && pending.length > 0 && (
          <div>
            <p className="section-title mb-2">⏳ Chờ duyệt ({pending.length})</p>
            <div className="flex flex-col gap-2">
              {pending.map(s => (
                <div key={s.id} className="arena-card border border-amber-700/30">
                  <p className="text-white font-bold text-sm mb-1">{s.title}</p>
                  <p className="text-text-secondary text-xs line-clamp-2 mb-3">{s.content}</p>
                  <p className="text-text-muted text-[10px] mb-2">{s.profiles?.full_name ?? '—'}</p>
                  <div className="flex gap-2">
                    <button disabled={actionLoading === s.id}
                      onClick={() => void approve(s.id, true)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa' }}>
                      ⭐ Nổi bật
                    </button>
                    <button disabled={actionLoading === s.id}
                      onClick={() => void approve(s.id)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}>
                      ✓ Duyệt
                    </button>
                    <button disabled={actionLoading === s.id}
                      onClick={() => void reject(s.id)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}>
                      ✕ Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured */}
        {featured.length > 0 && (
          <div>
            <p className="section-title mb-2">⭐ Câu chuyện nổi bật</p>
            {featured.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        )}

        {/* Normal */}
        {normal.length > 0 && (
          <div>
            <p className="section-title mb-2">📖 Tất cả câu chuyện</p>
            {normal.map(s => <StoryCard key={s.id} story={s} />)}
          </div>
        )}

        {!loading && stories.length === 0 && !isAdmin && (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-5xl">📖</span>
            <p className="text-text-muted text-sm text-center">Chưa có câu chuyện nào.<br/>Hãy là người đầu tiên chia sẻ!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary px-6 mt-2">Chia sẻ ngay</button>
          </div>
        )}
        <div className="h-4" />
      </div>

      {/* Submit sheet */}
      {showForm && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-[430px] bg-arena-card border-t border-arena-border rounded-t-2xl z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-arena-border rounded-full" /></div>
            <div className="px-5 pb-10 pt-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white font-black text-base">📖 Chia sẻ câu chuyện</p>
                <button onClick={() => setShowForm(false)} className="text-text-muted text-xl">✕</button>
              </div>
              {submitDone ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <span className="text-5xl">🎉</span>
                  <p className="text-white font-bold text-center">Đã gửi! Admin sẽ duyệt sớm.</p>
                  <button onClick={() => { setShowForm(false); setSubmitDone(false) }} className="btn-primary w-full">Đóng</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Tiêu đề</p>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="Câu chuyện của bạn..." maxLength={100}
                      className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Nội dung</p>
                    <textarea value={content} onChange={e => setContent(e.target.value)}
                      placeholder="Kể về khoảnh khắc đáng nhớ, bài học, hoặc điều bạn tự hào ở Centosy..."
                      rows={5} maxLength={1000}
                      className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm resize-none placeholder:text-text-muted" />
                    <p className="text-text-muted text-[10px] text-right mt-1">{content.length}/1000</p>
                  </div>
                  <button onClick={() => void handleSubmit()}
                    disabled={submitting || !title.trim() || !content.trim()}
                    className="btn-primary w-full disabled:opacity-50">
                    {submitting ? 'Đang gửi...' : 'Gửi câu chuyện'}
                  </button>
                  <p className="text-text-muted text-xs text-center">Admin sẽ duyệt trước khi hiển thị</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StoryCard({ story: s }: { story: Story }) {
  const [expanded, setExpanded] = useState(false)
  const initials = s.profiles?.avatar_initials ?? s.profiles?.full_name?.slice(0,2).toUpperCase() ?? '?'
  const date = new Date(s.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
  return (
    <div className="arena-card mb-2" style={s.is_featured ? { border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.04)' } : {}}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
          <span className="text-white font-black text-xs">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-secondary text-xs">{s.profiles?.full_name ?? '—'}</p>
        </div>
        {s.is_featured && <span className="text-[10px] font-bold text-purple-400">⭐ Nổi bật</span>}
        <span className="text-text-muted text-[10px]">{date}</span>
      </div>
      <p className="text-white font-bold text-sm mb-1">{s.title}</p>
      <p className="text-text-secondary text-xs leading-relaxed">
        {expanded ? s.content : `${s.content.slice(0, 120)}${s.content.length > 120 ? '...' : ''}`}
      </p>
      {s.content.length > 120 && (
        <button onClick={() => setExpanded(!expanded)}
          className="text-brand text-xs mt-1 font-semibold">
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  )
}
