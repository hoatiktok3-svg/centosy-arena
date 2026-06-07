import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type OrgGroup = 'cua-hang' | 'kho' | 'van-phong'

type OfficeDept =
  | 'tmdt'
  | 'kdtt'
  | 'mua-hang'
  | 'ke-toan'
  | 'hanh-chinh-nhan-su'
  | 'marketing'
  | 'giam-doc'

const ORG_GROUP_LABELS: Record<OrgGroup, string> = {
  'cua-hang': 'Cửa hàng',
  'kho': 'Kho',
  'van-phong': 'Văn phòng',
}

const OFFICE_DEPT_OPTIONS: { value: OfficeDept; label: string }[] = [
  { value: 'tmdt',               label: 'Thương mại điện tử (TMĐT)' },
  { value: 'kdtt',               label: 'Kinh doanh thị trường (KDTT)' },
  { value: 'mua-hang',           label: 'Mua hàng' },
  { value: 'ke-toan',            label: 'Kế toán' },
  { value: 'hanh-chinh-nhan-su', label: 'Hành chính nhân sự' },
  { value: 'marketing',          label: 'Marketing' },
  { value: 'giam-doc',           label: 'Giám đốc' },
]

// Vị trí cửa hàng
const CUAHANG_OPTIONS = [
  { value: 'nhan-vien-ban-hang', label: 'Nhân viên bán hàng' },
  { value: 'quan-ly-cua-hang',   label: 'Quản lý cửa hàng' },
]

// Kho cụ thể
const KHO_OPTIONS = [
  { value: 'kho-ha-noi', label: 'Kho Hà Nội' },
  { value: 'kho-hcm',    label: 'Kho HCM' },
]

interface Props {
  onBackToLogin: () => void
}

