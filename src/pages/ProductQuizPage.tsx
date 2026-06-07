import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { saveGameResultSafe, checkDailyPlayLimit } from '../lib/gameService'
import { useGameRecognition } from '../lib/useGameRecognition'
import GameScoreToast from '../components/games/GameScoreToast'
import { calcSpeedScore, analyzeSessionAntiCheat, getSpeedLabel } from '../lib/speedScoring'
import { hapticLight, hapticSuccess, hapticError, hapticCelebration } from '../lib/mobileUtils'
import { soundSelect, soundCorrect, soundWrong, soundComplete, isMuted, toggleMute } from '../lib/gameSounds'

// ── Types ─────────────────────────────────────────────────────
interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctIndex: number
  points: number
  explanation?: string
}

interface QuizAnswer {
  questionId:   number
  selectedIndex: number
  isCorrect:    boolean
  points:       number    // final points after speed bonus
  speedBonus:   number
  timeTakenMs:  number
  isSuspicious: boolean
}

interface Props {
  onClose: () => void
}

// ── Mock questions (kiến thức sản phẩm Centosy) ──────────────
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Giày patin Centosy phù hợp với độ tuổi nào là phổ biến nhất?',
    options: ['3–5 tuổi', '5–12 tuổi', '15–25 tuổi', 'Người cao tuổi'],
    correctIndex: 1,
    points: 10,
    explanation: 'Dòng sản phẩm chính của Centosy phục vụ trẻ em từ 5–12 tuổi.',
  },
  {
    id: 2,
    question: 'Cụm từ nào mô tả đúng nhất bánh xe patin loại cao cấp?',
    options: ['Bánh nhựa cứng', 'Bánh polyurethane (PU)', 'Bánh cao su đặc', 'Bánh foam'],
    correctIndex: 1,
    points: 10,
    explanation: 'Bánh PU (polyurethane) là tiêu chuẩn cao cấp — êm, bám đường, bền.',
  },
  {
    id: 3,
    question: 'Thông số nào cần hỏi khách trước khi tư vấn giày patin?',
    options: ['Màu sắc yêu thích', 'Số chân và cân nặng', 'Chiều cao bố mẹ', 'Trường học của trẻ'],
    correctIndex: 1,
    points: 10,
    explanation: 'Số chân + cân nặng là 2 thông số cốt lõi để chọn size và loại giày đúng.',
  },
  {
    id: 4,
    question: 'Khi khách hỏi "bánh xe bao lâu phải thay?", câu trả lời chuẩn nhất là?',
    options: [
      '1 tháng',
      'Khi bánh mòn hoặc rách, tùy cường độ dùng',
      '6 tháng bắt buộc',
      'Không cần thay, dùng mãi',
    ],
    correctIndex: 1,
    points: 10,
    explanation: 'Tuổi thọ bánh xe phụ thuộc cường độ sử dụng — không có con số cố định.',
  },
  {
    id: 5,
    question: 'Thiết bị bảo hộ tối thiểu cần có khi trẻ mới học patin?',
    options: [
      'Chỉ cần mũ bảo hiểm',
      'Mũ + bảo vệ tay + bảo vệ gối',
      'Không cần gì, trẻ cứng cáp',
      'Chỉ cần gang tay',
    ],
    correctIndex: 1,
    points: 10,
    explanation: 'Bộ 3 bảo hộ cơ bản: mũ + bảo vệ cổ tay + bảo vệ gối — giảm ngã tối đa.',
  },
  {
    id: 6,
    question: 'Giày patin inline khác giày patin quad ở điểm nào?',
    options: [
      'Bánh xếp thành hàng dọc vs bánh xếp 4 góc',
      'Màu sắc khác nhau',
      'Inline cho trẻ em, quad cho người lớn',
      'Không có sự khác biệt',
    ],
    correctIndex: 0,
    points: 10,
    explanation: 'Inline = bánh xếp dọc 1 hàng; Quad = 4 bánh xếp ở 4 góc.',
  },
  {
    id: 7,
    question: 'Điều nên làm khi khách phàn nàn bánh xe kêu cọ cọ?',
    options: [
      'Nói khách dùng bình thường, không sao',
      'Kiểm tra vòng bi, vệ sinh hoặc thay vòng bi',
      'Đổi sang đôi giày khác luôn',
      'Bảo khách về tra dầu nhớt ô tô',
    ],
    correctIndex: 1,
    points: 10,
    explanation: 'Tiếng kêu thường do vòng bi bị bẩn hoặc hỏng — kiểm tra + vệ sinh/thay là chuẩn.',
  },
  {
    id: 8,
    question: 'Chính sách bảo hành phổ biến với giày patin Centosy là bao lâu?',
    options: ['Không bảo hành', '1 tháng', '3–6 tháng lỗi kỹ thuật', '5 năm toàn bộ'],
    correctIndex: 2,
    points: 10,
    explanation: 'Bảo hành 3–6 tháng cho lỗi kỹ thuật từ nhà sản xuất là tiêu chuẩn.',
  },
  {
    id: 9,
    question: 'Khi tư vấn upsell, sản phẩm đi kèm phù hợp nhất với giày patin là?',
    options: [
      'Áo mưa',
      'Bộ bảo hộ + túi đựng giày',
      'Mũ bảo hiểm xe máy',
      'Bình nước thể thao',
    ],
    correctIndex: 1,
    points: 10,
    explanation: 'Bộ bảo hộ + túi đựng là combo upsell tự nhiên, tăng giá trị đơn hàng.',
  },
  {
    id: 10,
    question: 'Cách vệ sinh giày patin đúng cách?',
    options: [
      'Ngâm nước 30 phút',
      'Lau khô, tháo bánh xe vệ sinh riêng nếu cần',
      'Rửa bằng vòi nước mạnh',
      'Không cần vệ sinh',
    ],
    correctIndex: 1,
    points: 10,
    explanation: 'Không ngâm nước — lau khô phần giày, tháo bánh và vòng bi vệ sinh riêng.',
  },
]

