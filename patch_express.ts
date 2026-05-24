const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace KaraokeText definition and hooks
content = content.replace(
  "const KaraokeText = ({ text, onComplete, isFullscreen = false, onHighlightChange, disabled = false, disabledMessage = '' }: { text: string; onComplete?: () => void; isFullscreen?: boolean; onHighlightChange?: (index: number, total: number, activePhraseText?: string) => void; disabled?: boolean; disabledMessage?: string }) => {\n  const [highlightIndex, setHighlightIndex] = useState(-1);",
  "const KaraokeText = ({ text, onComplete, isFullscreen = false, onHighlightChange, disabled = false, disabledMessage = '' }: { text: string; onComplete?: () => void; isFullscreen?: boolean; onHighlightChange?: (index: number, total: number, activePhraseText?: string) => void; disabled?: boolean; disabledMessage?: string }) => {\n  const [localText, setLocalText] = useState(text);\n  const [isEditing, setIsEditing] = useState(false);\n  const textareaRef = useRef<HTMLTextAreaElement>(null);\n\n  useEffect(() => {\n    if (!isEditing) setLocalText(text);\n  }, [text, isEditing]);\n\n  const [highlightIndex, setHighlightIndex] = useState(-1);"
);

// Update useMemo for phrases:
content = content.replace(
  "const { words, phrases, wordToPhrase, phraseToWordStart } = useMemo(() => {\n    if (!text) return { words: [], phrases: [], wordToPhrase: [], phraseToWordStart: [] };\n    \n    // Loai bo ky tu markdown la: *, #, _, `, [ ], (, ) giu lai van ban sach dep\n    const cleanText = text.replace(/[*#_~`]/g, '');",
  "const { words, phrases, wordToPhrase, phraseToWordStart } = useMemo(() => {\n    if (!localText) return { words: [], phrases: [], wordToPhrase: [], phraseToWordStart: [] };\n    \n    const cleanText = localText.replace(/[*#_~`]/g, '');"
);

content = content.replace(/ \}, \[text\]\);/g, "  }, [localText]);");

// Ensure cleanText replaces [Emotion] tags with spaces
content = content.replace(
  "const cleanText = phraseText.replace(/[,.!?;\\n]/g, match => ' '.repeat(match.length));",
  "const cleanText = phraseText.replace(/\\[([^\\]]+)\\]/g, match => ' '.repeat(match.length)).replace(/[,.!?;\\n]/g, match => ' '.repeat(match.length));"
);

// Replace toan bo / karaoke buttons
content = content.replace(
  `          {!isFullscreen && (
            <div className="flex bg-[#EEEAE5] p-1 rounded-full">
            <button 
              onClick={() => setIsKaraokeMode(true)}
              className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all", isKaraokeMode ? "bg-white shadow-sm" : "text-[#7A7570]")}
            >
              Karaoke
            </button>
            <button 
              onClick={() => setIsKaraokeMode(false)}
              className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all", !isKaraokeMode ? "bg-white shadow-sm" : "text-[#7A7570]")}
            >
              Toàn bộ
            </button>
            </div>
          )}`,
  `          {!isFullscreen && (
            <div className="flex bg-[#EEEAE5] p-1 rounded-full items-center gap-0.5">
            <button 
              onClick={() => {setIsKaraokeMode(true); setIsEditing(false);}}
              className={cn("px-2 sm:px-3 py-1.5 rounded-[1.5rem] text-[9px] sm:text-[10px] font-bold uppercase transition-all", isKaraokeMode && !isEditing ? "bg-white shadow-sm" : "text-[#7A7570] hover:text-[#1A1A1A]")}
            >
              Karaoke
            </button>
            <button 
              onClick={() => {setIsKaraokeMode(false); setIsEditing(false);}}
              className={cn("px-2 sm:px-3 py-1.5 rounded-[1.5rem] text-[9px] sm:text-[10px] font-bold uppercase transition-all", !isKaraokeMode && !isEditing ? "bg-white shadow-sm" : "text-[#7A7570] hover:text-[#1A1A1A]")}
            >
              Toàn bộ
            </button>
            <button
               onClick={() => setIsEditing(!isEditing)}
               className={cn("px-2 sm:px-3 py-1.5 flex items-center gap-1 rounded-[1.5rem] text-[9px] sm:text-[10px] font-bold uppercase transition-all shadow-[0]", isEditing ? "bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-300" : "text-[#7A7570] hover:bg-white/50")}
            >
               <Edit3 className="w-3 h-3" /> Sửa & Cảm Xúc
            </button>
            </div>
          )}`
);

