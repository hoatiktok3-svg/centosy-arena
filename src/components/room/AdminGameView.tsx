/**
 * AdminGameView — Màn hình admin trong lúc game đang chạy
 * Hiển thị: câu hỏi hiện tại, timer, live leaderboard, số người đã trả lời
 * Admin KHÔNG chơi — chỉ điều phối và xem realtime
 */
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { RoomPlayer, RoomQuestion, GameRoom } from './roomTypes'

interface Props {
  room:              GameRoom
  players:           RoomPlayer[]         // realtime từ GameRoomPage
  question:          RoomQuestion
  questionIndex:     number
  totalQuestions:    number
  /** Khi admin bấm "Chuyển ngay" hoặc hết giờ → chuyển sang leaderboard */
  onShowLeaderboard: () => void
  onEndGame:         () => void
}

const BRAND = '#E94E1B'
const MEDALS = ['🥇', '🥈', '🥉']

export default function AdminGameView({
  room, players, question, questionIndex, totalQuestions,
  onShowLeaderboard, onEndGame,
}: Props) {
  const [answeredCount, setAnsweredCount] = useState(0)
  const [timeLeft, setTimeLeft]           = useState(room.question_time_limit_s)
  const [autoAdvanced, setAutoAdvanced]   = useState(false)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const chanRef       = useRef<ReturnType<typeof supabase.channel> | null>(null)
  // FIX: lưu ref để clearTimeout khi component unmount — tránh leak timeout gây nhảy câu sớm
  const nextStepRef   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activePlayers = players.filter(p => p.is_active)
  const sorted = [...activePlayers].sort((a, b) => b.score - a.score)
  const totalActive = activePlayers.length

  // ── Reset per question ─────────────────────────────────
  useEffect(() => {
    setAnsweredCount(0)
    setAutoAdvanced(false)

    // Load existing answers for this question
    void supabase
      .from('room_answers')
      .select('id', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('question_index', questionIndex)
      .then(({ count }) => { if (count != null) setAnsweredCount(count) })

    // Subscribe to new answers for this question
    if (chanRef.current) void supabase.removeChannel(chanRef.current)
    const ch = supabase.channel(`admin-answers:${room.id}:${questionIndex}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'room_answers',
        filter: `room_id=eq.${room.id}`,
      }, payload => {
        if ((payload.new as { question_index: number }).question_index === questionIndex) {
          setAnsweredCount(c => c + 1)
        }
      })
      .subscribe()
    chanRef.current = ch

    return () => { if (chanRef.current) void supabase.removeChannel(chanRef.current) }
  }, [questionIndex, room.id])

  // ── Timer countdown — tự động chuyển leaderboard khi hết giờ ──
  // Dùng ref thay vì state để tránh stale closure khi gọi onShowLeaderboard
  const shownLeaderboardRef = useRef(false)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    shownLeaderboardRef.current = false
    setAutoAdvanced(false)

    const startedAt = room.current_question_started_at
      ? new Date(room.current_question_started_at).getTime()
      : Date.now()
    const limitMs = room.question_time_limit_s * 1000

    const tick = () => {
      const elapsed   = Date.now() - startedAt
      const remaining = Math.max(0, Math.ceil((limitMs - elapsed) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0 && !shownLeaderboardRef.current) {
        shownLeaderboardRef.current = true
        setAutoAdvanced(true)
        // Gọi trực tiếp — không dùng setTimeout để tránh race condition
        onShowLeaderboard()
      }
    }
    tick()
    timerRef.current = setInterval(tick, 500)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (nextStepRef.current) { clearTimeout(nextStepRef.current); nextStepRef.current = null }
    }
  }, [questionIndex, room.current_question_started_at]) // eslint-disable-line react-hooks/exhaustive-deps

  const answeredPct = totalActive > 0 ? Math.round((answeredCount / totalActive) * 100) : 0
const timerPct = Math.max(0, (timeLeft / room.question_time_limit_s) * 100)
  const timerColor = timeLeft > 10 ? BRAND : timeLeft > 5 ? '#f59e0b' : '#ef4444'

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-4 pt-5 pb-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin · Đang điều phối
            </p>
            <p className="font-black text-white" style={{ fontSize: '18px' }}>
              Câu {questionIndex + 1}
              <span style={{ color: '#555', fontWeight: 400, fontSize: '14px' }}>/{totalQuestions}</span>
            </p>
          </div>

          {/* Timer circle */}
          <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="#1f1f1f" strokeWidth="5" />
              <circle cx="32" cy="32" r="26" fill="none"
                stroke={timerColor} strokeWidth="5"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - timerPct / 100)}`}
                style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }} />
            </svg>
            <span className="font-black" style={{ fontSize: '20px', color: timerColor, position: 'relative', zIndex: 1 }}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Answered progress */}
        <div className="flex items-center justify-between mb-1.5">
          <p style={{ fontSize: '11px', color: '#666' }}>
            Đã trả lời: <span style={{ color: '#fff', fontWeight: 700 }}>{answeredCount}</span>/{totalActive} người
          </p>
          <p style={{ fontSize: '11px', color: '#555' }}>{answeredPct}%</p>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-all duration-300"
               style={{ width: `${answeredPct}%`, background: `linear-gradient(90deg, #10b981, #059669)` }} />
        </div>
      </div>

      {/* ── Question preview ── */}
      <div className="shrink-0 mx-4 mt-3 px-4 py-3 rounded-xl"
           style={{ background: '#111', border: '1px solid #1f1f1f' }}>
        <p style={{ fontSize: '11px', color: '#555', marginBottom: 4 }}>Câu hỏi đang chạy</p>
        <p className="text-white font-semibold leading-snug" style={{ fontSize: '13px' }}>
          {question.question_text}
        </p>
        {/* Options */}
        <div className="grid grid-cols-2 gap-1.5 mt-2">
          {(question.options as string[]).map((opt, i) => (
            <div key={i}
                 className="px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
                 style={{
                   background: i === question.correct_index ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                   border: i === question.correct_index ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)',
                   color: i === question.correct_index ? '#10b981' : '#777',
                 }}>
              <span>{String.fromCharCode(65 + i)}.</span>
              <span className="truncate">{opt}</span>
              {i === question.correct_index && <span className="ml-auto shrink-0">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Live Leaderboard ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
          🏆 Xếp hạng realtime
        </p>
        {sorted.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-8">Chưa có người chơi...</p>
        )}
        {sorted.map((p, i) => (
          <div key={p.id}
               className="flex items-center gap-3 rounded-xl px-3.5 py-3"
               style={{ background: '#111', border: '1px solid #1a1a1a' }}>
            {/* Rank */}
            <div className="shrink-0 w-7 text-center">
              {i < 3
                ? <span style={{ fontSize: '18px' }}>{MEDALS[i]}</span>
                : <span className="font-black" style={{ fontSize: '13px', color: '#444' }}>#{i + 1}</span>}
            </div>
            {/* Avatar + name */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                 style={{ background: `${BRAND}22`, color: BRAND }}>
              {p.display_name?.[0]?.toUpperCase() || '?'}
            </div>
            <p className="flex-1 font-medium text-white truncate" style={{ fontSize: '13px' }}>
              {p.display_name || 'Người chơi'}
            </p>
            {/* Stats */}
            <div className="flex items-center gap-2.5 shrink-0">
              <span style={{ fontSize: '10px', color: '#555' }}>{p.correct_count}✓</span>
              <span className="font-black" style={{ fontSize: '15px', color: '#fff' }}>{p.score}đ</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer: chỉ nút bỏ qua + kết thúc sớm — tự động chuyển khi hết giờ ── */}
      <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2"
           style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        {/* Hiển thị trạng thái đang tự động */}
        {autoAdvanced ? (
          <div className="w-full py-3.5 rounded-2xl text-center font-bold"
               style={{ fontSize: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            ⏳ Đang chuyển bảng xếp hạng...
          </div>
        ) : (
          <button
            onClick={onShowLeaderboard}
            disabled={autoAdvanced}
            className="w-full font-black text-white rounded-2xl py-3.5 transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ fontSize: '14px', background: `rgba(233,78,27,0.15)`, border: `1px solid ${BRAND}66`, color: BRAND }}>
            ⏩ Chuyển ngay → xếp hạng
          </button>
        )}
        <button
          onClick={onEndGame}
          className="w-full py-2.5 rounded-xl font-bold transition-all"
          style={{ fontSize: '12px', color: '#555', background: 'transparent', border: '1px solid #222' }}>
          Kết thúc sớm
        </button>
      </div>
    </div>
  )
}
