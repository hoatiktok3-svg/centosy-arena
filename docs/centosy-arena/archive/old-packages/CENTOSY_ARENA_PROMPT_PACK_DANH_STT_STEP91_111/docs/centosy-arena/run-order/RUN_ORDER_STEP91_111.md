# RUN_ORDER — CENTOSY ARENA

01. **OPS-06 — Sắp xếp lại tài liệu prompt pack trong dự án Claude Code**
   - Mục tiêu: Chỉ tổ chức tài liệu, tạo docs/centosy-arena, RUN_ORDER, README; không sửa code, không chạy prompt.
02. **STEP 91 — Tự chuyển câu mới + cập nhật điểm/thứ hạng tức thời**
   - Mục tiêu: Sau khi người chơi trả lời, khóa đáp án, tính điểm, cập nhật điểm/thứ hạng ngay, chờ 500-800ms rồi tự chuyển câu.
03. **STEP 92 — Âm thanh/rung nhẹ khi đúng/sai**
   - Mục tiêu: Thêm feedback game: âm thanh ngắn, rung nhẹ, nút bật/tắt âm thanh, không ảnh hưởng scoring/realtime.
04. **STEP 93 — Thiết kế kiến trúc Phòng Chơi Realtime**
   - Mục tiêu: Audit project và thiết kế kiến trúc admin tạo phòng, người chơi vào phòng, câu hỏi đồng bộ, leaderboard 3s.
05. **STEP 94 — SQL schema an toàn cho Phòng Chơi Realtime**
   - Mục tiêu: Tạo file SQL riêng cho game_rooms, players, questions, answers, scores, events; không tự chạy SQL.
06. **STEP 95 — UI Admin + Player cho Phòng Chơi Realtime**
   - Mục tiêu: Thiết kế route/component cho admin tạo phòng, phòng chờ, người chơi vào phòng, luật chơi, câu hỏi, leaderboard, kết quả.
07. **STEP 96 — Luật chơi + công thức tính điểm**
   - Mục tiêu: Tạo luật chơi hiển thị trong app; điểm = đúng 100 + bonus tốc độ; câu 10s/15s có thang bonus rõ.
08. **AUX-08 — Audit nền móng trước realtime engine**
   - Mục tiêu: Kiểm tra bảng, field, status, UI admin/player, luật chơi, realtime table trước STEP 97/98.
09. **STEP 97 — Phòng chờ realtime cho Admin và Người chơi**
   - Mục tiêu: Danh sách người vào phòng cập nhật realtime; admin bắt đầu/hủy; người chơi chờ admin.
10. **STEP 98 — Engine đồng bộ câu hỏi realtime 10–15s**
   - Mục tiêu: Admin bắt đầu → playing → current_question_started_at server time → timer → showing_leaderboard → câu tiếp theo/finished.
11. **STEP 99 — Ghi nhận đáp án + chống bấm nhiều lần + tính điểm tốc độ**
   - Mục tiêu: Insert answer một lần/câu/người, khóa UI, tính response_time_ms, cập nhật score không cộng lặp.
12. **STEP 100 — Leaderboard realtime 3 giây sau từng câu**
   - Mục tiêu: Khi status showing_leaderboard, hiển thị ranking tạm, highlight người hiện tại, countdown câu tiếp theo 3s.
13. **AUX-09 — Test 5 nhân viên chơi cùng lúc**
   - Mục tiêu: Kịch bản 5 người/trình duyệt: đúng nhanh, đúng chậm, sai, không trả lời, sát giờ; kiểm tra điểm/leaderboard/chuyển câu.
14. **P0-04 — Audit chống gian lận realtime**
   - Mục tiêu: Kiểm tra bấm nhiều lần, refresh, nhiều tab, trả lời sau hết giờ, cộng điểm lặp, RLS bảo vệ score.
15. **STEP 101 — Màn kết quả cuối + vinh danh Top 3**
   - Mục tiêu: Room finished hiển thị top 3, bảng xếp hạng cuối, kết quả cá nhân, fallback khi thiếu dữ liệu.
16. **STEP 102 — Lưu lịch sử phòng chơi, điểm và người thắng**
   - Mục tiêu: Lưu finished_at, winner, final_rank, total_score, correct_count, average_response_time, lịch sử admin xem lại.
