/**
 * ════════════════════════════════════════════════════════════════
 * CENTOSY ARENA — Kiểm tra dữ liệu bảng question_bank trên Supabase
 * ════════════════════════════════════════════════════════════════
 * Cách chạy: npm run check:questions
 */

import { loadEnv, makeSupabaseClient } from './_supabase-node.js'

// ── ANSI colors ─────────────────────────────────────────────────
const R = '\x1b[0m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const WHITE  = '\x1b[97m'
const GRAY   = '\x1b[90m'

type Status = 'PASS' | 'WARN' | 'ERROR' | 'INFO'

interface CheckLine {
  status:  Status
  label:   string
  value:   string | number
  detail?: string
}

const lines: CheckLine[] = []

function record(status: Status, label: string, value: string | number, detail?: string) {
  lines.push({ status, label, value, detail })
}

function icon(s: Status) {
  if (s === 'PASS')  return `${GREEN}✅${R}`
  if (s === 'WARN')  return `${YELLOW}⚠️ ${R}`
  if (s === 'ERROR') return `${RED}❌${R}`
  return `${CYAN}ℹ️ ${R}`
}

function statusColor(s: Status) {
  if (s === 'PASS')  return GREEN
  if (s === 'WARN')  return YELLOW
  if (s === 'ERROR') return RED
  return CYAN
}

function printLine(l: CheckLine) {
  const badge = icon(l.status)
  const col   = statusColor(l.status)
  const label = l.label.padEnd(40, ' ')
  const val   = `${col}${BOLD}${l.value}${R}`
  const det   = l.detail ? `  ${GRAY}← ${l.detail}${R}` : ''
  console.log(`  ${badge} ${WHITE}${label}${R}${val}${det}`)
}

function divider(title?: string) {
  if (title) {
    console.log(`\n${CYAN}${BOLD}  ▸ ${title}${R}`)
    console.log(`  ${DIM}${'─'.repeat(56)}${R}`)
  } else {
    console.log(`  ${DIM}${'─'.repeat(62)}${R}`)
  }
}

// ── Row type ─────────────────────────────────────────────────────
interface QBankRow {
  id:             string
  question:       string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  correct_answer: string
  explanation:    string | null
  department:     string | null
  difficulty:     string | null
  trap_type:      string | null
  source_type:    string
  is_approved:    boolean
  is_active:      boolean
  quality_score:  number | null
  created_at:     string
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════════════╗`)
  console.log(`║   CENTOSY ARENA — Question Bank Health Check    ║`)
  console.log(`╚═══════════════════════════════════════════════════╝${R}\n`)

  const env      = loadEnv()
  const supabase = makeSupabaseClient(env)
  console.log(`${GRAY}  Project: ${env['VITE_SUPABASE_URL'] ?? '?'}${R}\n`)

  // ── 0. Kiểm tra bảng tồn tại ──────────────────────────────
  divider('KẾT NỐI & BẢNG')
  const { error: pingErr } = await supabase
    .from('question_bank')
    .select('id', { count: 'exact', head: true })

  if (pingErr) {
    console.log(`  ${RED}${BOLD}❌ Bảng question_bank KHÔNG tồn tại hoặc không có quyền truy cập${R}`)
    console.log(`  ${YELLOW}   Lỗi: ${pingErr.message}${R}`)
    console.log(`  ${YELLOW}   👉 Chạy SQL migration: supabase/question_bank.sql${R}\n`)
    process.exit(1)
  }
  console.log(`  ${GREEN}✅ Kết nối Supabase OK — bảng question_bank tồn tại${R}`)

  // ── 1. Fetch ALL rows (tối đa 1000 — đủ cho 200 câu) ──────
  const { data: rows, error: fetchErr } = await supabase
    .from('question_bank')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000)

  if (fetchErr) {
    const isNoTable = fetchErr.message.includes('schema cache') ||
                      fetchErr.message.includes('does not exist') ||
                      fetchErr.code === '42P01'
    if (isNoTable) {
      console.log(`\n  ${RED}${BOLD}❌ Bảng question_bank chưa được tạo trên Supabase.${R}`)
      console.log(`  ${YELLOW}   👉 Chạy SQL migration: supabase/question_bank.sql${R}`)
      console.log(`  ${YELLOW}      (Supabase Dashboard → SQL Editor → paste & Run)${R}\n`)
    } else {
      console.log(`  ${RED}❌ Không fetch được dữ liệu: ${fetchErr.message}${R}`)
    }
    process.exit(1)
  }

  const all = (rows ?? []) as QBankRow[]

  // ── Nếu bảng rỗng ─────────────────────────────────────────
  if (all.length === 0) {
    console.log(`\n  ${RED}${BOLD}❌ Bảng question_bank TRỐNG — chưa có dữ liệu nào.${R}`)
    console.log(`  ${YELLOW}  👉 Chạy:  npm run import:questions${R}\n`)
    process.exit(1)
  }

  // ══════════════════════════════════════════════════════════
  // SECTION 1 — Tổng quan
  // ══════════════════════════════════════════════════════════
  divider('TỔNG QUAN')

  const total        = all.length
  const csvImported  = all.filter(r => r.source_type === 'csv_import').length
  const approvedCnt  = all.filter(r => r.is_approved).length
  const activeCnt    = all.filter(r => r.is_active).length

  record('INFO',  'Tổng số câu hỏi',             total)
  record(csvImported > 0 ? 'PASS' : 'WARN',
         'Câu import từ CSV (source_type=csv_import)', csvImported,
         csvImported === 0 ? 'chưa import' : undefined)
  record(approvedCnt === total ? 'PASS' : 'WARN',
         'Câu is_approved = true', approvedCnt,
         approvedCnt < total ? `${total - approvedCnt} chưa duyệt` : undefined)
  record(activeCnt === total ? 'PASS' : 'WARN',
         'Câu is_active = true', activeCnt,
         activeCnt < total ? `${total - activeCnt} bị tắt` : undefined)

  lines.forEach(printLine); lines.length = 0

  // ══════════════════════════════════════════════════════════
  // SECTION 2 — Kiểm tra chất lượng dữ liệu
  // ══════════════════════════════════════════════════════════
  divider('CHẤT LƯỢNG DỮ LIỆU')

  const missingQ     = all.filter(r => !r.question?.trim()).length
  const missingA     = all.filter(r => !r.option_a?.trim()).length
  const missingB     = all.filter(r => !r.option_b?.trim()).length
  const missingC     = all.filter(r => !r.option_c?.trim()).length
  const missingD     = all.filter(r => !r.option_d?.trim()).length
  const badAnswer    = all.filter(r => !['A','B','C','D'].includes(r.correct_answer?.toUpperCase())).length
  const noExplanation = all.filter(r => !r.explanation?.trim()).length
  const noTrapType   = all.filter(r => !r.trap_type?.trim()).length

  function passWarn(count: number, warnMsg: string): Status {
    return count === 0 ? 'PASS' : 'WARN'
  }
  function errorIfAny(count: number): Status {
    return count === 0 ? 'PASS' : 'ERROR'
  }

  record(errorIfAny(missingQ), 'Câu thiếu question',              missingQ,
         missingQ > 0 ? '❌ nghiêm trọng — cần fix' : undefined)
  record(errorIfAny(missingA), 'Câu thiếu option_a',              missingA,
         missingA > 0 ? '❌ nghiêm trọng' : undefined)
  record(errorIfAny(missingB), 'Câu thiếu option_b',              missingB,
         missingB > 0 ? '❌ nghiêm trọng' : undefined)
  record(errorIfAny(missingC), 'Câu thiếu option_c',              missingC,
         missingC > 0 ? '❌ nghiêm trọng' : undefined)
  record(errorIfAny(missingD), 'Câu thiếu option_d',              missingD,
         missingD > 0 ? '❌ nghiêm trọng' : undefined)
  record(errorIfAny(badAnswer),'Câu correct_answer không A/B/C/D', badAnswer,
         badAnswer > 0 ? '❌ nghiêm trọng — script validate đã bỏ qua dòng này' : undefined)
  record(passWarn(noExplanation,''),
         'Câu thiếu explanation', noExplanation,
         noExplanation > 0 ? 'không bắt buộc nhưng nên có' : undefined)
  record(passWarn(noTrapType,''),
         'Câu thiếu trap_type', noTrapType,
         noTrapType > 0 ? 'metadata tùy chọn' : undefined)

  lines.forEach(printLine); lines.length = 0

  // ══════════════════════════════════════════════════════════
  // SECTION 3 — Thống kê theo Department
  // ══════════════════════════════════════════════════════════
  divider('THỐNG KÊ THEO PHÒNG BAN (department)')

  const deptMap: Record<string, number> = {}
  for (const r of all) {
    const k = r.department?.trim() || '(trống)'
    deptMap[k] = (deptMap[k] ?? 0) + 1
  }
  const deptEntries = Object.entries(deptMap).sort((a, b) => b[1] - a[1])
  for (const [dept, cnt] of deptEntries) {
    const pct  = ((cnt / total) * 100).toFixed(1)
    const bar  = '█'.repeat(Math.round(cnt / total * 20))
    const status: Status = dept === '(trống)' ? 'WARN' : 'INFO'
    record(status, `  ${dept}`, `${cnt} câu (${pct}%)`, bar)
  }
  lines.forEach(printLine); lines.length = 0

  // ══════════════════════════════════════════════════════════
  // SECTION 4 — Thống kê theo Difficulty
  // ══════════════════════════════════════════════════════════
  divider('THỐNG KÊ THEO ĐỘ KHÓ (difficulty)')

  const diffMap: Record<string, number> = {}
  for (const r of all) {
    const k = r.difficulty?.trim() || '(trống)'
    diffMap[k] = (diffMap[k] ?? 0) + 1
  }
  for (const [diff, cnt] of Object.entries(diffMap).sort((a, b) => b[1] - a[1])) {
    const pct  = ((cnt / total) * 100).toFixed(1)
    const status: Status = diff === '(trống)' ? 'WARN' : 'INFO'
    record(status, `  ${diff}`, `${cnt} câu (${pct}%)`)
  }
  lines.forEach(printLine); lines.length = 0

  // ══════════════════════════════════════════════════════════
  // SECTION 5 — Top 10 câu mới nhất
  // ══════════════════════════════════════════════════════════
  divider('TOP 10 CÂU MỚI NHẤT')

  const top10 = all.slice(0, 10)
  top10.forEach((r, i) => {
    const q   = r.question.length > 60 ? r.question.slice(0, 60) + '…' : r.question
    const ts  = new Date(r.created_at).toLocaleString('vi-VN', { hour12: false })
    const ans = r.correct_answer?.toUpperCase() ?? '?'
    console.log(
      `  ${GRAY}${String(i + 1).padStart(2, ' ')}.${R} ${WHITE}${q}${R}` +
      `\n      ${GRAY}→ Đáp án: ${GREEN}${ans}${R}  ${GRAY}| ${ts}${R}`
    )
  })

  // ══════════════════════════════════════════════════════════
  // SECTION 6 — Tổng kết & kết luận
  // ══════════════════════════════════════════════════════════
  const criticalErrors = [missingQ, missingA, missingB, missingC, missingD, badAnswer]
    .reduce((s, n) => s + n, 0)
  const warnings = [noExplanation, noTrapType].reduce((s, n) => s + n, 0)

  console.log(`\n${CYAN}${BOLD}  ╔═══════════════════════════════════════════════════╗${R}`)
  console.log(`${CYAN}${BOLD}  ║               KẾT LUẬN TỔNG QUÁT                ║${R}`)
  console.log(`${CYAN}${BOLD}  ╚═══════════════════════════════════════════════════╝${R}`)

  if (criticalErrors > 0) {
    console.log(`\n  ${RED}${BOLD}❌ FAIL — Có ${criticalErrors} lỗi nghiêm trọng cần xử lý trước.${R}`)
    console.log(`  ${YELLOW}   Kiểm tra lại file CSV và chạy lại: npm run import:questions${R}`)
  } else if (warnings > 0) {
    console.log(`\n  ${YELLOW}${BOLD}⚠️  WARNING — Dữ liệu cơ bản OK nhưng có ${warnings} trường tùy chọn còn trống.${R}`)
    console.log(`  ${GRAY}   (explanation, trap_type) — không ảnh hưởng chức năng game.${R}`)
  } else {
    console.log(`\n  ${GREEN}${BOLD}✅ PASS — Toàn bộ ${total} câu hỏi đều hợp lệ, sẵn sàng dùng.${R}`)
  }

  console.log(`\n  ${DIM}Tổng: ${total}  |  CSV: ${csvImported}  |  Active: ${activeCnt}  |  Approved: ${approvedCnt}${R}`)
  console.log(`  ${DIM}Lỗi nghiêm trọng: ${criticalErrors}  |  Cảnh báo: ${warnings}${R}\n`)
}

main().catch(err => {
  console.error(`\n${RED}${BOLD}❌ Lỗi không xử lý được:${R}`, err)
  process.exit(1)
})
