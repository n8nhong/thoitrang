import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `          <button 
            onClick={handleCopyVideoPrompt}
            className={cn(
              "p-3 lg:p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95",
              copied ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-amber-800 hover:bg-white"
            )}
            title="Sao chép Câu lệnh Video Veo3 8s"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-3.5 lg:h-3.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </button>
        )}
        <button 
          onClick={handleDownload}`;

const r1 = `          <button 
            onClick={handleCopyVideoPrompt}
            className={cn(
              "p-3 lg:p-2 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95",
              copied ? "bg-green-500 text-white" : "bg-white/95 backdrop-blur-sm text-amber-800 hover:bg-white"
            )}
            title="Sao chép Câu lệnh Video Veo3 8s"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 lg:w-3.5 lg:h-3.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </button>
        )}
        {onPaste && (
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              const inputUrl = window.prompt("Dán URL Ảnh/Video (mp4, webm) vừa tạo:"); 
              if (inputUrl && inputUrl.trim()) onPaste(inputUrl.trim());
            }} 
            className="p-3 lg:p-2 rounded-full shadow-lg bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white transition-all transform hover:scale-110 active:scale-95"
            title="Dán Ảnh/Video Đã Tạo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>
          </button>
        )}
        <button 
          onClick={handleDownload}`;

content = content.replace(t1, r1);

fs.writeFileSync('src/App.tsx', content);
