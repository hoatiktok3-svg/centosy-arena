import { useState, useEffect } from 'react'
import {
  mockCustomerScenarios,
  CustomerScenario,
} from '../../data/mockDifficultCustomer'
import DifficultCustomerFeedback from './DifficultCustomerFeedback'

const QUESTIONS_PER_GAME = 5
const TIMER_SECONDS = 20

export interface GameAnswer {
  scenarioId: string
  chosen: 'A' | 'B' | 'C' | 'D' | null
  score: number
}

interface Props {
  onFinish: (answers: GameAnswer[]) => void
  onBack: () => void
}

const OPTION_COLORS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: '#E94E1B',
  B: '#4ade80',
  C: '#facc15',
  D: '#60a5fa',
}

export default function DifficultCustomerGame({ onFinish, onBack }: Props) {
  const [scenarios] = useState<CustomerScenario[]>(() =>
    [...mockCustomerScenarios].sort(() => 0.5 - Math.random()).slice(0, QUESTIONS_PER_GAME)
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft]         = useState(TIMER_SECONDS)
  const [phase, setPhase]               = useState<'playing' | 'feedback'>('playing')
  const [chosen, setChosen]             = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [answers, setAnswers]           = useState<GameAnswer[]>([])
  const [scoreFlash, setScoreFlash]     = useState(false)

  const current = scenarios[currentIndex]

  // ── Timer countdown ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      commitAnswer(null)
      return
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft, phase])

  const commitAnswer = (opt: 'A' | 'B' | 'C' | 'D' | null) => {
    const score = opt ? current.scoreByOption[opt] : 0
    setChosen(opt)
    setAnswers(prev => [...prev, { scenarioId: current.id, chosen: opt, score }])
    setScoreFlash(true)
    setTimeout(() => setScoreFlash(false), 600)
    setPhase('feedback')
  }

  const handleSelect = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (phase !== 'playing') return
    commitAnswer(opt)
  }

  const handleNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= QUESTIONS_PER_GAME) {
      onFinish(answers)
    } else {
      setCurrentIndex(nextIndex)
      setTimeLeft(TIMER_SECONDS)
      setChosen(null)
      setPhase('playing')
      setScoreFlash(false)
    }
  }

  const timerPct   = (timeLeft / TIMER_SECONDS) * 100
  const timerColor = timeLeft > 10 ? '#E94E1B' : timeLeft > 5 ? '#facc15' : '#ef4444'
  const isLast     = currentIndex + 1 >= QUESTIONS_PER_GAME
  const totalScore = answers.reduce((s, a) => s + a.score, 0)

  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
         style={{ background: '#080808' }}>

      {/* ── TOP BAR (luôn hiển thị) ──────────────────────────── */}
      <div className="shrink-0 px-4 pt-5 pb-3 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1a1a1a' }}>

        <button onClick={onBack}
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{ background: '#141414', border: '1px solid #222' }}>
          <span style={{ fontSize: '16px', color: '#888' }}>←</span>
        </button>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontSize: '12px', color: '#888' }}>
              Câu <span style={{ color: '#fff', fontWeight: 700 }}>{currentIndex + 1}</span> / {QUESTIONS_PER_GAME}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, transition: 'color 0.3s', color: scoreFlash ? '#4ade80' : '#555' }}>
              {totalScore}đ tích lũy
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: '#1f1f1f' }}>
            <div className="h-full rounded-full transition-all duration-300"
                 style={{ width: `${(currentIndex / QUESTIONS_PER_GAME) * 100}%`, background: '#E94E1B' }} />
          </div>
        </div>
      </div>

      {/* ── FEEDBACK SCREEN ──────────────────────────────────── */}
      {phase === 'feedback' && (
        <DifficultCustomerFeedback
          scenario={current}
          chosen={chosen}
          onNext={handleNext}
          isLast={isLast}
          questionNumber={currentIndex + 1}
          total={QUESTIONS_PER_GAME}
        />
      )}

      {/* ── PLAY SCREEN ──────────────────────────────────────── */}
      {phase === 'playing' && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

            {/* Mood + Timer row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full"
                   style={{ background: '#141414', border: '1px solid #222' }}>
                <span style={{ fontSize: '16px' }}>{current.customerMood.split(' ')[0]}</span>
                <span style={{ fontSize: '12px', color: '#aaa', fontWeight: 600 }}>
                  {current.customerMood.split(' ').slice(1).join(' ')}
                </span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                   style={{ background: '#141414', border: `1px solid ${timerColor}44` }}>
                <span style={{ fontSize: '13px' }}>⏱</span>
                <span className="font-black tabular-nums"
                      style={{ fontSize: '18px', color: timerColor, minWidth: '24px', textAlign: 'right' }}>
                  {timeLeft}
                </span>
                <span style={{ fontSize: '11px', color: '#555' }}>giây</span>
              </div>
            </div>

            {/* Timer bar */}
            <div className="w-full h-1 rounded-full" style={{ background: '#1f1f1f' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-linear"
                   style={{ width: `${timerPct}%`, background: timerColor }} />
            </div>

            {/* Difficulty badge */}
            <div className="flex items-center gap-2">
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                color: current.difficulty === 'Khó' ? '#ef4444' : current.difficulty === 'Trung bình' ? '#facc15' : '#4ade80',
                background: current.difficulty === 'Khó' ? 'rgba(239,68,68,0.1)' : current.difficulty === 'Trung bình' ? 'rgba(250,204,21,0.1)' : 'rgba(74,222,128,0.1)',
                padding: '3px 10px', borderRadius: 99,
                border: `1px solid ${current.difficulty === 'Khó' ? 'rgba(239,68,68,0.25)' : current.difficulty === 'Trung bình' ? 'rgba(250,204,21,0.25)' : 'rgba(74,222,128,0.25)'}`,
              }}>
                {current.difficulty === 'Khó' ? '🔴' : current.difficulty === 'Trung bình' ? '🟡' : '🟢'} {current.difficulty.toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', color: '#444' }}>#{current.targetBlock}</span>
            </div>

            {/* Scenario */}
            <div className="rounded-2xl p-4"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                📋 Tình huống
              </p>
              <p style={{ fontSize: '14px', color: '#ddd', lineHeight: 1.7 }}>
                {current.scenario}
              </p>
            </div>

            {/* Answer options */}
            <div className="flex flex-col gap-2.5">
              {current.options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="w-full text-left flex items-start gap-3 rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
                  style={{
                    background: '#0E0E0E',
                    border: `1px solid ${OPTION_COLORS[opt.id]}33`,
                    cursor: 'pointer',
                  }}>
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black mt-0.5"
                       style={{ background: `${OPTION_COLORS[opt.id]}1a`, border: `1.5px solid ${OPTION_COLORS[opt.id]}`, color: OPTION_COLORS[opt.id], fontSize: '12px' }}>
                    {opt.id}
                  </div>
                  <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.65, flex: 1 }}>
                    {opt.text}
                  </p>
                </button>
              ))}
            </div>

            <div className="h-4" />
          </div>

          {/* Bottom hint */}
          <div className="shrink-0 px-4 pb-8 pt-3"
               style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
            <div className="w-full rounded-2xl py-4 flex items-center justify-center gap-2"
                 style={{ background: '#141414', border: '1px solid #222' }}>
              <span style={{ fontSize: '13px', color: '#555' }}>⏱ Chọn đáp án trong</span>
              <span className="font-black tabular-nums" style={{ fontSize: '18px', color: timerColor }}>{timeLeft}s</span>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
