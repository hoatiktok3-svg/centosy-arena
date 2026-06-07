/**
 * TournamentBracketPage — STEP 78
 * Vòng loại (lấy top N từ season) + Chung kết (bracket).
 * Admin: cấu hình số người vào chung kết.
 * Player: xem kết quả vòng loại + bracket chung kết.
 */
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

interface QualifierRow {
  rank:       number
  userId:     string
  name:       string | null
  orgGroup:   string | null
  score:      number
  qualified:  boolean
}

interface FinalMatch {
  id:       string
  player1:  string | null
  player2:  string | null
  winner?:  string
  round:    number  // 1 = quarterfinal, 2 = semifinal, 3 = final
}

const BRACKET_STORAGE_KEY = 'centosy_tournament_bracket'

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function loadBracket(): FinalMatch[] {
  try { return JSON.parse(localStorage.getItem(BRACKET_STORAGE_KEY) ?? '[]') as FinalMatch[] }
  catch { return [] }
}

function saveBracket(b: FinalMatch[]) {
  localStorage.setItem(BRACKET_STORAGE_KEY, JSON.stringify(b))
}

function buildBracket(qualifiers: QualifierRow[], topN: number): FinalMatch[] {
  const players = qualifiers.slice(0, topN).map(q => q.name)
  const matches: FinalMatch[] = []

  // Round 1: pair up players
  for (let i = 0; i < players.length; i += 2) {
    matches.push({
      id:      `r1_${i}`,
      player1: players[i] ?? null,
      player2: players[i + 1] ?? null,
      round:   1,
    })
  }
  return matches
}

