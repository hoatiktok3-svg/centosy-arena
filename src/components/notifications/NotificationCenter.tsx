import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { canAccessTeamDashboard } from '../../lib/permissions'

// ── Types ─────────────────────────────────────────────────────
export interface AppNotification {
  id:         string
  user_id:    string
  title:      string
  body:       string | null
  type:       string
  icon:       string | null
  action_tab: string | null
  is_read:    boolean
  created_at: string
}

// ── Helpers ───────────────────────────────────────────────────
const TYPE_ICON: Record<string, string> = {
  mission:      '📋',
  badge:        '🏅',
  points:       '💰',
  announcement: '📢',
  system:       '⚙️',
}
const TYPE_LABEL: Record<string, string> = {
  mission:      'Nhiệm vụ',
  badge:        'Huy hiệu',
  points:       'Điểm thưởng',
  announcement: 'Thông báo',
  system:       'Hệ thống',
}
const TYPE_COLOR: Record<string, string> = {
  mission:      '#60a5fa',
  badge:        '#facc15',
  points:       '#4ade80',
  announcement: '#E94E1B',
  system:       '#9ca3af',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  const hr   = Math.floor(diff / 3600000)
  const day  = Math.floor(diff / 86400000)
  if (min < 1)   return 'Vừa xong'
  if (min < 60)  return `${min} phút trước`
  if (hr  < 24)  return `${hr} giờ trước`
  if (day < 7)   return `${day} ngày trước`
  return new Date(iso).toLocaleDateString('vi-VN')
}

