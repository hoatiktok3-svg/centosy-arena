import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'
import { mockGames, gameCategories, GameCategory, Game } from '../data/mockGames'
import { useGameVisibility } from '../hooks/useGameVisibility'
import DifficultCustomerIntro from '../components/games/DifficultCustomerIntro'
import DifficultCustomerGame, { GameAnswer } from '../components/games/DifficultCustomerGame'
import DifficultCustomerResult from '../components/games/DifficultCustomerResult'
import ProductQuizPage from './ProductQuizPage'
import TrainingLibraryPage from './TrainingLibraryPage'
import OnboardingPage from './OnboardingPage'
import GameLeaderboardPage from './GameLeaderboardPage'
import SeasonLeaderboardPage from './SeasonLeaderboardPage'
import DeptTournamentPage from './DeptTournamentPage'
import GameRoomPage from './GameRoomPage'
import TournamentBracketPage from './TournamentBracketPage'
import MyGameHistory from '../components/room/MyGameHistory'
import LuckySpinPage from './LuckySpinPage'
import LucChienLeaderboardPage from './LucChienLeaderboardPage'

const BRAND = '#E94E1B'

const ORG_MAP: Record<string, string> = {
  'cua-hang': 'Cửa hàng',
  'kho': 'Kho',
  'van-phong': 'Văn phòng',
}

