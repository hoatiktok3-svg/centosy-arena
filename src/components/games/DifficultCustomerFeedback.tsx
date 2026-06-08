import { useState, useEffect } from 'react'
import { CustomerScenario } from '../../data/mockDifficultCustomer'

interface Props {
  scenario: CustomerScenario
  chosen: 'A' | 'B' | 'C' | 'D' | null
  onNext: () => void
  isLast: boolean
  questionNumber: number
  total: number
}

type Grade = 'excellent' | 'good' | 'ok' | 'wrong' | 'timeout'

interface GradeConfig {
  label: string
  icon: string
  color: string
  bg: string
  border: string
  scoreBg: string
}

const GRADE_CONFIG: Record<Grade, GradeConfig> = {
  excellent: {
    label: 'Xuất sắc',
    icon: '⭐',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.08)',
    border: 'rgba(74,222,128,0.3)',
    scoreBg: 'rgba(74,222,128,0.15)',
  },
  good: {
    label: 'Chuẩn',
    icon: '✅',
    color: '#E94E1B',
    bg: 'rgba(233,78,27,0.08)',
    border: 'rgba(233,78,27,0.3)',
    scoreBg: 'rgba(233,78,27,0.15)',
  },
  ok: {
    label: 'Tạm được',
    icon: '🟡',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.3)',
    scoreBg: 'rgba(250,204,21,0.15)',
  },
  wrong: {
    label: 'Chưa phù hợp',
    icon: '❌',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    scoreBg: 'rgba(239,68,68,0.15)',
  },
  timeout: {
    label: 'Hết giờ',
    icon: '⏰',
    color: '#888',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.1)',
    scoreBg: 'rgba(255,255,255,0.06)',
  },
}

function getGrade(chosen: 'A' | 'B' | 'C' | 'D' | null, score: number): Grade {
  if (!chosen) return 'timeout'
  if (score >= 25) return 'excellent'
  if (score >= 15) return 'good'
  if (score >= 5)  return 'ok'
  return 'wrong'
}

const AUTO_ADVANCE_MS = 2200

