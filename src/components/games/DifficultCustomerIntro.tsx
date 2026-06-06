interface Props {
  onStart: () => void
  onBack: () => void
}

const SCORE_RULES = [
  { label: 'Xuất sắc',  points: 25, color: '#E94E1B', bg: 'rgba(233,78,27,0.12)',  border: 'rgba(233,78,27,0.3)',  icon: '⭐' },
  { label: 'Chuẩn',     points: 15, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', icon: '✅' },
  { label: 'Tạm được',  points: 5,  color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.2)', icon: '🟡' },
  { label: 'Sai',       points: 0,  color: '#666',    bg: 'rgba(255,255,255,0.03)',border: 'rgba(255,255,255,0.08)', icon: '❌' },
]

const BLOCKS = ['Cửa hàng', 'TMĐT', 'KDTT']

export default function DifficultCustomerIntro({ onStart, onBack }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center"
         style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>

      {/* Sheet slide up */}
      <div className="w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
           style={{ background: '#0E0E0E', border: '1px solid rgba(255,255,255,0.06)', borderBottom: 'none', maxHeight: '92vh' }}>

        {/* ── Drag handle ── */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        {/* ── Scrollable content ── */}
        <div className="overflow-y-auto flex-1 px-5 pb-2">

          {/* Hero */}
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-4"
                 style={{ background: 'linear-gradient(135deg,rgba(233,78,27,0.2),rgba(233,78,27,0.05))', border: '2px solid rgba(233,78,27,0.3)', boxShadow: '0 0 24px rgba(233,78,27,0.15)', fontSize: '40px' }}>
              😤
            </div>
            <h1 className="font-black text-white leading-tight" style={{ fontSize: '22px', letterSpacing: '-0.3px' }}>
              Khách Hàng Khó Tính
            </h1>
            <p style={{ fontSize: '13px', color: '#888', marginTop: 8, lineHeight: 1.6, maxWidth: 280 }}>
              Chọn cách xử lý phù hợp nhất cho từng tình huống khách hàng thực tế
            </p>
          </div>

          {/* ── Thông số game ── */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {[
              { icon: '❓', value: '5 câu', label: 'Mỗi lượt' },
              { icon: '⏱', value: '20 giây', label: 'Mỗi câu' },
              { icon: '🏅', value: '125đ', label: 'Tối đa' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl py-3.5 px-2"
                   style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '20px', marginBottom: 4 }}>{s.icon}</span>
                <p className="font-black text-white" style={{ fontSize: '13px' }}>{s.value}</p>
                <p style={{ fontSize: '10px', color: '#555', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── Khối phù hợp ── */}
          <div className="rounded-2xl px-4 py-3.5 mb-4"
               style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
            <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              👥 Phù hợp với khối
            </p>
            <div className="flex gap-2 flex-wrap">
              {BLOCKS.map(b => (
                <span key={b} className="font-semibold"
                      style={{ fontSize: '12px', color: '#E94E1B', background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.2)', padding: '4px 10px', borderRadius: 99 }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* ── Bảng điểm ── */}
          <div className="rounded-2xl px-4 py-3.5 mb-4"
               style={{ background: '#141414', border: '1px solid #1f1f1f' }}>
            <p style={{ fontSize: '10px', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
              📊 Thang điểm
            </p>
            <div className="flex flex-col gap-2">
              {SCORE_RULES.map(r => (
                <div key={r.label} className="flex items-center justify-between rounded-xl px-3 py-2"
                     style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '16px' }}>{r.icon}</span>
                    <span className="font-semibold" style={{ fontSize: '13px', color: r.color }}>{r.label}</span>
                  </div>
                  <span className="font-black" style={{ fontSize: '15px', color: r.color }}>
                    +{r.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Lưu ý ── */}
          <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-5"
               style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.15)' }}>
            <span style={{ fontSize: '20px', marginTop: 1 }}>🤖</span>
            <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.6 }}>
              Game này yêu cầu <span style={{ color: '#E94E1B', fontWeight: 700 }}>kinh nghiệm thực tế</span> — AI không thể trả lời thay bạn. Hãy chọn bằng cảm nhận của nhân viên thực sự.
            </p>
          </div>

        </div>

        {/* ── Fixed bottom buttons ── */}
        <div className="shrink-0 px-5 pb-8 pt-3"
             style={{ borderTop: '1px solid #1a1a1a', background: '#0E0E0E' }}>
          <button
            onClick={onStart}
            className="w-full font-black text-white rounded-2xl py-4 mb-3 transition-all active:scale-[0.98]"
            style={{ fontSize: '15px', letterSpacing: '0.04em', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)', boxShadow: '0 4px 20px rgba(233,78,27,0.35)' }}
          >
            Bắt đầu ngay →
          </button>
          <button
            onClick={onBack}
            className="w-full font-semibold rounded-2xl py-3.5 transition-all active:scale-[0.98]"
            style={{ fontSize: '14px', color: '#666', background: 'transparent', border: '1px solid #222' }}
          >
            ← Quay lại Game Center
          </button>
        </div>

      </div>
    </div>
  )
}
