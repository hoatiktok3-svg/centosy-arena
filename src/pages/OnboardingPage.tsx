import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ── Types ─────────────────────────────────────────────────────
type OrgGroup = 'cua-hang' | 'kho' | 'van-phong' | 'all'

interface ChecklistItem {
  id: string
  day: number        // 1–7
  task: string
  detail?: string
  groups: OrgGroup[] // 'all' = tất cả, hoặc chỉ nhóm cụ thể
}

// ── Mock checklist 7 ngày ─────────────────────────────────────
// Phần này là mock data — cần team HR cập nhật nội dung thực tế
const CHECKLIST: ChecklistItem[] = [
  // Day 1 — Tất cả
  { id: 'd1-1', day: 1, task: 'Nhận thẻ nhân viên và đồng phục', groups: ['all'] },
  { id: 'd1-2', day: 1, task: 'Tạo tài khoản email công ty', groups: ['all'] },
  { id: 'd1-3', day: 1, task: 'Gặp quản lý trực tiếp và nhận bàn làm việc', groups: ['all'] },
  { id: 'd1-4', day: 1, task: 'Làm quen với các đồng nghiệp trong team', groups: ['all'] },
  { id: 'd1-5', day: 1, task: 'Đọc nội quy công ty và ký xác nhận', groups: ['all'] },

  // Day 2 — Theo nhóm
  { id: 'd2-1', day: 2, task: 'Học cách sử dụng phần mềm quản lý đơn hàng', groups: ['cua-hang', 'van-phong'] },
  { id: 'd2-2', day: 2, task: 'Học quy trình nhập/xuất kho', groups: ['kho'] },
  { id: 'd2-3', day: 2, task: 'Thực hành mở/đóng ca cửa hàng', groups: ['cua-hang'] },
  { id: 'd2-4', day: 2, task: 'Làm quen với layout kho và hệ thống mã vạch', groups: ['kho'] },
  { id: 'd2-5', day: 2, task: 'Tìm hiểu công cụ làm việc: Zalo, Google Drive, Sheets', groups: ['van-phong'] },

  // Day 3 — Tất cả
  { id: 'd3-1', day: 3, task: 'Hoàn thành bài đọc: Giới thiệu sản phẩm Centosy', detail: 'Xem trong Học viện Centosy', groups: ['all'] },
  { id: 'd3-2', day: 3, task: 'Shadow (đi kèm) đồng nghiệp giỏi trong ca làm việc', groups: ['cua-hang', 'kho'] },
  { id: 'd3-3', day: 3, task: 'Tham gia họp team tuần đầu', groups: ['van-phong'] },
  { id: 'd3-4', day: 3, task: 'Thực hành giao tiếp với khách hàng đầu tiên (có giám sát)', groups: ['cua-hang'] },

  // Day 4
  { id: 'd4-1', day: 4, task: 'Hoàn thành bài học: Quy trình tiếp nhận khách hàng', detail: 'Xem trong Học viện', groups: ['cua-hang'] },
  { id: 'd4-2', day: 4, task: 'Hoàn thành bài học: Xử lý khiếu nại', detail: 'Xem trong Học viện', groups: ['cua-hang'] },
  { id: 'd4-3', day: 4, task: 'Học quy trình kiểm đếm hàng đầu ca', groups: ['kho'] },
  { id: 'd4-4', day: 4, task: 'Học cách tạo báo cáo tồn kho cơ bản', groups: ['kho', 'van-phong'] },
  { id: 'd4-5', day: 4, task: 'Thực hành xử lý đơn hàng online đầu tiên', groups: ['van-phong', 'cua-hang'] },

  // Day 5
  { id: 'd5-1', day: 5, task: 'Hoàn thành Quiz Kiến Thức Sản Phẩm', detail: 'Vào mục Games → Quiz Kiến Thức Sản Phẩm', groups: ['all'] },
  { id: 'd5-2', day: 5, task: 'Thực hành độc lập 1 ca đầy đủ (có hỗ trợ)', groups: ['cua-hang', 'kho'] },
  { id: 'd5-3', day: 5, task: 'Nhận và xử lý nhiệm vụ đầu tiên trong hệ thống', groups: ['all'] },

  // Day 6
  { id: 'd6-1', day: 6, task: 'Hoàn thành bài kiểm tra: Giá trị cốt lõi Centosy', detail: 'Xem trong Học viện', groups: ['all'] },
  { id: 'd6-2', day: 6, task: 'Tự xử lý ca độc lập và báo cáo kết quả', groups: ['cua-hang', 'kho'] },
  { id: 'd6-3', day: 6, task: 'Đề xuất 1 cải tiến nhỏ trong quy trình làm việc', groups: ['all'] },

  // Day 7
  { id: 'd7-1', day: 7, task: 'Họp review tuần đầu với quản lý', groups: ['all'] },
  { id: 'd7-2', day: 7, task: 'Điền form đánh giá tuần đầu (trải nghiệm onboarding)', groups: ['all'] },
  { id: 'd7-3', day: 7, task: 'Nhận mục tiêu tháng đầu từ quản lý', groups: ['all'] },
  { id: 'd7-4', day: 7, task: 'Tham gia hoạt động team building lần đầu', detail: 'Tùy lịch team', groups: ['all'] },
]

