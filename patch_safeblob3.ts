import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/match\(\/\\\.\(mp4\|webm\)\(\\\?\.\*\)\?\\\$\/i\)/g, "match(/\\.(mp4|webm|mov)($|\\?|#)|#ext=\\.(mp4|webm)/i)");

fs.writeFileSync('src/App.tsx', content);
