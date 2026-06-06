export default function Header() {
  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 h-[64px]"
      style={{
        background: 'linear-gradient(180deg, rgba(16,8,5,0.99) 0%, rgba(11,11,11,0.97) 100%)',
        borderBottom: '1px solid rgba(233,78,27,0.2)',
        boxShadow: '0 1px 32px rgba(233,78,27,0.07), 0 4px 24px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-center justify-between px-4 h-full">

        {/* Logo + Branding */}
        <div className="flex items-center gap-3">
          <img
            src="/logo-centosy.png"
            alt="Centosy"
            className="h-10 w-auto object-contain"
            style={{
              filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 10px rgba(233,78,27,0.7))',
              mixBlendMode: 'screen',
            }}
          />
          <div className="flex flex-col justify-center leading-none" style={{ gap: '3px' }}>
            <div className="flex items-baseline gap-[5px] leading-none">
              <span
                className="font-black text-white leading-none"
                style={{ fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase' }}
              >
                CENTOSY
              </span>
              <span
                className="font-black leading-none"
                style={{ fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#E94E1B' }}
              >
                ARENA
              </span>
            </div>
            <span
              className="leading-none"
              style={{ fontSize: '8.5px', color: '#5a5a5a', letterSpacing: '0.18em', textTransform: 'uppercase' }}
            >
              Đấu trường nội bộ Centosy
            </span>
          </div>
        </div>

        {/* Bell notification */}
        <button
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{
            background: 'rgba(233,78,27,0.07)',
            border: '1px solid rgba(233,78,27,0.18)',
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8}
               viewBox="0 0 24 24" style={{ color: '#777' }}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span
            className="absolute top-[9px] right-[9px] w-[6px] h-[6px] rounded-full"
            style={{ background: '#E94E1B', boxShadow: '0 0 7px rgba(233,78,27,0.9)' }}
          />
        </button>

      </div>
    </header>
  )
}
