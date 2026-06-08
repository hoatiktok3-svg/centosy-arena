/**
 * GameRoomPage — STEP 95
 * Admin: tạo phòng, chọn bộ câu hỏi, quản lý game
 * Player: nhập mã phòng, chờ, chơi
 * Realtime: Supabase postgres_changes on game_rooms + room_players + room_answers
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'
import { GameRoom, RoomPlayer, RoomQuestion, QuestionSet } from '../components/room/roomTypes'
import RoomLobby from '../components/room/RoomLobby'
import QuestionDisplay from '../components/room/QuestionDisplay'
import LiveLeaderboard from '../components/room/LiveLeaderboard'
import RoomResult from '../components/room/RoomResult'
import RoomHistory from '../components/room/RoomHistory'
import GameLibraryPage from './GameLibraryPage'

interface Props {
  onClose: () => void
}

// ── Join by code (Player) ──────────────────────────────────────
function JoinRoomView({
  onJoined, onClose,
}: {
  onJoined: (room: GameRoom) => void
  onClose: () => void
}) {
  const { currentUser } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length !== 6) { setError('Mã phòng gồm 6 ký tự.'); return }
    setLoading(true); setError('')
    try {
      const { data: room, error: e } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', trimmed)
        .in('status', ['waiting', 'playing'])
        .single()
      if (e || !room) { setError('Không tìm thấy phòng. Kiểm tra lại mã.'); return }
      // Join room_players
      await supabase.from('room_players').upsert({
        room_id:      room.id,
        user_id:      currentUser!.id,
        display_name: currentUser!.fullName || currentUser!.email,
        is_active:    true,
      }, { onConflict: 'room_id,user_id' })
      onJoined(room as GameRoom)
    } catch {
      setError('Lỗi kết nối. Thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div>
          <p className="font-black text-white" style={{ fontSize: '15px' }}>Vào phòng chơi</p>
          <p style={{ fontSize: '11px', color: '#555' }}>Nhập mã phòng từ Admin</p>
        </div>
      </div>

      <div className="flex-1 px-4 pt-10 flex flex-col items-center gap-6">
        <div className="text-center">
          <p style={{ fontSize: '40px', marginBottom: 8 }}>🎯</p>
          <p className="font-black text-white" style={{ fontSize: '20px' }}>Nhập mã phòng</p>
          <p style={{ fontSize: '13px', color: '#555', marginTop: 6 }}>
            Admin sẽ gửi mã 6 ký tự cho bạn
          </p>
        </div>

        <div className="w-full max-w-xs">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="VD: ABC123"
            maxLength={6}
            className="w-full text-center font-black rounded-2xl px-4 py-4"
            style={{
              fontSize: '28px', letterSpacing: '0.3em',
              background: '#141414', border: '1px solid #333', color: '#fff',
              outline: 'none',
            }}
            onKeyDown={e => e.key === 'Enter' && void handleJoin()}
          />
        </div>

        {error && (
          <div className="w-full max-w-xs rounded-xl px-4 py-3 text-center"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
          </div>
        )}

        <button
          onClick={() => void handleJoin()}
          disabled={loading || code.length !== 6}
          className="w-full max-w-xs font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }}>
          {loading ? 'Đang vào...' : 'Vào phòng →'}
        </button>
      </div>
    </div>
  )
}

// ── Admin: Create Room ──────────────────────────────────────────
function CreateRoomView({
  onCreated, onClose,
}: {
  onCreated: (room: GameRoom) => void
  onClose:   () => void
}) {
  const { currentUser } = useAuth()
  const [title, setTitle]     = useState('Buổi thi kiến thức')
  const [timeLimitS, setTimeLimitS] = useState(15)
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [selectedSet, setSelectedSet]   = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    void supabase.from('question_sets').select('id,title,description,is_active').eq('is_active', true)
      .then(({ data }) => {
        if (data) setQuestionSets(data as QuestionSet[])
      })
  }, [])

  const handleCreate = async () => {
    if (!title.trim()) { setError('Nhập tên buổi chơi.'); return }
    setLoading(true); setError('')
    try {
      // Generate room code via RPC
      const { data: code } = await supabase.rpc('generate_room_code')
      const { data: room, error: e } = await supabase
        .from('game_rooms')
        .insert({
          code:                   code as string,
          title:                  title.trim(),
          created_by:             currentUser!.id,
          question_set_id:        selectedSet || null,
          question_time_limit_s:  timeLimitS,
          status:                 'waiting',
          total_questions:        0,
        })
        .select()
        .single()
      if (e || !room) { setError('Tạo phòng thất bại. Thử lại.'); return }
      onCreated(room as GameRoom)
    } catch {
      setError('Lỗi kết nối.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div>
          <p className="font-black text-white" style={{ fontSize: '15px' }}>👑 Tạo phòng chơi</p>
          <p style={{ fontSize: '11px', color: '#555' }}>Admin tạo và quản lý phòng</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        {/* Title */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Tên buổi chơi
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="VD: Quiz tháng 6"
            className="w-full rounded-2xl px-4 py-3 mt-2 text-white"
            style={{ background: '#141414', border: '1px solid #333', fontSize: '14px', outline: 'none' }}
          />
        </div>

        {/* Time limit */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Thời gian mỗi câu: {timeLimitS}s
          </label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[10, 15, 20, 30].map(s => (
              <button key={s} onClick={() => setTimeLimitS(s)}
                className="px-4 py-2 rounded-xl font-bold transition-all"
                style={{ fontSize: '13px', background: timeLimitS === s ? 'rgba(233,78,27,0.2)' : '#141414', border: `1px solid ${timeLimitS === s ? 'rgba(233,78,27,0.5)' : '#333'}`, color: timeLimitS === s ? '#E94E1B' : '#888' }}>
                {s}s
              </button>
            ))}
          </div>
        </div>

        {/* Question set */}
        <div>
          <label style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Bộ câu hỏi (tuỳ chọn)
          </label>
          <div className="mt-2 flex flex-col gap-2">
            <button onClick={() => setSelectedSet('')}
              className="w-full text-left px-4 py-2.5 rounded-xl"
              style={{ background: !selectedSet ? 'rgba(233,78,27,0.1)' : '#141414', border: `1px solid ${!selectedSet ? 'rgba(233,78,27,0.4)' : '#333'}`, fontSize: '13px', color: !selectedSet ? '#E94E1B' : '#888' }}>
              Chưa chọn (thêm sau)
            </button>
            {questionSets.map(qs => (
              <button key={qs.id} onClick={() => setSelectedSet(qs.id)}
                className="w-full text-left px-4 py-2.5 rounded-xl"
                style={{ background: selectedSet === qs.id ? 'rgba(233,78,27,0.1)' : '#141414', border: `1px solid ${selectedSet === qs.id ? 'rgba(233,78,27,0.4)' : '#333'}`, fontSize: '13px', color: selectedSet === qs.id ? '#E94E1B' : '#ccc' }}>
                {qs.title}
              </button>
            ))}
            {questionSets.length === 0 && (
              <p style={{ fontSize: '12px', color: '#555', paddingLeft: 4 }}>
                Chưa có bộ câu hỏi nào. Tạo trong Game Library.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-8 pt-3" style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        <button
          onClick={() => void handleCreate()}
          disabled={loading}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }}>
          {loading ? 'Đang tạo...' : '+ Tạo phòng'}
        </button>
      </div>
    </div>
  )
}

