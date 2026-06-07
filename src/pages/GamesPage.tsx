import { useState } from 'react'
import { mockGames, gameCategories, GameCategory, Game } from '../data/mockGames'
import DifficultCustomerIntro from '../components/games/DifficultCustomerIntro'
import DifficultCustomerGame, { GameAnswer } from '../components/games/DifficultCustomerGame'
import DifficultCustomerResult from '../components/games/DifficultCustomerResult'
import ProductQuizPage from './ProductQuizPage'
import TrainingLibraryPage from './TrainingLibraryPage'
import OnboardingPage from './OnboardingPage'

/* ── Rule Modal ──────────────────────────────────────────── */
function RuleModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const isLive = game.status === 'active'
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl px-5 pt-4 pb-10 z-10"
           style={{ background: '#0E0E0E', border: '1px solid #2c2c2c', borderBottom: 'none', boxShadow: '0 -8px 40px rgba(0,0,0,0.7)' }}>

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
                : <span className="badge" style={{ background: '#1a1a1a', color: '#585858', border: '1px solid #2c2c2c' }}>Sắp ra mắt</span>
              }
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
            <div className="stat-box">
              <p style={{ fontSize: '18px', marginBottom: 4 }}>⏱</p>
              <p className="stat-value" style={{ fontSize: '14px' }}>{game.duration}</p>
              <p className="stat-label">Thời gian</p>
            </div>
            <div className="stat-box">
              <p style={{ fontSize: '18px', marginBottom: 4 }}>🏅</p>
              <p className="stat-value text-brand" style={{ fontSize: '14px' }}>{game.maxScore}đ</p>
              <p className="stat-label">Tối đa</p>
            </div>
          </div>

          <div className="rounded-2xl px-4 py-3.5" style={{ background: '#141414', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '10px', color: '#585858', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>Phù hợp với khối</p>
            <div className="flex flex-wrap gap-1.5">
              {game.suitableFor.map(b => <span key={b} className="badge-gray">{b}</span>)}
            </div>
          </div>

          {game.aiHard && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
                 style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.15)' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>🤖</span>
              <p style={{ fontSize: '12px', color: '#fb923c', fontWeight: 600, lineHeight: 1.5 }}>
                Game này yêu cầu trải nghiệm thực tế — AI không thể chơi thay bạn
              </p>
            </div>
          )}
        </div>

        <button className="btn-primary w-full mt-5 py-3.5" onClick={onClose}>
          Đã hiểu, đóng lại
        </button>
      </div>
    </div>
  )
}

