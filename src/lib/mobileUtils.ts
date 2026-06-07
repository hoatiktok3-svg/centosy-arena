/**
 * mobileUtils — STEP 81
 * Mobile UX helpers: haptic feedback, touch utilities.
 */

// ── Haptic Feedback ────────────────────────────────────────────
// Rung thiết bị khi có feedback (chỉ hoạt động trên mobile với permission)

/** Rung nhẹ — khi chọn đáp án */
export function hapticLight() {
  try {
    if ('vibrate' in navigator) navigator.vibrate(10)
  } catch { /* ignore */ }
}

/** Rung trung bình — khi đúng */
export function hapticSuccess() {
  try {
    if ('vibrate' in navigator) navigator.vibrate([15, 50, 15])
  } catch { /* ignore */ }
}

/** Rung mạnh — khi sai */
export function hapticError() {
  try {
    if ('vibrate' in navigator) navigator.vibrate([30, 30, 60])
  } catch { /* ignore */ }
}

/** Rung celebration — khi hoàn thành quiz */
export function hapticCelebration() {
  try {
    if ('vibrate' in navigator) navigator.vibrate([10, 30, 10, 30, 100])
  } catch { /* ignore */ }
}

// ── Scroll Lock ────────────────────────────────────────────────
// Ngăn scroll body khi overlay đang mở (tránh double-scroll)

export function lockBodyScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
}

export function unlockBodyScroll() {
  document.body.style.overflow = ''
  document.body.style.touchAction = ''
}

// ── Safe Area ──────────────────────────────────────────────────
// Kiểm tra xem device có notch/dynamic island không

export function hasSafeArea(): boolean {
  return window.innerHeight > 800 &&
    CSS.supports('padding-bottom', 'env(safe-area-inset-bottom)')
}

// ── Touch Velocity ─────────────────────────────────────────────
// Đo vận tốc swipe để xác định swipe-to-dismiss

export interface SwipeState {
  startY:   number
  startX:   number
  startTime: number
}

export function swipeStart(e: React.TouchEvent): SwipeState {
  return {
    startY:    e.touches[0]?.clientY ?? 0,
    startX:    e.touches[0]?.clientX ?? 0,
    startTime: Date.now(),
  }
}

export interface SwipeResult {
  deltaY:    number
  deltaX:    number
  velocity:  number   // px/ms
  direction: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function swipeEnd(e: React.TouchEvent, start: SwipeState): SwipeResult {
  const endY     = e.changedTouches[0]?.clientY ?? 0
  const endX     = e.changedTouches[0]?.clientX ?? 0
  const deltaY   = endY - start.startY
  const deltaX   = endX - start.startX
  const elapsed  = Math.max(1, Date.now() - start.startTime)
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
  const velocity = distance / elapsed

  let direction: SwipeResult['direction'] = 'none'
  if (Math.abs(deltaY) > Math.abs(deltaX)) {
    direction = deltaY > 20 ? 'down' : deltaY < -20 ? 'up' : 'none'
  } else {
    direction = deltaX > 20 ? 'right' : deltaX < -20 ? 'left' : 'none'
  }

  return { deltaY, deltaX, velocity, direction }
}