export default function TournamentBracketPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = currentUser ? canAccessAdminPanel(currentUser.role) : false

  const [qualifiers, setQualifiers] = useState<QualifierRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [topN, setTopN]             = useState(8)
  const [bracket, setBracket]       = useState<FinalMatch[]>(loadBracket)
  const [tab, setTab]               = useState<'qualifier' | 'bracket'>('qualifier')

  const fetchQualifiers = useCallback(async () => {
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    if (sessions) {
      const userScore: Record<string, { name: string | null; org: string | null; score: number }> = {}
      for (const s of sessions) {
        const uid = s.user_id
        const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
        if (!userScore[uid]) userScore[uid] = { name: prof?.full_name ?? null, org: prof?.org_group ?? null, score: 0 }
        userScore[uid].score += s.score
      }

      const sorted = Object.entries(userScore)
        .sort((a, b) => b[1].score - a[1].score)
        .map(([uid, d], i) => ({
          rank:      i + 1,
          userId:    uid,
          name:      d.name,
          orgGroup:  d.org,
          score:     d.score,
          qualified: i < topN,
        }))

      setQualifiers(sorted)
    }
    setLoading(false)
  }, [topN])

  useEffect(() => { void fetchQualifiers() }, [fetchQualifiers])

  const handleGenerateBracket = () => {
    const b = buildBracket(qualifiers, topN)
    saveBracket(b)
    setBracket(b)
    setTab('bracket')
  }

  const handleSetWinner = (matchId: string, winner: string) => {
    const updated = bracket.map(m => m.id === matchId ? { ...m, winner } : m)
    saveBracket(updated)
    setBracket(updated)
  }

  const roundLabel = (round: number) =>
    round === 1 ? 'Tứ kết' : round === 2 ? 'Bán kết' : 'Chung kết'

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.93)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Vòng loại & Chung kết
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Top {topN} vào chung kết mùa này</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.25)', fontSize: '16px' }}>
            🏆
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #151515' }}>
          {(['qualifier', 'bracket'] as const).map(t => (
            <button key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 py-2 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: '12px',
                      background: tab === t ? 'rgba(233,78,27,0.15)' : 'transparent',
                      border:     tab === t ? '1px solid rgba(233,78,27,0.3)' : '1px solid transparent',
                      color:      tab === t ? '#E94E1B' : '#585858',
                    }}>
              {t === 'qualifier' ? '🔍 Vòng loại' : '🏆 Bracket'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {tab === 'qualifier' && (
            <>
              {/* Admin: set topN */}
              {isAdmin && (
                <div className="mt-3 rounded-xl px-4 py-3 mb-3 flex items-center gap-3"
                     style={{ background: '#111', border: '1px solid #2c2c2c' }}>
                  <p style={{ fontSize: '12px', color: '#888', flex: 1 }}>Số người vào chung kết:</p>
                  <div className="flex items-center gap-2">
                    {[4, 8, 16].map(n => (
                      <button key={n}
                              onClick={() => setTopN(n)}
                              className="w-9 h-8 rounded-lg font-bold"
                              style={{ fontSize: '12px', background: topN === n ? 'rgba(233,78,27,0.15)' : '#1a1a1a', color: topN === n ? '#E94E1B' : '#585858', border: `1px solid ${topN === n ? 'rgba(233,78,27,0.3)' : '#2c2c2c'}` }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <span style={{ fontSize: '28px' }}>⏳</span>
                  <p style={{ fontSize: '12px', color: '#484848' }}>Đang tải...</p>
                </div>
              ) : qualifiers.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <span style={{ fontSize: '36px' }}>📭</span>
                  <p className="text-white font-bold" style={{ fontSize: '14px' }}>Chưa có dữ liệu mùa này</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-white mt-3 mb-2" style={{ fontSize: '13px' }}>
                    Kết quả vòng loại ({qualifiers.length} người thi)
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {qualifiers.map(q => (
                      <div key={q.userId}
                           className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5"
                           style={{
                             background: q.qualified ? 'rgba(52,211,153,0.06)' : '#111',
                             border:     q.qualified ? '1px solid rgba(52,211,153,0.2)' : '1px solid #1f1f1f',
                           }}>
                        <p className="font-black shrink-0 w-6 text-center"
                           style={{ fontSize: '12px', color: q.rank <= 3 ? ['#facc15','#9ca3af','#d97706'][q.rank - 1] : '#484848' }}>
                          #{q.rank}
                        </p>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate" style={{ fontSize: '12px' }}>
                            {q.name ?? '—'}
                          </p>
                          {q.orgGroup && <p style={{ fontSize: '10px', color: '#585858' }}>{q.orgGroup}</p>}
                        </div>
                        <p className="font-black shrink-0" style={{ fontSize: '13px', color: '#E94E1B' }}>
                          {q.score.toLocaleString('vi-VN')}đ
                        </p>
                        {q.qualified && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded font-bold"
                                style={{ fontSize: '8px', background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>
                            VÀO CK
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={handleGenerateBracket}
                      className="w-full mt-4 py-3.5 rounded-2xl font-black"
                      style={{ fontSize: '14px', background: 'rgba(233,78,27,0.12)', border: '1px solid rgba(233,78,27,0.3)', color: '#E94E1B' }}>
                      🏆 Tạo bracket chung kết →
                    </button>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'bracket' && (
            <>
              {bracket.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-2">
                  <span style={{ fontSize: '36px' }}>📋</span>
                  <p className="text-white font-bold" style={{ fontSize: '14px' }}>Chưa có bracket</p>
                  <p style={{ fontSize: '12px', color: '#585858' }}>Admin tạo bracket từ tab Vòng loại</p>
                </div>
              ) : (
                <>
                  <p className="font-bold text-white mt-4 mb-2.5" style={{ fontSize: '13px' }}>
                    Bracket chung kết
                  </p>
                  <div className="flex flex-col gap-3">
                    {bracket.map(match => (
                      <div key={match.id}
                           className="rounded-xl px-4 py-3"
                           style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                        <p style={{ fontSize: '10px', color: '#585858', marginBottom: 8 }}>
                          {roundLabel(match.round)}
                        </p>
                        <div className="flex flex-col gap-2">
                          {[match.player1, match.player2].map((player, pi) => (
                            <div key={pi}
                                 className="rounded-lg px-3 py-2 flex items-center gap-2"
                                 style={{
                                   background: match.winner === player ? 'rgba(52,211,153,0.08)' : '#1a1a1a',
                                   border:     match.winner === player ? '1px solid rgba(52,211,153,0.25)' : '1px solid #252525',
                                 }}>
                              <p className="flex-1 font-semibold text-white" style={{ fontSize: '12px' }}>
                                {player ?? 'TBD'}
                              </p>
                              {match.winner === player && (
                                <span style={{ fontSize: '14px' }}>✅</span>
                              )}
                              {isAdmin && player && !match.winner && (
                                <button
                                  onClick={() => handleSetWinner(match.id, player)}
                                  className="px-2 py-0.5 rounded font-bold"
                                  style={{ fontSize: '9px', background: 'rgba(233,78,27,0.12)', color: '#E94E1B', border: '1px solid rgba(233,78,27,0.25)' }}>
                                  Thắng
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
