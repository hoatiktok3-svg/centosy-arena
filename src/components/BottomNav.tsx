import React from 'react'

type Tab = 'home' | 'games' | 'rank' | 'honor' | 'missions' | 'profile'
interface Props { active: Tab; onChange: (tab: Tab) => void }

const ICONS: Record<Tab, (a: boolean) => React.ReactElement> = {
  home: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  games: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  rank: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  honor: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  missions: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  profile: (a) => (
    <svg width="18" height="18" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

const LABELS: Record<Tab, string> = {
  home: 'Home', games: 'Games', rank: 'Rank', honor: 'Honor', missions: 'Missions', profile: 'Tôi',
}

const TABS: Tab[] = ['home', 'games', 'rank', 'missions', 'honor', 'profile']

export default function BottomNav({ active, onChange }: Props) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-50"
      style={{
        height: 68,
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.7), 0 -1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <div className="flex h-full">
        {TABS.map(tab => {
          const isActive = tab === active
          return (
            <button
              key={tab}
              onClick={() => onChange(tab)}
              className="flex-1 flex flex-col items-center justify-center transition-all duration-150 active:scale-90"
              style={{ gap: 3 }}
            >
              {/* Icon pill */}
              <div
                style={{
                  width: 40,
                  height: 26,
                  borderRadius: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'rgba(233,78,27,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(233,78,27,0.22)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 10px rgba(233,78,27,0.18)' : 'none',
                  transition: 'all 0.18s ease',
                  color: isActive ? '#E94E1B' : '#686868',
                }}
              >
                {ICONS[tab](isActive)}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '8.5px',
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  color: isActive ? '#E94E1B' : '#686868',
                  transition: 'color 0.18s ease',
                }}
              >
                {LABELS[tab]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
