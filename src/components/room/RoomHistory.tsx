// STEP 102 + 106: Lịch sử phòng chơi — Admin xem lại + drill-down chi tiết
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface RoomSummary {
  id:              string
  code:            string
  title:           string
  status:          string
  created_at:      string
  ended_at:        string | null
  total_questions: number
  playerCount:     number
  winner:          string | null
}

interface PlayerResult {
  id:            string
  user_id:       string
  display_name:  string | null
  score:         number
  correct_count: number
  final_rank:    number | null
}

interface Props {
  onClose: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']
const BRAND  = '#E94E1B'

export default function RoomHistory({ onClose }: Props) {
  const [rooms, setRooms]           = useState<RoomSummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [detail, setDetail]         = useState<RoomSummary | null>(null)
  const [players, setPlayers]       = useState<PlayerResult[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => { void loadHistory() }, [])

  const loadHistory = async () => {
    setLoading(true)
    // Admin xem tất cả các phòng đã kết thúc (không chỉ của mình)
    const { data } = await supabase
      .from('game_rooms')
      .select('id, code, title, status, created_at, ended_at, total_questions')
      .in('status', ['finished', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(50)
    if (!data) { setLoading(false); return }

    const summaries: RoomSummary[] = await Promise.all(data.map(async r => {
      const [{ count }, { data: topPlayer }] = await Promise.all([
        supabase.from('room_players').select('id', { count: 'exact', head: true }).eq('room_id', r.id).eq('is_active', true),
        supabase.from('room_players').select('display_name,score').eq('room_id', r.id).eq('final_rank', 1).maybeSingle(),
      ])
      return {
        ...r,
        playerCount: count ?? 0,
        winner: topPlayer ? `${topPlayer.display_name ?? 'Ẩn danh'} (${topPlayer.score}đ)` : null,
      }
    }))
    setRooms(summaries)
    setLoading(false)
  }

  const openDetail = async (room: RoomSummary) => {
    setDetail(room)
    setLoadingDetail(true)
    const { data } = await supabase
      .from('room_players')
      .select('id, user_id, display_name, score, correct_count, final_rank')
      .eq('room_id', room.id)
      .eq('is_active', true)
      .order('final_rank', { ascending: true, nullsFirst: false })
    setPlayers((data ?? []) as PlayerResult[])
    setLoadingDetail(false)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getDate()}/${d.getMonth() + 1} lúc ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return null
    const ms = new Date(end).getTime() - new Date(start).getTime()
    const mins = Math.floor(ms / 60000)
    const secs = Math.floor((ms % 60000) / 1000)
    return mins > 0 ? `${mins}p ${secs}s` : `${secs}s`
  }

  // ── Chi tiết phòng ────────────────────────────────────────
  if (detail) {
    const duration = formatDuration(detail.created_at, detail.ended_at)
    return (
      <div className="fixed inset-0 z-[170] flex flex-col" style={{ background: '#080808' }}>
        {/* Header */}
        <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={() => setDetail(null)}
                  className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: '#141414', border: '1px solid #222' }}>
            <span style={{ fontSize: '16px', color: '#888' }}>←</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white truncate" style={{ fontSize: '15px' }}>{detail.title}</p>
            <p style={{ fontSize: '11px', color: '#555' }}>
              Mã: <span style={{ color: BRAND, fontWeight: 700 }}>{detail.code}</span>
              {' · '}{formatDate(detail.created_at)}
              {duration && ` · ${duration}`}
            </p>
          </div>
        </div>

        {/* Room stats */}
        <div className="shrink-0 px-4 py-3 flex gap-3"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          {[
            { label: 'Người chơi',  value: `${detail.playerCount}`,           color: '#888' },
            { label: 'Số câu',      value: `${detail.total_questions}`,        color: '#888' },
            { label: 'Trạng thái',  value: detail.status === 'finished' ? '✓ Xong' : '✗ Hủy',
              color: detail.status === 'finished' ? '#4ade80' : '#f87171' },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl p-2.5 text-center"
                 style={{ background: '#111', border: '1px solid #1a1a1a' }}>
              <p className="font-black" style={{ fontSize: '14px', color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#444', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5">
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            🏆 Bảng xếp hạng phòng
          </p>

          {loadingDetail ? (
            <div className="flex-1 flex items-center justify-center py-10">
              <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
            </div>
          ) : players.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#555', textAlign: 'center', padding: '32px 0' }}>
              Không có người chơi.
            </p>
          ) : (
            players.map((p, i) => {
              const rank = p.final_rank ?? (i + 1)
              const accuracyPct = detail.total_questions > 0
                ? Math.round((p.correct_count / detail.total_questions) * 100)
                : 0
              return (
                <div key={p.id}
                     className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
                     style={{
                       background: rank === 1 ? 'rgba(250,204,21,0.06)' : rank === 2 ? 'rgba(156,163,175,0.05)' : rank === 3 ? 'rgba(251,146,60,0.05)' : '#141414',
                       border: `1px solid ${rank === 1 ? 'rgba(250,204,21,0.3)' : rank === 2 ? 'rgba(156,163,175,0.2)' : rank === 3 ? 'rgba(251,146,60,0.2)' : '#1f1f1f'}`,
                     }}>

                  {/* Rank */}
                  <div className="shrink-0 w-8 text-center">
                    {rank <= 3
                      ? <span style={{ fontSize: '20px' }}>{MEDALS[rank - 1]}</span>
                      : <span className="font-black" style={{ fontSize: '14px', color: '#444' }}>#{rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                       style={{ background: `${BRAND}18`, color: BRAND }}>
                    {(p.display_name ?? '?')[0]?.toUpperCase()}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate" style={{ fontSize: '13px' }}>
                      {p.display_name ?? 'Ẩn danh'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#555' }}>
                      {p.correct_count}/{detail.total_questions} câu đúng · {accuracyPct}%
                    </p>
                  </div>

                  {/* Score */}
                  <div className="shrink-0 text-right">
                    <p className="font-black" style={{ fontSize: '16px', color: rank === 1 ? '#fbbf24' : '#fff' }}>
                      {p.score}đ
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // ── Danh sách phòng ───────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[160] flex flex-col" style={{ background: '#080808' }}>
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div>
          <p className="font-black text-white" style={{ fontSize: '15px' }}>📋 Lịch sử phòng chơi</p>
          <p style={{ fontSize: '11px', color: '#555' }}>Nhấn vào phòng để xem chi tiết</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading && (
          <div className="flex-1 flex items-center justify-center py-10">
            <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="rounded-2xl py-10 flex flex-col items-center gap-2"
               style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
            <p style={{ fontSize: '28px' }}>📋</p>
            <p style={{ fontSize: '13px', color: '#555' }}>Chưa có phòng nào đã kết thúc.</p>
          </div>
        )}

        {rooms.map(r => (
          <button key={r.id} onClick={() => void openDetail(r)}
                  className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
                  style={{ background: '#141414', border: `1px solid ${r.status === 'finished' ? '#1f1f1f' : 'rgba(239,68,68,0.2)'}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate" style={{ fontSize: '14px' }}>{r.title}</p>
                <p style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>
                  Mã: <span style={{ color: '#888', fontWeight: 700 }}>{r.code}</span>
                  {' · '}{formatDate(r.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-full font-bold"
                      style={{
                        fontSize: '10px',
                        background: r.status === 'finished' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                        color: r.status === 'finished' ? '#4ade80' : '#f87171',
                        border: `1px solid ${r.status === 'finished' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                  {r.status === 'finished' ? '✓ Xong' : '✗ Hủy'}
                </span>
                <span style={{ fontSize: '12px', color: '#444' }}>›</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <span style={{ fontSize: '11px', color: '#555' }}>👥 {r.playerCount} người</span>
              <span style={{ fontSize: '11px', color: '#555' }}>❓ {r.total_questions} câu</span>
              {r.winner && (
                <span style={{ fontSize: '11px', color: '#facc15' }}>🥇 {r.winner}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
