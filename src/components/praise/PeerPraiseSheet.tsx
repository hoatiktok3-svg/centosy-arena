import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

// ── Types ─────────────────────────────────────────────────────
interface ColleagueOption {
  id:        string
  full_name: string | null
  org_group: string | null
}

const EMOJI_OPTIONS = ['👏', '🔥', '💪', '🌟', '❤️', '🎯', '🙌', '⚡']

const ORG_GROUP_LABEL: Record<string, string> = {
  'cua-hang': 'Cửa hàng', kho: 'Kho', 'van-phong': 'Văn phòng',
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose:   () => void
  onSent?:   () => void
}

// ── Component ─────────────────────────────────────────────────
export default function PeerPraiseSheet({ onClose, onSent }: Props) {
  const { currentUser } = useAuth()

  const [colleagues, setColleagues] = useState<ColleagueOption[]>([])
  const [toUserId,   setToUserId]   = useState('')
  const [emoji,      setEmoji]      = useState('👏')
  const [message,    setMessage]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  // Fetch danh sách đồng nghiệp (loại bỏ bản thân)
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, org_group')
        .eq('is_active', true)
        .neq('id', currentUser?.id ?? '')
        .order('full_name', { ascending: true })
      setColleagues((data ?? []) as ColleagueOption[])
    }
    void load()
  }, [currentUser?.id])

  async function handleSend() {
    if (!toUserId)        { setError('Vui lòng chọn người nhận.'); return }
    if (!message.trim())  { setError('Vui lòng nhập lời khen.'); return }
    if (!currentUser?.id) return

    setLoading(true)
    setError(null)

    const { error: dbErr } = await supabase.from('peer_praises').insert({
      from_user_id: currentUser.id,
      to_user_id:   toUserId,
      emoji,
      message:      message.trim(),
    })

    setLoading(false)
    if (dbErr) {
      setError('Không thể gửi. Thử lại sau.')
    } else {
      setDone(true)
      onSent?.()
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-arena-card border-t border-arena-border rounded-t-2xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-arena-border rounded-full" />
        </div>
        <div className="px-5 pb-10 pt-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-white font-black text-base">👏 Gửi lời khen</p>
            <button onClick={onClose} className="text-text-muted text-xl">✕</button>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="text-5xl">{emoji}</span>
              <p className="text-white font-bold text-base text-center">Đã gửi lời khen!</p>
              <p className="text-text-secondary text-sm text-center">
                Đồng đội của bạn sẽ thấy lời khen này trên Tường Vinh Danh.
              </p>
              <button onClick={onClose} className="btn-primary w-full mt-2">Đóng</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">

              {/* Chọn người nhận */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Gửi đến</p>
                <select
                  value={toUserId}
                  onChange={e => setToUserId(e.target.value)}
                  className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm"
                >
                  <option value="">-- Chọn đồng đội --</option>
                  {colleagues.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.full_name ?? c.id}
                      {c.org_group ? ` · ${ORG_GROUP_LABEL[c.org_group] ?? c.org_group}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Emoji */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Biểu tượng</p>
                <div className="flex gap-2 flex-wrap">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className="w-10 h-10 rounded-xl text-xl transition-all active:scale-95"
                      style={emoji === e
                        ? { background: 'rgba(233,78,27,0.15)', border: '1px solid rgba(233,78,27,0.4)' }
                        : { background: '#111', border: '1px solid #1f1f1f' }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lời khen */}
              <div>
                <p className="text-text-secondary text-xs font-semibold mb-2 uppercase tracking-wider">Lời khen</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Cảm ơn bạn đã hỗ trợ... / Tuyệt vời vì..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-arena-bg border border-arena-border rounded-xl px-3 py-2.5 text-white text-sm resize-none placeholder:text-text-muted"
                />
                <p className="text-text-muted text-[10px] text-right mt-1">{message.length}/200</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={() => void handleSend()}
                disabled={loading || !toUserId || !message.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : `${emoji} Gửi lời khen`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
