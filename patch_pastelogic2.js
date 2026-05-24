const fs = require('fs');
let content = fs.readFileSync('src/App.tsx.temp', 'utf8');

// The new zClasses: w-full h-full object-contain
// And we also want to add the watermark hider!
const newVideoStr = (src, onClick) => `<video src={${src}} autoPlay loop muted playsInline className="w-full h-full object-contain relative z-10" ${onClick ? `onClick={${onClick}} ` : ''}/>
<div className="absolute bottom-1 right-1 w-[24px] lg:w-[32px] h-[12px] lg:h-[16px] bg-[#0a0a0a]/90 blur-[2px] z-20 pointer-events-none"></div>`;

const newImgStr = (src, onClick) => `<img src={${src}} className="w-full h-full object-contain relative z-10 ${onClick ? 'cursor-pointer' : ''}" ${onClick ? `onClick={${onClick}} ` : ''}/>`;

// Wait! If the image also has watermark from AI, maybe overlay for image as well?
// Imagen3 puts it at bottom right. So let's just put it for both.

const newMediaStr = (src, onClick) => `<div className="absolute inset-0 flex items-center justify-center bg-black/5 overflow-hidden">
  ${src.includes('match') ? `{${src} ? <video src={${src.split('?')[0].replace('{','')}} autoPlay loop muted playsInline className="w-full h-full object-contain relative z-10" ${onClick ? `onClick={${onClick}} ` : ''}/> : <img src={${src.split('?')[0].replace('{','')}} className="w-full h-full object-contain relative z-10" ${onClick ? `onClick={${onClick}} ` : ''}/>}` : ''}
  <div className="absolute bottom-0 right-0 w-[5%] h-[4%] bg-[#0a0a0a]/95 blur-[2px] z-20 pointer-events-none" style={{minWidth: '24px', minHeight: '12px'}}></div>
</div>`;

// Wait, doing AST or Regex replacement for all those lines.
content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2(?: cursor-pointer)?"/g, 
  'className="w-full h-full object-contain absolute z-10 hover:scale-[1.01] transition-transform duration-500"');

// And we want to add the watermark blocker to the parent container of these images!
// Actually, injecting a watermark blocker div after the img/video tag is easiest using regex.
content = content.replace(/(<(video|img)[^>]+className="w-full h-full object-contain absolute z-10 hover:scale-\[1.01\] transition-transform duration-500"[^>]*>)/g, 
  '$1\n<div className="absolute bottom-[2%] right-[2%] w-[6%] h-[3%] min-w-[30px] min-h-[16px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none mix-blend-difference rounded-tl-sm hidden md:block"></div>\n<div className="absolute bottom-[1%] right-[1%] w-[8%] h-[4%] min-w-[20px] min-h-[10px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none md:hidden rounded-tl-sm"></div>');

// Ensure Edit3 is registered.
// Actually user reported: ReferenceError: Edit3 is not defined. We already fixed it in previous step but to be safe let's ensure it's imported.
if (!content.includes('Edit3')) {
  content = content.replace('BookOpen\n} from \'lucide-react\';', 'BookOpen,\n  Edit3\n} from \'lucide-react\';');
}

fs.writeFileSync('src/App.tsx', content);
