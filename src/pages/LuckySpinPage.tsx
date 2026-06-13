import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// ── Helpers ───────────────────────────────────────────────────
function getWeekPeriod(): string {
  const now  = new Date()
  const year = now.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ── Prize config ──────────────────────────────────────────────
interface Prize {
  id:         string
  label:      string
  sublabel:   string
  type:       'points' | 'badge' | 'miss' | 'bonus_spin'
  value:      string
  color:      string
  weight:     number // probability weight
  pointCost?: number // nếu là prize điểm cộng thẳng
}

const PRIZES: Prize[] = [
  { id: 'p10',    label: '+10 điểm',   sublabel: 'Điểm thưởng',    type: 'points',     value: '+10',       color: '#3b82f6', weight: 25 },
  { id: 'p25',    label: '+25 điểm',   sublabel: 'Điểm thưởng',    type: 'points',     value: '+25',       color: '#8b5cf6', weight: 18 },
  { id: 'p50',    label: '+50 điểm',   sublabel: 'Điểm thưởng',    type: 'points',     value: '+50',       color: '#E94E1B', weight: 12 },
  { id: 'p100',   label: '+100 điểm',  sublabel: 'Đại thưởng!',    type: 'points',     value: '+100',      color: '#f59e0b', weight: 5  },
  { id: 'miss1',  label: 'Hên lần sau', sublabel: 'Tiếc quá!',     type: 'miss',       value: 'miss',      color: '#6b7280', weight: 20 },
  { id: 'miss2',  label: 'Trượt rồi',  sublabel: 'Cố lên!',        type: 'miss',       value: 'miss',      color: '#6b7280', weight: 15 },
  { id: 'spin1',  label: '+1 Lượt',    sublabel: 'Thêm lượt quay', type: 'bonus_spin', value: '+1_spin',   color: '#10b981', weight: 4  },
  { id: 'badge1', label: '🌟 Huy Hiệu', sublabel: 'Badge đặc biệt', type: 'badge',      value: 'badge_star', color: '#fbbf24', weight: 1  },
]

const SPIN_COST = 50 // điểm để mua 1 lượt quay
const MAX_PAID_SPINS = 5 // tối đa 5 lượt mua/tuần

function weightedRandom(prizes: Prize[]): number {
  const total = prizes.reduce((s, p) => s + p.weight, 0)
  let r = Math.random() * total
  for (let i = 0; i < prizes.length; i++) {
    r -= prizes[i].weight
    if (r <= 0) return i
  }
  return prizes.length - 1
}

// ── Types ─────────────────────────────────────────────────────
interface SpinLog {
  id:          string
  prize_label: string
  prize_type:  string
  week_period: string
  is_free:     boolean
  created_at:  string
}

interface Props { onClose: () => void }

// ── Component ─────────────────────────────────────────────────
export default function LuckySpinPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const week = getWeekPeriod()

  const [spinning,      setSpinning]      = useState(false)
  const [angle,         setAngle]         = useState(0)
  const [result,        setResult]        = useState<Prize | null>(null)
  const [hasFree,       setHasFree]       = useState(false)
  const [paidLeft,      setPaidLeft]      = useState(MAX_PAID_SPINS)
  const [userScore,     setUserScore]     = useState(currentUser?.score ?? 0)
  const [history,       setHistory]       = useState<SpinLog[]>([])
  const [loading,       setLoading]       = useState(true)
  const [showResult,    setShowResult]    = useState(false)
  const [bonusSpins,    setBonusSpins]    = useState(0)
  const [globalFeed,    setGlobalFeed]    = useState<{ name: string; prize: string }[]>([])
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { void loadState() }, [currentUser?.id])

  async function loadState() {
    setLoading(true)
    if (!currentUser?.id) { setLoading(false); return }

    // Check free spin
    const { data: freeCheck } = await supabase
      .rpc('check_free_spin', { p_week: week })
    setHasFree(freeCheck ?? true)

    // Count paid spins this week
    const { count } = await supabase
      .from('spin_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', currentUser.id)
      .eq('week_period', week)
      .eq('is_free', false)
    setPaidLeft(MAX_PAID_SPINS - (count ?? 0))

    // User score
    const { data: profile } = await supabase
      .from('profiles')
      .select('score')
      .eq('id', currentUser.id)
      .maybeSingle()
    setUserScore(profile?.score ?? currentUser.score ?? 0)

    // History
    const { data: logs } = await supabase
      .from('spin_logs')
      .select('id, prize_label, prize_type, week_period, is_free, created_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory((logs ?? []) as SpinLog[])

    // Global feed (last 8 winners from all users)
    const { data: feed } = await supabase
      .from('spin_logs')
      .select('prize_label, prize_type, profiles!spin_logs_user_id_fkey(full_name)')
      .neq('prize_type', 'miss')
      .order('created_at', { ascending: false })
      .limit(8)
    setGlobalFeed(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (feed ?? []).map((f: any) => ({
        name: f.profiles?.full_name?.split(' ').slice(-1)[0] ?? 'Ai đó',
        prize: f.prize_label,
      }))
    )

    setLoading(false)
  }

  function calcSpinAngle(prizeIdx: number): number {
    const sliceAngle = 360 / PRIZES.length
    const targetAngle = 360 - (prizeIdx * sliceAngle + sliceAngle / 2)
    const extraRotations = 5 * 360
    return extraRotations + targetAngle
  }

  async function handleSpin(isFree: boolean) {
    if (spinning || !currentUser?.id) return
    if (!isFree && bonusSpins <= 0 && userScore < SPIN_COST) return

    setSpinning(true)
    setResult(null)
    setShowResult(false)

    const prizeIdx = weightedRandom(PRIZES)
    const prize    = PRIZES[prizeIdx]
    const newAngle = angle + calcSpinAngle(prizeIdx)
    setAngle(newAngle)

    // Deduct cost if paid
    const pointsCost = (isFree || bonusSpins > 0) ? 0 : SPIN_COST
    if (bonusSpins > 0 && !isFree) setBonusSpins(b => b - 1)

    // Save to DB
    await supabase.from('spin_logs').insert({
      user_id:     currentUser.id,
      prize_type:  prize.type,
      prize_value: prize.value,
      prize_label: prize.label,
      week_period: week,
      is_free:     isFree,
      points_cost: pointsCost,
    })

    // Apply prize
    if (prize.type === 'points' && prize.value.startsWith('+')) {
      const pts = parseInt(prize.value.replace('+', ''))
      await supabase.from('profiles').update({ score: userScore - pointsCost + pts })
        .eq('id', currentUser.id)
      setUserScore(s => s - pointsCost + pts)
    } else if (prize.type === 'miss' && pointsCost > 0) {
      await supabase.from('profiles').update({ score: userScore - pointsCost })
        .eq('id', currentUser.id)
      setUserScore(s => s - pointsCost)
    } else if (prize.type === 'bonus_spin') {
      setBonusSpins(b => b + 1)
    }

    if (isFree) setHasFree(false)
    else if (bonusSpins <= 0) setPaidLeft(p => p - 1)

    // Show result after spin animation (3.5s)
    setTimeout(() => {
      setResult(prize)
      setSpinning(false)
      setShowResult(true)
      void loadState()
    }, 3600)
  }

  // ── Wheel rendering ─────────────────────────────────────────
  const sliceAngle = 360 / PRIZES.length

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">🎰 Vòng Quay May Mắn</p>
          <p className="text-text-muted text-xs">Kỳ: {week} · Điểm: {userScore}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {loading && <p className="text-text-muted text-sm text-center py-16">Đang tải...</p>}

        {!loading && (
          <>
            {/* Global feed */}
            {globalFeed.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {globalFeed.map((f, i) => (
                  <div key={i} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold"
                    style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', color: '#E94E1B', whiteSpace: 'nowrap' }}>
                    🎉 {f.name}: {f.prize}
                  </div>
                ))}
              </div>
            )}

            {/* Wheel */}
            <div className="flex flex-col items-center gap-4">
              {/* Pointer */}
              <div className="w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid #E94E1B' }} />

              {/* Wheel SVG */}
              <div ref={wheelRef} className="relative"
                style={{ width: 280, height: 280, transition: spinning ? 'transform 3.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none', transform: `rotate(${angle}deg)` }}>
                <svg width="280" height="280" viewBox="0 0 280 280">
                  {PRIZES.map((prize, i) => {
                    const startAngle = i * sliceAngle - 90
                    const endAngle   = startAngle + sliceAngle
                    const r = 130
                    const cx = 140, cy = 140
                    const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180)
                    const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180)
                    const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180)
                    const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180)
                    const midAngle = (startAngle + endAngle) / 2
                    const tx = cx + 85 * Math.cos((midAngle * Math.PI) / 180)
                    const ty = cy + 85 * Math.sin((midAngle * Math.PI) / 180)
                    return (
                      <g key={prize.id}>
                        <path
                          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 0,1 ${x2},${y2} Z`}
                          fill={i % 2 === 0 ? '#1a1a2e' : '#16213e'}
                          stroke={prize.color}
                          strokeWidth="1.5"
                        />
                        <text
                          x={tx} y={ty}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill={prize.color}
                          transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                        >
                          {prize.label}
                        </text>
                      </g>
                    )
                  })}
                  <circle cx="140" cy="140" r="28" fill="#0f0f1a" stroke="#E94E1B" strokeWidth="3" />
                  <text x="140" y="144" textAnchor="middle" fontSize="12" fontWeight="900" fill="white">QUAY</text>
                </svg>
              </div>

              {/* Spin buttons */}
              <div className="flex flex-col gap-2 w-full">
                {(hasFree || bonusSpins > 0) && (
                  <button
                    onClick={() => void handleSpin(hasFree)}
                    disabled={spinning}
                    className="btn-primary w-full disabled:opacity-50 font-black text-base py-3">
                    {spinning ? '🎰 Đang quay...' : hasFree ? '🎁 Quay miễn phí' : `🎁 Dùng lượt thưởng (+${bonusSpins})`}
                  </button>
                )}
                {!hasFree && bonusSpins === 0 && paidLeft > 0 && (
                  <button
                    onClick={() => void handleSpin(false)}
                    disabled={spinning || userScore < SPIN_COST}
                    className="w-full py-3 rounded-xl font-black text-base active:scale-95 disabled:opacity-50"
                    style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.4)', color: '#E94E1B' }}>
                    {spinning ? '🎰 Đang quay...' : `🎰 Dùng ${SPIN_COST} điểm (còn ${paidLeft} lượt)`}
                  </button>
                )}
                {!hasFree && bonusSpins === 0 && paidLeft === 0 && (
                  <div className="arena-card text-center py-4">
                    <p className="text-text-muted text-sm">Đã hết lượt tuần này 😴</p>
                    <p className="text-text-muted text-xs mt-1">Reset vào đầu tuần mới</p>
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="flex gap-3 w-full text-center">
                <div className="flex-1 arena-card py-2">
                  <p className="text-text-muted text-[10px]">Miễn phí</p>
                  <p className="font-black" style={{ color: hasFree ? '#34d399' : '#6b7280' }}>
                    {hasFree ? '✓ Còn' : '✗ Đã dùng'}
                  </p>
                </div>
                {bonusSpins > 0 && (
                  <div className="flex-1 arena-card py-2">
                    <p className="text-text-muted text-[10px]">Lượt thưởng</p>
                    <p className="text-brand font-black">+{bonusSpins}</p>
                  </div>
                )}
                <div className="flex-1 arena-card py-2">
                  <p className="text-text-muted text-[10px]">Trả điểm ({SPIN_COST}đ)</p>
                  <p className="font-black" style={{ color: paidLeft > 0 ? '#fbbf24' : '#6b7280' }}>
                    {paidLeft}/{MAX_PAID_SPINS} lượt
                  </p>
                </div>
              </div>
            </div>

            {/* Result popup */}
            {showResult && result && (
              <div className="arena-card flex flex-col items-center gap-3 py-6 text-center"
                style={{ border: `1px solid ${result.color}44` }}>
                <span className="text-5xl">{result.type === 'miss' ? '😅' : result.type === 'badge' ? '🌟' : result.type === 'bonus_spin' ? '🎁' : '🎉'}</span>
                <p className="text-white font-black text-xl" style={{ color: result.color }}>{result.label}</p>
                <p className="text-text-secondary text-sm">{result.sublabel}</p>
                <button onClick={() => setShowResult(false)} className="text-text-muted text-xs mt-1">Đóng</button>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div>
                <p className="section-title mb-3">📜 Lịch sử quay ({history.length})</p>
                <div className="flex flex-col gap-2">
                  {history.map(h => (
                    <div key={h.id} className="arena-card flex items-center gap-3">
                      <span className="text-xl">{h.prize_type === 'miss' ? '😅' : h.prize_type === 'badge' ? '🌟' : h.prize_type === 'bonus_spin' ? '🎁' : '🎉'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{h.prize_label}</p>
                        <p className="text-text-muted text-[10px]">{h.is_free ? 'Miễn phí' : 'Trả điểm'} · {h.week_period}</p>
                      </div>
                      <p className="text-text-muted text-[10px] shrink-0">
                        {new Date(h.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {history.length === 0 && !spinning && (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="text-4xl">🎰</span>
                <p className="text-text-muted text-sm text-center">Chưa có lịch sử. Hãy quay thử!</p>
              </div>
            )}
          </>
        )}
        <div className="h-4" />
      </div>
    </div>
  )
}