/* ── Game Card ───────────────────────────────────────────── */
function GameCard({ game, onViewRule, onStart }: { game: Game; onViewRule: (g: Game) => void; onStart: (g: Game) => void }) {
  const isLive = game.status === 'active'

  return (
    <div className="overflow-hidden rounded-2xl transition-all"
         style={{
           background: '#181818',
           border: isLive ? '1.5px solid rgba(233,78,27,0.38)' : '1px solid #2c2c2c',
           boxShadow: isLive
             ? '0 0 28px rgba(233,78,27,0.11), 0 4px 20px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04)'
             : '0 2px 12px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.03)',
         }}>

      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${game.gradient} to-[#181818] px-4 pt-5 pb-4 flex items-center gap-4`}
           style={{ opacity: isLive ? 1 : 0.65 }}>
        <div className="w-[60px] h-[60px] rounded-2xl bg-black/35 border border-white/10 flex items-center justify-center shrink-0"
             style={{ fontSize: '28px' }}>
          {game.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black leading-snug" style={{ fontSize: '16px', letterSpacing: '-0.2px' }}>
            {game.title}
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="badge-brand">{game.category}</span>
            {isLive
              ? <span className="badge font-black" style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)', letterSpacing: '0.08em' }}>
                  ⚡ LIVE
                </span>
              : <span className="badge" style={{ fontSize: '10px', background: '#1a1a1a', color: '#585858', border: '1px solid #2c2c2c', letterSpacing: '0.06em' }}>
                  Sắp ra mắt
                </span>
            }
            {game.aiHard && (
              <span className="badge" style={{ fontSize: '10px', background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.2)' }}>
                🤖 AI Hard
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-3.5 pb-4" style={{ opacity: isLive ? 1 : 0.7 }}>
        <p className="line-clamp-2 mb-4" style={{ fontSize: '13px', color: '#909090', lineHeight: 1.6 }}>
          {game.description}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ fontSize: '11px', color: '#909090', background: '#1e1e1e', border: '1px solid #2c2c2c' }}>
            ⏱ {game.duration}
          </span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ fontSize: '11px', background: '#1e1e1e', border: '1px solid #2c2c2c' }}>
            <span style={{ color: '#585858' }}>🏅</span>
            <span className="font-bold" style={{ color: isLive ? '#E94E1B' : '#585858' }}>{game.maxScore}</span>
            <span style={{ color: '#585858' }}>đ</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                style={{ fontSize: '11px', color: '#909090', background: '#1e1e1e', border: '1px solid #2c2c2c' }}>
            👥 {game.suitableFor.slice(0, 2).join(' · ')}{game.suitableFor.length > 2 ? ' +' : ''}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          {isLive
            ? <button
                className="flex-1 font-black text-white rounded-2xl py-3 transition-all active:scale-[0.97]"
                style={{ fontSize: '13px', letterSpacing: '0.06em', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 16px rgba(233,78,27,0.3)' }}
                onClick={() => onStart(game)}>
                Bắt đầu →
              </button>
            : <div className="flex-1 rounded-2xl py-3 flex items-center justify-center"
                   style={{ background: '#141414', border: '1px solid #242424', cursor: 'not-allowed' }}>
                <span style={{ fontSize: '12px', color: '#484848', fontWeight: 600 }}>Chưa mở</span>
              </div>
          }
          <button
            className="rounded-2xl py-3 px-4 font-semibold transition-all active:scale-[0.97]"
            style={{ fontSize: '13px', color: '#909090', background: '#141414', border: '1px solid #2c2c2c' }}
            onClick={() => onViewRule(game)}>
            Luật
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ───────────────────────────────────────────── */
export default function GamesPage() {
  const [activeCategory, setActiveCategory] = useState<GameCategory>('Tất cả')
  const [ruleGame, setRuleGame]   = useState<Game | null>(null)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [gamePhase, setGamePhase] = useState<'list' | 'intro' | 'playing' | 'result'>('list')
  const [lastAnswers, setLastAnswers] = useState<GameAnswer[]>([])
  const [showProductQuiz, setShowProductQuiz]       = useState(false)
  const [showTrainingLibrary, setShowTrainingLibrary] = useState(false)
  const [showOnboarding, setShowOnboarding]           = useState(false)

  const filtered = activeCategory === 'Tất cả'
    ? mockGames
    : mockGames.filter(g => g.category === activeCategory)

  const handleStart = (game: Game) => {
    if (game.id === 'g05') {
      setActiveGame(game)
      setGamePhase('intro')
    } else if (game.id === 'g08') {
      setShowProductQuiz(true)
    }
  }

  const handleBackToList = () => {
    setActiveGame(null)
    setGamePhase('list')
    setLastAnswers([])
  }

  const handleGameFinish = (answers: GameAnswer[]) => {
    setLastAnswers(answers)
    setGamePhase('result')
  }

  const handleReplay = () => {
    setLastAnswers([])
    setGamePhase('playing')
  }

  // Màn kết quả
  if (gamePhase === 'result') {
    return (
      <DifficultCustomerResult
        answers={lastAnswers}
        onReplay={handleReplay}
        onBack={handleBackToList}
      />
    )
  }

  // Màn chơi chính
  if (gamePhase === 'playing' && activeGame?.id === 'g05') {
    return (
      <DifficultCustomerGame
        onFinish={handleGameFinish}
        onBack={handleBackToList}
      />
    )
  }

  // Màn intro
  if (gamePhase === 'intro' && activeGame?.id === 'g05') {
    return (
      <div className="flex flex-col gap-5 py-4">
        <p className="section-title-brand">🎮 Game Center</p>
        <DifficultCustomerIntro
          onStart={() => setGamePhase('playing')}
          onBack={handleBackToList}
        />
      </div>
    )
  }

  const liveCount   = mockGames.filter(g => g.status === 'active').length
  const comingCount = mockGames.filter(g => g.status === 'coming_soon').length

  return (
    <div className="flex flex-col gap-5 py-4">

      {/* Header */}
      <div>
        <p className="section-title-brand">🎮 Game Center</p>
        <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
          <span style={{ color: '#4ade80', fontWeight: 700 }}>{liveCount} đang mở</span>
          {' · '}{comingCount} sắp ra mắt · Không thể dùng AI gian lận
        </p>
      </div>

      {/* Academy section */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => setShowTrainingLibrary(true)}
          className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
          style={{ background: '#181818', border: '1px solid rgba(96,165,250,0.35)' }}>
          <div className="px-4 py-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                 style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}>
              📚
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white" style={{ fontSize: '14px' }}>Học viện Centosy</p>
              <p style={{ fontSize: '12px', color: '#707070', marginTop: 3 }}>
                Bài học sản phẩm · kỹ năng bán hàng · quy trình
              </p>
            </div>
            <span style={{ fontSize: '18px', color: '#484848' }}>›</span>
          </div>
        </button>

        <button
          onClick={() => setShowOnboarding(true)}
          className="w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]"
          style={{ background: '#181818', border: '1px solid rgba(167,139,250,0.3)' }}>
          <div className="px-4 py-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                 style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}>
              🚀
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-white" style={{ fontSize: '14px' }}>Onboarding 7 ngày</p>
              <p style={{ fontSize: '12px', color: '#707070', marginTop: 3 }}>
                Checklist theo phòng ban · theo dõi tiến độ
              </p>
            </div>
            <span style={{ fontSize: '18px', color: '#484848' }}>›</span>
          </div>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
        {gameCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive'}>
            {cat}
          </button>
        ))}
      </div>

      {/* Game list */}
      <div className="flex flex-col gap-4">
        {filtered.map(game => (
          <GameCard key={game.id} game={game} onViewRule={setRuleGame} onStart={handleStart} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl text-center py-10"
             style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
          <p style={{ fontSize: '32px', marginBottom: 12 }}>🎯</p>
          <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có game trong nhóm này.</p>
        </div>
      )}

      <div className="h-2" />
      {ruleGame && <RuleModal game={ruleGame} onClose={() => setRuleGame(null)} />}
      {showProductQuiz && <ProductQuizPage onClose={() => setShowProductQuiz(false)} />}
      {showTrainingLibrary && <TrainingLibraryPage onClose={() => setShowTrainingLibrary(false)} />}
      {showOnboarding && <OnboardingPage onClose={() => setShowOnboarding(false)} />}
    </div>
  )
}
