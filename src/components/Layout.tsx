import { ReactNode } from 'react'
import Header from './Header'
import BottomNav from './BottomNav'

type Tab = 'home' | 'games' | 'rank' | 'honor' | 'profile'

interface Props {
  children: ReactNode
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function Layout({ children, activeTab, onTabChange }: Props) {
  return (
    /* Desktop: căn giữa, giới hạn 430px, shadow frame */
    <div className="min-h-screen bg-[#050505] flex justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen bg-arena-bg flex flex-col"
           style={{ boxShadow: '0 0 80px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.06)' }}>
        <Header />
        <main className="flex-1 pt-[64px] pb-[68px] px-4 overflow-y-auto">
          {children}
        </main>
        <BottomNav active={activeTab} onChange={onTabChange} />
      </div>
    </div>
  )
}
