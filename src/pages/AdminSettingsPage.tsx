import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

// ── Types ─────────────────────────────────────────────────────────
interface ModuleToggle {
  key:     string
  label:   string
  icon:    string
  enabled: boolean
}

interface PointSetting {
  key:   string
  label: string
  icon:  string
  value: number
  min:   number
  max:   number
  step:  number
}

interface AlertSetting {
  key:     string
  label:   string
  icon:    string
  enabled: boolean
  detail:  string
}

const STORAGE_KEY = 'centosy_admin_settings'

interface SavedSettings {
  modules: Record<string, boolean>
  points:  Record<string, number>
  alerts:  Record<string, boolean>
}

function loadSettings(): SavedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as SavedSettings
  } catch {}
  return { modules: {}, points: {}, alerts: {} }
}

function saveSettings(s: SavedSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// ── Default configs ───────────────────────────────────────────────
const DEFAULT_MODULES: ModuleToggle[] = [
  { key: 'checkin',     label: 'Daily Check-in',    icon: '📅', enabled: true  },
  { key: 'missions',    label: 'Nhiệm vụ',           icon: '🎯', enabled: true  },
  { key: 'games',       label: 'Mini Games',         icon: '🎮', enabled: true  },
  { key: 'praise',      label: 'Khen ngợi đồng đội', icon: '🌟', enabled: true  },
  { key: 'recognition', label: 'Ghi nhận thành tích',icon: '🏆', enabled: true  },
  { key: 'training',    label: 'Học viện Centosy',   icon: '📚', enabled: true  },
  { key: 'reward_shop', label: 'Reward Shop',         icon: '🛍️', enabled: true  },
]

const DEFAULT_POINTS: PointSetting[] = [
  { key: 'checkin_pts',  label: 'Điểm check-in/ngày',    icon: '📅', value: 5,   min: 1,  max: 50, step: 1 },
  { key: 'mission_pts',  label: 'Điểm nhiệm vụ cơ bản',  icon: '✅', value: 10,  min: 5,  max: 100,step: 5 },
  { key: 'game_pts',     label: 'Điểm game/lượt (max)',   icon: '🎮', value: 100, min: 10, max: 500,step: 10},
  { key: 'praise_pts',   label: 'Điểm nhận khen ngợi',   icon: '🌟', value: 5,   min: 1,  max: 20, step: 1 },
]

const DEFAULT_ALERTS: AlertSetting[] = [
  { key: 'alert_zero',    label: 'Cảnh báo 0 điểm',          icon: '⚠️', enabled: true,  detail: 'Thông báo khi thành viên không có điểm' },
  { key: 'alert_pending', label: 'Cảnh báo pending lâu',      icon: '⏰', enabled: true,  detail: 'Khi nhiệm vụ chờ > 3 ngày' },
  { key: 'alert_inactive',label: 'Cảnh báo không hoạt động',  icon: '😴', enabled: true,  detail: 'Thành viên không làm gì trong tuần' },
]

// ── Component ─────────────────────────────────────────────────────
export default function AdminSettingsPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const canView = canAccessAdminPanel(currentUser?.role)

  const saved = loadSettings()

  const [modules, setModules] = useState<ModuleToggle[]>(() =>
    DEFAULT_MODULES.map(m => ({ ...m, enabled: saved.modules[m.key] ?? m.enabled }))
  )
  const [points, setPoints] = useState<PointSetting[]>(() =>
    DEFAULT_POINTS.map(p => ({ ...p, value: saved.points[p.key] ?? p.value }))
  )
  const [alerts, setAlerts] = useState<AlertSetting[]>(() =>
    DEFAULT_ALERTS.map(a => ({ ...a, enabled: saved.alerts[a.key] ?? a.enabled }))
  )
  const [saved2, setSaved2] = useState(false)

  function handleSave() {
    const s: SavedSettings = {
      modules: Object.fromEntries(modules.map(m => [m.key, m.enabled])),
      points:  Object.fromEntries(points.map(p  => [p.key, p.value])),
      alerts:  Object.fromEntries(alerts.map(a  => [a.key, a.enabled])),
    }
    saveSettings(s)
    setSaved2(true)
    setTimeout(() => setSaved2(false), 2000)
  }

  function toggleModule(key: string) {
    setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m))
  }

  function toggleAlert(key: string) {
    setAlerts(prev => prev.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a))
  }

  function changePoint(key: string, delta: number) {
    setPoints(prev => prev.map(p => {
      if (p.key !== key) return p
      const next = Math.min(p.max, Math.max(p.min, p.value + delta * p.step))
      return { ...p, value: next }
    }))
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.92)' }}>
      <div className="w-full max-w-[430px] h-full flex flex-col"
           style={{ background: '#0a0a0a', borderLeft: '1px solid #1a1a1a', borderRight: '1px solid #1a1a1a' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0"
             style={{ borderBottom: '1px solid #1a1a1a' }}>
          <button onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '16px' }}>
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black" style={{ fontSize: '17px', letterSpacing: '-0.3px' }}>
              Cài đặt hệ thống
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Chỉ dành cho Admin</p>
          </div>
          <button
            onClick={handleSave}
            className="shrink-0 px-3 py-1.5 rounded-xl font-bold transition-all"
            style={{
              fontSize: '12px',
              background: saved2 ? 'rgba(52,211,153,0.15)' : 'rgba(233,78,27,0.15)',
              border:     saved2 ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(233,78,27,0.4)',
              color:      saved2 ? '#34d399' : '#E94E1B',
            }}>
            {saved2 ? '✓ Đã lưu' : 'Lưu'}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {!canView ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '40px' }}>🔒</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Không có quyền truy cập</p>
              <p style={{ fontSize: '12px', color: '#585858', textAlign: 'center' }}>
                Tính năng này chỉ dành cho Admin.
              </p>
            </div>
          ) : (
            <>
              {/* ── Modules ── */}
              <p className="font-bold text-white mt-5 mb-3" style={{ fontSize: '13px' }}>
                Modules hoạt động
              </p>
              <div className="flex flex-col gap-2">
                {modules.map(m => (
                  <button
                    key={m.key}
                    onClick={() => toggleModule(m.key)}
                    className="w-full flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all text-left"
                    style={{
                      background: m.enabled ? 'rgba(52,211,153,0.06)' : '#111',
                      border: m.enabled ? '1px solid rgba(52,211,153,0.2)' : '1px solid #1f1f1f',
                    }}>
                    <span style={{ fontSize: '18px', width: 24, textAlign: 'center', flexShrink: 0 }}>{m.icon}</span>
                    <p className="flex-1 font-semibold" style={{ fontSize: '13px', color: m.enabled ? '#fff' : '#484848' }}>
                      {m.label}
                    </p>
                    {/* Toggle pill */}
                    <div className="shrink-0 w-11 h-6 rounded-full flex items-center px-0.5 transition-all"
                         style={{ background: m.enabled ? '#34d399' : '#252525' }}>
                      <div className="w-5 h-5 rounded-full bg-white transition-all"
                           style={{ transform: m.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Point settings ── */}
              <p className="font-bold text-white mt-6 mb-3" style={{ fontSize: '13px' }}>
                Cấu hình điểm thưởng
              </p>
              <div className="flex flex-col gap-2.5">
                {points.map(p => (
                  <div key={p.key}
                       className="rounded-xl px-3.5 py-3 flex items-center gap-3"
                       style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                    <span style={{ fontSize: '16px', flexShrink: 0 }}>{p.icon}</span>
                    <p className="flex-1 text-white font-semibold" style={{ fontSize: '12px' }}>{p.label}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => changePoint(p.key, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black"
                        style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '14px' }}>
                        −
                      </button>
                      <p className="font-black text-center" style={{ fontSize: '14px', color: '#E94E1B', minWidth: 32 }}>
                        {p.value}
                      </p>
                      <button
                        onClick={() => changePoint(p.key, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black"
                        style={{ background: '#1a1a1a', border: '1px solid #252525', color: '#888', fontSize: '14px' }}>
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Alert settings ── */}
              <p className="font-bold text-white mt-6 mb-3" style={{ fontSize: '13px' }}>
                Cài đặt cảnh báo
              </p>
              <div className="flex flex-col gap-2">
                {alerts.map(a => (
                  <button
                    key={a.key}
                    onClick={() => toggleAlert(a.key)}
                    className="w-full flex items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-all"
                    style={{
                      background: a.enabled ? 'rgba(250,204,21,0.05)' : '#111',
                      border: a.enabled ? '1px solid rgba(250,204,21,0.2)' : '1px solid #1f1f1f',
                    }}>
                    <span style={{ fontSize: '16px', marginTop: 1, flexShrink: 0 }}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ fontSize: '12px', color: a.enabled ? '#fff' : '#484848' }}>
                        {a.label}
                      </p>
                      <p style={{ fontSize: '10px', color: '#585858', marginTop: 2 }}>{a.detail}</p>
                    </div>
                    <div className="shrink-0 w-11 h-6 rounded-full flex items-center px-0.5 mt-0.5 transition-all"
                         style={{ background: a.enabled ? '#facc15' : '#252525' }}>
                      <div className="w-5 h-5 rounded-full bg-white transition-all"
                           style={{ transform: a.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Note: these settings are stored in localStorage for now */}
              <p className="mt-5" style={{ fontSize: '10px', color: '#383838', textAlign: 'center' }}>
                Cài đặt được lưu cục bộ trên thiết bị này. Nhớ nhấn "Lưu" để áp dụng.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
