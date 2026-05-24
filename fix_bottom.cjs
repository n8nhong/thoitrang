const fs = require('fs');

const restored = fs.readFileSync('restored.tsx', 'utf8').split('\n');
const temp = fs.readFileSync('src/App.tsx.temp', 'utf8').split('\n');

// 1. Cut restored at line 4683 (index 4682)
let newRestored = restored.slice(0, 4682);

// 2. Find Fullscreen Modal in temp
let fsmStartInTemp = -1;
for (let i = 0; i < temp.length; i++) {
  if (temp[i].includes('{/* Fullscreen Modal */}')) {
    fsmStartInTemp = i;
    break;
  }
}

// 3. Slice temp from Fullscreen Modal to end, replacing img/video with MediaDisplay, and update KaraokeText props
let newBottom = temp.slice(fsmStartInTemp).join('\n');
newBottom = newBottom.replace(/<img(.*?)src=\{currentMain\}(.*?)>/g, '<MediaDisplay url={currentMain} className="w-full h-full object-contain pointer-events-none" />');
newBottom = newBottom.replace(/<video(.*?)src=\{currentMain\}(.*?)>/g, '<MediaDisplay url={currentMain} className="w-full h-full object-contain pointer-events-none" />');
newBottom = newBottom.replace(/<img(.*?)src=\{currentThumb\}(.*?)>/g, '<MediaDisplay url={currentThumb} className="w-full h-full object-contain pointer-events-none" />');
newBottom = newBottom.replace(/<video(.*?)src=\{currentThumb\}(.*?)>/g, '<MediaDisplay url={currentThumb} className="w-full h-full object-contain pointer-events-none" />');

// also replace <AnimatePresence> wrappers around viewingImageModal and Fullscreen
newBottom = newBottom.replace(/<AnimatePresence>\s*\{isFullscreen && \(/g, '{isFullscreen && (');
newBottom = newBottom.replace(/}\)\(\)\}\n          <\/motion.div>\n        \)}\n      <\/AnimatePresence>/g, '})()}\n          </motion.div>\n        )}\n');

// the modal animate presence isn't easy to string replace. Let's just keep it simple.
// Just append the whole newBottom.
newRestored.push(newBottom);

fs.writeFileSync('restored2.tsx', newRestored.join('\n'));
console.log('Created restored2.tsx');
