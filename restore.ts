import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx.temp', 'utf8');
fs.writeFileSync('src/App.tsx', content);
