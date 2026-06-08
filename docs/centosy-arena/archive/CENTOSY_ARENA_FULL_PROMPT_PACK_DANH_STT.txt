# CENTOSY ARENA — PROMPT PACK ĐÁNH STT TỪ HỘI THOẠI

Gói này được tạo lại để giải nén vào dự án Claude Code/Cowork. Không chạy toàn bộ cùng lúc.

## Thứ tự chạy nhanh

- 01. OPS-06 — Sắp xếp lại tài liệu prompt pack trong dự án Claude Code
- 02. STEP 91 — Tự chuyển câu mới + cập nhật điểm/thứ hạng tức thời
- 03. STEP 92 — Âm thanh/rung nhẹ khi đúng/sai
- 04. STEP 93 — Thiết kế kiến trúc Phòng Chơi Realtime
- 05. STEP 94 — SQL schema an toàn cho Phòng Chơi Realtime
- 06. STEP 95 — UI Admin + Player cho Phòng Chơi Realtime
- 07. STEP 96 — Luật chơi + công thức tính điểm
- 08. AUX-08 — Audit nền móng trước realtime engine
- 09. STEP 97 — Phòng chờ realtime cho Admin và Người chơi
- 10. STEP 98 — Engine đồng bộ câu hỏi realtime 10–15s
- 11. STEP 99 — Ghi nhận đáp án + chống bấm nhiều lần + tính điểm tốc độ
- 12. STEP 100 — Leaderboard realtime 3 giây sau từng câu
- 13. AUX-09 — Test 5 nhân viên chơi cùng lúc
- 14. P0-04 — Audit chống gian lận realtime
- 15. STEP 101 — Màn kết quả cuối + vinh danh Top 3
- 16. STEP 102 — Lưu lịch sử phòng chơi, điểm và người thắng
- 17. STEP 103 — Admin chọn bộ câu hỏi/game mode cho từng phòng
- 18. AUX-10 — Test tổng thể từ tạo phòng đến kết quả cuối
- 19. OPS-03 — Tài liệu admin vận hành Phòng Chơi Realtime
- 20. STEP 104 — Game Library admin tự thêm câu hỏi + chống lặp
- 21. P0-05 — Audit database Supabase trước test thật
- 22. OPS-04 — Kịch bản buổi chơi thử 30 phút
- 23. P0-06 — Audit toàn bộ quyền Admin/User trước public
- 24. STEP 105 — Chia khối Cửa hàng / Văn phòng / Kho
- 25. STEP 106 — Giải đấu tuần/tháng + bảng vinh danh
- 26. STEP 107 — Đăng ký nhân viên + admin duyệt phòng ban
- 27. STEP 108 — Dashboard Admin tổng quan
- 28. AUX-11 — Checklist test public 20 nhân viên đầu tiên
- 29. STEP 109 — Notification Center trong app
- 30. STEP 110 — Mobile UX polish màn chơi
- 31. OPS-05 — Onboarding nhân viên dùng CENTOSY ARENA lần đầu
- 32. P0-07 — Audit hiệu năng mobile trước test 20 người
- 33. STEP 111 — Báo lỗi/góp ý trực tiếp trong app
- 34. AUX-13 — Readiness audit: app đã đủ chơi realtime chưa

---

# 01. OPS-06 — Sắp xếp lại tài liệu prompt pack trong dự án Claude Code

```text
OPS-06 — Sắp xếp lại tài liệu prompt pack trong dự án Claude Code

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Operations Manager + Project Maintainer với 10 năm kinh nghiệm tổ chức tài liệu, quy trình vận hành và rollout app nội bộ.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Chỉ tổ chức tài liệu, tạo docs/centosy-arena, RUN_ORDER, README; không sửa code, không chạy prompt.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của OPS-06.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Chỉ tổ chức tài liệu, tạo docs/centosy-arena, RUN_ORDER, README; không sửa code, không chạy prompt.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 02. STEP 91 — Tự chuyển câu mới + cập nhật điểm/thứ hạng tức thời

```text
STEP 91 — Tự chuyển câu mới + cập nhật điểm/thứ hạng tức thời

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Sau khi người chơi trả lời, khóa đáp án, tính điểm, cập nhật điểm/thứ hạng ngay, chờ 500-800ms rồi tự chuyển câu.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 91.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Sau khi người chơi trả lời, khóa đáp án, tính điểm, cập nhật điểm/thứ hạng ngay, chờ 500-800ms rồi tự chuyển câu.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 03. STEP 92 — Âm thanh/rung nhẹ khi đúng/sai

