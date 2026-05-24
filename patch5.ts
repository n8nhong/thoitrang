import * as fs from 'fs';

let content = fs.readFileSync('api/index.ts', 'utf8');

const t1 = `1. KỊCH BẢN VIDEO TIKTOK: Nội dung viết như một kịch bản video viral. Mở đầu phải có HOOK GÂY SỐC (3 giây đầu), dẫn dắt cuốn hút, kết bài phải GÂY TÒ MÒ VÀ KÊU GỌI BÌNH LUẬN (ẩn ý, đặt câu hỏi).
2. Bài viết phải rất chi tiết, có cấu trúc rõ ràng.`;

const r1 = `1. KỊCH BẢN VIDEO TIKTOK CẢM XÚC DÀI 1 PHÚT: Nội dung viết như một kịch bản video viral, kịch bản phải TẠO ẤN TƯỢNG MẠNH MẼ, CHẠM ĐẾN TÌNH CẢM, đầy tính nhân văn hoặc thấu hiểu sâu sắc. Nội dung đủ dài cho 1 phút đọc chậm (khoảng 150-250 chữ).
2. Mở đầu (3 giây đầu) phải có HOOK GÂY SỐC hoặc CỰC KỲ THU HÚT, dẫn dắt cuốn hút, kết bài phải GÂY TÒ MÒ VÀ KÊU GỌI BÌNH LUẬN (đặt câu hỏi thấu cảm).`;

content = content.replace(t1, r1);

const t2 = `6. Sinh ra danh sách các cảnh (media) tương ứng để minh họa cho bài viết (TỐI ĐA 4 CẢNH để tránh tạo quá nhiều ảnh). Mỗi cảnh chứa:`;
const r2 = `6. Sinh ra danh sách các cảnh (media) tương ứng để minh họa dọc theo chiều dài bài viết (sinh từ 5 đến 7 cảnh để khớp với 1 phút video). Mỗi cảnh chứa:`;

content = content.replace(t2, r2);

fs.writeFileSync('api/index.ts', content);