// ── Intro Screen ──────────────────────────────────────────────
function IntroScreen({
  onStart, onClose, playsUsed, maxPlays,
}: {
  onStart: () => void
  onClose: () => void
  playsUsed: number
  maxPlays: number
}) {
  const playsLeft = Math.max(0, maxPlays - playsUsed)
  const canPlay   = playsLeft > 0

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl z-10 flex flex-col overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        <div className="px-5 pt-3 pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                 style={{ background: '#1a1a1a', border: '1px solid rgba(233,78,27,0.35)' }}>
              📚
            </div>
            <div>
              <p className="text-white font-black" style={{ fontSize: '17px' }}>Quiz Kiến Thức Sản Phẩm</p>
              <p style={{ fontSize: '12px', color: '#909090', marginTop: 3 }}>Kiểm tra hiểu biết về sản phẩm Centosy</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: '❓', value: '10', label: 'Câu hỏi' },
              { icon: '🏅', value: '100', label: 'Điểm tối đa' },
              { icon: '⏱', value: '~5 phút', label: 'Thời gian' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center"
                   style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
                <p style={{ fontSize: '18px', marginBottom: 4 }}>{s.icon}</p>
                <p className="font-black text-white" style={{ fontSize: '14px' }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div className="rounded-2xl p-4 mb-5"
               style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '11px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              Luật chơi
            </p>
            {[
              'Mỗi câu hỏi có 4 đáp án, chọn 1',
              'Đúng = +10 điểm, sai = 0 điểm',
              'Không giới hạn thời gian mỗi câu',
              'Xem giải thích sau mỗi câu',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: 1 }}>
                  {['📌','🎯','⏳','💡'][i]}
                </span>
                <p style={{ fontSize: '13px', color: '#c0c0c0', lineHeight: 1.55 }}>{rule}</p>
              </div>
            ))}
          </div>

          {/* Play limit indicator */}
          <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
               style={{
                 background: canPlay ? 'rgba(74,222,128,0.07)' : 'rgba(239,68,68,0.07)',
                 border:     `1px solid ${canPlay ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)'}`,
               }}>
            <span style={{ fontSize: '16px' }}>{canPlay ? '🎮' : '🚫'}</span>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: canPlay ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                {canPlay
                  ? `Còn ${playsLeft}/${maxPlays} lượt tính điểm hôm nay`
                  : `Đã hết lượt tính điểm hôm nay (${maxPlays}/${maxPlays})`}
              </p>
              {!canPlay && (
                <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>
                  Vẫn có thể chơi luyện tập, nhưng không cộng điểm
                </p>
              )}
            </div>
            {/* Dots */}
            <div className="flex gap-1 shrink-0">
              {Array.from({ length: maxPlays }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full"
                     style={{ background: i < playsUsed ? (canPlay ? '#4ade80' : '#ef4444') : '#2c2c2c' }} />
              ))}
            </div>
          </div>

          <button
            className="btn-primary w-full py-3.5 font-black"
            style={{ fontSize: '15px', opacity: 1 }}
            onClick={onStart}>
            {canPlay ? 'Bắt đầu quiz →' : 'Chơi luyện tập (0đ) →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Question Screen ───────────────────────────────────────────
function QuestionScreen({
  question,
  index,
  total,
  score,
  onAnswer,
}: {
  question: QuizQuestion
  index: number
  total: number
  score: number
  onAnswer: (selectedIndex: number) => void
}) {
  const [selected, setSelected]         = useState<number | null>(null)
  const [confirmed, setConfirmed]       = useState(false)
  const [questionMs, setQuestionMs]     = useState(0)
  const [muted, setMuted]              = useState(isMuted)
  const questionStart                   = useRef(Date.now())

  const handleSelect = (i: number) => {
    if (confirmed) return
    hapticLight(); soundSelect()
    setSelected(i)
  }

  const handleConfirm = () => {
    if (selected === null) return
    const ms = Date.now() - questionStart.current
    setQuestionMs(ms)
    const correct = selected === question.correctIndex
    if (correct) { hapticSuccess(); soundCorrect() }
    else { hapticError(); soundWrong() }
    setConfirmed(true)
  }

  const handleNext = () => {
    if (selected === null) return
    hapticLight()
    onAnswer(selected)
    setSelected(null)
    setConfirmed(false)
  }

  const isCorrect = confirmed && selected === question.correctIndex
  const isWrong   = confirmed && selected !== null && selected !== question.correctIndex

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-safe-top pt-4 pb-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <div className="flex items-center justify-between mb-3 max-w-[430px] mx-auto">
          <span style={{ fontSize: '13px', color: '#585858' }}>Câu {index + 1}/{total}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted(toggleMute())}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#1a1a1a', border: '1px solid #2c2c2c', fontSize: '14px' }}>
              {muted ? '🔇' : '🔊'}
            </button>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1"
                 style={{ background: '#1a1a1a', border: '1px solid #2c2c2c' }}>
              <span style={{ fontSize: '14px' }}>🏅</span>
              <span className="font-black" style={{ fontSize: '13px', color: '#E94E1B' }}>{score}đ</span>
            </div>
          </div>
        </div>
        {/* Progress bar */}
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
          <p style={{ fontSize: '11px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Câu hỏi {index + 1}
          </p>
          <p className="text-white font-bold leading-snug" style={{ fontSize: '16px' }}>
            {question.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5 mb-5">
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
                onClick={() => handleSelect(i)}
                className="w-full text-left rounded-2xl px-4 py-3.5 transition-all active:scale-[0.98]"
                style={{
                  background: bgColor,
                  border: `1.5px solid ${borderColor}`,
                  cursor: confirmed ? 'default' : 'pointer',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black"
                        style={{ fontSize: '11px', background: '#252525', color: '#585858' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: '14px', color: textColor, flex: 1, lineHeight: 1.45 }}>
                    {opt}
                  </span>
                  {icon && (
                    <span className="font-black shrink-0" style={{ fontSize: '16px', color: textColor }}>
                      {icon}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {confirmed && question.explanation && (
          <div className="rounded-2xl px-4 py-3.5 mb-4"
               style={{
                 background: isCorrect ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)',
                 border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)'}`,
               }}>
            <div className="flex items-start gap-2.5">
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{isCorrect ? '🎉' : '📖'}</span>
              <div>
                <p className="font-bold mb-1" style={{ fontSize: '12px', color: isCorrect ? '#4ade80' : '#f87171' }}>
                  {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                  {isCorrect && (() => {
                    const spd = getSpeedLabel(questionMs)
                    const bonus = Math.round(Math.max(0, 1 - questionMs / 15000) * 0.5 * question.points)
                    return (
                      <>
                        <span className="ml-1.5" style={{ color: '#E94E1B' }}>+{question.points + bonus}đ</span>
                        {bonus > 0 && <span className="ml-1" style={{ color: '#facc15', fontSize: '10px' }}>(+{bonus} speed)</span>}
                        <span className="ml-1.5" style={{ fontSize: '10px', color: spd.color }}>{spd.label}</span>
                      </>
                    )
                  })()}
                </p>
                <p style={{ fontSize: '13px', color: '#b0b0b0', lineHeight: 1.55 }}>{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Wrong feedback badge */}
        {isWrong && (
          <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-2.5"
               style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ fontSize: '16px' }}>💡</span>
            <p style={{ fontSize: '13px', color: '#f87171' }}>
              Đáp án đúng: <span className="font-bold">{String.fromCharCode(65 + question.correctIndex)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="shrink-0 px-4 pb-8 pt-3 max-w-[430px] mx-auto w-full"
           style={{ borderTop: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        {!confirmed ? (
          <button
            className="w-full py-3.5 rounded-2xl font-black transition-all active:scale-[0.97]"
            style={{
              fontSize: '15px',
              background: selected !== null
                ? 'linear-gradient(90deg,#E94E1B,#FF5A28)'
                : '#1e1e1e',
              color: selected !== null ? '#fff' : '#484848',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              boxShadow: selected !== null ? '0 4px 16px rgba(233,78,27,0.3)' : 'none',
            }}
            onClick={handleConfirm}
            disabled={selected === null}
          >
            Xác nhận đáp án
          </button>
        ) : (
          <button
            className="btn-primary w-full py-3.5 font-black"
            style={{ fontSize: '15px' }}
            onClick={handleNext}
          >
            {index + 1 < QUIZ_QUESTIONS.length ? 'Câu tiếp theo →' : 'Xem kết quả 🏁'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Result Screen ─────────────────────────────────────────────
function ResultScreen({
  answers,
  onReplay,
  onClose,
}: {
  answers: QuizAnswer[]
  onReplay: () => void
  onClose: () => void
}) {
  const totalScore    = answers.reduce((s, a) => s + a.points, 0)
  const correctCount  = answers.filter(a => a.isCorrect).length
  const total         = answers.length
  const pct           = Math.round((correctCount / total) * 100)

  let grade: { label: string; color: string; icon: string }
  if (pct >= 90)      grade = { label: 'Xuất sắc!', color: '#4ade80', icon: '🏆' }
  else if (pct >= 70) grade = { label: 'Giỏi!', color: '#E94E1B', icon: '🎉' }
  else if (pct >= 50) grade = { label: 'Khá!', color: '#facc15', icon: '👍' }
  else                grade = { label: 'Cần ôn thêm', color: '#f87171', icon: '📚' }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a0a0a' }}>
      <div className="flex-1 overflow-y-auto px-4 pt-10 pb-6 max-w-[430px] mx-auto w-full">
        {/* Score hero */}
        <div className="text-center mb-6">
          <p style={{ fontSize: '48px', marginBottom: 8 }}>{grade.icon}</p>
          <p className="font-black" style={{ fontSize: '28px', color: grade.color }}>{grade.label}</p>
          <p style={{ fontSize: '14px', color: '#909090', marginTop: 6 }}>
            {correctCount}/{total} câu đúng · {pct}%
          </p>
        </div>

        {/* Points card */}
        <div className="rounded-2xl p-5 mb-4 text-center"
             style={{ background: '#181818', border: '1.5px solid rgba(233,78,27,0.35)' }}>
          <p style={{ fontSize: '12px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            Điểm kiếm được
          </p>
          <p className="font-black" style={{ fontSize: '40px', color: '#E94E1B', lineHeight: 1 }}>
            {totalScore}
          </p>
          <p style={{ fontSize: '13px', color: '#585858', marginTop: 6 }}>/ 100 điểm</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-2xl p-4 text-center" style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '22px', color: '#4ade80', fontWeight: 900 }}>{correctCount}</p>
            <p style={{ fontSize: '11px', color: '#585858', marginTop: 3 }}>Câu đúng</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '22px', color: '#f87171', fontWeight: 900 }}>{total - correctCount}</p>
            <p style={{ fontSize: '11px', color: '#585858', marginTop: 3 }}>Câu sai</p>
          </div>
        </div>

        {/* Question review */}
        <div className="rounded-2xl overflow-hidden mb-5"
             style={{ border: '1px solid #2c2c2c' }}>
          <div className="px-4 py-3" style={{ background: '#181818', borderBottom: '1px solid #2c2c2c' }}>
            <p style={{ fontSize: '11px', color: '#585858', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Chi tiết từng câu
            </p>
          </div>
          {answers.map((ans, i) => {
            const q = QUIZ_QUESTIONS[i]
            return (
              <div key={ans.questionId}
                   className="flex items-center gap-3 px-4 py-3"
                   style={{
                     background: '#141414',
                     borderBottom: i < answers.length - 1 ? '1px solid #1e1e1e' : 'none',
                   }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black"
                     style={{
                       fontSize: '11px',
                       background: ans.isCorrect ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                       color: ans.isCorrect ? '#4ade80' : '#f87171',
                     }}>
                  {ans.isCorrect ? '✓' : '✗'}
                </div>
                <p style={{ fontSize: '12px', color: '#909090', flex: 1, lineHeight: 1.45 }}>
                  {q?.question ?? `Câu ${i + 1}`}
                </p>
                <span className="font-black shrink-0" style={{ fontSize: '12px', color: ans.isCorrect ? '#4ade80' : '#585858' }}>
                  {ans.isCorrect ? `+${ans.points}` : '0'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Buttons */}
      <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2.5 max-w-[430px] mx-auto w-full"
           style={{ borderTop: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <button
          className="btn-primary w-full py-3.5 font-black"
          style={{ fontSize: '15px' }}
          onClick={onReplay}>
          Chơi lại 🔄
        </button>
        <button
          className="w-full py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.97]"
          style={{ fontSize: '14px', color: '#909090', background: '#181818', border: '1px solid #2c2c2c' }}
          onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function ProductQuizPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const { checkRecognition, result: recognitionResult, clear: clearRecognition } = useGameRecognition()
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [showToast, setShowToast] = useState(false)
  const [playsUsed, setPlaysUsed] = useState(0)
  const MAX_PLAYS = 3
  const hasSaved = useRef(false)
  const startTime = useRef<number>(0)
  const questionStartTime = useRef<number>(0)
  const MAX_SCORE = QUIZ_QUESTIONS.reduce((s, q) => s + q.points, 0)

  useEffect(() => {
    if (!currentUser?.id) return
    void checkDailyPlayLimit(currentUser.id, 'product_quiz', MAX_PLAYS).then(res => {
      setPlaysUsed(res.todayPlayCount)
    })
  }, [currentUser?.id])

  const handleStart = () => {
    setPhase('playing')
    setCurrentIndex(0)
    setScore(0)
    setAnswers([])
    hasSaved.current = false
    startTime.current = Date.now()
    questionStartTime.current = Date.now()
  }

  const handleAnswer = (selectedIndex: number) => {
    const now = Date.now()
    const q = QUIZ_QUESTIONS[currentIndex]
    const isCorrect = selectedIndex === q.correctIndex
    const timeTakenMs = now - questionStartTime.current
    questionStartTime.current = now

    // Speed scoring + anti-cheat
    const speedResult = calcSpeedScore({ basePoints: q.points, isCorrect, timeTakenMs })

    const newAnswer: QuizAnswer = {
      questionId:    q.id,
      selectedIndex,
      isCorrect,
      points:        speedResult.finalPoints,
      speedBonus:    speedResult.speedBonus,
      timeTakenMs,
      isSuspicious:  speedResult.isSuspicious,
    }
    const newAnswers = [...answers, newAnswer]
    const newScore   = score + speedResult.finalPoints
    setAnswers(newAnswers)
    setScore(newScore)

    if (currentIndex + 1 >= QUIZ_QUESTIONS.length) {
      setPhase('result')
      hapticCelebration(); soundComplete()
      // Anti-cheat session check
      const antiCheat = analyzeSessionAntiCheat(newAnswers.map(a => ({
        isCorrect: a.isCorrect,
        timeTakenMs: a.timeTakenMs,
      })))
      if (antiCheat.isFlagged) {
        console.warn('[speedScoring] suspicious session:', antiCheat.flagReason)
      }

      // Lưu session sau khi hoàn thành
      if (!hasSaved.current && currentUser?.id) {
        hasSaved.current = true
        const durationMs = Date.now() - startTime.current
        // Nếu bị flag: score = 0 (không thưởng gian lận)
        const scoreToSave = antiCheat.isFlagged ? 0 : newScore
        void saveGameResultSafe({
          userId:         currentUser.id,
          gameKey:        'product_quiz',
          gameTitle:      'Quiz Kiến Thức Sản Phẩm',
          score:          scoreToSave,
          maxScore:       MAX_SCORE,
          correctCount:   newAnswers.filter(a => a.isCorrect).length,
          totalQuestions: QUIZ_QUESTIONS.length,
          durationMs,
          answers: newAnswers.map((a, i) => ({
            questionIndex:  i,
            questionText:   QUIZ_QUESTIONS[i]?.question,
            chosenOption:   a.selectedIndex,
            correctOption:  QUIZ_QUESTIONS[i]?.correctIndex ?? 0,
            isCorrect:      a.isCorrect,
            pointsEarned:   a.points,
            timeTakenMs:    a.timeTakenMs,
          })),
        }).then(() => {
          if (currentUser?.id) {
            void checkRecognition(currentUser.id, 'product_quiz', scoreToSave)
              .then(() => setShowToast(true))
          }
        })
      }
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleReplay = () => {
    setPhase('intro')
  }

  if (phase === 'intro') {
    return <IntroScreen onStart={handleStart} onClose={onClose} playsUsed={playsUsed} maxPlays={MAX_PLAYS} />
  }

  if (phase === 'playing') {
    return (
      <QuestionScreen
        question={QUIZ_QUESTIONS[currentIndex]}
        index={currentIndex}
        total={QUIZ_QUESTIONS.length}
        score={score}
        onAnswer={handleAnswer}
      />
    )
  }

  return (
    <>
      <ResultScreen
        answers={answers}
        onReplay={handleReplay}
        onClose={onClose}
      />
      {showToast && recognitionResult && (
        <GameScoreToast
          score={score}
          maxScore={MAX_SCORE}
          isNewRecord={recognitionResult.isNewRecord}
          isTopThree={recognitionResult.isTopThree}
          rank={recognitionResult.rank ?? undefined}
          gameTitle="Quiz Kiến Thức Sản Phẩm"
          onDismiss={() => { setShowToast(false); clearRecognition() }}
        />
      )}
    </>
  )
}