// ── Main: GameRoomPage ─────────────────────────────────────────
type Screen = 'landing' | 'create' | 'join' | 'lobby' | 'question' | 'leaderboard' | 'result'

export default function GameRoomPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const [screen, setScreen]           = useState<Screen>('landing')
  const [showHistory, setShowHistory] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [room, setRoom]           = useState<GameRoom | null>(null)
  const [players, setPlayers]     = useState<RoomPlayer[]>([])
  const [questions, setQuestions] = useState<RoomQuestion[]>([])
  const [myAnswer, setMyAnswer]   = useState<number | null>(null)
  const channelRef                = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const autoAdvanceRef            = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Subscribe to room realtime ────────────────────────────
  const subscribeRoom = useCallback((roomId: string) => {
    if (channelRef.current) { void supabase.removeChannel(channelRef.current) }
    const ch = supabase.channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, payload => {
        setRoom(prev => prev ? { ...prev, ...(payload.new as Partial<GameRoom>) } : null)
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'room_players',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        void supabase.from('room_players').select('*').eq('room_id', roomId)
          .then(({ data }) => { if (data) setPlayers(data as RoomPlayer[]) })
      })
      .subscribe()
    channelRef.current = ch
  }, [])

  // ── Load questions when room started ─────────────────────
  useEffect(() => {
    if (!room?.question_set_id) return
    void supabase.from('questions').select('*').eq('set_id', room.question_set_id).order('order_index')
      .then(({ data }) => {
        if (!data) return
        setQuestions(data as RoomQuestion[])
        // Sync total_questions in DB if admin
        if (isAdmin && data.length > 0 && room.total_questions !== data.length) {
          void supabase.from('game_rooms').update({ total_questions: data.length }).eq('id', room.id)
        }
      })
  }, [room?.question_set_id])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── STEP 101: Save final ranks + scores when game finishes ──
  const scoreSavedRef = useRef(false)
  useEffect(() => {
    if (!room || room.status !== 'finished' || scoreSavedRef.current) return
    scoreSavedRef.current = true
    // Admin updates final ranks
    if (isAdmin) {
      const sorted = [...players].filter(p => p.is_active).sort((a, b) => b.total_score - a.total_score)
      sorted.forEach((p, i) => {
        void supabase.from('room_players').update({ final_rank: i + 1 }).eq('id', p.id)
      })
    }
    // Each player saves their score to profiles via saveGameResultSafe
    if (me && me.total_score > 0) {
      void supabase.rpc('add_game_score_safe', {
        p_user_id: currentUser!.id,
        p_score:   me.total_score,
        p_game_key: 'realtime_room',
        p_date:     new Date().toISOString().slice(0, 10),
      }).catch(() => {/* RPC may not exist yet — silent fail */})
    }
  }, [room?.status])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync screen with room status ─────────────────────────
  useEffect(() => {
    if (!room) return
    if (room.status === 'waiting') {
      setScreen('lobby')
    } else if (room.status === 'playing') {
      setScreen('question')
      setMyAnswer(null)
      // Admin: auto-advance to showing_leaderboard after question time limit
      if (isAdmin && room.current_question_started_at) {
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current)
        const elapsed  = Date.now() - new Date(room.current_question_started_at).getTime()
        const remaining = Math.max(0, room.question_time_limit_s * 1000 - elapsed + 800) // +800ms buffer
        autoAdvanceRef.current = setTimeout(() => {
          void supabase.from('game_rooms').update({ status: 'showing_leaderboard' }).eq('id', room.id)
        }, remaining)
      }
    } else if (room.status === 'showing_leaderboard') {
      if (autoAdvanceRef.current) { clearTimeout(autoAdvanceRef.current); autoAdvanceRef.current = null }
      setScreen('leaderboard')
    } else if (room.status === 'finished') {
      setScreen('result')
    } else if (room.status === 'cancelled') {
      // Someone cancelled — go back to landing
      if (channelRef.current) void supabase.removeChannel(channelRef.current)
      setRoom(null); setPlayers([]); setScreen('landing')
    }
  }, [room?.status, room?.current_question_index])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoomCreated = (r: GameRoom) => {
    setRoom(r)
    setScreen('lobby')
    subscribeRoom(r.id)
    // Load initial players
    void supabase.from('room_players').select('*').eq('room_id', r.id)
      .then(({ data }) => { if (data) setPlayers(data as RoomPlayer[]) })
  }

  const handleRoomJoined = (r: GameRoom) => {
    setRoom(r)
    setScreen('lobby')
    subscribeRoom(r.id)
    void supabase.from('room_players').select('*').eq('room_id', r.id)
      .then(({ data }) => { if (data) setPlayers(data as RoomPlayer[]) })
  }

  // ── Admin: Start game ─────────────────────────────────────
  const handleStart = async () => {
    if (!room) return
    await supabase.from('game_rooms').update({
      status:                        'playing',
      current_question_index:        0,
      current_question_started_at:   new Date().toISOString(),
    }).eq('id', room.id)
  }

  // ── Admin: Advance to next question / show leaderboard ───
  const handleNextQuestion = async () => {
    if (!room) return
    const nextIndex = room.current_question_index + 1
    if (nextIndex >= room.total_questions) {
      // Game finished
      await supabase.from('game_rooms').update({ status: 'finished', finished_at: new Date().toISOString() }).eq('id', room.id)
    } else {
      await supabase.from('game_rooms').update({
        status:                       'playing',
        current_question_index:       nextIndex,
        current_question_started_at:  new Date().toISOString(),
      }).eq('id', room.id)
    }
  }

  // ── Admin: Advance leaderboard → next question (auto) ────
  const handleLeaderboardNext = async () => {
    if (!room || !isAdmin) return
    await handleNextQuestion()
  }

  // ── Player: Submit answer (STEP 99: chống bấm nhiều lần) ─
  const answerSubmittingRef = useRef(false)
  const handleAnswer = async (optionIndex: number, responseTimeMs: number) => {
    if (!room || !currentUser) return
    if (myAnswer !== null) return        // đã chọn rồi
    if (answerSubmittingRef.current) return  // đang submit
    if (room.status !== 'playing') return    // không phải lúc chơi
    answerSubmittingRef.current = true
    setMyAnswer(optionIndex)
    const q = questions[room.current_question_index]
    if (!q) return
    const isCorrect    = optionIndex === q.correct_index
    const timeFrac     = Math.max(0, 1 - responseTimeMs / (room.question_time_limit_s * 1000))
    const speedBonus   = Math.floor(timeFrac * q.points * 0.5)
    const pointsEarned = isCorrect ? q.points + speedBonus : 0

    await supabase.from('room_answers').insert({
      room_id:          room.id,
      question_index:   room.current_question_index,
      user_id:          currentUser.id,
      chosen_option:    optionIndex,
      is_correct:       isCorrect,
      response_time_ms: responseTimeMs,
      points_earned:    pointsEarned,
    })
    // Update room_players score via RPC
    await supabase.rpc('add_room_score_safe', {
      p_room_id:    room.id,
      p_user_id:    currentUser.id,
      p_points:     pointsEarned,
      p_is_correct: isCorrect,
    })
    answerSubmittingRef.current = false
  }

  const handleCancel = async () => {
    if (room && isAdmin) {
      await supabase.from('game_rooms').update({ status: 'cancelled' }).eq('id', room.id)
    }
    if (channelRef.current) void supabase.removeChannel(channelRef.current)
    setRoom(null); setPlayers([]); setScreen('landing')
  }

  const handleLeave = async () => {
    if (room && currentUser) {
      await supabase.from('room_players').update({ is_active: false })
        .eq('room_id', room.id).eq('user_id', currentUser.id)
    }
    if (channelRef.current) void supabase.removeChannel(channelRef.current)
    setRoom(null); setPlayers([]); setScreen('landing')
  }

  const me = players.find(p => p.user_id === currentUser?.id)
  const currentQ = questions[room?.current_question_index ?? 0]
  const sortedPlayers = [...players].filter(p => p.is_active).sort((a, b) => b.total_score - a.total_score)
  const myRank = me ? sortedPlayers.findIndex(p => p.user_id === currentUser?.id) + 1 : null

  // ── Screens ───────────────────────────────────────────────
  if (screen === 'create') {
    return <CreateRoomView onCreated={handleRoomCreated} onClose={() => setScreen('landing')} />
  }
  if (screen === 'join') {
    return <JoinRoomView onJoined={handleRoomJoined} onClose={() => setScreen('landing')} />
  }
  if (screen === 'lobby' && room) {
    return <RoomLobby room={room} players={players} myUserId={currentUser?.id ?? ''} isAdmin={isAdmin}
      onStart={() => void handleStart()} onCancel={() => void handleCancel()} onLeave={() => void handleLeave()} />
  }
  if (screen === 'question' && room && currentQ) {
    return <QuestionDisplay room={room} question={currentQ}
      questionIndex={room.current_question_index}
      totalQuestions={room.total_questions || questions.length}
      myAnswer={myAnswer} onAnswer={(i, ms) => void handleAnswer(i, ms)}
      currentScore={me?.total_score ?? 0}
      myRank={myRank} />
  }
  if (screen === 'leaderboard' && room) {
    return <LiveLeaderboard players={players} myUserId={currentUser?.id ?? ''}
      questionIndex={room.current_question_index}
      totalQuestions={room.total_questions || questions.length}
      autoNextMs={3000}
      onNextQuestion={() => void handleLeaderboardNext()}
      isAdmin={isAdmin} />
  }
  if (screen === 'result' && room) {
    return <RoomResult players={players} myUserId={currentUser?.id ?? ''}
      roomTitle={room.title} onClose={() => { void handleLeave(); onClose() }} />
  }

  // ── Landing ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: '#080808' }}>
      <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>
        <button onClick={onClose}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>
        <div>
          <p className="font-black text-white" style={{ fontSize: '15px' }}>🎯 Phòng Chơi Realtime</p>
          <p style={{ fontSize: '11px', color: '#555' }}>Chơi cùng nhau theo thời gian thực</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-8 flex flex-col gap-5">
        {/* Hero */}
        <div className="rounded-2xl p-6 text-center"
             style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.25)' }}>
          <p style={{ fontSize: '48px', marginBottom: 8 }}>🏟️</p>
          <p className="font-black text-white" style={{ fontSize: '20px' }}>Thi đấu trực tiếp</p>
          <p style={{ fontSize: '13px', color: '#888', marginTop: 8, lineHeight: 1.6 }}>
            Tất cả nhân viên trả lời cùng một câu hỏi theo thời gian thực. Điểm số & xếp hạng cập nhật tức thì.
          </p>
        </div>

        {/* Actions */}
        {isAdmin ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setScreen('create')}
              className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
              style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
              👑 Tạo phòng mới
            </button>
            <button
              onClick={() => setScreen('join')}
              className="w-full font-semibold rounded-2xl py-4 transition-all active:scale-[0.98]"
              style={{ fontSize: '14px', color: '#ccc', background: '#141414', border: '1px solid #333' }}>
              Vào phòng bằng mã
            </button>
          </div>
        ) : (
          <button
            onClick={() => setScreen('join')}
            className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
            style={{ fontSize: '15px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
            Vào phòng →
          </button>
        )}

        {/* Admin extra actions */}
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowHistory(true)}
                    className="flex-1 rounded-2xl py-3 font-semibold"
                    style={{ fontSize: '12px', color: '#888', background: '#141414', border: '1px solid #333' }}>
              📋 Lịch sử phòng
            </button>
            <button onClick={() => setShowLibrary(true)}
                    className="flex-1 rounded-2xl py-3 font-semibold"
                    style={{ fontSize: '12px', color: '#888', background: '#141414', border: '1px solid #333' }}>
              📚 Bộ câu hỏi
            </button>
          </div>
        )}

        {/* How it works */}
        <div className="rounded-2xl p-4"
             style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '11px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Cách chơi
          </p>
          {[
            { icon: '1️⃣', text: 'Admin tạo phòng, chia sẻ mã 6 ký tự' },
            { icon: '2️⃣', text: 'Nhân viên nhập mã, vào phòng chờ' },
            { icon: '3️⃣', text: 'Admin bắt đầu — tất cả cùng trả lời' },
            { icon: '4️⃣', text: 'Leaderboard sau mỗi câu, top 3 vinh danh' },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{step.icon}</span>
              <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.5 }}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {showHistory && <RoomHistory onClose={() => setShowHistory(false)} />}
      {showLibrary  && <GameLibraryPage onClose={() => setShowLibrary(false)} />}
    </div>
  )
}
