# CENTOSY ARENA — PROJECT MEMORY

## 1. Project Overview
CENTOSY ARENA là app nội bộ cho Công ty TNHH Centosy Việt Nam.
App dùng chủ yếu trên điện thoại.
Quy mô người dùng dự kiến khoảng 80 nhân sự.
Mục tiêu app:
- Thi đua nội bộ
- Vinh danh nhân sự
- Chơi game nội bộ
- Tính điểm
- Bảng xếp hạng
- Kết nối nhân sự giữa các khối

Các khối nhân sự:
- Văn phòng
- Cửa hàng
- Kho
- TMĐT
- KDTT

## 2. Tech Stack
Project hiện tại dùng:
- Vite
- React
- TypeScript
- Tailwind CSS

Không được tự thêm:
- Backend
- Database
- AI API
- Auth system
- Package mới

Chỉ thêm các phần trên khi người dùng yêu cầu rõ.

## 3. Design Direction
App phải theo phong cách:
- Mobile-first
- Gaming Arena
- Dark premium
- Cao cấp
- Có năng lượng thi đua
- Không trẻ con
- Không rối
- Không màu mè quá đà

Màu chính:
- Centosy Orange: #E94E1B

Logo:
- Dùng file: public/logo-centosy.png
- Không tự tạo logo mới
- Không đổi màu logo
- Không làm méo logo
- Không dùng logo giả

Cảm giác giao diện:
- Đấu trường nội bộ
- Năng lượng
- Rõ điểm số
- Có vinh danh
- Có cạnh tranh lành mạnh
- Phù hợp nhân sự công ty thật

## 4. Core Navigation
Bottom navigation bắt buộc gồm 5 tab:
- Home
- Games
- Rank
- Honor
- Profile

Không thêm tab mới nếu chưa được yêu cầu.
Không đổi tên tab nếu chưa được yêu cầu.
Không phá bottom navigation.

## 5. Current MVP Screens
App hiện đã có UI MVP gồm:
1. Home Dashboard
2. Game Center
3. Leaderboard
4. Honor Wall
5. Profile
6. Bottom Navigation
7. Mock users

App đã chạy được trên localhost.
UI hiện tại đã có:
- Nền tối
- Màu cam Centosy
- Điểm cá nhân
- Chiến dịch
- Thử thách hôm nay
- Bottom nav

Các phần đang cần polish:
- Logo hơi nhỏ
- Header chưa đủ mạnh
- Font/card cần rõ hơn
- UI cần cảm giác premium/gaming hơn

## 6. Working Rules For Claude Code
Mỗi lần làm việc phải tuân thủ:
- Mỗi prompt chỉ làm 1 bước nhỏ
- Không làm quá xa
- Không thêm backend nếu chưa yêu cầu
- Không gọi AI API
- Không refactor toàn bộ project
- Không phá UI MVP đã chốt
- Không tự đổi phong cách thiết kế
- Không tự thêm tính năng lớn
- Không cài package mới nếu chưa hỏi
- Không làm nhiều step trong một lần

Sau mỗi bước phải báo đúng format:

DONE STEP [step code]

Files changed:
- file 1
- file 2

Notes:
- thay đổi chính

Cách test nhanh:
- hướng dẫn test ngắn

## 7. Game MVP List
Các game MVP đã chọn:
1. Nhìn nhanh đoán đúng
2. Tìm lỗi trong ảnh
3. Ai là người bí ẩn
4. Caption bá đạo
5. Khách hàng khó tính
6. Soi đơn thần tốc
7. Hành động nào đáng vinh danh

Game cần:
- Vui
- Tư duy
- Hài hước
- Công bằng
- Hạn chế dùng ChatGPT để gian lận
- Phù hợp nhân sự Centosy
- Không quá trẻ con
- Không quá phức tạp ở MVP

## 8. First Game: Khách hàng khó tính
Game đầu tiên đang build là: Khách hàng khó tính.

Luật game:
- Người chơi đọc tình huống khách hàng
- Chọn đáp án phù hợp nhất trong 20 giây
- Mỗi lượt có 5 câu
- Dùng cho khối Cửa hàng / TMĐT / KDTT

Cách tính điểm:
- Xuất sắc: 25 điểm
- Chuẩn: 15 điểm
- Tạm được: 5 điểm
- Sai: 0 điểm
- Trả lời dưới 10 giây: +5 điểm

Sau mỗi câu cần có feedback:
- Điểm câu này
- Đáp án tốt nhất
- Giải thích ngắn

Cuối game cần có result screen:
- Tổng điểm
- Danh hiệu
- Chơi lại
- Quay về Game Center

Chưa làm:
- Backend
- Leaderboard thật
- Lưu điểm thật
- Đăng nhập thật

## 9. Game Build Roadmap
Thứ tự triển khai game "Khách hàng khó tính":

STEP 17A — Mock data game Khách hàng khó tính
STEP 17B — Intro screen
STEP 17C — Play screen + timer
STEP 17D — Feedback screen
STEP 17E — Result screen
STEP 17F — Connect Game Center
STEP 17G — QA game

Không được nhảy step nếu chưa cần.
Không được tự làm backend.
Không được tự cập nhật leaderboard thật.

## 10. UI Polish Roadmap
Thứ tự polish UI:

STEP 18A — Polish Header + Logo + App Shell
STEP 18B — Polish Card System + Typography + Spacing
STEP 18C — Polish Home Dashboard
STEP 18D — Polish Game Center
STEP 18E — Polish Leaderboard + Honor Wall
STEP 18F — Polish Bottom Navigation
STEP 18G — QA Mobile UI tổng thể
STEP 18H — Polish Profile Page (next)