export default function DifficultCustomerFeedback({ scenario, chosen, onNext, isLast, questionNumber, total }: Props) {
  const score    = chosen ? scenario.scoreByOption[chosen] : 0
  const grade    = getGrade(chosen, score)
  const cfg      = GRADE_CONFIG[grade]
  const chosenOpt = chosen ? scenario.options.find(o => o.id === chosen) : null
  const bestOpt   = scenario.options.find(o => o.id === scenario.bestAnswer)!
  const showBestSeparately = chosen !== scenario.bestAnswer

  // Auto-advance countdown
  const [progress, setProgress] = useState(0)
  const [advanced, setAdvanced] = useState(false)

  useEffect(() => {
    setProgress(0)
    setAdvanced(false)
    const step = 50
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + (step / AUTO_ADVANCE_MS) * 100
        return next >= 100 ? 100 : next
      })
    }, step)
    const timeout = setTimeout(() => {
      setAdvanced(true)
      onNext()
    }, AUTO_ADVANCE_MS)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [questionNumber])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (advanced) return
    setAdvanced(true)
    onNext()
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── SCROLLABLE CONTENT ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">

        {/* ── STATUS BADGE + SCORE ────────────────────────── */}
        <div className="rounded-3xl px-5 py-5 flex items-center gap-4"
             style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>

          {/* Icon */}
          <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
               style={{ background: cfg.scoreBg, fontSize: '28px' }}>
            {cfg.icon}
          </div>

          {/* Label + Score */}
          <div className="flex-1">
            <p style={{ fontSize: '11px', color: cfg.color, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
              {cfg.label}
            </p>
            <p className="font-black" style={{ fontSize: '28px', color: cfg.color, lineHeight: 1 }}>
              +{score}
              <span style={{ fontSize: '14px', fontWeight: 500, color: cfg.color, opacity: 0.7, marginLeft: 4 }}>điểm</span>
            </p>
          </div>

          {/* Question counter */}
          <div className="shrink-0 text-right">
            <p style={{ fontSize: '11px', color: '#555' }}>Câu</p>
            <p className="font-black" style={{ fontSize: '18px', color: '#888' }}>
              {questionNumber}<span style={{ fontSize: '12px', color: '#444' }}>/{total}</span>
            </p>
          </div>
        </div>

        {/* ── TIMEOUT MESSAGE ──────────────────────────────── */}
        {grade === 'timeout' && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
               style={{ background: '#141414', border: '1px solid #222' }}>
            <span style={{ fontSize: '20px' }}>⏰</span>
            <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
              Bạn đã <span style={{ color: '#fff', fontWeight: 700 }}>hết thời gian</span> — không nhận được điểm cho câu này.
            </p>
          </div>
        )}

        {/* ── BẠN ĐÃ CHỌN ─────────────────────────────────── */}
        {chosenOpt && (
          <div>
            <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              Bạn đã chọn
            </p>
            <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
                 style={{
                   background: showBestSeparately ? 'rgba(239,68,68,0.06)' : 'rgba(74,222,128,0.06)',
                   border: `1px solid ${showBestSeparately ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}`,
                 }}>
              {/* Option circle */}
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black"
                   style={{
                     fontSize: '12px',
                     color: showBestSeparately ? '#ef4444' : '#4ade80',
                     background: showBestSeparately ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                     border: `1.5px solid ${showBestSeparately ? 'rgba(239,68,68,0.5)' : 'rgba(74,222,128,0.5)'}`,
                   }}>
                {chosenOpt.id}
              </div>
              <p style={{ fontSize: '13px', color: showBestSeparately ? '#fca5a5' : '#bbf7d0', lineHeight: 1.6, flex: 1 }}>
                {chosenOpt.text}
              </p>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>
                {showBestSeparately ? '✗' : '✓'}
              </span>
            </div>
          </div>
        )}

        {/* ── ĐÁP ÁN TỐT NHẤT (chỉ show nếu chọn sai hoặc hết giờ) ── */}
        {showBestSeparately && (
          <div>
            <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              Đáp án tốt nhất
            </p>
            <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
                 style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)' }}>
              <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black"
                   style={{ fontSize: '12px', color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1.5px solid rgba(74,222,128,0.5)' }}>
                {bestOpt.id}
              </div>
              <p style={{ fontSize: '13px', color: '#bbf7d0', lineHeight: 1.6, flex: 1 }}>
                {bestOpt.text}
              </p>
              <span style={{ fontSize: '16px', flexShrink: 0, color: '#4ade80' }}>✓</span>
            </div>
          </div>
        )}

        {/* ── GIẢI THÍCH ───────────────────────────────────── */}
        <div className="rounded-2xl px-4 py-4"
             style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
          <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
            💡 Giải thích
          </p>
          <p style={{ fontSize: '13px', color: '#bbb', lineHeight: 1.75 }}>
            {scenario.explanation}
          </p>
        </div>

        {/* ── BẢNG ĐIỂM 4 ĐÁP ÁN ─────────────────────────── */}
        <div className="rounded-2xl px-4 py-3.5"
             style={{ background: '#0E0E0E', border: '1px solid #1a1a1a' }}>
          <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Điểm từng lựa chọn
          </p>
          <div className="flex gap-2">
            {(['A', 'B', 'C', 'D'] as const).map(id => {
              const pts       = scenario.scoreByOption[id]
              const isBest    = id === scenario.bestAnswer
              const isChosen  = id === chosen
              const labelColor =
                isBest    ? '#4ade80' :
                pts >= 15 ? '#E94E1B' :
                pts >= 5  ? '#facc15' : '#555'

              return (
                <div key={id} className="flex-1 flex flex-col items-center rounded-xl py-2.5 gap-0.5"
                     style={{
                       background: isBest ? 'rgba(74,222,128,0.08)' : isChosen ? 'rgba(255,255,255,0.04)' : '#141414',
                       border: `1px solid ${isBest ? 'rgba(74,222,128,0.3)' : isChosen ? '#333' : '#1f1f1f'}`,
                     }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: labelColor }}>{id}</span>
                  <span style={{ fontSize: '14px', fontWeight: 900, color: labelColor }}>{pts}</span>
                  {isBest && <span style={{ fontSize: '9px', color: '#4ade80', opacity: 0.7 }}>best</span>}
                  {isChosen && !isBest && <span style={{ fontSize: '9px', color: '#555' }}>bạn</span>}
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* ── BOTTOM BUTTON + AUTO-ADVANCE BAR ──────────────── */}
      <div className="shrink-0 px-4 pb-8 pt-3"
           style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>
        {/* Auto-advance progress bar */}
        <div className="w-full h-1 rounded-full mb-3 overflow-hidden"
             style={{ background: '#1f1f1f' }}>
          <div className="h-full rounded-full transition-none"
               style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }} />
        </div>
        <button
          onClick={handleNext}
          disabled={advanced}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ fontSize: '15px', letterSpacing: '0.03em', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
          {isLast ? '🏁 Xem kết quả' : `Câu tiếp theo → (${questionNumber + 1}/${total})`}
        </button>
        <p style={{ fontSize: '10px', color: '#444', textAlign: 'center', marginTop: 8 }}>
          Tự chuyển sau {(AUTO_ADVANCE_MS / 1000).toFixed(1)}s — hoặc nhấn để chuyển ngay
        </p>
      </div>

    </div>
  )
}
