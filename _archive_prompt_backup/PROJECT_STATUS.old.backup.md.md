# CENTOSY ARENA — PROJECT STATUS
_Cập nhật: 05/06/2026 — Tài liệu bàn giao cho phiên Claude Code mới_

---

## STACK
- Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3
- Chạy: `npm run dev` → `http://localhost:5173`
- Thư mục: `F:\CLAUDE CODE HÓA\`
- Node.js đã cài: v20.19.2

---

## CHỨC NĂNG ĐÃ HOÀN THÀNH

| Màn hình | Trạng thái | Ghi chú |
|---|---|---|
| Home Dashboard | ✅ Hoàn chỉnh | Điểm, hạng, chiến dịch, thử thách, top 5, vinh danh |
| Game Center | ✅ Hoàn chỉnh | 7 game cards, filter 6 nhóm, modal luật chơi |
| Leaderboard | ✅ Hoàn chỉnh | Podium top 3, list rank 4+, filter 6 nhóm |
| Honor Wall | ✅ Hoàn chỉnh | Featured card, filter, expand/collapse, xem tất cả |
| Profile | ✅ Hoàn chỉnh | Avatar, điểm, huy hiệu, lịch sử game, đăng xuất mock |
| Game Intro: Khách hàng khó tính | ✅ Hoàn chỉnh | Màn giới thiệu game, bảng điểm, nút bắt đầu |

---

## CÁC FILE CHÍNH

```
src/
├── App.tsx                          ← Tab routing (useState)
├── index.css                        ← Tailwind + component classes
├── components/
│   ├── Header.tsx                   ← Logo + bell, fixed top
│   ├── BottomNav.tsx                ← 5 tab navigation, fixed bottom
│   ├── Layout.tsx                   ← Phone frame 430px, centered
│   └── games/
│       └── DifficultCustomerIntro.tsx ← Màn intro game g05
├── pages/
│   ├── HomePage.tsx
│   ├── GamesPage.tsx                ← Đã wire nút Bắt đầu game g05
│   ├── RankPage.tsx
│   ├── HonorPage.tsx
│   └── ProfilePage.tsx
└── data/
    ├── mockUsers.ts                 ← 30 users, 5 khối
    ├── mockGames.ts                 ← 7 game definitions (g01–g07)
    ├── mockHonors.ts                ← 8 honor records
    ├── mockCampaigns.ts             ← 2 campaigns, 3 challenges
    ├── mockProfile.ts               ← Game history, achievements
    └── mockDifficultCustomer.ts     ← 10 tình huống game g05

public/
├── logo-centosy.png                 ← Logo chính thức
└── design-reference.png             ← Ảnh tham chiếu UI
```

---

## LỖI CÒN TỒN TẠI

| Lỗi | Mức độ | Ghi chú |
|---|---|---|
| Bottom nav bị khuất khi browser thấp | Thấp | Dùng `absolute` thay vì `fixed` trong Layout |
| Avatar dùng DiceBear API | Thấp | Cần internet, offline sẽ broken |
| Không có error boundary | Thấp | App crash toàn màn nếu có exception |
| Game g05 bấm "Bắt đầu ngay" chưa có màn chơi | Trung bình | Cần làm STEP 17C |

---

## CÁC NÚT / CHỨC NĂNG ĐÃ CÓ UI NHƯNG CHƯA CÓ LOGIC

- Nút "Tham gia ngay →" (chiến dịch) → chưa làm gì
- Nút "Bắt đầu →" của 6 game còn lại (g01-g04, g06, g07) → chưa làm gì
- Nút "Xem tất cả →" leaderboard → chưa làm gì
- Nút đăng xuất mock → đóng sheet, không thực sự logout

---

## TUYỆT ĐỐI KHÔNG SỬA LẠI

- `src/components/Header.tsx` — layout đã chốt
- `src/components/BottomNav.tsx` — 5 tab, không thêm/bớt
- `src/components/Layout.tsx` — phone frame 430px
- `src/index.css` — design tokens
- `tailwind.config.js` — brand colors #E94E1B
- `public/logo-centosy.png` — logo chính thức
- Màu thương hiệu: `#E94E1B` (cam), `#080808` (nền)

---

## VIỆC CẦN LÀM TIẾP — THEO THỨ TỰ ƯU TIÊN

### 🔴 Ưu tiên cao
1. **STEP 17C** — Màn chơi game "Khách hàng khó tính"
   - Hiện tình huống 1/5
   - 4 lựa chọn A/B/C/D dạng button
   - Countdown 20 giây mỗi câu (có thể dùng `useEffect + setInterval`)
   - Sau khi chọn: show kết quả + giải thích
   - Sau 5 câu: màn kết quả tổng điểm

2. **STEP 17D** — Màn kết quả game
   - Tổng điểm đạt được / 125
   - Xếp loại (Xuất sắc / Tốt / Cần cải thiện)
   - Nút chơi lại / Quay về Game Center

### 🟡 Ưu tiên trung bình
3. **STEP 18** — Màn Login mock
   - Cho phép chọn user từ danh sách 30 người
   - Lưu vào `localStorage` (mock session)
   - Sau login → vào Home Dashboard

4. **STEP 19** — Members list
   - Danh sách 80 nhân sự (dùng mockUsers)
   - Filter theo khối
   - Xem profile cơ bản

### 🟢 Ưu tiên thấp
5. **STEP 20** — Idea Bank (gửi ý tưởng nội bộ)
6. **STEP 21** — Admin panel (mock)
7. **STEP 22** — Fix bottom nav `absolute` → `fixed` (sau khi layout ổn định)

---

## QUY TẮC LÀM VIỆC (nhắc lại)

- Mỗi bước chỉ làm 1 tính năng
- Không thêm backend
- Không thêm thư viện UI mới
- Không refactor toàn bộ app
- Chỉ dùng mock data
- Mobile-first, màu #E94E1B
- Kết thúc mỗi bước: `DONE STEP [số] — [tên]`
