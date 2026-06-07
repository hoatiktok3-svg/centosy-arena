import { useState } from 'react'
import { LessonTest, TestQuestion } from '../data/mockTraining'

// ── Local storage key ─────────────────────────────────────────
const LS_KEY = 'centosy_test_results'

export interface TestResult {
  lessonId: string
  passed: boolean
  score: number     // 0–1
  correctCount: number
  total: number
  attemptedAt: number  // Date.now()
}

export function loadTestResults(): Record<string, TestResult> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Record<string, TestResult>) : {}
  } catch {
    return {}
  }
}

export function saveTestResult(result: TestResult) {
  try {
    const all = loadTestResults()
    all[result.lessonId] = result
    localStorage.setItem(LS_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

// ── Single Question ───────────────────────────────────────────
function QuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: TestQuestion
  index: number
  total: number
  onAnswer: (selectedIndex: number) => void
}) {
  const [selected,  setSelected]  = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const isCorrect = confirmed && selected === question.correctIndex

  return (
    <div className="fixed inset-0 z-[120] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <div className="flex items-center justify-between mb-3 max-w-[430px] mx-auto">
          <span style={{ fontSize: '13px', color: '#585858' }}>Câu {index + 1}/{total}</span>
          <span className="rounded-full px-2.5 py-1 font-bold"
                style={{ fontSize: '11px', background: 'rgba(233,78,27,0.1)', color: '#E94E1B', border: '1px solid rgba(233,78,27,0.3)' }}>
            Bài kiểm tra
          </span>
        </div>
        <div className="h-1.5 rounded-full max-w-[430px] mx-auto" style={{ background: '#1e1e1e' }}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{ width: `${((index + 1) / total) * 100}%`, background: '#E94E1B' }} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-[430px] mx-auto w-full">
        {/* Question */}
        <div className="rounded-2xl p-5 mb-5"
             style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
          <p style={{ fontSize: '11px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            Câu hỏi
          </p>
          <p className="text-white font-bold leading-snug" style={{ fontSize: '16px' }}>
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            let borderColor = '#2c2c2c'
            let bgColor     = '#181818'
            let textColor   = '#d0d0d0'
            let icon: string | null = null

            if (confirmed) {
              if (i === question.correctIndex) {
                borderColor = 'rgba(74,222,128,0.5)'
                bgColor     = 'rgba(74,222,128,0.08)'
                textColor   = '#4ade80'
                icon        = '✓'
              } else if (i === selected && selected !== question.correctIndex) {
                borderColor = 'rgba(239,68,68,0.5)'
                bgColor     = 'rgba(239,68,68,0.08)'
                textColor   = '#f87171'
                icon        = '✗'
              }
            } else if (i === selected) {
              borderColor = 'rgba(233,78,27,0.6)'
              bgColor     = 'rgba(233,78,27,0.1)'
              textColor   = '#E94E1B'
            }

            return (
              <button
                key={i}
                onClick={() => { if (!confirmed) setSelected(i) }}
                className="w-full text-left rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
                style={{ background: bgColor, border: `1.5px solid ${borderColor}`, cursor: confirmed ? 'default' : 'pointer' }}>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black"
                        style={{ fontSize: '11px', background: '#252525', color: '#585858' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: '14px', color: textColor, flex: 1, lineHeight: 1.45 }}>{opt}</span>
                  {icon && <span className="font-black shrink-0" style={{ fontSize: '16px', color: textColor }}>{icon}</span>}
                </div>
              </button>
            )
          })}
        </div>

        {/* Inline feedback (no explanation in test — just right/wrong) */}
        {confirmed && (
          <div className="mt-4 rounded-2xl px-4 py-3 flex items-center gap-2.5"
               style={{
                 background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                 border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
               }}>
            <span style={{ fontSize: '18px' }}>{isCorrect ? '🎉' : '📖'}</span>
            <p className="font-bold" style={{ fontSize: '13px', color: isCorrect ? '#4ade80' : '#f87171' }}>
              {isCorrect ? 'Đúng rồi!' : `Chưa đúng — đáp án: ${String.fromCharCode(65 + question.correctIndex)}`}
            </p>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="shrink-0 px-4 pb-8 pt-3 max-w-[430px] mx-auto w-full"
           style={{ borderTop: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        {!confirmed ? (
          <button
            className="w-full py-3.5 rounded-2xl font-black transition-all active:scale-[0.97]"
            style={{
              fontSize: '15px',
              background: selected !== null ? 'linear-gradient(90deg,#E94E1B,#FF5A28)' : '#1e1e1e',
              color: selected !== null ? '#fff' : '#484848',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              boxShadow: selected !== null ? '0 4px 16px rgba(233,78,27,0.3)' : 'none',
            }}
            onClick={() => { if (selected !== null) setConfirmed(true) }}
            disabled={selected === null}>
            Xác nhận
          </button>
        ) : (
          <button
            className="btn-primary w-full py-3.5 font-black"
            style={{ fontSize: '15px' }}
            onClick={() => { if (selected !== null) onAnswer(selected) }}>
            {index + 1 < total ? 'Câu tiếp →' : 'Xem kết quả 🏁'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Result Screen ─────────────────────────────────────────────
function TestResultScreen({
  lessonTitle,
  correctCount,
  total,
  passed,
  onRetry,
  onClose,
}: {
  lessonTitle: string
  correctCount: number
  total: number
  passed: boolean
  onRetry: () => void
  onClose: () => void
}) {
  const pct = Math.round((correctCount / total) * 100)

  return (
    <div className="fixed inset-0 z-[120] flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="flex-1 overflow-y-auto px-4 pt-12 pb-6 max-w-[430px] mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-6">
          <p style={{ fontSize: '52px', marginBottom: 10 }}>{passed ? '🎓' : '📚'}</p>
          <p className="font-black" style={{ fontSize: '24px', color: passed ? '#4ade80' : '#f87171' }}>
            {passed ? 'Bạn đã qua bài kiểm tra!' : 'Chưa đạt — thử lại nhé!'}
          </p>
          <p style={{ fontSize: '13px', color: '#707070', marginTop: 6, lineHeight: 1.6 }}>
            {lessonTitle}
          </p>
        </div>

        {/* Score */}
        <div className="rounded-2xl p-5 mb-4 text-center"
             style={{
               background: '#181818',
               border: `1.5px solid ${passed ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.3)'}`,
             }}>
          <p style={{ fontSize: '12px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Kết quả
          </p>
          <p className="font-black" style={{ fontSize: '44px', color: passed ? '#4ade80' : '#f87171', lineHeight: 1 }}>
            {correctCount}/{total}
          </p>
          <p style={{ fontSize: '14px', color: '#585858', marginTop: 6 }}>câu đúng · {pct}%</p>
        </div>

        {/* Status bar */}
        <div className="rounded-2xl px-4 py-3.5 mb-5 flex items-center gap-3"
             style={{
               background: passed ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
               border: `1px solid ${passed ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
             }}>
          <span style={{ fontSize: '20px' }}>{passed ? '✅' : '❌'}</span>
          <p style={{ fontSize: '13px', color: passed ? '#4ade80' : '#f87171', lineHeight: 1.55 }}>
            {passed
              ? 'Xuất sắc! Bài kiểm tra đã được ghi nhận. Bạn có thể tiếp tục bài học tiếp theo.'
              : 'Cần đọc lại bài học và thử lại. Yêu cầu đạt ≥ 67% (2/3 câu đúng).'}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2.5 max-w-[430px] mx-auto w-full"
           style={{ borderTop: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        {!passed && (
          <button
            className="btn-primary w-full py-3.5 font-black"
            style={{ fontSize: '15px' }}
            onClick={onRetry}>
            Làm lại bài kiểm tra 🔄
          </button>
        )}
        <button
          className="w-full py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: '14px', color: '#909090', background: '#181818', border: '1px solid #2c2c2c' }}
          onClick={onClose}>
          {passed ? 'Quay lại bài học ✓' : 'Quay lại đọc bài'}
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
interface Props {
  test: LessonTest
  lessonTitle: string
  onClose: (result?: TestResult) => void
}

export default function TrainingTestPage({ test, lessonTitle, onClose }: Props) {
  const [phase, setPhase]               = useState<'playing' | 'result'>('playing')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [result, setResult]             = useState<TestResult | null>(null)

  const handleAnswer = (selectedIndex: number) => {
    const q          = test.questions[currentIndex]
    const isCorrect  = selectedIndex === q.correctIndex
    const newCorrect = correctCount + (isCorrect ? 1 : 0)

    if (currentIndex + 1 >= test.questions.length) {
      const score  = newCorrect / test.questions.length
      const passed = score >= test.passThreshold
      const r: TestResult = {
        lessonId: test.lessonId,
        passed,
        score,
        correctCount: newCorrect,
        total: test.questions.length,
        attemptedAt: Date.now(),
      }
      saveTestResult(r)
      setResult(r)
      setPhase('result')
    } else {
      setCorrectCount(newCorrect)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleRetry = () => {
    setPhase('playing')
    setCurrentIndex(0)
    setCorrectCount(0)
    setResult(null)
  }

  if (phase === 'result' && result) {
    return (
      <TestResultScreen
        lessonTitle={lessonTitle}
        correctCount={result.correctCount}
        total={result.total}
        passed={result.passed}
        onRetry={handleRetry}
        onClose={() => onClose(result)}
      />
    )
  }

  return (
    <QuestionCard
      question={test.questions[currentIndex]}
      index={currentIndex}
      total={test.questions.length}
      onAnswer={handleAnswer}
    />
  )
}
