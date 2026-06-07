/**
 * ForgotPasswordScreen — Màn hình yêu cầu đặt lại mật khẩu
 *
 * Dùng supabase.auth.resetPasswordForEmail(email, { redirectTo })
 * Supabase sẽ gửi email chứa link về <redirectTo>#access_token=...&type=recovery
 *
 * Bảo mật:
 * - Luôn hiển thị thông báo thành công kể cả khi email không tồn tại
 *   → tránh lộ danh sách tài khoản (account enumeration)
 * - Không log email hay token
 */
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Props {
  onBackToLogin: () => void
}

export default function ForgotPasswordScreen({ onBackToLogin }: Props) {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [sent,    setSent]    = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email.')
      return
    }

    setLoading(true)

    // redirectTo: URL mà Supabase sẽ dán token vào (#access_token&type=recovery)
    // Cần thêm URL này vào Supabase Dashboard → Auth → URL Configuration → Redirect URLs
    const redirectTo = `${window.location.origin}${window.location.pathname}`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    )

    setLoading(false)

    if (resetError) {
      // Chỉ hiện lỗi kỹ thuật thật sự (quota, network, cấu hình sai)
      // KHÔNG hiện "email not found" để tránh account enumeration
      if (
        resetError.message.toLowerCase().includes('rate limit') ||
        resetError.message.toLowerCase().includes('too many')
      ) {
        setError('Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ vài phút trước khi thử lại.')
        return
      }
      // Mọi lỗi khác vẫn hiện success → tránh lộ thông tin tài khoản
    }

    // Luôn show success (kể cả email không tồn tại trong hệ thống)
    setSent(true)
  }

  // ── Màn hình đã gửi ─────────────────────────────────────────
  if (sent) {
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
            {/* Icon email */}
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(233,78,27,0.12)', border: '2px solid #E94E1B' }}
            >
              <svg width="28" height="28" fill="none" stroke="#E94E1B" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-xl font-black text-text-primary mb-3">Kiểm tra hộp thư</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Nếu email <span className="text-text-primary font-medium">{email}</span> tồn tại trong hệ thống,
              chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
            </p>
            <div
              className="mt-4 rounded-xl px-4 py-3 text-left"
              style={{ background: 'rgba(233,78,27,0.06)', border: '1px solid rgba(233,78,27,0.18)' }}
            >
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Lưu ý</p>
              <ul className="text-text-muted text-xs leading-relaxed space-y-1">
                <li>• Kiểm tra cả thư mục Spam / Junk</li>
                <li>• Link có hiệu lực trong <strong className="text-text-secondary">1 giờ</strong></li>
                <li>• Không chia sẻ link này cho người khác</li>
              </ul>
            </div>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full border border-arena-border text-text-primary font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase active:scale-95 transition-transform"
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    )
  }

  // ── Form nhập email ──────────────────────────────────────────
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
          <p className="text-text-secondary text-sm mt-1">Đặt lại mật khẩu</p>
        </div>

        {/* Icon khoá */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(233,78,27,0.1)', border: '1.5px solid rgba(233,78,27,0.3)' }}
          >
            <svg width="24" height="24" fill="none" stroke="#E94E1B" strokeWidth={1.8} viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
        </div>

        <p className="text-text-secondary text-sm text-center mb-6 leading-relaxed px-2">
          Nhập email bạn đăng ký tài khoản. Chúng tôi sẽ gửi link đặt lại mật khẩu đến hộp thư của bạn.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Email tài khoản
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ten@centosy.vn"
              autoComplete="email"
              autoFocus
              className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase disabled:opacity-60 active:scale-95 transition-transform"
          >
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-text-muted text-sm py-2 active:opacity-70 transition-opacity"
          >
            ← Quay lại đăng nhập
          </button>
        </form>

      </div>
    </div>
  )
}
