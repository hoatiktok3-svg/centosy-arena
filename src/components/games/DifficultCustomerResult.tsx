import { useEffect, useRef, useState } from 'react'
import { GameAnswer } from './DifficultCustomerGame'
import { saveGameResultSafe, AnswerLog } from '../../lib/gameService'
import { useAuth } from '../../context/AuthContext'

interface Props {
  answers: GameAnswer[]
  onReplay: () => void
  onBack: () => void
}

type SaveStatus = 'saving' | 'saved' | 'saved-no-credit' | 'error' | 'no-profile'

interface TitleConfig {
  title: string
  subtitle: string
  icon: string
  color: string
  bg: string
  border: string
  glow: string
}

const MAX_SCORE = 125 // 5 câu × 25đ

function getTitle(score: number): TitleConfig {
  if (score >= 100) return {
    title: 'Tư vấn viên bản lĩnh',
    subtitle: 'Bạn xử lý khách hàng như một chuyên gia thực thụ!',
    icon: '🏆',
    color: '#facc15',
    bg: 'rgba(250,204,21,0.08)',
    border: 'rgba(250,204,21,0.3)',
    glow: 'rgba(250,204,21,0.2)',
  }
  if (score >= 70) return {
    title: 'Tư vấn viên nhanh nhạy',
    subtitle: 'Phản xạ tốt, còn một vài điểm cần trau dồi thêm.',
    icon: '⭐',
    color: '#E94E1B',
    bg: 'rgba(233,78,27,0.08)',
    border: 'rgba(233,78,27,0.3)',
    glow: 'rgba(233,78,27,0.2)',
  }
  if (score >= 40) return {
    title: 'Cần luyện thêm',
    subtitle: 'Tiếp tục luyện tập để xử lý tình huống tốt hơn nhé.',
    icon: '💪',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.08)',
    border: 'rgba(96,165,250,0.3)',
    glow: 'rgba(96,165,250,0.2)',
  }
  return {
    title: 'Hãy thử lại',
    subtitle: 'Đừng nản — mỗi lần chơi là một lần học hỏi!',
    icon: '🔄',
    color: '#888',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.12)',
    glow: 'rgba(255,255,255,0.08)',
  }
}

