/**
 * ════════════════════════════════════════════════════════════════
 * CENTOSY ARENA — Import câu hỏi từ CSV vào Supabase question_bank
 * ════════════════════════════════════════════════════════════════
 * Cách chạy: npm run import:questions
 *
 * Yêu cầu:
 * 1. Đặt file CSV tại: data/centosy_arena_200_cau_hoi_test.csv
 * 2. Đã chạy SQL migration: supabase/question_bank.sql
 * 3. File .env.local có VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
 *    (hoặc SUPABASE_SERVICE_ROLE_KEY để bypass RLS)
 */

import Papa from 'papaparse'
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv, makeSupabaseClient, ROOT } from './_supabase-node.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
void __filename; void __dirname

// ── ANSI colors ─────────────────────────────────────────────────
const RESET  = '\x1b[0m'
const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const BOLD   = '\x1b[1m'
const DIM    = '\x1b[2m'
function log(color: string, msg: string) { console.log(`${color}${msg}${RESET}`) }

// ════════════════════════════════════════════════════════════════
// FIX #1 — normalizeAnswer: xử lý mọi biến thể đáp án từ CSV
//   "A" / "a" / " A " / "A." / "(A)" / "Đáp án A" / "Chọn A"
// ════════════════════════════════════════════════════════════════
function normalizeAnswer(raw: string): string {
  const s = (raw ?? '').trim()
  // Đúng format rồi: một chữ A/B/C/D
  if (/^[aAbBcCdD]$/.test(s)) return s.toUpperCase()
  // "A." "(A)" "[A]" "A:"
  const m1 = s.match(/^[(\[]?([aAbBcCdD])[)\].:]?\s*$/)
  if (m1) return m1[1].toUpperCase()
  // "Đáp án A" / "Chọn A" / "A - Đúng" — lấy chữ cái đầu tiên khớp
  const m2 = s.match(/\b([aAbBcCdD])\b/)
  if (m2) return m2[1].toUpperCase()
  // fallback: trả về uppercase nguyên (sẽ fail validate)
  return s.toUpperCase()
}

// ════════════════════════════════════════════════════════════════
// FIX #2 — parsePositiveInt: xử lý số kiểu Việt (dấu phẩy, chữ)
//   "20" "20.0" "20,0" "20 giây" "N/A" "" → number | null
// ════════════════════════════════════════════════════════════════
function parsePositiveInt(raw: string | undefined, defaultVal: number): number {
  const cleaned = (raw ?? '').trim()
    .replace(/,/g, '.')       // 20,0 → 20.0
    .replace(/[^\d.]/g, '')   // "20 giây" → "20", "N/A" → ""
  const n = parseFloat(cleaned)
  return (!isNaN(n) && n > 0) ? Math.round(n) : defaultVal
}
function parseNonNegInt(raw: string | undefined, defaultVal: number): number {
  const cleaned = (raw ?? '').trim().replace(/,/g, '.').replace(/[^\d.]/g, '')
  const n = parseFloat(cleaned)
  return (!isNaN(n) && n >= 0) ? Math.round(n) : defaultVal
}

