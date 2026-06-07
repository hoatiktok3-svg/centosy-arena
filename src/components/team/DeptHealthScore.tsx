import { useMemo } from 'react'

interface TeamMemberLike {
  score: number
  gamePlays: number
  missionsDone: number
}

interface HealthMetric {
  key:    string
  label:  string
  icon:   string
  value:  number   // 0-100
  raw:    string   // display string
  color:  string
}

interface Props {
  members: TeamMemberLike[]
  groupLabel: string
}

function getGrade(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Xuất sắc',      color: '#34d399', emoji: '🟢' }
  if (score >= 60) return { label: 'Tốt',            color: '#60a5fa', emoji: '🔵' }
  if (score >= 40) return { label: 'Trung bình',     color: '#facc15', emoji: '🟡' }
  return                  { label: 'Cần cải thiện',  color: '#f87171', emoji: '🔴' }
}

export default function DeptHealthScore({ members, groupLabel }: Props) {
  const health = useMemo<HealthMetric[]>(() => {
    if (members.length === 0) return []

    const total = members.length
    const activeCount   = members.filter(m => m.score > 0).length
    const missionCount  = members.filter(m => m.missionsDone > 0).length
    const gameCount     = members.filter(m => m.gamePlays > 0).length
    const avgScore      = members.reduce((s, m) => s + m.score, 0) / total

    // Normalise avg score to 0-100 based on 500pt ceiling
    const avgNorm = Math.min(100, Math.round((avgScore / 500) * 100))

    const activeRate   = Math.round((activeCount / total) * 100)
    const missionRate  = Math.round((missionCount / total) * 100)
    const gameRate     = Math.round((gameCount / total) * 100)

    return [
      {
        key: 'active', label: 'Tỉ lệ hoạt động', icon: '⚡',
        value: activeRate,
        raw: `${activeCount}/${total} người`,
        color: activeRate >= 70 ? '#34d399' : activeRate >= 40 ? '#facc15' : '#f87171',
      },
      {
        key: 'mission', label: 'Hoàn thành nhiệm vụ', icon: '✅',
        value: missionRate,
        raw: `${missionCount}/${total} người`,
        color: missionRate >= 70 ? '#34d399' : missionRate >= 40 ? '#facc15' : '#f87171',
      },
      {
        key: 'game', label: 'Tham gia game', icon: '🎮',
        value: gameRate,
        raw: `${gameCount}/${total} người`,
        color: gameRate >= 60 ? '#34d399' : gameRate >= 30 ? '#facc15' : '#f87171',
      },
      {
        key: 'score', label: 'Điểm trung bình', icon: '📊',
        value: avgNorm,
        raw: `${Math.round(avgScore).toLocaleString('vi-VN')} điểm`,
        color: avgNorm >= 50 ? '#34d399' : avgNorm >= 25 ? '#facc15' : '#f87171',
      },
    ]
  }, [members])

  const overallScore = useMemo(() => {
    if (health.length === 0) return 0
    const WEIGHTS = [0.3, 0.3, 0.2, 0.2]
    return Math.round(health.reduce((sum, m, i) => sum + m.value * WEIGHTS[i], 0))
  }, [health])

  if (members.length === 0) return null

  const grade = getGrade(overallScore)

  return (
    <div className="mt-4 rounded-2xl overflow-hidden"
         style={{ background: '#111', border: '1px solid #1f1f1f' }}>

      {/* ── Header row ── */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <span style={{ fontSize: '20px' }}>🏥</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-white" style={{ fontSize: '14px' }}>Sức khoẻ phòng ban</p>
          <p style={{ fontSize: '10px', color: '#585858' }}>{groupLabel}</p>
        </div>
        {/* Overall badge */}
        <div className="flex flex-col items-center shrink-0">
          <p className="font-black leading-none" style={{ fontSize: '26px', color: grade.color }}>{overallScore}</p>
          <p style={{ fontSize: '9px', color: grade.color, marginTop: 2, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {grade.emoji} {grade.label}
          </p>
        </div>
      </div>

      {/* ── Overall bar ── */}
      <div className="px-4 pb-3">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overallScore}%`, background: grade.color }}
          />
        </div>
      </div>

      {/* ── Metric rows ── */}
      <div style={{ borderTop: '1px solid #1a1a1a' }}>
        {health.map(m => (
          <div key={m.key} className="flex items-center gap-3 px-4 py-2.5"
               style={{ borderBottom: '1px solid #151515' }}>
            <span style={{ fontSize: '14px', width: 20, textAlign: 'center', flexShrink: 0 }}>{m.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold" style={{ fontSize: '11px' }}>{m.label}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1f1f1f' }}>
                  <div className="h-full rounded-full"
                       style={{ width: `${m.value}%`, background: m.color }} />
                </div>
                <p style={{ fontSize: '10px', color: '#585858', flexShrink: 0, minWidth: 30, textAlign: 'right' }}>
                  {m.value}%
                </p>
              </div>
            </div>
            <p className="shrink-0 font-bold" style={{ fontSize: '10px', color: m.color, minWidth: 70, textAlign: 'right' }}>
              {m.raw}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
