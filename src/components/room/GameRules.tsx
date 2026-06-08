// STEP 96: Luật chơi + công thức tính điểm — hiển thị trong phòng chờ

interface Props {
  questionTimeLimitS: number
  onClose: () => void
}

export default function GameRules({ questionTimeLimitS, onClose }: Props) {
  const basePoints   = 10
  const speedBonus   = Math.floor(basePoints * 0.5)
  const maxPoints    = basePoints + speedBonus

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl z-10 overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        <div className="px-5 pt-3 pb-8 flex flex-col gap-4">
          <p className="font-black text-white" style={{ fontSize: '18px' }}>📋 Luật chơi</p>

          {/* Scoring formula */}
          <div className="rounded-2xl p-4"
               style={{ background: '#141414', border: '1px solid rgba(233,78,27,0.2)' }}>
            <p style={{ fontSize: '11px', color: '#E94E1B', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Công thức tính điểm
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2"
                   style={{ borderBottom: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '13px', color: '#aaa' }}>Trả lời đúng</span>
                <span className="font-black" style={{ fontSize: '14px', color: '#4ade80' }}>+{basePoints}đ</span>
              </div>
              <div className="flex items-center justify-between py-2"
                   style={{ borderBottom: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '13px', color: '#aaa' }}>Bonus tốc độ (trả lời nhanh)</span>
                <span className="font-black" style={{ fontSize: '14px', color: '#facc15' }}>+0~{speedBonus}đ</span>
              </div>
              <div className="flex items-center justify-between py-2"
                   style={{ borderBottom: '1px solid #1f1f1f' }}>
                <span style={{ fontSize: '13px', color: '#aaa' }}>Trả lời sai</span>
                <span className="font-black" style={{ fontSize: '14px', color: '#555' }}>+0đ</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>Tối đa mỗi câu</span>
                <span className="font-black" style={{ fontSize: '16px', color: '#E94E1B' }}>{maxPoints}đ</span>
              </div>
            </div>
          </div>

          {/* Speed bonus detail */}
          <div className="rounded-2xl p-4"
               style={{ background: '#141414', border: '1px solid #222' }}>
            <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Thang điểm tốc độ ({questionTimeLimitS}s/câu)
            </p>
            {[
              { range: `0 – ${Math.floor(questionTimeLimitS * 0.25)}s`, bonus: `+${speedBonus}đ`, color: '#4ade80', label: 'Siêu nhanh' },
              { range: `${Math.floor(questionTimeLimitS * 0.25)} – ${Math.floor(questionTimeLimitS * 0.5)}s`, bonus: `+${Math.floor(speedBonus * 0.6)}đ`, color: '#facc15', label: 'Nhanh' },
              { range: `${Math.floor(questionTimeLimitS * 0.5)} – ${Math.floor(questionTimeLimitS * 0.75)}s`, bonus: `+${Math.floor(speedBonus * 0.25)}đ`, color: '#E94E1B', label: 'Bình thường' },
              { range: `> ${Math.floor(questionTimeLimitS * 0.75)}s`, bonus: '+0đ', color: '#555', label: 'Chậm' },
            ].map(row => (
              <div key={row.range} className="flex items-center justify-between py-2"
                   style={{ borderBottom: '1px solid #1a1a1a' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#888' }}>{row.range}</span>
                  <span style={{ marginLeft: 8, fontSize: '10px', color: row.color, fontWeight: 700 }}>{row.label}</span>
                </div>
                <span className="font-black" style={{ fontSize: '13px', color: row.color }}>{row.bonus}</span>
              </div>
            ))}
          </div>

          {/* Rules list */}
          <div className="rounded-2xl p-4"
               style={{ background: '#141414', border: '1px solid #222' }}>
            <p style={{ fontSize: '11px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
              Quy tắc
            </p>
            {[
              '⏱ Mỗi câu có ' + questionTimeLimitS + 's — hết giờ không tính điểm',
              '🔒 Chỉ được chọn 1 lần/câu — không thay đổi',
              '📶 Mất kết nối, câu đó không tính điểm',
              '🏆 Điểm cao nhất = thắng cuộc',
              '⭐ Điểm realtime được cộng vào hồ sơ sau khi kết thúc',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
                <p style={{ fontSize: '13px', color: '#aaa', lineHeight: 1.55 }}>{rule}</p>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full font-black text-white rounded-2xl py-4 transition-all active:scale-[0.98]"
            style={{ fontSize: '14px', background: 'linear-gradient(90deg,#E94E1B,#FF5A28)' }}>
            Đã hiểu →
          </button>
        </div>
      </div>
    </div>
  )
}
