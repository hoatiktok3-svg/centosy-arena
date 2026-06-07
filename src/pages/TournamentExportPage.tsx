/**
 * TournamentExportPage — STEP 85
 * Xuất kết quả giải đấu ra CSV: season leaderboard, dept ranking, game sessions.
 * Tái sử dụng pattern từ ExportDataPage (STEP 61).
 */
import { useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

// ── CSV helpers ────────────────────────────────────────────────
function arrayToCSV(rows: (string | number | null)[][]): string {
  return rows
    .map(row => row.map(cell => {
      const s = String(cell ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }).join(','))
    .join('\n')
}

function downloadCSV(content: string, filename: string) {
  const bom  = '﻿'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getSeasonStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getMonthSlug(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function TournamentExportPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const isAdmin = currentUser ? canAccessAdminPanel(currentUser.role) : false

  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone]       = useState<string[]>([])

  const markDone = useCallback((key: string) => {
    setDone(prev => [...prev, key])
    setTimeout(() => setDone(prev => prev.filter(k => k !== key)), 3000)
  }, [])

  // 1. Season leaderboard CSV
  const exportSeasonLeaderboard = useCallback(async () => {
    setLoading('season')
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    const userScore: Record<string, { name: string | null; org: string | null; score: number; plays: number }> = {}
    for (const s of sessions ?? []) {
      const uid  = s.user_id
      const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
      if (!userScore[uid]) userScore[uid] = { name: prof?.full_name ?? null, org: prof?.org_group ?? null, score: 0, plays: 0 }
      userScore[uid].score += s.score
      userScore[uid].plays += 1
    }

    const rows = Object.values(userScore).sort((a, b) => b.score - a.score)
    const csvData: (string | number | null)[][] = [
      ['Hạng', 'Họ tên', 'Phòng ban', 'Tổng điểm', 'Số lượt chơi'],
      ...rows.map((r, i) => [i + 1, r.name, r.org, r.score, r.plays]),
    ]
    downloadCSV(arrayToCSV(csvData), `season_leaderboard_${getMonthSlug()}.csv`)
    setLoading(null)
    markDone('season')
  }, [markDone])

  // 2. Dept ranking CSV
  const exportDeptRanking = useCallback(async () => {
    setLoading('dept')
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, score, profiles:user_id(org_group)')
      .eq('status', 'completed')
      .eq('score_credited', true)
      .gte('completed_at', getSeasonStart())

    const deptMap: Record<string, { totalScore: number; members: Set<string>; plays: number }> = {}
    for (const s of sessions ?? []) {
      const dept = (s.profiles as { org_group: string | null } | null)?.org_group ?? 'Không rõ'
      if (!deptMap[dept]) deptMap[dept] = { totalScore: 0, members: new Set(), plays: 0 }
      deptMap[dept].totalScore += s.score
      deptMap[dept].members.add(s.user_id)
      deptMap[dept].plays += 1
    }

    const rows = Object.entries(deptMap)
      .map(([dept, d]) => [dept, d.totalScore, d.members.size, d.plays, Math.round(d.totalScore / d.members.size)])
      .sort((a, b) => (b[1] as number) - (a[1] as number))

    const csvData: (string | number | null)[][] = [
      ['Hạng', 'Phòng ban', 'Tổng điểm', 'Số người', 'Số lượt', 'Điểm TB/người'],
      ...rows.map((r, i) => [i + 1, ...r]),
    ]
    downloadCSV(arrayToCSV(csvData), `dept_ranking_${getMonthSlug()}.csv`)
    setLoading(null)
    markDone('dept')
  }, [markDone])

  // 3. All game sessions this month
  const exportAllSessions = useCallback(async () => {
    setLoading('sessions')
    const { data: sessions } = await supabase
      .from('game_sessions')
      .select('user_id, game_title, score, max_score, correct_count, total_questions, score_credited, completed_at, duration_ms, profiles:user_id(full_name, org_group)')
      .eq('status', 'completed')
      .gte('completed_at', getSeasonStart())
      .order('completed_at', { ascending: false })

    const csvData: (string | number | null)[][] = [
      ['Họ tên', 'Phòng ban', 'Game', 'Điểm', 'Điểm tối đa', 'Đúng', 'Tổng câu', 'Tính điểm', 'Thời gian (ms)', 'Hoàn thành lúc'],
      ...(sessions ?? []).map(s => {
        const prof = s.profiles as { full_name: string | null; org_group: string | null } | null
        return [
          prof?.full_name ?? '—',
          prof?.org_group ?? '—',
          s.game_title,
          s.score,
          s.max_score,
          s.correct_count,
          s.total_questions,
          s.score_credited ? 'Có' : 'Không',
          s.duration_ms ?? '',
          s.completed_at ? new Date(s.completed_at).toLocaleString('vi-VN') : '',
        ]
      }),
    ]
    downloadCSV(arrayToCSV(csvData), `game_sessions_${getMonthSlug()}.csv`)
    setLoading(null)
    markDone('sessions')
  }, [markDone])

  // 4. Bracket result (from localStorage)
  const exportBracketResult = useCallback(() => {
    setLoading('bracket')
    try {
      const bracket = JSON.parse(localStorage.getItem('centosy_tournament_bracket') ?? '[]') as Array<{
        id: string; player1: string | null; player2: string | null; winner?: string; round: number
      }>

      const roundLabel = (r: number) => r === 1 ? 'Tứ kết' : r === 2 ? 'Bán kết' : 'Chung kết'

      const csvData: (string | number | null)[][] = [
        ['Vòng', 'Người chơi 1', 'Người chơi 2', 'Người thắng'],
        ...bracket.map(m => [roundLabel(m.round), m.player1 ?? 'TBD', m.player2 ?? 'TBD', m.winner ?? 'Chưa xác định']),
      ]
      downloadCSV(arrayToCSV(csvData), `bracket_result_${getMonthSlug()}.csv`)
      markDone('bracket')
    } catch (e) {
      console.error(e)
    }
    setLoading(null)
  }, [markDone])

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
           style={{ background: 'rgba(0,0,0,0.95)' }}>
        <div className="text-center px-6">
          <p style={{ fontSize: '40px' }}>🚫</p>
          <p className="text-white font-bold mt-3">Chỉ Admin</p>
          <button onClick={onClose} className="mt-4 btn-primary px-6 py-2">Đóng</button>
        </div>
      </div>
    )
  }

  const EXPORTS = [
    {
      key:    'season',
      icon:   '🏆',
      title:  'Season Leaderboard',
      desc:   'Xếp hạng cá nhân theo tổng điểm game tháng này',
      color:  '#facc15',
      action: exportSeasonLeaderboard,
      file:   `season_leaderboard_${getMonthSlug()}.csv`,
    },
    {
      key:    'dept',
      icon:   '🏢',
      title:  'Dept Ranking',
      desc:   'Xếp hạng phòng ban: tổng điểm, số người, điểm TB',
      color:  '#8b5cf6',
      action: exportDeptRanking,
      file:   `dept_ranking_${getMonthSlug()}.csv`,
    },
    {
      key:    'sessions',
      icon:   '🎮',
      title:  'All Game Sessions',
      desc:   'Toàn bộ lượt chơi trong tháng + điểm chi tiết',
      color:  '#E94E1B',
      action: exportAllSessions,
      file:   `game_sessions_${getMonthSlug()}.csv`,
    },
    {
      key:    'bracket',
      icon:   '🥊',
      title:  'Bracket Results',
      desc:   'Kết quả bracket chung kết đã xác định',
      color:  '#34d399',
      action: exportBracketResult,
      file:   `bracket_result_${getMonthSlug()}.csv`,
    },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end md:justify-center"
         style={{ background: 'rgba(0,0,0,0.93)' }}>
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
              Export Kết Quả Giải
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Admin · xuất CSV cho báo cáo</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(233,78,27,0.1)', border: '1px solid rgba(233,78,27,0.25)', fontSize: '16px' }}>
            📥
          </div>
        </div>

        {/* Export list */}
        <div className="flex-1 overflow-y-auto px-4 pb-10 pt-4">
          <p className="font-bold text-white mb-3" style={{ fontSize: '13px' }}>
            Chọn dataset để xuất CSV
          </p>

          <div className="flex flex-col gap-3">
            {EXPORTS.map(exp => {
              const isLoading = loading === exp.key
              const isDone    = done.includes(exp.key)
              return (
                <div key={exp.key}
                     className="rounded-xl px-4 py-4"
                     style={{ background: '#111', border: `1px solid ${isDone ? 'rgba(74,222,128,0.25)' : '#1f1f1f'}` }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                         style={{ background: `${exp.color}12`, border: `1px solid ${exp.color}25`, fontSize: '18px' }}>
                      {exp.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold" style={{ fontSize: '13px' }}>{exp.title}</p>
                      <p style={{ fontSize: '11px', color: '#585858', marginTop: 2 }}>{exp.desc}</p>
                      <p style={{ fontSize: '9px', color: '#383838', marginTop: 3, fontFamily: 'monospace' }}>
                        {exp.file}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => void exp.action()}
                    disabled={isLoading || isDone}
                    className="w-full py-2.5 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: '12px',
                      background: isDone
                        ? 'rgba(74,222,128,0.12)'
                        : isLoading
                          ? 'rgba(255,255,255,0.05)'
                          : `${exp.color}12`,
                      border: isDone
                        ? '1px solid rgba(74,222,128,0.3)'
                        : isLoading
                          ? '1px solid rgba(255,255,255,0.08)'
                          : `1px solid ${exp.color}30`,
                      color: isDone ? '#4ade80' : isLoading ? '#484848' : exp.color,
                    }}>
                    {isDone
                      ? '✓ Đã tải xuống'
                      : isLoading
                        ? '⏳ Đang xuất...'
                        : '📥 Tải CSV'}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="text-center mt-5" style={{ fontSize: '11px', color: '#383838' }}>
            Tất cả file dùng UTF-8 BOM · tương thích Excel
          </p>
        </div>
      </div>
    </div>
  )
}