Nguyên tắc polish:
- Chỉ polish từng cụm nhỏ
- Không redesign toàn bộ
- Không phá logic
- Không đổi navigation
- Không thêm animation phức tạp
- Không làm giao diện trẻ con
- Ưu tiên mobile readability

## 11. Content Tone
Nội dung trong app nên có tone:
- Vui
- Gần gũi
- Nội bộ
- Hơi hài hước
- Có năng lượng thi đua
- Không công kích cá nhân
- Không tiêu cực
- Không nhạy cảm
- Không quá nghiêm túc kiểu văn bản hành chính

Ví dụ tone đúng:
- "Bậc thầy xử lý khách khó"
- "Chiến binh chăm sóc khách hàng"
- "Tư vấn viên tiềm năng"
- "Cần luyện thêm vài ca khó"

## 12. Important Constraints
Tuyệt đối tránh:
- Tự thêm backend
- Tự thêm login
- Tự thêm database
- Tự gọi OpenAI/Claude/Gemini API
- Tự thay logo
- Tự đổi màu brand
- Tự thêm nhiều route phức tạp
- Tự refactor toàn bộ App.tsx nếu không cần
- Tự xóa UI MVP
- Tự làm nhiều game cùng lúc
- Tự làm leaderboard thật khi chưa yêu cầu
- Không dùng service_role key trong frontend
- Không tự thêm Supabase table ngoài roadmap nếu chưa được yêu cầu
- Không tự tạo signup public cho nhân viên
- Không tự mở quyền đọc toàn bộ profiles cho staff
- Không tự bỏ RLS

## 13. Best Next Action Rule
Khi bắt đầu session mới, Claude Code phải:
1. Đọc PROJECT_MEMORY.md trước.
2. Đọc cấu trúc project hiện tại.
3. Xác định step người dùng yêu cầu.
4. Chỉ làm đúng step đó.
5. Báo DONE STEP sau khi hoàn thành.
6. Không tự mở rộng phạm vi.

## 14. Current Priority
Ưu tiên hiện tại:
1. Hoàn thiện UI mobile-first.
2. Hoàn thiện game "Khách hàng khó tính".
3. Hoàn thiện mock auth nếu đang dở.
4. Nâng cấp sang Supabase Auth thật theo STEP 21A–21G.
5. Sau đó mới làm dữ liệu điểm/game/leaderboard thật.

## 15. Supabase Auth Roadmap

CENTOSY ARENA nâng cấp từ mock auth sang Supabase Auth thật.

Mục tiêu hệ đăng nhập:
- Nhân sự đăng nhập bằng email/mật khẩu do Admin cấp.
- 2 nhóm quyền chính: admin và staff.
- Admin quản lý nhân sự, xem dữ liệu tổng, mở Admin Panel.
- Staff dùng app để chơi game, xem điểm, xem bảng xếp hạng, xem vinh danh và hồ sơ cá nhân.
- App dùng cho khoảng 80 nhân sự Centosy Việt Nam.

Tech định hướng:
- Supabase Auth để đăng nhập.
- Supabase Database để lưu hồ sơ nhân sự.
- Bảng chính: public.profiles.
- Frontend dùng @supabase/supabase-js.
- Env frontend dùng:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

Quy tắc bảo mật bắt buộc:
- Không bao giờ đưa service_role key vào frontend.
- Không hardcode Supabase key thật trong source code.
- Không để secret key trong file commit lên git.
- Chỉ dùng publishable/anon key ở frontend.
- Bật Row Level Security cho bảng public.profiles.
- Role admin/staff phải lấy từ database, không hardcode trong frontend.
- Staff không được thấy Admin Panel.
- User chưa có profile không được làm app crash.

Roadmap triển khai Supabase Auth:
- STEP 21A — Setup Supabase client ✅
- STEP 21B — Create Supabase SQL schema ✅
- STEP 21C — Replace mock auth with Supabase Auth session ✅
- STEP 21D — Update LoginScreen to use real Supabase login ✅
- STEP 21E — Real role-based UI using Supabase profile ✅
- STEP 21F — Admin Panel MVP with Supabase profiles ✅
- STEP 21G — QA Supabase Auth and Role Permission ✅

Ràng buộc khi triển khai:
- Không refactor toàn bộ project.
- Không phá UI MVP.
- Không đổi bottom navigation.
- Không thêm đăng ký tự do cho nhân viên.
- Không tạo user từ frontend ở MVP.
- Không làm leaderboard thật nếu chưa yêu cầu.
- Không làm game score database nếu chưa yêu cầu.
- Mỗi prompt chỉ làm một step nhỏ.

Admin MVP (đã xong):
- Đăng nhập thật.
- Xem ADMIN badge.
- Xem Admin Panel.
- Xem danh sách nhân sự từ profiles.
- Xem tổng số admin/staff.
- Chưa cần tạo/sửa/xóa user ở frontend.

Staff MVP (đã xong):
- Đăng nhập thật.
- Xem NHÂN VIÊN badge.
- Chơi game.
- Xem Home, Games, Rank, Honor, Profile.
- Không thấy Admin Panel.

Known future upgrade (chưa làm):
- Sau khi auth thật ổn mới làm:
  - bảng game_results
  - bảng honor_posts
  - bảng campaigns
  - bảng departments
  - leaderboard thật
  - quản lý điểm thật
  - tạo tài khoản hàng loạt cho 80 nhân sự

End of PROJECT_MEMORY.md.
