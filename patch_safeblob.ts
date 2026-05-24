import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace URL.createObjectURL(file) to add #ext=.mp4 if it's a video
content = content.replace(
  `const file = e.target.files[0];
                 if (file && onPaste) onPaste(URL.createObjectURL(file));`,
  `const file = e.target.files[0];
                 if (file && onPaste) onPaste(URL.createObjectURL(file) + (file.type.startsWith('video/') ? '#ext=.mp4' : ''));`
);

content = content.replace(
  `const file = ev.target.files[0];
                                                    if (file) setKnowledgeImages(prev => ({ ...prev, [idx]: URL.createObjectURL(file) }));`,
  `const file = ev.target.files[0];
                                                    if (file) setKnowledgeImages(prev => ({ ...prev, [idx]: URL.createObjectURL(file) + (file.type.startsWith('video/') ? '#ext=.mp4' : '') }));`
);

// We should also update the regex to match #ext=.mp4
// Current regex is /\.(mp4|webm)(\?.*)?$/i
// We can change it to search for mp4 or webm in the string ignoring query and hash.
// Simply checking if it `.match(/\.(mp4|webm)($|\?|#)|#ext=\.(mp4|webm)/i)` or easier:
// `url.match(/\.(mp4|webm)($|\?|#)|#ext=\.mp4/i)` or even simpler:
// `.match(/\.(mp4|webm|mov)(\?.*)?(#.*)?$/i) || url.includes('#ext=.mp4')`
// Let's replace `/\.(mp4|webm)(\?.*)?$/i` with `/\.(mp4|webm|mov)($|\?|#)|#ext=\.(mp4|webm)/i`
content = content.replace(/\/\.\(mp4\|webm\)\(\\\?\.\*\)\?\$\/i/g, `/\\.(mp4|webm|mov)($|\\?|#)|#ext=\\.(mp4|webm)/i`);

fs.writeFileSync('src/App.tsx', content);
