import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `{currentMain ? (
                         currentMain?.match(/\\.(mp4|webm|mov)($|\\?|#)|#ext=\\.(mp4|webm)/i) ? (
                         <video src={currentMain} autoPlay loop muted playsInline className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       ) : (
                         <img src={currentMain} className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       )
                       <WatermarkHider />
                       ) : (`,
  `{currentMain ? (
                         <>
                           {currentMain?.match(/\\.(mp4|webm|mov)($|\\?|#)|#ext=\\.(mp4|webm)/i) ? (
                           <video src={currentMain} autoPlay loop muted playsInline className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                         ) : (
                           <img src={currentMain} className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                         )}
                         <WatermarkHider />
                         </>
                       ) : (`
);

fs.writeFileSync('src/App.tsx', content);
