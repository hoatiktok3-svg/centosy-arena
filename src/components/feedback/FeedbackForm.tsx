import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

// ── Types ─────────────────────────────────────────────────────
type FeedbackType = 'bug' | 'suggestion' | 'other'
type Severity     = 'low' | 'medium' | 'high'

const TYPE_OPTIONS: { value: FeedbackType; label: string; icon: string }[] = [
  { value: 'bug',        label: 'Báo lỗi',  icon: '🐛' },
  { value: 'suggestion', label: 'Góp ý',    icon: '💡' },
  { value: 'other',      label: 'Khác',     icon: '💬' },
]

const SEVERITY_OPTIONS: { value: Severity; label: string; color: string }[] = [
  { value: 'low',    label: 'Thấp',   color: '#34d399' },
  { value: 'medium', label: 'Trung',  color: '#fbbf24' },
  { value: 'high',   label: 'Cao',    color: '#f87171' },
]

const SCREEN_OPTIONS = [
  'Trang chủ',
  'Bảng xếp hạng',
  'Vinh danh',
  'Nhiệm vụ',
  'Game',
  'Thông báo',
  'Hồ sơ cá nhân',
  'Admin Panel',
  'Director Dashboard',
  'Team Dashboard',
  'Khác',
]

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

// ── Component ─────────────────────────────────────────────────
export default function FeedbackForm({ onClose }: Props) {
  const { currentUser } = useAuth()

  const [type,     setType]     = useState<FeedbackType>('bug')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [screen,   setScreen]   = useState(SCREEN_OPTIONS[0])
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit() {
    if (!message.trim()) { setError('Vui lòng nhập nội dung phản hồi.'); return }
    if (!currentUser?.id) return

    setLoading(true)
    setError(null)

    const { error: dbErr } = await supabase.from('feedbacks').insert({
      user_id:  currentUser.id,
      type,
      severity,
      screen,
      message:  message.trim(),
    })

    setLoading(false)
    if (dbErr) {
      setError('Không thể gửi. Kiểm tra kết nối và thử lại.')
    } else {
      setDone(true)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-[430px] bg-arena-card border-t border-arena-border rounded-t-2xl z-10 max-h-[90vh] overflow-y-auto">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-arena-border rounded-full" />
        </div>

        <div className="px-5 pb-10 pt-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white font-black text-base">Báo lỗi / Góp ý</p>
            <button onClick={onClose} className="text-text-muted text-xl leading-none">✕</button>
          </div>

          {done ? (
            /* ── Thành công ── */
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="text-5xl">✅</span>
              <p className="text-white font-bold text-base text-center">
                Cảm ơn phản hồi của bạn!
              </p>
              <p className="text-text-secondary text-sm text-center">
                Đội kỹ thuật sẽ xem xét và xử lý sớm nhất có thể.
              </p>
              <button onClick={onClose} className="btn-primary w-full mt-2">
                Đóng
              </button>
            </div>
          ) : (
            /* ── Form ── */
            <div className="flex flex-col gap-4">

              {/* Loại */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Loại phản hồi</p>
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95"
                      style={type === opt.value
                        ? { background: 'rgba(233,78,27,0.12)', border: '1px solid rgba(233,78,27,0.4)', color: '#E94E1B' }
                        : { background: '#111', border: '1px solid #1f1f1f', color: '#666' }}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mức độ (chỉ hiện khi báo lỗi) */}
              {type === 'bug' && (
                <div>
                  <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Mức độ nghiêm trọng</p>
                  <div className="flex gap-2">
                    {SEVERITY_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSeverity(opt.value)}
                        className="flex-1 py-2 rounded-xl border text-sm font-bold transition-all active:scale-95"
                        style={severity === opt.value
                          ? { background: `${opt.color}18`, border: `1px solid ${opt.color}55`, color: opt.color }
                          : { background: '#111', border: '1px solid #1f1f1f', color: '#555' }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Màn hình */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Màn hình liên quan</p>
                <select
                  value={screen}
                  onChange={e => setScreen(e.target.value)}
                  className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm"
                >
                  {SCREEN_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Nội dung */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">
                  Nội dung {type === 'bug' ? 'mô tả lỗi' : 'góp ý'}
                </p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={type === 'bug'
                    ? 'Mô tả lỗi: khi nào xảy ra, bạn đang làm gì, lỗi hiển thị như thế nào...'
                    : 'Chia sẻ ý kiến, đề xuất tính năng, hoặc bất cứ điều gì bạn muốn cải thiện...'}
                  rows={4}
                  maxLength={500}
                  className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm resize-none placeholder:text-text-muted"
                />
                <p className="text-text-muted text-[10px] text-right mt-1">{message.length}/500</p>
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              <button
                onClick={() => void handleSubmit()}
                disabled={loading || !message.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
