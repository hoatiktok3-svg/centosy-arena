import { getCurrentUser, getTopUsers } from '../data/mockUsers'
import { mockCampaigns, mockChallenges, mockHonors } from '../data/mockCampaigns'

const me = getCurrentUser()
const top5 = getTopUsers(5)

function rankMedal(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function badgeIcon(b: string) {
  const map: Record<string, string> = {
    MVP: '👑', Streak: '🔥', TopSales: '💰',
    QuizMaster: '🧠', TeamPlayer: '🤝', FastHand: '⚡',
    Rookie: '🌱', IronWill: '💪',
  }
  return map[b] ?? '🏅'
}

export default function HomePage() {
  const campaign     = mockCampaigns[0]
  const doneCount    = mockChallenges.filter(c => c.done).length
  const totalChal    = mockChallenges.length

  return (
    <div className="flex flex-col gap-5 py-5">

      {/* ── GREETING ─────────────────────────────────────── */}
      <div className="flex items-center gap-3.5">
        <div className="relative shrink-0">
          <img
            src={me.avatar} alt={me.name}
            className="w-[50px] h-[50px] rounded-2xl object-cover"
            style={{ border: '2px solid #E94E1B', boxShadow: '0 0 14px rgba(233,78,27,0.38)' }}
          />
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                style={{ border: '2px solid #080808' }} />
        </div>

        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '10px', color: '#585858', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 3 }}>
            Xin chào 👋
          </p>
          <p className="text-white font-black truncate" style={{ fontSize: '18px', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
            {me.name}
          </p>
          <p style={{ fontSize: '11px', color: '#686868', marginTop: 2 }}>
            {me.role} · {me.block}
          </p>
        </div>

        {/* Streak chip */}
        <div className="shrink-0 flex flex-col items-center px-3 py-2 rounded-xl gap-0.5"
             style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.2)' }}>
          <span style={{ fontSize: '16px', lineHeight: 1 }}>🔥</span>
          <span className="font-black" style={{ fontSize: '14px', color: '#fff', lineHeight: 1 }}>2</span>
          <span style={{ fontSize: '8.5px', color: '#E94E1B', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>streak</span>
        </div>
      </div>

      {/* ── ARENA SCORE CARD (HERO) ──────────────────────── */}
      <div className="rounded-3xl overflow-hidden"
           style={{
             background: 'linear-gradient(150deg, #1b0a02 0%, #131313 55%, #0d0d0d 100%)',
             border: '1px solid rgba(233,78,27,0.28)',
             boxShadow: '0 0 44px rgba(233,78,27,0.13), 0 8px 32px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05)',
           }}>

        {/* Top strip: label + badges */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <p style={{ fontSize: '9px', color: '#5a5a5a', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700 }}>
            ⚡ ARENA SCORE
          </p>
          <div className="flex items-center gap-1">
            {me.badges.slice(0, 4).map(b => (
              <span key={b} style={{ fontSize: '13px' }}>{badgeIcon(b)}</span>
            ))}
          </div>
        </div>

        {/* Score + Rank row */}
        <div className="flex items-end justify-between px-5 pt-2 pb-4 gap-4">
          <div className="flex-1">
            <p className="font-black text-white leading-none"
               style={{ fontSize: '56px', letterSpacing: '-2.5px' }}>
              {me.score.toLocaleString('vi-VN')}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 font-bold"
                    style={{ fontSize: '11px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '3px 9px', borderRadius: 99 }}>
                ▲ +120 hôm nay
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <div className="w-[68px] h-[68px] rounded-2xl flex flex-col items-center justify-center gap-0.5"
                 style={{
                   background: 'rgba(233,78,27,0.11)',
                   border: '1.5px solid rgba(233,78,27,0.42)',
                   boxShadow: '0 0 22px rgba(233,78,27,0.22)',
                 }}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>🏅</span>
              <span className="font-black" style={{ fontSize: '20px', color: '#E94E1B', lineHeight: 1.1 }}>
                #{me.weeklyRank}
              </span>
            </div>
            <p style={{ fontSize: '9px', color: '#525252', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hạng tuần</p>
          </div>
        </div>

        {/* Footer: context */}
        <div className="px-5 pb-3.5 flex items-center gap-3"
             style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
          <p style={{ fontSize: '10px', color: '#484848', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 10 }}>
            TOP {me.weeklyRank} / 30 nhân sự
          </p>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>

      {/* ── CAMPAIGN ─────────────────────────────────────── */}
      <div>
        <p className="section-title mb-3">🎯 Chiến dịch đang chạy</p>
        <div className="rounded-2xl overflow-hidden"
             style={{
               background: 'linear-gradient(150deg, #180800 0%, #161616 65%)',
               border: '1px solid rgba(233,78,27,0.22)',
             }}>
          <div className="p-4 pb-3.5">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="badge-brand">{campaign.tag}</span>
                  <span style={{ fontSize: '10px', color: '#585858' }}>hết {campaign.endDate}</span>
                </div>
                <p className="text-white font-black leading-snug" style={{ fontSize: '16px', letterSpacing: '-0.2px' }}>
                  {campaign.title}
                </p>
                <p style={{ fontSize: '12px', color: '#787878', marginTop: 5, lineHeight: 1.55 }}>
                  {campaign.description}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end pt-0.5">
                <p className="font-black leading-none" style={{ fontSize: '30px', color: '#E94E1B', letterSpacing: '-0.5px' }}>
                  +{campaign.reward}
                </p>
                <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>điểm</p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '11px', color: '#686868' }}>Tiến độ</span>
                <span className="font-black" style={{ fontSize: '13px', color: '#E94E1B' }}>{campaign.progress}%</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 7, background: '#1a1a1a' }}>
                <div className="h-full rounded-full transition-all"
                     style={{
                       width: `${campaign.progress}%`,
                       background: 'linear-gradient(90deg, #E94E1B, #FF6B35)',
                       boxShadow: '0 0 10px rgba(233,78,27,0.55)',
                     }} />
              </div>
            </div>
          </div>

          <button
            className="w-full py-3.5 font-black text-white transition-all active:opacity-80"
            style={{
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #E94E1B, #FF5A28)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
            Tham gia ngay →
          </button>
        </div>
      </div>

      {/* ── CHALLENGES ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">🔥 Thử thách hôm nay</p>
          <span style={{ fontSize: '11px', color: '#585858', fontWeight: 600 }}>
            {doneCount}/{totalChal} xong
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {mockChallenges.map(ch => (
            <div key={ch.id}
                 className="flex items-center gap-3.5 rounded-2xl px-4 py-3.5 transition-all"
                 style={{
                   background: ch.done ? 'rgba(74,222,128,0.04)' : '#181818',
                   border: `1px solid ${ch.done ? 'rgba(74,222,128,0.15)' : '#2c2c2c'}`,
                 }}>

              {/* Icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{
                     background: ch.done ? 'rgba(74,222,128,0.1)' : 'rgba(233,78,27,0.1)',
                     border: `1px solid ${ch.done ? 'rgba(74,222,128,0.2)' : 'rgba(233,78,27,0.2)'}`,
                     fontSize: '20px',
                     opacity: ch.done ? 0.7 : 1,
                   }}>
                {ch.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: ch.done ? '#525252' : '#f0f0f0',
                  textDecoration: ch.done ? 'line-through' : 'none',
                  lineHeight: 1.3,
                }}>
                  {ch.title}
                </p>
                <p style={{ fontSize: '11px', color: '#585858', marginTop: 3, lineHeight: 1.4 }}>
                  {ch.description}
                </p>
              </div>

              {/* Status/reward */}
              {ch.done
                ? <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                       style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.28)' }}>
                    <span style={{ fontSize: '14px', color: '#4ade80' }}>✓</span>
                  </div>
                : <div className="shrink-0 flex flex-col items-end">
                    <span className="font-black" style={{ fontSize: '15px', color: '#E94E1B', lineHeight: 1 }}>+{ch.reward}</span>
                    <span style={{ fontSize: '9px', color: '#585858', letterSpacing: '0.06em', marginTop: 1 }}>điểm</span>
                  </div>
              }
            </div>
          ))}
        </div>
      </div>

      {/* ── MINI LEADERBOARD ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">📊 Top 5 tuần này</p>
          <button style={{ fontSize: '12px', color: '#E94E1B', fontWeight: 700 }}>Xem tất cả →</button>
        </div>

        <div className="rounded-2xl overflow-hidden"
             style={{ background: '#181818', border: '1px solid #2c2c2c', boxShadow: '0 2px 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03)' }}>
          {top5.map((user, i) => (
            <div key={user.id}
                 className="flex items-center gap-3 px-4 py-3"
                 style={{
                   borderBottom: i < top5.length - 1 ? '1px solid #222' : 'none',
                   background: user.id === me.id ? 'rgba(233,78,27,0.06)' : 'transparent',
                 }}>

              <div className="w-7 text-center shrink-0">
                {i < 3
                  ? <span style={{ fontSize: '16px' }}>{rankMedal(i + 1)}</span>
                  : <span style={{ fontSize: '12px', fontWeight: 900, color: '#444' }}>#{i + 1}</span>
                }
              </div>

              <img src={user.avatar} alt={user.name}
                   className="w-9 h-9 rounded-xl object-cover shrink-0"
                   style={{
                     border: user.id === me.id ? '2px solid #E94E1B' : '1px solid #2c2c2c',
                     background: '#1a1a1a',
                     boxShadow: user.id === me.id ? '0 0 10px rgba(233,78,27,0.3)' : 'none',
                   }} />

              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ fontSize: '13px', fontWeight: 700, color: user.id === me.id ? '#E94E1B' : '#f0f0f0' }}>
                  {user.name}
                  {user.id === me.id && (
                    <span style={{ fontSize: '10px', fontWeight: 400, color: '#E94E1B', opacity: 0.6, marginLeft: 5 }}>← bạn</span>
                  )}
                </p>
                <p style={{ fontSize: '11px', color: '#585858', marginTop: 1 }}>{user.block}</p>
              </div>

              <p className="font-black shrink-0" style={{ fontSize: '13px', color: user.id === me.id ? '#E94E1B' : '#e8e8e8' }}>
                {user.score.toLocaleString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── HONOR ────────────────────────────────────────── */}
      <div>
        <p className="section-title mb-3">⭐ Vinh danh mới nhất</p>
        <div className="flex flex-col gap-2.5">
          {mockHonors.map(h => (
            <div key={h.id}
                 className="flex items-center gap-4 rounded-2xl px-4 py-3.5"
                 style={{
                   background: 'linear-gradient(135deg, #131000, #181818)',
                   border: '1px solid rgba(234,179,8,0.13)',
                 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.22)', fontSize: '20px' }}>
                {h.badge}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate" style={{ fontSize: '13px' }}>{h.userName}</p>
                <p style={{ fontSize: '11px', color: '#787878', lineHeight: 1.45, marginTop: 2 }}>{h.reason}</p>
                <p style={{ fontSize: '10px', color: '#484848', marginTop: 3 }}>{h.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-1" />
    </div>
  )
}
