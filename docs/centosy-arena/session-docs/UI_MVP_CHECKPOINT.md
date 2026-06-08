# CENTOSY ARENA — UI MVP CHECKPOINT
_Chốt phiên bản: 05/06/2026_
_Trạng thái: ✅ UI MVP Mobile hoàn chỉnh — KHÔNG SỬA LOẠN_

---

## ⚠️ NGUYÊN TẮC BẮT BUỘC CHO MỌI BƯỚC SAU

> Checkpoint này được tạo để bảo vệ nền giao diện đã chốt.
> Bất kỳ bước nào sau STEP 14 **phải** tuân theo các quy tắc dưới đây.

| Quy tắc | Mô tả |
|---|---|
| 🔒 Không phá layout chính | `Header`, `BottomNav`, `Layout` chỉ sửa khi có yêu cầu rõ ràng |
| 🎨 Không đổi màu thương hiệu | Màu chính `#E94E1B`, nền `#080808`/`#111111` — giữ nguyên |
| 🧭 Không đổi bottom navigation | 5 tab Home/Games/Rank/Honor/Profile — không thêm/bớt/đổi tên |
| 📁 Không xóa file đã chốt | Các file trong danh sách dưới không được xóa khi chưa được phép |
| 🎮 Không refactor toàn app | Khi build game logic chỉ thêm file mới, không viết lại toàn bộ |
| 🔗 Không kết nối backend | Chưa có backend — mọi data vẫn là mock |
| 📐 Mobile-first | Mọi màn mới phải ưu tiên hiển thị trên điện thoại trước |

---

## ✅ CÁC MÀN ĐÃ CHỐT

### 1. Home Dashboard — `src/pages/HomePage.tsx`
**Trạng thái:** ✅ CHỐT

Thành phần đã chốt:
- Lời chào cá nhân (avatar + tên + role + khối)
- Card điểm cá nhân + điểm tăng hôm nay
- Hạng tuần (vòng tròn glow cam)
- Card chiến dịch + progress bar + nút tham gia
- 3 thử thách hôm nay
- Mini leaderboard top 5
- 2 vinh danh mới nhất

---

### 2. Game Center — `src/pages/GamesPage.tsx`
**Trạng thái:** ✅ CHỐT (layout + cards)

Thành phần đã chốt:
- 7 game cards với gradient header
- Filter 6 nhóm scroll ngang
- Nhãn "Khó dùng AI"
- Nút "Bắt đầu" + "Xem luật"
- Bottom sheet modal xem luật

> ⚠️ Game logic chưa làm — sẽ thêm vào bên trong từng card, không phá layout

---

### 3. Leaderboard — `src/pages/RankPage.tsx`
**Trạng thái:** ✅ CHỐT

Thành phần đã chốt:
- Podium top 3 (vàng/bạc/đồng, cột cao thấp)
- Top 1 glow cam
- List rank 4+ dạng row
- Highlight "Bạn" màu cam
- Filter 6 nhóm (Toàn công ty + 5 khối)

---

### 4. Honor Wall — `src/pages/HonorPage.tsx`
**Trạng thái:** ✅ CHỐT

Thành phần đã chốt:
- Stats strip 3 ô
- Featured card lớn (ribbon "Hôm nay")
- Filter 6 nhóm
- List vinh danh (border-left màu badge)
- Expand/collapse lý do
- Nút "Xem tất cả"

---

### 5. Profile — `src/pages/ProfilePage.tsx`
**Trạng thái:** ✅ CHỐT

Thành phần đã chốt:
- Hero card: avatar glow + tên + role + stats 3 ô
- Grid huy hiệu 4 cột + ô khoá
- Thành tích gần đây
- Lịch sử game
- Nút đăng xuất mock + bottom sheet

---

## 🎨 STYLE ĐÃ CHỐT

### Màu sắc (`tailwind.config.js`)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `brand` | `#E94E1B` | Button, badge, highlight, active tab |
| `brand-hover` | `#FF5E28` | Hover state |
| `brand-muted` | `#E94E1B33` | Glow border, badge background |
| `arena-bg` | `#080808` | Nền toàn app |
| `arena-surface` | `#111111` | Header, BottomNav |
| `arena-card` | `#181818` | Card background |
| `arena-border` | `#2A2A2A` | Viền card |

### Shadow
| Token | Giá trị |
|---|---|
| `shadow-glow` | `0 0 12px rgba(233,78,27,0.35)` |
| `shadow-glow-sm` | `0 0 6px rgba(233,78,27,0.25)` |

### Component classes (`src/index.css`)
| Class | Dùng cho |
|---|---|
| `.arena-card` | Card tiêu chuẩn |
| `.arena-card-glow` | Card nổi bật |
| `.btn-primary` | Nút cam chính |
| `.btn-secondary` | Nút viền cam |
| `.badge-brand` | Badge cam |
| `.badge-gray` | Badge xám |
| `.section-title` | Tiêu đề section |
| `.section-title-brand` | Tiêu đề cam |

### Layout
- **Mobile-first:** `max-w-md mx-auto`
- **Header:** `fixed top-0`, `h-14`
- **Content:** `pt-14 pb-20 px-4`
- **BottomNav:** `fixed bottom-0`, `h-16`

---

## 📁 FILE KHÔNG ĐƯỢC SỬA / XÓA KHI CHƯA ĐƯỢC PHÉP

```
src/components/Header.tsx       ← Layout cố định
src/components/BottomNav.tsx    ← Navigation cố định
src/components/Layout.tsx       ← Khung bố cục
src/index.css                   ← Design tokens
tailwind.config.js              ← Brand colors
public/logo-centosy.png         ← Logo chính thức
```

---

## 📁 FILE CÓ THỂ MỞ RỘNG (không phá cũ)

```
src/pages/*.tsx         ← Thêm section mới bên trong
src/data/mock*.ts       ← Thêm data mới
src/components/         ← Thêm component mới
src/pages/              ← Thêm trang mới (Login, Members, Admin, IdeaBank)
```

---

## 🔧 GIT CHECKPOINT (chưa chạy — project chưa init git)

Project hiện **chưa có git repository**. Khi muốn tạo checkpoint, chạy các lệnh sau:

```bash
# Bước 1: Init git
git init

# Bước 2: Stage toàn bộ
git add .

# Bước 3: Commit checkpoint
git commit -m "feat: UI MVP mobile checkpoint — Home, Games, Rank, Honor, Profile"

# Bước 4 (tuỳ chọn): Tạo tag version
git tag v0.1.0-ui-mvp
```

> ⚠️ Chờ xác nhận trước khi chạy — không tự động thực hiện.

---

## 📋 MÀN CÒN THIẾU (chưa build)

| Màn | Ưu tiên | Ghi chú |
|---|---|---|
| Login mock | 🔴 Cao | Chọn user khi vào app |
| Members list | 🟡 Trung | Danh sách 80 nhân sự |
| Admin panel | 🟡 Trung | Quản lý điểm, duyệt task |
| Idea Bank | 🟡 Trung | Gửi ý tưởng cải tiến |
| Game logic | 🟢 Sau | Build từng game riêng |

---

_Checkpoint tạo sau STEP 13 — Project Status Report_
_Không sửa file này trừ khi có thay đổi lớn về phạm vi dự án_