export default function RegisterScreen({ onBackToLogin }: Props) {
  const [fullName, setFullName]             = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]     = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const [phone, setPhone]                   = useState('')
  const [orgGroup, setOrgGroup]             = useState<OrgGroup | ''>('')
  const [officeDept, setOfficeDept]         = useState<OfficeDept | ''>('')
  const [cuahangPos, setCuahangPos]         = useState('')
  const [khoPos, setKhoPos]                 = useState('')

  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState(false)

  const handleOrgGroupChange = (g: OrgGroup) => {
    setOrgGroup(g)
    setOfficeDept('')
    setCuahangPos('')
    setKhoPos('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên.')
      return
    }
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại.')
      return
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (!confirmPassword) {
      setError('Vui lòng nhập lại mật khẩu.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    if (!orgGroup) {
      setError('Vui lòng chọn khối làm việc.')
      return
    }
    if (orgGroup === 'van-phong' && !officeDept) {
      setError('Vui lòng chọn phòng ban.')
      return
    }
    if (orgGroup === 'cua-hang' && !cuahangPos) {
      setError('Vui lòng chọn vị trí tại cửa hàng.')
      return
    }
    if (orgGroup === 'kho' && !khoPos) {
      setError('Vui lòng chọn kho làm việc.')
      return
    }

    setLoading(true)

    // registration_note lưu vị trí cụ thể (cửa hàng / kho)
    const registrationNote =
      orgGroup === 'cua-hang' ? cuahangPos :
      orgGroup === 'kho'      ? khoPos      : ''

    const metadata: Record<string, string> = {
      full_name:         fullName.trim(),
      phone:             phone.trim(),
      org_group:         orgGroup,
      registration_note: registrationNote,
    }
    if (orgGroup === 'van-phong' && officeDept) {
      metadata.office_department = officeDept
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: metadata },
    })

    setLoading(false)

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('User already registered')) {
        setError('Email này đã được đăng ký. Vui lòng dùng email khác hoặc quay lại đăng nhập.')
      } else if (signUpError.message.includes('invalid')) {
        setError('Email không hợp lệ. Vui lòng kiểm tra lại.')
      } else {
        setError(signUpError.message)
      }
      return
    }

    setSuccess(true)
  }

  /* ─── Success state ─── */
  if (success) {
    return (
      <div className="min-h-screen bg-arena-bg flex items-center justify-center px-4">
        <div className="w-full max-w-[430px] text-center">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo-centosy.png"
              alt="Centosy"
              className="h-14 w-auto object-contain mb-4"
              style={{
                filter: 'invert(1) hue-rotate(180deg) drop-shadow(0 0 12px rgba(233,78,27,0.6))',
                mixBlendMode: 'screen',
              }}
            />
          </div>

          <div className="bg-arena-card border border-arena-border rounded-2xl p-6 mb-6">
            {/* Icon check */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                 style={{ background: 'rgba(233,78,27,0.15)', border: '2px solid #E94E1B' }}>
              <svg width="32" height="32" fill="none" stroke="#E94E1B" strokeWidth={2.5} viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-xl font-black text-text-primary mb-2">Đăng ký thành công!</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Tài khoản của bạn đã được gửi cho Admin Centosy.
              <br /><br />
              Vui lòng chờ Admin xét duyệt. Bạn sẽ nhận thông báo qua email khi tài khoản được kích hoạt.
            </p>
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

  /* ─── Form ─── */
  return (
    <div className="min-h-screen bg-arena-bg flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-[430px]">

        {/* Logo + Title */}
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
          <h1 className="text-xl font-black tracking-widest text-text-primary uppercase">
            CENTOSY ARENA
          </h1>
          <p className="text-text-secondary text-sm mt-1">Đăng ký tài khoản nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Họ tên */}
          <Field label="Họ và tên *">
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className={inputClass}
            />
          </Field>

          {/* Số điện thoại */}
          <Field label="Số điện thoại *">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0901 234 567"
              className={inputClass}
            />
          </Field>

          {/* Email */}
          <Field label="Email *">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ten@centosy.vn"
              autoComplete="email"
              className={inputClass}
            />
          </Field>

          {/* Mật khẩu */}
          <Field label="Mật khẩu *">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
              />
              <EyeToggle show={showPassword} onToggle={() => setShowPassword(v => !v)} />
            </div>
          </Field>

          {/* Nhập lại mật khẩu */}
          <Field label="Nhập lại mật khẩu *">
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
                className={`${inputClass} pr-12 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-600'
                    : confirmPassword && confirmPassword === password
                    ? 'border-green-600'
                    : ''
                }`}
              />
              <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
            )}
            {confirmPassword && confirmPassword === password && (
              <p className="text-green-400 text-xs mt-1">✓ Mật khẩu khớp</p>
            )}
          </Field>

          {/* Khối tổ chức */}
          <Field label="Khối làm việc *">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ORG_GROUP_LABELS) as OrgGroup[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleOrgGroupChange(g)}
                  className="py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 border"
                  style={
                    orgGroup === g
                      ? { background: '#E94E1B', borderColor: '#E94E1B', color: '#fff' }
                      : { background: 'transparent', borderColor: '#2a2a2a', color: '#888' }
                  }
                >
                  {ORG_GROUP_LABELS[g]}
                </button>
              ))}
            </div>
          </Field>

          {/* Văn phòng → chọn phòng ban */}
          {orgGroup === 'van-phong' && (
            <Field label="Phòng ban *">
              <select
                value={officeDept}
                onChange={e => setOfficeDept(e.target.value as OfficeDept)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">-- Chọn phòng ban --</option>
                {OFFICE_DEPT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Cửa hàng → chọn vị trí */}
          {orgGroup === 'cua-hang' && (
            <Field label="Vị trí tại cửa hàng *">
              <select
                value={cuahangPos}
                onChange={e => setCuahangPos(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">-- Chọn vị trí --</option>
                {CUAHANG_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Kho → chọn kho cụ thể */}
          {orgGroup === 'kho' && (
            <Field label="Kho làm việc *">
              <select
                value={khoPos}
                onChange={e => setKhoPos(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">-- Chọn kho --</option>
                {KHO_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white font-bold py-3.5 rounded-xl text-sm tracking-wide uppercase disabled:opacity-60 active:scale-95 transition-transform mt-2"
          >
            {loading ? 'Đang gửi...' : 'Đăng ký tài khoản'}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full text-text-muted text-sm py-2 active:opacity-70 transition-opacity"
          >
            ← Quay lại đăng nhập
          </button>

        </form>

        {/* Note */}
        <div className="mt-6 border border-arena-border rounded-xl p-4 text-center">
          <p className="text-text-muted text-xs leading-relaxed">
            Tài khoản sẽ được Admin Centosy xét duyệt.
            <br />
            Bạn chưa thể đăng nhập cho đến khi được kích hoạt.
          </p>
        </div>

      </div>
    </div>
  )
}

/* ─── Helpers ─── */

const inputClass =
  'w-full bg-arena-card border border-arena-border rounded-xl px-4 py-3 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-brand transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

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
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
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
