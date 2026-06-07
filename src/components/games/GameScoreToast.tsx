import { useEffect, useState } from 'react'

interface Props {
  score:        number
  maxScore:     number
  isNewRecord:  boolean
  isTopThree:   boolean
  rank?:        number
  gameTitle:    string
  onDismiss:    () => void
  autoClose?:   number   // ms, default 4000
}

interface Milestone {
  icon:  string
  label: string
  color: string
}

function getMilestones(score: number, maxScore: number, isNewRecord: boolean, isTopThree: boolean, rank?: number): Milestone[] {
  const milestones: Milestone[] = []
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0

  if (isNewRecord)        milestones.push({ icon: '🏆', label: 'Kỷ lục cá nhân mới!', color: '#facc15' })
  if (isTopThree && rank) milestones.push({ icon: '🥇🥈🥉'[rank - 1] ?? '🏅', label: `Top ${rank} bảng xếp hạng!`, color: '#E94E1B' })
  if (pct >= 100)         milestones.push({ icon: '💯', label: 'Điểm tuyệt đối!', color: '#34d399' })
  else if (pct >= 80)     milestones.push({ icon: '⭐', label: 'Xuất sắc!', color: '#34d399' })
  else if (pct >= 60)     milestones.push({ icon: '👍', label: 'Tốt lắm!', color: '#60a5fa' })

  return milestones
}

export default function GameScoreToast({
  score, maxScore, isNewRecord, isTopThree, rank, gameTitle, onDismiss, autoClose = 4000,
}: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const t1 = setTimeout(() => setVisible(true), 50)
    // Auto dismiss
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, autoClose)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [autoClose, onDismiss])

  const milestones = getMilestones(score, maxScore, isNewRecord, isTopThree, rank)
  const pct = maxScore > 0 ? Math.min(100, Math.round((score / maxScore) * 100)) : 0

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center pointer-events-none"
      style={{ padding: '0 0 80px 0' }}>
      <div
        className="pointer-events-auto w-full max-w-[390px] mx-4 rounded-2xl px-4 py-4 transition-all duration-300"
        style={{
          background:  'rgba(10,10,10,0.97)',
          border:      '1px solid rgba(233,78,27,0.3)',
          boxShadow:   '0 8px 40px rgba(0,0,0,0.8)',
          transform:   visible ? 'translateY(0)' : 'translateY(120px)',
          opacity:     visible ? 1 : 0,
        }}
        onClick={() => { setVisible(false); setTimeout(onDismiss, 300) }}>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(233,78,27,0.12)', border: '1px solid rgba(233,78,27,0.3)', fontSize: '18px' }}>
            🎮
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontSize: '11px', color: '#585858' }} className="truncate">{gameTitle}</p>
            <div className="flex items-baseline gap-1.5">
              <p className="font-black" style={{ fontSize: '22px', color: '#E94E1B', lineHeight: 1 }}>
                +{score}
              </p>
              <p style={{ fontSize: '11px', color: '#585858' }}>điểm · {pct}%</p>
            </div>
          </div>
          <button style={{ fontSize: '16px', color: '#484848', flexShrink: 0 }}>×</button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full mb-3" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-all"
               style={{ width: `${pct}%`, background: pct >= 80 ? '#34d399' : pct >= 60 ? '#facc15' : '#E94E1B' }} />
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {milestones.map((m, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full font-bold"
                    style={{ fontSize: '10px', background: `${m.color}18`, border: `1px solid ${m.color}33`, color: m.color }}>
                {m.icon} {m.label}
              </span>
            ))}
          </div>
        )}

        <p style={{ fontSize: '9px', color: '#383838', marginTop: 8, textAlign: 'center' }}>
          Nhấn để đóng
        </p>
      </div>
    </div>
  )
}
