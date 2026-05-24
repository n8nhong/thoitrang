import * as fs from 'fs';

let content = fs.readFileSync('api/index.ts', 'utf8');

const t1 = `  QUY TẮC TẠO PROMPT DALL-E (Tiếng Anh):
 - ĐẶC BIỆT QUAN TRỌNG: Chèn cụm từ "Vietnamese person, East Asian facial features, authentic Vietnamese background" vào TẤT CẢ các prompt để model tạo ra người giống người Việt Nam nhất.
 - Thêm "human anatomy correct", "5 fingers per hand", "photorealistic", "8k resolution".`;

const r1 = `  QUY TẮC TẠO PROMPT DALL-E (Tiếng Anh):
 - ĐẶC BIỆT QUAN TRỌNG: Dựa vào "Giới tính" của khách, chèn cụm từ "Vietnamese \${gender === 'Nam' ? 'man' : gender === 'Nữ' ? 'woman' : 'person'}, East Asian facial features, authentic Vietnamese background" vào TẤT CẢ các prompt để model tạo ra ĐÚNG GIỚI TÍNH và giống người Việt Nam nhất. Không được nhầm lẫn Nam và Nữ!
 - Thêm "human anatomy correct", "5 fingers per hand", "photorealistic", "8k resolution".`;

content = content.replace(t1, r1);

// Also replace finalFullBody in index.ts
const t2 = `    const finalFullBody = (rawFullBody.toLowerCase().includes("vietnam") || rawFullBody.toLowerCase().includes("asian")) ? rawFullBody : \`100% Vietnamese person, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawFullBody}\`;`;

const r2 = `    const genderText = gender === 'Nam' ? 'man' : gender === 'Nữ' ? 'woman' : 'person';
    const finalFullBody = (rawFullBody.toLowerCase().includes("vietnam") || rawFullBody.toLowerCase().includes("asian")) ? rawFullBody : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawFullBody}\`;`;

content = content.replace(t2, r2);

// Also replace finalDetail
const t3 = `    let finalDetail = (rawDetail.toLowerCase().includes("vietnam") || rawDetail.toLowerCase().includes("asian")) ? rawDetail : \`100% Vietnamese person, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawDetail}\`;`;

const r3 = `    let finalDetail = (rawDetail.toLowerCase().includes("vietnam") || rawDetail.toLowerCase().includes("asian")) ? rawDetail : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawDetail}\`;`;

content = content.replace(t3, r3);

fs.writeFileSync('api/index.ts', content);
