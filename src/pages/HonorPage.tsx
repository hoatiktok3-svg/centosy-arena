import { useState } from 'react'
import { mockHonors, honorFilters, HonorFilter, Honor } from '../data/mockHonors'

/* ── Color resolve ───────────────────────────────────────── */
function resolveColor(badgeColor: string): string {
  if (badgeColor === 'text-brand')        return '#E94E1B'
  if (badgeColor === 'text-yellow-400')   return '#facc15'
  if (badgeColor === 'text-blue-400')     return '#60a5fa'
  if (badgeColor === 'text-green-400')    return '#4ade80'
  if (badgeColor === 'text-red-400')      return '#f87171'
  if (badgeColor === 'text-purple-400')   return '#c084fc'
  return '#585858'
}

/* ── Featured card ───────────────────────────────────────── */
function FeaturedCard({ honor }: { honor: Honor }) {
  const color = resolveColor(honor.badgeColor)

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{
           background: `linear-gradient(145deg, rgba(${color === '#facc15' ? '80,60,0' : color === '#E94E1B' ? '80,25,0' : '30,30,30'},0.45) 0%, #131313 65%)`,
           border: `1px solid ${color}28`,
           boxShadow: `0 0 30px ${color}0d, 0 4px 24px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)`,
         }}>

      {/* Top strip */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between"
           style={{ borderBottom: `1px solid ${color}15` }}>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `${color}18`, border: `1px solid ${color}35`, fontSize: '20px' }}>
            {honor.badge}
          </div>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
              {honor.title}
            </p>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '10px', color: '#585858', background: '#1e1e1e', border: '1px solid #2c2c2c', padding: '1px 7px', borderRadius: 99 }}>
                {honor.block}
              </span>
              <span style={{ fontSize: '10px', color: '#484848' }}>{honor.date}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p style={{ fontSize: '9px', color: '#484848', letterSpacing: '0.1em', marginBottom: 2, textTransform: 'uppercase' }}>Thưởng</p>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>+{honor.pointBonus}</p>
          <p style={{ fontSize: '9px', color: '#484848' }}>điểm</p>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-4 flex items-start gap-4">
        <img
          src={honor.avatar} alt={honor.userName}
          style={{
            width: 56, height: 56, borderRadius: '16px',
            border: `2px solid ${color}55`,
            boxShadow: `0 0 16px ${color}25`,
            objectFit: 'cover', background: '#141414', flexShrink: 0,
          }}
        />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '18px', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.3px' }}>
            {honor.userName}
          </p>
          <p style={{ fontSize: '12px', color: '#909090', lineHeight: 1.65 }}>
            {honor.reason}
          </p>
        </div>
      </div>

      {/* Bottom tag */}
      <div className="px-4 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
             style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
          <span style={{ fontSize: '10px', color, fontWeight: 700, letterSpacing: '0.06em' }}>
            ✦ Nổi bật tuần này
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Honor card (regular) ────────────────────────────────── */
function HonorCard({ honor }: { honor: Honor }) {
  const [expanded, setExpanded] = useState(false)
  const color = resolveColor(honor.badgeColor)

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
         style={{
           background: '#181818',
           border: '1px solid #2c2c2c',
           boxShadow: '0 2px 10px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.03)',
         }}>

      {/* Top color bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}60, transparent)` }} />

      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          {/* Badge */}
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: `${color}14`, border: `1px solid ${color}30`, fontSize: '20px' }}>
            {honor.badge}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: '9px', fontWeight: 700, color, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 3 }}>
                  {honor.title}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', lineHeight: 1.25, marginBottom: 4 }}
                   className="truncate">
                  {honor.userName}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span style={{ fontSize: '10px', color: '#585858', background: '#1a1a1a', border: '1px solid #2c2c2c', padding: '1px 7px', borderRadius: 99 }}>
                    {honor.block}
                  </span>
                  <span style={{ fontSize: '10px', color: '#484848' }}>{honor.date}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p style={{ fontSize: '14px', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>+{honor.pointBonus}</p>
                <p style={{ fontSize: '9px', color: '#484848', marginTop: 1 }}>điểm</p>
              </div>
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(v => !v)}
              style={{ fontSize: '11px', color: '#585858', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span style={{ fontSize: '9px' }}>{expanded ? '▲' : '▼'}</span>
              {expanded ? 'Thu gọn' : 'Xem lý do'}
            </button>

            {expanded && (
              <p style={{
                fontSize: '12px', color: '#909090', lineHeight: 1.65,
                marginTop: 8, paddingTop: 8,
                borderTop: '1px solid #242424',
              }}>
                {honor.reason}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function HonorPage() {
  const [filter, setFilter]   = useState<HonorFilter>('Tất cả')
  const [showAll, setShowAll] = useState(false)

  const featured = mockHonors.find(h => h.featured)

  const filtered = filter === 'Tất cả'
    ? mockHonors.filter(h => !h.featured)
    : mockHonors.filter(h => !h.featured && h.block === filter)

  const visible = showAll ? filtered : filtered.slice(0, 4)

  return (
    <div className="flex flex-col gap-5 py-4">

      {/* Header */}
      <div>
        <p className="section-title-brand">⭐ Tường Vinh Danh</p>
        <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
          Centosy Arena · Ghi nhận những đóng góp xuất sắc
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Tổng vinh danh', value: mockHonors.length, icon: '🏆' },
          { label: 'Tháng này',       value: 5,                 icon: '📅' },
          { label: 'Điểm đã trao',    value: '2.8K',            icon: '💎' },
        ].map(s => (
          <div key={s.label} className="stat-box">
            <p style={{ fontSize: '20px', marginBottom: 4 }}>{s.icon}</p>
            <p className="stat-value" style={{ fontSize: '18px' }}>{s.value}</p>
            <p className="stat-label">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Featured */}
      {featured && (
        <div>
          <p className="section-title mb-3">🔥 Nổi bật hôm nay</p>
          <FeaturedCard honor={featured} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {honorFilters.map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setShowAll(false) }}
            className={filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        <p className="section-title mb-3">🎖️ Vinh danh gần đây</p>
        <div className="flex flex-col gap-2.5">
          {visible.map(h => <HonorCard key={h.id} honor={h} />)}
        </div>

        {!showAll && filtered.length > 4 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-3 py-3 rounded-2xl font-semibold transition-all active:scale-[0.98]"
            style={{ fontSize: '13px', color: '#E94E1B', background: 'transparent', border: '1px solid rgba(233,78,27,0.3)' }}>
            Xem tất cả ({filtered.length}) →
          </button>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl text-center py-10"
               style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '32px', marginBottom: 10 }}>🏅</p>
            <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có vinh danh trong nhóm này.</p>
          </div>
        )}
      </div>

      <div className="h-2" />
    </div>
  )
}