/* ── Rule Modal ──────────────────────────────────────────────── */
function RuleModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const isLive = game.status === 'active'
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl px-5 pt-4 pb-10 z-10"
           style={{ background: '#0E0E0E', border: '1px solid #222', borderBottom: 'none', boxShadow: '0 -8px 40px rgba(0,0,0,0.8)' }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: '#333' }} />
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
               style={{ background: '#141414', border: `1px solid ${isLive ? 'rgba(233,78,27,0.35)' : '#2c2c2c'}` }}>
            {game.icon}
          </div>
          <div>
            <p className="text-white font-black leading-tight" style={{ fontSize: '16px' }}>{game.title}</p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <span className="badge-brand">{game.category}</span>
              {isLive
                ? <span className="badge font-bold" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>⚡ Đang mở</span>
                : <span className="badge" style={{ background: '#1a1a1a', color: '#585858', border: '1px solid #2c2c2c' }}>Sắp ra mắt</span>}
              {game.aiHard && <span className="badge" style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>🤖 AI Hard</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl p-4" style={{ background: '#141414', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '10px', color: '#585858', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>Mô tả</p>
            <p style={{ fontSize: '13px', color: '#d0d0d0', lineHeight: 1.65 }}>{game.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="stat-box"><p style={{ fontSize: '18px', marginBottom: 4 }}>⏱</p><p className="stat-value" style={{ fontSize: '14px' }}>{game.duration}</p><p className="stat-label">Thời gian</p></div>
            <div className="stat-box"><p style={{ fontSize: '18px', marginBottom: 4 }}>🏅</p><p className="stat-value text-brand" style={{ fontSize: '14px' }}>{game.maxScore}đ</p><p className="stat-label">Tối đa</p></div>
          </div>
          <div className="rounded-2xl px-4 py-3.5" style={{ background: '#141414', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '10px', color: '#585858', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Phù hợp với khối</p>
            <div className="flex flex-wrap gap-1.5">{game.suitableFor.map(b => <span key={b} className="badge-gray">{b}</span>)}</div>
          </div>
        </div>
        <button className="btn-primary w-full mt-5 py-3.5" onClick={onClose}>Đã hiểu, đóng lại</button>
      </div>
    </div>
  )
}

/* ── User Game Card (only for visible games) ─────────────────── */
function UserGameCard({ game, onViewRule, onStart }: { game: Game; onViewRule: (g: Game) => void; onStart: (g: Game) => void }) {
  const isLive = game.status === 'active'
  return (
    <div className="overflow-hidden rounded-2xl transition-all active:scale-[0.98]"
         style={{
           background: 'linear-gradient(135deg, #161616 0%, #111111 100%)',
           border: isLive ? '1px solid rgba(233,78,27,0.3)' : '1px solid #222',
           boxShadow: isLive
             ? '0 0 32px rgba(233,78,27,0.08), 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)'
             : '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
         }}>
      {/* Top accent line */}
      {isLive && <div style={{ height: 2, background: `linear-gradient(90deg, ${BRAND}, transparent)` }} />}

      {/* Header */}
      <div className={`bg-gradient-to-br ${game.gradient} to-[#111] px-4 pt-5 pb-4 flex items-center gap-4`}>
        <div className="w-[58px] h-[58px] rounded-2xl flex items-center justify-center shrink-0"
             style={{ fontSize: '26px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black leading-snug" style={{ fontSize: '15px', letterSpacing: '-0.3px' }}>{game.title}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="badge-brand" style={{ fontSize: '10px' }}>{game.category}</span>
            {isLive
              ? <span className="badge font-black" style={{ fontSize: '10px', background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', letterSpacing: '0.06em' }}>⚡ LIVE</span>
              : <span className="badge" style={{ fontSize: '10px', background: '#1a1a1a', color: '#585858', border: '1px solid #2c2c2c' }}>Sắp ra mắt</span>}
            {game.aiHard && <span className="badge" style={{ fontSize: '10px', background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.18)' }}>🤖 AI Hard</span>}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-4">
        <p className="line-clamp-2 mb-3.5" style={{ fontSize: '12.5px', color: '#787878', lineHeight: 1.65 }}>{game.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ fontSize: '11px', color: '#686868', background: '#181818', border: '1px solid #252525' }}>⏱ {game.duration}</span>
          <span className="flex items-center gap-1 rounded-full px-2.5 py-1"
                style={{ fontSize: '11px', background: '#181818', border: '1px solid #252525' }}>
            <span style={{ color: '#585858' }}>🏅</span>
            <span className="font-bold" style={{ color: isLive ? BRAND : '#585858' }}>{game.maxScore}</span>
            <span style={{ color: '#585858' }}>đ</span>
          </span>
        </div>
        <div className="flex gap-2">
          {isLive
            ? <button
                className="flex-1 font-black text-white rounded-xl py-2.5 transition-all active:scale-[0.97]"
                style={{ fontSize: '13px', letterSpacing: '0.04em', background: `linear-gradient(90deg, ${BRAND}, #FF5A28)`, boxShadow: `0 4px 16px rgba(233,78,27,0.28)` }}
                onClick={() => onStart(game)}>
                Chơi ngay →
              </button>
            : <div className="flex-1 rounded-xl py-2.5 flex items-center justify-center"
                   style={{ background: '#141414', border: '1px solid #222', cursor: 'not-allowed' }}>
                <span style={{ fontSize: '12px', color: '#404040', fontWeight: 600 }}>Chưa mở</span>
              </div>}
          <button
            className="rounded-xl py-2.5 px-4 font-semibold transition-all active:scale-[0.97]"
            style={{ fontSize: '13px', color: '#686868', background: '#141414', border: '1px solid #242424' }}
            onClick={() => onViewRule(game)}>
            Luật
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Admin Manage Card (with toggle) ─────────────────────────── */
function AdminManageCard({ game, visible, onToggle, onViewRule }: {
  game: Game
  visible: boolean
  onToggle: () => void
  onViewRule: (g: Game) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all"
         style={{
           background: visible ? 'rgba(233,78,27,0.06)' : '#111',
           border: visible ? '1px solid rgba(233,78,27,0.22)' : '1px solid #222',
           boxShadow: visible ? '0 0 20px rgba(233,78,27,0.06)' : 'none',
         }}>
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
           style={{ background: visible ? 'rgba(233,78,27,0.1)' : '#181818', border: visible ? '1px solid rgba(233,78,27,0.25)' : '1px solid #252525' }}>
        {game.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold leading-tight truncate" style={{ fontSize: '13px', color: visible ? '#f0f0f0' : '#686868' }}>
          {game.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span style={{ fontSize: '10px', color: '#484848' }}>{game.category}</span>
          <span style={{ fontSize: '10px', color: '#303030' }}>·</span>
          <span style={{ fontSize: '10px', color: '#484848' }}>{game.duration}</span>
          {game.status === 'active'
            ? <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 700 }}>⚡ LIVE</span>
            : <span style={{ fontSize: '10px', color: '#404040' }}>Sắp ra mắt</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onViewRule(game)}
          className="rounded-lg px-2.5 py-1.5 transition-all active:scale-90"
          style={{ fontSize: '11px', color: '#484848', background: '#181818', border: '1px solid #252525' }}>
          Luật
        </button>
        {/* Toggle switch */}
        <button
          onClick={onToggle}
          className="relative flex items-center transition-all active:scale-90"
          style={{ width: 44, height: 26 }}>
          <div style={{
            width: 44, height: 26, borderRadius: 13,
            background: visible ? `linear-gradient(90deg, ${BRAND}, #FF5A28)` : '#222',
            border: visible ? `1px solid rgba(233,78,27,0.4)` : '1px solid #333',
            boxShadow: visible ? `0 0 12px rgba(233,78,27,0.3)` : 'none',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 3,
              left: visible ? 21 : 3,
              width: 18, height: 18,
              borderRadius: '50%',
              background: visible ? '#fff' : '#484848',
              boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
            }} />
          </div>
        </button>
      </div>
    </div>
  )
}

/* ── Empty State (user sees no games) ────────────────────────── */
function EmptyGameState() {
  return (
    <div className="flex flex-col items-center py-12 px-6 rounded-3xl text-center"
         style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #0c0c0c 100%)', border: '1px solid #1a1a1a' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 20 }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(233,78,27,0.15) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
             style={{ background: '#141414', border: '1px solid #2a2a2a', fontSize: '32px' }}>
          🎮
        </div>
      </div>
      <p className="font-black text-white mb-2" style={{ fontSize: '16px', letterSpacing: '-0.3px' }}>
        Game Arena
      </p>
      <p style={{ fontSize: '12.5px', color: '#484848', lineHeight: 1.7, maxWidth: 220 }}>
        Chưa có game nào được mở.<br />
        Admin sẽ kích hoạt khi sẵn sàng.
      </p>
      <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full"
           style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.15)' }}>
        <span style={{ fontSize: '10px', color: '#E94E1B', fontWeight: 700, letterSpacing: '0.1em' }}>
          🔒 SẮP RA MẮT
        </span>
      </div>
    </div>
  )
}

/* ── Academy Shortcut ────────────────────────────────────────── */
function AcademyCard({ icon, title, subtitle, accentColor, onClick }: {
  icon: string; title: string; subtitle: string; accentColor: string; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
      style={{ background: '#111', border: `1px solid ${accentColor}30` }}>
      <div className="px-4 py-3.5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
             style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white" style={{ fontSize: '13px' }}>{title}</p>
          <p style={{ fontSize: '11px', color: '#585858', marginTop: 2 }}>{subtitle}</p>
        </div>
        <span style={{ fontSize: '16px', color: '#333' }}>›</span>
      </div>
    </button>
  )
}

/* ── Live Game Banner ───────────────────────────────────────── */
function LiveGameBanner({ game, onStart, onViewRule }: { game: Game; onStart: (g: Game) => void; onViewRule: (g: Game) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl transition-all active:scale-[0.99]"
         style={{ border: '1px solid rgba(233,78,27,0.3)', background: '#0f0f0f' }}>
      <div style={{ height: 2, background: 'linear-gradient(90deg, #E94E1B, transparent)' }} />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
             style={{ fontSize: '22px', background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.2)' }}>
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black text-white truncate" style={{ fontSize: '13px' }}>{game.title}</p>
            <span className="shrink-0 font-black rounded px-1.5 py-0.5"
                  style={{ fontSize: '9px', background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', letterSpacing: '0.06em' }}>
              LIVE
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#585858', marginBottom: 6 }} className="line-clamp-1">{game.description}</p>
          <div className="flex gap-1.5">
            <span style={{ fontSize: '10px', background: '#181818', border: '1px solid #252525', borderRadius: 20, padding: '2px 8px', color: '#686868' }}>⏱ {game.duration}</span>
            <span style={{ fontSize: '10px', background: '#181818', border: '1px solid #252525', borderRadius: 20, padding: '2px 8px', color: BRAND, fontWeight: 700 }}>🏅 {game.maxScore}đ</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            className="font-black text-white rounded-xl px-3 py-2 transition-all active:scale-[0.97]"
            style={{ fontSize: '12px', background: `linear-gradient(90deg, ${BRAND}, #FF5A28)`, boxShadow: `0 4px 14px rgba(233,78,27,0.28)`, whiteSpace: 'nowrap' }}
            onClick={() => onStart(game)}>
            Chơi →
          </button>
          <button
            className="rounded-xl px-3 py-1.5 font-semibold transition-all active:scale-[0.97]"
            style={{ fontSize: '11px', color: '#585858', background: '#141414', border: '1px solid #222', whiteSpace: 'nowrap' }}
            onClick={() => onViewRule(game)}>
            Luật
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Upcoming Game Row ───────────────────────────────────────── */
function UpcomingGameRow({ game, onViewRule }: { game: Game; onViewRule: (g: Game) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3"
         style={{ background: '#111', border: '1px solid #1e1e1e' }}>
      <div className="text-xl w-8 text-center shrink-0">{game.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate" style={{ fontSize: '12px', color: '#585858' }}>{game.title}</p>
        <p style={{ fontSize: '10px', color: '#383838', marginTop: 2 }}>{game.category} · {game.duration}</p>
      </div>
      <button
        onClick={() => onViewRule(game)}
        style={{ fontSize: '10px', background: '#181818', border: '1px solid #252525', borderRadius: 8, padding: '4px 10px', color: '#484848', flexShrink: 0 }}>
        Xem
      </button>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function GamesPage() {
  const { currentUser } = useAuth()
  const isAdmin = canAccessAdminPanel(currentUser?.role)

  const { visibility, loading, toggle } = useGameVisibility(isAdmin)

  const [userRank,     setUserRank]     = useState<number | null>(null)
  const [userStreak,   setUserStreak]   = useState<number>(0)
  const [sessionCount, setSessionCount] = useState<number>(0)
  const [userScore,    setUserScore]    = useState<number>(0)

  useEffect(() => {
    if (!currentUser) return
    async function loadStats() {
      const [{ data: profile }, { count: rankCount }, { count: sessions }] = await Promise.all([
        supabase.from('profiles').select('score, streak').eq('id', currentUser!.id).single(),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true).gt('score', 0),
        supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('user_id', currentUser!.id),
      ])
      if (profile) {
        const p = profile as { score: number; streak: number }
        setUserScore(p.score ?? 0)
        setUserStreak(p.streak ?? 0)
        const { count: above } = await supabase
          .from('profiles').select('*', { count: 'exact', head: true })
          .eq('is_active', true).gt('score', p.score ?? 0)
        setUserRank((above ?? 0) + 1)
      }
      void rankCount
      setSessionCount(sessions ?? 0)
    }
    void loadStats()
  }, [currentUser?.id])

  const [activeCategory, setActiveCategory] = useState<GameCategory>('Tất cả')
  const [ruleGame,       setRuleGame]        = useState<Game | null>(null)
  const [activeGame,     setActiveGame]      = useState<Game | null>(null)
  const [gamePhase,      setGamePhase]       = useState<'list' | 'intro' | 'playing' | 'result'>('list')
  const [lastAnswers,    setLastAnswers]      = useState<GameAnswer[]>([])

  const [showProductQuiz,       setShowProductQuiz]       = useState(false)
  const [showTrainingLibrary,   setShowTrainingLibrary]   = useState(false)
  const [showOnboarding,        setShowOnboarding]        = useState(false)
  const [showGameLeaderboard,   setShowGameLeaderboard]   = useState(false)
  const [showSeasonLeaderboard, setShowSeasonLeaderboard] = useState(false)
  const [showDeptTournament,    setShowDeptTournament]    = useState(false)
  const [showBracket,           setShowBracket]           = useState(false)
  const [showGameRoom,          setShowGameRoom]          = useState(false)
  const [showMyHistory,         setShowMyHistory]         = useState(false)
  const [showLuckySpin,         setShowLuckySpin]         = useState(false)
  const [showLucChien,          setShowLucChien]          = useState(false)

  // ── Game flow handlers ────────────────────────────────────
  const handleStart = (game: Game) => {
    if (game.id === 'g05') { setActiveGame(game); setGamePhase('intro') }
    else if (game.id === 'g08') { setShowProductQuiz(true) }
  }
  const handleBackToList = () => { setActiveGame(null); setGamePhase('list'); setLastAnswers([]) }
  const handleGameFinish = (answers: GameAnswer[]) => { setLastAnswers(answers); setGamePhase('result') }
  const handleReplay = () => { setLastAnswers([]); setGamePhase('playing') }

  if (gamePhase === 'result') return <DifficultCustomerResult answers={lastAnswers} onReplay={handleReplay} onBack={handleBackToList} />
  if (gamePhase === 'playing' && activeGame?.id === 'g05') return <DifficultCustomerGame onFinish={handleGameFinish} onBack={handleBackToList} />
  if (gamePhase === 'intro'   && activeGame?.id === 'g05') return (
    <div className="flex flex-col gap-5 py-4">
      <p className="section-title-brand">🎮 Game Arena</p>
      <DifficultCustomerIntro onStart={() => setGamePhase('playing')} onBack={handleBackToList} />
    </div>
  )

  // ── Filter by category ────────────────────────────────────
  const allFiltered = activeCategory === 'Tất cả' ? mockGames : mockGames.filter(g => g.category === activeCategory)

  // Staff sees only visible games; admin sees all for management
  const visibleGames = isAdmin ? allFiltered : allFiltered.filter(g => visibility[g.id] === true)
  const enabledCount = Object.values(visibility).filter(Boolean).length

  // ═══════════════════════════════════════════════════════════
  // ADMIN VIEW
  // ═══════════════════════════════════════════════════════════
  if (isAdmin) {
    return (
      <div className="flex flex-col gap-5 py-4">

        {/* Header */}
        <div>
          <p className="section-title-brand">🎮 Game Arena</p>
          <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
            <span style={{ color: BRAND, fontWeight: 700 }}>{enabledCount} đang bật</span>
            {' · '}{mockGames.length - enabledCount} đang ẩn
          </p>
        </div>

        {/* Quick action row */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 no-scrollbar">
          {[
            { label: '🏆 Xếp hạng', color: '#facc15', onClick: () => setShowGameLeaderboard(true)   },
            { label: '🏅 Mùa',      color: BRAND,     onClick: () => setShowSeasonLeaderboard(true) },
            { label: '🏢 Phòng ban', color: '#8b5cf6', onClick: () => setShowDeptTournament(true)    },
            { label: '🎯 Phòng thi',  color: '#10b981', onClick: () => setShowGameRoom(true)           },
            { label: '🎰 Vòng Quay', color: '#f59e0b', onClick: () => setShowLuckySpin(true)           },
            { label: '⚔️ Lực Chiến', color: '#e879f9', onClick: () => setShowLucChien(true)            },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap"
              style={{ fontSize: '11px', background: `${btn.color}10`, border: `1px solid ${btn.color}30`, color: btn.color }}>
              {btn.label}
            </button>
          ))}
        </div>

        {/* Academy */}
        <div className="flex flex-col gap-2">
          <AcademyCard icon="📚" title="Học viện Centosy" subtitle="Bài học sản phẩm · kỹ năng bán hàng"
            accentColor="#60a5fa" onClick={() => setShowTrainingLibrary(true)} />
          <AcademyCard icon="🚀" title="Onboarding 7 ngày" subtitle="Checklist theo phòng ban · tiến độ"
            accentColor="#a78bfa" onClick={() => setShowOnboarding(true)} />
        </div>

        {/* ── Admin: Game Visibility Management ────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-black text-white" style={{ fontSize: '13px', letterSpacing: '-0.2px' }}>
                Quản lý hiển thị game
              </p>
              <p style={{ fontSize: '11px', color: '#484848', marginTop: 2 }}>
                Bật để người dùng thấy — tắt để ẩn
              </p>
            </div>
            <div className="rounded-xl px-2.5 py-1" style={{ background: 'rgba(233,78,27,0.08)', border: '1px solid rgba(233,78,27,0.2)' }}>
              <span style={{ fontSize: '11px', color: BRAND, fontWeight: 700 }}>
                {enabledCount}/{mockGames.length}
              </span>
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar mb-3">
            {gameCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={activeCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive'}>
                {cat}
              </button>
            ))}
          </div>

          {/* Manage list */}
          {loading
            ? <div className="flex flex-col gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: '#141414' }} />
                ))}
              </div>
            : <div className="flex flex-col gap-2">
                {allFiltered.map(game => (
                  <AdminManageCard
                    key={game.id}
                    game={game}
                    visible={visibility[game.id] === true}
                    onToggle={() => void toggle(game.id)}
                    onViewRule={setRuleGame}
                  />
                ))}
              </div>
          }
        </div>

        {/* Preview of what users see */}
        {enabledCount > 0 && (
          <div>
            <p className="font-black text-white mb-3" style={{ fontSize: '13px', letterSpacing: '-0.2px' }}>
              👁 Preview — Người dùng thấy
            </p>
            <div className="flex flex-col gap-3">
              {mockGames.filter(g => visibility[g.id] === true).map(game => (
                <UserGameCard key={game.id} game={game} onViewRule={setRuleGame} onStart={handleStart} />
              ))}
            </div>
          </div>
        )}

        <div className="h-2" />
        {ruleGame && <RuleModal game={ruleGame} onClose={() => setRuleGame(null)} />}
        {showProductQuiz       && <ProductQuizPage       onClose={() => setShowProductQuiz(false)}       />}
        {showTrainingLibrary   && <TrainingLibraryPage   onClose={() => setShowTrainingLibrary(false)}   />}
        {showOnboarding        && <OnboardingPage        onClose={() => setShowOnboarding(false)}        />}
        {showGameLeaderboard   && <GameLeaderboardPage   onClose={() => setShowGameLeaderboard(false)}   />}
        {showSeasonLeaderboard && <SeasonLeaderboardPage onClose={() => setShowSeasonLeaderboard(false)} />}
        {showDeptTournament    && <DeptTournamentPage    onClose={() => setShowDeptTournament(false)}    />}

        {showBracket           && <TournamentBracketPage onClose={() => setShowBracket(false)}           />}
        {showGameRoom          && <GameRoomPage          onClose={() => setShowGameRoom(false)}          />}
        {showLuckySpin         && <LuckySpinPage         onClose={() => setShowLuckySpin(false)}         />}
        {showLucChien          && <LucChienLeaderboardPage onClose={() => setShowLucChien(false)}         />}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // USER VIEW — Game Hub
  // ═══════════════════════════════════════════════════════════

  const liveGames     = visibleGames.filter(g => g.status === 'active')
  const upcomingGames = mockGames.filter(g => !visibility[g.id] || g.status !== 'active')
  const orgLabel      = currentUser?.org_group ? (ORG_MAP[currentUser.org_group] ?? currentUser.org_group) : ''
  const initials      = currentUser?.name?.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase() ?? 'CV'

  const FEATURE_BTNS = [
    { icon: '🏆', label: 'Xếp hạng',      color: '#facc15', onClick: () => setShowGameLeaderboard(true)   },
    { icon: '🏅', label: 'Mùa giải',       color: BRAND,     onClick: () => setShowSeasonLeaderboard(true) },
    { icon: '⚔️', label: 'Lực Chiến',      color: '#e879f9', onClick: () => setShowLucChien(true)          },
    { icon: '🎰', label: 'Vòng quay',      color: '#f59e0b', onClick: () => setShowLuckySpin(true)         },
    { icon: '🎯', label: 'Phòng thi Live', color: '#10b981', onClick: () => setShowGameRoom(true)          },
    { icon: '📊', label: 'Lịch sử',        color: '#60a5fa', onClick: () => setShowMyHistory(true)         },
  ]

  return (
    <div className="flex flex-col" style={{ gap: 0 }}>

      {/* ── 1. Personalized Hero ─────────────────────────── */}
      <div className="px-4 pt-5 pb-4" style={{ background: '#0e0e0e', borderBottom: '1px solid #1a1a1a' }}>
        {/* User row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
               style={{ fontSize: '14px', background: '#1e1e1e', border: '1px solid #2a2a2a', color: '#888' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-white truncate" style={{ fontSize: '15px' }}>{currentUser?.name ?? 'Bạn'}</p>
            <p style={{ fontSize: '11px', color: '#484848', marginTop: 2 }}>
              {orgLabel}{orgLabel ? ' · ' : ''}Game Arena
            </p>
          </div>
          {userStreak > 0 && (
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 shrink-0"
                 style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.25)' }}>
              <span style={{ fontSize: '13px' }}>🔥</span>
              <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: 700 }}>{userStreak} ngày</span>
            </div>
          )}
        </div>

        {/* Stats 3-col */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl py-3 text-center" style={{ background: '#141414', border: '1px solid #222' }}>
            <p className="font-black" style={{ fontSize: '20px', color: '#facc15', lineHeight: 1 }}>
              {userRank ? `#${userRank}` : '—'}
            </p>
            <p style={{ fontSize: '10px', color: '#484848', marginTop: 5 }}>Hạng</p>
          </div>
          <div className="rounded-xl py-3 text-center" style={{ background: '#141414', border: '1px solid #222' }}>
            <p className="font-black" style={{ fontSize: '20px', color: BRAND, lineHeight: 1 }}>
              {userScore.toLocaleString()}
            </p>
            <p style={{ fontSize: '10px', color: '#484848', marginTop: 5 }}>Điểm</p>
          </div>
          <div className="rounded-xl py-3 text-center" style={{ background: '#141414', border: '1px solid #222' }}>
            <p className="font-black" style={{ fontSize: '20px', color: '#f0f0f0', lineHeight: 1 }}>{sessionCount}</p>
            <p style={{ fontSize: '10px', color: '#484848', marginTop: 5 }}>Trận</p>
          </div>
        </div>
      </div>

      {/* ── 2. Feature Grid 3×2 ──────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <p style={{ fontSize: '10px', color: '#404040', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          Tính năng
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FEATURE_BTNS.map(f => (
            <button key={f.label} onClick={f.onClick}
              className="rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all active:scale-[0.96]"
              style={{ background: `${f.color}12`, border: `1px solid ${f.color}28` }}>
              <span style={{ fontSize: '22px', lineHeight: 1 }}>{f.icon}</span>
              <span style={{ fontSize: '10px', color: f.color, fontWeight: 700, textAlign: 'center', lineHeight: 1.3 }}>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Live Games ────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: '#111' }} />)}
          </div>
        ) : liveGames.length > 0 ? (
          <>
            <p style={{ fontSize: '10px', color: '#4ade80', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              🔴 Đang mở · {liveGames.length}
            </p>
            <div className="flex flex-col gap-3">
              {liveGames.map(game => (
                <LiveGameBanner key={game.id} game={game} onStart={handleStart} onViewRule={setRuleGame} />
              ))}
            </div>
          </>
        ) : (
          <EmptyGameState />
        )}
      </div>

      {/* ── 4. Upcoming (compact rows) ───────────────────── */}
      {upcomingGames.length > 0 && (
        <div className="px-4 pt-4 pb-1">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: '10px', color: '#404040', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
              Sắp ra mắt
            </p>
            {upcomingGames.length > 2 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {gameCategories.slice(0, 4).map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)}
                    className={activeCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive'}
                    style={{ fontSize: '10px' }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {(activeCategory === 'Tất cả' ? upcomingGames : upcomingGames.filter(g => g.category === activeCategory))
              .map(game => (
                <UpcomingGameRow key={game.id} game={game} onViewRule={setRuleGame} />
              ))}
          </div>
        </div>
      )}

      {/* ── 5. Học & Phát triển (bottom) ─────────────────── */}
      <div className="px-4 pt-5 pb-2" style={{ borderTop: '1px solid #141414', marginTop: 12 }}>
        <p style={{ fontSize: '10px', color: '#404040', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
          Học & Phát triển
        </p>
        <div className="flex flex-col gap-2">
          <AcademyCard icon="📚" title="Học viện Centosy" subtitle="Bài học sản phẩm · kỹ năng · quy trình"
            accentColor="#60a5fa" onClick={() => setShowTrainingLibrary(true)} />
          <AcademyCard icon="🚀" title="Onboarding 7 ngày" subtitle="Checklist nhân viên mới · tiến độ hội nhập"
            accentColor="#a78bfa" onClick={() => setShowOnboarding(true)} />
          <AcademyCard icon="🏢" title="Giải đấu phòng ban" subtitle="Xem bảng thi đua theo bộ phận"
            accentColor="#8b5cf6" onClick={() => setShowDeptTournament(true)} />
        </div>
      </div>

      <div className="h-4" />
      {ruleGame && <RuleModal game={ruleGame} onClose={() => setRuleGame(null)} />}
      {showProductQuiz       && <ProductQuizPage       onClose={() => setShowProductQuiz(false)}       />}
      {showTrainingLibrary   && <TrainingLibraryPage   onClose={() => setShowTrainingLibrary(false)}   />}
      {showOnboarding        && <OnboardingPage        onClose={() => setShowOnboarding(false)}        />}
      {showGameLeaderboard   && <GameLeaderboardPage   onClose={() => setShowGameLeaderboard(false)}   />}
      {showSeasonLeaderboard && <SeasonLeaderboardPage onClose={() => setShowSeasonLeaderboard(false)} />}
      {showDeptTournament    && <DeptTournamentPage    onClose={() => setShowDeptTournament(false)}    />}
      {showBracket           && <TournamentBracketPage onClose={() => setShowBracket(false)}           />}
      {showGameRoom          && <GameRoomPage          onClose={() => setShowGameRoom(false)}          />}
      {showMyHistory         && <MyGameHistory         onClose={() => setShowMyHistory(false)}         />}
      {showLuckySpin         && <LuckySpinPage         onClose={() => setShowLuckySpin(false)}         />}
      {showLucChien          && <LucChienLeaderboardPage onClose={() => setShowLucChien(false)}         />}
    </div>
  )
}
