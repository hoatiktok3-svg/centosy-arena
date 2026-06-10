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
import AIQuestionGenerator from '../components/room/AIQuestionGenerator'
import RoomInviteModal from '../components/room/RoomInviteModal'
import AdminGameView from '../components/room/AdminGameView'
import QuestionUploader from '../components/room/QuestionUploader'
import QuestionBankImportModal from '../components/room/QuestionBankImportModal'

interface Props {
  onClose: () => void
  /** Mã phòng được điền sẵn (từ lời mời) — tự chuyển màn hình join */
  initialCode?: string
}

// ── Join by code (Player) ──────────────────────────────────────
function JoinRoomView({
  onJoined, onClose, initialCode: preCode,
}: {
  onJoined: (room: GameRoom) => void
  onClose: () => void
  initialCode?: string
}) {
  const { currentUser } = useAuth()
  const [code, setCode] = useState(preCode ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Nếu được truyền mã phòng sẵn, tự động bấm join
  useEffect(() => {
    if (preCode && preCode.length === 6) {
      void handleJoin(preCode)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleJoin = async (overrideCode?: string) => {
    const trimmed = (overrideCode ?? code).trim().toUpperCase()
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
      // Fetch profile display_name for proper name (avoid leaking email in leaderboard)
      const { data: profile } = await supabase
        .from('profiles').select('display_name').eq('id', currentUser!.id).single()
      const displayName = profile?.display_name
        || currentUser!.name
        || currentUser!.email!.split('@')[0]
      // Join room_players
      await supabase.from('room_players').upsert({
        room_id:      room.id,
        user_id:      currentUser!.id,
        display_name: displayName,
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
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [showAIGen, setShowAIGen]             = useState(false)
  const [showUploader, setShowUploader]       = useState(false)
  const [showBankImport, setShowBankImport]   = useState(false)

  const loadSets = () => {
    void supabase.from('question_sets').select('id,title,description,is_active').eq('is_active', true)
      .then(({ data }) => { if (data) setQuestionSets(data as QuestionSet[]) })
  }

  useEffect(() => { loadSets() }, [])

  const handleCreate = async () => {
    if (!title.trim()) { setError('Nhập tên buổi chơi.'); return }
    setLoading(true); setError('')
    try {
      // Generate room code via RPC, fallback to client-side if RPC unavailable
      const { data: rpcCode } = await supabase.rpc('generate_room_code')
      const code: string = rpcCode as string
        || Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
      const { data: room, error: e } = await supabase
        .from('game_rooms')
        .insert({
          code,
          title:                  title.trim(),
          created_by:             currentUser!.id,
          question_set_id:        selectedSet || null,
          question_time_limit_s:  timeLimitS,
          status:                 'waiting',
          total_questions:        0,
        })
        .select()
        .single()
      if (e || !room) { setError(`Tạo phòng thất bại: ${e?.message ?? 'Lỗi không xác định'}`); return }
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
          {/* AI Generator + Upload + Question Bank buttons */}
          <div className="mt-2 mb-1 grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowAIGen(true)}
              className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}>
              <span className="text-lg">🤖</span>
              <p className="font-bold text-xs">Tạo AI</p>
              <p className="text-xs opacity-60 leading-tight">Nhập chủ đề</p>
            </button>
            <button
              onClick={() => setShowUploader(true)}
              className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
              <span className="text-lg">📂</span>
              <p className="font-bold text-xs">Tải file</p>
              <p className="text-xs opacity-60 leading-tight">JSON / CSV</p>
            </button>
            <button
              onClick={() => setShowBankImport(true)}
              className="flex flex-col items-start gap-1 px-3 py-3 rounded-xl transition-all active:scale-95"
              style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15' }}>
              <span className="text-lg">📚</span>
              <p className="font-bold text-xs">Ngân hàng</p>
              <p className="text-xs opacity-60 leading-tight">200 câu có sẵn</p>
            </button>
          </div>

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
                Chưa có bộ câu hỏi nào. Tạo trong Game Library hoặc dùng AI.
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

      {showAIGen && (
        <AIQuestionGenerator
          onClose={() => setShowAIGen(false)}
          onCreated={(setId, setTitle) => {
            setShowAIGen(false)
            setSelectedSet(setId)
            loadSets()
            void setTitle // mark used
          }}
        />
      )}
      {showUploader && (
        <QuestionUploader
          onClose={() => setShowUploader(false)}
          onCreated={(setId, setTitle) => {
            setShowUploader(false)
            setSelectedSet(setId)
            loadSets()
            void setTitle // mark used
          }}
        />
      )}
      {showBankImport && (
        <QuestionBankImportModal
          onClose={() => setShowBankImport(false)}
          onCreated={(setId, setTitle) => {
            setShowBankImport(false)
            setSelectedSet(setId)
            loadSets()
            void setTitle // mark used
          }}
        />
      )}
    </div>
  )
}

// ── Main: GameRoomPage ─────────────────────────────────────────
type Screen = 'landing' | 'create' | 'join' | 'lobby' | 'question' | 'leaderboard' | 'result'

export default function GameRoomPage({ onClose, initialCode }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const [screen, setScreen]           = useState<Screen>('landing')
  const [showHistory, setShowHistory] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [showInvite, setShowInvite]   = useState(false)
  const [showSetPicker, setShowSetPicker]       = useState(false)
  const [setPickerSets, setSetPickerSets]       = useState<QuestionSet[]>([])
  const [showLobbyBankImport, setShowLobbyBankImport] = useState(false)
  const [startError, setStartError]   = useState('')
  const [room, setRoom]           = useState<GameRoom | null>(null)
  const [players, setPlayers]     = useState<RoomPlayer[]>([])
  const [questions, setQuestions] = useState<RoomQuestion[]>([])
  const [myAnswer, setMyAnswer]   = useState<number | null>(null)
  const channelRef                = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pollPlayersRef            = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRoomRef               = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Auto-navigate to join screen when initialCode is provided ──
  useEffect(() => {
    if (initialCode && !isAdmin) {
      setScreen('join')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    // Polling fallback for room_players (RLS may block postgres_changes)
    if (pollPlayersRef.current) clearInterval(pollPlayersRef.current)
    pollPlayersRef.current = setInterval(() => {
      void supabase.from('room_players').select('*').eq('room_id', roomId)
        .then(({ data }) => { if (data) setPlayers(data as RoomPlayer[]) })
    }, 3000)

    // Polling fallback for game_rooms status (RLS blocks realtime for players)
    // Without this, players stay stuck in lobby when admin starts the game
    if (pollRoomRef.current) clearInterval(pollRoomRef.current)
    pollRoomRef.current = setInterval(() => {
      void supabase.from('game_rooms').select('*').eq('id', roomId).single()
        .then(({ data }) => { if (data) setRoom(data as GameRoom) })
    }, 2000)
  }, [])

  // ── Load questions when room started ─────────────────────
  useEffect(() => {
    if (!room?.question_set_id) return
    void supabase.from('room_questions').select('*').eq('question_set_id', room.question_set_id).order('sort_order')
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
      const sorted = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)
      sorted.forEach((p, i) => {
        void supabase.from('room_players').update({ final_rank: i + 1 }).eq('id', p.id)
      })
    }
    // FIX: fetch fresh player data để tránh stale closure của `me`
    // (players state có thể chưa cập nhật khi effect chạy lần đầu)
    if (!isAdmin && currentUser) {
      void supabase.from('room_players')
        .select('score').eq('room_id', room.id).eq('user_id', currentUser.id).single()
        .then(({ data }) => {
          const freshScore = data?.score ?? 0
          if (freshScore > 0) {
            void supabase.rpc('add_game_score_safe', {
              p_user_id:  currentUser.id,
              p_score:    freshScore,
              p_game_key: 'realtime_room',
              p_date:     new Date().toISOString().slice(0, 10),
            }).then(undefined, () => {/* RPC may not exist yet — silent fail */})
          }
        })
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
    } else if (room.status === 'showing_leaderboard') {
      setScreen('leaderboard')
    } else if (room.status === 'finished') {
      if (pollPlayersRef.current) { clearInterval(pollPlayersRef.current); pollPlayersRef.current = null }
      if (pollRoomRef.current)    { clearInterval(pollRoomRef.current);    pollRoomRef.current    = null }
      setScreen('result')
    } else if (room.status === 'cancelled') {
      // Someone cancelled — go back to landing
      if (pollPlayersRef.current) { clearInterval(pollPlayersRef.current); pollPlayersRef.current = null }
      if (pollRoomRef.current)    { clearInterval(pollRoomRef.current);    pollRoomRef.current    = null }
      if (channelRef.current) void supabase.removeChannel(channelRef.current)
      setRoom(null); setPlayers([]); setScreen('landing')
    }
  }, [room?.status, room?.current_question_index])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Player lobby: aggressive poll every 1.5s until game starts ──
  // Supabase Realtime postgres_changes is blocked by RLS for regular users.
  // This effect is the PRIMARY mechanism for players to detect game start.
  useEffect(() => {
    if (screen !== 'lobby' || !room?.id || isAdmin) return
    const roomId = room.id
    const interval = setInterval(() => {
      void supabase.from('game_rooms').select('*').eq('id', roomId).single()
        .then(({ data, error }) => {
          if (data && !error) {
            setRoom(data as GameRoom)
          }
        })
    }, 1500)
    return () => clearInterval(interval)
  }, [screen, room?.id, isAdmin])  // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Admin: Open question set picker from lobby ───────────
  const openSetPicker = () => {
    void supabase.from('question_sets').select('id,title,description,is_active').eq('is_active', true)
      .then(({ data }) => { if (data) setSetPickerSets(data as QuestionSet[]) })
    setShowSetPicker(true)
  }
  const handlePickSet = async (setId: string) => {
    if (!room) return
    // Fetch question count
    const { count } = await supabase
      .from('room_questions').select('id', { count: 'exact', head: true })
      .eq('question_set_id', setId)
    const { data: updatedRoom } = await supabase
      .from('game_rooms')
      .update({ question_set_id: setId, total_questions: count ?? 0 })
      .eq('id', room.id)
      .select().single()
    if (updatedRoom) setRoom(updatedRoom as GameRoom)
    else setRoom(prev => prev ? { ...prev, question_set_id: setId, total_questions: count ?? 0 } : null)
    setShowSetPicker(false)
    setStartError('')
  }

  // ── Admin: Add simulated bot players ─────────────────────
  const handleAddBots = async () => {
    if (!room) return
    const bots = [
      { display_name: '🤖 Bot Minh', score: 0 },
      { display_name: '🤖 Bot Lan',  score: 0 },
      { display_name: '🤖 Bot Tuấn', score: 0 },
    ]
    // UUID polyfill cho HTTP (crypto.randomUUID chỉ hoạt động trên HTTPS)
    const genUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
    })
    for (const bot of bots) {
      const fakeId = genUUID()
      await supabase.from('room_players').insert({
        room_id:      room.id,
        user_id:      fakeId,
        display_name: bot.display_name,
        is_active:    true,
        score:  bot.score,
        correct_count: 0,
      })
    }
    // Refresh players
    void supabase.from('room_players').select('*').eq('room_id', room.id)
      .then(({ data }) => { if (data) setPlayers(data as RoomPlayer[]) })
  }

  // ── Admin: Start game ─────────────────────────────────────
  const handleStart = async () => {
    if (!room) return
    if (!room.question_set_id) {
      setStartError('⚠️ Vui lòng chọn bộ câu hỏi trước khi bắt đầu!')
      return
    }
    if (questions.length === 0) {
      // Try loading questions first
      const { data: qs } = await supabase
        .from('room_questions').select('*')
        .eq('question_set_id', room.question_set_id)
        .order('sort_order')
      if (!qs || qs.length === 0) {
        setStartError('⚠️ Bộ câu hỏi trống! Thêm câu hỏi trước.')
        return
      }
      setQuestions(qs as RoomQuestion[])
    }
    setStartError('')
    const startedAt = new Date().toISOString()
    await supabase.from('game_rooms').update({
      status:                        'playing',
      current_question_index:        0,
      current_question_started_at:   startedAt,
    }).eq('id', room.id)
    // Cập nhật local state ngay lập tức (không chờ realtime vì RLS có thể chặn SELECT)
    setRoom(prev => prev ? { ...prev, status: 'playing', current_question_index: 0, current_question_started_at: startedAt } : null)
  }

  // ── Admin: Khi hết giờ / bấm chuyển → hiện leaderboard ────
  const handleShowLeaderboard = async () => {
    if (!room || !isAdmin) return
    await supabase.from('game_rooms').update({ status: 'showing_leaderboard' }).eq('id', room.id)
    setRoom(prev => prev ? { ...prev, status: 'showing_leaderboard' } : null)
  }

  // ── Admin: Advance to next question / show leaderboard ───
  const handleNextQuestion = async () => {
    if (!room) return
    const nextIndex = room.current_question_index + 1
    if (nextIndex >= (room.total_questions || questions.length)) {
      // Game finished
      const endedAt = new Date().toISOString()
      await supabase.from('game_rooms').update({ status: 'finished', ended_at: endedAt }).eq('id', room.id)
      setRoom(prev => prev ? { ...prev, status: 'finished', ended_at: endedAt } : null)
    } else {
      const nextStartedAt = new Date().toISOString()
      await supabase.from('game_rooms').update({
        status:                       'playing',
        current_question_index:       nextIndex,
        current_question_started_at:  nextStartedAt,
      }).eq('id', room.id)
      setRoom(prev => prev ? { ...prev, status: 'playing', current_question_index: nextIndex, current_question_started_at: nextStartedAt } : null)
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
    // FIX: kiểm tra câu hỏi tồn tại TRƯỚC khi lock UI — tránh player bị khoá mà không submit được
    const q = questions[room.current_question_index]
    if (!q) return
    answerSubmittingRef.current = true
    setMyAnswer(optionIndex)
    const isCorrect    = optionIndex === q.correct_index
    const timeFrac     = Math.max(0, 1 - responseTimeMs / (room.question_time_limit_s * 1000))
    const basePoints   = 100  // mỗi câu đúng = 100 điểm
    const speedBonus   = Math.floor(timeFrac * basePoints * 0.5)
    const pointsEarned = isCorrect ? basePoints + speedBonus : 0

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

  const stopPolling = () => {
    if (pollPlayersRef.current) { clearInterval(pollPlayersRef.current); pollPlayersRef.current = null }
    if (pollRoomRef.current)    { clearInterval(pollRoomRef.current);    pollRoomRef.current    = null }
  }

  const handleCancel = async () => {
    if (room && isAdmin) {
      await supabase.from('game_rooms').update({ status: 'cancelled' }).eq('id', room.id)
    }
    stopPolling()
    if (channelRef.current) void supabase.removeChannel(channelRef.current)
    setRoom(null); setPlayers([]); setScreen('landing')
  }

  const handleLeave = async () => {
    // FIX: admin không có room_players row → chỉ cập nhật DB khi là player thường
    if (room && currentUser && !isAdmin) {
      await supabase.from('room_players').update({ is_active: false })
        .eq('room_id', room.id).eq('user_id', currentUser.id)
    }
    stopPolling()
    if (channelRef.current) void supabase.removeChannel(channelRef.current)
    setRoom(null); setPlayers([]); setScreen('landing')
  }

  const me = players.find(p => p.user_id === currentUser?.id)
  const currentQ = questions[room?.current_question_index ?? 0]
  const sortedPlayers = [...players].filter(p => p.is_active).sort((a, b) => b.score - a.score)
  const myRank = me ? sortedPlayers.findIndex(p => p.user_id === currentUser?.id) + 1 : null

  // ── Screens ───────────────────────────────────────────────
  if (screen === 'create') {
    return <CreateRoomView onCreated={handleRoomCreated} onClose={() => setScreen('landing')} />
  }
  if (screen === 'join') {
    return <JoinRoomView onJoined={handleRoomJoined} onClose={() => setScreen('landing')} initialCode={initialCode} />
  }
  if (screen === 'lobby' && room) {
    return (
      <>
        <RoomLobby room={room} players={players} myUserId={currentUser?.id ?? ''} isAdmin={isAdmin}
          onStart={() => void handleStart()} onCancel={() => void handleCancel()} onLeave={() => void handleLeave()}
          onInvite={isAdmin ? () => setShowInvite(true) : undefined}
          onSelectSet={isAdmin ? openSetPicker : undefined}
          onAddBots={isAdmin ? () => void handleAddBots() : undefined}
          startError={startError} />
        {showInvite && (
          <RoomInviteModal
            roomId={room.id}
            roomCode={room.code}
            roomTitle={room.title}
            onClose={() => setShowInvite(false)}
          />
        )}
        {/* Question Set Picker Modal */}
        {showSetPicker && (
          <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#080808' }}>
            <div className="shrink-0 px-4 pt-5 pb-4 flex items-center gap-3"
                 style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button onClick={() => setShowSetPicker(false)}
                      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{ background: '#141414', border: '1px solid #222' }}>
                <span style={{ fontSize: '16px', color: '#888' }}>←</span>
              </button>
              <div>
                <p className="font-black text-white" style={{ fontSize: '15px' }}>📚 Chọn bộ câu hỏi</p>
                <p style={{ fontSize: '11px', color: '#555' }}>Chọn cho phòng: {room.title}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
              {/* Nút import từ question_bank — luôn hiện */}
              <button
                onClick={() => setShowLobbyBankImport(true)}
                className="w-full text-left px-4 py-3 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-3"
                style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.25)' }}>
                <span style={{ fontSize: '20px' }}>📚</span>
                <div>
                  <p className="font-bold" style={{ fontSize: '13px', color: '#facc15' }}>Import từ Ngân hàng câu hỏi</p>
                  <p style={{ fontSize: '11px', color: '#666', marginTop: 2 }}>Chọn câu từ 200+ câu đã import</p>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '16px', color: '#555' }}>→</span>
              </button>
              {setPickerSets.length === 0 && (
                <div className="text-center py-6">
                  <p style={{ fontSize: '13px', color: '#555' }}>Chưa có bộ câu hỏi đã tạo.</p>
                  <p style={{ fontSize: '12px', color: '#444', marginTop: 4 }}>
                    Dùng "Ngân hàng câu hỏi" ở trên hoặc tạo bằng AI.
                  </p>
                </div>
              )}
              {setPickerSets.map(qs => (
                <button key={qs.id}
                  onClick={() => void handlePickSet(qs.id)}
                  className="w-full text-left px-4 py-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{
                    background: room.question_set_id === qs.id ? 'rgba(233,78,27,0.1)' : '#141414',
                    border: `1px solid ${room.question_set_id === qs.id ? 'rgba(233,78,27,0.4)' : '#222'}`,
                  }}>
                  <p className="font-bold text-white" style={{ fontSize: '14px' }}>{qs.title}</p>
                  {qs.description && <p style={{ fontSize: '11px', color: '#666', marginTop: 3 }}>{qs.description}</p>}
                  {room.question_set_id === qs.id && (
                    <span style={{ fontSize: '10px', color: '#E94E1B', fontWeight: 700 }}>✓ Đang chọn</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Lobby: QuestionBankImportModal */}
        {showLobbyBankImport && (
          <QuestionBankImportModal
            onClose={() => setShowLobbyBankImport(false)}
            onCreated={(setId) => {
              setShowLobbyBankImport(false)
              setShowSetPicker(false)
              void handlePickSet(setId)
            }}
          />
        )}
      </>
    )
  }
  if (screen === 'question' && room) {
    if (!currentQ) {
      // Câu hỏi chưa load — hiện spinner / lỗi thay vì fall-through về landing
      return (
        <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-4"
             style={{ background: '#080808' }}>
          {room.question_set_id ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                   style={{ borderColor: '#E94E1B', borderTopColor: 'transparent' }} />
              <p style={{ fontSize: '13px', color: '#555' }}>Đang tải câu hỏi...</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '32px' }}>⚠️</p>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Chưa chọn bộ câu hỏi</p>
              <p style={{ fontSize: '12px', color: '#555' }}>Game đã bắt đầu nhưng không có câu hỏi nào.</p>
              {isAdmin && (
                <button
                  onClick={() => void supabase.from('game_rooms').update({ status: 'cancelled' }).eq('id', room.id)}
                  className="mt-2 px-5 py-2.5 rounded-xl font-bold"
                  style={{ fontSize: '13px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                  Huỷ phòng & quay lại
                </button>
              )}
            </>
          )}
        </div>
      )
    }
    // Admin sees live leaderboard + question control panel
    if (isAdmin) {
      return <AdminGameView
        room={room}
        players={players}
        question={currentQ}
        questionIndex={room.current_question_index}
        totalQuestions={room.total_questions || questions.length}
        onShowLeaderboard={() => void handleShowLeaderboard()}
        onEndGame={async () => {
          const endedAt = new Date().toISOString()
          await supabase.from('game_rooms').update({ status: 'finished', ended_at: endedAt }).eq('id', room.id)
          setRoom(prev => prev ? { ...prev, status: 'finished', ended_at: endedAt } : null)
        }}
      />
    }
    // Players see the question
    return <QuestionDisplay room={room} question={currentQ}
      questionIndex={room.current_question_index}
      totalQuestions={room.total_questions || questions.length}
      myAnswer={myAnswer} onAnswer={(i, ms) => void handleAnswer(i, ms)}
      currentScore={me?.score ?? 0}
      myRank={myRank} />
  }
  if (screen === 'leaderboard' && room) {
    return <LiveLeaderboard players={players} myUserId={currentUser?.id ?? ''}
      questionIndex={room.current_question_index}
      totalQuestions={room.total_questions || questions.length}
      autoNextMs={5000}
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
