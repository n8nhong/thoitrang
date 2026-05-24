import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx.temp', 'utf8');

// The new zClasses: w-full h-full object-contain
content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2(?: cursor-pointer)?"/g, 
  'className="w-full h-full object-contain absolute z-10 hover:scale-[1.01] transition-transform duration-500 cursor-pointer"');
  
content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2"/g, 
  'className="w-full h-full object-contain absolute z-10 hover:scale-[1.01] transition-transform duration-500"');

// Using regex to replace the img/video tags to inject the watermark blocker
const regex = /(<(video|img)[^>]+className="w-full h-full object-contain absolute z-10 hover:scale-\[1.01\] transition-transform duration-500[^>]*>)/g;
content = content.replace(regex, 
  '$1\\n<div className="absolute bottom-[2%] right-[2%] w-[6%] h-[3%] min-w-[30px] min-h-[16px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none mix-blend-difference rounded-tl-sm hidden md:block"></div>\\n<div className="absolute bottom-[1%] right-[1%] w-[8%] h-[4%] min-w-[20px] min-h-[10px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none md:hidden rounded-tl-sm"></div>');

fs.writeFileSync('src/App.tsx', content);
