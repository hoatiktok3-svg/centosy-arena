/**
 * useGameAudio — Game audio system
 * - Sound effects: correct, wrong, tick, timeup, fanfare, countdown
 * - Background music: looping synthwave pattern (Web Audio API only, no external files)
 */
import { useRef, useState, useCallback, useEffect } from 'react'

export type SfxType = 'correct' | 'wrong' | 'tick' | 'timeup' | 'fanfare' | 'countdown'

const BRAND_MUSIC_KEY  = 'centosy_musicOn'
const BRAND_SFX_KEY    = 'centosy_sfxOn'

// ── Music constants ──────────────────────────────────────────────────────────
const BPM       = 128
const BEAT      = 60 / BPM         // ~0.469s
const BAR       = BEAT * 4         // ~1.875s
const LOOKAHEAD = BAR * 2          // schedule 2 bars ahead
const SCHEDULE_INTERVAL_MS = 100

// C minor pentatonic (Hz): C2 Eb2 F2 G2 Bb2 / C3 Eb3 G3 / C4 Eb4 F4 G4 Bb4
const C2 = 65.41, F2 = 87.31, G2 = 98.00, Bb2 = 116.54
const G3 = 196.00, Bb3 = 233.08
const C4 = 261.63, Eb4 = 311.13, F4 = 349.23, G4 = 392.00, Bb4 = 466.16
const C5 = 523.25, Eb5 = 622.25, G5 = 783.99

// Bass pattern (8 bars repeating)
const BASS_PATTERN = [C2, C2, G2, G2, F2, F2, G2, Bb2]
// Melody sequences (bar pairs)
const MELODY_SEQ: [number, number][][] = [
  // Bar 0-1: ascending phrase
  [[C4, 0], [Eb4, 0.5], [G4, 1], [Bb4, 1.5], [C5, 2], [G4, 2.5], [Eb4, 3], [C4, 3.5]],
  // Bar 2-3: second phrase
  [[G4, 0], [F4, 0.5], [Eb4, 1], [C4, 1.5], [Eb4, 2], [G4, 2.5], [Bb4, 3], [G4, 3.5]],
  // Bar 4-5: third phrase
  [[F4, 0], [G4, 0.5], [Bb4, 1], [C5, 1.5], [Bb4, 2], [G4, 2.5], [F4, 3], [Eb4, 3.5]],
  // Bar 6-7: ending phrase
  [[Eb4, 0], [G4, 0.5], [Bb4, 1], [G4, 1.5], [Eb5, 2], [G5, 2.25], [Eb5, 2.5], [C5, 3]],
]
// Arpeggio fill (bar 1,3,5,7)
const FILL_NOTES = [C4, Eb4, G4, C5, G4, Eb4]

// ── Helper: play a single oscillator note ───────────────────────────────────
function scheduleOsc(
  ctx: AudioContext,
  dest: AudioNode,
  type: OscillatorType,
  freq: number,
  startTime: number,
  duration: number,
  volume: number,
  attack = 0.01,
  filter?: { type: BiquadFilterType; freq: number; Q?: number }
) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + attack)
  gain.gain.setValueAtTime(volume * 0.8, startTime + duration * 0.5)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  if (filter) {
    const f = ctx.createBiquadFilter()
    f.type = filter.type
    f.frequency.value = filter.freq
    if (filter.Q) f.Q.value = filter.Q
    osc.connect(f); f.connect(gain)
  } else {
    osc.connect(gain)
  }
  gain.connect(dest)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.05)
}

// ── Helper: noise burst (hihat / snare) ──────────────────────────────────────
function scheduleNoise(
  ctx: AudioContext,
  dest: AudioNode,
  startTime: number,
  duration: number,
  volume: number,
  filterFreq: number
) {
  const buf  = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2)
  }
  const src    = ctx.createBufferSource()
  const gain   = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  src.buffer   = buf
  filter.type  = 'highpass'
  filter.frequency.value = filterFreq
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  src.connect(filter); filter.connect(gain); gain.connect(dest)
  src.start(startTime)
}

