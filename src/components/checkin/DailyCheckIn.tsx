import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

interface CheckinRecord {
  checkin_date: string
  points_earned: number
}

function calcStreak(records: CheckinRecord[]): number {
  if (records.length === 0) return 0
  // sort desc
  const dates = records
    .map(r => r.checkin_date)
    .sort((a, b) => (a < b ? 1 : -1))

  // Start from today or yesterday
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak   = 0
  let expected = new Date(today)

  for (const dateStr of dates) {
    const d = new Date(dateStr)
    d.setHours(0, 0, 0, 0)
    if (d.getTime() === expected.getTime()) {
      streak++
      expected.setDate(expected.getDate() - 1)
    } else if (d < expected) {
      break
    }
  }
  return streak
}

const CHECKIN_POINTS = 5

export default function DailyCheckIn() {
  const { currentUser } = useAuth()
  const [checkedToday, setCheckedToday] = useState(false)
  const [streak,       setStreak]       = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [submitting,   setSubmitting]   = useState(false)
  const [justDone,     setJustDone]     = useState(false)

  useEffect(() => {
    if (!currentUser?.id) { setLoading(false); return }
    void fetchCheckinData()
  }, [currentUser?.id])

  async function fetchCheckinData() {
    setLoading(true)
    const { data } = await supabase
      .from('daily_checkins')
      .select('checkin_date, points_earned')
      .eq('user_id', currentUser!.id)
      .order('checkin_date', { ascending: false })
      .limit(30)

    const records = (data ?? []) as CheckinRecord[]

    // Check today
    const todayStr = new Date().toISOString().slice(0, 10)
    const hasTodayEntry = records.some(r => r.checkin_date === todayStr)

    setCheckedToday(hasTodayEntry)
    setStreak(calcStreak(records))
    setLoading(false)
  }

  async function handleCheckIn() {
    if (!currentUser?.id || submitting || checkedToday) return
    setSubmitting(true)

    const todayStr = new Date().toISOString().slice(0, 10)
    const { error } = await supabase.from('daily_checkins').insert({
      user_id:      currentUser.id,
      checkin_date: todayStr,
      points_earned: CHECKIN_POINTS,
    })

    if (!error) {
      setCheckedToday(true)
      setStreak(s => s + 1)
      setJustDone(true)
      setTimeout(() => setJustDone(false), 3000)
    }
    setSubmitting(false)
  }

  if (loading) return null

  // Streak fire tier
  const streakIcon = streak >= 30 ? '🔥' : streak >= 14 ? '⚡' : streak >= 7 ? '✨' : '📅'
  const streakColor = streak >= 30 ? '#f97316' : streak >= 14 ? '#facc15' : streak >= 7 ? '#4ade80' : '#585858'

  return (
    <div className="rounded-2xl px-4 py-4"
         style={{
           background: checkedToday ? 'rgba(74,222,128,0.05)' : '#181818',
           border: `1.5px solid ${checkedToday ? 'rgba(74,222,128,0.3)' : 'rgba(233,78,27,0.3)'}`,
         }}>
      <div className="flex items-center gap-3">
        {/* Streak icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
             style={{
               background: checkedToday ? 'rgba(74,222,128,0.1)' : 'rgba(233,78,27,0.1)',
               border: `1px solid ${checkedToday ? 'rgba(74,222,128,0.3)' : 'rgba(233,78,27,0.3)'}`,
             }}>
          {checkedToday ? '✅' : streakIcon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-black" style={{ fontSize: '14px', color: '#fff' }}>
            {checkedToday
              ? (justDone ? 'Điểm danh thành công! +5đ' : 'Đã điểm danh hôm nay')
              : 'Điểm danh hôm nay +5đ'
            }
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span style={{ fontSize: '14px' }}>{streakIcon}</span>
            <span className="font-bold" style={{ fontSize: '12px', color: streakColor }}>
              {streak} ngày liên tiếp
            </span>
            {streak >= 7 && (
              <span className="rounded-full px-1.5 py-0.5 font-bold"
                    style={{ fontSize: '9px', background: `${streakColor}20`, color: streakColor, border: `1px solid ${streakColor}40` }}>
                🔥 STREAK
              </span>
            )}
          </div>
        </div>

        {/* Button */}
        {!checkedToday ? (
          <button
            onClick={handleCheckIn}
            disabled={submitting}
            className="shrink-0 px-4 py-2.5 rounded-xl font-black transition-all active:scale-90"
            style={{
              fontSize: '12px',
              background: submitting ? '#1e1e1e' : 'linear-gradient(90deg,#E94E1B,#FF5A28)',
              color: submitting ? '#585858' : '#fff',
              boxShadow: submitting ? 'none' : '0 3px 12px rgba(233,78,27,0.3)',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}>
            {submitting ? '...' : 'Check-in'}
          </button>
        ) : (
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
            <span style={{ fontSize: '18px' }}>✓</span>
          </div>
        )}
      </div>

      {/* Streak milestone */}
      {streak > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #1e1e1e' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p style={{ fontSize: '10px', color: '#585858' }}>
              Tiến độ đến mốc {streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 'max'}
            </p>
            <p style={{ fontSize: '10px', color: streakColor, fontWeight: 700 }}>
              {streak}/{streak < 7 ? 7 : streak < 14 ? 14 : streak < 30 ? 30 : 30}
            </p>
          </div>
          <div className="h-1 rounded-full" style={{ background: '#1e1e1e' }}>
            <div className="h-full rounded-full transition-all duration-700"
                 style={{
                   width: `${Math.min(100, (streak / (streak < 7 ? 7 : streak < 14 ? 14 : 30)) * 100)}%`,
                   background: streakColor,
                 }} />
          </div>
        </div>
      )}
    </div>
  )
}
