import { useState, useEffect } from 'react'
import { shopItems, shopCategories, ShopItem, RewardCategory } from '../data/mockRewardShop'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

// ── Types ─────────────────────────────────────────────────────
interface MyRedemption {
  id:         string
  item_id:    string
  item_title: string
  point_cost: number
  status:     'pending' | 'approved' | 'rejected'
  created_at: string
}

// ── Category color ────────────────────────────────────────────
const CAT_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  'Ưu đãi':      { bg: 'rgba(233,78,27,0.12)',  color: '#E94E1B', border: 'rgba(233,78,27,0.3)' },
  'Vật phẩm':    { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
  'Trải nghiệm': { bg: 'rgba(167,139,250,0.12)',color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  'Học tập':     { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: '⏳ Đang xử lý', color: '#facc15' },
  approved: { label: '✅ Đã duyệt',   color: '#4ade80' },
  rejected: { label: '❌ Từ chối',    color: '#f87171' },
}

// ── Confirm Sheet ─────────────────────────────────────────────
function ConfirmSheet({
  item,
  userScore,
  onConfirm,
  onClose,
  loading,
}: {
  item: ShopItem
  userScore: number
  onConfirm: (note: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [note, setNote] = useState('')
  const canAfford = userScore >= item.pointCost
  const catStyle  = CAT_COLOR[item.category] ?? CAT_COLOR['Ưu đãi']

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-3xl z-10 flex flex-col overflow-hidden"
           style={{ background: '#111', border: '1px solid #222', borderBottom: 'none' }}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        <div className="px-5 pt-3 pb-8">
          {/* Item info */}
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                 style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}` }}>
              {item.icon}
            </div>
            <div>
              <p className="text-white font-black" style={{ fontSize: '16px' }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: catStyle.color, marginTop: 3, fontWeight: 700 }}>
                💎 {item.pointCost.toLocaleString('vi-VN')} điểm
              </p>
            </div>
          </div>

          {/* Balance */}
          <div className="rounded-2xl p-3.5 mb-4 flex items-center justify-between"
               style={{ background: '#181818', border: `1px solid ${canAfford ? '#2c2c2c' : 'rgba(239,68,68,0.3)'}` }}>
            <div>
              <p style={{ fontSize: '11px', color: '#585858' }}>Điểm hiện tại</p>
              <p className="font-black" style={{ fontSize: '20px', color: canAfford ? '#E94E1B' : '#f87171' }}>
                {userScore.toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '11px', color: '#585858' }}>Sau khi đổi</p>
              <p className="font-black" style={{ fontSize: '20px', color: canAfford ? '#d0d0d0' : '#f87171' }}>
                {Math.max(0, userScore - item.pointCost).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {!canAfford && (
            <div className="rounded-xl px-4 py-3 mb-4 flex items-center gap-2.5"
                 style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <p style={{ fontSize: '12px', color: '#f87171' }}>
                Bạn chưa đủ điểm để đổi phần thưởng này.
              </p>
            </div>
          )}

          {/* Note */}
          <div className="mb-5">
            <p style={{ fontSize: '12px', color: '#707070', marginBottom: 8 }}>
              Ghi chú (tùy chọn)
            </p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ví dụ: size L, lý do đổi..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl resize-none"
              style={{ background: '#1a1a1a', border: '1px solid #2c2c2c', color: '#d0d0d0', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              className="btn-primary w-full py-3.5 font-black transition-all active:scale-[0.97]"
              style={{ fontSize: '14px', opacity: (!canAfford || loading) ? 0.5 : 1 }}
              onClick={() => canAfford && !loading && onConfirm(note)}
              disabled={!canAfford || loading}>
              {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đổi quà →'}
            </button>
            <button
              className="w-full py-3 rounded-2xl font-semibold transition-all active:scale-[0.97]"
              style={{ fontSize: '14px', color: '#909090', background: '#181818', border: '1px solid #2c2c2c' }}
              onClick={onClose}>
              Huỷ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Shop Item Card ────────────────────────────────────────────
function ShopItemCard({
  item,
  userScore,
  alreadyRequested,
  onRedeem,
}: {
  item: ShopItem
  userScore: number
  alreadyRequested: boolean
  onRedeem: () => void
}) {
  const canAfford  = userScore >= item.pointCost
  const catStyle   = CAT_COLOR[item.category] ?? CAT_COLOR['Ưu đãi']
  const outOfStock = item.stock !== null && item.stock <= 0

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{
           background: '#181818',
           border: item.highlight
             ? '1.5px solid rgba(233,78,27,0.4)'
             : '1px solid #2c2c2c',
           boxShadow: item.highlight
             ? '0 0 20px rgba(233,78,27,0.08)'
             : 'none',
         }}>
      <div className="px-4 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
               style={{ background: catStyle.bg, border: `1px solid ${catStyle.border}` }}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="rounded-full px-2 py-0.5 font-semibold"
                    style={{ fontSize: '10px', background: catStyle.bg, color: catStyle.color, border: `1px solid ${catStyle.border}` }}>
                {item.category}
              </span>
              {item.highlight && (
                <span className="rounded-full px-2 py-0.5 font-bold"
                      style={{ fontSize: '10px', background: 'rgba(233,78,27,0.15)', color: '#E94E1B', border: '1px solid rgba(233,78,27,0.35)' }}>
                  ⭐ Nổi bật
                </span>
              )}
            </div>
            <p className="text-white font-bold leading-snug" style={{ fontSize: '14px' }}>{item.title}</p>
          </div>
        </div>

        <p className="line-clamp-2 mb-3" style={{ fontSize: '12px', color: '#707070', lineHeight: 1.55 }}>
          {item.description}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-black" style={{ fontSize: '18px', color: canAfford ? '#E94E1B' : '#484848' }}>
              {item.pointCost.toLocaleString('vi-VN')}
              <span style={{ fontSize: '11px', fontWeight: 400, color: '#585858', marginLeft: 3 }}>điểm</span>
            </p>
            {item.stock !== null && (
              <p style={{ fontSize: '10px', color: outOfStock ? '#f87171' : '#585858', marginTop: 1 }}>
                {outOfStock ? 'Hết hàng' : `Còn ${item.stock} phần thưởng`}
              </p>
            )}
          </div>

          {alreadyRequested ? (
            <div className="rounded-xl px-3 py-2 flex items-center gap-1.5"
                 style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)' }}>
              <span style={{ fontSize: '12px' }}>⏳</span>
              <span style={{ fontSize: '11px', color: '#facc15', fontWeight: 700 }}>Đã yêu cầu</span>
            </div>
          ) : outOfStock ? (
            <div className="rounded-xl px-3 py-2"
                 style={{ background: '#1a1a1a', border: '1px solid #2c2c2c' }}>
              <span style={{ fontSize: '11px', color: '#484848' }}>Hết hàng</span>
            </div>
          ) : (
            <button
              onClick={onRedeem}
              className="rounded-xl px-4 py-2.5 font-black transition-all active:scale-90"
              style={{
                fontSize: '12px',
                background: canAfford ? 'linear-gradient(90deg,#E94E1B,#FF5A28)' : '#1e1e1e',
                color: canAfford ? '#fff' : '#484848',
                boxShadow: canAfford ? '0 3px 12px rgba(233,78,27,0.3)' : 'none',
                cursor: canAfford ? 'pointer' : 'not-allowed',
              }}>
              Đổi →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

export default function RewardShopPage({ onClose }: Props) {
  const { currentUser }                       = useAuth()
  const [category, setCategory]               = useState<RewardCategory | 'Tất cả'>('Tất cả')
  const [confirmItem, setConfirmItem]         = useState<ShopItem | null>(null)
  const [myRedemptions, setMyRedemptions]     = useState<MyRedemption[]>([])
  const [showHistory, setShowHistory]         = useState(false)
  const [submitting, setSubmitting]           = useState(false)
  const [successMsg, setSuccessMsg]           = useState('')

  const userScore = currentUser?.score ?? 0

  useEffect(() => {
    if (!currentUser?.id) return
    void fetchMyRedemptions()
  }, [currentUser?.id])

  async function fetchMyRedemptions() {
    const { data } = await supabase
      .from('reward_redemptions')
      .select('id, item_id, item_title, point_cost, status, created_at')
      .eq('user_id', currentUser!.id)
      .order('created_at', { ascending: false })
      .limit(20)
    setMyRedemptions((data ?? []) as MyRedemption[])
  }

  async function handleConfirmRedeem(note: string) {
    if (!confirmItem || !currentUser?.id) return
    setSubmitting(true)
    const { error } = await supabase.from('reward_redemptions').insert({
      user_id:    currentUser.id,
      item_id:    confirmItem.id,
      item_title: confirmItem.title,
      point_cost: confirmItem.pointCost,
      note:       note.trim() || null,
    })
    setSubmitting(false)
    if (!error) {
      setConfirmItem(null)
      setSuccessMsg(`Đã gửi yêu cầu đổi "${confirmItem.title}"! Admin sẽ xử lý sớm.`)
      setTimeout(() => setSuccessMsg(''), 4000)
      void fetchMyRedemptions()
    }
  }

  const pendingItemIds = new Set(
    myRedemptions.filter(r => r.status === 'pending').map(r => r.item_id)
  )

  const filtered = category === 'Tất cả'
    ? shopItems
    : shopItems.filter(i => i.category === category)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <div className="flex items-center gap-3 max-w-[430px] mx-auto mb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', color: '#909090', fontSize: '18px' }}>
            ×
          </button>
          <div className="flex-1">
            <p className="text-white font-black" style={{ fontSize: '17px' }}>🎁 Reward Shop</p>
            <p style={{ fontSize: '12px', color: '#585858', marginTop: 1 }}>
              Điểm của bạn: <span className="font-black" style={{ color: '#E94E1B' }}>
                {userScore.toLocaleString('vi-VN')}đ
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowHistory(h => !h)}
            className="rounded-xl px-3 py-2 font-semibold transition-all active:scale-90"
            style={{ fontSize: '11px', background: '#1e1e1e', border: '1px solid #2c2c2c', color: '#909090' }}>
            {showHistory ? 'Shop' : `Lịch sử (${myRedemptions.length})`}
          </button>
        </div>

        {!showHistory && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar max-w-[430px] mx-auto">
            {shopCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={category === cat ? 'filter-pill-active' : 'filter-pill-inactive'}
                style={{ whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="shrink-0 px-4 py-3 max-w-[430px] mx-auto w-full"
             style={{ borderBottom: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.08)' }}>
          <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: 600 }}>✅ {successMsg}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[430px] mx-auto w-full">

        {/* ── History view ── */}
        {showHistory && (
          <div>
            {myRedemptions.length === 0 ? (
              <div className="rounded-2xl text-center py-10"
                   style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
                <p style={{ fontSize: '32px', marginBottom: 12 }}>🎁</p>
                <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có yêu cầu đổi quà nào.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myRedemptions.map(r => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending
                  const date = new Date(r.created_at)
                  return (
                    <div key={r.id} className="rounded-2xl px-4 py-3.5"
                         style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold" style={{ fontSize: '13px' }}>{r.item_title}</p>
                          <p style={{ fontSize: '11px', color: '#585858', marginTop: 3 }}>
                            {date.getDate()}/{date.getMonth()+1}/{date.getFullYear()} · {r.point_cost.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                        <span className="font-bold shrink-0" style={{ fontSize: '12px', color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Shop view ── */}
        {!showHistory && (
          <div className="flex flex-col gap-3">
            {filtered.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                userScore={userScore}
                alreadyRequested={pendingItemIds.has(item.id)}
                onRedeem={() => setConfirmItem(item)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="rounded-2xl text-center py-10"
                   style={{ background: '#181818', border: '1px solid #2c2c2c' }}>
                <p style={{ fontSize: '32px', marginBottom: 12 }}>🛒</p>
                <p style={{ fontSize: '13px', color: '#585858' }}>Chưa có phần thưởng trong nhóm này.</p>
              </div>
            )}
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Confirm sheet */}
      {confirmItem && (
        <ConfirmSheet
          item={confirmItem}
          userScore={userScore}
          onConfirm={handleConfirmRedeem}
          onClose={() => setConfirmItem(null)}
          loading={submitting}
        />
      )}
    </div>
  )
}
