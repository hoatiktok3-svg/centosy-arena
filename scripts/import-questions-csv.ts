/**
 * ════════════════════════════════════════════════════════════════
 * CENTOSY ARENA — Import câu hỏi từ CSV vào Supabase question_bank
 * ════════════════════════════════════════════════════════════════
 * Cách chạy: npm run import:questions
 *
 * Yêu cầu:
 * 1. Đặt file CSV tại: data/centosy_arena_200_cau_hoi_test.csv
 * 2. Đã chạy SQL migration: supabase/question_bank.sql
 * 3. Có file .env với VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 *    (hoặc SUPABASE_SERVICE_ROLE_KEY để bypass RLS)
 */

import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import WebSocket from 'ws'

// ── Path helpers (ESM) ─────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT       = path.resolve(__dirname, '..')

// ── Load .env / .env.local manually ────────────────────────────
function loadEnv(): Record<string, string> {
  const candidates = ['.env.local', '.env']
  const vars: Record<string, string> = {}
  let found = false
  for (const name of candidates) {
    const envPath = path.join(ROOT, name)
    if (fs.existsSync(envPath)) {
      found = true
      fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
        const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
        if (m) vars[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
      })
      console.log(`📂 Loaded env: ${name}`)
    }
  }
  if (!found) {
    console.error('❌ Không tìm thấy .env hoặc .env.local')
    process.exit(1)
  }
  return vars
}

// ── Supabase client ─────────────────────────────────────────────
function makeClient(env: Record<string, string>) {
  const url = env['VITE_SUPABASE_URL']
  // Ưu tiên service role key → anon key → publishable key
  const key =
    env['SUPABASE_SERVICE_ROLE_KEY'] ||
    env['VITE_SUPABASE_ANON_KEY']    ||
    env['VITE_SUPABASE_PUBLISHABLE_KEY']

  if (!url || !key) {
    console.error('❌ Thiếu VITE_SUPABASE_URL hoặc key trong .env/.env.local')
    console.error('   Cần một trong: SUPABASE_SERVICE_ROLE_KEY | VITE_SUPABASE_ANON_KEY | VITE_SUPABASE_PUBLISHABLE_KEY')
    process.exit(1)
  }
  if (!env['SUPABASE_SERVICE_ROLE_KEY']) {
    console.warn('⚠️  Không có SUPABASE_SERVICE_ROLE_KEY — dùng publishable/anon key')
    console.warn('   Nếu RLS chặn insert, thêm SUPABASE_SERVICE_ROLE_KEY=<service_role> vào .env.local')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as unknown as typeof WebSocket },
  })
}

// ── Types ───────────────────────────────────────────────────────
interface CsvRow {
  'ID câu hỏi':        string
  'Nhóm câu hỏi':      string
  'Phòng ban':         string
  'Độ khó':            string
  'Câu hỏi':           string
  'Phương án A':       string
  'Phương án B':       string
  'Phương án C':       string
  'Phương án D':       string
  'Đáp án đúng':       string
  'Giải thích đáp án': string
  'Điểm':              string
  'Thời gian trả lời': string
  'Tag kỹ năng':       string
  'Loại bẫy':          string
  'Độ dài A':          string
  'Độ dài B':          string
  'Độ dài C':          string
  'Độ dài D':          string
  'Đáp án đúng dài nhất?': string
  'Điểm QC':           string
}

interface QuestionRecord {
  question:       string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  correct_answer: string
  explanation:    string | null
  topic:          string | null
  department:     string | null
  difficulty:     string | null
  skill_tag:      string | null
  trap_type:      string | null
  time_limit:     number
  score:          number
  quality_score:  number
  source_type:    string
  is_approved:    boolean
  is_active:      boolean
}

interface RowError {
  row: number
  reasons: string[]
}

