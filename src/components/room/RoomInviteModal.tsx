/**
 * RoomInviteModal — Gửi lời mời tham gia phòng chơi
 * Admin chọn theo phòng ban hoặc chọn từng thành viên
 * Lời mời lưu vào room_invitations table → thành viên thấy thông báo
 */
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

interface Profile {
  id: string
  full_name: string
  email: string
  department: string | null
  org_group: string | null
  role: string
  is_active: boolean
}

interface Props {
  roomId: string
  roomCode: string
  roomTitle: string
  onClose: () => void
}

const DEPT_LABELS: Record<string, string> = {
  'van-phong': '🏢 Văn phòng',
  'cua-hang':  '🏪 Cửa hàng',
  'kho':       '📦 Kho',
  'tmdt':      '💻 TMĐT',
}

export default function RoomInviteModal({ roomId, roomCode, roomTitle, onClose }: Props) {
  const { currentUser } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  // Selection
  const [mode, setMode]           = useState<'department' | 'individual'>('department')
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set())
  const [selectedIds, setSelectedIds]     = useState<Set<string>>(new Set())
  const [searchQ, setSearchQ]     = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name, email, department, org_group, role, is_active')
      .eq('is_active', true)
      .neq('id', currentUser?.id ?? '')
      .order('full_name')
      .then(({ data }) => {
        setProfiles((data ?? []) as Profile[])
        setLoading(false)
      })
  }, [currentUser?.id])

  const departments = [...new Set(profiles.map(p => p.department || p.org_group || 'other').filter(Boolean))]

  const filteredProfiles = profiles.filter(p => {
    if (!searchQ) return true
    const q = searchQ.toLowerCase()
    return p.full_name?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q)
  })

  const getTargetIds = (): string[] => {
    if (mode === 'department') {
      if (selectedDepts.size === 0) return profiles.map(p => p.id) // all
      return profiles
        .filter(p => selectedDepts.has(p.department || p.org_group || 'other'))
        .map(p => p.id)
    }
    return [...selectedIds]
  }

  const targetIds = getTargetIds()
  const targetCount = targetIds.length

  const handleSend = async () => {
    if (targetCount === 0) { setError('Chọn ít nhất 1 thành viên.'); return }
    setSending(true); setError('')
    try {
      // Insert invitations
      const rows = targetIds.map(uid => ({
        room_id:    roomId,
        user_id:    uid,
        invited_by: currentUser?.id,
        room_code:  roomCode,
        room_title: roomTitle,
        status:     'pending',
      }))
      const { error: e } = await supabase.from('room_invitations').upsert(rows, { onConflict: 'room_id,user_id' })
      if (e) throw new Error(e.message)
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi lời mời thất bại')
    } finally {
      setSending(false)
    }
  }

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev => {
      const next = new Set(prev)
      next.has(dept) ? next.delete(dept) : next.add(dept)
      return next
    })
  }

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const BRAND = '#E94E1B'

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
        <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-8 text-center"
             style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
               style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981' }}>📨</div>
          <h3 className="text-xl font-black text-white mb-2">Đã gửi lời mời!</h3>
          <p className="text-gray-400 text-sm mb-6">
            Đã gửi lời mời tới <span className="text-white font-bold">{targetCount} thành viên</span>.<br/>
            Họ sẽ thấy thông báo khi mở app.
          </p>
          {/* Copy code */}
          <div className="rounded-xl p-3 mb-5 flex items-center justify-between"
               style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Mã phòng</p>
              <p className="text-2xl font-black tracking-widest" style={{ color: BRAND }}>{roomCode}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'rgba(233,78,27,0.15)', color: BRAND, border: `1px solid ${BRAND}44` }}>
              Copy
            </button>
          </div>
          <button onClick={onClose}
                  className="w-full py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: BRAND }}>
            Xong
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-0 sm:px-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl"
           style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="font-black text-white text-base">📨 Gửi lời mời</p>
            <p className="text-xs text-gray-400">Phòng: <span style={{ color: BRAND }}>{roomCode}</span> · {roomTitle}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['department', 'individual'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                      className="py-2.5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: mode === m ? `${BRAND}22` : 'rgba(255,255,255,0.04)',
                        border: mode === m ? `1px solid ${BRAND}66` : '1px solid rgba(255,255,255,0.08)',
                        color: mode === m ? BRAND : '#888',
                      }}>
                {m === 'department' ? '🏢 Theo phòng ban' : '👤 Chọn thành viên'}
              </button>
            ))}
          </div>

          {mode === 'department' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Chọn phòng ban (bỏ chọn = gửi tất cả)</p>
                <button onClick={() => setSelectedDepts(new Set())}
                        className="text-xs text-gray-500 underline">Tất cả</button>
              </div>
              {loading ? (
                <p className="text-gray-500 text-sm text-center py-4">Đang tải...</p>
              ) : (
                departments.map(dept => {
                  const count = profiles.filter(p => (p.department || p.org_group || 'other') === dept).length
                  const selected = selectedDepts.size === 0 || selectedDepts.has(dept)
                  return (
                    <button key={dept} onClick={() => toggleDept(dept)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                            style={{
                              background: selected ? `${BRAND}14` : 'rgba(255,255,255,0.04)',
                              border: selected ? `1px solid ${BRAND}44` : '1px solid rgba(255,255,255,0.08)',
                            }}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
                             style={{ background: selected ? BRAND : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                          {selected ? '✓' : ''}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {DEPT_LABELS[dept] || `📁 ${dept}`}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{count} người</span>
                    </button>
                  )
                })
              )}
            </div>
          )}

          {mode === 'individual' && (
            <div className="space-y-2">
              <input
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="🔍 Tìm tên hoặc email..."
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{selectedIds.size} đã chọn</span>
                <button onClick={() => setSelectedIds(new Set(filteredProfiles.map(p => p.id)))}
                        className="underline">Chọn tất cả</button>
              </div>
              {loading ? (
                <p className="text-gray-500 text-sm text-center py-4">Đang tải...</p>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {filteredProfiles.map(p => {
                    const sel = selectedIds.has(p.id)
                    return (
                      <button key={p.id} onClick={() => toggleId(p.id)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                              style={{
                                background: sel ? `${BRAND}12` : 'rgba(255,255,255,0.03)',
                                border: sel ? `1px solid ${BRAND}44` : '1px solid rgba(255,255,255,0.06)',
                              }}>
                        <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0"
                             style={{ background: sel ? BRAND : 'rgba(255,255,255,0.1)', color: '#fff' }}>
                          {sel ? '✓' : ''}
                        </div>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                             style={{ background: `${BRAND}22`, color: BRAND }}>
                          {p.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{p.full_name || p.email}</p>
                          <p className="text-xs text-gray-500 truncate">{DEPT_LABELS[p.department || ''] || p.department || 'Chưa xác định'}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-6 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-400">
              Sẽ gửi tới: <span className="text-white font-bold">{targetCount} thành viên</span>
            </p>
            {/* Room code display */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                 style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)' }}>
              <span className="text-xs text-gray-400">Mã:</span>
              <span className="font-black text-sm tracking-widest" style={{ color: BRAND }}>{roomCode}</span>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || targetCount === 0}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm tracking-wide transition-all active:scale-95 disabled:opacity-40"
            style={{ background: targetCount > 0 ? `linear-gradient(135deg, ${BRAND}, #ff6b35)` : '#333' }}>
            {sending ? '📤 Đang gửi...' : `📨 Gửi lời mời tới ${targetCount} người`}
          </button>
        </div>
      </div>
    </div>
  )
}