const LS_KEY = 'centosy_onboarding_done'

function loadDone(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch { return new Set() }
}

function saveDone(set: Set<string>) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])) }
  catch { /* ignore */ }
}

const GROUP_LABEL: Record<string, string> = {
  'cua-hang':  'Cửa hàng',
  'kho':       'Kho',
  'van-phong': 'Văn phòng',
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  onClose: () => void
}

export default function OnboardingPage({ onClose }: Props) {
  const { currentUser }   = useAuth()
  const userGroup         = (currentUser?.org_group ?? '') as OrgGroup
  const [done, setDone]   = useState<Set<string>>(loadDone)
  const [filter, setFilter] = useState<OrgGroup | 'all'>('all')

  // Init filter to user's group if available
  useEffect(() => {
    if (userGroup && userGroup !== '') setFilter(userGroup)
    setDone(loadDone())
  }, [userGroup])

  // Filter items for current group
  const relevantItems = CHECKLIST.filter(item =>
    item.groups.includes('all') || item.groups.includes(filter)
  )

  const totalCount = relevantItems.length
  const doneCount  = relevantItems.filter(i => done.has(i.id)).length
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  function toggle(id: string) {
    const next = new Set(done)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setDone(next)
    saveDone(next)
  }

  // Group by day
  const days = [1, 2, 3, 4, 5, 6, 7]
  const itemsByDay: Record<number, ChecklistItem[]> = {}
  for (const day of days) {
    itemsByDay[day] = relevantItems.filter(i => i.day === day)
  }

  const dayDoneCount = (day: number) =>
    (itemsByDay[day] ?? []).filter(i => done.has(i.id)).length

  const groupOptions: Array<{ key: OrgGroup | 'all'; label: string }> = [
    { key: 'all',       label: 'Tất cả' },
    { key: 'cua-hang',  label: 'Cửa hàng' },
    { key: 'kho',       label: 'Kho' },
    { key: 'van-phong', label: 'Văn phòng' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-3"
           style={{ borderBottom: '1px solid #1e1e1e', background: '#0d0d0d' }}>
        <div className="flex items-center gap-3 max-w-[430px] mx-auto mb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{ background: '#1e1e1e', border: '1px solid #2c2c2c', color: '#909090', fontSize: '18px' }}>
            ×
          </button>
          <div className="flex-1">
            <p className="text-white font-black" style={{ fontSize: '17px' }}>🚀 Onboarding 7 ngày</p>
            <p style={{ fontSize: '12px', color: '#585858', marginTop: 1 }}>
              {doneCount}/{totalCount} nhiệm vụ · {pct}% hoàn thành
              {userGroup ? ` · ${GROUP_LABEL[userGroup] ?? ''}` : ''}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-1.5 rounded-full max-w-[430px] mx-auto mb-3" style={{ background: '#1e1e1e' }}>
          <div className="h-full rounded-full transition-all duration-700"
               style={{
                 width: `${pct}%`,
                 background: pct === 100
                   ? '#4ade80'
                   : 'linear-gradient(90deg,#E94E1B,#facc15)',
               }} />
        </div>

        {/* Group filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar max-w-[430px] mx-auto">
          {groupOptions.map(g => (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className={filter === g.key ? 'filter-pill-active' : 'filter-pill-inactive'}
              style={{ whiteSpace: 'nowrap' }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-[430px] mx-auto w-full">
        {days.map(day => {
          const items = itemsByDay[day]
          if (!items || items.length === 0) return null
          const dayDone = dayDoneCount(day)
          const dayTotal = items.length
          const allDayDone = dayDone === dayTotal

          return (
            <div key={day} className="mb-4">
              {/* Day header */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0"
                     style={{
                       fontSize: '12px',
                       background: allDayDone ? 'rgba(74,222,128,0.15)' : '#1e1e1e',
                       color: allDayDone ? '#4ade80' : '#585858',
                       border: `1px solid ${allDayDone ? 'rgba(74,222,128,0.4)' : '#2c2c2c'}`,
                     }}>
                  {allDayDone ? '✓' : day}
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ fontSize: '13px', color: allDayDone ? '#4ade80' : '#d0d0d0' }}>
                    Ngày {day}
                  </p>
                  <p style={{ fontSize: '11px', color: '#484848' }}>
                    {dayDone}/{dayTotal} hoàn thành
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2 ml-5">
                {items.map(item => {
                  const isDone = done.has(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      className="w-full text-left rounded-xl px-3.5 py-3 flex items-start gap-3 transition-all active:scale-[0.98]"
                      style={{
                        background: isDone ? 'rgba(74,222,128,0.07)' : '#181818',
                        border: `1px solid ${isDone ? 'rgba(74,222,128,0.3)' : '#2c2c2c'}`,
                      }}>
                      {/* Checkbox */}
                      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
                           style={{
                             background: isDone ? '#4ade80' : 'transparent',
                             border: `2px solid ${isDone ? '#4ade80' : '#404040'}`,
                           }}>
                        {isDone && (
                          <span style={{ fontSize: '11px', color: '#111', fontWeight: 900 }}>✓</span>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p style={{
                          fontSize: '13px',
                          color: isDone ? '#4ade80' : '#d0d0d0',
                          textDecoration: isDone ? 'line-through' : 'none',
                          lineHeight: 1.45,
                          opacity: isDone ? 0.75 : 1,
                        }}>
                          {item.task}
                        </p>
                        {item.detail && !isDone && (
                          <p style={{ fontSize: '11px', color: '#484848', marginTop: 2 }}>
                            💡 {item.detail}
                          </p>
                        )}
                        {/* Group tags (visible khi filter = all) */}
                        {filter === 'all' && !item.groups.includes('all') && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {item.groups.map(g => (
                              <span key={g} style={{
                                fontSize: '10px',
                                color: '#585858',
                                background: '#1e1e1e',
                                border: '1px solid #2c2c2c',
                                borderRadius: '999px',
                                padding: '0 6px',
                              }}>
                                {GROUP_LABEL[g] ?? g}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Completed banner */}
        {pct === 100 && (
          <div className="mt-3 rounded-2xl px-4 py-5 text-center"
               style={{ background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.25)' }}>
            <p style={{ fontSize: '28px', marginBottom: 8 }}>🎉</p>
            <p className="font-black" style={{ fontSize: '16px', color: '#4ade80' }}>
              Hoàn thành 7 ngày onboarding!
            </p>
            <p style={{ fontSize: '12px', color: '#585858', marginTop: 4 }}>
              Chào mừng bạn chính thức là thành viên Centosy
            </p>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
