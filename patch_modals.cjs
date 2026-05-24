const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Function to remove AnimatePresence from a specific Modal
function stripAnimatePresenceAndExit(code, startTrigger, modalCondition) {
  const anPresStartRegex = /<AnimatePresence>\s*\{([^]*?)&&\s*\(\s*<motion\.div /; 
  // Wait, let's just use string replace for the specific blocks.
  return code;
}

// Manually replace viewingImageModal's AnimatePresence
code = code.replace(
  /<AnimatePresence>\s*\{viewingImageModal && \(/g,
  "{viewingImageModal && ("
);

// Manually replace isFullscreen's AnimatePresence
code = code.replace(
  /<AnimatePresence>\s*\{isFullscreen && \(/g,
  "{isFullscreen && ("
);

// We need to remove the closing </AnimatePresence> tag that comes after these blocks
// Let's find viewingImageModal, go down, and remove the first AnimatePresence closing tag.
let vIndex = code.indexOf('{viewingImageModal && (');
if (vIndex !== -1) {
    let nextClose = code.indexOf('</AnimatePresence>', vIndex);
    if (nextClose !== -1) {
        let before = code.substring(0, nextClose);
        let after = code.substring(nextClose + '</AnimatePresence>'.length);
        code = before + after;
    }
}

let fIndex = code.indexOf('{isFullscreen && (');
if (fIndex !== -1) {
    let nextClose = code.indexOf('</AnimatePresence>', fIndex);
    if (nextClose !== -1) {
        let before = code.substring(0, nextClose);
        let after = code.substring(nextClose + '</AnimatePresence>'.length);
        code = before + after;
    }
}


fs.writeFileSync('src/App.tsx', code);
console.log("Patched AnimatePresence for modals");
