/**
 * ResetPasswordScreen — Màn hình đặt mật khẩu mới
 *
 * Được hiển thị khi Supabase phát hiện token recovery trong URL hash.
 * App.tsx lắng nghe sự kiện PASSWORD_RECOVERY từ onAuthStateChange
 * và chuyển sang màn hình này.
 *
 * Dùng supabase.auth.updateUser({ password }) để cập nhật mật khẩu.
 *
 * Bảo mật:
 * - Không log password mới
 * - Không log token (Supabase tự xử lý từ URL hash)
 * - Sau khi đổi thành công → logout và quay login
 *   (để user đăng nhập lại bằng mật khẩu mới, xác nhận đổi đúng)
 */
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Props {
  onDone: () => void   // Callback sau khi đổi mật khẩu thành công → về Login
}

export default function ResetPasswordScreen({ onDone }: Props) {
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')
  const [success,         setSuccess]         = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới.')
      return
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (!confirmPassword) {
      setError('Vui lòng nhập lại mật khẩu mới.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setLoading(true)

    // Supabase đã xử lý token từ URL hash, chỉ cần gọi updateUser
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (updateError) {
      if (updateError.message.toLowerCase().includes('same password')) {
        setError('Mật khẩu mới phải khác mật khẩu cũ.')
      } else if (updateError.message.toLowerCase().includes('expired') || updateError.message.toLowerCase().includes('invalid')) {
        setError('Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.')
      } else {
        setError('Có lỗi xảy ra. Vui lòng thử lại hoặc yêu cầu link mới.')
      }
      return
    }

    // Đổi thành công → đăng xuất để user đăng nhập lại bằng mật khẩu mới
    await supabase.auth.signOut()
    setSuccess(true)
  }

  // ── Thành công ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4">
        <div className="w-full max-w-[430px] text-center">

          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo-centosy.png"
              alt="Centosy"
              className="h-12 w-auto object-contain mb-3"
              style={{
                filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 12px rgba(233,78,27,0.6))',
                mixBlendMode: 'screen',
              }}
            />
          </div>

          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 mb-6">
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(233,78,27,0.15)', border: '2px solid #E94E1B' }}
            >
              <svg width="32" height="32" fill="none" stroke="#E94E1B" strokeWidth={2.5} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-text-primary mb-3">Đổi mật khẩu thành công!</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Mật khẩu của bạn đã được cập nhật.
              <br />
              Vui lòng đăng nhập lại bằng mật khẩu mới.
            </p>
          </div>

          <button
            onClick={onDone}
            className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase active:scale-95 transition-transform"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    )
  }

  // ── Form đặt mật khẩu mới ────────────────────────────────────
  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo-centosy.png"
            alt="Centosy"
            className="h-12 w-auto object-contain mb-3"
            style={{
              filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 12px rgba(233,78,27,0.6))',
              mixBlendMode: 'screen',
            }}
          />
          <h1 className="text-xl font-black tracking-widest text-text-primary uppercase">CENTOSY ARENA</h1>
          <p className="text-text-secondary text-sm mt-1">Đặt mật khẩu mới</p>
        </div>

        {/* Icon khoá mở */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(233,78,27,0.1)', border: '1.5px solid rgba(233,78,27,0.3)' }}
          >
            <svg width="24" height="24" fill="none" stroke="#E94E1B" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 019.9-1" />
            </svg>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Mật khẩu mới *
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                autoFocus
                className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand transition-colors"
              />
              <EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
            </div>
          </div>

          {/* Nhập lại mật khẩu mới */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Nhập lại mật khẩu mới *
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className={`w-full bg-arena-card border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted text-sm focus:outline-none transition-colors ${
                  confirmPassword && confirmPassword !== newPassword
                    ? 'border-red-600 focus:border-red-600'
                    : confirmPassword && confirmPassword === newPassword
                    ? 'border-green-600 focus:border-green-600'
                    : 'border-arena-border focus:border-brand'
                }`}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
            )}
            {confirmPassword && confirmPassword === newPassword && (
              <p className="text-green-400 text-xs mt-1">✓ Mật khẩu khớp</p>
            )}
          </div>

          {/* Yêu cầu độ mạnh */}
          <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e1e' }}>
            <p className="text-text-muted text-xs">
              Mật khẩu phải có <span className={newPassword.length >= 6 ? 'text-green-400 font-semibold' : 'text-text-muted'}>ít nhất 6 ký tự</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase disabled:opacity-60 active:scale-95 transition-transform mt-2"
          >
            {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
          </button>

        </form>

      </div>
    </div>
  )
}

/* ─── EyeToggle helper ─────────────────────────────────────── */
function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
      style={{ color: show ? '#E94E1B' : '#585858' }}
      tabIndex={-1}
      aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
    >
      {show ? (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}
