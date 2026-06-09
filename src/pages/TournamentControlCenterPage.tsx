/**
 * TournamentControlCenterPage — STEP 80
 * Admin: trung tâm điều hành giải đấu — truy cập nhanh tất cả công cụ.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'
import GameRoomPage from './GameRoomPage'
import TournamentBracketPage from './TournamentBracketPage'
import StageRecognitionPage from './StageRecognitionPage'
import DeptTournamentPage from './DeptTournamentPage'
import SeasonLeaderboardPage from './SeasonLeaderboardPage'

interface Props {
  onClose: () => void
}

interface QuickStat {
  icon:  string
  label: string
  value: string | number
  color: string
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

type SubView = null | 'live' | 'bracket' | 'stage' | 'dept' | 'season'

export default function TournamentControlCenterPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = currentUser ? canAccessAdminPanel(currentUser.role) : false

  const [stats, setStats]     = useState<QuickStat[]>([])
  const [loading, setLoading] = useState(true)
  const [subView, setSubView] = useState<SubView>(null)

  useEffect(() => {
    if (!isAdmin) return
    const fetchStats = async () => {
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select('user_id, score, score_credited')
        .eq('status', 'completed')
        .gte('completed_at', getSeasonStart())

      if (sessions) {
        const totalPlays   = sessions.length
        const credited     = sessions.filter(s => s.score_credited).length
        const uniquePlayers = new Set(sessions.map(s => s.user_id)).size
        const totalScore   = sessions.reduce((a, s) => a + s.score, 0)
        setStats([
          { icon: '🎮', label: 'Lượt chơi mùa', value: totalPlays,   color: '#E94E1B' },
          { icon: '👥', label: 'Người tham gia', value: uniquePlayers, color: '#8b5cf6' },
          { icon: '✅', label: 'Lượt tính điểm', value: credited,     color: '#34d399' },
          { icon: '💯', label: 'Tổng điểm mùa',  value: `${totalScore.toLocaleString('vi-VN')}đ`, color: '#facc15' },
        ])
      }
      setLoading(false)
    }
    void fetchStats()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
           style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="text-center px-6">
          <p style={{ fontSize: '40px' }}>🚫</p>
          <p className="text-white font-bold mt-3">Chỉ Admin</p>
          <button onClick={onClose} className="mt-4 btn-primary px-6 py-2">Đóng</button>
        </div>
      </div>
    )
  }

  // Sub-views rendered on top
  if (subView === 'live')    return <GameRoomPage        onClose={() => setSubView(null)} />
  if (subView === 'bracket') return <TournamentBracketPage   onClose={() => setSubView(null)} />
  if (subView === 'stage')   return <StageRecognitionPage    onClose={() => setSubView(null)} />
  if (subView === 'dept')    return <DeptTournamentPage      onClose={() => setSubView(null)} />
  if (subView === 'season')  return <SeasonLeaderboardPage   onClose={() => setSubView(null)} />

  const TOOLS = [
    {
      id:    'live' as SubView,
      icon:  '🎯',
      title: 'Live Quiz Room',
      desc:  'Tạo phòng thi trực tiếp bằng mã',
      color: '#10b981',
      badge: 'LIVE',
    },
    {
      id:    'bracket' as SubView,
      icon:  '🏆',
      title: 'Tournament Bracket',
      desc:  'Vòng loại, chung kết, xác định thắng',
      color: '#facc15',
      badge: null,
    },
    {
      id:    'stage' as SubView,
      icon:  '🎖️',
      title: 'Stage Recognition',
      desc:  'Màn hình sân khấu vinh danh top 3',
      color: '#E94E1B',
      badge: 'NEW',
    },
    {
      id:    'dept' as SubView,
      icon:  '🏢',
      title: 'Dept Tournament',
      desc:  'Xếp hạng thi đua theo phòng ban',
      color: '#8b5cf6',
      badge: null,
    },
    {
      id:    'season' as SubView,
      icon:  '📊',
      title: 'Season Leaderboard',
      desc:  'Bảng xếp hạng mùa + phần thưởng',
      color: '#3b82f6',
      badge: null,
    },
  ]

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
              Tournament Center
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Admin · điều hành giải đấu · {getMonthLabel()}</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: '16px' }}>
            🎯
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {/* Quick stats */}
          {!loading && stats.length > 0 && (
            <>
              <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
                Thống kê mùa hiện tại
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {stats.map(stat => (
                  <div key={stat.label}
                       className="rounded-xl px-3 py-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <p style={{ fontSize: '18px' }}>{stat.icon}</p>
                    <p className="font-black mt-1 truncate" style={{ fontSize: '18px', color: stat.color }}>
                      {stat.value}
                    </p>
                    <p style={{ fontSize: '10px', color: '#585858' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tool grid */}
          <p className="font-bold text-white mb-2.5" style={{ fontSize: '13px' }}>
            Công cụ điều hành
          </p>
          <div className="flex flex-col gap-2.5">
            {TOOLS.map(tool => (
              <button
                key={tool.id}
                onClick={() => setSubView(tool.id)}
                className="w-full rounded-xl px-4 py-3.5 text-left transition-all active:scale-[0.98]"
                style={{
                  background: `${tool.color}0a`,
                  border:     `1px solid ${tool.color}25`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                       style={{ background: `${tool.color}15`, border: `1px solid ${tool.color}30`, fontSize: '18px' }}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold" style={{ fontSize: '13px' }}>{tool.title}</p>
                      {tool.badge && (
                        <span className="px-1.5 py-0.5 rounded font-bold"
                              style={{ fontSize: '8px', background: `${tool.color}20`, color: tool.color }}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#585858' }}>{tool.desc}</p>
                  </div>
                  <span style={{ fontSize: '14px', color: tool.color, flexShrink: 0 }}>→</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
