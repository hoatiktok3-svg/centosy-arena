// Script tạo tài khoản admin — dùng Supabase Admin REST API trực tiếp
const SUPABASE_URL  = 'https://avprramyljytezenekwx.supabase.co'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_KEY
const EMAIL         = 'hoahuepatin@centosy.vn'
const PASSWORD      = 'anhhoakute'
const FULLNAME      = 'Hoa Hue Patin'

if (!SERVICE_KEY) { console.error('❌ Thiếu SUPABASE_SERVICE_KEY'); process.exit(1) }

const headers = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey':        SERVICE_KEY,
}

async function main() {
  console.log('🔄 Tạo tài khoản:', EMAIL)

  // 1. Tạo auth user qua Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      email:          EMAIL,
      password:       PASSWORD,
      email_confirm:  true,
      user_metadata:  { full_name: FULLNAME },
    }),
  })

  const createData = await createRes.json()

  let userId
  if (!createRes.ok) {
    if (createData.msg?.includes('already') || createData.error?.includes('already') || createData.code === 'email_exists') {
      console.log('⚠️  Email đã tồn tại — lấy UID hiện có...')
      // Lấy danh sách users để tìm UID
      const listRes  = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(EMAIL)}`, { headers })
      const listData = await listRes.json()
      const existing = listData?.users?.[0]
      if (!existing) { console.error('❌ Không tìm được user'); process.exit(1) }
      userId = existing.id
    } else {
      console.error('❌ Lỗi tạo user:', JSON.stringify(createData))
      process.exit(1)
    }
  } else {
    userId = createData.id
    console.log('✅ Auth user OK, UID:', userId)
  }

  // 2. Upsert profile với role = admin
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method:  'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      full_name:      FULLNAME,
      email:          EMAIL,
      role:           'admin',
      account_status: 'approved',
      is_active:      true,
      department:     'van-phong',
    }),
  })

  // Nếu PATCH (update) không tìm thấy row → INSERT
  if (profileRes.status === 404 || profileRes.status === 200 || profileRes.status === 204) {
    // Thử INSERT nếu chưa có row
    if (profileRes.status === 404) {
      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method:  'POST',
        headers: { ...headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id:             userId,
          full_name:      FULLNAME,
          email:          EMAIL,
          role:           'admin',
          account_status: 'approved',
          is_active:      true,
          department:     'van-phong',
        }),
      })
      if (!insertRes.ok) {
        const e = await insertRes.text()
        console.error('❌ Lỗi insert profile:', e)
        process.exit(1)
      }
    }
  }

  console.log('')
  console.log('🎉 HOÀN THÀNH! Tài khoản admin đã sẵn sàng:')
  console.log('   Email   : hoahuepatin@centosy.vn')
  console.log('   Password: anhhoakute')
  console.log('   Role    : admin ✓')
  console.log('')
  console.log('👉 Đăng nhập: https://centosy-arena.vercel.app')
}

main().catch(e => { console.error('❌', e.message); process.exit(1) })
