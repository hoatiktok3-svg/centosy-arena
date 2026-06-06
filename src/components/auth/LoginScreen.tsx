import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              required
              autoComplete="current-password"
              className="w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand"
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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Note */}
        <div className="mt-8 border border-arena-border rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            Dùng tài khoản nội bộ do Admin Centosy cấp.
            <br />
            Liên hệ quản trị viên nếu chưa có tài khoản.
          </p>
        </div>

      </div>
    </div>
  );
}
