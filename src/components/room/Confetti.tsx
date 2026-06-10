// Confetti animation — CSS-based, no external deps
import { useEffect, useState } from 'react'

interface Particle {
  id:    number
  x:     number   // % from left
  color: string
  size:  number
  delay: number
  dur:   number
  rot:   number
  shape: 'rect' | 'circle' | 'star'
}

const COLORS = [
  '#E94E1B', '#facc15', '#4ade80', '#60a5fa', '#f472b6',
  '#a78bfa', '#fb923c', '#34d399', '#38bdf8', '#f9a8d4',
]

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ active = true, count = 80 }: { active?: boolean; count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!active) { setParticles([]); return }
    const shapes: Particle['shape'][] = ['rect', 'circle', 'star']
    setParticles(Array.from({ length: count }, (_, i) => ({
      id:    i,
      x:     random(0, 100),
      color: COLORS[i % COLORS.length],
      size:  random(6, 14),
      delay: random(0, 1.5),
      dur:   random(2.5, 4.5),
      rot:   random(0, 720),
      shape: shapes[i % 3],
    })))
  }, [active, count])

  if (!active || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100vh) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes confettiSway {
          0%,100% { margin-left: 0; }
          25%     { margin-left: -20px; }
          75%     { margin-left: 20px; }
        }
      `}</style>
      {particles.map(p => (
        <div key={p.id}
             style={{
               position: 'absolute',
               left: `${p.x}%`,
               top: 0,
               width:  p.shape === 'circle' ? p.size : p.size * 0.6,
               height: p.shape === 'circle' ? p.size : p.size * 1.4,
               background: p.shape === 'star' ? 'transparent' : p.color,
               borderRadius: p.shape === 'circle' ? '50%' : '2px',
               animationName: 'confettiFall, confettiSway',
               animationDuration: `${p.dur}s, ${p.dur * 0.4}s`,
               animationDelay: `${p.delay}s, ${p.delay}s`,
               animationTimingFunction: 'linear, ease-in-out',
               animationFillMode: 'forwards',
               animationIterationCount: '1, infinite',
               '--rot': `${p.rot}deg`,
               boxShadow: p.shape === 'star' ? 'none' : undefined,
             } as React.CSSProperties}>
          {p.shape === 'star' && (
            <span style={{ fontSize: p.size, color: p.color, lineHeight: 1 }}>★</span>
          )}
        </div>
      ))}
    </div>
  )
}
