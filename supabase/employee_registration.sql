-- ============================================================
-- CENTOSY ARENA — Employee Self-Registration Schema Upgrade
-- STEP 26A
--
-- Mục đích: Bổ sung các cột hỗ trợ nhân viên tự đăng ký,
--           chọn khối/phòng ban và chờ Admin duyệt.
--
-- Cách dùng: Paste toàn bộ file này vào Supabase SQL Editor
--            và chạy. Không chạy lại schema.sql cũ.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Enum mới: org_group — khối tổ chức
--    (Thay thế department_type cũ về mặt semantic.
--     department_type vẫn giữ để tránh breaking change.)
-- ------------------------------------------------------------
do $$ begin
  create type org_group_type as enum (
    'cua-hang',
    'kho',
    'van-phong'
  );
exception
  when duplicate_object then null;
end $$;


-- ------------------------------------------------------------
-- 2. Enum mới: office_department — phòng ban trong văn phòng
-- ------------------------------------------------------------
do $$ begin
  create type office_department_type as enum (
    'tmdt',
    'kdtt',
    'mua-hang',
    'ke-toan',
    'hanh-chinh-nhan-su',
    'marketing',
    'giam-doc'
  );
exception
  when duplicate_object then null;
end $$;


-- ------------------------------------------------------------
-- 3. Enum mới: account_status — trạng thái tài khoản
-- ------------------------------------------------------------
do $$ begin
  create type account_status_type as enum (
    'pending',
    'approved',
    'rejected',
    'inactive',
    'resigned'
  );
exception
  when duplicate_object then null;
end $$;

-- Nếu enum đã tồn tại mà thiếu 'resigned', thêm vào:
do $$ begin
  alter type account_status_type add value if not exists 'resigned';
exception
  when others then null;
end $$;


-- ------------------------------------------------------------
-- 4. Bổ sung cột vào public.profiles
--    Dùng ADD COLUMN IF NOT EXISTS để idempotent (chạy lại an toàn)
-- ------------------------------------------------------------

-- Khối tổ chức (bắt buộc khi đăng ký)
alter table public.profiles
  add column if not exists org_group org_group_type;

-- Phòng ban (chỉ điền khi org_group = 'van-phong', còn lại NULL)
alter table public.profiles
  add column if not exists office_department office_department_type;

-- Trạng thái tài khoản — mặc định pending khi tự đăng ký
alter table public.profiles
  add column if not exists account_status account_status_type not null default 'approved';
-- Lý do default 'approved': các account cũ tạo thủ công qua Admin đã được duyệt.
-- Account mới tự đăng ký sẽ được trigger set về 'pending' (xem phần 6).

-- Số điện thoại
alter table public.profiles
  add column if not exists phone text;

-- Mã nhân viên (admin cấp sau khi duyệt)
alter table public.profiles
  add column if not exists employee_code text;

-- Ghi chú khi đăng ký (nhân viên điền lý do / thông tin thêm)
alter table public.profiles
  add column if not exists registration_note text;

-- Admin đã duyệt/từ chối (uuid tham chiếu chính profiles)
alter table public.profiles
  add column if not exists approved_by uuid references public.profiles(id) on delete set null;

-- Thời điểm duyệt/từ chối
alter table public.profiles
  add column if not exists approved_at timestamptz;

-- Lý do từ chối (admin điền khi reject)
alter table public.profiles
  add column if not exists rejected_reason text;


-- ------------------------------------------------------------
-- 5. Cập nhật trigger handle_new_user
--    Khi user tự đăng ký (qua RegisterScreen sau này):
--    - role = 'staff'
--    - account_status = 'pending'
--    - is_active = false
--    Các giá trị org_group / office_department lấy từ metadata
--    mà RegisterScreen sẽ truyền vào raw_user_meta_data.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_full_name          text;
  v_org_group          text;
  v_office_department  text;
  v_phone              text;
  v_registration_note  text;
  v_is_self_register   boolean;
