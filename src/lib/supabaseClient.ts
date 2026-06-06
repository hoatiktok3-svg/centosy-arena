import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

// Guard: nếu thiếu env vars thì không gọi createClient (sẽ throw crash toàn app).
// Thay vào đó cảnh báo rõ ràng trong console và export client dummy-safe.
if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] ⚠️  VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY chưa được cấu hình.\n' +
    '  → Kiểm tra file .env.local (local) hoặc Environment Variables trên Vercel.\n' +
    '  → App sẽ không thể kết nối Supabase cho đến khi env vars hợp lệ.'
  )
}

// Chỉ khởi tạo client khi có đủ cả hai giá trị hợp lệ.
// Nếu thiếu: dùng placeholder để tránh crash — mọi call Supabase sẽ fail nhẹ nhàng.
export const supabase = createClient(
  supabaseUrl  || 'https://placeholder.supabase.co',
  supabaseKey  || 'placeholder-key'
)
