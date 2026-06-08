# P0-04 — Fix TrainingTest localStorage sang Supabase

## Mục tiêu
Chuyển TrainingTest/TrainingProgress từ localStorage sang Supabase thật.

## Prompt Claude Code
```text
Bạn là Senior Supabase Engineer + Training System Engineer + Claude Code Engineer.

NHIỆM VỤ:
Sửa TrainingTest của CENTOSY ARENA để không còn dùng localStorage làm nguồn dữ liệu chính.

MỤC TIÊU:
- Tạo bảng training_lessons, training_tests, training_questions, training_progress, training_test_attempts.
- TrainingLibrary đọc bài học từ Supabase.
- TrainingTest lưu kết quả pass/fail vào Supabase.
- Nếu đạt, cộng điểm an toàn nếu score service/RPC đã có.
- Chống cộng điểm trùng.

TẠO FILE:
- supabase/training_progress_schema.sql
- supabase/seed_training_initial.sql
- src/services/trainingService.ts

KHÔNG:
- Không refactor toàn bộ project.
- Không deploy/push.
- Không tự chạy SQL production.
- Không xóa localStorage fallback nếu DB chưa sẵn sàng, nhưng không dùng làm nguồn chính.

TEST:
1. TrainingLibrary đọc lesson từ Supabase.
2. User mở lesson → progress in_progress.
3. Hoàn thành lesson → completed.
4. Làm test đạt → attempt passed.
5. Làm lại không cộng điểm trùng.
6. Clear cache không mất progress.
7. Build OK.

Output:
A. File SQL đã tạo
B. File seed đã tạo
C. File code đã sửa/tạo
D. Training còn dùng localStorage ở đâu không
E. Cách chạy SQL
F. Build result
G. DONE P0-04 FIX TRAINING SUPABASE
```