```text
STEP 92 — Âm thanh/rung nhẹ khi đúng/sai

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Thêm feedback game: âm thanh ngắn, rung nhẹ, nút bật/tắt âm thanh, không ảnh hưởng scoring/realtime.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 92.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Thêm feedback game: âm thanh ngắn, rung nhẹ, nút bật/tắt âm thanh, không ảnh hưởng scoring/realtime.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 04. STEP 93 — Thiết kế kiến trúc Phòng Chơi Realtime

```text
STEP 93 — Thiết kế kiến trúc Phòng Chơi Realtime

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Audit project và thiết kế kiến trúc admin tạo phòng, người chơi vào phòng, câu hỏi đồng bộ, leaderboard 3s.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 93.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Audit project và thiết kế kiến trúc admin tạo phòng, người chơi vào phòng, câu hỏi đồng bộ, leaderboard 3s.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 05. STEP 94 — SQL schema an toàn cho Phòng Chơi Realtime

```text
STEP 94 — SQL schema an toàn cho Phòng Chơi Realtime

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tạo file SQL riêng cho game_rooms, players, questions, answers, scores, events; không tự chạy SQL.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 94.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tạo file SQL riêng cho game_rooms, players, questions, answers, scores, events; không tự chạy SQL.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 06. STEP 95 — UI Admin + Player cho Phòng Chơi Realtime

```text
STEP 95 — UI Admin + Player cho Phòng Chơi Realtime

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Thiết kế route/component cho admin tạo phòng, phòng chờ, người chơi vào phòng, luật chơi, câu hỏi, leaderboard, kết quả.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 95.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Thiết kế route/component cho admin tạo phòng, phòng chờ, người chơi vào phòng, luật chơi, câu hỏi, leaderboard, kết quả.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 07. STEP 96 — Luật chơi + công thức tính điểm

```text
STEP 96 — Luật chơi + công thức tính điểm

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tạo luật chơi hiển thị trong app; điểm = đúng 100 + bonus tốc độ; câu 10s/15s có thang bonus rõ.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 96.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tạo luật chơi hiển thị trong app; điểm = đúng 100 + bonus tốc độ; câu 10s/15s có thang bonus rõ.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 08. AUX-08 — Audit nền móng trước realtime engine

```text
AUX-08 — Audit nền móng trước realtime engine

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA Lead + Realtime Game Auditor với 10 năm kinh nghiệm kiểm thử app nhiều người chơi, mobile UX và Supabase Realtime.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kiểm tra bảng, field, status, UI admin/player, luật chơi, realtime table trước STEP 97/98.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của AUX-08.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kiểm tra bảng, field, status, UI admin/player, luật chơi, realtime table trước STEP 97/98.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 09. STEP 97 — Phòng chờ realtime cho Admin và Người chơi

```text
STEP 97 — Phòng chờ realtime cho Admin và Người chơi

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Danh sách người vào phòng cập nhật realtime; admin bắt đầu/hủy; người chơi chờ admin.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 97.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Danh sách người vào phòng cập nhật realtime; admin bắt đầu/hủy; người chơi chờ admin.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 10. STEP 98 — Engine đồng bộ câu hỏi realtime 10–15s

```text
STEP 98 — Engine đồng bộ câu hỏi realtime 10–15s

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Admin bắt đầu → playing → current_question_started_at server time → timer → showing_leaderboard → câu tiếp theo/finished.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 98.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Admin bắt đầu → playing → current_question_started_at server time → timer → showing_leaderboard → câu tiếp theo/finished.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 11. STEP 99 — Ghi nhận đáp án + chống bấm nhiều lần + tính điểm tốc độ

```text
STEP 99 — Ghi nhận đáp án + chống bấm nhiều lần + tính điểm tốc độ

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Insert answer một lần/câu/người, khóa UI, tính response_time_ms, cập nhật score không cộng lặp.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 99.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Insert answer một lần/câu/người, khóa UI, tính response_time_ms, cập nhật score không cộng lặp.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 12. STEP 100 — Leaderboard realtime 3 giây sau từng câu

```text
STEP 100 — Leaderboard realtime 3 giây sau từng câu

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Khi status showing_leaderboard, hiển thị ranking tạm, highlight người hiện tại, countdown câu tiếp theo 3s.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 100.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Khi status showing_leaderboard, hiển thị ranking tạm, highlight người hiện tại, countdown câu tiếp theo 3s.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 13. AUX-09 — Test 5 nhân viên chơi cùng lúc

