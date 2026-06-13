// RoomResult — Kết quả cuối + confetti + chi tiết từng câu + speed stats
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { RoomPlayer } from './roomTypes'
import Confetti from './Confetti'
import { useGameAudio } from '../../hooks/useGameAudio'

interface Props {
  players:   RoomPlayer[]
  myUserId:  string
  roomTitle: string
  roomId:    string
  onClose:   () => void
}

interface AnswerDetail {
  question_index:  number
  question_text:   string
  options:         string[]
  correct_index:   number
  chosen_index:    number | null
  is_correct:      boolean
  points_earned:   number
  response_time_ms: number
  explanation:     string | null
}

const MEDALS  = ['🥇', '🥈', '🥉']
const BRAND   = '#E94E1B'
const OPT_LABELS = ['A', 'B', 'C', 'D']

export default function RoomResult({ players: initialPlayers, myUserId, roomTitle, roomId, onClose }: Props) {
  const [players, setPlayers]   = useState<RoomPlayer[]>(initialPlayers)
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<'rank' | 'detail'>('rank')
  const [details, setDetails]   = useState<AnswerDetail[]>([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [showConfetti, setShowConfetti]   = useState(false)
  const audio      = useGameAudio()
  const fanfareDone = useRef(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1200))  // wait for admin to save ranks
      const { data } = await supabase
        .from('room_players').select('*')
        .eq('room_id', roomId).eq('is_active', true)
      if (data && data.length > 0) setPlayers(data as RoomPlayer[])
      setLoading(false)
    }
    void load()
  }, [roomId])

  // Play fanfare + confetti when result is ready
  useEffect(() => {
    if (loading || fanfareDone.current) return
    fanfareDone.current = true
    audio.playSfx('fanfare')
    // Check if current user is top 1
    const sorted = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)
    const myRank = sorted.findIndex(p => p.user_id === myUserId) + 1
    if (myRank === 1) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load answer details
  const loadDetails = async () => {
    if (details.length > 0) return
    setLoadingDetail(true)
    // Fetch my answers
    const { data: answers } = await supabase
      .from('room_answers')
      .select('question_index, chosen_index, is_correct, points_earned, response_time_ms')
      .eq('room_id', roomId)
      .eq('user_id', myUserId)
      .order('question_index')

    // Fetch questions for the room (via room's question_set_id)
    const { data: room } = await supabase
      .from('game_rooms').select('question_set_id').eq('id', roomId).single()

    if (!room?.question_set_id) { setLoadingDetail(false); return }

    const { data: questions } = await supabase
      .from('room_questions')
      .select('question_text, options, correct_index, explanation, sort_order')
      .eq('question_set_id', room.question_set_id)
      .order('sort_order')

    if (!questions) { setLoadingDetail(false); return }

    const answerMap = new Map(answers?.map(a => [a.question_index, a]) ?? [])
    const combined: AnswerDetail[] = questions.map((q, i) => {
      const a = answerMap.get(i)
      return {
        question_index:   i,
        question_text:    q.question_text,
        options:          q.options as string[],
        correct_index:    q.correct_index,
        chosen_index:     a?.chosen_index ?? null,
        is_correct:       a?.is_correct ?? false,
        points_earned:    a?.points_earned ?? 0,
        response_time_ms: a?.response_time_ms ?? 0,
        explanation:      q.explanation ?? null,
      }
    })
    setDetails(combined)
    setLoadingDetail(false)
  }

  const handleTab = (t: 'rank' | 'detail') => {
    setTab(t)
    if (t === 'detail') void loadDetails()
  }

  const sorted  = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)
  const me      = sorted.find(p => p.user_id === myUserId)
  const myRank  = me ? sorted.indexOf(me) + 1 : null
  const totalQ  = details.length

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      <Confetti active={showConfetti} count={100} />

      {/* Header */}
      <div className="shrink-0 px-4 pt-5 pb-4 text-center"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '36px', marginBottom: 4 }}>🏁</p>
        <p className="font-black text-white" style={{ fontSize: '22px' }}>Kết quả cuối</p>
        <p style={{ fontSize: '12px', color: '#555', marginTop: 2 }}>{roomTitle}</p>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex px-4 py-2 gap-2" style={{ borderBottom: '1px solid #1a1a1a' }}>
        {(['rank', 'detail'] as const).map(t => (
          <button key={t} onClick={() => handleTab(t)}
                  className="flex-1 py-2 rounded-xl font-bold transition-all"
                  style={{
                    fontSize: '12px',
                    background: tab === t ? BRAND : '#141414',
                    color: tab === t ? '#fff' : '#666',
                    border: `1px solid ${tab === t ? BRAND : '#222'}`,
                  }}>
            {t === 'rank' ? '🏆 Xếp hạng' : '📊 Chi tiết câu hỏi'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
               style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
          <p style={{ fontSize: '13px', color: '#555' }}>Đang tổng hợp kết quả...</p>
        </div>
      ) : tab === 'rank' ? (
        /* ── RANKING TAB ─────────────────────────────────────────────── */
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

          {/* My result card */}
          {me && myRank && (
            <div className="rounded-2xl p-4"
                 style={{ background: `${BRAND}0d`, border: `1px solid ${BRAND}44` }}>
              <p style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                KẾT QUẢ CỦA BẠN
              </p>
              <div className="flex items-center gap-3 mb-3">
                {/* Rank big */}
                <div className="shrink-0 text-center">
                  {myRank <= 3
                    ? <span style={{ fontSize: '40px', lineHeight: 1 }}>{MEDALS[myRank - 1]}</span>
                    : <p className="font-black" style={{ fontSize: '36px', color: BRAND, lineHeight: 1 }}>#{myRank}</p>}
                  <p style={{ fontSize: '10px', color: '#555', marginTop: 2 }}>Hạng</p>
                </div>
                {/* Stats grid */}
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <div className="rounded-xl p-2 text-center" style={{ background: '#141414' }}>
                    <p className="font-black text-white" style={{ fontSize: '18px' }}>{me.score}</p>
                    <p style={{ fontSize: '10px', color: '#555' }}>Điểm</p>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ background: '#141414' }}>
                    <p className="font-black" style={{ fontSize: '18px', color: '#10b981' }}>{me.correct_count}</p>
                    <p style={{ fontSize: '10px', color: '#555' }}>Đúng</p>
                  </div>
                  <div className="rounded-xl p-2 text-center" style={{ background: '#141414' }}>
                    <p className="font-black" style={{ fontSize: '18px', color: '#facc15' }}>
                      {sorted.length > 0 ? `${Math.round((me.correct_count / Math.max(sorted.length > 0 ? (details.length || me.correct_count) : 1, 1)) * 100)}%` : '—'}
                    </p>
                    <p style={{ fontSize: '10px', color: '#555' }}>Chính xác</p>
                  </div>
                </div>
              </div>
              {myRank === 1 && (
                <div className="rounded-xl py-2.5 text-center"
                     style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
                  <p style={{ fontSize: '14px', color: '#facc15', fontWeight: 700 }}>🏆 Vô địch toàn phòng! Xuất sắc!</p>
                </div>
              )}
              {myRank === 2 && (
                <div className="rounded-xl py-2.5 text-center"
                     style={{ background: 'rgba(156,163,175,0.08)', border: '1px solid rgba(156,163,175,0.25)' }}>
                  <p style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 700 }}>🥈 Á quân! Rất tuyệt vời!</p>
                </div>
              )}
              {myRank === 3 && (
                <div className="rounded-xl py-2.5 text-center"
                     style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)' }}>
                  <p style={{ fontSize: '14px', color: '#fb923c', fontWeight: 700 }}>🥉 Hạng 3! Giỏi lắm!</p>
                </div>
              )}
              {myRank > 3 && (
                <div className="rounded-xl py-2.5 text-center" style={{ background: '#141414' }}>
                  <p style={{ fontSize: '13px', color: '#888' }}>🎉 Cố gắng thêm ở lần tiếp theo!</p>
                </div>
              )}
            </div>
          )}

          {/* Top 3 + full ranking */}
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              Bảng xếp hạng đầy đủ
            </p>
            <div className="flex flex-col gap-2">
              {sorted.map((p, i) => {
                const isMe = p.user_id === myUserId
                const podiumColors = [
                  { bg: 'rgba(250,204,21,0.07)', border: 'rgba(250,204,21,0.35)', score: '#facc15' },
                  { bg: 'rgba(156,163,175,0.07)', border: 'rgba(156,163,175,0.25)', score: '#9ca3af' },
                  { bg: 'rgba(251,146,60,0.07)', border: 'rgba(251,146,60,0.25)', score: '#fb923c' },
                ]
                const c = i < 3 ? podiumColors[i] : null
                return (
                  <div key={p.id}
                       className="flex items-center gap-3 rounded-2xl px-4 py-3"
                       style={{
                         background: isMe ? `${BRAND}0d` : (c ? c.bg : '#141414'),
                         border: `1px solid ${isMe ? `${BRAND}44` : (c ? c.border : '#1f1f1f')}`,
                       }}>
                    <div className="shrink-0 w-8 text-center">
                      {i < 3
                        ? <span style={{ fontSize: '20px' }}>{MEDALS[i]}</span>
                        : <span className="font-black" style={{ fontSize: '13px', color: '#444' }}>#{i + 1}</span>}
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                         style={{ background: isMe ? `${BRAND}22` : '#1f1f1f', color: isMe ? BRAND : '#666', border: `1px solid ${isMe ? `${BRAND}44` : '#2a2a2a'}` }}>
                      {(p.display_name ?? '?')[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate" style={{ fontSize: '14px', color: isMe ? '#fff' : '#ccc' }}>
                        {p.display_name ?? `Người chơi ${i + 1}`}
                        {isMe && <span style={{ marginLeft: 6, fontSize: '9px', color: BRAND }}>Bạn</span>}
                      </p>
                      <p style={{ fontSize: '10px', color: '#555' }}>{p.correct_count} câu đúng</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black" style={{ fontSize: '18px', color: isMe ? BRAND : (c ? c.score : '#fff') }}>
                        {p.score}đ
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ── DETAIL TAB ──────────────────────────────────────────────── */
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {loadingDetail ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                   style={{ borderColor: BRAND, borderTopColor: 'transparent' }} />
              <p style={{ fontSize: '12px', color: '#555' }}>Đang tải chi tiết...</p>
            </div>
          ) : details.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <p style={{ fontSize: '32px' }}>📋</p>
              <p style={{ fontSize: '13px', color: '#555' }}>Không có dữ liệu chi tiết.</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-2 mb-1">
                {[
                  { label: 'Đúng', value: details.filter(d => d.is_correct).length, color: '#10b981' },
                  { label: 'Sai', value: details.filter(d => !d.is_correct && d.chosen_index !== null).length, color: '#f87171' },
                  { label: 'Bỏ qua', value: details.filter(d => d.chosen_index === null).length, color: '#888' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                    <p className="font-black" style={{ fontSize: '18px', color: s.color }}>{s.value}/{totalQ}</p>
                    <p style={{ fontSize: '10px', color: '#555' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-question breakdown */}
              {details.map((d, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden"
                     style={{ border: `1px solid ${d.is_correct ? 'rgba(16,185,129,0.3)' : d.chosen_index === null ? 'rgba(156,163,175,0.2)' : 'rgba(239,68,68,0.3)'}` }}>
                  {/* Question header */}
                  <div className="px-4 py-3"
                       style={{ background: d.is_correct ? 'rgba(16,185,129,0.06)' : d.chosen_index === null ? 'rgba(156,163,175,0.04)' : 'rgba(239,68,68,0.06)' }}>
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: '14px', flexShrink: 0, marginTop: 1 }}>
                        {d.is_correct ? '✅' : d.chosen_index === null ? '⏰' : '❌'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '11px', color: '#555', marginBottom: 3 }}>
                          Câu {idx + 1}
                          {d.is_correct && (
                            <span style={{ marginLeft: 8, color: BRAND, fontWeight: 700 }}>+{d.points_earned}đ</span>
                          )}
                          {d.response_time_ms > 0 && (
                            <span style={{ marginLeft: 6, color: '#555' }}>
                              · ⚡ {(d.response_time_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </p>
                        <p className="font-semibold text-white" style={{ fontSize: '13px', lineHeight: 1.4 }}>
                          {d.question_text}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="px-4 py-3 flex flex-col gap-1.5" style={{ background: '#0a0a0a' }}>
                    {d.options.map((opt, oi) => {
                      const isCorrect = oi === d.correct_index
                      const isChosen  = oi === d.chosen_index
                      let bg = 'transparent'; let color = '#555'; let border = 'transparent'
                      if (isCorrect) { bg = 'rgba(16,185,129,0.1)'; color = '#10b981'; border = 'rgba(16,185,129,0.4)' }
                      else if (isChosen) { bg = 'rgba(239,68,68,0.1)'; color = '#f87171'; border = 'rgba(239,68,68,0.4)' }
                      return (
                        <div key={oi} className="flex items-center gap-2 rounded-xl px-3 py-2"
                             style={{ background: bg, border: `1px solid ${border}` }}>
                          <span className="font-black shrink-0"
                                style={{ fontSize: '11px', color, width: 20 }}>
                            {OPT_LABELS[oi]}.
                          </span>
                          <p style={{ fontSize: '12px', color: isCorrect ? '#d1fae5' : isChosen ? '#fecaca' : '#555', flex: 1 }}>
                            {opt}
                          </p>
                          {isCorrect && <span style={{ fontSize: '12px' }}>✅</span>}
                          {isChosen && !isCorrect && <span style={{ fontSize: '12px' }}>❌</span>}
                        </div>
                      )
                    })}
                  </div>

                  {/* Explanation */}
                  {d.explanation && (
                    <div className="px-4 py-2.5"
                         style={{ borderTop: '1px solid #1a1a1a', background: 'rgba(250,204,21,0.03)' }}>
                      <p style={{ fontSize: '10px', color: '#facc15', fontWeight: 700, marginBottom: 3 }}>💡 Giải thích</p>
                      <p style={{ fontSize: '11px', color: '#a3a3a3', lineHeight: 1.5 }}>{d.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Close */}
      <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        <button onClick={onClose}
                className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
                style={{ fontSize: '15px', background: `linear-gradient(90deg,${BRAND},#FF5A28)`, boxShadow: `0 4px 20px ${BRAND}44` }}>
          ✓ Đóng & Quay về
        </button>
      </div>
    </div>
  )
}
