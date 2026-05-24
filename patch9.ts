import * as fs from 'fs';

let content = fs.readFileSync('api/index.ts', 'utf8');

const t1 = /\`100% Vietnamese \$\{genderText\}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \$\{rawFullBody\}\`/g.source.replace(/\\/g, '');

const r1 = "\`Vertical 9:16 aspect ratio (1080x1920) for TikTok: 100% Vietnamese ${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, ${rawFullBody}\`";

content = content.replace(new RegExp(t1, 'g'), r1);

const t2 = /\`100% Vietnamese \$\{genderText\}, East Asian facial features, Vietnamese authentic background, \$\{rawImprovement\}\`/g.source.replace(/\\/g, '');

const r2 = "\`Vertical 9:16 aspect ratio (1080x1920) for TikTok: 100% Vietnamese ${genderText}, East Asian facial features, Vietnamese authentic background, ${rawImprovement}\`";

content = content.replace(new RegExp(t2, 'g'), r2);

const t3 = /\`100% Vietnamese \$\{genderText\}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \$\{dpp\}\`/g.source.replace(/\\/g, '');

const r3 = "\`Vertical 9:16 aspect ratio (1080x1920) for TikTok: 100% Vietnamese ${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, ${dpp}\`";

content = content.replace(new RegExp(t3, 'g'), r3);

const t4 = /\`100% Vietnamese \$\{genderText\}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \$\{rawDetail\}\`/g.source.replace(/\\/g, '');

const r4 = "\`Vertical 9:16 aspect ratio (1080x1920) for TikTok: 100% Vietnamese ${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, ${rawDetail}\`";

content = content.replace(new RegExp(t4, 'g'), r4);

fs.writeFileSync('api/index.ts', content);
