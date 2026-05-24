const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace handlePasteFromClipboard inside FloatingImageActions
const oldPaste = `const handlePasteFromClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = () => {
              if (onPaste && reader.result) onPaste(reader.result as string);
            };
            reader.readAsDataURL(blob);
            alert("Đã dán ảnh thành công!");
            return;
          }
        }
      }
      alert("Không tìm thấy ảnh trong bộ nhớ tạm. Hãy Copy ảnh từ Gemini trước.");
    } catch (err) {
      console.error("Paste failed:", err);
      alert("Không thể truy cập bộ nhớ tạm. Hãy cấp quyền hoặc thử phím tắt Ctrl+V.");
    }
  };`;

const newPaste = `const handlePasteFromClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fallbackUpload = () => {
       const url = window.prompt("Dán URL Ảnh/Video vào đây (để trống và nhấn OK để chọn file từ máy):");
       if (url !== null) {
          if (url.trim()) {
              if (onPaste) onPaste(url.trim());
          } else {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,video/mp4,video/webm';
              input.onchange = (e: any) => {
                 const file = e.target.files[0];
                 if (file && onPaste) onPaste(URL.createObjectURL(file));
              };
              input.click();
          }
       }
    };

    try {
      let foundLink = false;
      const text = await navigator.clipboard.readText().catch(() => '');
      if (text && (text.startsWith('http') || text.startsWith('data:'))) {
         const useLink = confirm('Phát hiện Link trong bộ nhớ tạm. Bạn có muốn dán?\\n' + text.substring(0,50) + '...');
         if (useLink) {
             if (onPaste) onPaste(text.trim());
             return;
         }
      }

      if (navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const reader = new FileReader();
              reader.onload = () => {
                if (onPaste && reader.result) onPaste(reader.result as string);
              };
              reader.readAsDataURL(blob);
              return;
            }
          }
        }
      }
      fallbackUpload();
    } catch (err) {
      console.error("Paste failed:", err);
      fallbackUpload();
    }
  };`;

content = content.replace(oldPaste, newPaste);

// In Knowledge Tab
const oldKnowledgePaste = `const url = window.prompt("Dán URL Ảnh hoặc Video (mp4, webm) vừa tạo:"); 
                                        if (url && url.trim()) {
                                          setKnowledgeImages(prev => ({ ...prev, [idx]: url.trim() }));
                                        }`;

const newKnowledgePaste = `const fallbackUpload = () => {
                                           const url = window.prompt("Dán URL Ảnh/Video (để trống và nhấn OK để chọn file từ máy):");
                                           if (url !== null) {
                                              if (url.trim()) {
                                                 setKnowledgeImages(prev => ({ ...prev, [idx]: url.trim() }));
                                              } else {
                                                 const input = document.createElement('input');
                                                 input.type = 'file';
                                                 input.accept = 'image/*,video/mp4,video/webm';
                                                 input.onchange = (ev: any) => {
                                                    const file = ev.target.files[0];
                                                    if (file) setKnowledgeImages(prev => ({ ...prev, [idx]: URL.createObjectURL(file) }));
                                                 };
                                                 input.click();
                                              }
                                           }
                                        };
                                        try {
                                           navigator.clipboard.readText().then(text => {
                                              if (text && (text.startsWith('http') || text.startsWith('data:'))) {
                                                 if (confirm('Dán link này?\\n' + text.substring(0,50) + '...')) {
                                                    setKnowledgeImages(prev => ({ ...prev, [idx]: text.trim() }));
                                                    return;
                                                 }
                                              }
                                              if (navigator.clipboard.read) {
                                                 navigator.clipboard.read().then(items => {
                                                    let found = false;
                                                    for (const item of items) {
                                                       const type = item.types.find(t => t.startsWith('image/'));
                                                       if (type) {
                                                          found = true;
                                                          item.getType(type).then(blob => setKnowledgeImages(prev => ({ ...prev, [idx]: URL.createObjectURL(blob) })));
                                                          break;
                                                       }
                                                    }
                                                    if (!found) fallbackUpload();
                                                 }).catch(fallbackUpload);
                                              } else {
                                                 fallbackUpload();
                                              }
                                           }).catch(fallbackUpload);
                                        } catch (e) {
                                           fallbackUpload();
                                        }`;

content = content.replace(oldKnowledgePaste, newKnowledgePaste);

// Cover Watermark
const overlayStr = `<div className="absolute bottom-0 right-0 w-[15%] h-[6%] bg-black/90 blur-sm z-[55] pointer-events-none rounded-tl-xl hidden"></div>`;
const actualOverlayStr = `<div className="absolute bottom-0 right-0 w-[24px] lg:w-[48px] h-[12px] lg:h-[24px] bg-[#0a0a0a]/95 blur-[2px] z-[55] pointer-events-none hidden" style={{ display: 'block' }}></div>`;

// Where do we insert actualOverlayStr?
// In the full screen mode and normal view mode.
// We must replace all ZClasses to ensure object-contain and add the overlay inside the wrapper if it exists.
// Wait, in patch10, we used zClassesNoCursor. Let's see the current CSS for images.

fs.writeFileSync('src/App.tsx.temp', content);