// ── Send Notification Sheet (manager+) ────────────────────────
interface SendSheetProps {
  onClose:  () => void
  onSent:   () => void
}
function SendSheet({ onClose, onSent }: SendSheetProps) {
  const { currentUser } = useAuth()
  const [title,     setTitle]     = useState('')
  const [body,      setBody]      = useState('')
  const [type,      setType]      = useState('announcement')
  const [orgGroup,  setOrgGroup]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [sentCount, setSentCount] = useState<number | null>(null)

  async function handleSend() {
    if (!title.trim()) { setError('Tiêu đề không được để trống'); return }
    if (!currentUser?.id) return
    setLoading(true); setError('')

    // Call broadcast_notification function
    const { data, error: err } = await supabase.rpc('broadcast_notification', {
      p_sender_id:  currentUser.id,
      p_title:      title.trim(),
      p_body:       body.trim() || null,
      p_type:       type,
      p_icon:       TYPE_ICON[type] ?? null,
      p_action_tab: type === 'mission' ? 'missions' : type === 'badge' ? 'honor' : null,
      p_org_group:  orgGroup,
    })

    if (err) {
      setError(err.message)
    } else {
      setSentCount(data as number)
      setTimeout(() => { onSent() }, 1500)
    }
    setLoading(false)
  }

  const ORG_GROUPS = [
    { key: null,          label: 'Toàn công ty' },
    { key: 'cua-hang',    label: 'Cửa hàng' },
    { key: 'kho',         label: 'Kho' },
    { key: 'van-phong',   label: 'Văn phòng' },
  ]
  const TYPES = [
    { key: 'announcement', label: 'Thông báo' },
    { key: 'mission',      label: 'Nhiệm vụ' },
    { key: 'badge',        label: 'Huy hiệu' },
    { key: 'system',       label: 'Hệ thống' },
  ]

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative w-full max-w-[430px] z-10 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="flex justify-center pt-3 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>
        <div className="px-5 pt-2 pb-1 shrink-0">
          <p className="text-white font-black" style={{ fontSize: '16px' }}>📢 Gửi thông báo</p>
          <p style={{ fontSize: '11px', color: '#585858', marginTop: 2 }}>Manager+ có quyền gửi</p>
        </div>

        {sentCount !== null ? (
          <div className="flex flex-col items-center py-12 gap-3 px-5">
            <span style={{ fontSize: '40px' }}>✅</span>
            <p className="text-white font-black" style={{ fontSize: '16px' }}>Đã gửi thành công!</p>
            <p style={{ fontSize: '13px', color: '#585858' }}>Đã gửi đến <strong style={{ color: '#E94E1B' }}>{sentCount}</strong> nhân viên</p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 px-5 pb-8 flex flex-col gap-3 mt-3">
            {/* Type */}
            <div>
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Loại thông báo</label>
              <div className="grid grid-cols-4 gap-1.5">
                {TYPES.map(t => (
                  <button key={t.key}
                          onClick={() => setType(t.key)}
                          className="py-2 rounded-xl font-bold transition-all"
                          style={{
                            fontSize: '10px',
                            background: type === t.key ? `${TYPE_COLOR[t.key]}15` : '#161616',
                            border: type === t.key ? `1px solid ${TYPE_COLOR[t.key]}40` : '1px solid #222',
                            color: type === t.key ? TYPE_COLOR[t.key] : '#585858',
                          }}>
                    {TYPE_ICON[t.key]} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target group */}
            <div>
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Gửi đến</label>
              <div className="flex gap-2 flex-wrap">
                {ORG_GROUPS.map(g => (
                  <button key={String(g.key)}
                          onClick={() => setOrgGroup(g.key)}
                          className="px-3 py-1.5 rounded-full font-bold transition-all"
                          style={{
                            fontSize: '11px',
                            background: orgGroup === g.key ? 'rgba(233,78,27,0.12)' : '#161616',
                            border: orgGroup === g.key ? '1px solid rgba(233,78,27,0.3)' : '1px solid #222',
                            color: orgGroup === g.key ? '#E94E1B' : '#585858',
                          }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Tiêu đề *</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề thông báo..."
                className="w-full outline-none text-white text-sm rounded-xl px-3 py-2.5"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ fontSize: '11px', color: '#888', fontWeight: 600, display: 'block', marginBottom: 6 }}>Nội dung (tuỳ chọn)</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Mô tả chi tiết thông báo..."
                rows={3}
                className="w-full resize-none outline-none text-white text-sm rounded-xl px-3 py-2.5"
                style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-2.5">
              <button onClick={onClose}
                      className="flex-1 py-3 rounded-xl font-bold text-sm"
                      style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888' }}>
                Huỷ
              </button>
              <button onClick={handleSend} disabled={loading || !title.trim()}
                      className="flex-1 py-3 rounded-xl font-black text-white text-sm"
                      style={{ background: 'linear-gradient(90deg, #E94E1B, #FF5A28)', opacity: (loading || !title.trim()) ? 0.5 : 1 }}>
                {loading ? 'Đang gửi...' : '📢 Gửi ngay'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Notification item ─────────────────────────────────────────
function NotifItem({
  notif,
  onRead,
}: {
  notif:  AppNotification
  onRead: (id: string) => void
}) {
  const icon  = notif.icon ?? TYPE_ICON[notif.type] ?? '🔔'
  const color = TYPE_COLOR[notif.type] ?? '#585858'

  return (
    <button
      onClick={() => { if (!notif.is_read) onRead(notif.id) }}
      className="w-full rounded-2xl px-3.5 py-3 flex items-start gap-3 text-left transition-all active:scale-[0.99]"
      style={{
        background: notif.is_read ? '#0d0d0d' : '#131313',
        border: notif.is_read ? '1px solid #1a1a1a' : `1px solid ${color}20`,
        boxShadow: notif.is_read ? 'none' : `0 0 12px ${color}08`,
      }}>
      {/* Icon */}
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
           style={{ background: `${color}12`, border: `1px solid ${color}25`, fontSize: '16px' }}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 justify-between">
          <p className="font-bold text-sm leading-snug flex-1"
             style={{ color: notif.is_read ? '#888' : '#fff', letterSpacing: '-0.1px' }}>
            {notif.title}
          </p>
          {!notif.is_read && (
            <div className="shrink-0 w-2 h-2 rounded-full mt-1"
                 style={{ background: color, boxShadow: `0 0 6px ${color}80` }} />
          )}
        </div>
        {notif.body && (
          <p className="text-xs leading-relaxed mt-0.5 line-clamp-2"
             style={{ color: notif.is_read ? '#484848' : '#686868' }}>
            {notif.body}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: `${color}12`, color }}>
            {TYPE_LABEL[notif.type] ?? notif.type}
          </span>
          <span style={{ fontSize: '10px', color: '#484848' }}>{timeAgo(notif.created_at)}</span>
        </div>
      </div>
    </button>
  )
}

// ── Main Component ────────────────────────────────────────────
interface Props {
  onClose:          () => void
  onUnreadChange?:  (count: number) => void
}

export default function NotificationCenter({ onClose, onUnreadChange }: Props) {
  const { currentUser } = useAuth()
  const isManager = canAccessTeamDashboard(currentUser?.role)

  const [notifications, setNotifications]  = useState<AppNotification[]>([])
  const [loading,       setLoading]        = useState(true)
  const [filter,        setFilter]         = useState<'all' | 'unread'>('all')
  const [showSend,      setShowSend]       = useState(false)

  // ── Fetch ─────────────────────────────────────────────────
  async function fetchNotifications() {
    if (!currentUser?.id) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) {
      const notifs = data as AppNotification[]
      setNotifications(notifs)
      const unread = notifs.filter(n => !n.is_read).length
      onUnreadChange?.(unread)
    }
    setLoading(false)
  }

  useEffect(() => { void fetchNotifications() }, [currentUser?.id])

  // ── Mark single as read ────────────────────────────────────
  async function markRead(id: string) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', currentUser!.id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    const unread = notifications.filter(n => !n.is_read && n.id !== id).length
    onUnreadChange?.(unread)
  }

  // ── Mark all as read ───────────────────────────────────────
  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUser!.id)
      .eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    onUnreadChange?.(0)
  }

  // ── Filtered list ──────────────────────────────────────────
  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <>
      <div className="fixed inset-0 z-[90] flex flex-col items-center"
           style={{ background: 'rgba(0,0,0,0.88)' }}>
        <div className="w-full max-w-[430px] h-full flex flex-col"
             style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

          {/* ── Header ──────────────────────────────────── */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
               style={{ borderBottom: '1px solid #1a1a1a' }}>
            <button onClick={onClose}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
              ←
            </button>
            <div className="flex-1">
              <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>Thông báo</p>
              {unreadCount > 0 && (
                <p style={{ fontSize: '11px', color: '#E94E1B' }}>{unreadCount} chưa đọc</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                        className="py-1.5 px-3 rounded-xl font-bold"
                        style={{ fontSize: '10px', background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.2)', color: '#E94E1B' }}>
                  Đọc tất
                </button>
              )}
              {isManager && (
                <button onClick={() => setShowSend(true)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
                  📢
                </button>
              )}
            </div>
          </div>

          {/* ── Filter tabs ──────────────────────────────── */}
          <div className="flex gap-1 mx-4 mt-3 mb-2 p-1 rounded-xl shrink-0"
               style={{ background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
            {([
              { key: 'all',    label: `Tất cả${notifications.length ? ` (${notifications.length})` : ''}` },
              { key: 'unread', label: `Chưa đọc${unreadCount ? ` (${unreadCount})` : ''}` },
            ] as { key: typeof filter; label: string }[]).map(f => (
              <button key={f.key}
                      onClick={() => setFilter(f.key)}
                      className="flex-1 py-1.5 rounded-lg font-bold transition-all"
                      style={{
                        fontSize: '11px',
                        background: filter === f.key ? 'rgba(233,78,27,0.12)' : 'transparent',
                        border: filter === f.key ? '1px solid rgba(233,78,27,0.25)' : '1px solid transparent',
                        color: filter === f.key ? '#E94E1B' : '#585858',
                      }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* ── List ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            {loading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <span style={{ fontSize: '28px' }}>⏳</span>
                <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <span style={{ fontSize: '40px' }}>🔔</span>
                <p className="font-bold text-white" style={{ fontSize: '15px' }}>
                  {filter === 'unread' ? 'Không có thông báo mới' : 'Chưa có thông báo'}
                </p>
                <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
                  {filter === 'unread'
                    ? 'Tất cả thông báo đã được đọc 🎉'
                    : 'Thông báo mới sẽ xuất hiện ở đây.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                {filtered.map(n => (
                  <NotifItem key={n.id} notif={n} onRead={markRead} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSend && (
        <SendSheet
          onClose={() => setShowSend(false)}
          onSent={() => { setShowSend(false); void fetchNotifications() }}
        />
      )}
    </>
  )
}
