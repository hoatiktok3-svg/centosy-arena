/**
 * MyGameHistory — STEP 106
 * Nhân viên xem lịch sử thi đấu cá nhân:
 * - Danh sách các game đã tham gia
 * - Điểm, xếp hạng, số câu đúng mỗi game
 */
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface GameRecord {
  room_id:         string
  room_title:      string
  room_code:       string
  played_at:       string
  ended_at:        string | null
  score:           number
  correct_count:   number
  total_questions: number
  final_rank:      number | null
  total_players:   number
}

interface Props {
  onClose: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return `Hôm nay ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diffDays === 1) return `Hôm qua ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${d.getDate()}/${d.getMonth() + 1} lúc ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function RankBadge({ rank, total }: { rank: number | null; total: number }) {
  if (!rank) return <span style={{ fontSize: '11px', color: '#555' }}>—</span>
  if (rank <= 3) return (
    <div className="flex items-center gap-1">
      <span style={{ fontSize: '18px' }}>{MEDALS[rank - 1]}</span>
      <span className="font-black" style={{ fontSize: '12px', color: rank === 1 ? '#fbbf24' : rank === 2 ? '#d1d5db' : '#f97316' }}>
        #{rank}
      </span>
    </div>
  )
  return (
    <div className="flex flex-col items-center">
      <span className="font-black" style={{ fontSize: '13px', color: '#555' }}>#{rank}</span>
      <span style={{ fontSize: '10px', color: '#444' }}>/{total}</span>
    </div>
  )
}

export default function MyGameHistory({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [records, setRecords]   = useState<GameRecord[]>([])
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({ totalGames: 0, avgScore: 0, bestRank: 0, totalCorrect: 0 })

  useEffect(() => {
    void loadHistory()
  }, [])

  const loadHistory = async () => {
    if (!currentUser?.id) return
    setLoading(true)

    // Lấy room_players của user JOIN game_rooms đã kết thúc
    const { data } = await supabase
      .from('room_players')
      .select(`
        score,
        correct_count,
        final_rank,
        game_rooms (
          id,
          title,
          code,
          created_at,
          ended_at,
          total_questions,
          status
        )
      `)
      .eq('user_id', currentUser.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Lọc game đã kết thúc + map sang GameRecord
    const finished = data.filter((row: any) => row.game_rooms?.status === 'finished')

    // Lấy tổng số player của mỗi phòng
    const roomIds = finished.map((r: any) => r.game_rooms?.id).filter(Boolean) as string[]
    const playerCountMap: Record<string, number> = {}

    if (roomIds.length > 0) {
      const { data: counts } = await supabase
        .from('room_players')
        .select('room_id')
        .in('room_id', roomIds)
        .eq('is_active', true)
      if (counts) {
        counts.forEach((r: any) => {
          playerCountMap[r.room_id] = (playerCountMap[r.room_id] ?? 0) + 1
        })
      }
    }

    const mapped: GameRecord[] = finished.map((row: any) => ({
      room_id:         row.game_rooms?.id ?? '',
      room_title:      row.game_rooms?.title ?? 'Phòng không tên',
      room_code:       row.game_rooms?.code ?? '',
      played_at:       row.game_rooms?.created_at ?? '',
      ended_at:        row.game_rooms?.ended_at ?? null,
      score:           row.score ?? 0,
      correct_count:   row.correct_count ?? 0,
      total_questions: row.game_rooms?.total_questions ?? 0,
      final_rank:      row.final_rank ?? null,
      total_players:   playerCountMap[row.game_rooms?.id] ?? 1,
    }))

    setRecords(mapped)

    // Tính thống kê tổng
    if (mapped.length > 0) {
      const totalGames   = mapped.length
      const avgScore     = Math.round(mapped.reduce((s, r) => s + r.score, 0) / totalGames)
      const bestRank     = Math.min(...mapped.filter(r => r.final_rank).map(r => r.final_rank!))
      const totalCorrect = mapped.reduce((s, r) => s + r.correct_count, 0)
      setStats({ totalGames, avgScore, bestRank: bestRank === Infinity ? 0 : bestRank, totalCorrect })
    }

    setLoading(false)
  }

  const accuracyPct = (r: GameRecord) =>
    r.total_questions > 0 ? Math.round((r.correct_count / r.total_questions) * 100) : 0

  return (
    <div className="fixed inset-0 z-[160] flex flex-col" style={{ background: '#080808' }}>

      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div>
          <p className="font-black text-white" style={{ fontSize: '15px' }}>📊 Lịch sử thi đấu</p>
          <p style={{ fontSize: '11px', color: '#555' }}>Kết quả các game bạn đã tham gia</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">

          {/* Stats overview */}
          {records.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-1">
              {[
                { label: 'Đã chơi',  value: `${stats.totalGames}`,   icon: '🎮', color: '#E94E1B' },
                { label: 'Avg điểm', value: `${stats.avgScore}đ`,    icon: '⭐', color: '#f59e0b' },
                { label: 'Best',     value: stats.bestRank ? `#${stats.bestRank}` : '—', icon: '🏆', color: '#fbbf24' },
                { label: 'Câu đúng', value: `${stats.totalCorrect}`, icon: '✅', color: '#10b981' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                     style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                  <p style={{ fontSize: '16px' }}>{s.icon}</p>
                  <p className="font-black" style={{ fontSize: '14px', color: s.color, marginTop: 2 }}>{s.value}</p>
                  <p style={{ fontSize: '9px', color: '#555', marginTop: 1 }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {records.length === 0 ? (
            <div className="rounded-2xl py-16 flex flex-col items-center gap-3"
                 style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '40px' }}>🎮</p>
              <p className="font-bold text-white" style={{ fontSize: '14px' }}>Chưa có lịch sử thi đấu</p>
              <p style={{ fontSize: '12px', color: '#555', textAlign: 'center', maxWidth: 240, lineHeight: 1.6 }}>
                Tham gia phòng thi trực tiếp để ghi lại thành tích của bạn.
              </p>
            </div>
          ) : (
            records.map((r, idx) => (
              <div key={r.room_id + idx} className="rounded-2xl p-4"
                   style={{ background: '#141414', border: '1px solid #1f1f1f' }}>

                {/* Top row: title + rank */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate" style={{ fontSize: '14px' }}>
                      {r.room_title}
                    </p>
                    <p style={{ fontSize: '10px', color: '#555', marginTop: 2 }}>
                      {formatDate(r.played_at)}
                    </p>
                  </div>
                  <RankBadge rank={r.final_rank} total={r.total_players} />
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3">
                  {/* Score */}
                  <div className="flex-1 rounded-xl px-3 py-2"
                       style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.2)' }}>
                    <p style={{ fontSize: '10px', color: '#666' }}>Điểm</p>
                    <p className="font-black" style={{ fontSize: '18px', color: '#E94E1B' }}>{r.score}</p>
                  </div>

                  {/* Correct */}
                  <div className="flex-1 rounded-xl px-3 py-2"
                       style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p style={{ fontSize: '10px', color: '#666' }}>Câu đúng</p>
                    <p className="font-black" style={{ fontSize: '18px', color: '#10b981' }}>
                      {r.correct_count}<span style={{ fontSize: '12px', fontWeight: 400, color: '#555' }}>/{r.total_questions}</span>
                    </p>
                  </div>

                  {/* Accuracy */}
                  <div className="flex-1 rounded-xl px-3 py-2"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <p style={{ fontSize: '10px', color: '#666' }}>Chính xác</p>
                    <p className="font-black" style={{ fontSize: '18px', color: accuracyPct(r) >= 70 ? '#fbbf24' : '#888' }}>
                      {accuracyPct(r)}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
