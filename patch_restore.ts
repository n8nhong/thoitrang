import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx.temp', 'utf8');

content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2(?: cursor-pointer)?"/g, 
  'className="w-full h-full object-contain absolute z-10 hover:scale-[1.01] transition-transform duration-500 cursor-pointer"');
  
content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2"/g, 
  'className="w-full h-full object-contain absolute z-10 hover:scale-[1.01] transition-transform duration-500"');

const additions = `\n<div className="absolute bottom-[2%] right-[2%] w-[6%] h-[3%] min-w-[30px] min-h-[16px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none mix-blend-difference rounded-tl-sm hidden md:block"></div>
<div className="absolute bottom-[1%] right-[1%] w-[8%] h-[4%] min-w-[20px] min-h-[10px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none md:hidden rounded-tl-sm"></div>`;

// We just replace /> with /> + additions
// BUT we only want it for THESE specific images.
// Actually, since all these images are wrapped in relative divs, we can just replace 'overflow-hidden rounded-xl group relative bg-[#1A1A1A] w-full aspect-[9/16]' and add the watermark mask at the end of the children? No, the div structure might be complex.

// Instead of regex, let's just do:
content = content.replace(/<video src=\{historyImages\[([^]+?)\]\[([^]+?)\] \|\| 0\}\} autoPlay loop muted playsInline className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" onClick=\{([^]+?)\} \/>/g, 
  (match) => match + additions);

content = content.replace(/<img src=\{historyImages\[([^]+?)\]\[([^]+?)\] \|\| 0\}\} className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" onClick=\{([^]+?)\} \/>/g, 
  (match) => match + additions);

content = content.replace(/<video src=\{knowledgeImages\[idx\]\} autoPlay loop muted playsInline className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" onClick=\{([^]+?)\} \/>/g, 
  (match) => match + additions);

content = content.replace(/<img src=\{knowledgeImages\[idx\]\} className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" onClick=\{([^]+?)\} \/>/g, 
  (match) => match + additions);

content = content.replace(/<video src=\{currentMain\} autoPlay loop muted playsInline className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);
content = content.replace(/<img src=\{currentMain\} className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);

content = content.replace(/<video src=\{currentThumb\} autoPlay loop muted playsInline className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);
content = content.replace(/<img src=\{currentThumb\} className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);

// detail view without onclick
content = content.replace(/<video src=\{historyImages\['detail'\]\[currentImageIndices\['detail'\] \|\| 0\]\} autoPlay loop muted playsInline className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);
content = content.replace(/<img src=\{historyImages\['detail'\]\[currentImageIndices\['detail'\] \|\| 0\]\} className="w-full h-full object-contain absolute z-10 hover:scale-\[1\.01\] transition-transform duration-500 cursor-pointer" \/>/g, 
  (match) => match + additions);

fs.writeFileSync('src/App.tsx', content);