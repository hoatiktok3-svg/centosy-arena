import { useState, useEffect } from 'react'
import { mockLessons, lessonCategories, lessonTests, Lesson, LessonCategory } from '../data/mockTraining'
import TrainingTestPage, { loadTestResults, TestResult } from './TrainingTestPage'

// ── Local storage key ─────────────────────────────────────────
const LS_KEY = 'centosy_completed_lessons'

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveCompleted(set: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...set]))
  } catch { /* ignore */ }
}

// ── Category badge colors ─────────────────────────────────────
const CAT_COLOR: Record<LessonCategory, { bg: string; color: string; border: string }> = {
  'Sản phẩm':         { bg: 'rgba(233,78,27,0.12)',  color: '#E94E1B', border: 'rgba(233,78,27,0.3)' },
  'Kỹ năng bán hàng': { bg: 'rgba(250,204,21,0.12)', color: '#facc15', border: 'rgba(250,204,21,0.3)' },
  'Quy trình':        { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  'Văn hóa':          { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
}

// ── Lesson Detail ─────────────────────────────────────────────
function LessonDetail({
  lesson,
  isCompleted,
  testResult,
  onComplete,
  onStartTest,
  onBack,
}: {
  lesson: Lesson
  isCompleted: boolean
  testResult: TestResult | null
  onComplete: () => void
  onStartTest: () => void
  onBack: () => void
}) {
  const catStyle = CAT_COLOR[lesson.category]

  return (
    <div className="fixed inset-0 z-[110] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-3 flex items-center gap-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
          style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', color: '#909090', fontSize: '18px' }}>
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black truncate" style={{ fontSize: '15px' }}>{lesson.title}</p>
          <p style={{ fontSize: '11px', color: '#585858', marginTop: 1 }}>{lesson.duration} đọc</p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 shrink-0"
               style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span style={{ fontSize: '12px', color: '#4ade80' }}>✓</span>
            <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 700 }}>Đã học</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-[430px] mx-auto w-full">
        {/* Hero */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
               style={{ background: '#181818', border: `1px solid ${catStyle.border}` }}>
            {lesson.icon}
          </div>
          <div>
            <span className="rounded-full px-2.5 py-1 font-semibold"
                  style={{ fontSize: '11px', background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
              {lesson.category}
            </span>
            <p className="text-white font-black mt-2 leading-snug" style={{ fontSize: '17px' }}>
              {lesson.title}
            </p>
            <p style={{ fontSize: '13px', color: '#909090', marginTop: 4 }}>{lesson.summary}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-5" style={{ background: '#1e1e1e' }} />

        {/* Content paragraphs */}
        <div className="flex flex-col gap-4 mb-6">
          {lesson.content.map((para, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-black"
                    style={{ fontSize: '10px', background: '#1e1e1e', color: '#585858', minWidth: '20px' }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '14px', color: '#c8c8c8', lineHeight: 1.65 }}>{para}</p>
            </div>
          ))}
        </div>

        {/* Key points */}
        <div className="rounded-2xl p-4 mb-6"
             style={{ background: '#181818', border: `1px solid ${catStyle.border}` }}>
          <p style={{ fontSize: '11px', color: catStyle.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
            💡 Điểm cần nhớ
          </p>
          <div className="flex flex-col gap-2.5">
            {lesson.keyPoints.map((kp, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="mt-1 shrink-0" style={{ fontSize: '8px', color: catStyle.color }}>●</span>
                <p style={{ fontSize: '13px', color: '#d0d0d0', lineHeight: 1.5 }}>{kp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0 px-4 pb-8 pt-3 max-w-[430px] mx-auto w-full flex flex-col gap-2.5"
           style={{ borderTop: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        {isCompleted ? (
          <div className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
               style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span style={{ fontSize: '16px' }}>✅</span>
            <span className="font-bold" style={{ fontSize: '13px', color: '#4ade80' }}>Bài học đã hoàn thành</span>
          </div>
        ) : (
          <button
            className="btn-primary w-full py-3.5 font-black transition-all active:scale-[0.97]"
            style={{ fontSize: '15px' }}
            onClick={onComplete}>
            Đánh dấu hoàn thành ✓
          </button>
        )}

        {/* Test button */}
        {lessonTests.some(t => t.lessonId === lesson.id) && (
          <button
            className="w-full py-3.5 rounded-2xl font-black transition-all active:scale-[0.97] flex items-center justify-center gap-2"
            style={{
              fontSize: '14px',
              background: testResult?.passed
                ? 'rgba(74,222,128,0.08)'
                : 'rgba(233,78,27,0.12)',
              color: testResult?.passed ? '#4ade80' : '#E94E1B',
              border: `1.5px solid ${testResult?.passed ? 'rgba(74,222,128,0.35)' : 'rgba(233,78,27,0.4)'}`,
            }}
            onClick={onStartTest}>
            {testResult?.passed
              ? `🎓 Đã qua kiểm tra (${testResult.correctCount}/${testResult.total})`
              : testResult
                ? `📝 Làm lại bài kiểm tra (${testResult.correctCount}/${testResult.total} lần trước)`
                : '📝 Làm bài kiểm tra'
            }
          </button>
        )}
      </div>
    </div>
  )
}

// ── Lesson Card ───────────────────────────────────────────────
function LessonCard({
  lesson,
  isCompleted,
  onOpen,
}: {
  lesson: Lesson
  isCompleted: boolean
  onOpen: () => void
}) {
  const catStyle = CAT_COLOR[lesson.category]

  return (
    <button
      onClick={onOpen}
      className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
      style={{
        background: '#181818',
        border: isCompleted ? '1.5px solid rgba(74,222,128,0.35)' : '1px solid #2c2c2c',
      }}>
      <div className="px-4 py-4 flex items-start gap-3.5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
             style={{ background: '#111', border: `1px solid ${catStyle.border}` }}>
          {lesson.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="rounded-full px-2 py-0.5 font-semibold"
                  style={{ fontSize: '10px', background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
              {lesson.category}
            </span>
            {isCompleted && (
              <span className="rounded-full px-2 py-0.5 font-bold"
                    style={{ fontSize: '10px', background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                ✓ Hoàn thành
              </span>
            )}
          </div>
          <p className="text-white font-bold leading-snug" style={{ fontSize: '14px' }}>{lesson.title}</p>
          <p className="mt-1 line-clamp-2" style={{ fontSize: '12px', color: '#707070', lineHeight: 1.5 }}>{lesson.summary}</p>
          <p className="mt-2" style={{ fontSize: '11px', color: '#484848' }}>⏱ {lesson.duration}</p>
        </div>

        <span style={{ fontSize: '16px', color: '#484848', flexShrink: 0, marginTop: 2 }}>›</span>
      </div>
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

export default function TrainingLibraryPage({ onClose }: Props) {
  const [completed, setCompleted]           = useState<Set<string>>(loadCompleted)
  const [testResults, setTestResults]       = useState<Record<string, TestResult>>(loadTestResults)
  const [activeCategory, setActiveCategory] = useState<LessonCategory | 'Tất cả'>('Tất cả')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [showTest, setShowTest]             = useState(false)

  const categories: Array<LessonCategory | 'Tất cả'> = ['Tất cả', ...lessonCategories]

  const filtered = activeCategory === 'Tất cả'
    ? mockLessons
    : mockLessons.filter(l => l.category === activeCategory)

  const totalCount     = mockLessons.length
  const completedCount = mockLessons.filter(l => completed.has(l.id)).length
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  function handleComplete(lessonId: string) {
    const next = new Set(completed)
    next.add(lessonId)
    setCompleted(next)
    saveCompleted(next)
  }

  // Sync on mount in case localStorage was updated elsewhere
  useEffect(() => {
    setCompleted(loadCompleted())
    setTestResults(loadTestResults())
  }, [])

  if (selectedLesson) {
    const test       = lessonTests.find(t => t.lessonId === selectedLesson.id) ?? null
    const testResult = testResults[selectedLesson.id] ?? null

    return (
      <>
        <LessonDetail
          lesson={selectedLesson}
          isCompleted={completed.has(selectedLesson.id)}
          testResult={testResult}
          onComplete={() => handleComplete(selectedLesson.id)}
          onStartTest={() => setShowTest(true)}
          onBack={() => setSelectedLesson(null)}
        />
        {showTest && test && (
          <TrainingTestPage
            test={test}
            lessonTitle={selectedLesson.title}
            onClose={(result) => {
              setShowTest(false)
              if (result) setTestResults(loadTestResults())
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <div className="flex items-center gap-3 max-w-[430px] mx-auto mb-4">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', color: '#909090', fontSize: '18px' }}>
            ×
          </button>
          <div className="flex-1">
            <p className="text-white font-black" style={{ fontSize: '17px' }}>📚 Học viện Centosy</p>
            <p style={{ fontSize: '12px', color: '#585858', marginTop: 1 }}>
              {completedCount}/{totalCount} bài · {pct}% hoàn thành
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full max-w-[430px] mx-auto mb-4" style={{ background: '#1e1e1e' }}>
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#E94E1B,#4ade80)' }} />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar max-w-[430px] mx-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'filter-pill-active' : 'filter-pill-inactive'}
              style={{ whiteSpace: 'nowrap' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[430px] mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="rounded-2xl text-center py-10"
               style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '32px', marginBottom: 12 }}>📖</p>
            <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có bài học trong nhóm này.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={completed.has(lesson.id)}
                onOpen={() => setSelectedLesson(lesson)}
              />
            ))}
          </div>
        )}

        {/* All done banner */}
        {completedCount === totalCount && totalCount > 0 && (
          <div className="mt-4 rounded-2xl px-4 py-4 text-center"
               style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <p style={{ fontSize: '24px', marginBottom: 8 }}>🎉</p>
            <p className="font-black" style={{ fontSize: '15px', color: '#4ade80' }}>Xuất sắc! Bạn đã học hết tất cả bài!</p>
            <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>Tiếp tục ôn luyện để ghi nhớ tốt hơn</p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
