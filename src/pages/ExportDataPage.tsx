import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessAdminPanel } from '../lib/permissions'

interface Props {
  onClose: () => void
}

type ExportStatus = 'idle' | 'loading' | 'done' | 'error'

interface ExportItem {
  key:         string
  label:       string
  icon:        string
  description: string
}

const EXPORTS: ExportItem[] = [
  { key: 'members',  label: 'Danh sách thành viên',  icon: '👥', description: 'Họ tên, nhóm, điểm số, vai trò' },
  { key: 'missions', label: 'Nhiệm vụ & Nộp bài',    icon: '✅', description: 'Tất cả lượt nộp nhiệm vụ' },
  { key: 'games',    label: 'Kết quả Mini Game',      icon: '🎮', description: 'Lịch sử chơi game và điểm' },
  { key: 'checkins', label: 'Lịch sử Check-in',       icon: '📅', description: 'Check-in hằng ngày' },
]

function arrayToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map(r =>
      headers.map(h => {
        const v = String(r[h] ?? '')
        return v.includes(',') || v.includes('"') || v.includes('\n')
          ? `"${v.replace(/"/g, '""')}"`
          : v
      }).join(',')
    ),
  ]
  return lines.join('\n')
}

function downloadCSV(csv: string, filename: string) {
  const bom = '﻿'  // UTF-8 BOM for Excel Vietnamese support
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN')
}

