# P0-05 — Fix Reward Shop mock sang Supabase

## Mục tiêu
Chuyển Reward Shop từ mock data sang Supabase thật: reward_items, reward_redemptions, admin approve/reject.

## Prompt Claude Code
```text
Bạn là Senior Supabase Engineer + Reward System Engineer + Claude Code Engineer.

NHIỆM VỤ:
Sửa Reward Shop của CENTOSY ARENA để không còn dùng mock data làm nguồn chính.

MỤC TIÊU:
- Tạo bảng reward_items và reward_redemptions.
- RewardShop đọc quà từ Supabase.
- User gửi yêu cầu đổi quà → pending.
- Admin/director duyệt/từ chối/đánh dấu đã trao.
- Không tự trừ điểm nếu chưa có RPC an toàn.
- Chặn user không đủ điểm, item hết hàng, request trùng pending.

TẠO FILE:
- supabase/reward_shop_schema.sql
- supabase/seed_reward_items_initial.sql
- src/services/rewardService.ts

KHÔNG:
- Không refactor.
- Không deploy/push.
- Không tự chạy SQL production.
- Không thanh toán thật.
- Không tự trừ điểm rủi ro.

TEST:
1. RewardShop đọc item từ Supabase.
2. User đủ điểm gửi request.
3. User không đủ điểm bị chặn.
4. Item hết hàng bị chặn.
5. Pending request trùng bị chặn.
6. Admin approve/reject được.
7. Clear cache không mất lịch sử.
8. Build OK.

Output:
A. File SQL đã tạo
B. File seed đã tạo
C. File code đã sửa/tạo
D. Reward Shop còn mock ở đâu không
E. Có trừ điểm thật chưa hay cần RPC
F. Build result
G. DONE P0-05 FIX REWARD SHOP SUPABASE
```
