const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /[ \t]*exit=\{[\s\S]*?globalWordStyleConfig\?.imageTransition === 'fade' \? \{ opacity: 0 \} :[\s\S]*?\{ opacity: 0 \}[\s\S]*?\}/g;

let matched = false;
code = code.replace(regex, (match) => {
    matched = true;
    return "";
});

if (matched) {
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched exit block");
} else {
    console.log("Failed to patch exit block");
}
