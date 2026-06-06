import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onGoToGames: () => void
  onGoToHonor: () => void
}

// ── Types ─────────────────────────────────────────────────────
interface MyStats {
  totalScore: number
  plays:      number
  bestScore:  number
}

// ── Helpers ───────────────────────────────────────────────────
const DEPT_LABEL: Record<string, string> = {
  'van-phong': 'Văn phòng',
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'tmdt':      'TMĐT',
  'kdtt':      'KDTT',
}

// ── Component ─────────────────────────────────────────────────
export default function HomePage({ onGoToGames, onGoToHonor }: Props) {
  const { currentUser } = useAuth()

  const [myStats,      setMyStats]      = useState<MyStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch điểm tích lũy thật của user từ game_results
  useEffect(() => {
    if (!currentUser?.id) { setStatsLoading(false); return }

    async function fetchMyStats() {
      const { data, error } = await supabase
        .from('game_results')
        .select('score')
        .eq('user_id', currentUser!.id)

      if (!error && data && data.length > 0) {
        const plays      = data.length
        const totalScore = data.reduce((s, r) => s + (r.score ?? 0), 0)
        const bestScore  = Math.max(...data.map(r => r.score ?? 0))
        setMyStats({ totalScore, plays, bestScore })
      } else {
        setMyStats(null)
      }
      setStatsLoading(false)
    }

    fetchMyStats()
  }, [currentUser?.id])

  // ── Derived values ────────────────────────────────────────
  const firstName = currentUser?.name?.split(' ').slice(-1)[0] ?? 'bạn'
  const initials  = currentUser?.avatarInitials ?? '?'
  const dept      = DEPT_LABEL[currentUser?.department ?? ''] ?? currentUser?.department ?? ''
  const isAdmin   = currentUser?.role === 'admin'
  const title     = currentUser?.title ?? ''

  // Điểm hiển thị — ưu tiên tổng từ game_results, fallback profile score
  const displayScore  = myStats ? myStats.totalScore : (currentUser?.score ?? 0)
  const hasPlayed     = myStats !== null && myStats.plays > 0

  return (
    <div className="flex flex-col gap-5 py-5">

      {/* ── 1. HERO GREETING ─────────────────────────────── */}
      <div className="flex items-center gap-3.5">

        {/* Avatar initials */}
        <div className="shrink-0 w-[52px] h-[52px] rounded-2xl flex items-center justify-center font-black"
             style={{
               background: 'rgba(233,78,27,0.12)',
               border: '2px solid rgba(233,78,27,0.5)',
               boxShadow: '0 0 18px rgba(233,78,27,0.28)',
               fontSize: '18px',
               color: '#E94E1B',
               letterSpacing: '-0.5px',
             }}>
          {initials}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: '10px', color: '#585858', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 3, fontWeight: 700 }}>
            Chào mừng trở lại
          </p>
          <p className="text-white font-black truncate" style={{ fontSize: '18px', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
            {firstName}
          </p>
          <p style={{ fontSize: '11px', color: '#686868', marginTop: 2 }}>
            Sẵn sàng ghi điểm hôm nay?
          </p>
        </div>

        {/* Role badge */}
        <div className="shrink-0 flex flex-col items-center px-3 py-2 rounded-xl gap-0.5"
             style={{
               background: isAdmin ? 'rgba(250,204,21,0.08)' : 'rgba(233,78,27,0.08)',
               border: `1px solid ${isAdmin ? 'rgba(250,204,21,0.25)' : 'rgba(233,78,27,0.2)'}`,
             }}>
          <span style={{ fontSize: '15px', lineHeight: 1 }}>{isAdmin ? '🛡️' : '⚔️'}</span>
          <span className="font-black" style={{ fontSize: '9px', color: isAdmin ? '#facc15' : '#E94E1B', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 3 }}>
            {isAdmin ? 'Admin' : 'Chiến binh'}
          </span>
        </div>
      </div>

      {/* ── 2. ARENA SCORE CARD ──────────────────────────── */}
      <div className="rounded-3xl overflow-hidden"
           style={{
             background: 'linear-gradient(150deg, #1b0a02 0%, #131313 55%, #0d0d0d 100%)',
             border: '1px solid rgba(233,78,27,0.28)',
             boxShadow: '0 0 44px rgba(233,78,27,0.1), 0 8px 32px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.05)',
           }}>

        {/* Label + dept */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <p style={{ fontSize: '9px', color: '#5a5a5a', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700 }}>
            ⚡ ARENA SCORE
          </p>
          {dept && (
            <span style={{ fontSize: '10px', color: '#585858', fontWeight: 600 }}>
              {dept}
            </span>
          )}
        </div>

        {/* Score + title */}
        <div className="flex items-end justify-between px-5 pt-2 pb-4 gap-4">
          <div className="flex-1">
            {hasPlayed ? (
              <>
                <p className="font-black text-white leading-none"
                   style={{ fontSize: '56px', letterSpacing: '-2.5px' }}>
                  {displayScore.toLocaleString('vi-VN')}
                </p>
                {title && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 font-bold"
                          style={{ fontSize: '11px', color: '#E94E1B', background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.22)', padding: '3px 9px', borderRadius: 99 }}>
                      {title}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="py-2">
                {statsLoading ? (
                  <p style={{ fontSize: '15px', color: '#484848' }}>Đang tải...</p>
                ) : (
                  <>
                    <p className="font-black" style={{ fontSize: '22px', color: '#383838', letterSpacing: '-0.5px' }}>
                      0 điểm
                    </p>
                    <p style={{ fontSize: '12px', color: '#484848', marginTop: 6, lineHeight: 1.5 }}>
                      Chưa có điểm thi đấu.{'\n'}Chơi game để bắt đầu!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Rank box */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <div className="w-[68px] h-[68px] rounded-2xl flex flex-col items-center justify-center gap-0.5"
                 style={{
                   background: 'rgba(233,78,27,0.11)',
                   border: '1.5px solid rgba(233,78,27,0.35)',
                   boxShadow: '0 0 22px rgba(233,78,27,0.18)',
                 }}>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>🏟️</span>
              <span className="font-black" style={{ fontSize: '11px', color: '#E94E1B', lineHeight: 1.2, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
                ARENA
              </span>
            </div>
            <p style={{ fontSize: '9px', color: '#525252', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Centosy</p>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-5 pb-3.5 flex items-center justify-center gap-3"
             style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10 }}>
          <p style={{ fontSize: '10px', color: '#3a3a3a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Thi đấu · Ghi điểm · Vinh danh
          </p>
        </div>
      </div>

      {/* ── 3. TODAY CHALLENGE CARD ──────────────────────── */}
      <div>
        <p className="section-title mb-3">Thử thách hôm nay</p>

        <div className="rounded-2xl overflow-hidden"
             style={{
               background: 'linear-gradient(150deg, #180800 0%, #161616 65%)',
               border: '1px solid rgba(233,78,27,0.25)',
             }}>
          <div className="p-4 pb-3">

            {/* Game name + tags */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(233,78,27,0.12)', border: '1px solid rgba(233,78,27,0.28)', fontSize: '22px' }}>
                🎭
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black leading-snug" style={{ fontSize: '15px', letterSpacing: '-0.2px', marginBottom: 6 }}>
                  Khách hàng khó tính
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {['5 câu', '20 giây', '+5đ tốc độ'].map(tag => (
                    <span key={tag}
                          style={{ fontSize: '10px', fontWeight: 700, color: '#E94E1B', background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.2)', padding: '2px 8px', borderRadius: 99 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end pt-0.5">
                <p className="font-black leading-none" style={{ fontSize: '28px', color: '#E94E1B', letterSpacing: '-0.5px' }}>+125</p>
                <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>điểm tối đa</p>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: '12px', color: '#787878', lineHeight: 1.6, marginBottom: 14 }}>
              Xử lý tình huống khách hàng khó tính — chọn đáp án đúng trước khi hết giờ.
            </p>
          </div>

          {/* CTA button */}
          <button
            onClick={onGoToGames}
            className="w-full py-3.5 font-black text-white transition-all active:opacity-80 active:scale-[0.99]"
            style={{
              fontSize: '14px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background: 'linear-gradient(90deg, #E94E1B, #FF5A28)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
            Chơi ngay →
          </button>
        </div>
      </div>

      {/* ── 4. QUICK STATS ───────────────────────────────── */}
      <div>
        <p className="section-title mb-3">Thống kê của tôi</p>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              icon: '🎮',
              value: statsLoading ? '…' : (myStats ? myStats.plays.toString() : '0'),
              label: 'Lượt chơi',
              color: '#60a5fa',
            },
            {
              icon: '⭐',
              value: statsLoading ? '…' : (myStats ? myStats.bestScore.toString() : '—'),
              label: 'Điểm cao nhất',
              color: '#facc15',
            },
            {
              icon: '📊',
              value: statsLoading ? '…' : (myStats ? myStats.totalScore.toLocaleString('vi-VN') : '—'),
              label: 'Tổng điểm',
              color: '#E94E1B',
            },
          ].map(s => (
            <div key={s.label}
                 className="flex flex-col items-center rounded-2xl py-4 px-2"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <span style={{ fontSize: '20px', marginBottom: 6 }}>{s.icon}</span>
              <p className="font-black" style={{ fontSize: '18px', color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '9.5px', color: '#555', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center', lineHeight: 1.4 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 5. HONOR TEASER ──────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="section-title">Bảng vinh danh</p>
          <button
            onClick={onGoToHonor}
            style={{ fontSize: '12px', color: '#E94E1B', fontWeight: 700 }}>
            Xem tất cả →
          </button>
        </div>

        <div className="rounded-2xl px-4 py-4 flex items-center gap-4"
             style={{
               background: 'linear-gradient(135deg, #131000 0%, #181818 100%)',
               border: '1px solid rgba(234,179,8,0.15)',
             }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
               style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.22)', fontSize: '24px' }}>
            👑
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white" style={{ fontSize: '14px', marginBottom: 4, letterSpacing: '-0.2px' }}>
              Ai sẽ lên bảng vinh danh?
            </p>
            <p style={{ fontSize: '12px', color: '#686868', lineHeight: 1.5 }}>
              Ghi điểm cao · Cống hiến xuất sắc · Được ban quản lý vinh danh
            </p>
          </div>
        </div>
      </div>

      <div className="h-1" />
    </div>
  )
}