```text
AUX-09 — Test 5 nhân viên chơi cùng lúc

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA Lead + Realtime Game Auditor với 10 năm kinh nghiệm kiểm thử app nhiều người chơi, mobile UX và Supabase Realtime.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kịch bản 5 người/trình duyệt: đúng nhanh, đúng chậm, sai, không trả lời, sát giờ; kiểm tra điểm/leaderboard/chuyển câu.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của AUX-09.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kịch bản 5 người/trình duyệt: đúng nhanh, đúng chậm, sai, không trả lời, sát giờ; kiểm tra điểm/leaderboard/chuyển câu.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 14. P0-04 — Audit chống gian lận realtime

```text
P0-04 — Audit chống gian lận realtime

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA/Security Engineer + Supabase Architect với 10 năm kinh nghiệm audit lỗi nền móng, phân quyền, dữ liệu và realtime game.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kiểm tra bấm nhiều lần, refresh, nhiều tab, trả lời sau hết giờ, cộng điểm lặp, RLS bảo vệ score.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của P0-04.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kiểm tra bấm nhiều lần, refresh, nhiều tab, trả lời sau hết giờ, cộng điểm lặp, RLS bảo vệ score.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 15. STEP 101 — Màn kết quả cuối + vinh danh Top 3

```text
STEP 101 — Màn kết quả cuối + vinh danh Top 3

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Room finished hiển thị top 3, bảng xếp hạng cuối, kết quả cá nhân, fallback khi thiếu dữ liệu.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 101.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Room finished hiển thị top 3, bảng xếp hạng cuối, kết quả cá nhân, fallback khi thiếu dữ liệu.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 16. STEP 102 — Lưu lịch sử phòng chơi, điểm và người thắng

```text
STEP 102 — Lưu lịch sử phòng chơi, điểm và người thắng

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Lưu finished_at, winner, final_rank, total_score, correct_count, average_response_time, lịch sử admin xem lại.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 102.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Lưu finished_at, winner, final_rank, total_score, correct_count, average_response_time, lịch sử admin xem lại.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 17. STEP 103 — Admin chọn bộ câu hỏi/game mode cho từng phòng

```text
STEP 103 — Admin chọn bộ câu hỏi/game mode cho từng phòng

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Form tạo phòng chọn question set, game mode, số câu, thời gian, điểm; không lặp câu trong phòng.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 103.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Form tạo phòng chọn question set, game mode, số câu, thời gian, điểm; không lặp câu trong phòng.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 18. AUX-10 — Test tổng thể từ tạo phòng đến kết quả cuối

```text
AUX-10 — Test tổng thể từ tạo phòng đến kết quả cuối

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA Lead + Realtime Game Auditor với 10 năm kinh nghiệm kiểm thử app nhiều người chơi, mobile UX và Supabase Realtime.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Test end-to-end: tạo phòng, 5 người vào, chơi, điểm, leaderboard, kết quả cuối, lịch sử, tình huống lỗi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của AUX-10.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Test end-to-end: tạo phòng, 5 người vào, chơi, điểm, leaderboard, kết quả cuối, lịch sử, tình huống lỗi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 19. OPS-03 — Tài liệu admin vận hành Phòng Chơi Realtime

```text
OPS-03 — Tài liệu admin vận hành Phòng Chơi Realtime

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Operations Manager + Project Maintainer với 10 năm kinh nghiệm tổ chức tài liệu, quy trình vận hành và rollout app nội bộ.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tài liệu hướng dẫn tạo phòng, mời nhân viên, luật chơi, theo dõi, xử lý lỗi, checklist vận hành.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của OPS-03.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tài liệu hướng dẫn tạo phòng, mời nhân viên, luật chơi, theo dõi, xử lý lỗi, checklist vận hành.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 20. STEP 104 — Game Library admin tự thêm câu hỏi + chống lặp

```text
STEP 104 — Game Library admin tự thêm câu hỏi + chống lặp

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Admin thêm/sửa/ẩn câu hỏi, phân loại mode/chủ đề/độ khó, lấy câu random không trùng trong phòng.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 104.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Admin thêm/sửa/ẩn câu hỏi, phân loại mode/chủ đề/độ khó, lấy câu random không trùng trong phòng.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 21. P0-05 — Audit database Supabase trước test thật