export default function DifficultCustomerResult({ answers, onReplay, onBack }: Props) {
  const { currentUser } = useAuth()
  const hasSaved = useRef(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saving')

  const totalScore     = answers.reduce((s, a) => s + a.score, 0)
  const excellentCount = answers.filter(a => a.score === 25).length
  const correctCount   = answers.filter(a => a.score >= 15).length  // xuất sắc + chuẩn
  const answeredCount  = answers.filter(a => a.chosen !== null).length
  const timeoutCount   = answers.length - answeredCount
  const scorePct       = Math.round((totalScore / MAX_SCORE) * 100)
  const cfg            = getTitle(totalScore)

  // Lưu kết quả vào Supabase 1 lần duy nhất khi component mount
  useEffect(() => {
    if (hasSaved.current) return
    hasSaved.current = true

    async function saveResult() {
      if (!currentUser?.id) {
        setSaveStatus('no-profile')
        console.warn('[DifficultCustomer] Không tìm thấy user — bỏ qua lưu điểm.')
        return
      }

      // Map option letter A/B/C/D → index 0/1/2/3
      const OPTION_INDEX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 }

      const answerLogs: AnswerLog[] = answers.map((a, i) => ({
        questionIndex: i,
        chosenOption:  a.chosen !== null ? (OPTION_INDEX[a.chosen] ?? -1) : -1,
        correctOption: -1,          // game này không có đáp án đúng duy nhất
        isCorrect:     a.score >= 15,
        pointsEarned:  a.score,
      }))

      const { error, scoreCredited } = await saveGameResultSafe({
        userId:         currentUser.id,
        gameKey:        'difficult_customer',
        gameTitle:      'Khách hàng khó tính',
        score:          totalScore,
        maxScore:       MAX_SCORE,
        correctCount:   correctCount,
        totalQuestions: answers.length,
        answers:        answerLogs,
      })

      if (error) {
        setSaveStatus('error')
        console.error('[DifficultCustomer] Lỗi khi lưu điểm:', error)
      } else if (!scoreCredited) {
        setSaveStatus('saved-no-credit')
      } else {
        setSaveStatus('saved')
      }
    }

    saveResult()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset khi người chơi bấm "Chơi lại" để cho phép lưu lần tiếp
  const handleReplay = () => {
    hasSaved.current = false
    onReplay()
  }

  // Chi tiết từng câu
  const SCORE_META: Record<number, { label: string; color: string; icon: string }> = {
    25: { label: 'Xuất sắc',      color: '#4ade80', icon: '⭐' },
    15: { label: 'Chuẩn',         color: '#E94E1B', icon: '✅' },
    5:  { label: 'Tạm được',      color: '#facc15', icon: '🟡' },
    0:  { label: 'Chưa phù hợp',  color: '#ef4444', icon: '❌' },
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
         style={{ background: '#080808' }}>

      {/* ── SCROLLABLE BODY ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-4 flex flex-col gap-5">

        {/* ── HERO: DANH HIỆU ──────────────────────────────── */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">

          {/* Icon glow */}
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-5"
               style={{
                 background: cfg.bg,
                 border: `2px solid ${cfg.border}`,
                 boxShadow: `0 0 40px ${cfg.glow}`,
                 fontSize: '44px',
               }}>
            {cfg.icon}
          </div>

          <p style={{ fontSize: '11px', color: cfg.color, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
            Kết quả
          </p>
          <h1 className="font-black text-white" style={{ fontSize: '24px', letterSpacing: '-0.3px', marginBottom: 8, lineHeight: 1.2 }}>
            {cfg.title}
          </h1>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, maxWidth: 260 }}>
            {cfg.subtitle}
          </p>
        </div>

        {/* ── TỔNG ĐIỂM ────────────────────────────────────── */}
        <div className="rounded-3xl px-5 py-5 flex items-center gap-4"
             style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>

          {/* Score */}
          <div className="flex-1">
            <p style={{ fontSize: '11px', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Tổng điểm
            </p>
            <div className="flex items-end gap-1.5">
              <span className="font-black" style={{ fontSize: '48px', color: cfg.color, lineHeight: 1 }}>
                {totalScore}
              </span>
              <span style={{ fontSize: '16px', color: '#555', marginBottom: 6 }}>/ {MAX_SCORE}</span>
            </div>
          </div>

          {/* Score % ring */}
          <div className="shrink-0 relative w-20 h-20 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1f1f1f" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke={cfg.color} strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - scorePct / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <span className="font-black" style={{ fontSize: '16px', color: cfg.color }}>{scorePct}%</span>
          </div>
        </div>

        {/* ── STATS ROW ────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: '❓', value: `${answers.length}`, label: 'Câu hỏi' },
            { icon: '⭐', value: `${excellentCount}`, label: 'Xuất sắc' },
            { icon: '⏰', value: `${timeoutCount}`,  label: 'Hết giờ'  },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl py-3.5 px-2"
                 style={{ background: '#0E0E0E', border: '1px solid #1f1f1f' }}>
              <span style={{ fontSize: '20px', marginBottom: 4 }}>{s.icon}</span>
              <p className="font-black text-white" style={{ fontSize: '18px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: '#555', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── CHI TIẾT TỪNG CÂU ────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #1a1a1a' }}>
          <div className="px-4 py-3" style={{ background: '#0E0E0E', borderBottom: '1px solid #1a1a1a' }}>
            <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Chi tiết từng câu
            </p>
          </div>

          {answers.map((ans, i) => {
            const meta = ans.chosen === null
              ? { label: 'Hết giờ', color: '#555', icon: '⏰' }
              : SCORE_META[ans.score] ?? { label: 'Không rõ', color: '#555', icon: '❓' }

            return (
              <div key={ans.scenarioId}
                   className="flex items-center px-4 py-3 gap-3"
                   style={{
                     borderBottom: i < answers.length - 1 ? '1px solid #141414' : 'none',
                     background: '#080808',
                   }}>

                {/* Câu số */}
                <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black"
                     style={{ background: '#141414', border: '1px solid #222', fontSize: '12px', color: '#555' }}>
                  {i + 1}
                </div>

                {/* Label */}
                <div className="flex items-center gap-2 flex-1">
                  <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                  <span style={{ fontSize: '13px', color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                  {ans.chosen && (
                    <span style={{ fontSize: '11px', color: '#444' }}>— đáp án {ans.chosen}</span>
                  )}
                </div>

                {/* Điểm */}
                <span className="font-black shrink-0"
                      style={{ fontSize: '15px', color: ans.score > 0 ? meta.color : '#444' }}>
                  +{ans.score}
                </span>
              </div>
            )
          })}
        </div>

        <div className="h-2" />
      </div>

      {/* ── BOTTOM BUTTONS ───────────────────────────────────── */}
      <div className="shrink-0 px-4 pb-8 pt-3 flex flex-col gap-2.5"
           style={{ borderTop: '1px solid #1a1a1a', background: '#080808' }}>

        {/* Save status badge */}
        {saveStatus === 'saving' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ fontSize: '12px', color: '#555' }}>⏳ Đang lưu điểm...</span>
          </div>
        )}
        {saveStatus === 'saved' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600 }}>✅ Đã lưu điểm vào BXH</span>
          </div>
        )}
        {saveStatus === 'saved-no-credit' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ fontSize: '12px', color: '#facc15' }}>⭐ Đã lưu — điểm chỉ tính lần đầu mỗi ngày</span>
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ fontSize: '12px', color: '#ef4444' }}>⚠️ Chưa lưu được điểm, vui lòng thử lại</span>
          </div>
        )}
        {saveStatus === 'no-profile' && (
          <div className="flex items-center justify-center gap-2 py-2">
            <span style={{ fontSize: '12px', color: '#888' }}>⚠️ Không tìm thấy hồ sơ người chơi.</span>
          </div>
        )}

        <button
          onClick={handleReplay}
          className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
          style={{ fontSize: '15px', letterSpacing: '0.03em', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}>
          🔄 Chơi lại
        </button>

        <button
          onClick={onBack}
          className="w-full font-semibold rounded-2xl py-3.5 transition-all active:scale-[0.98]"
          style={{ fontSize: '14px', color: '#666', background: 'transparent', border: '1px solid #222' }}>
          ← Quay về Game Center
        </button>
      </div>

    </div>
  )
}