// ── Types ───────────────────────────────────────────────────────
interface CsvRow {
  'ID câu hỏi':            string
  'Nhóm câu hỏi':          string
  'Phòng ban':             string
  'Độ khó':                string
  'Câu hỏi':               string
  'Phương án A':           string
  'Phương án B':           string
  'Phương án C':           string
  'Phương án D':           string
  'Đáp án đúng':           string
  'Giải thích đáp án':     string
  'Điểm':                  string
  'Thời gian trả lời':     string
  'Tag kỹ năng':           string
  'Loại bẫy':              string
  'Độ dài A':              string
  'Độ dài B':              string
  'Độ dài C':              string
  'Độ dài D':              string
  'Đáp án đúng dài nhất?': string
  'Điểm QC':               string
  [key: string]:           string  // allow extra columns
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

interface RowError { row: number; reasons: string[] }

// ── Quality score ────────────────────────────────────────────────
function validateQuestionQuality(row: CsvRow): number {
  let sc = 100
  const q   = row['Câu hỏi'] || ''
  const exp = row['Giải thích đáp án'] || ''
  if (q.length < 15) sc -= 20
  if (!q.includes('?') && !/(nào|bao nhiêu|là gì|tại sao|chọn|điền)/i.test(q)) sc -= 10
  if (!exp || exp.trim().length < 10) sc -= 25
  const opts = [row['Phương án A'],row['Phương án B'],row['Phương án C'],row['Phương án D']]
  sc -= opts.filter(o => (o||'').trim().length < 2).length * 10
  if (exp.length > 0 && exp.length < 20) sc -= 10
  return Math.max(0, Math.min(100, sc))
}

// ════════════════════════════════════════════════════════════════
// FIX #3 — mapRow: dùng normalizeAnswer + parsePositiveInt/NonNeg
// ════════════════════════════════════════════════════════════════
function mapRow(row: CsvRow): QuestionRecord {
  const timeLimit    = parsePositiveInt(row['Thời gian trả lời'], 20)
  const scoreVal     = parseNonNegInt(row['Điểm'], 10)
  const qcRaw        = parseNonNegInt(row['Điểm QC'], 0)
  const qcScore      = qcRaw > 0 ? qcRaw : validateQuestionQuality(row)

  return {
    question:       (row['Câu hỏi']           ?? '').trim(),
    option_a:       (row['Phương án A']        ?? '').trim(),
    option_b:       (row['Phương án B']        ?? '').trim(),
    option_c:       (row['Phương án C']        ?? '').trim(),
    option_d:       (row['Phương án D']        ?? '').trim(),
    correct_answer: normalizeAnswer(row['Đáp án đúng']),
    explanation:    (row['Giải thích đáp án']?.trim()) || null,
    topic:          (row['Nhóm câu hỏi']?.trim())      || null,
    department:     (row['Phòng ban']?.trim())          || null,
    difficulty:     (row['Độ khó']?.trim())             || null,
    skill_tag:      (row['Tag kỹ năng']?.trim())        || null,
    trap_type:      (row['Loại bẫy']?.trim())           || null,
    time_limit:     timeLimit,
    score:          scoreVal,
    quality_score:  qcScore,
    source_type:    'csv_import',
    is_approved:    true,
    is_active:      true,
  }
}

// ════════════════════════════════════════════════════════════════
// FIX #4 — validateRow: dùng normalizeAnswer trước khi validate
// ════════════════════════════════════════════════════════════════
function validateRow(row: CsvRow): string[] {
  const errors: string[] = []

  if (!(row['Câu hỏi']       ?? '').trim()) errors.push('question trống')
  if (!(row['Phương án A']   ?? '').trim()) errors.push('option_a trống')
  if (!(row['Phương án B']   ?? '').trim()) errors.push('option_b trống')
  if (!(row['Phương án C']   ?? '').trim()) errors.push('option_c trống')
  if (!(row['Phương án D']   ?? '').trim()) errors.push('option_d trống')

  const normAns = normalizeAnswer(row['Đáp án đúng'] ?? '')
  if (!['A','B','C','D'].includes(normAns)) {
    errors.push(`correct_answer="${row['Đáp án đúng']}" không hợp lệ sau normalize → "${normAns}"`)
  }

  // 2 option giống nhau
  const opts = [
    (row['Phương án A']??'').trim(),
    (row['Phương án B']??'').trim(),
    (row['Phương án C']??'').trim(),
    (row['Phương án D']??'').trim(),
  ].filter(Boolean)
  const seen = new Set<string>()
  for (const o of opts) {
    if (seen.has(o.toLowerCase())) { errors.push(`Có 2 phương án giống nhau: "${o}"`); break }
    seen.add(o.toLowerCase())
  }

  return errors
}

// ════════════════════════════════════════════════════════════════
// FIX #5 — stripBOM: xử lý BOM từ file Excel xuất ra UTF-8
// ════════════════════════════════════════════════════════════════
function stripBOM(content: string): string {
  return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content
}

// ════════════════════════════════════════════════════════════════
// FIX #6 — insertWithFallback: batch 25 + per-row retry khi lỗi
// ════════════════════════════════════════════════════════════════
async function insertWithFallback(
  supabase: ReturnType<typeof makeSupabaseClient>,
  records: QuestionRecord[],
  batchSize = 25,
): Promise<{ imported: number; batchErrors: Array<{ idx: number; err: string }> }> {
  let imported = 0
  const batchErrors: Array<{ idx: number; err: string }> = []
  const totalBatches = Math.ceil(records.length / batchSize)

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.length} câu)... `)

    const { error: bErr } = await supabase.from('question_bank').insert(batch)

    if (!bErr) {
      console.log(`${GREEN}OK${RESET}`)
      imported += batch.length
      continue
    }

    // Batch failed → thử từng row riêng lẻ
    console.log(`${YELLOW}PARTIAL — thử từng câu...${RESET}`)
    for (let j = 0; j < batch.length; j++) {
      const { error: rErr } = await supabase.from('question_bank').insert([batch[j]])
      if (rErr) {
        batchErrors.push({ idx: i + j + 2, err: rErr.message })
      } else {
        imported++
      }
    }
  }
  return { imported, batchErrors }
}

// ════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════
async function main() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════════╗`)
  console.log(`║   CENTOSY ARENA — CSV Question Importer      ║`)
  console.log(`╚═══════════════════════════════════════════════╝${RESET}\n`)

  // ── 1. Load env & connect ───────────────────────────────────
  const env      = loadEnv()
  const supabase = makeSupabaseClient(env)

  // ════════════════════════════════════════════════════════════
  // FIX #7 — table check dùng select limit 1 thay vì head:true
  //   head:true trả về null error ngay cả khi bảng không tồn tại
  // ════════════════════════════════════════════════════════════
  const { error: tableErr } = await supabase
    .from('question_bank')
    .select('id')
    .limit(1)

  if (tableErr) {
    const isMissing = tableErr.message.includes('schema cache') ||
                      tableErr.message.includes('does not exist') ||
                      tableErr.code === '42P01'
    console.error(`${RED}${BOLD}❌ Bảng question_bank ${isMissing ? 'chưa tồn tại' : 'lỗi truy cập'}!${RESET}`)
    console.error(`   ${DIM}${tableErr.message}${RESET}`)
    if (isMissing) console.error(`${YELLOW}   👉 Chạy SQL migration: supabase/question_bank.sql${RESET}`)
    else           console.error(`${YELLOW}   👉 Kiểm tra RLS / API key${RESET}`)
    process.exit(1)
  }
  log(GREEN, '✅ Kết nối Supabase OK — bảng question_bank tồn tại')

  // ── 2. Read CSV ─────────────────────────────────────────────
  const csvPath = path.join(ROOT, 'data', 'centosy_arena_200_cau_hoi_test.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`${RED}${BOLD}❌ Không tìm thấy file CSV!${RESET}`)
    console.error(`${YELLOW}   👉 Đặt file tại: ${csvPath}${RESET}`)
    process.exit(1)
  }

  // FIX #5: Strip BOM (Excel UTF-8 files thường có BOM)
  const rawContent = fs.readFileSync(csvPath, 'utf-8')
  const csvContent = stripBOM(rawContent)
  const hadBOM = rawContent !== csvContent
  if (hadBOM) log(YELLOW, '⚠️  Phát hiện BOM (Excel UTF-8) — đã tự động xử lý')
  log(GREEN, `✅ Đọc file: ${csvPath} (${Math.round(rawContent.length / 1024)}KB)`)

  // ── 3. Parse CSV ────────────────────────────────────────────
  const parseResult = Papa.parse<CsvRow>(csvContent, {
    header:         true,
    skipEmptyLines: 'greedy',   // bỏ qua dòng rỗng hoàn toàn
    encoding:       'UTF-8',
    transformHeader: (h: string) => h.replace(/^﻿/, '').trim(),
    transform:       (v: string) => v.trim(),
  })

  // Log headers để debug mapping
  const headers = parseResult.meta.fields ?? []
  log(CYAN, `🔍 Cột CSV phát hiện: ${headers.length} cột`)
  const REQUIRED_HEADERS = ['Câu hỏi','Phương án A','Phương án B','Phương án C','Phương án D','Đáp án đúng']
  const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    log(RED, `❌ Thiếu cột bắt buộc: ${missingHeaders.join(', ')}`)
    log(YELLOW, `   Cột hiện có: ${headers.slice(0,8).join(' | ')}${headers.length > 8 ? '…' : ''}`)
    process.exit(1)
  }

  if (parseResult.errors.length > 0) {
    log(YELLOW, `⚠️  CSV parse warnings: ${parseResult.errors.length}`)
    parseResult.errors.slice(0, 3).forEach(e => log(DIM, `   Row ${e.row ?? '?'}: ${e.message}`))
  }

  const rows = parseResult.data
  log(CYAN, `📄 Tổng dòng đọc được: ${rows.length}`)

  // Log sample đáp án để debug normalize
  const sampleAnswers = rows.slice(0, 5).map(r => `"${r['Đáp án đúng']}"→"${normalizeAnswer(r['Đáp án đúng'])}"`)
  log(DIM, `   Mẫu normalize đáp án: ${sampleAnswers.join(' | ')}`)

  // ── 4. Validate ─────────────────────────────────────────────
  const validRecords: QuestionRecord[] = []
  const rowErrors: RowError[] = []

  rows.forEach((row, idx) => {
    const rowNum = idx + 2
    // Bỏ qua dòng hoàn toàn trống
    if (!(row['Câu hỏi']??'').trim() && !(row['Phương án A']??'').trim()) return
    const errs = validateRow(row)
    if (errs.length > 0) {
      rowErrors.push({ row: rowNum, reasons: errs })
    } else {
      validRecords.push(mapRow(row))
    }
  })

  log(GREEN, `✅ Dòng hợp lệ: ${validRecords.length}`)
  if (rowErrors.length > 0) log(YELLOW, `⚠️  Dòng lỗi: ${rowErrors.length}`)

  // ── 5. Check duplicates ─────────────────────────────────────
  log(CYAN, '\n🔍 Kiểm tra trùng lặp với dữ liệu hiện tại...')
  const { data: existing, error: fetchErr } = await supabase
    .from('question_bank').select('question').limit(2000)

  if (fetchErr) {
    log(YELLOW, `⚠️  Không fetch được dữ liệu cũ: ${fetchErr.message}`)
    log(YELLOW, '   Bỏ qua check duplicate, tiếp tục import...')
  }

  const existingSet = new Set<string>(
    (existing ?? []).map((r: { question: string }) => r.question.trim().toLowerCase())
  )
  log(DIM, `   Câu hỏi hiện có trong DB: ${existingSet.size}`)

  const uniqueRecords = validRecords.filter(rec => !existingSet.has(rec.question.toLowerCase()))
  const duplicateCount = validRecords.length - uniqueRecords.length
  if (duplicateCount > 0) log(YELLOW, `⚠️  Dòng trùng (bỏ qua): ${duplicateCount}`)
  log(GREEN, `✅ Câu sẽ import: ${uniqueRecords.length}`)

  if (uniqueRecords.length === 0) {
    log(YELLOW, '\n⚠️  Không có câu hỏi mới. Kết thúc.')
    printSummary(rows.length, validRecords.length, rowErrors, duplicateCount, 0, [])
    return
  }

  // ── 6. Batch insert (FIX #6 — 25/batch + per-row fallback) ──
  log(CYAN, '\n📤 Bắt đầu import (batch = 25, per-row fallback nếu lỗi)...')
  const { imported, batchErrors } = await insertWithFallback(supabase, uniqueRecords, 25)

  // ── 7. Summary ─────────────────────────────────────────────
  printSummary(rows.length, validRecords.length, rowErrors, duplicateCount, imported, batchErrors)
}

