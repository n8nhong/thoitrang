import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
const importStatement = `import { MediaDisplay } from './components/MediaDisplay';\n`;
if (!content.includes('MediaDisplay')) {
  content = content.replace(/(import .* from 'lucide-react';)/, `$1\n${importStatement}`);
}

// 1. Update handlePaste
content = content.replace(
  `const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              if (activeTab === 'consult') setImage(reader.result as string);
              else setCommentaryImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }
      }
    }
  }, [activeTab]);`,
  `const handlePaste = useCallback((e: ClipboardEvent) => {
    // Không nhận paste nếu đang gõ text box
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    const items = e.clipboardData?.items;
    let foundFile = false;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1 || item.type.indexOf('video') !== -1) {
          foundFile = true;
          const file = item.getAsFile();
          if (file) {
            if (file.type.indexOf('video') !== -1) {
               const url = URL.createObjectURL(file) + '#ext=.mp4';
               if (activeTab === 'consult') setImage(url);
               else setCommentaryImage(url);
            } else {
               const reader = new FileReader();
               reader.onload = () => {
                 if (activeTab === 'consult') setImage(reader.result as string);
                 else setCommentaryImage(reader.result as string);
               };
               reader.readAsDataURL(file);
            }
          }
        }
      }
      if (!foundFile) {
         e.clipboardData?.items[0]?.getAsString((text) => {
            if (text.startsWith('http') || text.startsWith('data:')) {
               if (activeTab === 'consult') setImage(text.trim());
               else setCommentaryImage(text.trim());
            }
         });
      }
    }
  }, [activeTab]);`
);

// 2. Update handleImageUpload
content = content.replace(
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'consult' | 'commentary') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'consult') setImage(reader.result as string);
        else setCommentaryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`,
  `const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'consult' | 'commentary') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
         const url = URL.createObjectURL(file) + '#ext=.mp4';
         if (target === 'consult') setImage(url);
         else setCommentaryImage(url);
      } else {
         const reader = new FileReader();
         reader.onloadend = () => {
           if (target === 'consult') setImage(reader.result as string);
           else setCommentaryImage(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
    }
  };`
);

// 3. Update consult upload box
content = content.replace(
  `<div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative aspect-[4/3] rounded-2xl border border-dashed border-[#DDD6CE] bg-[#F9F8F6] cursor-pointer hover:border-[#1A1A1A] transition-all overflow-hidden group flex flex-col items-center justify-center gap-3",
                        image && "border-none"
                      )}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'consult')} />
                      {image ? (
                        <img src={image} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center"><Camera className="w-5 h-5 text-[#7A7570]" /></div>
                          <div className="text-center"><p className="text-xs font-medium">Chạm để tải ảnh</p></div>
                        </>
                      )}
                    </div>`,
  `<div className="space-y-2">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative aspect-[4/3] rounded-2xl border border-dashed border-[#DDD6CE] bg-[#F9F8F6] cursor-pointer hover:border-[#1A1A1A] transition-all overflow-hidden group flex flex-col items-center justify-center gap-3",
          image && "border-none"
        )}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, 'consult')} />
        {image ? (
          <MediaDisplay url={image} className="w-full h-full object-contain" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center"><Camera className="w-5 h-5 text-[#7A7570]" /></div>
            <div className="text-center"><p className="text-xs font-medium text-gray-500">Chạm tải ảnh/video<br/>Hoặc nhấn Ctrl+V paste link/ảnh</p></div>
          </>
        )}
      </div>
      {!image && (
         <input 
            type="url"
            placeholder="Hoặc dán Link Tiktok / YouTube / Ảnh vào đây..."
            className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-[11px] focus:outline-none focus:border-[#1A1A1A] font-medium"
            onKeyDown={(e) => {
               if (e.key === 'Enter') {
                  e.preventDefault();
                  setImage(e.currentTarget.value);
               }
            }}
            onChange={(e) => {
               const val = e.target.value.trim();
               if (val.startsWith('http')) {
                  setImage(val);
               }
            }}
         />
      )}
   </div>`
);

// 4. Update commentary upload box
content = content.replace(
  `<div 
                      onClick={() => commentaryInputRef.current?.click()}
                      className={cn(
                        "relative aspect-[3/4] rounded-2xl border border-dashed border-[#DDD6CE] bg-[#F9F8F6] cursor-pointer hover:border-[#1A1A1A] transition-all overflow-hidden group flex flex-col items-center justify-center gap-3",
                        commentaryImage && "border-none"
                      )}
                    >
                      <input type="file" ref={commentaryInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'commentary')} />
                      {commentaryImage ? (
                        <img src={commentaryImage} alt="Outfit Preview" className="w-full h-full object-contain" />
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center"><Upload className="w-5 h-5 text-[#7A7570]" /></div>
                          <div className="text-center"><p className="text-xs font-medium">Tải ảnh bộ đồ</p></div>
                        </>
                      )}
                    </div>`,
  `<div className="space-y-2">
      <div 
        onClick={() => commentaryInputRef.current?.click()}
        className={cn(
          "relative aspect-[3/4] rounded-2xl border border-dashed border-[#DDD6CE] bg-[#F9F8F6] cursor-pointer hover:border-[#1A1A1A] transition-all overflow-hidden group flex flex-col items-center justify-center gap-3",
          commentaryImage && "border-none"
        )}
      >
        <input type="file" ref={commentaryInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => handleImageUpload(e, 'commentary')} />
        {commentaryImage ? (
          <MediaDisplay url={commentaryImage} className="w-full h-full object-contain" />
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center"><Upload className="w-5 h-5 text-[#7A7570]" /></div>
            <div className="text-center"><p className="text-xs font-medium text-gray-500">Tải ảnh/video bộ đồ<br/>Hoặc nhấn Ctrl+V paste link</p></div>
          </>
        )}
      </div>
      {!commentaryImage && (
         <input 
            type="url"
            placeholder="Hoặc dán Link Tiktok / YouTube / Ảnh vào đây..."
            className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-[11px] focus:outline-none focus:border-[#1A1A1A] font-medium"
            onKeyDown={(e) => {
               if (e.key === 'Enter') {
                  e.preventDefault();
                  setCommentaryImage(e.currentTarget.value);
               }
            }}
            onChange={(e) => {
               const val = e.target.value.trim();
               if (val.startsWith('http')) {
                  setCommentaryImage(val);
               }
            }}
         />
      )}
   </div>`
);

fs.writeFileSync('src/App.tsx', content);
