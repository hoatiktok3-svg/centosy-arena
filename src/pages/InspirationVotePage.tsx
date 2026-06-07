import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// ── Helpers ───────────────────────────────────────────────────
function getCurrentPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

// ── Types ─────────────────────────────────────────────────────
interface Nominee {
  id:              string
  full_name:       string | null
  avatar_initials: string | null
  org_group:       string | null
  title:           string | null
  vote_count:      number
}

interface Props { onClose: () => void }

const GROUP_LABEL: Record<string, string> = {
  'cua-hang': 'Cửa hàng', kho: 'Kho', 'van-phong': 'Văn phòng',
}

// ── Component ─────────────────────────────────────────────────
export default function InspirationVotePage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const period = getCurrentPeriod()

  const [nominees,    setNominees]    = useState<Nominee[]>([])
  const [myVote,      setMyVote]      = useState<string | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [voting,      setVoting]      = useState(false)
  const [selected,    setSelected]    = useState<string | null>(null)
  const [voted,       setVoted]       = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  useEffect(() => { void load() }, [currentUser?.id])

  async function load() {
    setLoading(true)

    // Fetch all active employees (excluding self)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_initials, org_group, title')
      .eq('is_active', true)
      .neq('id', currentUser?.id ?? '')
      .order('full_name', { ascending: true })

    // Fetch vote counts for this period
    const { data: votes } = await supabase
      .from('inspiration_votes')
      .select('nominee_id')
      .eq('period', period)

    // Fetch my vote for this period
    const { data: myVoteData } = await supabase
      .from('inspiration_votes')
      .select('nominee_id')
      .eq('period', period)
      .eq('voter_id', currentUser?.id ?? '')
      .maybeSingle()

    const voteCounts: Record<string, number> = {}
    for (const v of votes ?? []) {
      voteCounts[v.nominee_id] = (voteCounts[v.nominee_id] ?? 0) + 1
    }

    const nomineeList: Nominee[] = (profiles ?? []).map((p: {
      id: string; full_name: string | null; avatar_initials: string | null;
      org_group: string | null; title: string | null
    }) => ({
      ...p,
      vote_count: voteCounts[p.id] ?? 0,
    }))

    nomineeList.sort((a, b) => b.vote_count - a.vote_count)

    setNominees(nomineeList)
    if (myVoteData?.nominee_id) {
      setMyVote(myVoteData.nominee_id)
      setVoted(true)
    }
    setLoading(false)
  }

  async function handleVote() {
    if (!selected || !currentUser?.id) return
    setVoting(true)
    setError(null)

    const { error: dbErr } = await supabase.from('inspiration_votes').insert({
      voter_id:   currentUser.id,
      nominee_id: selected,
      period,
    })

    setVoting(false)
    if (dbErr) {
      if (dbErr.code === '23505') {
        setError('Bạn đã bình chọn kỳ này rồi.')
      } else if (dbErr.code === '23514') {
        setError('Không thể tự bình chọn bản thân.')
      } else {
        setError('Không thể gửi bình chọn. Thử lại sau.')
      }
    } else {
      setMyVote(selected)
      setVoted(true)
      void load()
    }
  }

  const top3 = nominees.slice(0, 3).filter(n => n.vote_count > 0)
  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div className="fixed inset-0 z-[90] bg-arena-bg flex flex-col" style={{ maxWidth: 430, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-arena-border">
        <button onClick={onClose}
          className="w-9 h-9 rounded-xl bg-arena-card border border-arena-border flex items-center justify-center text-text-secondary active:scale-95">←</button>
        <div className="flex-1">
          <p className="text-white font-black text-base">⭐ Bình chọn truyền cảm hứng</p>
          <p className="text-text-muted text-xs">Kỳ: {period}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {loading && <p className="text-text-muted text-sm text-center py-16">Đang tải...</p>}

        {/* Top 3 */}
        {!loading && top3.length > 0 && (
          <div>
            <p className="section-title mb-3">🏆 Top kỳ này</p>
            <div className="flex flex-col gap-2">
              {top3.map((n, i) => (
                <div key={n.id}
                  className="arena-card flex items-center gap-3"
                  style={myVote === n.id ? { border: '1px solid rgba(233,78,27,0.4)' } : {}}>
                  <span className="text-2xl">{MEDAL[i]}</span>
                  <div className="w-9 h-9 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-xs">
                      {n.avatar_initials ?? n.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{n.full_name ?? '—'}</p>
                    <p className="text-text-muted text-[10px]">{GROUP_LABEL[n.org_group ?? ''] ?? n.org_group ?? ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-brand font-black text-lg">{n.vote_count}</p>
                    <p className="text-text-muted text-[10px]">votes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vote section */}
        {!loading && !voted && (
          <div>
            <p className="section-title mb-3">👆 Chọn người truyền cảm hứng cho bạn</p>
            <div className="flex flex-col gap-2">
              {nominees.map(n => (
                <button key={n.id}
                  onClick={() => setSelected(n.id)}
                  className="arena-card flex items-center gap-3 w-full text-left active:scale-[0.98] transition-transform"
                  style={selected === n.id
                    ? { border: '1px solid rgba(233,78,27,0.5)', background: 'rgba(233,78,27,0.06)' }
                    : {}}>
                  <div className="w-9 h-9 rounded-full bg-arena-bg border border-arena-border flex items-center justify-center shrink-0">
                    <span className="text-white font-black text-xs">
                      {n.avatar_initials ?? n.full_name?.slice(0, 2).toUpperCase() ?? '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">{n.full_name ?? '—'}</p>
                    <p className="text-text-muted text-[10px]">
                      {n.title ? `${n.title} · ` : ''}{GROUP_LABEL[n.org_group ?? ''] ?? n.org_group ?? ''}
                    </p>
                  </div>
                  {selected === n.id && <span className="text-brand text-lg shrink-0">✓</span>}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

            <button
              onClick={() => void handleVote()}
              disabled={!selected || voting}
              className="btn-primary w-full mt-4 disabled:opacity-50">
              {voting ? 'Đang gửi...' : '⭐ Xác nhận bình chọn'}
            </button>
            <p className="text-text-muted text-xs text-center mt-2">Mỗi người chỉ được 1 lượt bình chọn/kỳ</p>
          </div>
        )}

        {/* Already voted */}
        {!loading && voted && (
          <div>
            <div className="arena-card flex flex-col items-center gap-3 py-6">
              <span className="text-4xl">✅</span>
              <p className="text-white font-bold text-center">Bạn đã bình chọn kỳ này!</p>
              {myVote && (
                <p className="text-text-secondary text-sm text-center">
                  Bình chọn của bạn:{' '}
                  <span className="text-brand font-semibold">
                    {nominees.find(n => n.id === myVote)?.full_name ?? '—'}
                  </span>
                </p>
              )}
              <p className="text-text-muted text-xs text-center">Kết quả sẽ được tổng kết cuối kỳ</p>
            </div>

            {/* Show full rankings */}
            {nominees.filter(n => n.vote_count > 0).length > 0 && (
              <div className="mt-4">
                <p className="section-title mb-3">📊 Bảng xếp hạng đầy đủ</p>
                <div className="flex flex-col gap-2">
                  {nominees.filter(n => n.vote_count > 0).map((n, i) => (
                    <div key={n.id}
                      className="arena-card flex items-center gap-3"
                      style={myVote === n.id ? { border: '1px solid rgba(233,78,27,0.4)' } : {}}>
                      <span className="text-text-muted text-sm font-bold w-5 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate">{n.full_name ?? '—'}</p>
                      </div>
                      <span className="text-brand font-black">{n.vote_count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && nominees.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <span className="text-5xl">👥</span>
            <p className="text-text-muted text-sm text-center">Chưa có đồng nghiệp nào để bình chọn.</p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
