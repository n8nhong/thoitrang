import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Inject the state for AI Audio
content = content.replace(
  `const [volume, setVolume] = useState(1);`,
  `const [volume, setVolume] = useState(1);
  const [aiFullAudio, setAiFullAudio] = useState<string | null>(null);
  const [isGeneratingAiAudio, setIsGeneratingAiAudio] = useState(false);
  const fullAudioObjRef = useRef<HTMLAudioElement | null>(null);`
);

// We need to reset aiFullAudio when text or voice changes
content = content.replace(
  `  useEffect(() => {
    stopSpeech();
   }, [localText]);`,
  `  useEffect(() => {
    stopSpeech();
    setAiFullAudio(null);
   }, [localText, selectedVoiceURI]);`
);

// We need a generate function
content = content.replace(
  `const handleDownload = () => {`,
  `const generateAiAudio = async () => {
    if (!localText) return;
    setIsGeneratingAiAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: localText, voice: selectedVoiceURI })
      });
      const data = await res.json();
      if (data.audio) {
        setAiFullAudio(data.audio);
        alert("Đã tạo giọng đọc AI thành công! Bạn có thể bấm Phát ngay.");
      } else {
        alert(data.error || "Không thể tạo giọng AI.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi mạng khi tạo giọng AI.");
    }
    setIsGeneratingAiAudio(false);
  };

  const playFullAiAudio = async () => {
    if (!aiFullAudio) return;
    
    // Fallback UI highlight simulation
    let currentWordIndex = 0;
    const totalWords = words.length;
    
    const snd = new Audio(aiFullAudio);
    snd.playbackRate = voiceSpeed;
    fullAudioObjRef.current = snd;
    
    snd.onplay = () => {
       const wordDurationMs = ((snd.duration / voiceSpeed) * 1000) / totalWords;
       let interval = setInterval(() => {
          if (!isActiveRef.current || !fullAudioObjRef.current) {
             clearInterval(interval);
             return;
          }
          setHighlightIndex(currentWordIndex);
          // Để setActivePhraseIndex khớp với currentWordIndex 
          const currentPhraseIdx = wordToPhrase[currentWordIndex];
          if (currentPhraseIdx !== undefined) {
             setActivePhraseIndex(currentPhraseIdx);
          }
          
          currentWordIndex++;
          if (currentWordIndex >= totalWords) {
             clearInterval(interval);
          }
       }, wordDurationMs || 250);
       
       (snd as any)._highlightInterval = interval;
    };
    
    snd.onended = () => {
       if ((snd as any)._highlightInterval) clearInterval((snd as any)._highlightInterval);
       setIsSpeaking(false);
       setHighlightIndex(-1);
       setActivePhraseIndex(-1);
       if (isActiveRef.current) onComplete?.();
       stopRecordingMP4();
    };
    
    await snd.play();
  };

  const handleDownload = () => {`
);

// Replace startSpeech to branch out for AI
content = content.replace(
  `const startSpeech = () => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    stopSpeech();
    setIsSpeaking(true);
    isActiveRef.current = true;
    
    if (audioRef.current && bgMusicUrl) {
      audioRef.current.play().catch(e => console.warn('Audio play prevented:', e));
    }
    
    playPhrase(0);
  };`,
  `const startSpeech = () => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    if (selectedVoiceURI.startsWith('AI_')) {
       if (!aiFullAudio) {
           alert("Với giọng biểu cảm, bạn cần bấm nút 'TẠO GIỌNG ĐỌC' trước khi phát.");
           return;
       }
    }
    
    stopSpeech();
    setIsSpeaking(true);
    isActiveRef.current = true;
    
    if (audioRef.current && bgMusicUrl) {
      audioRef.current.play().catch(e => console.warn('Audio play prevented:', e));
    }
    
    if (selectedVoiceURI.startsWith('AI_')) {
       playFullAiAudio();
    } else {
       playPhrase(0);
    }
  };`
);

// Replace stopSpeech to clear fullAudioObjRef
content = content.replace(
  `aiAudioRefs.current = [];
    
    if (audioRef.current) {`,
  `aiAudioRefs.current = [];
    
    if (fullAudioObjRef.current) {
      fullAudioObjRef.current.pause();
      fullAudioObjRef.current.currentTime = 0;
      if ((fullAudioObjRef.current as any)._highlightInterval) {
         clearInterval((fullAudioObjRef.current as any)._highlightInterval);
      }
      fullAudioObjRef.current = null;
    }
    
    if (audioRef.current) {`
);

// Modify the GT_Female logic to only run if GT_Female and NOT AI_
content = content.replace(
  `if (selectedVoiceURI === 'GT_Female' || selectedVoiceURI.startsWith('AI_')) {`,
  `if (selectedVoiceURI === 'GT_Female') {`
);


// Inject the 'Tạo Giọng Đọc' button in UI
content = content.replace(
  `{isSpeaking ? <><VolumeX className="w-3 h-3 animate-pulse" /> Dừng</> : <><Play className="w-3 h-3" /> Nghe tư vấn</>}
          </button>`,
  `{isSpeaking ? <><VolumeX className="w-3 h-3 animate-pulse" /> Dừng</> : <><Play className="w-3 h-3" /> Nghe tư vấn</>}
          </button>
          
          {selectedVoiceURI.startsWith('AI_') && !isSpeaking && !isRecording && (
            <button 
              onClick={generateAiAudio}
              disabled={isGeneratingAiAudio || disabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm ring-1 ring-inset",
                disabled || isGeneratingAiAudio ? "bg-gray-100 text-gray-400 ring-gray-200 cursor-not-allowed" : aiFullAudio ? "bg-green-50 text-green-700 ring-green-200 hover:bg-green-100" : "bg-purple-50 text-purple-700 ring-purple-200 hover:bg-purple-100"
              )}
            >
              {isGeneratingAiAudio ? <><span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span> Đang tạo...</> : aiFullAudio ? <><span className="w-3 h-3 rounded-full bg-green-500"></span> Đã tạo Audio</> : <>Tạo Giọng Đọc AI</>}
            </button>
          )}`
);

fs.writeFileSync('src/App.tsx', content);
