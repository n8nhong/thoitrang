const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t = `                                }
                                exit={
                                  globalWordStyleConfig?.imageTransition === 'slide_left' ? { opacity: 0, x: 100 } :
                                  globalWordStyleConfig?.imageTransition === 'slide_right' ? { opacity: 0, x: -100 } :
                                  globalWordStyleConfig?.imageTransition === 'zoom_in' ? { opacity: 0, scale: 1.2 } :
                                  globalWordStyleConfig?.imageTransition === 'zoom_out' ? { opacity: 0, scale: 0.8 } :
                                  globalWordStyleConfig?.imageTransition === 'blur' ? { opacity: 0, filter: 'blur(20px)' } :
                                  globalWordStyleConfig?.imageTransition === 'pull_in' ? { opacity: 0, scale: 0 } :
                                  globalWordStyleConfig?.imageTransition === 'spin_blur' ? { opacity: 0, rotate: -45, filter: 'blur(30px)', scale: 2 } :
                                  globalWordStyleConfig?.imageTransition === 'glitch_cut' ? { opacity: 0, x: -50, filter: 'invert(100%)' } :
                                  globalWordStyleConfig?.imageTransition === 'fade' ? { opacity: 0 } :
                                  { opacity: 0 }
                                }
                                transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}
                                className="absolute inset-0 z-0 cursor-pointer overflow-hidden rounded-xl"`;

const rep = `                                }
                                transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}
                                className="absolute inset-0 z-0 cursor-pointer overflow-hidden rounded-xl"`;

if (code.includes(t)) {
  code = code.replace(t, rep);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched exit successfully.");
} else {
  console.log("Failed to patch exit prop using exact match.");
  // Try simpler
  const index = code.indexOf('exit={\n                                  globalWordStyleConfig?.imageTransition');
  if (index !== -1) {
    const nextTrans = code.indexOf('transition={{', index);
    if (nextTrans !== -1) {
      code = code.slice(0, index) + code.slice(nextTrans);
      fs.writeFileSync('src/App.tsx', code);
      console.log("Patched exit using substring slice.");
    }
  }
}
