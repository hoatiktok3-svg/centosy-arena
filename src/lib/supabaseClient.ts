import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY chưa được cấu hình.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '')
