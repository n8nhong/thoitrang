import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const searchLines = [
  "                                   )}",
  "                                  </div>",
  "                                </div>"
];

const replaceText = `                                   )}
                                  </div>
                                  <div className="p-2 flex flex-col gap-1 w-full bg-white border-t border-[#EEEAE5] shrink-0 relative z-20">
                                    <div className="flex gap-1 w-full">
                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(imagePrompt); alert("Đã copy Prompt Ảnh!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Ảnh">📄 Prompt Ảnh</button>
                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(videoPrompt); alert("Đã copy Prompt Video Veo3 8s!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Video Veo3 8s">🎬 Prompt Video</button>
                                    </div>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const url = window.prompt("Dán URL Ảnh hoặc Video (mp4, webm):"); 
                                        if (url && url.trim()) {
                                          setKnowledgeImages(prev => ({ ...prev, [idx]: url.trim() }));
                                        }
                                      }} 
                                      className="text-center w-full text-[8px] font-bold uppercase py-1.5 px-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      📥 Mời dán Media URL
                                    </button>
                                  </div>
                                </div>`;

const lines = content.split('\n');
let matchIdx = -1;
for (let i = 0; i < lines.length - 2; i++) {
  if (lines[i].trimEnd() === searchLines[0] &&
      lines[i+1].trimEnd() === searchLines[1] &&
      lines[i+2].trimEnd() === searchLines[2]) {
    matchIdx = i;
    break;
  }
}

if (matchIdx !== -1) {
  lines.splice(matchIdx, 3, replaceText);
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
  console.log("Replaced successfully!");
} else {
  console.log("Match not found!");
  process.exit(1);
}