```text
P0-05 — Audit database Supabase trước test thật

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA/Security Engineer + Supabase Architect với 10 năm kinh nghiệm audit lỗi nền móng, phân quyền, dữ liệu và realtime game.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kiểm tra PK/FK/unique/index/RLS/realtime/policy cho rooms, players, answers, scores, questions.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của P0-05.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kiểm tra PK/FK/unique/index/RLS/realtime/policy cho rooms, players, answers, scores, questions.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 22. OPS-04 — Kịch bản buổi chơi thử 30 phút

```text
OPS-04 — Kịch bản buổi chơi thử 30 phút

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Operations Manager + Project Maintainer với 10 năm kinh nghiệm tổ chức tài liệu, quy trình vận hành và rollout app nội bộ.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tài liệu tổ chức test 5–10 người: chuẩn bị, lời dẫn, luật chơi, checklist lỗi, form phản hồi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của OPS-04.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tài liệu tổ chức test 5–10 người: chuẩn bị, lời dẫn, luật chơi, checklist lỗi, form phản hồi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 23. P0-06 — Audit toàn bộ quyền Admin/User trước public

```text
P0-06 — Audit toàn bộ quyền Admin/User trước public

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA/Security Engineer + Supabase Architect với 10 năm kinh nghiệm audit lỗi nền móng, phân quyền, dữ liệu và realtime game.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kiểm tra auth, role, route guard, RLS, realtime scope, quyền admin/employee, nguy cơ sửa điểm/câu hỏi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của P0-06.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kiểm tra auth, role, route guard, RLS, realtime scope, quyền admin/employee, nguy cơ sửa điểm/câu hỏi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 24. STEP 105 — Chia khối Cửa hàng / Văn phòng / Kho

```text
STEP 105 — Chia khối Cửa hàng / Văn phòng / Kho

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Thêm department_group/department/store/warehouse; admin tạo phòng theo công ty/khối/phòng ban; player chỉ thấy phòng phù hợp.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 105.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Thêm department_group/department/store/warehouse; admin tạo phòng theo công ty/khối/phòng ban; player chỉ thấy phòng phù hợp.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 25. STEP 106 — Giải đấu tuần/tháng + bảng vinh danh

```text
STEP 106 — Giải đấu tuần/tháng + bảng vinh danh

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tạo tournaments, cộng điểm từ phòng chơi, bonus top 1-3, top cá nhân/phòng ban/khối.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 106.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tạo tournaments, cộng điểm từ phòng chơi, bonus top 1-3, top cá nhân/phòng ban/khối.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 26. STEP 107 — Đăng ký nhân viên + admin duyệt phòng ban

```text
STEP 107 — Đăng ký nhân viên + admin duyệt phòng ban

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Luồng signup pending, admin duyệt/gán role/khối/phòng ban; pending bị chặn vào app.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 107.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Luồng signup pending, admin duyệt/gán role/khối/phòng ban; pending bị chặn vào app.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 27. STEP 108 — Dashboard Admin tổng quan

```text
STEP 108 — Dashboard Admin tổng quan

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: KPI nhân viên/phòng/điểm/lịch sử/pending/top người chơi/cảnh báo, filter theo khối/phòng ban.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 108.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- KPI nhân viên/phòng/điểm/lịch sử/pending/top người chơi/cảnh báo, filter theo khối/phòng ban.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 28. AUX-11 — Checklist test public 20 nhân viên đầu tiên

```text
AUX-11 — Checklist test public 20 nhân viên đầu tiên

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA Lead + Realtime Game Auditor với 10 năm kinh nghiệm kiểm thử app nhiều người chơi, mobile UX và Supabase Realtime.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Test đăng ký, duyệt, phân quyền, chơi realtime 20 người, phòng ban, dashboard, tình huống lỗi cố ý.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của AUX-11.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Test đăng ký, duyệt, phân quyền, chơi realtime 20 người, phòng ban, dashboard, tình huống lỗi cố ý.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 29. STEP 109 — Notification Center trong app

```text
STEP 109 — Notification Center trong app

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Thông báo admin/nhân viên: pending, duyệt tài khoản, phòng mới, giải đấu, vinh danh, cảnh báo lỗi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 109.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Thông báo admin/nhân viên: pending, duyệt tài khoản, phòng mới, giải đấu, vinh danh, cảnh báo lỗi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 30. STEP 110 — Mobile UX polish màn chơi

```text
STEP 110 — Mobile UX polish màn chơi

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tối ưu màn mobile: câu hỏi dễ đọc, nút lớn, timer rõ, leaderboard gọn, kết quả dễ chụp.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 110.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tối ưu màn mobile: câu hỏi dễ đọc, nút lớn, timer rõ, leaderboard gọn, kết quả dễ chụp.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 31. OPS-05 — Onboarding nhân viên dùng CENTOSY ARENA lần đầu

