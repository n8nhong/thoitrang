const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const t = `                                animate={
                                  globalWordStyleConfig?.imageTransition === 'glitch_cut' 
                                  ? { opacity: [0, 1, 0, 1], x: [50, -20, 10, 0], filter: ['hue-rotate(90deg)', 'hue-rotate(-90deg)', 'blur(5px)', 'blur(0px)'] } 
                                  : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', rotate: 0 }
                                }
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
                                transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}`;

const rep = `                                animate={
                                  globalWordStyleConfig?.imageTransition === 'glitch_cut' 
                                  ? { opacity: [0, 1, 0, 1], x: [50, -20, 10, 0], filter: ['hue-rotate(90deg)', 'hue-rotate(-90deg)', 'blur(5px)', 'blur(0px)'] } 
                                  : { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', rotate: 0 }
                                }
                                transition={{ duration: globalWordStyleConfig?.transitionDuration || 0.5, ease: 'easeInOut' }}`;

if (code.includes(t)) {
  code = code.replace(t, rep);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched exit prop successfully.");
} else {
  console.log("Failed to patch exit prop.");
}
