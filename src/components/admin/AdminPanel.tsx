import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface AdminPanelProps {
  onClose: () => void
}

interface ProfileRow {
  id:         string
  full_name:  string
  email:      string
  department: string
  role:       'admin' | 'staff'
  score:      number
  is_active:  boolean
  title:      string | null
}

// Per-user game aggregate fetched from game_results
interface GameStat {
  totalScore: number
  plays:      number
}

const DEPT_LABEL: Record<string, string> = {
  'van-phong': 'Văn phòng',
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'tmdt':      'TMĐT',
  'kdtt':      'KDTT',
}
const DEPT_KEYS = Object.keys(DEPT_LABEL)

const POINT_RULES = [
  { action: 'Hoàn thành game',      points: '+25 – 125 đ' },
  { action: 'Trả lời dưới 10 giây', points: '+5 đ'        },
  { action: 'Đăng nhập mỗi ngày',   points: '+10 đ'       },
  { action: 'Được vinh danh',        points: '+50 đ'       },
  { action: 'Tham gia chiến dịch',   points: '+30 đ'       },
]

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { currentUser } = useAuth()
  const isAdmin = currentUser?.role === 'admin'

  const [profiles,       setProfiles]       = useState<ProfileRow[]>([])
  const [gameStats,      setGameStats]      = useState<Record<string, GameStat>>({})
  const [loadError,      setLoadError]      = useState<string | null>(null)
  const [gameStatsNote,  setGameStatsNote]  = useState<string | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [filterDept,     setFilterDept]     = useState<string>('all')

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return }

    async function fetchAll() {
      setLoading(true)
      setLoadError(null)
      setGameStatsNote(null)

      // ── 1. Profiles ──────────────────────────────────────
      const { data: pData, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, email, department, role, score, is_active, title')
        .order('full_name', { ascending: true })

      if (pErr) {
        setLoadError('Không tải được danh sách nhân sự. Kiểm tra quyền RLS hoặc role admin.')
        setLoading(false)
        return
      }
      setProfiles((pData ?? []) as ProfileRow[])

      // ── 2. Game results (admin có policy xem all) ────────
      const { data: gData, error: gErr } = await supabase
        .from('game_results')
        .select('user_id, score')

      if (gErr) {
        console.warn('[AdminPanel] Không tải được game_results:', gErr.message)
        setGameStatsNote('Chưa tải được dữ liệu lượt chơi.')
      } else {
        // Aggregate JS-side
        const agg: Record<string, GameStat> = {}
        for (const r of (gData ?? [])) {
          if (!agg[r.user_id]) agg[r.user_id] = { totalScore: 0, plays: 0 }
          agg[r.user_id].totalScore += r.score
          agg[r.user_id].plays     += 1
        }
        setGameStats(agg)
      }

      setLoading(false)
    }

    fetchAll()
  }, [isAdmin])

  // ── Guard ──────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-arena-bg z-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <p className="text-white font-bold text-lg mb-2">Không có quyền truy cập</p>
          <p className="text-text-secondary text-sm mb-6">Bạn không có quyền truy cập khu vực này.</p>
          <button onClick={onClose} className="btn-secondary">Quay lại</button>
        </div>
      </div>
    )
  }

  // ── KPI aggregates ─────────────────────────────────────
  const totalProfiles  = profiles.length
  const totalAdmin     = profiles.filter(p => p.role === 'admin').length
  const totalStaff     = profiles.filter(p => p.role === 'staff').length
  const totalActive    = profiles.filter(p => p.is_active !== false).length
  const hasPlayedIds   = new Set(Object.keys(gameStats))
  const totalPlayers   = hasPlayedIds.size
  const totalPlays     = Object.values(gameStats).reduce((s, g) => s + g.plays, 0)

  const filtered = filterDept === 'all'
    ? profiles
    : profiles.filter(p => p.department === filterDept)

  // ── Status helper ──────────────────────────────────────
  function getStatus(p: ProfileRow): { label: string; color: string; bg: string } {
    if (p.is_active === false) {
      return { label: 'Tạm khóa', color: '#888', bg: 'rgba(255,255,255,0.06)' }
    }
    if (hasPlayedIds.has(p.id)) {
      return { label: 'Đã tham gia', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
    }
    return { label: 'Chưa chơi', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
  }

  // ── KPI card data ──────────────────────────────────────
  const kpiCards = [
    { label: 'Tổng nhân sự',   value: loading ? '…' : totalProfiles, sub: `${totalAdmin} admin · ${totalStaff} staff`,  color: '#60a5fa' },
    { label: 'Tài khoản active', value: loading ? '…' : totalActive,   sub: `${totalProfiles - totalActive} tạm khóa`,   color: '#4ade80' },
    { label: 'Đã chơi game',   value: loading ? '…' : totalPlayers,  sub: `${totalProfiles - totalPlayers} chưa tham gia`, color: '#E94E1B' },
    { label: 'Tổng lượt chơi', value: loading ? '…' : totalPlays,    sub: gameStatsNote ?? 'Tất cả game',               color: '#facc15' },
  ]

  return (
    <div className="fixed inset-0 bg-arena-bg z-50 overflow-y-auto">
      <div className="max-w-[430px] mx-auto px-4 pb-10">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex items-center gap-3 py-5 border-b border-arena-border mb-5">
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary hover:text-white transition-colors">
            ←
          </button>
          <div>
            <p className="text-white font-black text-lg">Admin Panel</p>
            <p className="text-text-muted text-xs">Centosy Arena · Quản trị viên</p>
          </div>
          <span className="ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
            ADMIN
          </span>
        </div>

        {/* ── KPI cards (2×2 grid) ───────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {kpiCards.map(card => (
            <div key={card.label}
                 className="rounded-2xl p-4"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <p className="font-black text-white" style={{ fontSize: '28px', lineHeight: 1, color: card.color }}>
                {card.value}
              </p>
              <p style={{ fontSize: '12px', color: '#e0e0e0', fontWeight: 700, marginTop: 4 }}>{card.label}</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: 2, lineHeight: 1.5 }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Danh sách nhân sự ─────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="section-title">Danh sách nhân sự</p>
            {!loading && !loadError && (
              <span className="badge-gray">{filtered.length} người</span>
            )}
          </div>

          {/* Filter khối */}
          {!loading && !loadError && profiles.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-0 no-scrollbar mb-3">
              <button
                onClick={() => setFilterDept('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${filterDept === 'all' ? 'bg-brand text-white' : 'bg-arena-card border border-arena-border text-text-secondary'}`}>
                Tất cả
              </button>
              {DEPT_KEYS.map(k => (
                <button key={k} onClick={() => setFilterDept(k)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${filterDept === k ? 'bg-brand text-white' : 'bg-arena-card border border-arena-border text-text-secondary'}`}>
                  {DEPT_LABEL[k]}
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="rounded-2xl py-10 flex flex-col items-center gap-3"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #E94E1B', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: '13px', color: '#555' }}>Đang tải...</p>
            </div>
          )}

          {/* Lỗi */}
          {!loading && loadError && (
            <div className="rounded-2xl px-4 py-4"
                 style={{ background: '#1a0808', border: '1px solid rgba(239,68,68,0.3)' }}>
              <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Lỗi tải dữ liệu</p>
              <p style={{ fontSize: '12px', color: '#888' }}>{loadError}</p>
            </div>
          )}

          {/* Danh sách */}
          {!loading && !loadError && (
            filtered.length === 0 ? (
              <div className="rounded-2xl py-8 text-center"
                   style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                <p style={{ fontSize: '13px', color: '#555' }}>Không có nhân sự trong khối này.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden"
                   style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
                {filtered.map((p, i) => {
                  const gs     = gameStats[p.id]
                  const status = getStatus(p)
                  return (
                    <div key={p.id}
                         className="flex items-center gap-3 px-4 py-3"
                         style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1a1a1a' : 'none' }}>

                      {/* Avatar initials */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black"
                           style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', fontSize: '13px', color: '#888' }}>
                        {p.full_name.split(' ').slice(-2).map(w => w[0]?.toUpperCase() ?? '').join('')}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p style={{ fontSize: '13px', color: '#f0f0f0', fontWeight: 700 }}
                             className="truncate">
                            {p.full_name}
                          </p>
                          {p.role === 'admin' && (
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#facc15', background: 'rgba(250,204,21,0.15)', padding: '2px 6px', borderRadius: 99 }}>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: '#555' }} className="truncate">{p.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span style={{ fontSize: '10px', color: '#484848' }}>
                            {DEPT_LABEL[p.department] ?? p.department}
                          </span>
                          {/* Status badge */}
                          <span style={{ fontSize: '10px', fontWeight: 600, color: status.color, background: status.bg, padding: '1px 7px', borderRadius: 99 }}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Score + plays */}
                      <div className="text-right shrink-0">
                        {gs ? (
                          <>
                            <p style={{ fontSize: '14px', fontWeight: 900, color: '#E94E1B' }}>
                              {gs.totalScore.toLocaleString('vi-VN')}
                            </p>
                            <p style={{ fontSize: '10px', color: '#484848', marginTop: 1 }}>
                              {gs.plays} lượt
                            </p>
                          </>
                        ) : gameStatsNote ? (
                          <p style={{ fontSize: '10px', color: '#3a3a3a' }}>—</p>
                        ) : (
                          <p style={{ fontSize: '10px', color: '#3a3a3a' }}>0 đ</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {/* Note nếu game_results không tải được */}
          {!loading && gameStatsNote && (
            <p style={{ fontSize: '11px', color: '#555', marginTop: 8, textAlign: 'center' }}>
              ⚠️ {gameStatsNote}
            </p>
          )}
        </div>

        {/* ── Cài đặt điểm thưởng ───────────────────────── */}
        <div>
          <p className="section-title mb-3">Cài đặt điểm thưởng</p>
          <div className="rounded-2xl overflow-hidden"
               style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
            {POINT_RULES.map((rule, i) => (
              <div key={rule.action}
                   className="flex items-center justify-between px-4 py-3"
                   style={{ borderBottom: i < POINT_RULES.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <p style={{ fontSize: '13px', color: '#ccc' }}>{rule.action}</p>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{rule.points}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#484848', textAlign: 'center', marginTop: 8 }}>
            Chỉnh sửa điểm thưởng sẽ có ở phiên bản tiếp theo
          </p>
        </div>

      </div>
    </div>
  )
}
