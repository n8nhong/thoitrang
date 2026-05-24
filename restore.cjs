const fs = require('fs');

const appRaw = fs.readFileSync('src/App.tsx', 'utf8');
const tempRaw = fs.readFileSync('src/App.tsx.temp', 'utf8');

const appLines = appRaw.split('\n');
const tempLines = tempRaw.split('\n');

// 1. Get the surviving top part of App.tsx (up to line 1503 where the stitch happened)
let topPart = appLines.slice(0, 1504); // index 1503 is `animate={{ opacity: 1, ... }}`

// Wait, the end of `KaraokeText` was:
const karaokeEnd = [
    "                      </motion.span>",
    "                    )}",
    "                  </AnimatePresence>",
    "                )}",
    "              </div>",
    "            ) : (",
    "              <div className=\"flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4\">\n                {words.map((word, i) => (\n..."
];

// Let's just fix KaraokeText closure properly.
let fixedTopPart = topPart.join('\n');
// Close the word transition AnimatePresence
fixedTopPart += `
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4">
                {words.map((word, i) => (
                  <span 
                    key={i} 
                    className={cn("transition-colors duration-300", 
                      highlightIndex === i 
                      ? wordStyleConfig.highlight 
                      : (isKaraokeMode ? wordStyleConfig.text : "text-[#1A1A1A]")
                    )}
                  >
                    {word.replace(/^\\[.*?\\]\\s*/g, '')} 
                  </span>
                ))}
              </div>
            )
          ) : (
            text
          )}
        </div>
      </div>
    </div>
  );
}
`;

// 2. Get the App() component start and body from tempLines
let tempAppStart = tempLines.findIndex(l => l.includes('export default function App()'));
let tempFullscreenStart = tempLines.findIndex(l => l.includes('{isFullscreen && (')); // This is the modal

if (tempFullscreenStart === -1) {
   tempFullscreenStart = tempLines.length - 50; 
} else {
   // Go up to AnimatePresence
   tempFullscreenStart -= 1;
}

let middlePart = tempLines.slice(tempAppStart, tempFullscreenStart).join('\n');

// Add back globalKaraokeLayoutType, globalWordStyleConfig, isGeneratingImg to MiddlePart!
middlePart = middlePart.replace(
  'const [karaokeViewType, setKaraokeViewType] = useState<string>(\'\');',
  `const [karaokeViewType, setKaraokeViewType] = useState<string>('');
  const [globalKaraokeLayoutType, setGlobalKaraokeLayoutType] = useState('seven_words');
  const [globalWordStyleConfig, setGlobalWordStyleConfig] = useState(KARAOKE_STYLES[0]);
  const [isGeneratingImg, setIsGeneratingImg] = useState<Record<number, boolean>>({});
  const [isGeneratingAny, setIsGeneratingAny] = useState(false);`
);

middlePart = middlePart.replace(/<img(.*?)src=\{image\}(.*?)>/, '<MediaDisplay url={image} className="w-full h-full object-contain" />')
                       .replace(/<img(.*?)src=\{commentaryImage\}(.*?)>/, '<MediaDisplay url={commentaryImage} className="w-full h-full object-contain" />')
                       .replace(/<img(.*?)src=\{knowledgeImages(.*?)onClick(.*?)>/, `<MediaDisplay url={knowledgeImages[idx]} className="w-full h-full object-contain pointer-events-none" />`);

// 3. Get the surviving bottom part of App.tsx (the Fullscreen modal and style)
// We find where Fullscreen modal is in App.tsx (bottom part)
let appBottomStartIndex = 1504; // The broken stitch
let bottomPartRaw = appLines.slice(appBottomStartIndex).join('\n');
// We need to fix the broken motion.div in bottom part
let fixedBottomPart = bottomPartRaw.substring(bottomPartRaw.indexOf('className="absolute inset-0 z-0 cursor-pointer overflow-hidden rounded-xl"'));
fixedBottomPart = `
      {/* Fullscreen Modal Formatted */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-[210] bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={() => setIsFullscreen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors shadow-lg"><X className="w-6 h-6" /></button>
            <div className="flex gap-4">
               {activeTab !== 'user' && (
                 <button onClick={() => {}} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors shadow-lg"><Download className="w-5 h-5" /></button>
               )}
            </div>
          </div>
          <div className="flex-1 relative flex flex-col items-center justify-center">
            <motion.div 
               key="main"
               className="w-full h-[65%] relative group flex items-center justify-center p-2 sm:p-8"
            >
              <div 
                ` + fixedBottomPart;

// It's a bit messy. Let's just create a completely valid file.
fs.writeFileSync('restored.tsx', fixedTopPart + '\n' + middlePart + '\n' + fixedBottomPart);
console.log('Restored to restored.tsx');
