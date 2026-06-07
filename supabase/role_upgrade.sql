-- ============================================================
-- CENTOSY ARENA — Role Upgrade
-- STEP 27: Thêm role manager, director, employee vào enum user_role
--
-- Chạy file này SAU employee_registration.sql đã chạy rồi.
-- Chạy trong Supabase SQL Editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Thêm giá trị mới vào enum user_role
--    (Postgres không cho DROP/RECREATE enum có data — dùng ADD VALUE)
-- ------------------------------------------------------------
do $$ begin
  alter type user_role add value if not exists 'employee';
exception when others then null;
end $$;

do $$ begin
  alter type user_role add value if not exists 'manager';
exception when others then null;
end $$;

do $$ begin
  alter type user_role add value if not exists 'director';
exception when others then null;
end $$;

-- ------------------------------------------------------------
-- 2. Migrate dữ liệu cũ: staff → employee
--    (staff là role cũ, employee là tên mới chuẩn hơn)
--    Chỉ update nếu cột role còn giá trị 'staff'
-- ------------------------------------------------------------
-- GHI CHÚ: Bỏ comment dòng dưới nếu muốn migrate 'staff' → 'employee'
-- Hiện tại GIỮ 'staff' để không phá backward compat với code cũ.
-- update public.profiles set role = 'employee' where role = 'staff';

-- ------------------------------------------------------------
-- 3. Cập nhật trigger handle_new_user
--    User tự đăng ký → role = 'employee' (thay vì 'staff')
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
  v_full_name         := coalesce(new.raw_user_meta_data->>'full_name', new.email);
  v_org_group         := new.raw_user_meta_data->>'org_group';
  v_office_department := new.raw_user_meta_data->>'office_department';
  v_phone             := new.raw_user_meta_data->>'phone';
  v_registration_note := new.raw_user_meta_data->>'registration_note';
  v_is_self_register  := (v_org_group is not null);

  insert into public.profiles (
    id, full_name, email, role, department,
    org_group, office_department, phone, registration_note,
    account_status, is_active
  )
  values (
    new.id,
    v_full_name,
    new.email,
    'employee',                        -- mặc định employee (không phải staff)
    'van-phong',
    case when v_org_group is not null
         then v_org_group::org_group_type else null end,
    case when v_office_department is not null
         then v_office_department::office_department_type else null end,
    v_phone,
    v_registration_note,
    case when v_is_self_register
         then 'pending'::account_status_type
         else 'approved'::account_status_type end,
    case when v_is_self_register then false else true end
  );

  return new;
end;
$$;

-- ------------------------------------------------------------
-- 4. Cập nhật is_admin() helper — admin vẫn là 'admin'
--    Thêm is_director() và is_manager() để dùng trong RLS sau
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_director()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'director')
  );
$$;

create or replace function public.is_manager()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'director', 'manager')
  );
$$;

-- ------------------------------------------------------------
-- 5. Cập nhật RLS staff_cannot_escalate
--    Thêm employee/manager/director vào danh sách role hợp lệ
-- ------------------------------------------------------------
create or replace function public.staff_cannot_escalate(
  new_role            text,
  new_account_status  text,
  new_score           integer,
  new_is_active       boolean,
  new_approved_by     uuid
)
returns boolean language sql security definer stable as $$
  select (
    new_role = (select role::text from public.profiles where id = auth.uid())
    and new_account_status = (select account_status::text from public.profiles where id = auth.uid())
    and new_score = (select score from public.profiles where id = auth.uid())
    and new_is_active = (select is_active from public.profiles where id = auth.uid())
    and (new_approved_by is null) = ((select approved_by from public.profiles where id = auth.uid()) is null)
  );
$$;

-- ============================================================
-- GHI CHÚ
-- ============================================================
-- Sau khi chạy SQL này:
-- 1. enum user_role có: admin, staff, employee, manager, director
-- 2. 'staff' vẫn hợp lệ (backward compat cho account cũ)
-- 3. User mới tự đăng ký sẽ có role = 'employee'
-- 4. Admin tạo tay vẫn dùng role = 'admin' như cũ
-- 5. Frontend (AuthContext) nhận và xử lý đủ 5 giá trị
-- ============================================================