// ── Schedule one bar of music ─────────────────────────────────────────────────
function scheduleBar(
  ctx: AudioContext,
  dest: AudioNode,
  barStart: number,
  barIndex: number
) {
  const patternBar = barIndex % 8
  const bassFreq   = BASS_PATTERN[patternBar]
  const isOddBar   = barIndex % 2 === 1

  // ── Bass (1 note per bar, sawtooth filtered) ──────────────────────────────
  scheduleOsc(ctx, dest, 'sawtooth', bassFreq, barStart, BAR * 0.9, 0.22, 0.01,
    { type: 'lowpass', freq: 280, Q: 3 })

  // ── Kick drum (beat 1, beat 3) ─────────────────────────────────────────────
  for (const beat of [0, 2]) {
    const t = barStart + beat * BEAT
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.frequency.setValueAtTime(180, t)
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.07)
    g.gain.setValueAtTime(0.5, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
    osc.connect(g); g.connect(dest)
    osc.start(t); osc.stop(t + 0.22)
  }

  // ── Snare (beat 2, beat 4) ─────────────────────────────────────────────────
  for (const beat of [1, 3]) {
    scheduleNoise(ctx, dest, barStart + beat * BEAT, 0.12, 0.18, 3000)
    // Snare tone layer
    scheduleOsc(ctx, dest, 'triangle', 200, barStart + beat * BEAT, 0.08, 0.1, 0.005)
  }

  // ── Hi-hat (every 8th note) ────────────────────────────────────────────────
  for (let i = 0; i < 8; i++) {
    const t      = barStart + i * BEAT * 0.5
    const isOpen = i % 4 === 3
    scheduleNoise(ctx, dest, t, isOpen ? 0.1 : 0.04, 0.06, 8000)
  }

  // ── Melody ────────────────────────────────────────────────────────────────
  if (!isOddBar) {
    const seq = MELODY_SEQ[Math.floor((barIndex % 8) / 2) % MELODY_SEQ.length]
    seq.forEach(([freq, beatOffset]) => {
      scheduleOsc(ctx, dest, 'triangle', freq,
        barStart + beatOffset * BEAT, BEAT * 0.6, 0.14, 0.02)
    })
  } else {
    // Fill / counter-melody
    FILL_NOTES.forEach((freq, i) => {
      scheduleOsc(ctx, dest, 'triangle', freq,
        barStart + (i * 0.66) * BEAT, BEAT * 0.4, 0.08, 0.01)
    })
    // Sub pad
    scheduleOsc(ctx, dest, 'sine', G3, barStart, BAR * 0.8, 0.07, 0.05)
    scheduleOsc(ctx, dest, 'sine', Bb3, barStart, BAR * 0.8, 0.05, 0.05)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════════
export function useGameAudio() {
  const ctxRef         = useRef<AudioContext | null>(null)
  const masterGainRef  = useRef<GainNode | null>(null)
  const musicGainRef   = useRef<GainNode | null>(null)
  const sfxGainRef     = useRef<GainNode | null>(null)
  const schedulerRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextBarTimeRef = useRef(0)
  const nextBarIdxRef  = useRef(0)
  const musicRunRef    = useRef(false)

  const [musicOn, setMusicOn] = useState(() =>
    localStorage.getItem(BRAND_MUSIC_KEY) !== 'off')
  const [sfxOn, setSfxOn]     = useState(() =>
    localStorage.getItem(BRAND_SFX_KEY) !== 'off')

  // ── Init AudioContext (must be called from user gesture) ──────────────────
  const initAudio = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume()
      return ctxRef.current
    }
    const ctx    = new AudioContext()
    const master = ctx.createGain(); master.gain.value = 0.85
    master.connect(ctx.destination)

    const musicGain = ctx.createGain(); musicGain.gain.value = musicOn ? 0.55 : 0
    musicGain.connect(master)

    const sfxGain = ctx.createGain(); sfxGain.gain.value = sfxOn ? 1 : 0
    sfxGain.connect(master)

    ctxRef.current        = ctx
    masterGainRef.current = master
    musicGainRef.current  = musicGain
    sfxGainRef.current    = sfxGain
    return ctx
  }, [musicOn, sfxOn])

  // ── Music scheduler ───────────────────────────────────────────────────────
  const startMusic = useCallback(() => {
    const ctx = initAudio()
    if (musicRunRef.current) return
    musicRunRef.current = true
    if (musicGainRef.current) musicGainRef.current.gain.value = 0.55

    nextBarTimeRef.current = ctx.currentTime + 0.1
    nextBarIdxRef.current  = 0

    const schedule = () => {
      if (!musicRunRef.current || !ctxRef.current || !musicGainRef.current) return
      const ctx2 = ctxRef.current
      while (nextBarTimeRef.current < ctx2.currentTime + LOOKAHEAD) {
        scheduleBar(ctx2, musicGainRef.current, nextBarTimeRef.current, nextBarIdxRef.current)
        nextBarTimeRef.current += BAR
        nextBarIdxRef.current++
      }
    }
    schedule()
    if (schedulerRef.current) clearInterval(schedulerRef.current)
    schedulerRef.current = setInterval(schedule, SCHEDULE_INTERVAL_MS)
  }, [initAudio])

  const stopMusic = useCallback((fade = true) => {
    musicRunRef.current = false
    if (schedulerRef.current) { clearInterval(schedulerRef.current); schedulerRef.current = null }
    if (musicGainRef.current && ctxRef.current && fade) {
      musicGainRef.current.gain.setValueAtTime(
        musicGainRef.current.gain.value, ctxRef.current.currentTime)
      musicGainRef.current.gain.exponentialRampToValueAtTime(
        0.0001, ctxRef.current.currentTime + 1.5)
    } else if (musicGainRef.current) {
      musicGainRef.current.gain.value = 0
    }
  }, [])

  const toggleMusic = useCallback(() => {
    setMusicOn(prev => {
      const next = !prev
      localStorage.setItem(BRAND_MUSIC_KEY, next ? 'on' : 'off')
      if (musicGainRef.current && ctxRef.current) {
        if (next) {
          musicGainRef.current.gain.setValueAtTime(0.0001, ctxRef.current.currentTime)
          musicGainRef.current.gain.linearRampToValueAtTime(0.55, ctxRef.current.currentTime + 0.5)
          if (!musicRunRef.current) startMusic()
        } else {
          musicGainRef.current.gain.setValueAtTime(0.55, ctxRef.current.currentTime)
          musicGainRef.current.gain.exponentialRampToValueAtTime(0.0001, ctxRef.current.currentTime + 1)
        }
      }
      return next
    })
  }, [startMusic])

  const toggleSfx = useCallback(() => {
    setSfxOn(prev => {
      const next = !prev
      localStorage.setItem(BRAND_SFX_KEY, next ? 'on' : 'off')
      if (sfxGainRef.current) sfxGainRef.current.gain.value = next ? 1 : 0
      return next
    })
  }, [])

  // ── Sound Effects ─────────────────────────────────────────────────────────
  const playSfx = useCallback((type: SfxType) => {
    const ctx = ctxRef.current
    if (!ctx || !sfxGainRef.current) return
    const dest = sfxGainRef.current
    const t    = ctx.currentTime + 0.01

    switch (type) {
      case 'correct': {
        // Rising arpeggio C5-E5-G5
        scheduleOsc(ctx, dest, 'triangle', C5,  t,        0.18, 0.4, 0.01)
        scheduleOsc(ctx, dest, 'triangle', Eb5, t + 0.10, 0.18, 0.4, 0.01)
        scheduleOsc(ctx, dest, 'triangle', G5,  t + 0.20, 0.30, 0.5, 0.01)
        // Shimmer
        scheduleOsc(ctx, dest, 'sine', C5 * 2, t + 0.20, 0.25, 0.15, 0.01)
        break
      }
      case 'wrong': {
        // Descending buzz
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(260, t)
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.35)
        gain.gain.setValueAtTime(0.35, t)
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35)
        osc.connect(gain); gain.connect(dest)
        osc.start(t); osc.stop(t + 0.4)
        // Low thud
        scheduleOsc(ctx, dest, 'sine', 80, t, 0.2, 0.3, 0.005)
        break
      }
      case 'tick': {
        // Short hi-freq click
        scheduleNoise(ctx, dest, t, 0.04, 0.25, 6000)
        break
      }
      case 'timeup': {
        // Alarm: 3 rapid beeps
        for (let i = 0; i < 3; i++) {
          scheduleOsc(ctx, dest, 'square', 880, t + i * 0.14, 0.10, 0.35, 0.005,
            { type: 'lowpass', freq: 2000, Q: 1 })
        }
        break
      }
      case 'fanfare': {
        // Victory fanfare C4-E4-G4-C5
        const fan = [C4, Eb4, G4, C5, Eb5, G5]
        fan.forEach((freq, i) => {
          scheduleOsc(ctx, dest, 'triangle', freq, t + i * 0.09, 0.35, 0.4, 0.01)
        })
        scheduleOsc(ctx, dest, 'sine', C4 / 2, t, 0.6, 0.3, 0.02)
        break
      }
      case 'countdown': {
        scheduleOsc(ctx, dest, 'sine', 440, t, 0.12, 0.4, 0.01)
        break
      }
    }
  }, [])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopMusic(false)
      if (ctxRef.current) {
        void ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [stopMusic])

  // ── Pause on tab hidden ────────────────────────────────────────────────────
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        if (musicGainRef.current && ctxRef.current) {
          musicGainRef.current.gain.setValueAtTime(musicGainRef.current.gain.value, ctxRef.current.currentTime)
          musicGainRef.current.gain.linearRampToValueAtTime(0.0001, ctxRef.current.currentTime + 0.3)
        }
      } else if (musicOn && musicRunRef.current) {
        if (musicGainRef.current && ctxRef.current) {
          musicGainRef.current.gain.setValueAtTime(0.0001, ctxRef.current.currentTime)
          musicGainRef.current.gain.linearRampToValueAtTime(0.55, ctxRef.current.currentTime + 0.5)
        }
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [musicOn])

  return { playSfx, musicOn, toggleMusic, sfxOn, toggleSfx, startMusic, stopMusic, initAudio }
}
