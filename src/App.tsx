import { useState } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import RankPage from './pages/RankPage'
import HonorPage from './pages/HonorPage'
import ProfilePage from './pages/ProfilePage'
import LoginScreen from './components/auth/LoginScreen'
import { useAuth } from './context/AuthContext'

type Tab = 'home' | 'games' | 'rank' | 'honor' | 'profile'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')

  if (isLoading) return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center">
      <p className="text-text-muted text-sm">Đang tải...</p>
    </div>
  )

  if (!isAuthenticated) return <LoginScreen />

  const renderPage = () => {
    switch (activeTab) {
      case 'home':    return <HomePage />
      case 'games':   return <GamesPage />
      case 'rank':    return <RankPage />
      case 'honor':   return <HonorPage />
      case 'profile': return <ProfilePage />
    }
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </Layout>
  )
}