export default function ExportDataPage({ onClose }: Props) {
  const { currentUser } = useAuth()
  const canView = canAccessAdminPanel(currentUser?.role)

  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({})
  const [rowCounts, setRowCounts] = useState<Record<string, number>>({})

  function setStatus(key: string, s: ExportStatus) {
    setStatuses(prev => ({ ...prev, [key]: s }))
  }

  async function handleExport(key: string) {
    setStatus(key, 'loading')
    try {
      let csv = ''
      let filename = ''
      let count = 0

      if (key === 'members') {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, role, org_group, office_department, score, is_active, created_at')
          .order('score', { ascending: false })
        const rows = (data ?? []).map(r => ({
          'Họ tên':           r.full_name ?? '',
          'Email':            r.email ?? '',
          'Vai trò':          r.role ?? '',
          'Nhóm':             r.org_group ?? '',
          'Phòng ban':        r.office_department ?? '',
          'Điểm':             r.score ?? 0,
          'Đang hoạt động':   r.is_active ? 'Có' : 'Không',
          'Ngày tham gia':    r.created_at ? formatDate(r.created_at) : '',
        }))
        csv = arrayToCSV(rows); count = rows.length
        filename = `centosy_members_${Date.now()}.csv`

      } else if (key === 'missions') {
        const { data } = await supabase
          .from('mission_submissions')
          .select('title, status, created_at, profiles:user_id(full_name)')
          .order('created_at', { ascending: false })
        const rows = (data ?? []).map(r => ({
          'Tên nhiệm vụ': r.title ?? '',
          'Người nộp':    (r.profiles as unknown as { full_name: string | null } | null)?.full_name ?? '',
          'Trạng thái':   r.status ?? '',
          'Thời gian':    r.created_at ? formatDate(r.created_at) : '',
        }))
        csv = arrayToCSV(rows); count = rows.length
        filename = `centosy_missions_${Date.now()}.csv`

      } else if (key === 'games') {
        const { data } = await supabase
          .from('game_results')
          .select('game_id, score, created_at, profiles:user_id(full_name)')
          .order('created_at', { ascending: false })
        const rows = (data ?? []).map(r => ({
          'Game ID':   r.game_id ?? '',
          'Người chơi': (r.profiles as unknown as { full_name: string | null } | null)?.full_name ?? '',
          'Điểm':      r.score ?? 0,
          'Thời gian': r.created_at ? formatDate(r.created_at) : '',
        }))
        csv = arrayToCSV(rows); count = rows.length
        filename = `centosy_games_${Date.now()}.csv`

      } else if (key === 'checkins') {
        const { data } = await supabase
          .from('daily_checkins')
          .select('checkin_date, streak, points_earned, created_at, profiles:user_id(full_name)')
          .order('created_at', { ascending: false })
        const rows = (data ?? []).map(r => ({
          'Người dùng':   (r.profiles as unknown as { full_name: string | null } | null)?.full_name ?? '',
          'Ngày check-in': r.checkin_date ?? '',
          'Streak':        r.streak ?? 0,
          'Điểm nhận':     r.points_earned ?? 0,
          'Thời gian':     r.created_at ? formatDate(r.created_at) : '',
        }))
        csv = arrayToCSV(rows); count = rows.length
        filename = `centosy_checkins_${Date.now()}.csv`
      }

      if (csv) downloadCSV(csv, filename)
      setRowCounts(prev => ({ ...prev, [key]: count }))
      setStatus(key, 'done')
      setTimeout(() => setStatus(key, 'idle'), 3000)
    } catch {
      setStatus(key, 'error')
      setTimeout(() => setStatus(key, 'idle'), 3000)
    }
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
              Export dữ liệu
            </p>
            <p style={{ fontSize: '11px', color: '#585858' }}>Xuất CSV · Google Sheet Sync</p>
          </div>
          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', fontSize: '16px' }}>
            📊
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 pb-10">

          {!canView ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <span style={{ fontSize: '40px' }}>🔒</span>
              <p className="font-bold text-white" style={{ fontSize: '15px' }}>Không có quyền truy cập</p>
            </div>
          ) : (
            <>
              <p className="mt-5 mb-4" style={{ fontSize: '12px', color: '#585858', lineHeight: 1.6 }}>
                Tải dữ liệu dưới dạng file CSV để import vào Google Sheet hoặc Excel.
                File có BOM UTF-8 hỗ trợ tiếng Việt.
              </p>

              <div className="flex flex-col gap-3">
                {EXPORTS.map(ex => {
                  const status = statuses[ex.key] ?? 'idle'
                  const count  = rowCounts[ex.key]

                  return (
                    <div key={ex.key}
                         className="rounded-2xl px-4 py-4"
                         style={{ background: '#111', border: '1px solid #1f1f1f' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                             style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)', fontSize: '18px' }}>
                          {ex.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold" style={{ fontSize: '13px' }}>{ex.label}</p>
                          <p style={{ fontSize: '10px', color: '#585858' }}>{ex.description}</p>
                        </div>
                        {count !== undefined && (
                          <span className="shrink-0 text-right" style={{ fontSize: '10px', color: '#585858' }}>
                            {count} dòng
                          </span>
                        )}
                      </div>

                      <button
                        disabled={status === 'loading'}
                        onClick={() => void handleExport(ex.key)}
                        className="w-full py-2.5 rounded-xl font-bold transition-all"
                        style={{
                          fontSize: '12px',
                          background: status === 'done'    ? 'rgba(52,211,153,0.12)'
                                    : status === 'error'   ? 'rgba(248,113,113,0.12)'
                                    : status === 'loading' ? 'rgba(96,165,250,0.08)'
                                    : 'rgba(233,78,27,0.1)',
                          border:     status === 'done'    ? '1px solid rgba(52,211,153,0.3)'
                                    : status === 'error'   ? '1px solid rgba(248,113,113,0.3)'
                                    : status === 'loading' ? '1px solid rgba(96,165,250,0.2)'
                                    : '1px solid rgba(233,78,27,0.3)',
                          color:      status === 'done'    ? '#34d399'
                                    : status === 'error'   ? '#f87171'
                                    : status === 'loading' ? '#60a5fa'
                                    : '#E94E1B',
                          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        }}>
                        {status === 'loading' ? '⏳ Đang tải...'
                         : status === 'done'   ? '✓ Đã tải xuống'
                         : status === 'error'  ? '✗ Lỗi — thử lại'
                         : '⬇ Tải CSV'}
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Google Sheet hint */}
              <div className="mt-5 rounded-2xl px-4 py-4"
                   style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
                <p className="font-bold mb-1.5" style={{ fontSize: '12px', color: '#60a5fa' }}>
                  📌 Hướng dẫn Google Sheet
                </p>
                <ol className="list-decimal list-inside" style={{ fontSize: '11px', color: '#686868', lineHeight: 1.8 }}>
                  <li>Tải file CSV xuống thiết bị</li>
                  <li>Mở Google Sheet → File → Import</li>
                  <li>Chọn "Upload" và chọn file CSV</li>
                  <li>Chọn encoding UTF-8 nếu cần</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
