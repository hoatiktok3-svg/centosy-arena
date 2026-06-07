/**
 * gameSounds — STEP 82
 * Hiệu ứng âm thanh game bằng Web Audio API (không cần file âm thanh ngoài).
 * Mute/unmute lưu trong localStorage.
 */

const MUTE_KEY = 'centosy_sound_muted'

let _ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (_ctx.state === 'suspended') void _ctx.resume()
    return _ctx
  } catch {
    return null
  }
}

export function isMuted(): boolean {
  return localStorage.getItem(MUTE_KEY) === '1'
}

export function setMuted(muted: boolean) {
  localStorage.setItem(MUTE_KEY, muted ? '1' : '0')
}

export function toggleMute(): boolean {
  const next = !isMuted()
  setMuted(next)
  return next
}

// ── Core beep generator ────────────────────────────────────────

function beep(
  frequency:  number,
  duration:   number,
  type:       OscillatorType = 'sine',
  gain:       number = 0.15,
  startDelay: number = 0
) {
  if (isMuted()) return
  const ctx = getCtx()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const vol = ctx.createGain()

  osc.connect(vol)
  vol.connect(ctx.destination)

  osc.type      = type
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay)

  vol.gain.setValueAtTime(gain, ctx.currentTime + startDelay)
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration)

  osc.start(ctx.currentTime + startDelay)
  osc.stop(ctx.currentTime + startDelay + duration)
}

// ── Sound presets ──────────────────────────────────────────────

/** Click nhẹ khi chọn option */
export function soundSelect() {
  beep(600, 0.05, 'square', 0.06)
}

/** Đúng! Ascending two-tone */
export function soundCorrect() {
  beep(523, 0.1, 'sine', 0.12, 0)       // C5
  beep(783, 0.15, 'sine', 0.12, 0.1)    // G5
}

/** Sai. Descending buzz */
export function soundWrong() {
  beep(300, 0.08, 'square', 0.1, 0)
  beep(200, 0.12, 'square', 0.08, 0.08)
}

/** Hoàn thành quiz — victory jingle */
export function soundComplete() {
  const notes = [523, 659, 783, 1046]   // C E G C
  notes.forEach((freq, i) => {
    beep(freq, 0.1, 'sine', 0.15, i * 0.12)
  })
}

/** Nhẹ — khi mở overlay/modal */
export function soundOpen() {
  beep(440, 0.08, 'sine', 0.07)
}

/** Countdown tick */
export function soundTick() {
  beep(880, 0.04, 'square', 0.05)
}
