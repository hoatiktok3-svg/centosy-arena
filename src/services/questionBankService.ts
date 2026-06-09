/**
 * questionBankService — Tất cả Supabase calls cho bảng question_bank
 * Dùng bởi QuestionBankAdminPage
 */
import { supabase } from '../lib/supabaseClient'

// ── Types ──────────────────────────────────────────────────────
export interface QuestionBankRow {
  id:             string
  question:       string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  correct_answer: string   // 'A' | 'B' | 'C' | 'D'
  explanation:    string | null
  topic:          string | null
  department:     string | null
  difficulty:     string | null
  skill_tag:      string | null
  trap_type:      string | null
  time_limit:     number
  score:          number
  quality_score:  number | null
  source_type:    string
  is_approved:    boolean
  is_active:      boolean
  created_at:     string
  updated_at:     string
}

export interface QuestionBankFilters {
  search?:      string
  department?:  string
  difficulty?:  string
  topic?:       string
  source_type?: string
  /** 'approved' | 'pending' | 'active' | 'locked' */
  status?:      string
}

export interface QuestionBankStats {
  total:        number
  approved:     number
  pending:      number
  active:       number
  locked:       number
  csv_import:   number
  ai_generated: number
  manual:       number
}

export type UpdateQuestionData = Partial<Omit<QuestionBankRow, 'id' | 'created_at' | 'updated_at'>>

// ── getQuestionBank ────────────────────────────────────────────
export async function getQuestionBank(
  filters: QuestionBankFilters = {},
  limit = 200,
): Promise<{ data: QuestionBankRow[]; error: string | null }> {
  let q = supabase
    .from('question_bank')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (filters.search?.trim()) {
    q = q.ilike('question', `%${filters.search.trim()}%`)
  }
  if (filters.department)  q = q.eq('department',  filters.department)
  if (filters.difficulty)  q = q.eq('difficulty',  filters.difficulty)
  if (filters.topic)       q = q.eq('topic',       filters.topic)
  if (filters.source_type) q = q.eq('source_type', filters.source_type)

  if (filters.status === 'approved') q = q.eq('is_approved', true)
  if (filters.status === 'pending')  q = q.eq('is_approved', false)
  if (filters.status === 'active')   q = q.eq('is_active',   true)
  if (filters.status === 'locked')   q = q.eq('is_active',   false)

  const { data, error } = await q
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as QuestionBankRow[], error: null }
}

// ── getQuestionBankStats ───────────────────────────────────────
export async function getQuestionBankStats(): Promise<QuestionBankStats> {
  const { data, error } = await supabase
    .from('question_bank')
    .select('is_approved, is_active, source_type')
    .limit(2000)

  if (error || !data) {
    return { total: 0, approved: 0, pending: 0, active: 0, locked: 0, csv_import: 0, ai_generated: 0, manual: 0 }
  }

  return {
    total:        data.length,
    approved:     data.filter(r => r.is_approved).length,
    pending:      data.filter(r => !r.is_approved).length,
    active:       data.filter(r => r.is_active).length,
    locked:       data.filter(r => !r.is_active).length,
    csv_import:   data.filter(r => r.source_type === 'csv_import').length,
    ai_generated: data.filter(r => r.source_type === 'ai_generated').length,
    manual:       data.filter(r => r.source_type === 'manual').length,
  }
}

// ── updateQuestion ─────────────────────────────────────────────
export async function updateQuestion(
  questionId: string,
  data: UpdateQuestionData,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('question_bank')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', questionId)
  return { error: error?.message ?? null }
}

// ── approveQuestion ────────────────────────────────────────────
export async function approveQuestion(questionId: string): Promise<{ error: string | null }> {
  return updateQuestion(questionId, { is_approved: true })
}

// ── toggleQuestionActive ───────────────────────────────────────
export async function toggleQuestionActive(
  questionId: string,
  currentValue: boolean,
): Promise<{ error: string | null }> {
  return updateQuestion(questionId, { is_active: !currentValue })
}

// ── deleteQuestion (soft delete — set is_active = false + is_approved = false) ─
export async function deleteQuestion(questionId: string): Promise<{ error: string | null }> {
  // Soft delete: không xóa cứng, chỉ tắt câu hỏi
  return updateQuestion(questionId, { is_active: false, is_approved: false })
}

// ── getDistinctValues — lấy unique values cho filter dropdowns ─
export async function getDistinctFilterValues(): Promise<{
  departments: string[]
  difficulties: string[]
  topics:       string[]
}> {
  const { data } = await supabase
    .from('question_bank')
    .select('department, difficulty, topic')
    .limit(2000)

  const departments = [...new Set((data ?? []).map(r => r.department).filter(Boolean) as string[])].sort()
  const difficulties = [...new Set((data ?? []).map(r => r.difficulty).filter(Boolean) as string[])].sort()
  const topics       = [...new Set((data ?? []).map(r => r.topic).filter(Boolean) as string[])].sort()

  return { departments, difficulties, topics }
}
