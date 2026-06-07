import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { AppRole } from '../lib/permissions'

// Shape dùng trong toàn app — map từ public.profiles
export interface UserProfile {
  id: string
  name: string
  email: string
  role: AppRole
  department: string
  avatarInitials: string
  title: string
  score: number
  accountStatus: 'pending' | 'approved' | 'rejected' | 'inactive'
  rejectedReason: string | null
  isActive: boolean
  orgGroup: string | null
  officeDepartment: string | null
}

interface AuthContextValue {
  currentUser: UserProfile | null
  profile: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// Map row từ Supabase profiles sang UserProfile
function mapProfile(row: Record<string, unknown>, email: string): UserProfile {
  const initials = String(row.avatar_initials ?? '')
    || String(row.full_name ?? email)
        .split(' ')
        .slice(-2)
        .map((w: string) => w[0]?.toUpperCase() ?? '')
        .join('')
  return {
    id: String(row.id),
    name: String(row.full_name ?? email),
    email: String(row.email ?? email),
    role: (row.role as AppRole) ?? 'employee',
    department: String(row.department ?? 'van-phong'),
    avatarInitials: initials,
    title: String(row.title ?? ''),
    score: Number(row.score ?? 0),
    accountStatus: (row.account_status as UserProfile['accountStatus']) ?? 'approved',
    rejectedReason: (row.rejected_reason as string | null) ?? null,
    isActive: row.is_active !== false,
    orgGroup: (row.org_group as string | null) ?? null,
    officeDepartment: (row.office_department as string | null) ?? null,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !data) {
      // Profile chưa tồn tại (chưa chạy schema) — tạo UserProfile tối thiểu
      setCurrentUser({ id: userId, name: email, email, role: 'employee', department: 'van-phong', avatarInitials: email[0]?.toUpperCase() ?? '?', title: '', score: 0, accountStatus: 'approved', rejectedReason: null, isActive: true, orgGroup: null, officeDepartment: null })
    } else {
      setCurrentUser(mapProfile(data as Record<string, unknown>, email))
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfile(session.user.id, session.user.email ?? '')
    }
  }, [session, loadProfile])

  useEffect(() => {
    // Lấy session hiện tại khi app mở
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id, s.user.email ?? '').finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    // Lắng nghe thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s?.user) {
        loadProfile(s.user.id, s.user.email ?? '')
      } else {
        setCurrentUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return { error: null }

    // Dịch lỗi Supabase sang tiếng Việt
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email chưa được xác nhận. Kiểm tra hộp thư và xác nhận tài khoản.' }
    }
    return { error: error.message }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile: currentUser,
      session,
      isAuthenticated: !!currentUser,
      isLoading,
      login,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
