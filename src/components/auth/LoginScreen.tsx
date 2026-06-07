import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onGoToRegister: () => void
}

export default function LoginScreen({ onGoToRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await login(email.trim(), password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">

        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="/logo-centosy.png"
            alt="Centosy"
            className="h-14 w-auto object-contain mb-4"
            style={{
              filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 12px rgba(233,78,27,0.6))',
              mixBlendMode: 'screen',
            }}
          />
          <h1 className="text-2xl font-black tracking-widest text-text-primary uppercase">
            CENTOSY ARENA
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Đăng nhập đấu trường nội bộ Centosy
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ten@centosy.vn"
              required
              autoComplete="email"
              className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                required
                autoComplete="current-password"
                className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: showPassword ? '#E94E1B' : '#585858' }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onGoToRegister}
            className="w-full border border-arena-border text-text-secondary font-semibold py-3 rounded-xl text-sm tracking-wide active:scale-95 transition-transform"
          >
            Đăng ký tài khoản nhân viên
          </button>
        </div>

        {/* Note */}
        <div className="mt-4 border border-arena-border rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            Dùng tài khoản nội bộ do Admin Centosy cấp.
            <br />
            Chưa có tài khoản? Bấm đăng ký để gửi yêu cầu.
          </p>
        </div>

      </div>
    </div>
  );
}
