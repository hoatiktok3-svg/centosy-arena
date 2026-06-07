-- ============================================================
-- CENTOSY ARENA — Seed Missions Ban Đầu
-- P0-03 / J5
--
-- Mục đích: Tạo 5 nhiệm vụ mặc định để app có nội dung ngay
-- khi mới deploy.
--
-- LƯU Ý:
-- - Chạy SAU khi đã chạy missions.sql + mission_points_trigger.sql
-- - Có thể chạy lại nhiều lần — ON CONFLICT DO NOTHING
-- - Không xóa missions cũ, chỉ thêm nếu chưa có
-- ============================================================


INSERT INTO public.missions
  (title, description, mission_type, points, is_active, max_submissions_per_user, requires_approval)
VALUES

  -- 1. Check-in hàng ngày
  (
    'Check-in hôm nay',
    'Check-in để bắt đầu ngày làm việc. Nhấn nút Check-in trong app để nhận điểm.',
    'daily_checkin',
    10,
    true,
    1,      -- 1 lần/ngày
    false   -- không cần duyệt, tự động
  ),

  -- 2. Hoàn thành quiz sản phẩm
  (
    'Hoàn thành quiz sản phẩm',
    'Chơi hết 1 vòng Quiz Sản Phẩm. Điểm được ghi nhận tự động sau khi hoàn thành game.',
    'complete_quiz',
    20,
    true,
    1,      -- 1 lần tính điểm/ngày (anti-dup ở game engine)
    false
  ),

  -- 3. Gửi ý tưởng cải tiến
  (
    'Gửi ý tưởng cải tiến',
    'Chia sẻ 1 ý tưởng để cải thiện quy trình, sản phẩm hoặc dịch vụ. Viết rõ ràng để được duyệt nhanh hơn.',
    'submit_idea',
    30,
    true,
    1,      -- 1 lần/ngày
    true    -- cần admin duyệt
  ),

  -- 4. Gửi lời khen đồng nghiệp
  (
    'Gửi lời khen đồng nghiệp',
    'Ghi nhận một đồng nghiệp đã làm tốt hôm nay. Lời khen phải cụ thể và chân thành.',
    'peer_praise',
    15,
    true,
    1,      -- 1 lần/ngày
    false   -- tự động, không cần duyệt
  ),

  -- 5. Chia sẻ câu chuyện khách hàng
  (
    'Chia sẻ câu chuyện khách hàng',
    'Kể lại 1 tình huống thực tế với khách hàng (tốt hoặc cần cải thiện). Câu chuyện chi tiết sẽ giúp cả team học hỏi.',
    'share_story',
    25,
    true,
    1,      -- 1 lần/ngày
    true    -- cần admin duyệt
  )

ON CONFLICT (title) DO NOTHING;


-- ── Kiểm tra kết quả ───────────────────────────────────────────────
-- Chạy query này sau để xác nhận đã insert đúng:
SELECT id, title, mission_type, points, is_active, requires_approval
FROM public.missions
ORDER BY points ASC;
