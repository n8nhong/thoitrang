const fs = require('fs');

const appRaw = fs.readFileSync('src/App.tsx', 'utf8');
const tempRaw = fs.readFileSync('src/App.tsx.temp', 'utf8');

const appLines = appRaw.split('\n');
const tempLines = tempRaw.split('\n');

// Find the line in App.tsx before the broken stitch
// It ends with: `wordStyleConfig.transition === 'flash' ? { opacity: 0, filter: 'brightness(3)' } :`
let appStitchStart = -1;
for (let i = 0; i < appLines.length; i++) {
  if (appLines[i].includes("wordStyleConfig.transition === 'flash'")) {
    appStitchStart = i + 1; // plus { opacity: 0, scale: 0.95 } and }
    break;
  }
}

// Find the line in App.tsx after the broken stitch
// It begins with: `transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}`
let appStitchEnd = -1;
for (let i = appStitchStart; i < appLines.length; i++) {
  if (appLines[i].includes("transition={{ duration: globalWordStyleConfig?.transitionDuration")) {
    appStitchEnd = i - 1; // back up to the line with ` }`
    break;
  }
}

console.log("App stitch starts after line", appStitchStart, "and ends before line", appStitchEnd);
console.log("App snippet:");
for (let i = appStitchStart - 2; i <= appStitchEnd + 2; i++) {
    if (appLines[i] !== undefined)
        console.log(`${i}: ${appLines[i]}`);
}

// In tempLines, find the corresponding start and end lines.
// Temp start line comes right after: `wordStyleConfig.transition === 'flash' ? { opacity: 0, filter: 'brightness(3)' } :`
// Temp end line comes right before: `transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}`
// Actually wait! In Temp, `globalWordStyleConfig` might not exist or might be structured differently!
let tempStitchStart = -1;
for (let i = 0; i < tempLines.length; i++) {
  if (tempLines[i].includes("wordStyleConfig.transition === 'flash'")) {
    tempStitchStart = i + 1;
    break;
  }
}

let tempStitchEnd = -1;
for (let i = tempLines.length - 1; i >= 0; i--) {
  if (tempLines[i].includes("globalWordStyleConfig?.transitionDuration")) {
    tempStitchEnd = i - 1;
    break;
  }
}
if (tempStitchEnd === -1) {
    // maybe it doesn't have globalWordStyleConfig?
    for (let i = tempLines.length - 1; i >= 0; i--) {
      // Look for the Fullscreen Modal rendering
      if (tempLines[i].includes("className=\"absolute inset-0 z-0 cursor-pointer overflow-hidden rounded-xl\"")) {
         tempStitchEnd = i - 2; // Roughly around `exit={..}`
         break;
      }
    }
}

console.log("Temp stitch starts after line", tempStitchStart, "and ends before line", tempStitchEnd);
console.log("Temp start snippet:");
for (let i = tempStitchStart - 2; i <= tempStitchStart + 5; i++) {
    if (tempLines[i] !== undefined)
        console.log(`${i}: ${tempLines[i]}`);
}

console.log("Temp end snippet:");
for (let i = tempStitchEnd - 5; i <= tempStitchEnd + 2; i++) {
    if (tempLines[i] !== undefined)
        console.log(`${i}: ${tempLines[i]}`);
}