// ── Quality validator ────────────────────────────────────────────
function validateQuestionQuality(row: CsvRow): number {
  let score = 100
  const q = row['Câu hỏi'] || ''
  const exp = row['Giải thích đáp án'] || ''

  // Câu hỏi ngắn quá (< 15 ký tự)
  if (q.length < 15) score -= 20

  // Không có dấu hỏi hoặc không phải câu hỏi rõ ràng
  if (!q.includes('?') && !q.toLowerCase().includes('nào') &&
      !q.toLowerCase().includes('bao nhiêu') && !q.toLowerCase().includes('là gì') &&
      !q.toLowerCase().includes('tại sao') && !q.toLowerCase().includes('chọn') &&
      !q.toLowerCase().includes('điền')) {
    score -= 10
  }

  // Không có giải thích
  if (!exp || exp.trim().length < 10) score -= 25

  // Options quá ngắn (< 2 ký tự)
  const opts = [row['Phương án A'], row['Phương án B'], row['Phương án C'], row['Phương án D']]
  const shortOpts = opts.filter(o => (o || '').trim().length < 2).length
  score -= shortOpts * 10

  // Giải thích quá ngắn (< 20 ký tự) nhưng có
  if (exp.length > 0 && exp.length < 20) score -= 10

  return Math.max(0, Math.min(100, score))
}

// ── Map CSV row → DB record ──────────────────────────────────────
function mapRow(row: CsvRow): QuestionRecord {
  const timeRaw = parseInt(row['Thời gian trả lời'] || '0', 10)
  const scoreRaw = parseInt(row['Điểm'] || '0', 10)
  const qcRaw = parseInt(row['Điểm QC'] || '0', 10)

  const timeLimit = !isNaN(timeRaw) && timeRaw > 0 ? timeRaw : 20
  const scoreVal  = !isNaN(scoreRaw) && scoreRaw >= 0 ? scoreRaw : 10
  const qcScore   = (!isNaN(qcRaw) && qcRaw > 0) ? qcRaw : validateQuestionQuality(row)

  return {
    question:       row['Câu hỏi'].trim(),
    option_a:       row['Phương án A'].trim(),
    option_b:       row['Phương án B'].trim(),
    option_c:       row['Phương án C'].trim(),
    option_d:       row['Phương án D'].trim(),
    correct_answer: row['Đáp án đúng'].trim().toUpperCase(),
    explanation:    row['Giải thích đáp án']?.trim() || null,
    topic:          row['Nhóm câu hỏi']?.trim() || null,
    department:     row['Phòng ban']?.trim() || null,
    difficulty:     row['Độ khó']?.trim() || null,
    skill_tag:      row['Tag kỹ năng']?.trim() || null,
    trap_type:      row['Loại bẫy']?.trim() || null,
    time_limit:     timeLimit,
    score:          scoreVal,
    quality_score:  qcScore,
    source_type:    'csv_import',
    is_approved:    true,
    is_active:      true,
  }
}

// ── Validate một row ─────────────────────────────────────────────
function validateRow(row: CsvRow, rowNum: number): string[] {
  const errors: string[] = []

  if (!row['Câu hỏi']?.trim())      errors.push('question trống')
  if (!row['Phương án A']?.trim())  errors.push('option_a trống')
  if (!row['Phương án B']?.trim())  errors.push('option_b trống')
  if (!row['Phương án C']?.trim())  errors.push('option_c trống')
  if (!row['Phương án D']?.trim())  errors.push('option_d trống')

  const ans = row['Đáp án đúng']?.trim().toUpperCase()
  if (!ans || !['A','B','C','D'].includes(ans)) {
    errors.push(`correct_answer="${row['Đáp án đúng']}" không hợp lệ (phải là A/B/C/D)`)
  }

  const timeRaw = parseInt(row['Thời gian trả lời'] || '', 10)
  if (row['Thời gian trả lời']?.trim() && (isNaN(timeRaw) || timeRaw <= 0)) {
    errors.push(`time_limit="${row['Thời gian trả lời']}" phải là số > 0`)
  }

  const scoreRaw = parseInt(row['Điểm'] || '', 10)
  if (row['Điểm']?.trim() && (isNaN(scoreRaw) || scoreRaw < 0)) {
    errors.push(`score="${row['Điểm']}" phải là số >= 0`)
  }

  // Kiểm tra 2 phương án giống nhau
  const opts = [
    row['Phương án A']?.trim(),
    row['Phương án B']?.trim(),
    row['Phương án C']?.trim(),
    row['Phương án D']?.trim(),
  ].filter(Boolean)
  const seen = new Set<string>()
  for (const o of opts) {
    if (o && seen.has(o.toLowerCase())) {
      errors.push(`Có 2 phương án giống nhau: "${o}"`)
      break
    }
    if (o) seen.add(o.toLowerCase())
  }

  return errors
}

