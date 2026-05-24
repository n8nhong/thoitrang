import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `const imagePrompt = \`vietnamese person, asian facial features, \${imgKw}\`;
                                  const videoPrompt = \`A 8 seconds cinematic video of vietnamese person, asian facial features, \${imgKw}\`;`;

const replace1 = `const genderText = gender === 'Nam' ? 'man' : gender === 'Nữ' ? 'woman' : 'person';
                                  const imagePrompt = \`vietnamese \${genderText}, asian facial features, \${imgKw}\`;
                                  const videoPrompt = \`A 8-seconds cinematic video of vietnamese \${genderText}, asian facial features, \${imgKw}\`;`;

content = content.replace(target1, replace1);

const target2 = `  const handleCopyPromptOnly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      alert("Đã Copy Câu lệnh! Hãy dán (Ctrl+V) sang Gemini.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Không thể sao chép. Vui lòng chọn và copy thủ công.");
    }
  };`;

const replace2 = `  const handleCopyPromptOnly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      alert("Đã Copy Câu lệnh! Hãy dán (Ctrl+V) sang Gemini.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Không thể sao chép. Vui lòng chọn và copy thủ công.");
    }
  };

  const handleCopyVideoPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(\`A 8-seconds cinematic video of \${prompt}\`);
      setCopied(true);
      alert("Đã Copy Câu lệnh cho Video (Sora/Veo3)! Hãy dán để tạo video.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Không thể sao chép. Vui lòng chọn và copy thủ công.");
    }
  };`;

content = content.replace(target2, replace2);

const target3 = `            onClick={handleCopyPromptOnly}
            className={cn(
              "p-3 lg:p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95",
              copied ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-white"
            )}
            title="Sao chép Câu lệnh"
          >
            <Copy className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
          </button>`;

const replace3 = `            onClick={handleCopyPromptOnly}
            className={cn(
              "p-3 lg:p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95",
              copied ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-white"
            )}
            title="Sao chép Câu lệnh Ảnh"
          >
            <Copy className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
          </button>
          <button 
            onClick={handleCopyVideoPrompt}
            className={cn(
              "p-3 lg:p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95",
              copied ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-amber-800 hover:bg-white"
            )}
            title="Sao chép Câu lệnh Video Veo3 8s"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-3.5 lg:h-3.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </button>`;

content = content.replace(target3, replace3);

fs.writeFileSync('src/App.tsx', content);
