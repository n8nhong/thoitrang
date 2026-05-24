import * as fs from 'fs';
let content = fs.readFileSync('api/index.ts', 'utf8');

// Fixing /api/analyze gender injection
content = content.replace(
  `const finalFullBody = (rawFullBody.toLowerCase().includes("vietnam") || rawFullBody.toLowerCase().includes("asian")) ? rawFullBody : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawFullBody}\`;`,
  `const genderPrefix = gender === 'Nam' ? '100% Male subject, handsome Vietnamese man, masculine features, ' : gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman, feminine features, ' : '100% Vietnamese person, ';
    const cleanFullBody = rawFullBody.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman');
    const finalFullBody = genderPrefix + cleanFullBody;`
);

content = content.replace(
  `let finalDetail = (rawDetail.toLowerCase().includes("vietnam") || rawDetail.toLowerCase().includes("asian")) ? rawDetail : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${rawDetail}\`;`,
  `const cleanDetail = rawDetail.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman');
    let finalDetail = genderPrefix + cleanDetail;`
);

content = content.replace(
  `prompt: (dpp.toLowerCase().includes("vietnam") || dpp.toLowerCase().includes("asian")) ? dpp : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${dpp}\``,
  `prompt: genderPrefix + dpp.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman')`
);

// Fixing /api/commentary gender injection
content = content.replace(
  `const finalImprovement = (rawImprovement.toLowerCase().includes("vietnam") || rawImprovement.toLowerCase().includes("asian")) ? rawImprovement : \`100% Vietnamese \${genderText}, East Asian facial features, Vietnamese authentic background, \${rawImprovement}\`;`,
  `const genderPrefix = req.body.gender === 'Nam' ? '100% Male subject, handsome Vietnamese man, masculine features, ' : req.body.gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman, feminine features, ' : '100% Vietnamese person, ';
    const cleanImp = rawImprovement.replace(/vietnamese person/ig, req.body.gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, req.body.gender === 'Nam' ? 'a man' : 'a woman');
    const finalImprovement = genderPrefix + cleanImp;`
);

// Fixing /api/knowledge gender injection
content = content.replace(
  `const genderText = req.body.gender === 'Nam' ? 'man' : req.body.gender === 'Nữ' ? 'woman' : 'person';
    const cleanPrm = dpp.replace(/person/ig, genderText);
    return (cleanPrm.toLowerCase().includes("vietnam") || cleanPrm.toLowerCase().includes("asian")) ? \`Vietnamese \${genderText}, \${cleanPrm}\` : \`100% Vietnamese \${genderText}, East Asian facial features, authentic Vietnamese background, photorealistic photography, \${cleanPrm}\`;`,
  `const genderPrefix = req.body.gender === 'Nam' ? '100% Male subject, handsome Vietnamese man, masculine features, ' : req.body.gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman, feminine features, ' : '100% Vietnamese person, ';
    const cleanPrm = dpp.replace(/vietnamese person/ig, req.body.gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, req.body.gender === 'Nam' ? 'a man' : 'a woman').replace(/person/ig, req.body.gender === 'Nam' ? 'man' : 'woman');
    return genderPrefix + cleanPrm;`
);

fs.writeFileSync('api/index.ts', content);