// ── Log helpers ──────────────────────────────────────────────────
const RESET = '\x1b[0m'
const GREEN = '\x1b[32m'
const RED   = '\x1b[31m'
const YELLOW= '\x1b[33m'
const CYAN  = '\x1b[36m'
const BOLD  = '\x1b[1m'
const DIM   = '\x1b[2m'

function log(color: string, msg: string) { console.log(`${color}${msg}${RESET}`) }

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════════╗`)
  console.log(`║   CENTOSY ARENA — CSV Question Importer      ║`)
  console.log(`╚═══════════════════════════════════════════════╝${RESET}\n`)

  // ── 1. Load env & connect ───────────────────────────────────
  const env = loadEnv()
  const supabase = makeClient(env)

  // ── 2. Verify question_bank table exists ────────────────────
  const { error: tableErr } = await supabase
    .from('question_bank')
    .select('id', { count: 'exact', head: true })
  if (tableErr) {
    console.error(`${RED}${BOLD}❌ Bảng question_bank chưa tồn tại hoặc không có quyền truy cập!`)
    console.error(`   Lỗi: ${tableErr.message}${RESET}`)
    console.error(`${YELLOW}   👉 Chạy SQL migration trước: supabase/question_bank.sql${RESET}`)
    process.exit(1)
  }
  log(GREEN, '✅ Kết nối Supabase OK — bảng question_bank tồn tại')

  // ── 3. Read CSV ─────────────────────────────────────────────
  const csvPath = path.join(ROOT, 'data', 'centosy_arena_200_cau_hoi_test.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`${RED}${BOLD}❌ Không tìm thấy file CSV!${RESET}`)
    console.error(`${YELLOW}   👉 Đặt file tại: ${csvPath}${RESET}`)
    process.exit(1)
  }
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  log(GREEN, `✅ Đọc file: ${csvPath}`)

  // ── 4. Parse CSV ────────────────────────────────────────────
  const parseResult = Papa.parse<CsvRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    encoding: 'UTF-8',
    transformHeader: (h: string) => h.trim(),
    transform: (v: string) => v.trim(),
  })

  if (parseResult.errors.length > 0) {
    log(YELLOW, `⚠️  CSV parse warnings: ${parseResult.errors.length} dòng có vấn đề`)
    parseResult.errors.slice(0, 5).forEach(e => log(DIM, `   Row ${e.row}: ${e.message}`))
  }

  const rows = parseResult.data
  log(CYAN, `📄 Tổng dòng đọc được: ${rows.length}`)

  // ── 5. Validate ─────────────────────────────────────────────
  const validRecords: QuestionRecord[] = []
  const errors: RowError[] = []

  rows.forEach((row, idx) => {
    const rowNum = idx + 2 // +2 vì dòng 1 là header
    const errs = validateRow(row, rowNum)
    if (errs.length > 0) {
      errors.push({ row: rowNum, reasons: errs })
    } else {
      validRecords.push(mapRow(row))
    }
  })

  log(GREEN, `✅ Dòng hợp lệ: ${validRecords.length}`)
  if (errors.length > 0) {
    log(YELLOW, `⚠️  Dòng lỗi: ${errors.length}`)
  }

  // ── 6. Check duplicates ─────────────────────────────────────
  log(CYAN, '\n🔍 Kiểm tra trùng lặp với dữ liệu hiện tại...')

  // Lấy tất cả câu hỏi hiện có (chỉ lấy text để so sánh)
  const { data: existing, error: fetchErr } = await supabase
    .from('question_bank')
    .select('question')
  if (fetchErr) {
    log(YELLOW, `⚠️  Không fetch được dữ liệu cũ: ${fetchErr.message}`)
    log(YELLOW, '   Bỏ qua bước check duplicate...')
  }

  const existingSet = new Set<string>(
    (existing ?? []).map(r => r.question.trim().toLowerCase())
  )
  log(DIM, `   Câu hỏi hiện có trong DB: ${existingSet.size}`)

  const uniqueRecords: QuestionRecord[] = []
  let duplicateCount = 0

  for (const rec of validRecords) {
    if (existingSet.has(rec.question.toLowerCase())) {
      duplicateCount++
    } else {
      uniqueRecords.push(rec)
    }
  }

  if (duplicateCount > 0) {
    log(YELLOW, `⚠️  Dòng trùng (bỏ qua): ${duplicateCount}`)
  }
  log(GREEN, `✅ Câu sẽ import: ${uniqueRecords.length}`)

  if (uniqueRecords.length === 0) {
    log(YELLOW, '\n⚠️  Không có câu hỏi mới để import. Kết thúc.')
    printSummary(rows.length, validRecords.length, errors, duplicateCount, 0)
    return
  }

  // ── 7. Batch insert ─────────────────────────────────────────
  const BATCH_SIZE = 100
  let imported = 0

  log(CYAN, `\n📤 Bắt đầu import (batch size = ${BATCH_SIZE})...`)

  for (let i = 0; i < uniqueRecords.length; i += BATCH_SIZE) {
    const batch = uniqueRecords.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(uniqueRecords.length / BATCH_SIZE)

    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} câu)... `)

    const { error: insertErr } = await supabase
      .from('question_bank')
      .insert(batch)

    if (insertErr) {
      console.log(`${RED}THẤT BẠI${RESET}`)
      log(RED, `   ❌ Lỗi batch ${batchNum}: ${insertErr.message}`)
      // Không dừng — tiếp tục batch sau
    } else {
      console.log(`${GREEN}OK${RESET}`)
      imported += batch.length
    }
  }

  // ── 8. Summary ─────────────────────────────────────────────
  printSummary(rows.length, validRecords.length, errors, duplicateCount, imported)
}

