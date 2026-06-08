# AUDIT — Speed Scoring Fairness

## Vai trò
Bạn là Senior Game Fairness Auditor + Anti-Cheat Engineer + Claude Code Engineer.

## Nhiệm vụ
Audit riêng công thức điểm nhanh/chậm trong game để đảm bảo công bằng.

## Yêu cầu
- Chỉ audit.
- Không sửa code.
- Không refactor.
- Không deploy.
- Không push.
- Không cài package.

## Cần kiểm tra
1. response_time_ms được tính từ đâu?
2. Thời gian bắt đầu câu hỏi có rõ không?
3. Mỗi câu có bị trả lời nhiều lần không?
4. Công thức score hiện tại là gì?
5. Sai có được điểm tốc độ không?
6. Đúng chậm có vẫn được base score không?
7. response_time_ms < 300ms có bị đánh dấu suspicious không?
8. Leaderboard có tie-break theo correct_count + average_response_time chưa?

## Công thức khuyến nghị
- Sai: 0 điểm.
- Đúng: base 10 điểm.
- Speed bonus tối đa 10 điểm.
- Speed bonus chỉ tính nếu is_correct = true.
- <= 3 giây: +10
- <= 6 giây: +7
- <= 10 giây: +5
- <= 15 giây: +2
- > 15 giây: +0

## Output
A. Công thức điểm hiện tại  
B. Điểm công bằng  
C. Điểm dễ bất công  
D. Có đang tính đúng nhanh điểm cao hơn chưa  
E. Đề xuất sửa  
F. DONE SPEED SCORING FAIRNESS AUDIT
