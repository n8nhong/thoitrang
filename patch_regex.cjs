const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /[ \\t]*exit=\\{[\\s\\S]*?(?=[ \\t]*transition=\\{\\{ duration:)/;
if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched via regex!");
} else {
    console.log("Regex not matched!");
}
