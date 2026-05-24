const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/\\r\\n/g, '\\n');

const startIndex = code.indexOf('                                exit={');
if (startIndex !== -1) {
  const endIndex = code.indexOf('                                transition={{ duration:', startIndex);
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched correctly with regex/index!");
  } else {
    console.log("Failed to find endIndex.");
  }
} else {
  console.log("Failed to find startIndex.");
}
