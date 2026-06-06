import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

// ── Types ─────────────────────────────────────────────────────
interface LeaderboardEntry {
  userId:       string
  name:         string
  department:   string
  initials:     string
  totalScore:   number
  plays:        number
  bestScore:    number
  lastPlayedAt: string | null
}

// ── Helpers ───────────────────────────────────────────────────
const DEPT_LABEL: Record<string, string> = {
  'van-phong': 'Văn phòng',
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'tmdt':      'TMĐT',
  'kdtt':      'KDTT',
}

const FILTER_TO_DEPT: Record<string, string> = {
  'Văn phòng': 'van-phong',
  'Cửa hàng':  'cua-hang',
  'Kho':       'kho',
  'TMĐT':      'tmdt',
  'KDTT':      'kdtt',
}

const FILTERS = ['Toàn công ty', 'Văn phòng', 'Cửa hàng', 'Kho', 'TMĐT', 'KDTT']

const RANK_CONFIG = {
  1: { ring: '#facc15', glow: 'rgba(250,204,21,0.35)', ped: 64, pedBg: 'rgba(250,204,21,0.12)', pedBorder: 'rgba(250,204,21,0.35)', medal: '🥇', scoreColor: '#facc15', size: 76, radius: '20px' },
  2: { ring: '#94a3b8', glow: 'rgba(148,163,184,0.2)',  ped: 44, pedBg: 'rgba(148,163,184,0.08)', pedBorder: 'rgba(148,163,184,0.25)', medal: '🥈', scoreColor: '#94a3b8', size: 58, radius: '16px' },
  3: { ring: '#d97706', glow: 'rgba(217,119,6,0.2)',    ped: 30, pedBg: 'rgba(217,119,6,0.08)',  pedBorder: 'rgba(217,119,6,0.25)',  medal: '🥉', scoreColor: '#b45309', size: 58, radius: '16px' },
} as const

// ── Avatar initials circle ────────────────────────────────────
function Avatar({ initials, size, ring, glow, radius }: {
  initials: string; size: number; ring: string; glow: string; radius: string
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      border: `2.5px solid ${ring}`,
      boxShadow: `0 0 18px ${glow}`,
      background: '#1a1a1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: Math.round(size * 0.32), color: ring,
      letterSpacing: '-0.5px', flexShrink: 0,
    }}>
      {initials || '?'}
    </div>
  )
}

