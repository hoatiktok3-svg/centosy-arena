/**
 * DeptTournamentPage — STEP 76
 * Giải đấu theo phòng ban: tổng điểm game của từng dept, xếp hạng.
 * Season = tháng hiện tại. Realtime update.
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onClose: () => void
}

interface DeptRow {
  deptName:   string
  totalScore: number
  playCount:  number
  memberCount: number
  avgScore:   number
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getMonthLabel(): string {
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12']
  const now = new Date()
  return `${months[now.getMonth()]} ${now.getFullYear()}`
}

const DEPT_COLORS = ['#E94E1B','#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#84cc16']

export default function DeptTournamentPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const [depts, setDepts]     = useState<DeptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [liveFlag, setLiveFlag] = useState(false)
  const [myDept, setMyDept]   = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    // Get current user's dept
    if (currentUser?.id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('org_group')
        .eq('id', currentUser.id)
        .single()
      if (prof?.org_group) setMyDept(prof.org_group)
    }

    // Fetch season game sessions
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    if (sessions) {
      const deptMap: Record<string, { totalScore: number; playCount: number; members: Set<string> }> = {}

      for (const s of sessions) {
        const dept = (s.profiles as unknown as { org_group: string | null } | null)?.org_group ?? 'Không rõ'
        if (!deptMap[dept]) deptMap[dept] = { totalScore: 0, playCount: 0, members: new Set() }
        deptMap[dept].totalScore += s.score
        deptMap[dept].playCount  += 1
        deptMap[dept].members.add(s.user_id)
      }

      const rows: DeptRow[] = Object.entries(deptMap)
        .map(([deptName, d]) => ({
          deptName,
          totalScore:  d.totalScore,
          playCount:   d.playCount,
          memberCount: d.members.size,
          avgScore:    d.members.size > 0 ? Math.round(d.totalScore / d.members.size) : 0,
        }))
        .sort((a, b) => b.totalScore - a.totalScore)

      setDepts(rows)
    }
    setLoading(false)
  }, [currentUser?.id])

  useEffect(() => {
    void fetchData()

    const channel = supabase
      .channel('dept_tournament_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sessions' }, () => {
        setLiveFlag(true)
        void fetchData()
        setTimeout(() => setLiveFlag(false), 2000)
      })
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [fetchData])

  const myRankIdx = depts.findIndex(d => d.deptName === myDept)
  const maxScore  = depts[0]?.totalScore ?? 1

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
            <div className="flex items-center gap-2">
              <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
                Giải đấu phòng ban
              </p>
              {liveFlag && (
                <span className="px-1.5 py-0.5 rounded font-bold animate-pulse"
                      style={{ fontSize: '9px', background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                  LIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '11px', color: '#585858' }}>{getMonthLabel()} · tổng điểm game</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
            🏢
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {loading ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '32px' }}>⏳</span>
              <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
            </div>
          ) : depts.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <span style={{ fontSize: '40px' }}>🏢</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa có dữ liệu</p>
              <p style={{ fontSize: '12px', color: '#585858' }}>Cần ≥ 1 lượt chơi trong tháng</p>
            </div>
          ) : (
            <>
              {/* My dept banner */}
              {myDept && myRankIdx >= 0 && (
                <div className="mt-4 rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
                     style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.25)' }}>
                  <span style={{ fontSize: '18px' }}>🏢</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate" style={{ fontSize: '13px' }}>{myDept}</p>
                    <p style={{ fontSize: '10px', color: '#585858' }}>Hạng #{myRankIdx + 1}</p>
                  </div>
                  <p className="font-black shrink-0" style={{ fontSize: '16px', color: '#E94E1B' }}>
                    {depts[myRankIdx]?.totalScore.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              )}

              <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
                Xếp hạng phòng ban ({depts.length} phòng)
              </p>
              <div className="flex flex-col gap-2.5">
                {depts.map((dept, i) => {
                  const col   = DEPT_COLORS[i % DEPT_COLORS.length]
                  const isMe  = dept.deptName === myDept
                  const ratio = Math.round((dept.totalScore / maxScore) * 100)
                  return (
                    <div key={dept.deptName}
                         className="rounded-xl px-4 py-3.5"
                         style={{
                           background: isMe ? 'rgba(233,78,27,0.06)' : '#111',
                           border:     isMe ? '1px solid rgba(233,78,27,0.25)' : '1px solid #1f1f1f',
                         }}>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-black shrink-0 w-6 text-center" style={{ fontSize: '13px', color: i < 3 ? ['#facc15','#9ca3af','#d97706'][i] : '#484848' }}>
                          #{i + 1}
                        </p>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate" style={{ fontSize: '13px' }}>
                            {dept.deptName}
                          </p>
                          <p style={{ fontSize: '10px', color: '#585858' }}>
                            {dept.memberCount} người · {dept.playCount} lượt · avg {dept.avgScore}đ/người
                          </p>
                        </div>
                        <p className="font-black shrink-0" style={{ fontSize: '15px', color: col }}>
                          {dept.totalScore.toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="w-full h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
                        <div className="h-full rounded-full transition-all"
                             style={{ width: `${ratio}%`, background: col }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
