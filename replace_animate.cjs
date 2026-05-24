const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t = `                       {currentMain ? (
                         <>
                           <AnimatePresence initial={false}>
                             <motion.div 
                               key={\`anim-\${currentMain}\`}`;
const rep = `                       {currentMain ? (
                         <>
                             <motion.div 
                               key={\`anim-\${currentMain}\`}`;

const tEnd = `                             </motion.div>
                           </AnimatePresence>
                           <WatermarkHider />`;
const repEnd = `                             </motion.div>
                           <WatermarkHider />`;

if (code.includes(t) && code.includes(tEnd)) {
  code = code.replace(t, rep).replace(tEnd, repEnd);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched AnimatePresence for currentMain");
} else {
  console.log("Failed to patch AnimatePresence");
}