// ── Print report ─────────────────────────────────────────────────
function printSummary(
  total:       number,
  valid:       number,
  rowErrors:   RowError[],
  duplicates:  number,
  imported:    number,
  batchErrors: Array<{ idx: number; err: string }>,
) {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════${RESET}`)
  console.log(`${BOLD}                  BÁO CÁO IMPORT${RESET}`)
  console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`)
  console.log(`  📄 Tổng dòng đọc được  : ${BOLD}${total}${RESET}`)
  console.log(`  ${GREEN}✅ Dòng hợp lệ         : ${BOLD}${valid}${RESET}`)
  console.log(`  ${YELLOW}⚠️  Dòng lỗi validate  : ${BOLD}${rowErrors.length}${RESET}`)
  console.log(`  ${YELLOW}🔄 Dòng trùng (bỏ qua): ${BOLD}${duplicates}${RESET}`)
  console.log(`  ${batchErrors.length>0?RED:GREEN}❌ Lỗi insert          : ${BOLD}${batchErrors.length}${RESET}`)
  console.log(`  ${GREEN}🚀 Câu import thành công: ${BOLD}${imported}${RESET}`)
  console.log(`${CYAN}═══════════════════════════════════════════════${RESET}`)

  if (rowErrors.length > 0) {
    console.log(`\n${YELLOW}${BOLD}LỖI VALIDATE (theo số dòng CSV):${RESET}`)
    rowErrors.slice(0, 20).forEach(({ row, reasons }) => {
      console.log(`  ${RED}Dòng ${row}:${RESET}`)
      reasons.forEach(r => console.log(`    ${DIM}• ${r}${RESET}`))
    })
    if (rowErrors.length > 20) log(DIM, `  ... và ${rowErrors.length - 20} dòng lỗi khác`)
  }

  if (batchErrors.length > 0) {
    console.log(`\n${RED}${BOLD}LỖI INSERT:${RESET}`)
    batchErrors.slice(0, 10).forEach(({ idx, err }) => {
      console.log(`  ${RED}Row ~${idx}:${RESET} ${DIM}${err}${RESET}`)
    })
  }

  if (imported > 0) {
    console.log(`\n${GREEN}${BOLD}✅ Import hoàn tất!${RESET}`)
    console.log(`${DIM}   Kiểm tra: npm run check:questions${RESET}`)
    console.log(`${DIM}   SQL:      SELECT COUNT(*) FROM public.question_bank;${RESET}\n`)
  } else if (rowErrors.length === 0 && batchErrors.length === 0) {
    console.log(`\n${YELLOW}Không có dữ liệu mới.${RESET}\n`)
  } else {
    console.log(`\n${RED}${BOLD}❌ Import thất bại — kiểm tra SQL migration và RLS policy.${RESET}\n`)
    console.log(`${YELLOW}   Gợi ý nếu lỗi RLS: thêm SUPABASE_SERVICE_ROLE_KEY vào .env.local${RESET}\n`)
  }
}

main().catch(err => {
  console.error(`\n${RED}${BOLD}❌ Lỗi không xử lý được:${RESET}`, err)
  process.exit(1)
})
