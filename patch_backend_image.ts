import * as fs from 'fs';

let content = fs.readFileSync('api/index.ts', 'utf8');

// Fix /api/analyze image handling
content = content.replace(
  `if (image) {
      const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
      parts.push({ inlineData: { mimeType, data: image.split(',')[1] } });
    }`,
  `if (image) {
      if (image.startsWith('data:')) {
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
        // Note: Gemini vision supports images and mp4. 
        parts.push({ inlineData: { mimeType, data: image.split(',')[1] } });
      } else {
        parts.push({ text: \`\\nPhân tích chủ thể và trang phục từ URL/Nguồn này: \${image}\` });
      }
    }`
);

// Fix /api/commentary image handling
content = content.replace(
  `const parts: any[] = [
      { text: \`Hãy bình luận về trang phục trong ảnh này và đề xuất cải thiện. 
      6. COLORS: Liệt kê màu sắc đang mặc trong ảnh (vd: Áo: Xanh, Quần: Đen).
      Yêu cầu JSON trả về không thêm bất kỳ văn bản nào ngoài JSON:
      {
        "analysis": "Phân tích Ưu điểm, Khuyết điểm cực kỳ tự nhiên, dân dã, không dùng tiếng Anh",
        "improvementPrompt": "Prompt tiếng Anh mô tả đồ mới: Vietnamese person, East Asian facial features, authentic Vietnamese background, High quality fashion illustration, realistic photography, photorealistic, keep person likeness 100%, 8k, highly detailed",
        "colors": [{"name": "Màu sắc kèm vị trí", "hex": "#code", "material": "Chất liệu"}],
        "affiliate_links": [
          { "name": "Tên sản phẩm", "link": "Link đầy đủ", "label": "Nguồn hoặc để trống" }
        ]
      }\` },
      { inlineData: { mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg', data: image.split(',')[1] } }
    ];`,
  `const textPrompt = \`Hãy bình luận về trang phục trong nội dung/hình ảnh/video này và đề xuất cải thiện. 
      6. COLORS: Liệt kê màu sắc đang mặc trong nội dung (vd: Áo: Xanh, Quần: Đen).
      Yêu cầu JSON trả về không thêm bất kỳ văn bản nào ngoài JSON:
      {
        "analysis": "Phân tích Ưu điểm, Khuyết điểm cực kỳ tự nhiên, dân dã, không dùng tiếng Anh",
        "improvementPrompt": "Prompt tiếng Anh mô tả đồ mới: Vietnamese person, East Asian facial features, authentic Vietnamese background, High quality fashion illustration, realistic photography, photorealistic, keep person likeness 100%, 8k, highly detailed",
        "colors": [{"name": "Màu sắc kèm vị trí", "hex": "#code", "material": "Chất liệu"}],
        "affiliate_links": [
          { "name": "Tên sản phẩm", "link": "Link đầy đủ", "label": "Nguồn hoặc để trống" }
        ]
      }\`;

    const parts: any[] = [{ text: textPrompt }];
    if (image?.startsWith('data:')) {
      parts.push({ inlineData: { mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg', data: image.split(',')[1] } });
    } else if (image) {
      parts.push({ text: \`\\nNguồn tài liệu: \${image}\` });
    }`
);

fs.writeFileSync('api/index.ts', content);