// Ensure the voice dropdown options exist
content = content.replace(
  `<option value="GT_Female">Nữ (Google Dịch)</option>
                {voices.length > 0 ? voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name.replace('Microsoft ', '').replace('Google ', '')}</option>
                )) : <option value="">Mặc định Máy</option>}`,
  `                <optgroup label="Giọng AI (Cần Cấu Hình)">
                  <option value="GT_Female">Nữ (Google Dịch)</option>
                  <option value="AI_HN_Female">Nữ - Hà Nội</option>
                  <option value="AI_HN_Male">Nam - Hà Nội</option>
                  <option value="AI_SG_Female">Nữ - Miền Nam</option>
                  <option value="AI_SG_Male">Nam - Miền Nam</option>
                  <option value="AI_Hue_Female">Nữ - Huế</option>
                  <option value="AI_Hue_Male">Nam - Huế</option>
                  <option value="AI_Old_Male">Ông già (AI)</option>
                  <option value="AI_Old_Female">Bà già (AI)</option>
                  <option value="AI_Child">Trẻ em (AI)</option>
                </optgroup>
                <optgroup label="Hệ thống (Web Speech API)">
                {voices.length > 0 ? voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>{v.name.replace('Microsoft ', '').replace('Google ', '')}</option>
                )) : <option value="">Mặc định Máy</option>}
                </optgroup>`
);

content = content.replace(
  "if (selectedVoiceURI === 'GT_Female') {",
  "if (selectedVoiceURI === 'GT_Female' || selectedVoiceURI.startsWith('AI_')) {"
);

const replacement = 
`<div id="karaoke-recording-box" className={cn(
        "min-h-[220px] flex items-center justify-center p-10 rounded-[2.5rem] transition-all duration-1000",
        isEditing ? "bg-amber-50 border border-amber-200 block text-left" :
        isKaraokeMode 
          ? style.id === 'classic'`;

content = content.replace(
  `<div id="karaoke-recording-box" className={cn(
        "min-h-[220px] flex items-center justify-center p-10 rounded-[2.5rem] transition-all duration-1000",
        isKaraokeMode 
          ? style.id === 'classic'`,
  replacement
);

const renderEditorBody = `        {isEditing ? (
          <div className="w-full h-full flex flex-col gap-3">
             <div className="flex gap-2 flex-wrap mb-2 p-2 bg-white rounded-xl border border-amber-100 shadow-sm items-center">
               <span className="text-[10px] uppercase font-bold text-amber-800/60 shrink-0">Chèn Kịch tính:</span>
               {[
                 {label: 'Cười', emoji: '😄'}, {label: 'Khóc', emoji: '😭'}, 
                 {label: 'Mỉa mai', emoji: '😏'}, {label: 'Thì thầm', emoji: '🤫'}, 
                 {label: 'Tức giận', emoji: '😠'}, {label: 'Suỵt', emoji: '🤫'}, 
                 {label: 'Woàm', emoji: '🦁'}, {label: 'Hự', emoji: '🥊'}
               ].map(e => (
                 <button 
                   key={e.label}
                   onClick={() => {
                     if (textareaRef.current) {
                        const start = textareaRef.current.selectionStart;
                        const end = textareaRef.current.selectionEnd;
                        const val = localText;
                        const insert = \`[\${e.label}] \`;
                        setLocalText(val.substring(0, start) + insert + val.substring(end));
                        setTimeout(() => {
                           textareaRef.current?.focus();
                           textareaRef.current?.setSelectionRange(start + insert.length, start + insert.length);
                        }, 0);
                     } else {
                        setLocalText(prev => prev + \` [\${e.label}] \`);
                     }
                   }}
                   className="text-[10px] px-2 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 hover:bg-amber-500 hover:text-white transition-all uppercase font-bold tracking-widest flex items-center gap-1 shadow-sm active:scale-95"
                 ><span>{e.emoji}</span> {e.label}</button>
               ))}
             </div>
             <textarea 
               ref={textareaRef}
               value={localText} 
               onChange={e => setLocalText(e.target.value)} 
               className="w-full h-full min-h-[300px] p-6 bg-white/80 backdrop-blur-sm rounded-2xl outline-none text-base text-[#1A1A1A] resize-y focus:ring-2 focus:ring-amber-500/30 leading-relaxed font-medium transition-all shadow-inner"
               placeholder="Nhập kịch bản hoặc bấm phím tắt biểu cảm để chèn vào văn bản..."
             />
             <div className="text-[9px] text-amber-600/70 uppercase tracking-widest font-bold text-center mt-2 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
               Lưu ý: Biểu cảm sẽ được AI tự động diễn đạt trên luồng.
             </div>
          </div>
        ) : (`;

content = content.replace(
  `        <div ref={containerRef} className={cn(
          "leading-[1.2] transition-all duration-300 w-full h-full overflow-y-auto hide-scrollbar",`,
  renderEditorBody + `\n        <div ref={containerRef} className={cn(\n          "leading-[1.2] transition-all duration-300 w-full h-full overflow-y-auto hide-scrollbar",`
);

content = content.replace(
  `          )}
        </div>
      </div>`,
  `          )}
        </div>
        )}
      </div>`
);


fs.writeFileSync('src/App.tsx', content);