```text
OPS-05 — Onboarding nhân viên dùng CENTOSY ARENA lần đầu

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Operations Manager + Project Maintainer với 10 năm kinh nghiệm tổ chức tài liệu, quy trình vận hành và rollout app nội bộ.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Tài liệu gửi nhóm: app là gì, cách đăng ký, chờ duyệt, vào phòng, luật chơi, báo lỗi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của OPS-05.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Tài liệu gửi nhóm: app là gì, cách đăng ký, chờ duyệt, vào phòng, luật chơi, báo lỗi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 32. P0-07 — Audit hiệu năng mobile trước test 20 người

```text
P0-07 — Audit hiệu năng mobile trước test 20 người

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA/Security Engineer + Supabase Architect với 10 năm kinh nghiệm audit lỗi nền móng, phân quyền, dữ liệu và realtime game.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Kiểm tra load, bundle, timer render, subscription lặp, query dư, mobile layout, console/memory leak.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của P0-07.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Kiểm tra load, bundle, timer render, subscription lặp, query dư, mobile layout, console/memory leak.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 33. STEP 111 — Báo lỗi/góp ý trực tiếp trong app

```text
STEP 111 — Báo lỗi/góp ý trực tiếp trong app

[KHỐI 1 — VAI TRÒ]
Bạn là Senior Product Architect + Claude Code Prompt Engineer với 10 năm kinh nghiệm xây app nội bộ, realtime game, Supabase và vận hành sản phẩm doanh nghiệp.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Thêm FeedbackButton/Modal, bảng feedback_reports, admin xem/lọc/cập nhật trạng thái phản hồi.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của STEP 111.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Thêm FeedbackButton/Modal, bảng feedback_reports, admin xem/lọc/cập nhật trạng thái phản hồi.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

# 34. AUX-13 — Readiness audit: app đã đủ chơi realtime chưa

```text
AUX-13 — Readiness audit: app đã đủ chơi realtime chưa

[KHỐI 1 — VAI TRÒ]
Bạn là Senior QA Lead + Realtime Game Auditor với 10 năm kinh nghiệm kiểm thử app nhiều người chơi, mobile UX và Supabase Realtime.

[KHỐI 2 — NGỮ CẢNH]
Tôi đang phát triển app nội bộ CENTOSY ARENA cho Công ty TNHH Centosy Việt Nam.
Roadmap hiện tại đang tiếp nối từ STEP 91 đến STEP 111, kèm nhóm P0/AUX/OPS để xử lý nền móng, kiểm thử và vận hành.
Mục tiêu của prompt này: Chấm điểm readiness: phòng, timer, answer, anti-cheat, scoring, leaderboard, result, history, quyền, mobile, test nhiều người.

[KHỐI 3 — YÊU CẦU KHAI THÁC]
Hãy thực hiện đúng phạm vi của AUX-13.
Không làm lan sang step khác nếu chưa được yêu cầu.
Trước khi sửa, hãy audit các file/component/schema liên quan.
Sau đó chỉ tạo patch nhỏ nhất để đạt mục tiêu.
Nếu phát hiện thiếu dữ liệu, thiếu bảng, thiếu policy hoặc thiếu route, hãy báo rõ và đề xuất cách xử lý an toàn.

Nội dung cần tập trung:
- Chấm điểm readiness: phòng, timer, answer, anti-cheat, scoring, leaderboard, result, history, quyền, mobile, test nhiều người.
- Giữ nguyên UI hiện tại nếu không bắt buộc thay đổi.
- Ưu tiên mobile-first vì nhân viên chủ yếu chơi bằng điện thoại.
- Ưu tiên đúng dữ liệu, đúng điểm, đúng quyền, không gian lận.

[KHỐI 4 — RÀNG BUỘC TƯ DUY]
Không refactor toàn bộ project.
Không phá UI hiện tại.
Không deploy.
Không push git.
Không tự chạy SQL nếu chưa được yêu cầu.
Nếu cần SQL, chỉ tạo file patch riêng để tôi chạy thủ công.
Bắt đầu bằng audit file/schema liên quan rồi mới sửa.
Mỗi prompt chỉ xử lý đúng phạm vi của mã STEP/P0/AUX/OPS này.

[KHỐI 5 — ĐỊNH DẠNG OUTPUT]
Sau khi làm xong, trả về:
1. Đã đọc/audit file nào.
2. Đã tạo/sửa file nào.
3. Logic cũ đang thiếu/sai ở đâu.
4. Logic mới hoạt động thế nào.
5. Có cần SQL patch không, nếu có tên file là gì.
6. Cách test thủ công.
7. Rủi ro còn lại P0/P1/P2 nếu có.
8. Bước tiếp theo duy nhất nên làm.
```

---