begin
  -- Đọc metadata từ signup payload
  v_full_name         := coalesce(new.raw_user_meta_data->>'full_name', new.email);
  v_org_group         := new.raw_user_meta_data->>'org_group';
  v_office_department := new.raw_user_meta_data->>'office_department';
  v_phone             := new.raw_user_meta_data->>'phone';
  v_registration_note := new.raw_user_meta_data->>'registration_note';

  -- Nếu metadata có org_group → là self-registration → pending + inactive
  v_is_self_register := (v_org_group is not null);

  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    department,
    org_group,
    office_department,
    phone,
    registration_note,
    account_status,
    is_active
  )
  values (
    new.id,
    v_full_name,
    new.email,
    'staff',                                                    -- mặc định staff, không cho tự chọn admin
    'van-phong',                                                -- department cũ, giữ cho backwards compat
    case when v_org_group is not null
         then v_org_group::org_group_type
         else null end,
    case when v_office_department is not null
         then v_office_department::office_department_type
         else null end,
    v_phone,
    v_registration_note,
    case when v_is_self_register then 'pending'::account_status_type
         else 'approved'::account_status_type end,
    case when v_is_self_register then false           -- pending → chưa được vào app
         else true end
  );

  return new;
end;
$$;

-- Đảm bảo trigger vẫn gắn đúng (replace function không drop trigger)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ------------------------------------------------------------
-- 6. RLS bổ sung — Staff KHÔNG được tự cập nhật các cột nhạy cảm
--
--    Policy "Staff cập nhật profile cơ bản của mình" đã tồn tại
--    (từ schema.sql) nhưng không có WITH CHECK chặn cột cụ thể.
--    Giải pháp: dùng function kiểm tra dữ liệu mới không thay đổi
--    các cột nhạy cảm.
-- ------------------------------------------------------------

-- Hàm kiểm tra staff không tự leo quyền
create or replace function public.staff_cannot_escalate(
  new_role            text,
  new_account_status  text,
  new_score           integer,
  new_is_active       boolean,
  new_approved_by     uuid
)
returns boolean
language sql
security definer
stable
as $$
  select (
    -- role không được thay đổi so với hiện tại
    new_role = (select role::text from public.profiles where id = auth.uid())
    -- account_status không được thay đổi
    and new_account_status = (select account_status::text from public.profiles where id = auth.uid())
    -- score không được thay đổi (điểm do hệ thống cập nhật)
    and new_score = (select score from public.profiles where id = auth.uid())
    -- is_active không được thay đổi
    and new_is_active = (select is_active from public.profiles where id = auth.uid())
    -- approved_by không được thay đổi
    and (new_approved_by is null) = ((select approved_by from public.profiles where id = auth.uid()) is null)
  );
$$;

-- Drop policy cũ để thay bằng policy mới có WITH CHECK chặt hơn
drop policy if exists "Staff cập nhật profile cơ bản của mình" on public.profiles;

create policy "Staff cập nhật profile cơ bản của mình"
  on public.profiles
  for update
  to authenticated
  using (
    auth.uid() = id
    and not public.is_admin()
  )
  with check (
    auth.uid() = id
    and not public.is_admin()
    -- Staff chỉ được cập nhật: avatar_initials, title, phone, registration_note
    -- Không được tự đổi: role, account_status, score, is_active, approved_by
    and public.staff_cannot_escalate(
      role::text,
      account_status::text,
      score,
      is_active,
      approved_by
    )
  );


-- ------------------------------------------------------------
-- 7. Index hỗ trợ Admin query danh sách pending
-- ------------------------------------------------------------
create index if not exists idx_profiles_account_status
  on public.profiles (account_status);

create index if not exists idx_profiles_org_group
  on public.profiles (org_group);


-- ============================================================
-- GHI CHÚ QUAN TRỌNG
-- ============================================================
-- 1. Chạy file này SAU KHI schema.sql đã chạy rồi.
--    Không chạy lại schema.sql — sẽ lỗi duplicate.
--
-- 2. Các account cũ (admin@centosy.vn, cuahang01, tmdt01)
--    sẽ có account_status = 'approved' và is_active = true.
--    Không bị ảnh hưởng.
--
-- 3. org_group và office_department của account cũ = NULL.
--    Admin có thể cập nhật thủ công nếu cần:
--    update public.profiles
--    set org_group = 'cua-hang'
--    where email = 'cuahang01@centosy.vn';
--
-- 4. Sau STEP 26A, bước tiếp theo là STEP 26B:
--    Tạo RegisterScreen với form đăng ký + chọn org_group.
--
-- 5. Không dùng service_role key ở frontend.
--    Admin duyệt pending accounts qua AdminPanel (STEP 26E).
-- ============================================================
