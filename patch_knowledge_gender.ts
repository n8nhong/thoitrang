import * as fs from 'fs';

let contentApp = fs.readFileSync('src/App.tsx', 'utf8');
contentApp = contentApp.replace(
  `query: knowledgeQuery,
          affiliateContext: getAffiliateContext()`,
  `query: knowledgeQuery,
          gender,
          affiliateContext: getAffiliateContext()`
);
fs.writeFileSync('src/App.tsx', contentApp);

let contentApi = fs.readFileSync('api/index.ts', 'utf8');
contentApi = contentApi.replace(
  `const { query, affiliateContext } = req.body;`,
  `const { query, affiliateContext, gender } = req.body;`
);

contentApi = contentApi.replace(
  `- "keywords": Danh sách từ khóa (Tiếng Anh) ngắn gọn để dùng làm prompt tạo ảnh minh họa (ví dụ: "men white shirt elegant", "women wearing dress").`,
  `- "keywords": Danh sách từ khóa (Tiếng Anh) ngắn gọn để dùng làm prompt tạo ảnh minh họa. CHÚ Ý SIÊU QUAN TRỌNG: Người dùng giới tính \${gender}, HÃY BẮT BUỘC chèn từ khóa: "\${gender === 'Nam' ? '100% Male subject, handsome Vietnamese man' : gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman' : '100% Vietnamese person'}" vào tất cả các mảng keywords để xuất ảnh đúng giới tính.`
);

fs.writeFileSync('api/index.ts', contentApi);
