/**
 * RoomInvitationBanner — STEP 105
 * Hiển thị lời mời tham gia phòng thi cho nhân viên.
 * Poll room_invitations mỗi 5s, hiện banner cố định khi có lời mời pending.
 */
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'

interface Invitation {
  id: string
  room_id: string
  room_code: string
  room_title: string
  invited_by: string
  status: 'pending' | 'accepted' | 'declined'
}

interface Props {
  /** Gọi khi nhân viên bấm "Tham gia ngay" với mã phòng */
  onJoin: (roomCode: string) => void
}

export default function RoomInvitationBanner({ onJoin }: Props) {
  const { currentUser } = useAuth()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [dismissing, setDismissing] = useState(false)
  const seenRef = useRef<Set<string>>(new Set())

  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (!currentUser?.id || isAdmin) return

    const poll = async () => {
      const { data } = await supabase
        .from('room_invitations')
        .select('id, room_id, room_code, room_title, invited_by, status')
        .eq('user_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data && !seenRef.current.has(data.id)) {
        setInvitation(data as Invitation)
      }
    }

    void poll()
    const interval = setInterval(() => void poll(), 5000)
    return () => clearInterval(interval)
  }, [currentUser?.id, isAdmin])

  const handleJoin = async () => {
    if (!invitation) return
    // Mark accepted
    await supabase
      .from('room_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)
    seenRef.current.add(invitation.id)
    const code = invitation.room_code
    setInvitation(null)
    onJoin(code)
  }

  const handleDecline = async () => {
    if (!invitation) return
    setDismissing(true)
    await supabase
      .from('room_invitations')
      .update({ status: 'declined' })
      .eq('id', invitation.id)
    seenRef.current.add(invitation.id)
    setInvitation(null)
    setDismissing(false)
  }

  if (!invitation) return null

  return (
    <div
      className="fixed bottom-20 left-3 right-3 z-[200] rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0f0a 0%, #1f1410 100%)',
        border: '1px solid rgba(233,78,27,0.45)',
        boxShadow: '0 8px 32px rgba(233,78,27,0.25), 0 2px 8px rgba(0,0,0,0.6)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E94E1B, #ff7a4d)' }} />

      <div className="px-4 py-3.5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span style={{ fontSize: '18px' }}>🎮</span>
          <p className="font-black text-white" style={{ fontSize: '13px', letterSpacing: '-0.02em' }}>
            Bạn được mời tham gia phòng thi!
          </p>
        </div>

        {/* Room info */}
        <p style={{ fontSize: '12px', color: '#aaa', marginBottom: 2 }}>
          {invitation.room_title}
        </p>
        <div className="flex items-center gap-2 mb-3.5">
          <span style={{ fontSize: '11px', color: '#666' }}>Mã phòng:</span>
          <span
            className="font-black tracking-widest"
            style={{ fontSize: '15px', color: '#E94E1B', letterSpacing: '0.12em' }}
          >
            {invitation.room_code}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => void handleJoin()}
            className="flex-1 font-black text-white rounded-xl py-2.5 active:scale-[0.97] transition-transform"
            style={{ fontSize: '13px', background: '#E94E1B' }}
          >
            🚀 Tham gia ngay
          </button>
          <button
            onClick={() => void handleDecline()}
            disabled={dismissing}
            className="px-4 py-2.5 rounded-xl font-semibold transition-opacity disabled:opacity-50"
            style={{ fontSize: '12px', color: '#666', background: '#141414', border: '1px solid #2a2a2a' }}
          >
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  )
}