17. **STEP 103 — Admin chọn bộ câu hỏi/game mode cho từng phòng**
   - Mục tiêu: Form tạo phòng chọn question set, game mode, số câu, thời gian, điểm; không lặp câu trong phòng.
18. **AUX-10 — Test tổng thể từ tạo phòng đến kết quả cuối**
   - Mục tiêu: Test end-to-end: tạo phòng, 5 người vào, chơi, điểm, leaderboard, kết quả cuối, lịch sử, tình huống lỗi.
19. **OPS-03 — Tài liệu admin vận hành Phòng Chơi Realtime**
   - Mục tiêu: Tài liệu hướng dẫn tạo phòng, mời nhân viên, luật chơi, theo dõi, xử lý lỗi, checklist vận hành.
20. **STEP 104 — Game Library admin tự thêm câu hỏi + chống lặp**
   - Mục tiêu: Admin thêm/sửa/ẩn câu hỏi, phân loại mode/chủ đề/độ khó, lấy câu random không trùng trong phòng.
21. **P0-05 — Audit database Supabase trước test thật**
   - Mục tiêu: Kiểm tra PK/FK/unique/index/RLS/realtime/policy cho rooms, players, answers, scores, questions.
22. **OPS-04 — Kịch bản buổi chơi thử 30 phút**
   - Mục tiêu: Tài liệu tổ chức test 5–10 người: chuẩn bị, lời dẫn, luật chơi, checklist lỗi, form phản hồi.
23. **P0-06 — Audit toàn bộ quyền Admin/User trước public**
   - Mục tiêu: Kiểm tra auth, role, route guard, RLS, realtime scope, quyền admin/employee, nguy cơ sửa điểm/câu hỏi.
24. **STEP 105 — Chia khối Cửa hàng / Văn phòng / Kho**
   - Mục tiêu: Thêm department_group/department/store/warehouse; admin tạo phòng theo công ty/khối/phòng ban; player chỉ thấy phòng phù hợp.
25. **STEP 106 — Giải đấu tuần/tháng + bảng vinh danh**
   - Mục tiêu: Tạo tournaments, cộng điểm từ phòng chơi, bonus top 1-3, top cá nhân/phòng ban/khối.
26. **STEP 107 — Đăng ký nhân viên + admin duyệt phòng ban**
   - Mục tiêu: Luồng signup pending, admin duyệt/gán role/khối/phòng ban; pending bị chặn vào app.
27. **STEP 108 — Dashboard Admin tổng quan**
   - Mục tiêu: KPI nhân viên/phòng/điểm/lịch sử/pending/top người chơi/cảnh báo, filter theo khối/phòng ban.
28. **AUX-11 — Checklist test public 20 nhân viên đầu tiên**
   - Mục tiêu: Test đăng ký, duyệt, phân quyền, chơi realtime 20 người, phòng ban, dashboard, tình huống lỗi cố ý.
29. **STEP 109 — Notification Center trong app**
   - Mục tiêu: Thông báo admin/nhân viên: pending, duyệt tài khoản, phòng mới, giải đấu, vinh danh, cảnh báo lỗi.
30. **STEP 110 — Mobile UX polish màn chơi**
   - Mục tiêu: Tối ưu màn mobile: câu hỏi dễ đọc, nút lớn, timer rõ, leaderboard gọn, kết quả dễ chụp.
31. **OPS-05 — Onboarding nhân viên dùng CENTOSY ARENA lần đầu**
   - Mục tiêu: Tài liệu gửi nhóm: app là gì, cách đăng ký, chờ duyệt, vào phòng, luật chơi, báo lỗi.
32. **P0-07 — Audit hiệu năng mobile trước test 20 người**
   - Mục tiêu: Kiểm tra load, bundle, timer render, subscription lặp, query dư, mobile layout, console/memory leak.
33. **STEP 111 — Báo lỗi/góp ý trực tiếp trong app**
   - Mục tiêu: Thêm FeedbackButton/Modal, bảng feedback_reports, admin xem/lọc/cập nhật trạng thái phản hồi.
34. **AUX-13 — Readiness audit: app đã đủ chơi realtime chưa**
   - Mục tiêu: Chấm điểm readiness: phòng, timer, answer, anti-cheat, scoring, leaderboard, result, history, quyền, mobile, test nhiều người.