// ── Print final report ──────────────────────────────────────────
function printSummary(
  total: number,
  valid: number,
  errors: RowError[],
  duplicates: number,
  imported: number
) {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}                  BÁO CÁO IMPORT${RESET}`)
  console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`)
  console.log(`  📄 Tổng dòng đọc được  : ${BOLD}${total}${RESET}`)
  console.log(`  ${GREEN}✅ Dòng hợp lệ         : ${BOLD}${valid}${RESET}`)
  console.log(`  ${YELLOW}⚠️  Dòng lỗi            : ${BOLD}${errors.length}${RESET}`)
  console.log(`  ${YELLOW}🔄 Dòng trùng (bỏ qua) : ${BOLD}${duplicates}${RESET}`)
  console.log(`  ${GREEN}🚀 Câu import thành công: ${BOLD}${imported}${RESET}`)
  console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`)

  if (errors.length > 0) {
    console.log(`\n${YELLOW}${BOLD}DANH SÁCH LỖI:${RESET}`)
    errors.forEach(({ row, reasons }) => {
      console.log(`  ${RED}Dòng ${row}:${RESET}`)
      reasons.forEach(r => console.log(`    ${DIM}• ${r}${RESET}`))
    })
  }

  if (imported > 0) {
    console.log(`\n${GREEN}${BOLD}✅ Import hoàn tất!${RESET}`)
    console.log(`${DIM}   Kiểm tra: Supabase Dashboard → Table Editor → question_bank${RESET}`)
    console.log(`${DIM}   SQL:      SELECT COUNT(*) FROM public.question_bank;${RESET}\n`)
  } else if (errors.length === 0) {
    console.log(`\n${YELLOW}Không có dữ liệu mới được import.${RESET}\n`)
  } else {
    console.log(`\n${RED}${BOLD}❌ Import thất bại hoàn toàn — kiểm tra lại file CSV và bảng DB.${RESET}\n`)
  }
}

main().catch(err => {
  console.error(`\n${RED}${BOLD}❌ Lỗi không xử lý được:${RESET}`, err)
  process.exit(1)
})
