/**
 * StageRecognitionPage — STEP 79
 * Màn hình sân khấu vinh danh: top 3 podium, animated celebration.
 * Fetch từ season leaderboard + tournament bracket winner.
 */
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Props {
  onClose: () => void
}

interface PodiumPlayer {
  rank:     number
  name:     string | null
  orgGroup: string | null
  score:    number
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

const CONFETTI_CHARS = ['🎉','✨','🌟','🏆','💫','🎊','⭐','🥳']

function ConfettiPiece({ delay }: { delay: number }) {
  const char = CONFETTI_CHARS[Math.floor(delay * 100) % CONFETTI_CHARS.length]
  const left = ((delay * 137.5) % 100)
  return (
    <div
      className="absolute animate-bounce pointer-events-none select-none"
      style={{
        left:       `${left}%`,
        top:        `-${20 + (delay * 50) % 60}px`,
        fontSize:   `${12 + (delay * 30) % 16}px`,
        animationDelay: `${delay * 0.3}s`,
        animationDuration: `${1.2 + (delay * 0.1) % 0.8}s`,
        opacity: 0.7,
      }}>
      {char}
    </div>
  )
}

const PODIUM_CONFIG = [
  { rank: 1, height: 130, color: '#facc15', medalEmoji: '🥇', label: 'Quán quân', zIdx: 10 },
  { rank: 2, height: 90,  color: '#9ca3af', medalEmoji: '🥈', label: 'Á quân',    zIdx: 9  },
  { rank: 3, height: 70,  color: '#d97706', medalEmoji: '🥉', label: 'Hạng 3',    zIdx: 8  },
]

// Display order for podium: 2nd (left), 1st (center), 3rd (right)
const PODIUM_ORDER = [1, 0, 2]  // indices into PODIUM_CONFIG

export default function StageRecognitionPage({ onClose }: Props) {
  const [players, setPlayers] = useState<PodiumPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [reveal, setReveal]   = useState(false)

  const fetchTop3 = useCallback(async () => {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    if (sessions) {
      const userScore: Record<string, { name: string | null; org: string | null; score: number }> = {}
      for (const s of sessions) {
        const uid  = s.user_id
        const prof = s.profiles as unknown as { full_name: string | null; org_group: string | null } | null
        if (!userScore[uid]) userScore[uid] = { name: prof?.full_name ?? null, org: prof?.org_group ?? null, score: 0 }
        userScore[uid].score += s.score
      }

      const top3 = Object.values(userScore)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((p, i) => ({ rank: i + 1, name: p.name, orgGroup: p.org, score: p.score }))

      setPlayers(top3)
    }
    setLoading(false)
    // Trigger reveal animation after data loads
    setTimeout(() => setReveal(true), 100)
  }, [])

  useEffect(() => { void fetchTop3() }, [fetchTop3])

  function initials(name: string | null): string {
    if (!name) return '?'
    return name.trim().split(' ').slice(-1)[0].charAt(0).toUpperCase()
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
         style={{ background: 'radial-gradient(ellipse at center, #1a0a05 0%, #0a0a0a 70%)' }}>

      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {reveal && Array.from({ length: 20 }).map((_, i) => (
          <ConfettiPiece key={i} delay={i * 0.15} />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 left-5 w-9 h-9 rounded-xl flex items-center justify-center z-10"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#888', fontSize: '16px' }}>
        ←
      </button>

      {/* Content */}
      <div className="w-full max-w-[430px] px-4 flex flex-col items-center">

        {/* Title */}
        <div className={`text-center mb-8 transition-all duration-700 ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <p style={{ fontSize: '32px', marginBottom: 8 }}>🏆</p>
          <p className="font-black text-white" style={{ fontSize: '22px', letterSpacing: '-0.5px' }}>
            Vinh danh mùa này
          </p>
          <p style={{ fontSize: '13px', color: '#585858', marginTop: 4 }}>
            Top 3 nhân viên xuất sắc nhất
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <span style={{ fontSize: '32px' }}>⏳</span>
            <p style={{ fontSize: '13px', color: '#484848' }}>Đang tải...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center">
            <p style={{ fontSize: '40px', marginBottom: 12 }}>📭</p>
            <p className="text-white font-bold" style={{ fontSize: '15px' }}>Chưa có dữ liệu mùa này</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className="flex items-end justify-center gap-3 w-full mb-8">
              {PODIUM_ORDER.map((configIdx, displayPos) => {
                const cfg    = PODIUM_CONFIG[configIdx]
                const player = players[cfg.rank - 1]
                const delay  = displayPos * 0.2

                return (
                  <div key={cfg.rank}
                       className={`flex flex-col items-center transition-all duration-700`}
                       style={{
                         flex: cfg.rank === 1 ? '0 0 120px' : '0 0 90px',
                         opacity:   reveal ? 1 : 0,
                         transform: reveal ? 'translateY(0)' : 'translateY(30px)',
                         transitionDelay: `${delay}s`,
                       }}>
                    {/* Avatar */}
                    <div className="relative mb-2">
                      <div className="rounded-2xl flex items-center justify-center font-black"
                           style={{
                             width:    cfg.rank === 1 ? '64px' : '52px',
                             height:   cfg.rank === 1 ? '64px' : '52px',
                             background: `${cfg.color}20`,
                             border:   `2px solid ${cfg.color}`,
                             color:    cfg.color,
                             fontSize: cfg.rank === 1 ? '22px' : '18px',
                           }}>
                        {player ? initials(player.name) : '?'}
                      </div>
                      <div className="absolute -top-2 -right-2 rounded-full w-7 h-7 flex items-center justify-center"
                           style={{ fontSize: cfg.rank === 1 ? '20px' : '16px', background: '#0a0a0a' }}>
                        {cfg.medalEmoji}
                      </div>
                    </div>

                    {/* Name */}
                    <p className="font-black text-center truncate w-full"
                       style={{ fontSize: cfg.rank === 1 ? '13px' : '11px', color: cfg.color, paddingBottom: 6 }}>
                      {player?.name?.split(' ').slice(-1)[0] ?? '—'}
                    </p>
                    <p className="font-black text-center"
                       style={{ fontSize: cfg.rank === 1 ? '12px' : '10px', color: '#E94E1B', paddingBottom: 6 }}>
                      {player?.score.toLocaleString('vi-VN')}đ
                    </p>

                    {/* Podium block */}
                    <div className="w-full rounded-t-xl flex items-end justify-center"
                         style={{ height: `${cfg.height}px`, background: `${cfg.color}18`, border: `1px solid ${cfg.color}30` }}>
                      <p className="font-black pb-3" style={{ fontSize: cfg.rank === 1 ? '24px' : '18px', color: cfg.color }}>
                        {cfg.rank}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cards for all top 3 */}
            <div className={`w-full flex flex-col gap-2 transition-all duration-700 ${reveal ? 'opacity-100' : 'opacity-0'}`}
                 style={{ transitionDelay: '0.6s' }}>
              {players.map((p, i) => (
                <div key={p.rank}
                     className="rounded-xl px-4 py-3 flex items-center gap-3"
                     style={{
                       background: `${PODIUM_CONFIG[i]?.color ?? '#585858'}0a`,
                       border:     `1px solid ${PODIUM_CONFIG[i]?.color ?? '#585858'}25`,
                     }}>
                  <span style={{ fontSize: '20px' }}>{PODIUM_CONFIG[i]?.medalEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate" style={{ fontSize: '13px' }}>
                      {p.name ?? '—'}
                    </p>
                    {p.orgGroup && <p style={{ fontSize: '10px', color: '#585858' }}>{p.orgGroup}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black" style={{ fontSize: '14px', color: '#E94E1B' }}>
                      {p.score.toLocaleString('vi-VN')}đ
                    </p>
                    <p style={{ fontSize: '10px', color: '#585858' }}>{PODIUM_CONFIG[i]?.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
