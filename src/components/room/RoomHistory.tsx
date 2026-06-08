// STEP 102: Lịch sử phòng chơi — Admin xem lại
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface RoomSummary {
  id:             string
  code:           string
  title:          string
  status:         string
  created_at:     string
  ended_at:    string | null
  total_questions: number
  playerCount:    number
  winner:         string | null
}

interface Props {
  onClose: () => void
}

export default function RoomHistory({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [rooms, setRooms]   = useState<RoomSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('game_rooms')
      .select('id, code, title, status, created_at, ended_at, total_questions')
      .eq('created_by', currentUser!.id)
      .in('status', ['finished', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(20)
    if (!data) { setLoading(false); return }

    // For each room, get player count + winner
    const summaries: RoomSummary[] = await Promise.all(data.map(async r => {
      const [{ count }, { data: topPlayer }] = await Promise.all([
        supabase.from('room_players').select('id', { count: 'exact', head: true }).eq('room_id', r.id),
        supabase.from('room_players').select('display_name,score').eq('room_id', r.id).eq('final_rank', 1).single(),
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

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  }

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
          <p style={{ fontSize: '11px', color: '#555' }}>20 phòng gần nhất</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
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
          <div key={r.id} className="rounded-2xl p-4"
               style={{ background: '#141414', border: `1px solid ${r.status === 'finished' ? '#1f1f1f' : 'rgba(239,68,68,0.2)'}` }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-white" style={{ fontSize: '14px' }}>{r.title}</p>
                <p style={{ fontSize: '11px', color: '#555', marginTop: 2 }}>
                  Mã: <span style={{ color: '#888', fontWeight: 700 }}>{r.code}</span>
                  {' · '}{formatDate(r.created_at)}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full font-bold"
                    style={{
                      fontSize: '10px',
                      background: r.status === 'finished' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                      color: r.status === 'finished' ? '#4ade80' : '#f87171',
                      border: `1px solid ${r.status === 'finished' ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}>
                {r.status === 'finished' ? '✓ Hoàn thành' : '✗ Hủy'}
              </span>
            </div>

            <div className="flex gap-3 flex-wrap">
              <span style={{ fontSize: '11px', color: '#555' }}>
                👥 {r.playerCount} người chơi
              </span>
              <span style={{ fontSize: '11px', color: '#555' }}>
                ❓ {r.total_questions} câu
              </span>
              {r.winner && (
                <span style={{ fontSize: '11px', color: '#facc15' }}>
                  🥇 {r.winner}
                </span>
              )}
              {r.ended_at && (
                <span style={{ fontSize: '11px', color: '#444' }}>
                  Kết thúc: {formatDate(r.ended_at)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
