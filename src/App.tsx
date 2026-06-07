import { useState } from 'react'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import RankPage from './pages/RankPage'
import HonorPage from './pages/HonorPage'
import ProfilePage from './pages/ProfilePage'
import LoginScreen from './components/auth/LoginScreen'
import RegisterScreen from './components/auth/RegisterScreen'
import PendingApprovalScreen from './components/auth/PendingApprovalScreen'
import { useAuth } from './context/AuthContext'

type Tab = 'home' | 'games' | 'rank' | 'honor' | 'profile'
type AuthScreen = 'login' | 'register'

export default function App() {
  const { isAuthenticated, isLoading, currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')

  if (isLoading) return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center">
      <p className="text-text-muted text-sm">Đang tải...</p>
    </div>
  )

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return <RegisterScreen onBackToLogin={() => setAuthScreen('login')} />
    }
    return <LoginScreen onGoToRegister={() => setAuthScreen('register')} />
  }

  // Gate: tài khoản chưa được duyệt hoặc bị khóa
  if (currentUser && currentUser.accountStatus !== 'approved') {
    return (
      <PendingApprovalScreen
        status={currentUser.accountStatus}
        rejectedReason={currentUser.rejectedReason}
      />
    )
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':    return <HomePage onGoToGames={() => setActiveTab('games')} onGoToHonor={() => setActiveTab('honor')} />
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
