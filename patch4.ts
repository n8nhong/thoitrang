import * as fs from 'fs';
let content = fs.readFileSync('api/index.ts', 'utf8');

content = content.replace(
  /\`100\% Vietnamese person, East Asian facial features, authentic Vietnamese background, photorealistic photography, \$\{dpp\}\`/g,
  /\`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${dpp}\`/g.source.replace(/\\/g, '')
);

content = content.replace(
  /\`100\% Vietnamese person, East Asian facial features, Vietnamese authentic background, \$\{rawImprovement\}\`/g,
  /\`100% Vietnamese \${genderText}, East Asian facial features, Vietnamese authentic background, \${rawImprovement}\`/g.source.replace(/\\/g, '')
);

fs.writeFileSync('api/index.ts', content);
