import { useState, useEffect, lazy, Suspense } from 'react'
import Layout from './components/Layout'
import LoginScreen from './components/auth/LoginScreen'
import RegisterScreen from './components/auth/RegisterScreen'
import PendingApprovalScreen from './components/auth/PendingApprovalScreen'
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen'
import ResetPasswordScreen from './components/auth/ResetPasswordScreen'
import { useAuth } from './context/AuthContext'
import { supabase } from './lib/supabaseClient'

// ── Lazy-load heavy pages để giảm bundle chính ────────────────
const HomePage      = lazy(() => import('./pages/HomePage'))
const GamesPage     = lazy(() => import('./pages/GamesPage'))
const RankPage      = lazy(() => import('./pages/RankPage'))
const HonorPage     = lazy(() => import('./pages/HonorPage'))
const MissionsPage  = lazy(() => import('./pages/MissionsPage'))
const ProfilePage   = lazy(() => import('./pages/ProfilePage'))
const NotificationCenter   = lazy(() => import('./components/notifications/NotificationCenter'))
const RoomInvitationBanner = lazy(() => import('./components/room/RoomInvitationBanner'))
const GameRoomPage  = lazy(() => import('./pages/GameRoomPage'))

// Skeleton loading fallback
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 px-4 animate-pulse">
      <div className="h-8 w-48 rounded-xl bg-arena-card" />
      <div className="h-32 rounded-2xl bg-arena-card" />
      <div className="h-24 rounded-2xl bg-arena-card" />
      <div className="h-24 rounded-2xl bg-arena-card" />
    </div>
  )
}

type Tab = 'home' | 'games' | 'rank' | 'honor' | 'missions' | 'profile'
type AuthScreen = 'login' | 'register' | 'forgot-password' | 'reset-password'

export default function App() {
  const { isAuthenticated, isLoading, currentUser } = useAuth()
  const [activeTab,        setActiveTab]        = useState<Tab>('home')
  const [authScreen,       setAuthScreen]       = useState<AuthScreen>('login')
  const [showNotifications,setShowNotifications] = useState(false)
  const [unreadCount,      setUnreadCount]      = useState(0)
  /** Mã phòng từ lời mời → mở GameRoomPage và tự join */
  const [inviteJoinCode,   setInviteJoinCode]   = useState<string | null>(null)

  // ── Lắng nghe PASSWORD_RECOVERY event từ Supabase ───────────
  // Khi user click link trong email đặt lại mật khẩu, Supabase sẽ:
  // 1. Parse token từ URL hash (#access_token=...&type=recovery)
  // 2. Fire onAuthStateChange với event = 'PASSWORD_RECOVERY'
  // Ta bắt event này và chuyển sang màn hình đặt mật khẩu mới.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthScreen('reset-password')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // ── Fetch unread count on mount (khi đã authenticated) ────
  useEffect(() => {
    if (!currentUser?.id) return
    async function fetchUnread() {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', currentUser!.id)
        .eq('is_read', false)
      setUnreadCount(count ?? 0)
    }
    void fetchUnread()
  }, [currentUser?.id])

  if (isLoading) return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center">
      <p className="text-text-muted text-sm">Đang tải...</p>
    </div>
  )

  if (!isAuthenticated || authScreen === 'reset-password') {
    if (authScreen === 'reset-password') {
      return <ResetPasswordScreen onDone={() => setAuthScreen('login')} />
    }
    if (authScreen === 'register') {
      return <RegisterScreen onBackToLogin={() => setAuthScreen('login')} />
    }
    if (authScreen === 'forgot-password') {
      return <ForgotPasswordScreen onBackToLogin={() => setAuthScreen('login')} />
    }
    return (
      <LoginScreen
        onGoToRegister={() => setAuthScreen('register')}
        onGoToForgotPassword={() => setAuthScreen('forgot-password')}
      />
    )
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
      case 'home':     return <HomePage onGoToGames={() => setActiveTab('games')} onGoToHonor={() => setActiveTab('honor')} onGoToRank={() => setActiveTab('rank')} onGoToProfile={() => setActiveTab('profile')} />
      case 'games':    return <GamesPage />
      case 'rank':     return <RankPage />
      case 'honor':    return <HonorPage />
      case 'missions': return <MissionsPage />
      case 'profile':  return <ProfilePage />
    }
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        onBellClick={() => setShowNotifications(true)}
      >
        <Suspense fallback={<PageSkeleton />}>
          {renderPage()}
        </Suspense>
      </Layout>

      <Suspense fallback={null}>
        {showNotifications && (
          <NotificationCenter
            onClose={() => setShowNotifications(false)}
            onUnreadChange={setUnreadCount}
          />
        )}

        {/* Lời mời tham gia phòng thi — hiện toàn cục cho nhân viên */}
        <RoomInvitationBanner
          onJoin={(code) => setInviteJoinCode(code)}
        />

        {/* GameRoomPage mở từ lời mời — có mã phòng điền sẵn */}
        {inviteJoinCode && (
          <GameRoomPage
            initialCode={inviteJoinCode}
            onClose={() => setInviteJoinCode(null)}
          />
        )}
      </Suspense>
    </>
  )
}
