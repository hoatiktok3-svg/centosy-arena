import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel, isManager } from '../lib/permissions'

interface Props {
  onClose: () => void
}

type ActivityType = 'mission' | 'game' | 'checkin' | 'praise'

interface ActivityItem {
  id:        string
  type:      ActivityType
  user_name: string
  detail:    string
  created_at: string
  icon:      string
  color:     string
}

const TYPE_META: Record<ActivityType, { icon: string; color: string }> = {
  mission: { icon: '✅', color: '#34d399' },
  game:    { icon: '🎮', color: '#60a5fa' },
  checkin: { icon: '📅', color: '#facc15' },
  praise:  { icon: '🌟', color: '#c084fc' },
}

const FILTER_OPTIONS: Array<{ key: ActivityType | 'all'; label: string }> = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'mission', label: 'Nhiệm vụ' },
  { key: 'game',    label: 'Game' },
  { key: 'checkin', label: 'Check-in' },
  { key: 'praise',  label: 'Khen ngợi' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  if (min < 60)    return `${min} phút trước`
  const hrs = Math.floor(min / 60)
  if (hrs < 24)    return `${hrs} giờ trước`
  return `${Math.floor(hrs / 24)} ngày trước`
}

export default function ActivityLogPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const canView = canAccessAdminPanel(currentUser?.role) || isManager(currentUser?.role)

  const [items,    setItems]    = useState<ActivityItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<ActivityType | 'all'>('all')
  const [page,     setPage]     = useState(0)
  const PAGE_SIZE = 30

  useEffect(() => {
    if (!canView) { setLoading(false); return }
    void fetchActivities()
  }, [])

  async function fetchActivities() {
    setLoading(true)
    const collected: ActivityItem[] = []

    // 1. Mission submissions (most recent 50)
    const { data: missions } = await supabase
      .from('mission_submissions')
      .select('id, title, status, created_at, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(50)

    for (const m of missions ?? []) {
      const statusLabel = m.status === 'approved' ? 'đã hoàn thành' : m.status === 'rejected' ? 'bị từ chối' : 'đã nộp'
      collected.push({
        id:         m.id,
        type:       'mission',
        user_name:  (m.profiles as { full_name: string | null } | null)?.full_name ?? 'Không rõ',
        detail:     `${statusLabel} nhiệm vụ "${m.title}"`,
        created_at: m.created_at,
        ...TYPE_META.mission,
      })
    }

    // 2. Game results
    const { data: games } = await supabase
      .from('game_results')
      .select('id, game_id, score, created_at, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(50)

    for (const g of games ?? []) {
      collected.push({
        id:         g.id,
        type:       'game',
        user_name:  (g.profiles as { full_name: string | null } | null)?.full_name ?? 'Không rõ',
        detail:     `chơi game và đạt ${g.score} điểm`,
        created_at: g.created_at,
        ...TYPE_META.game,
      })
    }

    // 3. Daily check-ins
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('id, streak, created_at, profiles:user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(50)

    for (const c of checkins ?? []) {
      collected.push({
        id:         c.id,
        type:       'checkin',
        user_name:  (c.profiles as { full_name: string | null } | null)?.full_name ?? 'Không rõ',
        detail:     `check-in ngày hôm nay${c.streak > 1 ? ` (streak ${c.streak} ngày)` : ''}`,
        created_at: c.created_at,
        ...TYPE_META.checkin,
      })
    }

    // 4. Peer praises
    const { data: praisesRaw } = await supabase
      .from('peer_praises')
      .select('id, message, created_at, from_profile:from_user_id(full_name), to_profile:to_user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(30)

    for (const p of praisesRaw ?? []) {
      const from = (p.from_profile as { full_name: string | null } | null)?.full_name ?? '?'
      const to   = (p.to_profile   as { full_name: string | null } | null)?.full_name ?? '?'
      collected.push({
        id:         p.id,
        type:       'praise',
        user_name:  from,
        detail:     `khen ngợi ${to}: "${String(p.message).slice(0, 40)}..."`,
        created_at: p.created_at,
        ...TYPE_META.praise,
      })
    }

    // Sort all by time
    collected.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setItems(collected)
    setLoading(false)
  }

  const filtered  = filter === 'all' ? items : items.filter(i => i.type === filter)
  const displayed = filtered.slice(0, (page + 1) * PAGE_SIZE)
  const hasMore   = displayed.length < filtered.length

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Nhật ký hoạt động
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Hoạt động gần đây trong hệ thống</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '16px' }}>
            📜
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(0) }}
              className="shrink-0 px-3 py-1.5 rounded-full font-bold transition-all"
              style={{
                fontSize: '11px',
                background: filter === f.key ? 'rgba(52,211,153,0.12)' : '#111',
                border:     filter === f.key ? '1px solid rgba(52,211,153,0.3)' : '1px solid #222',
                color:      filter === f.key ? '#34d399' : '#585858',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {!canView ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '40px' }}>🔒</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Không có quyền truy cập</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải nhật ký...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '40px' }}>🗒️</span>
              <p className="font-bold text-white" style={{ fontSize: '14px' }}>Chưa có hoạt động</p>
              <p style={{ fontSize: '12px', color: '#585858' }}>Thử chọn loại khác hoặc kiểm tra lại.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {displayed.map(item => (
                <div key={`${item.type}-${item.id}`}
                     className="flex items-start gap-3 rounded-xl px-3.5 py-3"
                     style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                       style={{ background: `${item.color}18`, border: `1px solid ${item.color}33`, fontSize: '14px' }}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold" style={{ fontSize: '12px' }}>
                      {item.user_name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#787878', marginTop: 2, lineHeight: 1.4 }}>
                      {item.detail}
                    </p>
                  </div>
                  <p className="shrink-0" style={{ fontSize: '10px', color: '#484848', marginTop: 2, whiteSpace: 'nowrap' }}>
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              ))}

              {hasMore && (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="mt-2 w-full py-2.5 rounded-xl font-bold transition-all"
                  style={{ fontSize: '12px', background: '#111', border: '1px solid #222', color: '#585858' }}>
                  Tải thêm ({filtered.length - displayed.length} còn lại)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
