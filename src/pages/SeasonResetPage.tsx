/**
 * SeasonResetPage — STEP 75
 * Admin: xem thống kê mùa hiện tại, archive snapshot, reset mùa mới.
 * Snapshot lưu vào localStorage (mock — production: server-side action).
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface SeasonSnapshot {
  id:          string
  label:       string   // e.g. "Tháng 5 2025"
  start:       string   // ISO
  end:         string   // ISO (archived timestamp)
  totalPlays:  number
  uniqueUsers: number
  topUser:     string | null
  topScore:    number
}

const STORAGE_KEY = 'centosy_season_archives'

function loadArchives(): SeasonSnapshot[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as SeasonSnapshot[]
  } catch { return [] }
}

function saveArchives(snaps: SeasonSnapshot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snaps))
}

function getMonthLabel(date: Date): string {
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export default function SeasonResetPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [loading, setLoading]           = useState(true)
  const [totalPlays, setTotalPlays]     = useState(0)
  const [uniqueUsers, setUniqueUsers]   = useState(0)
  const [topUser, setTopUser]           = useState<string | null>(null)
  const [topScore, setTopScore]         = useState(0)
  const [archives, setArchives]         = useState<SeasonSnapshot[]>(loadArchives)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [archiving, setArchiving]       = useState(false)
  const [done, setDone]                 = useState(false)

  const isAdmin = currentUser ? canAccessAdminPanel(currentUser.role) : false
  const seasonLabel = getMonthLabel(new Date())

  const fetchStats = useCallback(async () => {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(full_name)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    if (sessions) {
      setTotalPlays(sessions.length)
      setUniqueUsers(new Set(sessions.map(s => s.user_id)).size)

      // Top user by total score this season
      const userScore: Record<string, { name: string | null; score: number }> = {}
      for (const s of sessions) {
        const uid  = s.user_id
        const name = (s.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null
        if (!userScore[uid]) userScore[uid] = { name, score: 0 }
        userScore[uid].score += s.score
      }
      const top = Object.values(userScore).sort((a, b) => b.score - a.score)[0]
      if (top) { setTopUser(top.name); setTopScore(top.score) }
    }
    setLoading(false)
  }, [])

  useEffect(() => { void fetchStats() }, [fetchStats])

  const handleArchive = async () => {
    setArchiving(true)
    const snapshot: SeasonSnapshot = {
      id:          `season_${Date.now()}`,
      label:       seasonLabel,
      start:       getSeasonStart(),
      end:         new Date().toISOString(),
      totalPlays,
      uniqueUsers,
      topUser,
      topScore,
    }
    const updated = [snapshot, ...archives]
    saveArchives(updated)
    setArchives(updated)
    setConfirmOpen(false)
    setArchiving(false)
    setDone(true)
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
           style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="text-center px-6">
          <p style={{ fontSize: '40px' }}>🚫</p>
          <p className="text-white font-bold mt-3">Không có quyền truy cập</p>
          <button onClick={onClose} className="mt-4 btn-primary px-6 py-2">Đóng</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.93)' }}>
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
              Season Reset
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Admin · đóng mùa + lưu lịch sử</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
            🗂️
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {/* Current season stats */}
          <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
            Mùa hiện tại — {seasonLabel}
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <span style={{ fontSize: '28px' }}>⏳</span>
              <p style={{ fontSize: '12px', color: '#484848' }}>Đang tải...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { icon: '🎮', label: 'Lượt chơi', value: totalPlays },
                { icon: '👥', label: 'Người chơi', value: uniqueUsers },
                { icon: '🏆', label: 'Top player', value: topUser ?? '—' },
                { icon: '💯', label: 'Top score', value: `${topScore}đ` },
              ].map(stat => (
                <div key={stat.label}
                     className="rounded-xl px-3 py-3"
                     style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                  <p style={{ fontSize: '18px' }}>{stat.icon}</p>
                  <p className="font-black text-white mt-1 truncate" style={{ fontSize: '16px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '10px', color: '#585858' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Archive action */}
          {done ? (
            <div className="rounded-xl px-4 py-4 mb-4 flex items-center gap-3"
                 style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)' }}>
              <span style={{ fontSize: '20px' }}>✅</span>
              <div>
                <p className="font-bold" style={{ fontSize: '13px', color: '#4ade80' }}>
                  Đã lưu snapshot mùa {seasonLabel}
                </p>
                <p style={{ fontSize: '11px', color: '#585858' }}>
                  Mùa mới bắt đầu tự động vào đầu tháng tới.
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-3.5 rounded-2xl font-black mb-4 transition-all active:scale-[0.98]"
              style={{ fontSize: '14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}>
              🗂️ Đóng & Lưu mùa {seasonLabel}
            </button>
          )}

          {/* Archive history */}
          {archives.length > 0 && (
            <>
              <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
                Lịch sử mùa đã lưu
              </p>
              <div className="flex flex-col gap-2">
                {archives.map(snap => (
                  <div key={snap.id}
                       className="rounded-xl px-3.5 py-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <div className="flex items-center gap-2.5">
                      <span style={{ fontSize: '16px' }}>🗂️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold" style={{ fontSize: '12px' }}>
                          {snap.label}
                        </p>
                        <p style={{ fontSize: '10px', color: '#585858' }}>
                          {snap.totalPlays} lượt · {snap.uniqueUsers} người · top: {snap.topUser ?? '—'} ({snap.topScore}đ)
                        </p>
                      </div>
                      <p style={{ fontSize: '10px', color: '#383838', whiteSpace: 'nowrap' }}>
                        {new Date(snap.end).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-[360px] rounded-2xl p-6"
               style={{ background: '#141414', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '32px', textAlign: 'center', marginBottom: 12 }}>⚠️</p>
            <p className="text-white font-black text-center" style={{ fontSize: '16px', marginBottom: 8 }}>
              Đóng mùa {seasonLabel}?
            </p>
            <p className="text-center" style={{ fontSize: '13px', color: '#888', marginBottom: 20 }}>
              Snapshot sẽ được lưu. Điểm game trong bảng xếp hạng mùa vẫn giữ nguyên — chỉ lưu lịch sử.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold"
                style={{ background: '#1f1f1f', border: '1px solid #2c2c2c', color: '#888', fontSize: '13px' }}>
                Huỷ
              </button>
              <button
                onClick={handleArchive}
                disabled={archiving}
                className="flex-1 py-3 rounded-xl font-bold transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: '13px' }}>
                {archiving ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
