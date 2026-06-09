/**
 * Shared helper: load .env/.env.local + tạo Supabase client cho Node.js scripts.
 * Dùng chung bởi import-questions-csv.ts và check-question-bank.ts
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import WebSocket from 'ws'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
export const ROOT = path.resolve(__dirname, '..')

export function loadEnv(): Record<string, string> {
  const vars: Record<string, string> = {}
  let found = false
  for (const name of ['.env.local', '.env']) {
    const p = path.join(ROOT, name)
    if (!fs.existsSync(p)) continue
    found = true
    fs.readFileSync(p, 'utf-8').split('\n').forEach(line => {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m) vars[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    })
  }
  if (!found) { console.error('❌ Không tìm thấy .env hoặc .env.local'); process.exit(1) }
  return vars
}

export function makeSupabaseClient(env: Record<string, string>): SupabaseClient {
  const url = env['VITE_SUPABASE_URL']
  const key =
    env['SUPABASE_SERVICE_ROLE_KEY']     ||
    env['VITE_SUPABASE_ANON_KEY']        ||
    env['VITE_SUPABASE_PUBLISHABLE_KEY']
  if (!url || !key) {
    console.error('❌ Thiếu VITE_SUPABASE_URL hoặc API key trong .env/.env.local')
    process.exit(1)
  }
  return createClient(url, key, {
    auth:     { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as unknown as typeof WebSocket },
  })
}