// ── Podium slot ───────────────────────────────────────────────
function PodiumSlot({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const cfg = RANK_CONFIG[rank]
  return (
    <div className="flex flex-col items-center" style={{ width: rank === 1 ? 100 : 80 }}>
      <div style={{ height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 4 }}>
        {rank === 1 && <span style={{ fontSize: '22px' }}>👑</span>}
      </div>

      <div className="relative" style={{ marginBottom: 6 }}>
        <Avatar initials={entry.initials} size={cfg.size} ring={cfg.ring} glow={cfg.glow} radius={cfg.radius} />
        <div style={{
          position: 'absolute', bottom: -6, right: -6,
          width: rank === 1 ? 24 : 20, height: rank === 1 ? 24 : 20,
          borderRadius: '50%',
          background: cfg.ring, border: '2px solid #080808',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: rank === 1 ? 11 : 9, color: '#0a0a0a',
        }}>
          {rank}
        </div>
      </div>

      <p style={{
        fontSize: rank === 1 ? 13 : 11, fontWeight: 700,
        color: rank === 1 ? '#fff' : '#909090',
        textAlign: 'center', width: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        padding: '0 4px', marginBottom: 3,
      }}>
        {entry.name.split(' ').slice(-1)[0]}
      </p>

      <p style={{ fontSize: rank === 1 ? 14 : 12, fontWeight: 900, color: cfg.scoreColor, letterSpacing: '-0.3px', marginBottom: 8 }}>
        {entry.totalScore.toLocaleString('vi-VN')}
      </p>

      <div style={{
        width: '100%', height: cfg.ped,
        borderRadius: '10px 10px 0 0',
        background: cfg.pedBg, border: `1px solid ${cfg.pedBorder}`, borderBottom: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: rank === 1 ? 22 : 18,
      }}>
        {cfg.medal}
      </div>
    </div>
  )
}

// ── Rank row (rank 4+) ────────────────────────────────────────
function RankRow({ entry, rank, isMe }: { entry: LeaderboardEntry; rank: number; isMe: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3"
         style={{ borderBottom: '1px solid #1e1e1e', background: isMe ? 'rgba(233,78,27,0.05)' : 'transparent' }}>

      <div className="shrink-0 w-8 text-center">
        <span style={{ fontSize: '12px', fontWeight: 900, color: isMe ? '#E94E1B' : '#484848', fontVariantNumeric: 'tabular-nums' }}>
          {rank <= 9 ? `0${rank}` : rank}
        </span>
      </div>

      <Avatar
        initials={entry.initials}
        size={40} radius="12px"
        ring={isMe ? '#E94E1B' : '#2c2c2c'}
        glow={isMe ? 'rgba(233,78,27,0.28)' : 'transparent'}
      />

      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '13px', fontWeight: 700, color: isMe ? '#E94E1B' : '#f0f0f0', lineHeight: 1.3 }}
           className="truncate">
          {entry.name}
          {isMe && <span style={{ fontSize: '10px', fontWeight: 400, color: '#E94E1B', opacity: 0.6, marginLeft: 5 }}>← bạn</span>}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span style={{ fontSize: '10px', color: '#585858' }}>
            {DEPT_LABEL[entry.department] ?? entry.department}
          </span>
          <span style={{ fontSize: '10px', color: '#3d3d3d' }}>
            {entry.plays} lượt
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p style={{ fontSize: '13px', fontWeight: 900, color: isMe ? '#E94E1B' : '#e8e8e8', fontVariantNumeric: 'tabular-nums' }}>
          {entry.totalScore.toLocaleString('vi-VN')}
        </p>
        <p style={{ fontSize: '10px', color: '#3d3d3d', marginTop: 1 }}>
          cao: {entry.bestScore}
        </p>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function RankPage() {
  const { currentUser } = useAuth()
  const [filter, setFilter]           = useState('Toàn công ty')
  const [allEntries, setAllEntries]   = useState<LeaderboardEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState<string | null>(null)

  // ── Fetch từ SECURITY DEFINER function — bypass RLS an toàn ──
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      setFetchError(null)

      // Gọi get_leaderboard() — function SECURITY DEFINER, staff thấy được toàn công ty
      const { data, error } = await supabase
        .rpc('get_leaderboard', { p_department: null, p_limit: 20 })

      if (error) {
        console.error('[RankPage] Lỗi fetch leaderboard:', error.message)
        // Nếu function chưa tạo trên Supabase, fallback nhẹ không crash app
        setFetchError('Chưa tải được bảng xếp hạng. Vui lòng kiểm tra quyền dữ liệu.')
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setAllEntries([])
        setLoading(false)
        return
      }

      // Map từ RPC response sang LeaderboardEntry
      const entries: LeaderboardEntry[] = (data as {
        user_id: string; full_name: string; department: string
        avatar_initials: string; total_score: number
        plays: number; best_score: number; last_played_at: string | null
      }[]).map(r => ({
        userId:       r.user_id,
        name:         r.full_name         ?? 'Nhân sự',
        department:   r.department        ?? '',
        initials:     r.avatar_initials   ?? '?',
        totalScore:   Number(r.total_score),
        plays:        Number(r.plays),
        bestScore:    Number(r.best_score),
        lastPlayedAt: r.last_played_at,
      }))

      setAllEntries(entries)
      setLoading(false)
    }

    fetchLeaderboard()
  }, [])

  // ── Filter theo phòng ban ──────────────────────────────────
  const filtered = filter === 'Toàn công ty'
    ? allEntries
    : allEntries.filter(e => e.department === FILTER_TO_DEPT[filter])

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5 py-4">

      {/* Header */}
      <div>
        <p className="section-title-brand">Leaderboard</p>
        <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
          {loading ? 'Đang tải...' : `${filtered.length} thành viên · Xếp theo điểm tích lũy`}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'filter-pill-active' : 'filter-pill-inactive'}>
            {f}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-2xl py-12 flex flex-col items-center gap-3"
             style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #E94E1B', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ fontSize: '13px', color: '#555' }}>Đang tải bảng xếp hạng...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && fetchError && (
        <div className="rounded-2xl py-10 text-center px-6"
             style={{ background: '#0E0E0E', border: '1px solid #2a1a1a' }}>
          <p style={{ fontSize: '28px', marginBottom: 10 }}>⚠️</p>
          <p style={{ fontSize: '13px', color: '#ef4444', lineHeight: 1.6 }}>{fetchError}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div className="rounded-2xl py-12 text-center px-6"
             style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '40px', marginBottom: 12 }}>🏟️</p>
          <p style={{ fontSize: '14px', color: '#e0e0e0', fontWeight: 700, marginBottom: 8 }}>
            Bảng xếp hạng đang trống
          </p>
          <p style={{ fontSize: '12px', color: '#585858', lineHeight: 1.7 }}>
            Chưa có điểm thi đấu.{'\n'}Hãy chơi game đầu tiên để mở bảng xếp hạng.
          </p>
        </div>
      )}

      {/* Podium card */}
      {!loading && !fetchError && top3.length > 0 && (
        <div className="overflow-hidden rounded-2xl"
             style={{
               background: 'linear-gradient(160deg, #120c00 0%, #131313 50%, #0d0d0d 100%)',
               border: '1px solid rgba(250,204,21,0.15)',
               boxShadow: '0 0 32px rgba(250,204,21,0.06), 0 4px 24px rgba(0,0,0,0.6)',
             }}>

          <p style={{ textAlign: 'center', fontSize: '9px', color: '#484848', letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, paddingTop: 16, paddingBottom: 4 }}>
            ĐẤUTRƯỜNG · {filter.toUpperCase()}
          </p>

          <div className="flex items-end justify-center gap-1 px-4 pt-2">
            {top3[1] && <PodiumSlot entry={top3[1]} rank={2} />}
            {top3[0] && <PodiumSlot entry={top3[0]} rank={1} />}
            {top3[2] && <PodiumSlot entry={top3[2]} rank={3} />}
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.12), transparent)', margin: '0 16px' }} />

          <p style={{ textAlign: 'center', fontSize: '9px', color: '#383838', letterSpacing: '0.14em', padding: '8px 0 12px' }}>
            CENTOSY ARENA · TÍCH LŨY
          </p>
        </div>
      )}

      {/* Rank list (4+) */}
      {!loading && !fetchError && rest.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
             style={{ background: '#181818', border: '1px solid #2c2c2c', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
          {rest.map((entry, i) => (
            <RankRow
              key={entry.userId}
              entry={entry}
              rank={i + 4}
              isMe={entry.userId === currentUser?.id}
            />
          ))}
        </div>
      )}

      <div className="h-2" />
    </div>
  )
}
