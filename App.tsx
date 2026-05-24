import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Camera, 
  Upload, 
  Loader2, 
  User, 
  Maximize2, 
  Minimize2, 
  Palette, 
  Shirt, 
  MapPin, 
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCcw,
  Settings,
  LogIn,
  Copy,
  Download,
  Eye,
  EyeOff,
  Type as TypeIcon,
  X,
  Save,
  Trash2,
  History,
  Link as LinkIcon,
  Globe,
  Database,
  Activity,
  ShieldAlert,
  RefreshCw,
  Sparkles,
  Layers,
  Move,
  ChevronLeft,
  ChevronRight,
  Search,
  ExternalLink,
  Plus,
  Music,
  Play,
  Pause,
  Square,
  Lock as LockIcon,
  Video,
  Mic,
  TextQuote,
  PlusCircle,
  Settings2,
  BookOpen,
  Edit3,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minus,
  Heart,
  Flower2,
  ThumbsUp,
  BellRing,
  Circle
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MediaDisplay } from './components/MediaDisplay';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FashionResult {
  advice: string;
  fullBodyPrompt: string;
  detailPrompt: string;
  detailPrompts?: { name: string; prompt: string }[];
  colors?: { name: string; hex: string; material?: string }[];
  affiliate_links?: { name: string; link: string; label?: string }[];
}

interface AnalysisResult {
  analysis: string;
  improvementPrompt: string;
  colors?: { name: string; hex: string; material?: string }[];
  affiliate_links?: { name: string; link: string; label?: string }[];
}

interface SavedItem {
  id: string;
  type: 'consult' | 'commentary' | 'knowledge';
  timestamp: number;
  date: string;
  result: any;
  images: {
    input?: string | null;
    fullBody?: string | null;
    detail?: string | null;
    improvement?: string | null;
  };
  historyImages?: {[key: string]: string[]};
  knowledgeImages?: Record<number, string>;
}

interface VideoPreset {
  id: string;
  name: string;
  config: {
    bgMusicUrl: string;
    bgMusicName: string;
    musicVolume: number;
    selectedVoiceURI: string;
    voiceSpeed: number;
    wordStyleConfig: any;
    isKaraokeMode: boolean;
    recordWithAudio: boolean;
    videoScale: number;
    videoPos: { x: number; y: number };
    overlays: any[];
  }
}

interface KaraokeStyle {
  id: string;
  name: string;
  font: string;
  highlight: string;
  text: string;
}

const KARAOKE_STYLES: KaraokeStyle[] = [
  { id: 'classic', name: 'Hoàng Gia', font: 'serif', highlight: 'text-[#FEF3C7] drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]', text: 'text-white/50' },
  { id: 'modern', name: 'Đêm Cực Quang', font: 'font-sans', highlight: 'text-[#A5F3FC] drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]', text: 'text-white/50' },
  { id: 'vibrant', name: 'Tím Thạch Anh', font: 'font-mono', highlight: 'text-[#F9A8D4] drop-shadow-[0_0_12px_rgba(244,114,182,0.9)]', text: 'text-white/50' },
  { id: 'gold', name: 'Vàng Ánh Kim', font: 'font-sans', highlight: 'text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]', text: 'text-white/90' },
];

const PREDEFINED_MUSIC = [
  { id: '1', name: '🌸 Phong cách Nhẹ nhàng (Acoustic)', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: '2', name: '✨ Trendy TikTok (Lofi Chill)', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_2d815777bd.mp3' },
  { id: '3', name: '🔥 Thời trang Sành điệu (Upbeat)', url: 'https://cdn.pixabay.com/audio/2021/08/25/audio_9bbd99c4bd.mp3' },
  { id: '4', name: '📱 Quay Vlog (Vlog Music)', url: 'https://cdn.pixabay.com/audio/2022/01/21/audio_31743cd0b0.mp3' },
  { id: '5', name: '💅 Sang chảnh & Thần thái', url: 'https://cdn.pixabay.com/audio/2022/04/27/audio_8233df86b2.mp3' }
];

const AffiliateRecommendations = ({ links }: { links?: { name: string; link: string; label?: string }[] }) => {
  if (!links || links.length === 0) return null;
  
  return (
    <div className="mt-6 mb-8 border border-[#EEEAE5] rounded-2xl bg-white overflow-hidden">
      <div className="px-4 py-3 bg-[#F9F8F6] border-b border-[#EEEAE5] flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-[#A09A94]" />
          Gợi Ý Nơi Mua (Shopping Links)
        </h3>
        <span className="text-[9px] text-[#A09A94] uppercase tracking-wider font-medium">Bảo trợ bởi Hệ Thống</span>
      </div>
      <div className="p-2 space-y-1">
        {links.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-[#F9F8F6] transition-colors border border-transparent hover:border-[#EEEAE5]"
          >
            <div className="flex-1 min-w-0 pr-4">
              <div className="text-[13px] font-medium text-[#1A1A1A] group-hover:text-amber-700 transition-colors line-clamp-1">
                {item.name}
              </div>
              {item.label && (
                <div className="text-[10px] text-[#A09A94] mt-1 flex items-center gap-1">
                  Nguồn: <span className="font-semibold">{item.label}</span>
                </div>
              )}
            </div>
            <div className="mt-2 sm:mt-0 flex items-center text-[10px] font-bold text-amber-700 uppercase tracking-widest shrink-0 gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              Mở link <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const KaraokeText = ({ text, mediaUrl, onComplete, isFullscreen = false, onClose, onHighlightChange, onSpeakingChange, onRecordingChange, disabled = false, disabledMessage = '', recAspectRatio, setRecAspectRatio }: { text: string; mediaUrl?: string; onComplete?: () => void; isFullscreen?: boolean; onClose?: () => void; onHighlightChange?: (index: number, total: number, activePhraseText?: string) => void; onSpeakingChange?: (isSpeaking: boolean) => void; onRecordingChange?: (isRecording: boolean) => void; disabled?: boolean; disabledMessage?: string; recAspectRatio?: '9:16' | '16:9'; setRecAspectRatio?: (val: '9:16' | '16:9') => void }) => {
  const [localText, setLocalText] = useState(text);
  
  useEffect(() => {
    setLocalText(text);
  }, [text]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Advanced Configurations
  const [wordStyleConfig, setWordStyleConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('boutique_word_style_config');
      if (saved) {
        return {
          fontFamily: 'font-sans',
          fontSize: 32,
          textTransform: 'uppercase',
          color: '#ffffff',
          bg: 'bg-black/40',
          stroke: '#000000',
          mode: 'original',
          transition: 'scale',
          mediaTransition: 'fade',
          transitionMs: 1000,
          position: 'bottom',
          bgDepth: 'medium',
          offsetY: 0,
          ...JSON.parse(saved)
        };
      }
    } catch (e) {}
    return {
      fontFamily: 'font-sans',
      fontSize: 32,
      textTransform: 'uppercase',
      color: '#ffffff',
      bg: 'bg-black/40',
      stroke: '#000000',
      mode: 'original', // 'original' (full phrase), '1', '7'
      transition: 'scale', // 'scale', 'fade', 'bounce', etc
      mediaTransition: 'fade',
      transitionMs: 1000,
      position: 'bottom',
      bgDepth: 'medium',
      offsetY: 0
    };
  });
  const updateWordStyleConfig = (updates: any) => {
    setWordStyleConfig(prev => {
      const merged = { ...prev, ...updates };
      localStorage.setItem('boutique_word_style_config', JSON.stringify(merged));
      window.dispatchEvent(new Event('boutique_word_style_change'));
      return merged;
    });
  };
  const [videoScale, setVideoScale] = useState(1);
  const [activeMediaUrl, setActiveMediaUrl] = useState(mediaUrl);
  const [prevMediaUrl, setPrevMediaUrl] = useState<string | undefined>(undefined);
  const [fadeOpacity, setFadeOpacity] = useState(1);

  useEffect(() => {
    if (mediaUrl !== activeMediaUrl) {
      setActiveMediaUrl(mediaUrl);
    }
  }, [mediaUrl, activeMediaUrl]);
  const [videoPos, setVideoPos] = useState({x: 0, y: 0});
  const [overlays, setOverlays] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('boutique_overlays');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });
  const saveOverlays = (ov: any[]) => {
    setOverlays(ov);
    localStorage.setItem('boutique_overlays', JSON.stringify(ov));
  };
  const [activeOverlayIds, setActiveOverlayIds] = useState<Set<string>>(new Set());
  const playbackStartTimeRef = useRef<number>(0);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);


  useEffect(() => {
    if (!isEditing) setLocalText(text);
  }, [text, isEditing]);

  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isKaraokeMode, setIsKaraokeMode] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (onRecordingChange) onRecordingChange(isRecording);
  }, [isRecording, onRecordingChange]);
  const [style, setStyle] = useState(KARAOKE_STYLES[3]);
  const [recordWithAudio, setRecordWithAudio] = useState(() => localStorage.getItem('boutique_record_audio') !== 'false');
  const mediaRecorderRef = useRef<any>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const stopRecordingMP4 = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Failed to stop media recorder", e);
      }
      setIsRecording(false);
      stopSpeech();
    }
  };

  const startRecordingMP4 = async () => {
    if (disabled) {
      alert(disabledMessage || "Chưa sẵn sàng để phát.");
      return;
    }
    try {
      const targetElement = document.getElementById("karaoke-recording-box") || document.getElementById("mobile-fullscreen-view");
      if (!targetElement) {
        alert("Không tìm thấy vùng quay Karaoke.");
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: recordWithAudio,
        // @ts-ignore
        preferCurrentTab: true,
        // @ts-ignore
        selfBrowserSurface: "include"
      });

      const videoElem = document.createElement("video");
      videoElem.srcObject = screenStream;
      videoElem.autoplay = true;
      videoElem.playsInline = true;
      videoElem.muted = true;

      await new Promise((resolve) => {
        videoElem.onloadedmetadata = () => {
          videoElem.play().then(resolve);
        };
      });

      const rect = targetElement.getBoundingClientRect();
      const baseDpr = window.devicePixelRatio || 1;
      const desiredHeight = 1080;
      const scaleFactor = Math.max(baseDpr, desiredHeight / rect.height);
      
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * scaleFactor;
      canvas.height = rect.height * scaleFactor;
      const ctx = canvas.getContext("2d");

      let animationFrameId: number;
      
      const drawLoop = () => {
        if (!ctx || videoElem.paused || videoElem.ended || !targetElement.isConnected) return;
        
        const currentRect = targetElement.getBoundingClientRect();
        
        // Coordinate mapping for local tab recording
        const scaleX = videoElem.videoWidth / window.innerWidth;
        const scaleY = videoElem.videoHeight / window.innerHeight;

        const sx = currentRect.left * scaleX;
        const sy = currentRect.top * scaleY;
        const sw = currentRect.width * scaleX;
        const sh = currentRect.height * scaleY;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoElem, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        animationFrameId = requestAnimationFrame(drawLoop);
      };

      drawLoop();

      // @ts-ignore
      const croppedVideoTrack = canvas.captureStream(30).getVideoTracks()[0];
      const audioTracks = screenStream.getAudioTracks();
      const combinedTracks = [croppedVideoTrack];
      
      if (recordWithAudio && audioTracks.length > 0) {
        combinedTracks.push(audioTracks[0]);
      }

      const combinedStream = new MediaStream(combinedTracks);
      // ALWAYS preview with webm on browsers that support it to prevent audio drop issues when mixing canvas and system audio, fallback to mp4 for Safari
      let mime = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mime)) {
        mime = 'video/webm';
        if (!MediaRecorder.isTypeSupported(mime)) {
          mime = 'video/mp4';
        }
      }
      const extension = mime.includes('mp4') ? 'mp4' : 'webm';
      const recorder = new MediaRecorder(combinedStream, { 
        mimeType: mime,
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality 1080p+
      });
      
      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        cancelAnimationFrame(animationFrameId);
        screenStream.getTracks().forEach(t => t.stop());
        videoElem.pause();
        videoElem.srcObject = null;
        
        setTimeout(() => {
            const blob = new Blob(recordedChunksRef.current, { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.display = 'none';
            a.href = url;
            a.download = `video-tu-van.${extension}`;
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 500);
            setIsRecording(false);
        }, 100);
      };
      
      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      
      setTimeout(() => startSpeech(), 500);
      
    } catch (e) {
      console.error(e);
      alert("Trình duyệt di động không hỗ trợ tự động Quay & tải MP4. Vui lòng bấm 'Nghe tư vấn' và dùng tính năng KIẾT XUẤT/QUAY MÀN HÌNH có sẵn của điện thoại.");
    }
  };

  const handleStartRecording = () => {
    if (disabled) {
      alert(disabledMessage || "Chưa sẵn sàng để phát.");
      return;
    }
    if (recordWithAudio) {
      const confirmOk = confirm("HƯỚNG DẪN QUAY VIDEO TIKTOK CÓ SẴN ÂM THANH:\n\n1. Trình duyệt sẽ hiện hộp thoại yêu cầu quyền quay.\n2. Vui lòng bấm chọn tab 'TƯ VẤN THỜI TRANG AI' (Tab hiện tại).\n3. Tích chọn ô 'Chia sẻ âm thanh hệ thống' (Share system audio) ở góc dưới bên trái hộp thoại.\n4. Bấm 'Chia sẻ' (Share) để bắt đầu quay.\n\nBấm OK để tiếp tục.");
      if (!confirmOk) return;
    }
    startRecordingMP4();
  };
  
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => localStorage.getItem('boutique_voice_uri') || '');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(() => parseFloat(localStorage.getItem('boutique_voice_speed') || '1'));

  const [videoPresets, setVideoPresets] = useState<VideoPreset[]>(() => {
    try {
      const saved = localStorage.getItem('boutique_video_presets');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const saveCurrentAsPreset = (name: string) => {
    if (!name) name = `Cài đặt ${videoPresets.length + 1}`;
    const newPreset: VideoPreset = {
      id: uuidv4(),
      name,
      config: {
        bgMusicUrl,
        bgMusicName,
        musicVolume,
        selectedVoiceURI,
        voiceSpeed,
        wordStyleConfig,
        isKaraokeMode,
        recordWithAudio,
        videoScale,
        videoPos,
        overlays
      }
    };
    const updated = [...videoPresets, newPreset];
    setVideoPresets(updated);
    localStorage.setItem('boutique_video_presets', JSON.stringify(updated));
    alert(`Đã lưu bộ cài đặt: ${name}`);
  };

  const loadPreset = (preset: VideoPreset) => {
    const { config } = preset;
    updateMusic(config.bgMusicUrl, config.bgMusicName);
    updateVolume(config.musicVolume);
    setSelectedVoiceURI(config.selectedVoiceURI);
    localStorage.setItem('boutique_voice_uri', config.selectedVoiceURI);
    setVoiceSpeed(config.voiceSpeed);
    localStorage.setItem('boutique_voice_speed', config.voiceSpeed.toString());
    updateWordStyleConfig(config.wordStyleConfig);
    setIsKaraokeMode(config.isKaraokeMode);
    setRecordWithAudio(config.recordWithAudio);
    localStorage.setItem('boutique_record_audio', String(config.recordWithAudio));
    setVideoScale(config.videoScale);
    setVideoPos(config.videoPos);
    saveOverlays(config.overlays || []);
    window.dispatchEvent(new Event('boutique_voice_change'));
    alert(`Đã áp dụng bộ cài đặt: ${preset.name}`);
  };

  const deletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Xóa bộ cài đặt này?")) return;
    const updated = videoPresets.filter(p => p.id !== id);
    setVideoPresets(updated);
    localStorage.setItem('boutique_video_presets', JSON.stringify(updated));
  };
  const [imageModel, setImageModel] = useState<'imagen' | 'flux'>(() => (localStorage.getItem('boutique_image_model') as 'imagen' | 'flux') || 'imagen');

  useEffect(() => {
    const loadVoices = () => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      let filtered = window.speechSynthesis.getVoices().filter(v => v.lang.includes('vi'));
      if (filtered.length === 0) {
          filtered = window.speechSynthesis.getVoices().slice(0, 10);
      }
      setVoices(filtered);
      
      const stored = localStorage.getItem('boutique_voice_uri');
      if (stored === 'GT_Female' || stored === 'uploaded_voice' || (stored && filtered.find(v => v.voiceURI === stored))) {
        setSelectedVoiceURI(stored);
      } else if (filtered.length > 0) {
        const googleVoice = filtered.find(v => v.name.includes('Google'));
        setSelectedVoiceURI(googleVoice ? googleVoice.voiceURI : filtered[0].voiceURI);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('boutique_voice_uri');
      if (stored && stored !== selectedVoiceURI) {
        setSelectedVoiceURI(stored);
      }
      const storedSpeed = localStorage.getItem('boutique_voice_speed');
      if (storedSpeed && parseFloat(storedSpeed) !== voiceSpeed) {
        setVoiceSpeed(parseFloat(storedSpeed));
      }
      const storedModel = localStorage.getItem('boutique_image_model') as 'imagen' | 'flux';
      if (storedModel && storedModel !== imageModel) {
        setImageModel(storedModel);
      }
    };

    const handleStyleChange = () => {
      try {
        const saved = localStorage.getItem('boutique_word_style_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setWordStyleConfig(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {}
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('boutique_voice_change', handleStorageChange);
    window.addEventListener('boutique_word_style_change', handleStyleChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('boutique_voice_change', handleStorageChange);
      window.removeEventListener('boutique_word_style_change', handleStyleChange);
    };
  }, [selectedVoiceURI, voiceSpeed, imageModel, voices]);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedVoiceURI(uri);
    localStorage.setItem('boutique_voice_uri', uri);
    window.dispatchEvent(new Event('boutique_voice_change'));
  };

  const handleVoiceSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value);
    setVoiceSpeed(speed);
    localStorage.setItem('boutique_voice_speed', speed.toString());
    window.dispatchEvent(new Event('boutique_voice_change'));
  };

  const handleImageModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as 'imagen' | 'flux';
    setImageModel(model);
    localStorage.setItem('boutique_image_model', model);
    window.dispatchEvent(new Event('boutique_voice_change'));
  };

  const { words, phrases, wordToPhrase, phraseToWordStart } = useMemo(() => {
    if (!localText) return { words: [], phrases: [], wordToPhrase: [], phraseToWordStart: [] };
    
    const cleanText = localText.replace(/[*#_~`]/g, '');
    
    const wordsWithPunct: string[] = [];
    const phrasesItems: string[][] = [];
    const wordToPhraseIndex: number[] = [];
    const phraseStartIndices: number[] = [];
    
    let currentPhraseIndex = 0;
    
    let currentPhrase: string[] = [];
    const allWords = cleanText.split(/[ \t\n]+/).filter(w => w.length > 0);
    
    for (let i = 0; i < allWords.length; i++) {
        const word = allWords[i];
        if (currentPhrase.length === 0) {
            phraseStartIndices.push(wordsWithPunct.length);
        }
        wordsWithPunct.push(word);
        currentPhrase.push(word);
        wordToPhraseIndex.push(currentPhraseIndex);
        
        const isBoundary = /[,.!?\n\r]+$/.test(word);
        
        // We break phrases only at punctuation or end of text to ensure reading continuity
        // EVEN IF in 1 or 7 words mode. Visual chunking is handled during render.
        let shouldBreak = isBoundary;

        if (shouldBreak || i === allWords.length - 1) {
            phrasesItems.push(currentPhrase);
            currentPhrase = [];
            currentPhraseIndex++;
        }
    }
    
    return {
        words: wordsWithPunct,
        phrases: phrasesItems,
        wordToPhrase: wordToPhraseIndex,
        phraseToWordStart: phraseStartIndices
    };
   }, [localText, wordStyleConfig.mode]);

  const [activePhraseIndex, setActivePhraseIndex] = useState(-1);
  const activeWordStart = activePhraseIndex >= 0 ? phraseToWordStart[activePhraseIndex] : 0;
  
  useEffect(() => {
    if (onHighlightChange) {
      const activePhraseText = activePhraseIndex >= 0 && activePhraseIndex < phrases.length ? phrases[activePhraseIndex].join(' ') : undefined;
      onHighlightChange(highlightIndex, words.length, activePhraseText);
    }
  }, [highlightIndex, words.length, activePhraseIndex, phrases, onHighlightChange]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightIndex >= 0 && containerRef.current) {
      const activeEl = containerRef.current.querySelector('.karaoke-active-word');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightIndex]);

  const displayedWordsFull = isKaraokeMode && activePhraseIndex >= 0
    ? phrases[activePhraseIndex] || []
    : isKaraokeMode ? phrases[0] || [] : words;
  
  let displayedWords = displayedWordsFull;
  if (isKaraokeMode && (wordStyleConfig.mode === '1' || wordStyleConfig.mode === '7')) {
    const limit = parseInt(wordStyleConfig.mode);
    const startIdxInPhrase = highlightIndex - phraseToWordStart[activePhraseIndex];
    if (startIdxInPhrase >= 0) {
      const chunkStart = Math.floor(startIdxInPhrase / limit) * limit;
      displayedWords = displayedWordsFull.slice(chunkStart, chunkStart + limit);
    }
  }
    
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isActiveRef = useRef(false);
  
  // Background Music
  const [bgMusicUrl, setBgMusicUrl] = useState(() => localStorage.getItem('boutique_bg_music_url') || '');
  const [bgMusicName, setBgMusicName] = useState(() => localStorage.getItem('boutique_bg_music_name') || '');
  const [musicVolume, setMusicVolume] = useState(() => parseFloat(localStorage.getItem('boutique_bg_music_volume') || '0.3'));
  const [showMusicInput, setShowMusicInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleStorage = () => {
       setBgMusicUrl(localStorage.getItem('boutique_bg_music_url') || '');
       setBgMusicName(localStorage.getItem('boutique_bg_music_name') || '');
       setMusicVolume(parseFloat(localStorage.getItem('boutique_bg_music_volume') || '0.3'));
    };
    window.addEventListener('boutique_music_change', handleStorage);
    return () => window.removeEventListener('boutique_music_change', handleStorage);
  }, []);

  const updateMusic = (url: string, name: string) => {
    setBgMusicUrl(url);
    setBgMusicName(name);
    localStorage.setItem('boutique_bg_music_url', url);
    localStorage.setItem('boutique_bg_music_name', name);
    window.dispatchEvent(new Event('boutique_music_change'));
  };

  const updateVolume = (vol: number) => {
    setMusicVolume(vol);
    localStorage.setItem('boutique_bg_music_volume', vol.toString());
    window.dispatchEvent(new Event('boutique_music_change'));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume, bgMusicUrl]);

  const stopSpeech = (shouldStopRecording = false) => {
    isActiveRef.current = false;
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    
    // Stop all pending AI audios
    aiAudioRefs.current.forEach(snd => {
      snd.pause();
      snd.currentTime = 0;
    });
    aiAudioRefs.current = [];
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Stop all media playback inside MediaDisplay
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      v.pause();
      v.currentTime = 0;
    });

    // Also stop any global background audio tracking
    // Removed dispatch event causing recursive loop
    
    setIsSpeaking(false);
    setHighlightIndex(-1);
    setActivePhraseIndex(-1);
    if (shouldStopRecording) stopRecordingMP4();
  };

  const aiAudioRefs = useRef<HTMLAudioElement[]>([]); // To manage cleanup if stopped while playing

  const playPhrase = async (phraseIndex: number) => {
    if (!isActiveRef.current || phraseIndex >= phrases.length) {
      setIsSpeaking(false);
      setHighlightIndex(-1);
      setActivePhraseIndex(-1);
      if (isActiveRef.current) onComplete?.();
      return;
    }

    setActivePhraseIndex(phraseIndex);
    const phraseWords = phrases[phraseIndex];
    setHighlightIndex(phraseToWordStart[phraseIndex]);

    const phraseText = phraseWords.join(" ");
    let delayMs = 0;
    if (phraseText.trim().match(/[,，、]/)) delayMs = 200;
    else if (phraseText.trim().match(/[.?!。？！]/)) delayMs = 800;
    else if (phraseText.trim().match(/[;:；：]/)) delayMs = 400;
    
    const cleanText = phraseText.replace(/\[([^\]]+)\]/g, match => ' '.repeat(match.length)).replace(/[,.!?;\n]/g, match => ' '.repeat(match.length));

    if (selectedVoiceURI === 'uploaded_voice') {
      const uploadedUrl = localStorage.getItem('boutique_uploaded_voice_url');
      if (uploadedUrl) {
        try {
          const snd = new Audio(uploadedUrl);
          snd.playbackRate = voiceSpeed;
          aiAudioRefs.current.push(snd);
          
          let fallbackInterval: any = null;
          let localIndex = 0;
          
          snd.onplay = () => {
             // Precise sync: distribute words based on duration
             const durationPerWord = ((snd.duration / voiceSpeed) * 1000) / phraseWords.length;
             fallbackInterval = setInterval(() => {
                if (!isActiveRef.current) {
                  clearInterval(fallbackInterval);
                  return;
                }
                setHighlightIndex(phraseToWordStart[phraseIndex] + localIndex);
                localIndex++;
                if (localIndex >= phraseWords.length) clearInterval(fallbackInterval);
             }, Math.max(50, durationPerWord || 150));
          };

          snd.onended = () => {
            if (fallbackInterval) clearInterval(fallbackInterval);
            const idx = aiAudioRefs.current.indexOf(snd);
            if (idx > -1) aiAudioRefs.current.splice(idx, 1);
            if (isActiveRef.current) playPhrase(phraseIndex + 1);
          };

          snd.onerror = () => {
            if (isActiveRef.current) playPhrase(phraseIndex + 1);
          };

          await snd.play();
          return;
        } catch (e) { console.error(e); }
      }
    }

    if (selectedVoiceURI === 'GT_Female' || selectedVoiceURI.startsWith('AI_')) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: cleanText, voice: selectedVoiceURI })
        });
        const data = await res.json();
        
        if (!isActiveRef.current) return;
        
        if (data.audio) {
          const snd = new Audio(data.audio);
          snd.playbackRate = voiceSpeed;
          aiAudioRefs.current.push(snd);
          
          let fallbackInterval: any = null;
          let localIndex = 0;
          
          snd.onplay = () => {
             fallbackInterval = setInterval(() => {
                if (!isActiveRef.current) {
                  clearInterval(fallbackInterval);
                  return;
                }
                setHighlightIndex(phraseToWordStart[phraseIndex] + localIndex);
                localIndex++;
                if (localIndex >= phraseWords.length) clearInterval(fallbackInterval);
             }, Math.max(150, ((snd.duration / voiceSpeed) * 1000) / phraseWords.length || 200));
          };

          snd.onended = () => {
            if (fallbackInterval) clearInterval(fallbackInterval);
            const idx = aiAudioRefs.current.indexOf(snd);
            if (idx > -1) aiAudioRefs.current.splice(idx, 1);
            if (isActiveRef.current) {
              if (delayMs > 0) setTimeout(() => playPhrase(phraseIndex + 1), delayMs);
              else playPhrase(phraseIndex + 1);
            }
          };
          
          snd.onerror = () => {
             if (isActiveRef.current) setTimeout(() => playPhrase(phraseIndex + 1), 50);
          };

          await snd.play();
          return;
        }
      } catch (err) {
        console.error("GT TTS error:", err);
      }
    }

    // Fallback to SpeechSynthesis
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = voiceSpeed;
    
    const activeVoices = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis.getVoices() : voices;
    if (selectedVoiceURI && activeVoices.length > 0) {
      const voice = activeVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
      else utterance.lang = 'vi-VN';
    } else {
      utterance.lang = 'vi-VN';
    }
    
    let boundaryCount = 0;
    let fallbackInterval: any = null;

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        boundaryCount++;
        const charIndex = event.charIndex;
        let cumulativeChars = 0;
        for (let i = 0; i < phraseWords.length; i++) {
          const wordLen = phraseWords[i]?.length || 0;
          if (charIndex >= cumulativeChars && charIndex <= cumulativeChars + wordLen + 1) {
            setHighlightIndex(phraseToWordStart[phraseIndex] + i);
            break;
          }
          cumulativeChars += wordLen + 1;
        }
      }
    };

    utterance.onstart = () => {
      setTimeout(() => {
        if (boundaryCount === 0 && window.speechSynthesis.speaking) {
          let localIndex = 0;
          fallbackInterval = setInterval(() => {
            if (!window.speechSynthesis.speaking || !isActiveRef.current) {
              clearInterval(fallbackInterval);
              return;
            }
            setHighlightIndex(phraseToWordStart[phraseIndex] + localIndex);
            localIndex++;
            if (localIndex >= phraseWords.length) clearInterval(fallbackInterval);
          }, 200);
        }
      }, 150);
    };

    utterance.onend = () => {
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (isActiveRef.current) {
        if (delayMs > 0) setTimeout(() => playPhrase(phraseIndex + 1), delayMs);
        else playPhrase(phraseIndex + 1);
      }
    };

    utterance.onerror = (err) => {
      console.error("Speech error:", err);
      if (fallbackInterval) clearInterval(fallbackInterval);
      if (isActiveRef.current) {
        setTimeout(() => playPhrase(phraseIndex + 1), 50);
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startSpeech = () => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    stopSpeech();
    setIsSpeaking(true);
    isActiveRef.current = true;
    onSpeakingChange?.(true);
    
    if (audioRef.current && bgMusicUrl) {
      audioRef.current.play().catch(e => console.warn('Audio play prevented:', e));
    }
    
    playbackStartTimeRef.current = performance.now();
    setCurrentPlaybackTime(0);
    playPhrase(0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    alert("Đã sao chép!");
  };

  const handleDownload = () => {
    const file = new Blob([text], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = "tu-van-thoi-trang.txt";
    document.body.appendChild(element);
    element.click();
  };

  useEffect(() => {
    stopSpeech();
   }, [localText]);

  useEffect(() => {
    let interval: any;
    if (isSpeaking) {
      interval = setInterval(() => {
        const now = performance.now();
        const elapsed = (now - playbackStartTimeRef.current) / 1000;
        setCurrentPlaybackTime(elapsed);
        
        const newActiveIds = new Set<string>();
        overlays.forEach(o => {
          if (elapsed >= (o.startTime || 0) && elapsed <= (o.startTime || 0) + (o.duration || 5)) {
            newActiveIds.add(o.id);
          }
        });
        setActiveOverlayIds(newActiveIds);
      }, 100);
    } else {
      setActiveOverlayIds(new Set());
      setCurrentPlaybackTime(0);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, overlays]);

  const OverlayIcon = ({ type, className }: { type: string, className?: string }) => {
    switch (type) {
      case 'heart': return <Heart className={cn("fill-red-500 text-red-500", className)} />;
      case 'rose': return <Flower2 className={cn("fill-pink-500 text-pink-500", className)} />;
      case 'like': return <ThumbsUp className={cn("fill-blue-500 text-blue-500", className)} />;
      case 'sub': return <div className={cn("flex flex-col items-center", className)}>
        <BellRing className="fill-yellow-400 text-yellow-600 w-full h-full" />
        <span className="text-[10px] font-bold text-white bg-red-600 px-1 rounded -mt-2">SUBSCRIBE</span>
      </div>;
      case 'circle': return <Circle className={cn("text-red-600 stroke-[4px]", className)} />;
      case 'arrow': return <ArrowRight className={cn("text-yellow-400 stroke-[4px]", className)} />;
      default: return null;
    }
  };

  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handlePauseRequest = (e: any) => {
       // Only stop if the event didn't originate from this component or if it's external
       if (e.detail?.source === 'internal') return;
       stopSpeech(false);
       if (audioRef.current) audioRef.current.pause();
    };
    window.addEventListener('boutique_audio_pause_request', handlePauseRequest);

    if (!isFullscreen) {
      window.dispatchEvent(new CustomEvent('boutique_audio_pause_request', { detail: { source: 'internal' } }));
    }

    return () => window.removeEventListener('boutique_audio_pause_request', handlePauseRequest);
  }, [isFullscreen]);

  const progressPercentage = useMemo(() => {
    if (!words.length || highlightIndex < 0) return 0;
    return Math.min(100, (highlightIndex / words.length) * 100);
  }, [highlightIndex, words.length]);

  const positionClass = isFullscreen 
    ? (wordStyleConfig.position === 'top' ? "items-start pt-[10%]" : wordStyleConfig.position === 'middle' ? "items-center" : "items-end pb-[15%]")
    : (wordStyleConfig.position === 'top' ? "items-start pt-10" : wordStyleConfig.position === 'middle' ? "items-center" : "items-end pb-10");

  return (
    <div className={cn("relative group transition-all duration-500", isFullscreen ? "h-full w-full overflow-hidden flex flex-row-reverse" : "space-y-6")} translate="no">
      <audio ref={audioRef} src={bgMusicUrl} loop />
      
      {isFullscreen && (
        <div className={cn(
          "h-full bg-black/95 border-l border-white/10 flex flex-col transition-all duration-500 overflow-y-auto custom-scrollbar z-[250]",
          (isRecording || isSpeaking) ? "w-0 opacity-0 border-none invisible p-0" : "w-80 opacity-100 visible p-6"
        )}>
          <div className="flex flex-col gap-6 min-w-[270px]">
          
          {/* Preset Section Header with Close Button */}
          <div className="flex justify-between items-center bg-white/5 -mx-6 -mt-6 p-4 border-b border-white/10 mb-2">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 rounded-lg">
                   <Settings2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Cấu hình Video</h3>
             </div>
             <button 
               onClick={() => {
                 stopSpeech(isRecording);
                 onClose?.();
               }}
               className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all"
               title="Đóng (X)"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
          
          {/* LAYER 1: SOUND & VOICE */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Volume2 className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Lớp 1: Âm thanh & Giọng đọc</span>
             </div>
             
             {/* Music Selection - Predefined block */}
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                   <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1"><Music className="w-3 h-3" /> Nhạc nền TikTok</span>
                   <button onClick={() => setShowMusicInput(!showMusicInput)} className="text-[8px] text-amber-500 hover:underline">{showMusicInput ? 'Đóng' : 'Mở kho nhạc'}</button>
                </div>
                {showMusicInput && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      {PREDEFINED_MUSIC.map(m => (
                        <button
                          key={m.id}
                          onClick={() => updateMusic(m.url, m.name)}
                          className={cn("px-2 py-1.5 text-[8px] rounded border text-left truncate transition-all", bgMusicUrl === m.url ? "bg-amber-500 text-white border-amber-600 font-bold" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10")}
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => audioInputRef.current?.click()} className="flex-1 py-1.5 bg-white/10 text-white text-[8px] font-bold rounded-lg border border-white/10 flex items-center justify-center gap-1"><Upload className="w-3 h-3" /> File nhạc</button>
                       {bgMusicUrl && <button onClick={() => updateMusic('', '')} className="p-1 px-2 text-red-400 text-[8px] rounded-lg border border-red-500/20">X</button>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[8px] text-white/40 font-mono">
                        <span>Âm lượng</span>
                        <span>{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={e => updateVolume(parseFloat(e.target.value))} className="w-full accent-amber-500" />
                    </div>
                  </div>
                )}
             </div>

             {/* Voice Selection */}
             <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1"><Mic className="w-3 h-3" /> Giọng đọc AI</span>
                <select 
                  value={selectedVoiceURI} 
                  onChange={handleVoiceChange}
                  className="w-full bg-white/5 text-white text-[11px] p-2.5 rounded-xl border border-white/10 outline-none"
                >
                  <option value="GT_Female">Nữ (Google Dịch)</option>
                  <option value="uploaded_voice">📁 Giọng đọc đã tải lên</option>
                  <option value="AI_HN_Female">Nữ - Hà Nội (AI)</option>
                  <option value="AI_SG_Female">Nữ - Miền Nam (AI)</option>
                  {voices.map((v, idx) => (
                    <option key={v.voiceURI || idx} value={v.voiceURI}>{v.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.onchange = (e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        localStorage.setItem('boutique_uploaded_voice_url', url);
                        setSelectedVoiceURI('uploaded_voice');
                        localStorage.setItem('boutique_voice_uri', 'uploaded_voice');
                        window.dispatchEvent(new Event('boutique_voice_change'));
                      }
                    };
                    input.click();
                  }}
                  className="w-full py-2 bg-white/5 text-white/70 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-3 h-3" /> Tải giọng đọc
                </button>
             </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* LAYER 2: TEXT & KARAOKE */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <TextQuote className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Lớp 2: Chữ & Karaoke</span>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-bold text-white/30 uppercase">Hiển thị</span>
                   <select value={wordStyleConfig.mode} onChange={e => updateWordStyleConfig({mode: e.target.value})} className="w-full bg-white/5 text-white text-[10px] p-2 rounded-lg border border-white/10 outline-none">
                      <option value="original">Toàn bộ câu</option>
                      <option value="7">7 chữ/dòng</option>
                      <option value="1">1 chữ (Từng từ)</option>
                   </select>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-bold text-white/30 uppercase">Hiệu ứng</span>
                   <select value={wordStyleConfig.transition} onChange={e => updateWordStyleConfig({transition: e.target.value})} className="w-full bg-white/5 text-white text-[10px] p-2 rounded-lg border border-white/10 outline-none">
                      <option value="scale">Zoom</option>
                      <option value="fade">Mờ dần</option>
                      <option value="bounce">Nảy lớn</option>
                      <option value="slide_up">Trượt lên</option>
                      <option value="slide_down">Trượt xuống</option>
                      <option value="flash">Chớp</option>
                   </select>
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <span className="text-[8px] font-bold text-white/30 uppercase">Bộ Kiểu chữ</span>
                <div className="flex gap-2">
                   {KARAOKE_STYLES.map(s => (
                     <button 
                       key={s.id} 
                       onClick={() => setStyle(s)}
                       className={cn(
                         "w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center",
                         style.id === s.id ? "border-amber-500 scale-110 shadow-lg" : "border-white/20 hover:border-white/40",
                         s.id === 'classic' ? "bg-orange-500" : s.id === 'modern' ? "bg-sky-500" : s.id === 'gold' ? "bg-yellow-600" : "bg-purple-600"
                       )}
                     >
                       <span className="text-[8px] font-bold text-white truncate px-0.5">{s.id.charAt(0).toUpperCase()}</span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Vị trí</span>
                    <select value={wordStyleConfig.position || 'bottom'} onChange={e => updateWordStyleConfig({position: e.target.value})} className="w-full bg-white/5 text-white text-[10px] p-2 rounded-lg border border-white/10 outline-none">
                       <option value="top">Trên</option>
                       <option value="middle">Giữa</option>
                       <option value="bottom">Dưới</option>
                    </select>
                 </div>
                 <div className="flex flex-col gap-1">
                    <span className="text-[8px] font-bold text-white/30 uppercase">Nền</span>
                    <select value={wordStyleConfig.bgDepth || 'medium'} onChange={e => updateWordStyleConfig({bgDepth: e.target.value})} className="w-full bg-white/5 text-white text-[10px] p-2 rounded-lg border border-white/10 outline-none">
                       <option value="none">Trong</option>
                       <option value="light">Mờ</option>
                       <option value="medium">Vừa</option>
                       <option value="dark">Đậm</option>
                    </select>
                 </div>
             </div>

             {/* Icons section moved here */}
             <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1"><PlusCircle className="w-3 h-3" /> Chèn Icon & Overlay</span>
                <div className="flex flex-wrap gap-1.5">
                   {[
                     { id: 'heart', icon: 'heart', label: 'Tim' },
                     { id: 'rose', icon: 'rose', label: 'Hồng' },
                     { id: 'like', icon: 'like', label: 'Like' },
                     { id: 'sub', icon: 'sub', label: 'Sub' },
                     { id: 'circle', icon: 'circle', label: 'Vòng' },
                     { id: 'arrow', icon: 'arrow', label: 'Mũi tên' }
                   ].map(opt => (
                     <button
                       key={opt.id}
                       onClick={() => {
                         const newOv = {
                           id: uuidv4(),
                           type: opt.id,
                           x: 50,
                           y: 50,
                           scale: 1,
                           startTime: parseFloat(currentPlaybackTime.toFixed(1)),
                           duration: 5
                         };
                         saveOverlays([...overlays, newOv]);
                       }}
                       className="p-1 px-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-all flex items-center gap-1.5"
                     >
                       <OverlayIcon type={opt.id} className="w-3.5 h-3.5" />
                       <span className="text-[8px] font-bold opacity-70">{opt.label}</span>
                     </button>
                   ))}
                </div>
                {overlays.length > 0 && (
                   <div className="flex flex-col gap-1 mt-1 max-h-[100px] overflow-y-auto custom-scrollbar pr-1">
                      {overlays.map(ov => (
                        <div key={ov.id} className="text-[8px] p-1.5 bg-white/5 rounded flex items-center justify-between border border-white/5">
                           <div className="flex items-center gap-2">
                              <OverlayIcon type={ov.type} className="w-3 h-3" />
                              <span className="text-white/50">{ov.startTime}s - {ov.duration}s</span>
                           </div>
                           <button onClick={() => saveOverlays(overlays.filter(o => o.id !== ov.id))} className="text-red-400">X</button>
                        </div>
                      ))}
                   </div>
                )}
             </div>
          </div>

          <div className="h-px bg-white/10 w-full" />

          {/* LAYER 3: VIDEO & KHUNG HÌNH */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Lớp 3: Video & Khung hình</span>
             </div>

             <div className="flex flex-col gap-2">
                <span className="text-[8px] font-bold text-white/30 uppercase">Căn Chỉnh Video</span>
                <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto">
                   <div />
                   <button onClick={() => setVideoPos(p => ({...p, y: p.y - 10}))} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10"><ArrowUp className="w-4 h-4" /></button>
                   <div />
                   <button onClick={() => setVideoPos(p => ({...p, x: p.x - 10}))} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10"><ArrowLeft className="w-4 h-4" /></button>
                   <div className="flex flex-col gap-0.5">
                      <button onClick={() => setVideoScale(s => s + 0.1)} className="p-1 bg-white/10 rounded-t border border-white/10"><Plus className="w-3 h-3 mx-auto" /></button>
                      <button onClick={() => setVideoScale(s => Math.max(0.5, s - 0.1))} className="p-1 bg-white/10 rounded-b border border-white/10 border-t-0"><Minus className="w-3 h-3 mx-auto" /></button>
                   </div>
                   <button onClick={() => setVideoPos(p => ({...p, x: p.x + 10}))} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10"><ArrowRight className="w-4 h-4" /></button>
                   <div />
                   <button onClick={() => setVideoPos(p => ({...p, y: p.y + 10}))} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10"><ArrowDown className="w-4 h-4" /></button>
                   <div />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-bold text-white/30 uppercase">Tỷ lệ</span>
                   <button 
                     onClick={() => setRecAspectRatio?.(recAspectRatio === '9:16' ? '16:9' : '9:16')}
                     className="w-full py-2 bg-white/5 text-white text-[9px] font-bold rounded-lg border border-white/10"
                   >
                     {recAspectRatio}
                   </button>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-bold text-white/30 uppercase">Timeline</span>
                   <div className="flex items-center gap-2 bg-white/5 px-2 py-1.5 rounded-lg border border-white/10">
                      <span className="text-[8px] font-mono text-amber-500">{currentPlaybackTime.toFixed(1)}s</span>
                      <input type="range" min="0" max={Math.max(60, words.length * 0.5)} step="0.1" value={currentPlaybackTime} onChange={e => {
                        const nextTime = parseFloat(e.target.value);
                        setCurrentPlaybackTime(nextTime);
                        const newActiveIds = new Set<string>();
                        overlays.forEach(o => { if (nextTime >= (o.startTime || 0) && nextTime <= (o.startTime || 0) + (o.duration || 5)) newActiveIds.add(o.id); });
                        setActiveOverlayIds(newActiveIds);
                      }} className="flex-1 accent-amber-500 h-1" />
                   </div>
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                   <span className="text-[8px] font-bold text-white/30 uppercase">Bộ Cài Đặt (Preset)</span>
                   <button onClick={() => { const name = prompt("Tên bộ cài đặt:", `Tùy chỉnh ${videoPresets.length + 1}`); if (name) saveCurrentAsPreset(name); }} className="p-1 px-2.5 bg-amber-500 text-white text-[8px] font-bold rounded-lg">Lưu mới</button>
                </div>
                <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                   {videoPresets.map(p => (
                     <div key={p.id} className="group p-2 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between cursor-pointer hover:bg-white/10" onClick={() => loadPreset(p)}>
                        <span className="text-[9px] text-white/80">{p.name}</span>
                        <button onClick={(e) => deletePreset(p.id, e)} className="opacity-0 group-hover:opacity-100 p-1 text-red-400">D</button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
             <button
               onClick={() => {
                 stopSpeech(isRecording);
                 onClose?.();
               }}
               className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all font-bold uppercase text-[10px] tracking-widest"
             >
                <CheckCircle2 className="w-4 h-4" /> Hoàn tất & Đóng
             </button>
          </div>
        </div>
      </div>
    )}

      <div className={cn("flex-1 h-full relative transition-all duration-500", isFullscreen ? "w-full" : "w-full")}>
      <div className={cn(
        "flex flex-wrap items-center justify-between gap-3 transition-all duration-500",
        (!isFullscreen && (isRecording || isSpeaking)) ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible",
        isFullscreen && "fixed bottom-8 left-1/2 -translate-x-1/2 z-[250] flex-row items-center justify-center gap-4 pointer-events-auto bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/10 opacity-0 group-hover:opacity-100"
      )}>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => {
              if (disabled) {
                alert(disabledMessage || "Chưa sẵn sàng để phát.");
                return;
              }
              isSpeaking ? stopSpeech(false) : startSpeech();
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm",
              disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#1A1A1A] text-white hover:bg-black"
            )}
          >
            {isSpeaking ? <><VolumeX className="w-3 h-3 animate-pulse" /> Dừng Đọc</> : <><Play className="w-3 h-3" /> Nghe tư vấn</>}
          </button>
          
          {isRecording && (
              <button 
                onClick={() => { stopSpeech(true); stopRecordingMP4(); }}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm bg-red-600 text-white hover:bg-red-700 animate-pulse pointer-events-auto"
                title="Dừng Quay MP4"
              >
                <Video className="w-3 h-3" /> Dừng Quay
              </button>
          )}
          
          {!isRecording && (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleStartRecording}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm",
                  disabled ? "bg-gray-300 text-gray-500 cursor-not-allowed bg-opacity-50" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                )}
                title="Quay MP4"
              >
                <Video className="w-3 h-3" /> Quay MP4
              </button>
              
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] font-bold uppercase tracking-wider text-[#A09A94] hover:text-[#1A1A1A] transition-colors bg-[#F9F8F6] px-3 py-2 rounded-full border border-[#DDD6CE] shadow-sm select-none">
                <input 
                  type="checkbox" 
                  checked={recordWithAudio} 
                  onChange={(e) => {
                    setRecordWithAudio(e.target.checked);
                    localStorage.setItem('boutique_record_audio', String(e.target.checked));
                  }}
                  className="rounded border-[#DDD6CE] text-red-600 focus:ring-red-500 w-3' h-3' cursor-pointer" 
                  style={{ width: '12px', height: '12px' }}
                />
                <span>Kèm âm thanh</span>
              </label>
            </div>
          )}

          <button 
            onClick={() => alert("Tính năng Xuất trực tiếp Audio (.mp3) hiện đang bảo trì hoặc dành riêng cho hạng VIP. Quý khách vui lòng sử dụng chức năng Quay Màn Hình thông thường để thu cả Ảnh và Tiếng.")}
            className="flex items-center gap-2 px-3 py-2 bg-[#F9F8F6] text-[#A09A94] hover:text-[#1A1A1A] border border-[#DDD6CE] text-[10px] font-bold uppercase tracking-widest rounded-full transition-all"
            title="Tải nhạc MP3 tư vấn"
          >
            <Download className="w-3 h-3" /> Tải MP3
          </button>
          
          {!isFullscreen && (
            <button
              onClick={() => setShowMusicInput(!showMusicInput)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all border",
                showMusicInput || bgMusicUrl ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-[#F9F8F6] text-[#A09A94] hover:bg-[#EEEAE5] border-[#DDD6CE]"
              )}
            >
              <Music className="w-3 h-3" /> Nhạc nền
            </button>
          )}

          {!isFullscreen && (
            <div className="flex bg-[#F9F8F6] hover:bg-[#EEEAE5] border border-[#DDD6CE] py-1.5 rounded-full items-center px-3 transition-colors shrink-0 gap-2" title="Cài đặt giọng đọc">
              <select 
                value={selectedVoiceURI} 
                onChange={handleVoiceChange}
                className="bg-transparent text-[10px] font-bold uppercase outline-none max-w-[150px] truncate text-[#1A1A1A] cursor-pointer"
              >
                                <optgroup label="Giọng đọc & Tùy biến">
                  <option value="GT_Female">Nữ (Google Dịch)</option>
                  <option value="uploaded_voice">📁 Giọng đọc đã tải lên</option>
                  <option value="AI_HN_Female">Nữ - Hà Nội</option>
                  <option value="AI_SG_Female">Nữ - Miền Nam</option>
                </optgroup>
                <optgroup label="Hệ thống (Web Speech API)">
                {voices.length > 0 ? voices.map((v, idx) => (
                  <option key={v.voiceURI || idx} value={v.voiceURI}>{v.name.replace('Microsoft ', '').replace('Google ', '')}</option>
                )) : <option value="">Mặc định Máy</option>}
                </optgroup>
              </select>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'audio/*';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      localStorage.setItem('boutique_uploaded_voice_url', url);
                      setSelectedVoiceURI('uploaded_voice');
                      localStorage.setItem('boutique_voice_uri', 'uploaded_voice');
                      window.dispatchEvent(new Event('boutique_voice_change'));
                    }
                  };
                  input.click();
                }}
                className="p-1 hover:bg-black/5 rounded transition-colors"
                title="Tải lên giọng đọc riêng"
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
              </button>
              <div className="w-[1px] h-3 bg-[#DDD6CE]" />
              <select 
                value={voiceSpeed} 
                onChange={handleVoiceSpeedChange}
                className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer text-[#1A1A1A]"
                title="Tốc độ đọc"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2.0x</option>
              </select>
              <div className="w-[1px] h-3 bg-[#DDD6CE]" />
              <select 
                value={imageModel} 
                onChange={handleImageModelChange}
                className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer text-[#1A1A1A]"
                title="Model tạo ảnh"
              >
                <option value="imagen">Imagen 3</option>
                <option value="flux">FLUX.1</option>
              </select>
            </div>
          )}

          {!isFullscreen && (
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
            <input 
              type="file" 
              className="hidden" 
              id="voice-upload-input" 
              accept="audio/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  localStorage.setItem('boutique_uploaded_voice_url', url);
                  setSelectedVoiceURI('uploaded_voice');
                  localStorage.setItem('boutique_voice_uri', 'uploaded_voice');
                  alert("Đã nhận giọng đọc tải lên (Cơ chế khớp chữ tự động theo thời gian).");
                }
              }}
            />
            <button
               onClick={() => document.getElementById('voice-upload-input')?.click()}
               className="px-2 sm:px-3 py-1.5 flex items-center gap-1 rounded-[1.5rem] text-[9px] sm:text-[10px] font-bold uppercase transition-all text-[#7A7570] hover:bg-white/50"
            >
               <Upload className="w-3 h-3" /> Tải giọng
            </button>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <div className="flex gap-2">
            <button onClick={handleCopy} title="Sao chép" className="p-2 bg-white border border-[#EEEAE5] rounded-full hover:bg-[#F9F8F6] transition-colors"><Copy className="w-3 h-3" /></button>
            <button onClick={handleDownload} title="Tải xuống" className="p-2 bg-white border border-[#EEEAE5] rounded-full hover:bg-[#F9F8F6] transition-colors"><Download className="w-3 h-3" /></button>
          </div>
        )}

        {isKaraokeMode && !isFullscreen && (
          <div className="flex gap-1 ml-auto">
            <button 
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
              className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase transition-all border", showAdvancedConfig ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#7A7570] border-[#EEEAE5]")}
            >
              <Settings className="w-3 h-3" />
            </button>
            {KARAOKE_STYLES.map(s => (
              <button 
                key={s.id} 
                onClick={() => setStyle(s)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  style.id === s.id ? "border-[#1A1A1A]" : "border-transparent",
                  s.id === 'classic' ? "bg-yellow-100" : s.id === 'modern' ? "bg-gray-800" : s.id === 'gold' ? "bg-[#FFD700]" : "bg-purple-500"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {!isFullscreen && !isRecording && !isSpeaking && (
        <AnimatePresence>
          {showAdvancedConfig && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                 {/* Lớp 1 */}
                 <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-bold text-blue-500 uppercase flex items-center gap-1 shrink-0 bg-blue-50 px-2 py-0.5 rounded">Lớp 1 <Volume2 className="w-3 h-3" /></span>
                    <select value={selectedVoiceURI} onChange={handleVoiceChange} className="text-[10px] p-1.5 border rounded bg-white">
                      <option value="GT_Female">Nữ (Google)</option>
                      <option value="uploaded_voice">📁 Đã tải</option>
                      <option value="AI_HN_Female">Nữ Bắc</option>
                      <option value="AI_SG_Female">Nữ Nam</option>
                      {voices.slice(0, 5).map((v, idx) => <option key={v.voiceURI || idx} value={v.voiceURI}>{v.name}</option>)}
                    </select>
                 </div>

                 {/* Lớp 2 */}
                 <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-bold text-purple-500 uppercase flex items-center gap-1 shrink-0 bg-purple-50 px-2 py-0.5 rounded">Lớp 2 <TextQuote className="w-3 h-3" /></span>
                    <select value={wordStyleConfig.mode} onChange={e => updateWordStyleConfig({mode: e.target.value})} className="text-[10px] p-1.5 border rounded bg-white">
                       <option value="original">Cả câu</option>
                       <option value="7">7 chữ</option>
                       <option value="1">1 chữ</option>
                    </select>
                    <select value={wordStyleConfig.transition} onChange={e => updateWordStyleConfig({transition: e.target.value})} className="text-[10px] p-1.5 border rounded bg-white">
                       <option value="scale">Zoom</option>
                       <option value="fade">Mờ</option>
                       <option value="bubble">Bong bóng</option>
                    </select>
                    <select value={wordStyleConfig.position || 'bottom'} onChange={e => updateWordStyleConfig({position: e.target.value})} className="text-[10px] p-1.5 border rounded bg-white">
                       <option value="top">Trên</option>
                       <option value="middle">Giữa</option>
                       <option value="bottom">Dưới</option>
                    </select>
                    <div className="flex gap-1">
                       {KARAOKE_STYLES.map(s => (
                         <button key={s.id} onClick={() => setStyle(s)} className={cn("w-5 h-5 rounded-full border shadow-sm", style.id === s.id && "ring-2 ring-amber-500")} />
                       ))}
                    </div>
                 </div>

                 {/* Lớp 3 */}
                 <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1 shrink-0 bg-emerald-50 px-2 py-0.5 rounded">Lớp 3 <Video className="w-3 h-3" /></span>
                    <select value={wordStyleConfig.mediaTransition || 'fade'} onChange={e => updateWordStyleConfig({mediaTransition: e.target.value})} className="text-[10px] p-1.5 border rounded bg-white font-medium text-gray-700">
                      <option value="fade">Hòa trộn</option>
                      <option value="zoom">Phóng to</option>
                      <option value="blur_fade">Mờ & Hiện</option>
                    </select>
                    <div className="flex items-center gap-1 bg-white p-1 rounded border">
                       <button onClick={() => setVideoScale(s => s + 0.1)}><Plus className="w-3.5 h-3.5" /></button>
                       <button onClick={() => setVideoScale(s => Math.max(0.5, s - 0.1))}><Minus className="w-3.5 h-3.5" /></button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {showMusicInput && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-amber-800 mb-1 flex items-center justify-between">
                  <span>Chọn Nhạc Nền TikTok</span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PREDEFINED_MUSIC.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                           updateMusic(m.url, m.name);
                        }}
                        className={cn("px-2 py-1.5 text-[10px] rounded border text-left truncate transition-colors", bgMusicUrl === m.url ? "bg-amber-500 text-white border-amber-600 font-bold" : "bg-white text-amber-800 border-amber-200 hover:bg-amber-100")}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center mt-2">
                    <input 
                      type="file" 
                      accept="audio/*"
                      ref={audioInputRef}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateMusic(URL.createObjectURL(file), file.name);
                        }
                      }}
                    />
                    <button
                      onClick={() => audioInputRef.current?.click()}
                      className="flex-1 px-3 py-2 text-[10px] rounded-lg flex items-center justify-center gap-2 border border-amber-200 bg-white hover:bg-amber-50 text-amber-800 font-medium transition-colors"
                    >
                      <Upload className="w-3 h-3" /> Tải nhạc khác...
                    </button>
                    {bgMusicUrl && (
                      <button onClick={() => {
                        updateMusic('', '');
                        if (audioInputRef.current) audioInputRef.current.value = '';
                      }} className="p-2 border border-amber-200 bg-white text-amber-600 rounded-lg hover:bg-amber-100 px-3">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-amber-600/70 mt-1 italic">Nhạc sẽ tự phát kèm chữ karaoke và dừng khi kết thúc.</p>
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-amber-800">Âm lượng ({Math.round(musicVolume * 100)}%)</label>
                 <input 
                   type="range" 
                   min="0.0" 
                   max="1.0" 
                   step="0.05"
                   value={musicVolume}
                   onChange={e => updateVolume(parseFloat(e.target.value))}
                   className="w-full accent-amber-500"
                 />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      )}

      <div id="karaoke-recording-box" className={cn(
        "flex justify-center transition-[height,width,opacity,background-image] duration-1000 overflow-hidden relative",
        isFullscreen 
          ? `h-full bg-transparent p-4 ${positionClass} border-none rounded-none shadow-none ring-0 ${recAspectRatio === '9:16' ? 'aspect-[9/16] mx-auto' : 'w-full'}` 
          : `min-h-[220px] ${positionClass} p-10 rounded-[2.5rem]`,
        isEditing ? "bg-amber-50 border border-amber-200 block text-left w-full h-full" :
        isKaraokeMode && !isFullscreen
          ? wordStyleConfig.bg.startsWith('bg-[') ? wordStyleConfig.bg : style.id === 'classic' 
            ? "bg-gradient-to-br from-[#9a3412] via-[#ea580c] to-[#9a3412] shadow-[0_20px_50px_rgba(234,88,12,0.3)] ring-2 ring-orange-300/40" 
            : style.id === 'modern'
              ? "bg-gradient-to-br from-[#0369a1] via-[#0ea5e9] to-[#0369a1] shadow-[0_20px_50px_rgba(14,165,233,0.3)] ring-2 ring-sky-300/40"
              : style.id === 'gold'
                ? "bg-gradient-to-br from-[#1f2022] via-[#2F3134] to-[#141517] shadow-[0_20px_50px_rgba(0,0,0,0.4)] ring-2 ring-yellow-500/20"
                : "bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#7c3aed] shadow-[0_20px_50px_rgba(168,85,247,0.3)] ring-2 ring-purple-300/40"
          : (!isFullscreen ? "bg-white/50 backdrop-blur-sm border border-[#EEEAE5] block text-left" : "")
      )}>
        {isKaraokeMode && !isEditing && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center bg-black">
            <AnimatePresence mode="popLayout">
              {activeMediaUrl && (
                <motion.div
                  key={activeMediaUrl?.split('#')[0] || activeMediaUrl}
                  initial={
                    wordStyleConfig.mediaTransition === 'zoom' ? { scale: 1.5, opacity: 0 } :
                    wordStyleConfig.mediaTransition === 'slide_left' ? { x: '100%', opacity: 1 } :
                    wordStyleConfig.mediaTransition === 'slide_right' ? { x: '-100%', opacity: 1 } :
                    wordStyleConfig.mediaTransition === 'blur_fade' ? { filter: 'blur(20px)', opacity: 0 } :
                    { opacity: 0 }
                  }
                  animate={{ scale: 1, x: 0, filter: 'blur(0px)', opacity: 1 }}
                  exit={
                    wordStyleConfig.mediaTransition === 'zoom' ? { scale: 0.5, opacity: 0 } :
                    wordStyleConfig.mediaTransition === 'slide_left' ? { x: '-100%', opacity: 1 } :
                    wordStyleConfig.mediaTransition === 'slide_right' ? { x: '100%', opacity: 1 } :
                    wordStyleConfig.mediaTransition === 'blur_fade' ? { filter: 'blur(20px)', opacity: 0 } :
                    { opacity: 0 }
                  }
                  transition={{ duration: (wordStyleConfig.transitionMs || 1000) / 1000, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <MediaDisplay 
                    url={activeMediaUrl} 
                    className="w-full h-full object-cover" 
                    style={{ transform: `scale(${videoScale}) translate(${videoPos.x}px, ${videoPos.y}px)`, transition: 'transform 0.1s linear' }} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 z-[50] pointer-events-none">
               {overlays.map(ov => {
                 const isActive = isSpeaking || isRecording ? activeOverlayIds.has(ov.id) : true;
                 if (!isActive) return null;
                 
                 return (
                   <motion.div
                     key={ov.id}
                     drag={!isSpeaking && !isRecording}
                     dragMomentum={false}
                     dragElastic={0}
                     onDragEnd={(_, info) => {
                       const el = document.getElementById('karaoke-recording-box');
                       if (el) {
                          const rect = el.getBoundingClientRect();
                          // Calculate new percentage based on drag result
                          const finalX = ((ov.x / 100) * rect.width) + info.offset.x;
                          const finalY = ((ov.y / 100) * rect.height) + info.offset.y;
                          const nx = Math.max(0, Math.min(100, (finalX / rect.width) * 100));
                          const ny = Math.max(0, Math.min(100, (finalY / rect.height) * 100));
                          saveOverlays(overlays.map(o => o.id === ov.id ? { ...o, x: nx, y: ny } : o));
                       }
                     }}
                     style={{
                        position: 'absolute',
                        left: `${ov.x}%`,
                        top: `${ov.y}%`,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: isSpeaking || isRecording ? 'none' : 'auto',
                        zIndex: 100
                     }}
                     className="group/ov pointer-events-auto cursor-move active:cursor-grabbing"
                   >
                     <div style={{ transform: `scale(${ov.scale})` }} className="relative">
                        <OverlayIcon type={ov.type} className="w-16 h-16 drop-shadow-2xl" />
                        {!isSpeaking && !isRecording && (
                          <div className="absolute -top-12 -left-12 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/20 flex flex-col gap-2 opacity-0 group-hover/ov:opacity-100 transition-opacity z-[110] shadow-2xl">
                             <div className="flex gap-2">
                                <button onClick={() => saveOverlays(overlays.map(o => o.id === ov.id ? { ...o, scale: o.scale + 0.1 } : o))} className="p-1.5 text-white hover:bg-white/20 rounded-lg"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => saveOverlays(overlays.map(o => o.id === ov.id ? { ...o, scale: Math.max(0.1, o.scale - 0.1) } : o))} className="p-1.5 text-white hover:bg-white/20 rounded-lg"><Minus className="w-4 h-4" /></button>
                                <button onClick={() => saveOverlays(overlays.filter(o => o.id !== ov.id))} className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </div>
                        )}
                     </div>
                   </motion.div>
                 );
               })}
            </div>
          </div>
        )}
        <div className="relative z-[150] w-full h-full pointer-events-none">
        {isEditing ? (
          <div className="w-full h-full flex flex-col gap-3 pointer-events-auto">
             <div className="flex gap-2 flex-wrap mb-2 p-2 bg-white rounded-xl border border-amber-100 shadow-sm items-center">
               <span className="text-[10px] uppercase font-bold text-amber-800/60 shrink-0">Chèn Kịch tính:</span>
               {[
                 {label: 'Cười', emoji: '😄'}, {label: 'Khóc', emoji: '😭'}, 
                 {label: 'Mỉa mai', emoji: '😏'}, {label: 'Thì thầm', emoji: '🤫'}, 
                 {label: 'Tức giận', emoji: '😠'}, {label: 'Suỵt', emoji: '🤫'}, 
                 {label: 'Woàm', emoji: '🦁'}, {label: 'Hự', emoji: '🥊'}
               ].map(e => (
                 <button 
                   type="button"
                   key={e.label}
                   onClick={() => {
                     if (textareaRef.current) {
                        const start = textareaRef.current.selectionStart;
                        const end = textareaRef.current.selectionEnd;
                        const val = localText;
                        const insert = `[${e.label}] `;
                        setLocalText(val.substring(0, start) + insert + val.substring(end));
                        setTimeout(() => {
                           textareaRef.current?.focus();
                           textareaRef.current?.setSelectionRange(start + insert.length, start + insert.length);
                        }, 0);
                     } else {
                        setLocalText(prev => prev + ` [${e.label}] `);
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
        ) : (
        <div ref={containerRef} className={cn(
          "leading-[1.2] transition-all duration-500 w-full overflow-y-auto hide-scrollbar flex relative z-[160] h-full",
          positionClass,
          style.font,
          wordStyleConfig.fontFamily,
          isKaraokeMode ? "text-center font-black tracking-tighter" : "text-base text-[#4A4540] whitespace-pre-line p-6"
        )}
        style={{
           fontSize: isKaraokeMode && typeof wordStyleConfig.fontSize === 'number' ? `${wordStyleConfig.fontSize}px` : undefined,
           textTransform: isKaraokeMode ? (wordStyleConfig.textTransform as any) : undefined
        }}>
          {isKaraokeMode ? (
            <div 
              className={cn(
                "flex flex-wrap justify-center content-center rounded-2xl p-6 gap-x-1 sm:gap-x-1.5 md:gap-x-3 gap-y-0.5 md:gap-y-1.5 max-w-2xl mx-auto transition-all duration-500 pointer-events-auto",
                wordStyleConfig.bgDepth === 'none' ? "" :
                wordStyleConfig.bgDepth === 'light' ? "bg-black/20 backdrop-blur-sm border border-white/10" :
                wordStyleConfig.bgDepth === 'medium' ? "bg-black/50 backdrop-blur-md border border-white/15 shadow-xl" :
                wordStyleConfig.bgDepth === 'dark' ? "bg-black/80 backdrop-blur-lg border border-white/25 shadow-2xl" :
                "bg-black border-2 border-white/30 shadow-2xl" // solid
              )}
              style={{
                 transform: `translateY(${wordStyleConfig.offsetY || 0}px)`
              }}
            >
              {(() => {
                const limit = parseInt(wordStyleConfig.mode);
                const chunkStart = (isKaraokeMode && (wordStyleConfig.mode === '1' || wordStyleConfig.mode === '7'))
                  ? Math.floor(Math.max(0, highlightIndex - phraseToWordStart[activePhraseIndex]) / limit) * limit
                  : 0;
                
                return displayedWords.map((word, i) => {
                  const absoluteIndex = activeWordStart + chunkStart + i;
                  const isHighlighted = absoluteIndex === highlightIndex;
                const isAdjacent = Math.abs(absoluteIndex - (highlightIndex >= 0 ? highlightIndex : -1)) === 1;
                
                let isVisible = true;
                if (wordStyleConfig.mode === '1') {
                  if (isSpeaking) {
                    isVisible = isHighlighted;
                  } else {
                    isVisible = (i === 0);
                  }
                }

                const getTransitionFX = () => {
                   if (wordStyleConfig.transition === 'fade') return isHighlighted ? "opacity-100" : "opacity-30";
                   if (wordStyleConfig.transition === 'bounce') return isHighlighted ? "scale-[1.5] -translate-y-4 opacity-100 shadow-xl" : "scale-100 opacity-60";
                   if (wordStyleConfig.transition === 'slide_up') return isHighlighted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0";
                   if (wordStyleConfig.transition === 'slide_down') return isHighlighted ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0";
                   if (wordStyleConfig.transition === 'slide_left') return isHighlighted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0";
                   if (wordStyleConfig.transition === 'slide_right') return isHighlighted ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0";
                   if (wordStyleConfig.transition === 'flash') return isHighlighted ? "scale-110 opacity-100 brightness-150 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "scale-100 opacity-50";
                   if (wordStyleConfig.transition === 'bubble') return isHighlighted ? "scale-125 opacity-100 rounded-full bg-white/20 backdrop-blur-md px-4" : "scale-100 opacity-60";
                   return isHighlighted ? "scale-110 md:scale-125 z-10" : "scale-100 opacity-60";
                };

                const getTransformedWord = (w: string) => {
                  if (!w) return '';
                  if (wordStyleConfig.textTransform === 'uppercase') return w.toUpperCase();
                  if (wordStyleConfig.textTransform === 'lowercase') return w.toLowerCase();
                  if (wordStyleConfig.textTransform === 'capitalize') {
                    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
                  }
                  return w;
                };

                return (
                  <span 
                    key={`${absoluteIndex}-${word}`} 
                    className={cn(
                      "transition-all duration-300 px-1 md:px-2 py-0.5 md:py-1 rounded-[2px] md:rounded-sm inline-block transform leading-[1.1]",
                      !isVisible ? "opacity-0 pointer-events-none invisible w-0 h-0 overflow-hidden absolute" :
                      isHighlighted ? style.highlight + " karaoke-active-word " + getTransitionFX() : isAdjacent && wordStyleConfig.transition !== 'fade' ? (style.id === 'gold' ? "text-[#FFD700] opacity-60 scale-105" : style.text + " opacity-80 scale-105") : style.text + " " + getTransitionFX()
                    )}
                    style={{
                      WebkitTextStroke: wordStyleConfig.stroke !== 'none' ? `1px ${wordStyleConfig.stroke}` : undefined,
                      color: isHighlighted ? wordStyleConfig.color : undefined,
                      textShadow: isHighlighted ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {getTransformedWord(word)}
                  </span>
                );
              })
            })()}
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto no-scrollbar">
              {text}
            </div>
          )}
        </div>
        )}
        </div>
        
        {isFullscreen && (
          <div className={cn(
            "fixed inset-x-0 bottom-0 z-[500] p-6 pb-20 pointer-events-none flex flex-col items-center gap-6 transition-all duration-500",
            (isRecording || isSpeaking) ? "opacity-0 invisible translate-y-full" : "opacity-100 visible translate-y-0"
          )}>
             <div className="w-full max-w-[400px] flex flex-col gap-1 pointer-events-auto">
               <div className="flex justify-between text-[8px] font-bold text-white/40 uppercase tracking-tighter px-1">
                  <span>{Math.floor(currentPlaybackTime / 60)}:{(currentPlaybackTime % 60).toFixed(0).padStart(2, '0')}</span>
                  <span>Scrub/Kéo để tìm cảnh</span>
               </div>
               <input 
                  type="range"
                  min="0"
                  max={Math.max(0, words.length - 1)}
                  value={highlightIndex >= 0 ? highlightIndex : 0}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setHighlightIndex(idx);
                    setActivePhraseIndex(wordToPhrase[idx]);
                    // Set an approximate time for scrubbing overlays (e.g. 0.5s per word avg)
                    setCurrentPlaybackTime(idx * 0.5);
                  }}
                  className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500 hover:bg-white/20 transition-all shadow-lg ring-1 ring-white/5"
               />
             </div>

             <div className="flex items-center gap-4 bg-black/80 backdrop-blur-3xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl pointer-events-auto ring-1 ring-white/5">
                 {!isRecording ? (
                   <button 
                     onClick={handleStartRecording}
                     className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-white group-hover:ring-4 ring-red-500/20"
                   >
                     <Video className="w-6 h-6" />
                   </button>
                 ) : (
                   <button 
                     onClick={() => stopRecordingMP4()}
                     className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all text-red-600"
                   >
                     <Square className="w-6 h-6" fill="currentColor" />
                   </button>
                 )}

                 <button 
                   onClick={() => isSpeaking ? stopSpeech() : startSpeech()}
                   className={cn(
                     "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                     isSpeaking ? "bg-amber-500 text-white" : "bg-white/10 text-white border border-white/20"
                   )}
                 >
                   {isSpeaking ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                 </button>

                 <div className="w-px h-8 bg-white/10 mx-2" />
                 
                 <button 
                    onClick={() => setRecAspectRatio?.(recAspectRatio === '9:16' ? '16:9' : '9:16')}
                    className="px-3 py-1.5 bg-white/10 text-white rounded-lg border border-white/10 text-[10px] font-bold"
                 >
                    {recAspectRatio}
                 </button>
             </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

const ColorPalette = ({ colors, vertical = false }: { colors?: { name: string; hex: string; material?: string }[], vertical?: boolean }) => {
  if (!colors || colors.length === 0) return null;
  return (
    <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col gap-1.5 opacity-90 hover:opacity-100 transition-opacity max-w-[120px]">
      {colors.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm p-1 pr-2 rounded-full border border-black/5 shadow-sm pointer-events-auto">
          <div 
            className="w-4 h-4 rounded-full border border-black/10 shrink-0" 
            style={{ backgroundColor: c.hex }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[7px] font-bold uppercase tracking-tight text-[#1A1A1A] leading-none truncate">{c.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const downloadImage = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const copyImageToClipboard = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      alert("Đã sao chép ảnh! Bạn có thể dán sang ứng dụng khác.");
    } else {
      throw new Error("Clipboard API not supported");
    }
  } catch (err) {
    console.error("Lỗi sao chép:", err);
    // Fallback for mobile: explain how to copy
    alert("Trình duyệt không hỗ trợ tự động sao chép ảnh. Vui lòng nhấn giữ vào ảnh và chọn 'Sao chép' hoặc 'Lưu ảnh'.");
  }
};


const VersionGallery = ({ 
  history, 
  currentIndex, 
  onSetIndex,
  onRegen,
  isGenerating
}: { 
  history: string[]; 
  currentIndex: number; 
  onSetIndex: (idx: number) => void;
  onRegen?: () => void;
  isGenerating?: boolean;
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 w-full max-w-[240px] lg:max-w-[300px] mx-auto custom-scrollbar no-scrollbar">
      {history.map((url, idx) => (
        <button
          key={idx}
          onClick={() => onSetIndex(idx)}
          className={cn(
            "relative w-12 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all",
            idx === currentIndex ? "border-amber-500 scale-105 shadow-md" : "border-[#EEEAE5] opacity-60 hover:opacity-100"
          )}
        >
          <img src={url} className="w-full h-full object-cover" />
        </button>
      ))}
      {onRegen && (
        <button
          onClick={onRegen}
          disabled={isGenerating}
          title="Tạo thêm 1 phiên bản ảnh khác"
          className="relative w-12 h-16 rounded-md border-2 border-dashed border-[#DDD6CE] hover:border-[#A09A94] hover:bg-[#F9F8F6] shrink-0 flex items-center justify-center transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-5 h-5 animate-spin text-[#A09A94]" /> : <Plus className="w-5 h-5 text-[#A09A94]" />}
        </button>
      )}
    </div>
  );
};

const FloatingImageActions = ({ 
  url, 
  name, 
  prompt,
  originalUrl,
  onPaste
}: { 
  url: string; 
  name: string; 
  prompt?: string;
  originalUrl?: string | null;
  onPaste?: (url: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyPromptOnly = async (e: React.MouseEvent) => {
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
      await navigator.clipboard.writeText(`A 8-seconds cinematic video of ${prompt}`);
      setCopied(true);
      alert("Đã Copy Câu lệnh cho Video (Sora/Veo3)! Hãy dán để tạo video.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
      alert("Không thể sao chép. Vui lòng chọn và copy thủ công.");
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (url.startsWith('http')) {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `${name}-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      alert("Trình duyệt chặn tải ảnh. Vui lòng nhấn giữ ảnh và chọn Lưu ảnh.");
    }
  };

  const handlePasteFromClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const fallbackUpload = () => {
       const input = document.createElement('input');
       input.type = 'file';
       input.accept = 'image/*,video/mp4,video/webm,video/*';
       input.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
             let url = URL.createObjectURL(file);
             if (file.type.startsWith('video/') || file.name?.match(/\.(mp4|webm|mov)$/i)) {
                url += '#ext=.mp4';
             }
             if (onPaste) onPaste(url);
          }
       };
       input.click();
    };

    try {
      const text = await navigator.clipboard.readText().catch(() => '');
      if (text && (text.startsWith('http') || text.startsWith('data:'))) {
         const useLink = confirm('Phát hiện Link trong bộ nhớ tạm. Bạn có muốn dán?\n' + text.substring(0,50) + '...');
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
  };

  return (
    <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 flex gap-2.5 lg:gap-2 opacity-50 group-hover:opacity-100 transition-opacity z-10">
      <button 
        onClick={handleDownload}
        className="p-3 lg:p-2 bg-purple-500 text-white rounded-full shadow-lg hover:bg-purple-600 transition-all transform hover:scale-110 active:scale-95"
        title="Tải ảnh về máy"
      >
        <Download className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
      </button>
      {onPaste && (
        <button 
          onClick={handlePasteFromClipboard}
          className="p-3 lg:p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all transform hover:scale-110 active:scale-95"
          title="Dán ảnh kết quả từ Gemini"
        >
          <Save className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
        </button>
      )}
      {prompt && (
        <>
          <button 
            onClick={handleCopyPromptOnly}
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
          </button>
          <a 
            href="https://gemini.google.com/app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-3 lg:p-2 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
            title="Mở Gemini để tạo ảnh chất lượng cao"
          >
            <ExternalLink className="w-4 h-4 lg:w-3.5 lg:h-3.5" />
          </a>
        </>
      )}
      <button 
        onClick={(e) => { e.stopPropagation(); copyImageToClipboard(url); }}
        className="p-3 lg:p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95"
        title="Sao chép ảnh AI"
      >
        <Copy className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-[#1A1A1A]" />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); downloadImage(url, `${name}.jpg`); }}
        className="p-3 lg:p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95"
        title="Tải ảnh xuống"
      >
        <Download className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-[#1A1A1A]" />
      </button>
    </div>
  );
};

// Helper for Social Contact
const SocialContactBadge = ({ links, darkTheme = false }: { links: any, darkTheme?: boolean }) => {
  if (!links.facebook && !links.tiktok && !links.zalo && !links.shopee) return null;
  return (
    <div className={cn("mt-8 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md", darkTheme ? "bg-white/5 border border-white/10" : "bg-black/5 border border-black/10")}>
      <div className="space-y-1 text-center sm:text-left">
        <h4 className={cn("text-[10px] uppercase font-bold tracking-widest", darkTheme ? "text-white" : "text-[#1A1A1A]")}>Liên hệ Tư vấn viên</h4>
        <p className={cn("text-[9px]", darkTheme ? "text-white/60" : "text-[#7A7570]")}>Gặp trực tiếp tư vấn viên của bạn</p>
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-end">
        {links.zalo && (
          <div className="flex flex-col items-center sm:items-end w-[max-content]">
            <span className={cn("text-[8px] font-bold uppercase tracking-widest", darkTheme ? "text-white/50" : "text-[#A09A94]")}>Zalo</span>
            <span className={cn("text-xs font-mono font-medium", darkTheme ? "text-white" : "text-[#1A1A1A]")}>{links.zalo}</span>
          </div>
        )}
        {links.tiktok && (
          <div className="flex flex-col items-center sm:items-end w-[max-content]">
            <span className={cn("text-[8px] font-bold uppercase tracking-widest", darkTheme ? "text-white/50" : "text-[#A09A94]")}>TikTok</span>
            <span className={cn("text-xs font-mono font-medium", darkTheme ? "text-white" : "text-[#1A1A1A]")}>{links.tiktok}</span>
          </div>
        )}
        {links.facebook && (
          <div className="flex flex-col items-center sm:items-end w-[max-content]">
            <span className={cn("text-[8px] font-bold uppercase tracking-widest", darkTheme ? "text-white/50" : "text-[#A09A94]")}>Facebook</span>
            <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-medium text-blue-500 max-w-[100px] truncate">{links.facebook}</a>
          </div>
        )}
        {links.shopee && (
          <div className="flex flex-col items-center sm:items-end w-[max-content]">
            <span className={cn("text-[8px] font-bold uppercase tracking-widest", darkTheme ? "text-white/50" : "text-[#A09A94]")}>Shopee</span>
            <a href={links.shopee} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-medium text-orange-500 max-w-[100px] truncate">Mở Cửa Hàng</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [recAspectRatio, setRecAspectRatio] = useState<'9:16' | '16:9'>(() => (localStorage.getItem('boutique_rec_aspect') as any) || '9:16');
  const [imageModel, setImageModel] = useState<'imagen' | 'flux'>(() => (localStorage.getItem('boutique_image_model') as 'imagen' | 'flux') || 'imagen');
  useEffect(() => {
    const handleStorage = () => {
      const val = localStorage.getItem('boutique_image_model') as 'imagen' | 'flux';
      if(val && val !== imageModel) setImageModel(val);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('boutique_image_model_change', handleStorage);
    window.addEventListener('boutique_voice_change', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('boutique_image_model_change', handleStorage);
      window.removeEventListener('boutique_voice_change', handleStorage);
    }
  }, [imageModel]);

  const [activeTab, setActiveTab] = useState<'consult' | 'commentary' | 'knowledge' | 'user'>('consult');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Access Control & Device ID
  const [deviceId] = useState(() => {
    const saved = localStorage.getItem('boutique_device_id');
    if (saved) return saved;
    const newId = uuidv4();
    localStorage.setItem('boutique_device_id', newId);
    return newId;
  });

  const [accessToken, setAccessToken] = useState(() => {
    // Check URL params first
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('access');
    if (fromUrl) {
      localStorage.setItem('boutique_access_token', fromUrl);
      return fromUrl;
    }
    return localStorage.getItem('boutique_access_token') || '';
  });

  useEffect(() => {
    // Clean URL safely after state is set
    const params = new URLSearchParams(window.location.search);
    if (params.has('access')) {
      window.history.replaceState({}, '', window.location.origin + window.location.pathname);
    }
  }, []);

  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const keysArray = geminiKey.split(/[\n,;]+/).map(k => k.trim()).filter(k => k && k.length > 30);

  const [adminView, setAdminView] = useState<'user' | 'admin'>('user');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminLinks, setAdminLinks] = useState<any[]>([]);
  const [geminiKeys, setGeminiKeys] = useState<any[]>([]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newGeminiKey, setNewGeminiKey] = useState('');
  const [checkingKeys, setCheckingKeys] = useState<string[]>([]);
  const [showRawData, setShowRawData] = useState(false);
  const [supabaseKey, setSupabaseKey] = useState('');
  
  const [historyImages, setHistoryImages] = useState<{[key: string]: string[]}>({});
  const [currentImageIndices, setCurrentImageIndices] = useState<{[key: string]: number}>({});
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [isSpeakingResult, setIsSpeakingResult] = useState(false);

  const addToHistory = (resultType: string, imageUrl: string) => {
    setHistoryImages(prev => {
      const newImages = {
        ...prev,
        [resultType]: [imageUrl, ...(prev[resultType] || [])].slice(0, 10) // Tăng giới hạn lên 10 bản
      };
      
      // Tự động cập nhật vào localStorage nếu đang trong một phiên đã lưu
      if (currentHistoryId) {
        setHistory(prevHistory => {
          const newHistory = prevHistory.map(item => {
            if (item.id === currentHistoryId) {
              const updatedImages = { ...item.images };
              if (resultType === 'full') updatedImages.fullBody = imageUrl;
              if (resultType === 'detail') updatedImages.detail = imageUrl;
              if (resultType === 'improvement') updatedImages.improvement = imageUrl;

              return {
                ...item,
                images: updatedImages,
                historyImages: newImages
              };
            }
            return item;
          });
          localStorage.setItem('boutique_history', JSON.stringify(newHistory));
          return newHistory;
        });
      }
      
      return newImages;
    });
    setCurrentImageIndices(prev => ({ ...prev, [resultType]: 0 }));
  };

  const [removedSlots, setRemovedSlots] = useState<string[]>([]);

  const deleteImage = (resultType: string) => {
    const images = historyImages[resultType] || [];
    if (images.length === 0) return;
    
    // If deleting last image, offer to hide slot
    if (images.length === 1 && window.confirm("Xóa ảnh cuối cùng sẽ để lại khung trống. Bạn có muốn xóa luôn khung này khỏi giao diện không?")) {
      setRemovedSlots(prev => [...prev, resultType]);
    }

    const newImages = images.filter((_, i) => i !== currentImageIndices[resultType]);
    setHistoryImages(prev => ({ ...prev, [resultType]: newImages }));
    setCurrentImageIndices(prev => ({ ...prev, [resultType]: 0 }));
  };

  const generateMoreImage = async (type: string) => {
    let prompt = '';
    if (type === 'full') prompt = result?.fullBodyPrompt || '';
    else if (type === 'detail') prompt = result?.detailPrompt || '';
    else if (type === 'improvement') prompt = analysisResult?.improvementPrompt || '';
    else if (type.startsWith('detail_')) {
      const accName = type.replace('detail_', '');
      prompt = result?.detailPrompts?.find(dp => dp.name === accName)?.prompt || '';
    }
    
    if (!prompt) return;
    
    try {
      setIsGeneratingImg(prev => ({ ...prev, [type]: true }));
      setImgErrors(prev => ({ ...prev, [type]: null }));
      
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, aspectRatio: type.startsWith('detail') ? "1:1" : "3:4", imageModel })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Lỗi tạo ảnh: ${data.error || 'Lỗi không xác định'}`);
        setIsGeneratingImg(prev => ({ ...prev, [type]: false }));
        return;
      }
      if (data.imageUrl) {
        if (type === 'full') setFullBodyImage(data.imageUrl);
        else if (type === 'detail') setDetailImage(data.imageUrl);
        else if (type === 'improvement') setImprovementImage(data.imageUrl);
        
        addToHistory(type, data.imageUrl);
      }
    } catch (err) {
      console.error("Regen failed:", err);
    } finally {
      setIsGeneratingImg(prev => ({ ...prev, [type]: false }));
    }
  };
  const handleUpscale = async (type: string) => {
    let prompt = '';
    if (type === 'full') prompt = result?.fullBodyPrompt || '';
    else if (type === 'detail') prompt = result?.detailPrompt || '';
    else if (type === 'improvement') prompt = analysisResult?.improvementPrompt || '';
    else if (type.startsWith('detail_')) {
      const accName = type.replace('detail_', '');
      prompt = result?.detailPrompts?.find(dp => dp.name === accName)?.prompt || '';
    }
    
    if (!prompt) return;
    
    try {
      setIsGeneratingImg(prev => ({ ...prev, [type]: true }));
      setImgErrors(prev => ({ ...prev, [type]: null }));
      
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, aspectRatio: type.startsWith('detail') ? "1:1" : "3:4", isUpscale: true })
      });
      const data = await res.json();
      if (data.imageUrl) {
        if (type === 'full') setFullBodyImage(data.imageUrl);
        else if (type === 'detail') setDetailImage(data.imageUrl);
        else if (type === 'improvement') setImprovementImage(data.imageUrl);
        
        addToHistory(type, data.imageUrl);
      }
    } catch (err) {
      console.error("Upscale failed:", err);
    } finally {
      setIsGeneratingImg(prev => ({ ...prev, [type]: false }));
    }
  };

  const [dbStatus, setDbStatus] = useState<any>(null);

  const handleAdminLogin = () => {
    if (adminPassword === '112231vn') {
      setIsAdminAuthenticated(true);
      setAdminPassword('');
      fetchAdminLinks();
      fetchGeminiKeys();
      fetchDbHealth();
    } else {
      alert("Sai mật khẩu quản trị!");
    }
  };

  const fetchDbHealth = async () => {
    try {
      const res = await fetch('/api/health/firebase');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {}
  };

  const handleSetupDb = async () => {
    if (!supabaseKey) {
      alert("Vui lòng nhập Supabase Service Role Key.");
      return;
    }
    try {
      const res = await fetch('/api/admin/setup-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: supabaseKey
        })
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text.slice(0, 100)}`);
      }

      if (res.ok) {
        alert("Kết nối Supabase thành công!");
        setSupabaseKey('');
        fetchDbHealth();
        fetchAdminLinks();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const getAffiliateContext = () => {
    let context = "";
    if (userAffiliateLinks) {
       context += "Link sản phẩm của người dùng (Ưu tiên Chọn Số 1):\n" + userAffiliateLinks + "\n\n";
    }
    if (appInfo?.admin_affiliate_links) {
       context += "Link sản phẩm của Hệ thống (Dùng khi người dùng không có link phù hợp):\n" + appInfo.admin_affiliate_links + "\n\n";
    }
    return context.trim();
  };

  const getHeaders = () => {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'x-device-id': deviceId
    };
    
    if (accessToken) {
      headers['x-access-token'] = accessToken;
    }

    if (userGeminiKey && userGeminiKey.length > 20) {
      headers['x-gemini-key'] = userGeminiKey;
    } else if (keysArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * keysArray.length);
      headers['x-gemini-key'] = keysArray[randomIndex];
    }
    
    if (userImageKey && userImageKey.length > 20) {
      headers['x-image-key'] = userImageKey;
    }
    return headers;
  };

  // Consult States
  const [image, setImage] = useState<string | null>(null);
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Nữ');
  const [style, setStyle] = useState('Minimalist, Sang trọng');
  const [color, setColor] = useState('Màu trung tính, Đen, Be');
  const [context, setContext] = useState('Đi làm công sở, Họp báo');
  const [flaws, setFlaws] = useState('');
  const [showFlawsInput, setShowFlawsInput] = useState(false);
  const [depthLevel, setDepthLevel] = useState<'basic' | 'detailed'>('detailed');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['Giày', 'Đồng hồ']);
  const accessoryOptions = ['Giày', 'Dép', 'Mũ', 'Kính', 'Đồng hồ', 'Nhẫn', 'Dây chuyền', 'Túi xách', 'Thắt lưng', 'Cà vạt'];
  const [result, setResult] = useState<FashionResult | null>(null);
  const [fullBodyImage, setFullBodyImage] = useState<string | null>(null);
  const [detailImage, setDetailImage] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState<Record<string, boolean>>({
    full: false,
    detail: false,
    improvement: false
  });
  const [imgErrors, setImgErrors] = useState<Record<string, string | null>>({
    full: null,
    detail: null,
    improvement: null
  });
  const [isCheckingKey, setIsCheckingKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  // Commentary States
  const [commentaryImage, setCommentaryImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [improvementImage, setImprovementImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAppRecording, setIsAppRecording] = useState(false);
  const [viewingImageModal, setViewingImageModal] = useState<string | null>(null);
  const [karaokeViewType, setKaraokeViewType] = useState<string>('');
  const [fsMainTab, setFsMainTab] = useState<'original' | 'generated'>('generated');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedItem[]>(() => {
    const saved = localStorage.getItem('boutique_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentaryInputRef = useRef<HTMLInputElement>(null);

  // Knowledge States
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [knowledgeResult, setKnowledgeResult] = useState<{
    title: string;
    content: string;
    media: { text: string; keywords: string[] }[];
    affiliate_links: { name: string; link: string; price?: string; image?: string }[];
  } | null>(null);
  const [currentKnowledgeMediaIndex, setCurrentKnowledgeMediaIndex] = useState(0);
  const [isSearchingKnowledge, setIsSearchingKnowledge] = useState(false);
  const [knowledgeImages, setKnowledgeImages] = useState<Record<number, string>>({});
  const [isGeneratingKnowledgeImage, setIsGeneratingKnowledgeImage] = useState<Record<number, boolean>>({});

  const handleGenerateKnowledgeImage = async (index: number, keywords: string[]) => {
    setIsGeneratingKnowledgeImage(prev => ({ ...prev, [index]: true }));
    try {
      const prompt = keywords.join(', ') || "fashion model";
      
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, aspectRatio: "3:4", imageModel })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (data.imageUrl) {
        const updateKnowledgeImages = (newUrl: string) => {
          setKnowledgeImages(prev => {
            const next = { ...prev, [index]: newUrl };
            if (currentHistoryId && activeTab === 'knowledge') {
              setHistory(prevHistory => {
                const newHistory = prevHistory.map(item => {
                  if (item.id === currentHistoryId) {
                    return { ...item, knowledgeImages: next };
                  }
                  return item;
                });
                localStorage.setItem('boutique_history', JSON.stringify(newHistory));
                return newHistory;
              });
            }
            return next;
          });
        };

        updateKnowledgeImages(data.imageUrl);
      }
    } catch(err) {
      console.error(err);
      alert("Lỗi khi tạo ảnh: " + (err as Error).message);
    } finally {
      setIsGeneratingKnowledgeImage(prev => ({ ...prev, [index]: false }));
    }
  };
  
  // User Tab States
  const [userPassword, setUserPassword] = useState(() => localStorage.getItem('boutique_user_pwd') || '');
  const [isUserUnlocked, setIsUserUnlocked] = useState(false);
  const [tempUserPassword, setTempUserPassword] = useState('');
  const [userGeminiKey, setUserGeminiKey] = useState(() => localStorage.getItem('boutique_user_gemini_key') || '');
  const [userImageKey, setUserImageKey] = useState(() => localStorage.getItem('boutique_user_image_key') || '');
  const [userAffiliateLinks, setUserAffiliateLinks] = useState(() => localStorage.getItem('boutique_user_affiliate') || '');
  const [socialLinks, setSocialLinks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('boutique_social_links') || '{"facebook":"","tiktok":"","zalo":"","shopee":""}'); }
    catch { return { facebook: "", tiktok: "", zalo: "", shopee: "" }; }
  });
  
  // App Config & Trial States
  const [appInfo, setAppInfo] = useState<any>(null);
  const [isPermanent, setIsPermanent] = useState(false);
  const [trialRuns, setTrialRuns] = useState(() => parseInt(localStorage.getItem('boutique_trial_runs') || '0', 10));
  const [showTrialBlock, setShowTrialBlock] = useState(false);

  useEffect(() => {
    fetch('/api/app-info', {
      headers: {
        'x-access-token': accessToken || '',
        'x-device-id': deviceId
      }
    }).then(res => res.json()).then(data => {
      setAppInfo(data.adminInfo || {});
      setIsPermanent(!!data.is_permanent);
    }).catch(() => {});
  }, [accessToken, deviceId]);

  const [queueTime, setQueueTime] = useState(0);

  const checkLimitAndQueue = async () => {
    if (userGeminiKey && userGeminiKey.length > 20) return true; // Unleashed with personal key
    if (trialRuns >= 3) {
      setShowTrialBlock(true);
      return false; // Hard blocked
    }
    // Simulate high load during certain hours or randomly, starting a 60s queue
    if (Math.random() < 0.5) { // 50% chance to simulate busy hour for free users
      setQueueTime(60);
      return new Promise<boolean>(resolve => {
        let timeLeft = 60;
        const interval = setInterval(() => {
          timeLeft -= 1;
          setQueueTime(timeLeft);
          if (timeLeft <= 0) {
            clearInterval(interval);
            resolve(true); // Proceed after wait
          }
        }, 1000);
      });
    }
    return true;
  };

  const checkTrialLimit = () => {
    if (userGeminiKey) return true; // Unlimited
    if (!accessToken) return true; 
    if (isPermanent) return true;
    if (trialRuns >= 3) {
      setShowTrialBlock(true);
      return false;
    }
    return true;
  };

  const incrementTrial = () => {
    if (userGeminiKey || isPermanent) return; // Don't increment for premium/personal key users
    const newCount = trialRuns + 1;
    setTrialRuns(newCount);
    localStorage.setItem('boutique_trial_runs', newCount.toString());
  };

  // Persist current session
  useEffect(() => {
    if (image) localStorage.setItem('boutique_image', image);
    if (commentaryImage) localStorage.setItem('boutique_commentary_image', commentaryImage);
    if (result) localStorage.setItem('boutique_result', JSON.stringify(result));
    if (analysisResult) localStorage.setItem('boutique_analysis_result', JSON.stringify(analysisResult));
    if (knowledgeResult) localStorage.setItem('boutique_knowledge_result', JSON.stringify(knowledgeResult));
    if (historyImages && Object.keys(historyImages).length > 0) {
      localStorage.setItem('boutique_session_history_images', JSON.stringify(historyImages));
    }
  }, [image, commentaryImage, result, analysisResult, knowledgeResult, historyImages]);

  useEffect(() => {
    localStorage.setItem('boutique_social_links', JSON.stringify(socialLinks));
  }, [socialLinks]);

  useEffect(() => {
    localStorage.setItem('boutique_user_affiliate', userAffiliateLinks);
  }, [userAffiliateLinks]);

  // Load session on init
  useEffect(() => {
    const savedImage = localStorage.getItem('boutique_image');
    const savedCommentaryImage = localStorage.getItem('boutique_commentary_image');
    const savedResult = localStorage.getItem('boutique_result');
    const savedAnalysis = localStorage.getItem('boutique_analysis_result');
    const savedKnowledge = localStorage.getItem('boutique_knowledge_result');
    const savedHistoryImages = localStorage.getItem('boutique_session_history_images');

    if (savedImage) setImage(savedImage);
    if (savedCommentaryImage) setCommentaryImage(savedCommentaryImage);
    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedAnalysis) setAnalysisResult(JSON.parse(savedAnalysis));
    if (savedKnowledge) setKnowledgeResult(JSON.parse(savedKnowledge));
    if (savedHistoryImages) setHistoryImages(JSON.parse(savedHistoryImages));
  }, []);

  // Handle Paste
  const handlePaste = useCallback((e: ClipboardEvent) => {
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
  }, [activeTab]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'consult' | 'commentary') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/') || file.name?.match(/\.(mp4|webm|mov)$/i)) {
         let url = URL.createObjectURL(file);
         url += '#ext=.mp4';
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
  };

  const handleClearImage = () => {
    if (activeTab === 'consult') setImage(null);
    else setCommentaryImage(null);
  };

  const handleClearResult = () => {
    if (activeTab === 'consult') {
      setResult(null);
      setFullBodyImage(null);
      setDetailImage(null);
      setHistoryImages(prev => { const next = {...prev}; delete next.full; delete next.detail; return next; });
    } else if (activeTab === 'commentary') {
      setAnalysisResult(null);
      setImprovementImage(null);
      setHistoryImages(prev => { const next = {...prev}; delete next.improvement; return next; });
    } else {
      setKnowledgeResult(null);
    }
  };

  const handleResetTab = () => {
    if (activeTab === 'consult') {
      setImage(null);
      setResult(null);
      setFullBodyImage(null);
      setDetailImage(null);
      setHistoryImages({});
      setHeight('170');
      setWeight('65');
      setAge('');
      setGender('Nữ');
      setStyle('Minimalist, Sang trọng');
      setColor('Màu trung tính, Đen, Be');
      setContext('Đi làm công sở, Họp báo');
      setFlaws('');
      setSelectedAccessories(['Giày', 'Đồng hồ']);
    } else if (activeTab === 'commentary') {
      setCommentaryImage(null);
      setAnalysisResult(null);
      setImprovementImage(null);
      setHistoryImages({});
    } else {
      setKnowledgeQuery('');
      setKnowledgeResult(null);
      setKnowledgeImages({});
      setIsGeneratingKnowledgeImage({});
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkTrialLimit()) return;
    
    setLoading(true);
    const canContinue = await checkLimitAndQueue();
    if (!canContinue) {
      setLoading(false);
      return;
    }

    setResult(null);
    setFullBodyImage(null);
    setDetailImage(null);
    setHistoryImages(prev => ({ ...prev, full: [], detail: [] }));
    setCurrentImageIndices(prev => ({ ...prev, full: 0, detail: 0 }));
    setError(null);
    setCurrentHistoryId(null); // Reset session khi phân tích mới
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          image, 
          height, 
          weight, 
          age,
          gender,
          style, 
          color, 
          context, 
          flaws: showFlawsInput ? flaws : null,
          accessories: selectedAccessories,
          affiliateContext: getAffiliateContext(),
          depthLevel
        }),
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          throw new Error("Không tìm thấy dịch vụ AI trên máy chủ (404/SPA). Vui lòng thử tải lại trang.");
        }
        throw new Error(text.slice(0, 100) || "Lỗi máy chủ không xác định.");
      }

      if (!res.ok) {
        throw new Error(data.error || `Lỗi AI (${res.status}): Không thể kết nối tới máy chủ.`);
      }
      setResult(data);
      incrementTrial();
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Có lỗi xảy ra trong quá trình tư vấn. Vui lòng kiểm tra lại Key hoặc thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualImageGen = async (type: string, customPrompt?: string) => {
    if (!result && !analysisResult) return;
    
    setIsGeneratingImg(prev => ({ ...prev, [type]: true }));
    setImgErrors(prev => ({ ...prev, [type]: null }));
    try {
      let prompt = customPrompt || '';
      if (!prompt) {
        if (type === 'full') prompt = result!.fullBodyPrompt;
        else if (type === 'detail') prompt = result!.detailPrompt;
        else if (type === 'improvement') prompt = analysisResult!.improvementPrompt;
      }

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt, aspectRatio: type.startsWith('detail') ? "1:1" : "3:4", imageModel }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setImgErrors(prev => ({ ...prev, [type]: data.error || "Không thể tạo ảnh. Vui lòng thử lại." }));
        alert(`Lỗi tạo ảnh: ${data.error || 'Lỗi không xác định'}`);
        return;
      }
      
      if (data.imageUrl) {
        if (type === 'full') setFullBodyImage(data.imageUrl);
        else if (type === 'detail') setDetailImage(data.imageUrl);
        else if (type === 'improvement') setImprovementImage(data.imageUrl);
        
        addToHistory(type, data.imageUrl);
      } else {
        setImgErrors(prev => ({ ...prev, [type]: "Không thể tạo ảnh. Vui lòng thử lại." }));
      }
    } catch (err: any) {
      console.error("Manual image gen failed", err);
      setImgErrors(prev => ({ ...prev, [type]: "Lỗi kết nối hoặc Key không hợp lệ." }));
    } finally {
      setIsGeneratingImg(prev => ({ ...prev, [type]: false }));
    }
  };

  const hasAutoGeneratedConsultRef = useRef(false);
  useEffect(() => {
    if (result && !loading && !hasAutoGeneratedConsultRef.current) {
      hasAutoGeneratedConsultRef.current = true;
      
      const generationTypes = ['full'];
      result.detailPrompts?.forEach((dp) => {
        generationTypes.push(`detail_${dp.name}`);
      });
      
      const newGeneratingState: Record<string, boolean> = {};
      generationTypes.forEach(t => newGeneratingState[t] = true);
      setIsGeneratingImg(prev => ({ ...prev, ...newGeneratingState }));
      
      handleManualImageGen('full');
      result.detailPrompts?.forEach((dp) => {
        handleManualImageGen(`detail_${dp.name}`, dp.prompt);
      });
    } else if (!result) {
      hasAutoGeneratedConsultRef.current = false;
    }
  }, [result, loading]);

  const hasAutoGeneratedCommentaryRef = useRef(false);
  useEffect(() => {
    if (analysisResult && !loading && !hasAutoGeneratedCommentaryRef.current) {
      hasAutoGeneratedCommentaryRef.current = true;
      setIsGeneratingImg(prev => ({ ...prev, improvement: true }));
      handleManualImageGen('improvement');
    } else if (!analysisResult) {
      hasAutoGeneratedCommentaryRef.current = false;
    }
  }, [analysisResult, loading]);

  const handleConsultHighlight = useCallback((index: number, total: number, activePhraseText?: string) => {
    if (!activePhraseText || !result) return;
    const lowerPhrase = activePhraseText.toLowerCase();
    
    if (lowerPhrase.includes('ảnh gốc') || lowerPhrase.includes('bạn lúc này') || lowerPhrase.includes('hiện tại') || lowerPhrase.includes('khuyết điểm')) {
      setKaraokeViewType('original');
      return;
    }
    
    if (result.detailPrompts) {
      for (const dp of result.detailPrompts) {
        if (lowerPhrase.includes(dp.name.toLowerCase())) {
          setKaraokeViewType(`detail_${dp.name}`);
          return;
        }
      }
    }
    
    if (lowerPhrase.includes('tổng thể') || lowerPhrase.includes('toàn thân') || lowerPhrase.includes('phom dáng') || lowerPhrase.includes('bộ đồ') || lowerPhrase.includes('giao diện') || lowerPhrase.includes('áo') || lowerPhrase.includes('quần') || lowerPhrase.includes('váy') || lowerPhrase.includes('màu')) {
      setKaraokeViewType('full');
      return;
    }
  }, [result]);

  const handleCommentaryHighlight = useCallback((index: number, total: number, activePhraseText?: string) => {
    if (!activePhraseText || !analysisResult) return;
    const lowerPhrase = activePhraseText.toLowerCase();
    
    if (lowerPhrase.includes('ảnh gốc') || lowerPhrase.includes('hiện tại') || lowerPhrase.includes('bộ đồ cũ') || lowerPhrase.includes('khuyết điểm')) {
      setKaraokeViewType('original');
      return;
    }
    
    if (lowerPhrase.includes('cải thiện') || lowerPhrase.includes('đề xuất') || lowerPhrase.includes('thay thế') || lowerPhrase.includes('tổng thể')) {
      setKaraokeViewType('improvement');
      return;
    }
  }, [analysisResult]);

  const handleCheckKeys = async () => {
    if (!geminiKey) return;
    setIsCheckingKey(true);
    setKeyStatus(null);
    try {
      const keys = geminiKey.split(/[\n,;]+/).map(k => k.trim()).filter(k => k && k.length > 30);
      if (keys.length === 0) {
        setKeyStatus("Không tìm thấy Key nào đủ độ dài (tối thiểu 30 ký tự).");
        return;
      }
      
      let working = 0;
      let quotaExceeded = 0;
      let invalidMessages: string[] = [];

      // Parallel checking for speed
      const resData = await Promise.all(keys.map(async (key) => {
        try {
          const res = await fetch(`/api/check-key?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-gemini-key': key }
          });
          
          let data;
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            // Handle non-JSON responses (like server errors or SPA fallback)
            const text = await res.text();
            if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
              data = { error: "Không tìm thấy API trên máy chủ (404/SPA). Vui lòng tải lại trang hoặc thử lại sau." };
            } else {
              data = { error: text.slice(0, 100) || "Lỗi máy chủ không xác định." };
            }
          }

          if (res.ok) return { status: 'ok' };
          return { status: res.status === 429 ? 'quota' : 'invalid', error: data.error };
        } catch (err: any) {
          return { status: 'error', error: "Lỗi kết nối mạng hoặc máy chủ." };
        }
      }));
      
      working = resData.filter(r => r.status === 'ok').length;
      quotaExceeded = resData.filter(r => r.status === 'quota').length;
      
      const distinctErrors = Array.from(new Set(resData.filter(r => r.status === 'invalid' || r.status === 'error').map(r => r.error).filter(Boolean)));

      let msg = `Quét xong ${keys.length} Key: `;
      if (working > 0) msg += `${working} Sẵn sàng. `;
      if (quotaExceeded > 0) msg += `${quotaExceeded} Hết hạn mức. `;
      
      if (distinctErrors.length > 0) {
        msg += `\nLỗi: ${distinctErrors[0]}`;
        if (distinctErrors.length > 1) msg += ` (+${distinctErrors.length - 1} lỗi khác)`;
      } else if (working === 0 && quotaExceeded === 0) {
        msg += "Tất cả Key đều không hợp lệ.";
      }
      
      setKeyStatus(msg);
    } catch (err) {
      setKeyStatus("Lỗi hệ thống khi kiểm tra.");
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleUserCheckKey = async () => {
    if (!userGeminiKey) return;
    try {
      const res = await fetch(`/api/check-key?t=${Date.now()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-gemini-key': userGeminiKey }
      });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        localStorage.setItem('boutique_user_gemini_key', userGeminiKey);
        if (userImageKey) localStorage.setItem('boutique_user_image_key', userImageKey);
        alert("Tuyệt vời! Key hoạt động bình thường. Đã lưu vào trình duyệt, mọi giới hạn chờ đợi và số lần tạo đã được gỡ bỏ.");
      } else if (res.status === 429) {
        alert("Key của bạn đã hết hạn mức (Quota Exceeded / 429). Vui lòng dùng Key khác.");
      } else {
        alert("Key không hợp lệ hoặc lỗi: " + (data.error || "Sai Key"));
      }
    } catch(err: any) {
      alert("Không thể kiểm tra Key do lỗi mạng.");
    }
  };

  useEffect(() => {
    // Clear status when key list changes
    setKeyStatus(null);
  }, [geminiKey]);

  const fetchGeminiKeys = async () => {
    try {
      const res = await fetch('/api/admin/keys');
      if (res.ok) {
        const data = await res.json();
        setGeminiKeys(data);
      }
    } catch (err) {
      console.error("Fetch keys error:", err);
    }
  };

  const handleCreateGeminiKey = async () => {
    if (!newGeminiKey) {
      alert("Vui lòng nhập Key (mỗi key một dòng).");
      return;
    }
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ keysString: newGeminiKey })
      });
      
      const data = await res.json();
      if (res.ok) {
        setNewGeminiKey('');
        fetchGeminiKeys();
        alert("Đã lưu và thêm vào pool!");
      } else {
        alert("Lỗi: " + (data.error || "Không thể lưu Key."));
      }
    } catch (err: any) {
      alert("Lỗi kết nối hoặc bảng Gemini Keys chưa được tạo.");
    }
  };

  const handleCheckAllKeys = async () => {
    if (geminiKeys.length === 0) {
      alert("Chưa có Key nào để kiểm tra.");
      return;
    }
    
    // Check in batch sequence
    setCheckingKeys(geminiKeys.map(k => k.id));
    
    let active = 0;
    let rateLimited = 0;
    let quotaExceeded = 0;
    let errors = 0;

    for (const key of geminiKeys) {
      try {
        const res = await fetch(`/api/admin/keys/check/${key.id}`, { method: 'POST' });
        const data = await res.json();
        
        const statusMsg = data.status || '';
        if (data.active) {
          active++;
        } else if (statusMsg.includes('429') || statusMsg.toLowerCase().includes('quota') || statusMsg.toLowerCase().includes('exhausted')) {
          quotaExceeded++;
        } else if (statusMsg.includes('503') || statusMsg.toLowerCase().includes('rate')) {
          rateLimited++;
        } else {
          errors++;
        }

        fetchGeminiKeys(); // Refresh individual status as we go
      } catch (err) {
        console.error("Check failed for", key.id);
        errors++;
      }
      setCheckingKeys(prev => prev.filter(id => id !== key.id));
    }
    
    let msg = `Đã kiểm tra xong ${geminiKeys.length} Key:\n\n`;
    msg += `- ${active} Key khỏe (sẵn sàng sử dụng ngay).\n`;
    if (rateLimited > 0) msg += `- ${rateLimited} Key đang bị giới hạn tốc độ (phải đợi).\n`;
    if (quotaExceeded > 0) msg += `- ${quotaExceeded} Key đã hết lượt miễn phí (429).\n`;
    if (errors > 0) msg += `- ${errors} Key bị lỗi (không phản hồi hoặc key sai).\n`;
    
    if (active < 2) {
      msg += `\nKhuyến nghị: Bạn chỉ có ${active} Key khỏe, hãy cân nhắc thêm Key mới để đảm bảo trải nghiệm tạo ảnh và chữ tốt nhất!`;
    }
    
    alert(msg);
  };

  const handleUpdateGeminiKey = async (id: string, updates: any) => {
    try {
      await fetch(`/api/admin/keys/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      fetchGeminiKeys();
    } catch (err) {
      alert("Lỗi cập nhật.");
    }
  };

  const handleDeleteGeminiKey = async (id: string) => {
    if (!confirm("Xóa Key này?")) return;
    try {
      await fetch(`/api/admin/keys/${id}`, { method: 'DELETE' });
      fetchGeminiKeys();
    } catch (err) {
      alert("Lỗi xóa Key.");
    }
  };

  const fetchAdminLinks = async () => {
    try {
      const res = await fetch('/api/admin/links');
      if (res.ok) {
        const data = await res.json();
        setAdminLinks(data);
      }
    } catch (err) {
      console.error("Fetch links error:", err);
    }
  };

  const handleUpdateLink = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/admin/links/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchAdminLinks();
    } catch (err) {
      alert("Lỗi cập nhật.");
    }
  };

  const handleCreateLink = async () => {
    if (!newLinkLabel) {
      alert("Vui lòng nhập tên nhãn cho link.");
      return;
    }
    try {
      const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token, label: newLinkLabel })
      });
      if (res.ok) {
        setNewLinkLabel('');
        fetchAdminLinks();
      } else {
        const errData = await res.json();
        const errorMessage = errData.error || "Không thể tạo link.";
        const errorCode = errData.code ? ` (Mã: ${errData.code})` : "";
        alert("Lỗi: " + errorMessage + errorCode);
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await fetch(`/api/admin/links/${id}`, { method: 'DELETE' });
      fetchAdminLinks();
    } catch (err) {
      alert("Lỗi xóa link.");
    }
  };

  const [adminSetupName, setAdminSetupName] = useState('');
  const [adminSetupZalo, setAdminSetupZalo] = useState('');
  const [adminSetupTrialLink, setAdminSetupTrialLink] = useState('');
  const [adminAffiliateLinks, setAdminAffiliateLinks] = useState('');

  // Fetch it once when entering admin view maybe?
  useEffect(() => {
    if (showSettings && adminView === 'admin' && appInfo) {
      setAdminSetupName(appInfo.admin_name || '');
      setAdminSetupZalo(appInfo.admin_zalo || '');
      setAdminSetupTrialLink(appInfo.admin_trial_link || '');
      setAdminAffiliateLinks(appInfo.admin_affiliate_links || '');
    }
  }, [showSettings, adminView, appInfo]);

  const saveMasterKey = async () => {
    try {
      const payload: any = {};
      if (geminiKey) payload.geminiApiKey = geminiKey;
      payload.adminInfo = {
        admin_name: adminSetupName,
        admin_zalo: adminSetupZalo,
        admin_trial_link: adminSetupTrialLink,
        admin_affiliate_links: adminAffiliateLinks
      };

      const res = await fetch('/api/save-master-config', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) alert("Đã cập nhật hệ thống!");
      else alert("Lỗi cập nhật.");
    } catch (err) {
      alert("Lỗi máy chủ.");
    }
  };

  useEffect(() => {
    if (showSettings && adminView === 'admin') {
      fetchAdminLinks();
      fetchGeminiKeys();
    }
  }, [showSettings, adminView]);

  const handleCommentary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentaryImage) return;
    if (!checkTrialLimit()) return;
    
    setLoading(true);
    const canContinue = await checkLimitAndQueue();
    if (!canContinue) {
      setLoading(false);
      return;
    }

    setAnalysisResult(null);
    setImprovementImage(null);
    setHistoryImages(prev => ({ ...prev, improvement: [] }));
    setCurrentImageIndices(prev => ({ ...prev, improvement: 0 }));
    setError(null);
    setCurrentHistoryId(null); // Reset session
    
    try {
      const res = await fetch('/api/commentary', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          image: commentaryImage,
          gender: gender,
          affiliateContext: getAffiliateContext()
        }),
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          throw new Error("Không tìm thấy dịch vụ AI trên máy chủ (404/SPA). Vui lòng thử tải lại trang.");
        }
        throw new Error(text.slice(0, 100) || "Lỗi máy chủ không xác định.");
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      
      if (!data.analysis) throw new Error("Không nhận được kết quả phân tích từ AI.");
      
      setAnalysisResult(data);
      incrementTrial();
    } catch (err: any) {
      console.error("Commentary error:", err);
      setError(`Có lỗi xảy ra: ${err.message || "Vui lòng thử lại sau."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKnowledgeHighlight = useCallback((index: number, total: number) => {
    if (!knowledgeResult || !knowledgeResult.media || total === 0 || index < 0) return;
    const progress = Math.max(0, index) / total;
    const itemsCount = knowledgeResult.media.length;
    let nextIndex = Math.floor(progress * itemsCount);
    nextIndex = Math.min(itemsCount - 1, Math.max(0, nextIndex));
    if (nextIndex !== currentKnowledgeMediaIndex) setCurrentKnowledgeMediaIndex(nextIndex);
  }, [knowledgeResult, currentKnowledgeMediaIndex]);

  const handleKnowledgeSearch = async () => {
    if (!knowledgeQuery.trim()) return;

    // Check Cache First
    const cacheKey = `boutique_knowledge_cache_${knowledgeQuery.trim().toLowerCase()}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setKnowledgeResult(parsedData);
        setCurrentKnowledgeMediaIndex(0);
        setError(null);
        return;
      } catch (e) {
        // invalid cache, ignore
      }
    }

    if (!checkTrialLimit()) return;
    
    setIsSearchingKnowledge(true);
    const canContinue = await checkLimitAndQueue();
    if (!canContinue) {
      setIsSearchingKnowledge(false);
      return;
    }

    setKnowledgeResult(null);
    setKnowledgeImages({});
    setIsGeneratingKnowledgeImage({});
    setCurrentKnowledgeMediaIndex(0);
    setError(null);
    
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          query: knowledgeQuery,
          affiliateContext: getAffiliateContext()
        }),
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          throw new Error("Không tìm thấy dịch vụ AI trên máy chủ (404/SPA). Vui lòng thử tải lại trang.");
        }
        throw new Error(text.slice(0, 100) || "Lỗi máy chủ không xác định.");
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`);
      }
      
      setKnowledgeResult(data);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {}
      incrementTrial();
    } catch (err: any) {
      console.error("Knowledge error:", err);
      setError(`Có lỗi xảy ra: ${err.message || "Vui lòng thử lại sau."}`);
    } finally {
      setIsSearchingKnowledge(false);
    }
  };

  const handleSaveToHistory = () => {
    if (activeTab === 'user') return;
    if (activeTab === 'consult' && !result) return;
    if (activeTab === 'commentary' && !analysisResult) return;
    if (activeTab === 'knowledge' && !knowledgeResult) return;
    
    const id = currentHistoryId || Math.random().toString(36).substring(7);
    const newItem: SavedItem = {
      id,
      type: activeTab as 'consult' | 'commentary' | 'knowledge',
      timestamp: Date.now(),
      date: new Date().toLocaleString('vi-VN'),
      result: activeTab === 'consult' ? result : (activeTab === 'commentary' ? analysisResult : knowledgeResult),
      images: {
        input: activeTab === 'consult' ? image : commentaryImage,
        fullBody: fullBodyImage,
        detail: detailImage,
        improvement: improvementImage
      },
      historyImages: historyImages,
      knowledgeImages: activeTab === 'knowledge' ? knowledgeImages : undefined
    };
    
    let newHistory;
    if (currentHistoryId) {
      newHistory = history.map(item => item.id === currentHistoryId ? newItem : item);
    } else {
      newHistory = [newItem, ...history];
      setCurrentHistoryId(id);
    }
    
    setHistory(newHistory);
    localStorage.setItem('boutique_history', JSON.stringify(newHistory));
    alert(currentHistoryId ? "Đã cập nhật lịch sử!" : "Đã lưu vào lịch sử!");
  };

  const removeFromHistory = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('boutique_history', JSON.stringify(newHistory));
  };

  const loadFromHistory = (item: SavedItem) => {
    setCurrentHistoryId(item.id);
    setActiveTab(item.type);
    if (item.type === 'consult') {
      setResult(item.result);
      setImage(item.images.input || null);
      
      if (item.historyImages) {
        setHistoryImages(item.historyImages);
        // Ưu tiên lấy cái ảnh đầu tiên trong history làm ảnh chính nếu có
        setFullBodyImage(item.historyImages.full?.[0] || item.images.fullBody || null);
        setDetailImage(item.historyImages.detail?.[0] || item.images.detail || null);
      } else {
        const fallback: {[key: string]: string[]} = {};
        if (item.images.fullBody) fallback.full = [item.images.fullBody];
        if (item.images.detail) fallback.detail = [item.images.detail];
        setHistoryImages(fallback);
        setFullBodyImage(item.images.fullBody || null);
        setDetailImage(item.images.detail || null);
      }
      setCurrentImageIndices({ full: 0, detail: 0 });
    } else if (item.type === 'commentary') {
      setAnalysisResult(item.result);
      setCommentaryImage(item.images.input || null);
      
      if (item.historyImages) {
        setHistoryImages(item.historyImages);
        setImprovementImage(item.historyImages.improvement?.[0] || item.images.improvement || null);
      } else {
        const fallback: {[key: string]: string[]} = {};
        if (item.images.improvement) fallback.improvement = [item.images.improvement];
        setHistoryImages(fallback);
        setImprovementImage(item.images.improvement || null);
      }
      setCurrentImageIndices({ improvement: 0 });
    } else if (item.type === 'knowledge') {
      setKnowledgeResult(item.result);
      if (item.knowledgeImages) {
        setKnowledgeImages(item.knowledgeImages);
      } else {
        setKnowledgeImages({});
      }
    }
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans selection:bg-[#E5E1DA]">
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-[#EEEAE5] z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-full flex items-center justify-center">
            <Shirt className="text-white w-4 h-4" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight uppercase">Tư vấn thời trang AI</h1>
        </div>
        <div className="flex gap-4 md:gap-8 items-center overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('consult')}
            className={cn(
              "text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-colors whitespace-nowrap",
              activeTab === 'consult' ? "text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" : "text-[#7A7570]"
            )}
          >
            Tư vấn phong cách
          </button>
          <button 
            onClick={() => setActiveTab('commentary')}
            className={cn(
              "text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-colors whitespace-nowrap",
              activeTab === 'commentary' ? "text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" : "text-[#7A7570]"
            )}
          >
            Bình luận trang phục
          </button>
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={cn(
              "text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-colors whitespace-nowrap",
              activeTab === 'knowledge' ? "text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" : "text-[#7A7570]"
            )}
          >
            Kiến thức
          </button>
          <button 
            onClick={() => setActiveTab('user')}
            className={cn(
              "text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-medium transition-colors whitespace-nowrap",
              activeTab === 'user' ? "text-[#1A1A1A] border-b border-[#1A1A1A] pb-1" : "text-[#7A7570]"
            )}
          >
            Người dùng
          </button>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <select 
            value={imageModel} 
            onChange={(e) => {
              const val = e.target.value as 'imagen' | 'flux';
              setImageModel(val);
              localStorage.setItem('boutique_image_model', val);
              window.dispatchEvent(new Event('boutique_image_model_change'));
            }}
            className="hidden sm:block bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer text-[#1A1A1A] border border-[#EEEAE5] rounded-full px-3 py-1.5 hover:bg-[#F9F8F6] transition-colors"
            title="Model tạo ảnh"
          >
            <option value="imagen">Imagen 3</option>
            <option value="flux">FLUX.1</option>
          </select>
          {!isPermanent && (
            <button 
              onClick={() => setShowTrialBlock(true)}
              className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:shadow-lg transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Dùng thử (còn {Math.max(0, 3 - trialRuns)} lượt)</span>
              <span className="sm:hidden">{Math.max(0, 3 - trialRuns)}</span>
            </button>
          )}
          <button 
            onClick={() => setIsFullscreen(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-black text-white rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:bg-zinc-800 transition-all border border-white/10 shadow-lg"
          >
            <Settings2 className="w-3 h-3" />
            <span className="hidden sm:inline">Cài đặt Video</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-[#EEEAE5] text-[#1A1A1A] rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:bg-[#F9F8F6] transition-all"
            title="Đăng nhập"
          >
            <LogIn className="w-3 h-3" />
            <span>Đăng nhập</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-[#7A7570] hover:text-[#1A1A1A] transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-[#7A7570] hover:text-[#1A1A1A] transition-colors relative"
            title="Lịch sử"
          >
            <History className="w-4 h-4" />
            {history.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[#1A1A1A] rounded-full border border-white" />}
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase tracking-tight">Cấu hình hệ thống</h3>
                  <p className="text-[10px] text-[#A09A94] font-bold uppercase tracking-widest italic">● Dành riêng cho quản trị viên</p>
                </div>
                <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-[#7A7570]" /></button>
              </div>

              {!isAdminAuthenticated ? (
                <div className="space-y-6 py-10 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-[#F9F8F6] rounded-full flex items-center justify-center mb-2">
                    <Database className="w-6 h-6 text-[#A09A94]" />
                  </div>
                  <div className="space-y-2 w-full">
                    <h4 className="text-xs font-bold uppercase tracking-widest">Yêu cầu xác thực</h4>
                    <p className="text-[10px] text-[#A09A94] uppercase tracking-widest">Nhập mật khẩu để truy cập quản trị</p>
                  </div>
                  <div className="w-full space-y-4">
                    <input 
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      placeholder="••••••••"
                      className="w-full px-4 py-4 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-center text-lg tracking-[0.5em]"
                    />
                    <button 
                      onClick={handleAdminLogin}
                      className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    >
                      Đăng nhập
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Database Config Section */}
                  <div className="p-4 bg-[#F9F8F6] rounded-2xl border border-[#EEEAE5] space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Liên kết Supabase</h4>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full", dbStatus?.dbInitialized ? "bg-green-500" : "bg-red-500")} />
                        <span className="text-[8px] uppercase font-bold text-[#A09A94]">
                          {dbStatus?.dbInitialized ? "Đã kết nối" : "Chưa kết nối"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase text-[#7A7570] tracking-widest">Dự án mặc định (Hardcoded)</label>
                        <div className="px-3 py-2 bg-white border border-[#EEEAE5] rounded-xl text-[10px] font-mono text-[#1A1A1A]">
                          encpsaatojnxgyjjcvnx
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase text-[#7A7570] tracking-widest leading-none">Supabase Service Role Key</label>
                        <input 
                          type="password"
                          value={supabaseKey}
                          onChange={(e) => setSupabaseKey(e.target.value)}
                          placeholder="Dán Key Service Role tại đây"
                          className="w-full px-3 py-2 bg-white border border-[#EEEAE5] rounded-xl text-[10px]"
                        />
                      </div>
                      <button 
                        onClick={handleSetupDb}
                        className="w-full py-2 bg-[#1A1A1A] text-white rounded-lg text-[9px] font-bold uppercase tracking-widest"
                      >
                        Kết nối Supabase
                      </button>

                      {dbStatus?.lastInitError && (
                        <div className="p-2 bg-red-50 rounded-lg">
                          <p className="text-[8px] text-red-600 font-bold uppercase leading-tight">Lỗi: {dbStatus.lastInitError}</p>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t border-[#EEEAE5]/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] text-[#A09A94] uppercase font-bold tracking-widest">Cấu trúc database</span>
                          <button 
                            onClick={() => {
                              const sql = `-- 1. Bảng access_links
CREATE TABLE IF NOT EXISTS access_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usage JSONB DEFAULT '{"pc": [], "tablet": [], "phone": []}'::JSONB
);

-- 2. Bảng gemini_keys
CREATE TABLE IF NOT EXISTS gemini_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    status_message TEXT DEFAULT 'Chờ kiểm tra',
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng settings
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    gemini_api_key TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Nếu đã có bảng gemini_keys mà lỗi, chạy lệnh sau:
-- ALTER TABLE gemini_keys ADD COLUMN IF NOT EXISTS status_message TEXT DEFAULT 'Chờ kiểm tra';
-- ALTER TABLE gemini_keys ADD COLUMN IF NOT EXISTS last_checked TIMESTAMPTZ;

INSERT INTO settings (id) VALUES ('master') ON CONFLICT (id) DO NOTHING;`;
                              navigator.clipboard.writeText(sql);
                              alert("Đã sao chép mã SQL mới (bao gồm lệnh cập nhật nếu bảng đã tồn tại)!");
                            }}
                            className="text-[8px] bg-white border border-[#EEEAE5] px-2 py-0.5 rounded text-[#1A1A1A] font-bold uppercase hover:bg-[#F9F8F6]"
                          >
                            Sao chép SQL
                          </button>
                        </div>
                        <details className="text-[8px] text-[#A09A94]">
                          <summary className="cursor-pointer hover:text-[#1A1A1A] uppercase font-bold tracking-widest opacity-50">Xem chi tiết mã SQL</summary>
                          <pre className="mt-2 p-2 bg-white rounded border border-[#EEEAE5] whitespace-pre-wrap leading-normal font-mono select-all">
{`-- 1. Bảng access_links
CREATE TABLE IF NOT EXISTS access_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    is_permanent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    usage JSONB DEFAULT '{"pc": [], "tablet": [], "phone": []}'::JSONB
);

-- 2. Bảng gemini_keys
CREATE TABLE IF NOT EXISTS gemini_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    status_message TEXT DEFAULT 'Chờ kiểm tra',
    last_checked TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng settings (Cập nhật)
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    gemini_api_key TEXT,
    admin_meta JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Khởi tạo hàng config
INSERT INTO settings (id) VALUES ('master') 
ON CONFLICT (id) DO NOTHING;

-- Bổ sung cột nếu bảng đã tồn tại
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_meta JSONB DEFAULT '{}';`}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Master Key Section */}
                    <div className="p-4 bg-white/50 rounded-2xl border border-[#EEEAE5] space-y-4">
                      
                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Khóa Gemini chính (Master Database)</label>
                        <div className="flex gap-2">
                          <input 
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="Nhập Key chính của bạn"
                            className="flex-1 px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm"
                          />
                        </div>
                        <p className="text-[9px] text-[#A09A94] italic leading-tight">Sử dụng cho toàn bộ ứng dụng nếu danh sách Key bên dưới trống.</p>
                      </div>

                      <div className="h-px bg-[#EEEAE5]/50" />

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Thông tin phân phối (Hiển thị ở bản dùng thử)</label>
                        <div className="space-y-2">
                          <input type="text" value={adminSetupName} onChange={(e) => setAdminSetupName(e.target.value)} placeholder="Tên / Thương hiệu (vd: Nguyễn Văn A)" className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-xs" />
                          <input type="text" value={adminSetupZalo} onChange={(e) => setAdminSetupZalo(e.target.value)} placeholder="Số Zalo / Liên hệ (vd: 0912.345.678)" className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-xs" />
                          <input type="url" value={adminSetupTrialLink} onChange={(e) => setAdminSetupTrialLink(e.target.value)} placeholder="Link Website / App dùng thử (nếu có)" className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-xs" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Link Tiếp Thị Liên Kết (Hỗ Trợ Đại Lý / CTV)</label>
                        <textarea
                          placeholder={`Cấu trúc (Mỗi link 1 dòng):\nTừ khóa | URL Affiliate | Mạng xã hội/Nguồn\n\nVD:\nÁo sơ mi lụa tơ tằm | https://vt.tiktok.com/123/ | TikTok Ngọc Hà`}
                          value={adminAffiliateLinks}
                          onChange={(e) => setAdminAffiliateLinks(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-[11px] font-mono whitespace-pre-wrap focus:outline-none focus:border-[#1A1A1A] resize-none"
                        />
                      </div>

                      <button 
                        onClick={saveMasterKey}
                        className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                        title="Lưu cấu hình"
                      >
                        <Save className="w-4 h-4" />
                        Lưu Thay Đổi Quản Trị Hệ Thống
                      </button>
                    </div>

                    <div className="h-px bg-[#EEEAE5]" />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Quản lý Pool Key</h4>
                        <p className="text-[8px] text-[#A09A94] uppercase font-bold">Nhập nhiều key & Tự động quét</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={`https://supabase.com/dashboard/project/encpsaatojnxgyjjcvnx/editor`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[8px] px-2 py-1 bg-white border border-[#EEEAE5] rounded shadow-sm font-bold uppercase transition-all hover:bg-blue-50 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Database className="w-2.5 h-2.5" />
                          Mở Dashboard SQL
                        </a>
                        <button 
                          onClick={() => setShowRawData(!showRawData)}
                          className="text-[8px] px-2 py-1 bg-white border border-[#EEEAE5] rounded shadow-sm font-bold uppercase transition-all hover:bg-[#F9F8F6]"
                        >
                          {showRawData ? "Đóng Dữ Liệu" : "Xem Dữ Liệu Thô"}
                        </button>
                        <span className="text-[8px] uppercase font-bold text-[#A09A94] bg-[#F9F8F6] px-2 py-1 rounded">Tổng: {geminiKeys.length}</span>
                      </div>
                    </div>

                    {showRawData && (
                      <div className="p-3 bg-black rounded-xl font-mono text-[9px] text-green-400 overflow-x-auto border border-green-900/30">
                        <pre>{JSON.stringify(geminiKeys, null, 2)}</pre>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase text-[#7A7570] tracking-widest px-1">Nhập danh sách Key (Mỗi dòng 1 key)</label>
                        <textarea 
                          value={newGeminiKey}
                          onChange={(e) => setNewGeminiKey(e.target.value)}
                          placeholder="Dán danh sách key tại đây..."
                          rows={3}
                          className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-xs font-mono custom-scrollbar resize-none focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleCreateGeminiKey}
                          className="flex-1 py-2.5 bg-[#1A1A1A] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                        >
                          Lưu & Thêm vào Pool
                        </button>
                        <button 
                          onClick={handleCheckAllKeys}
                          className={cn(
                            "px-4 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] rounded-xl text-[10px] font-bold uppercase whitespace-nowrap transition-all",
                            checkingKeys.length > 0 ? "opacity-50 cursor-not-allowed bg-gray-100" : "hover:bg-[#1A1A1A] hover:text-white"
                          )}
                          disabled={checkingKeys.length > 0}
                        >
                          {checkingKeys.length > 0 ? `Đang check... (${checkingKeys.length})` : "Kiểm tra toàn bộ"}
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[350px] overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-[#EEEAE5] rounded-2xl p-2 bg-[#F9F8F6]/50">
                      {geminiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-2 opacity-50">
                          <Database className="w-8 h-8 text-[#A09A94]" />
                          <p className="text-[9px] text-center text-[#A09A94] uppercase tracking-widest font-bold">Chưa có Key nào trong Database</p>
                        </div>
                      ) : (
                        <table className="w-full text-[10px]">
                          <thead>
                            <tr className="text-[#A09A94] uppercase text-[8px] tracking-widest border-b border-[#EEEAE5]">
                              <th className="text-left py-2 px-2">Thông tin / Trạng thái</th>
                              <th className="text-right py-2 px-2">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody>
                            {geminiKeys.map((k, idx) => (
                              <tr key={k.id || idx} className="border-b border-[#EEEAE5]/50 group hover:bg-white/50 transition-colors">
                                <td className="py-3 px-2">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-[#1A1A1A]">{k.label}</span>
                                      <span className="text-[9px] font-mono text-[#A09A94] bg-white px-1.5 py-0.5 rounded border border-[#EEEAE5]">...{k.key.slice(-6)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        onClick={() => k.status_message?.startsWith("Lỗi") && alert(`Chi tiết lỗi:\n${k.status_message}`)}
                                        className={cn(
                                          "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight flex items-center gap-1 transition-all cursor-pointer",
                                          k.active && k.status_message === "Hoạt động" 
                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                            : k.status_message?.startsWith("Lỗi") 
                                              ? "bg-red-50 text-red-600 border border-red-100 ring-1 ring-red-200"
                                              : "bg-amber-50 text-amber-600 border border-amber-100"
                                        )}
                                        title={k.status_message?.startsWith("Lỗi") ? "Click để xem chi tiết lỗi" : ""}
                                      >
                                        {checkingKeys.includes(k.id) ? (
                                          <div className="w-2 h-2 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                          <div className={cn("w-1.5 h-1.5 rounded-full", k.active && k.status_message === "Hoạt động" ? "bg-emerald-500" : "bg-amber-500")} />
                                        )}
                                        <span className="truncate max-w-[120px]">{k.status_message || "Chưa xác định"}</span>
                                      </div>
                                      {k.last_checked && (
                                        <span className="text-[8px] text-[#A09A94] italic font-medium">Lúc: {new Date(k.last_checked).toLocaleTimeString()}</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button 
                                      onClick={() => handleUpdateGeminiKey(k.id, { active: !k.active })}
                                      className={cn(
                                        "p-1.5 rounded-lg transition-all",
                                        k.active ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"
                                      )}
                                      title={k.active ? "Tạm dừng" : "Kích hoạt"}
                                    >
                                      {k.active ? <Activity className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteGeminiKey(k.id)}
                                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                      title="Xóa vĩnh viễn"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-[#EEEAE5]" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Danh sách Link chia sẻ</h4>
                      <LinkIcon className="w-3.5 h-3.5 text-[#A09A94]" />
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newLinkLabel}
                        onChange={(e) => setNewLinkLabel(e.target.value)}
                        placeholder="Tên khách hàng / Nhãn"
                        className="flex-1 px-4 py-2 bg-[#F9F8F6] border border-[#EEEAE5] rounded-lg text-xs"
                      />
                      <button 
                        onClick={handleCreateLink}
                        className="px-4 py-2 bg-[#1A1A1A] text-white rounded-lg text-[10px] font-bold uppercase whitespace-nowrap"
                      >
                        Tạo Link
                      </button>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                      {adminLinks.length === 0 ? (
                        <p className="text-[10px] text-center py-6 text-[#A09A94] uppercase tracking-widest">Chưa có link nào được tạo</p>
                      ) : (
                        adminLinks.map((l: any) => {
                          const createdAt = new Date(l.created_at || Date.now());
                          const diffDays = Math.ceil(Math.abs(new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
                          const isExpired = !l.is_permanent && diffDays > 7;

                          return (
                            <div key={l.id} className={cn("p-4 rounded-2xl border border-[#EEEAE5] space-y-3 group bg-[#FDFCFB]", !l.active && "opacity-60 grayscale")}>
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-[10px] font-bold uppercase text-[#1A1A1A]">{l.label}</p>
                                  <p className="text-[8px] text-[#A09A94] uppercase font-bold">
                                    {l.is_permanent ? "● Vĩnh viễn" : isExpired ? "● Hết hạn" : `● Dùng thử: Còn ${Math.max(0, 7 - diffDays)} ngày`}
                                  </p>
                                </div>
                                <div className="flex gap-1.5 flex-wrap">
                                  <button 
                                    onClick={() => handleUpdateLink(l.id, { active: !l.active })}
                                    className={cn("px-2 py-1.5 rounded text-[8px] font-bold uppercase transition-all shadow-sm shrink-0", l.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200")}
                                    title={l.active ? "Tạm dừng" : "Kích hoạt"}
                                  >
                                    {l.active ? "Đang chạy" : "Tạm dừng"}
                                  </button>
                                  {l.is_permanent ? (
                                    <button 
                                      onClick={() => handleUpdateLink(l.id, { isPermanent: false })}
                                      className="px-2 py-1.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold uppercase hover:bg-amber-200 transition-all shadow-sm shrink-0"
                                      title="Chuyển về dùng thử (7 ngày)"
                                    >
                                      Dùng thử
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleUpdateLink(l.id, { isPermanent: true })}
                                      className="px-2 py-1.5 bg-blue-100 text-blue-700 rounded text-[8px] font-bold uppercase hover:bg-blue-200 transition-all shadow-sm shrink-0"
                                      title="Kích hoạt vĩnh viễn"
                                    >
                                      Kích hoạt
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[9px] text-[#A09A94] pt-2 border-t border-[#EEEAE5]/50">
                                <code className="bg-[#EEEAE5] px-1.5 py-1 rounded text-[8px] font-mono select-all">{l.token}</code>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold uppercase tracking-tighter opacity-60">Dùng: {(l.usage?.pc?.length || 0) + (l.usage?.tablet?.length || 0) + (l.usage?.phone?.length || 0)}/3</span>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        const url = `${window.location.origin}${window.location.pathname}?access=${l.token}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Đã copy link gửi khách!");
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#EEEAE5] hover:bg-[#F9F8F6] rounded-md transition-all shadow-sm"
                                      title="Sao chép link gửi khách"
                                    >
                                      <Copy className="w-3.5 h-3.5 text-[#1A1A1A]" />
                                      <span className="text-[7px] font-bold uppercase">Sao chép</span>
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteLink(l.id)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 rounded-md transition-all shadow-sm"
                                      title="Xóa link này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span className="text-[7px] font-bold uppercase">Xóa</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsAdminAuthenticated(false)}
                    className="w-full py-3 border border-[#EEEAE5] text-[#7A7570] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all font-mono"
                  >
                    Đăng xuất Quản trị
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {keyStatus && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 rounded-lg"
                  >
                    <p className="text-[10px] text-center text-blue-700 font-bold uppercase tracking-tight">{keyStatus}</p>
                  </motion.div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] text-center text-[#A09A94] italic leading-relaxed">
                    Mẹo: Dùng nhiều Key từ các Google Cloud Project khác nhau để đạt hạn mức cao nhất.
                  </p>
                  <p className="text-[9px] text-center text-amber-600 font-medium">
                    (Mỗi Key miễn phí có hạn mức khoảng 20 yêu cầu/ngày)
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trial Block Modal */}
      <AnimatePresence>
        {showTrialBlock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-700" />
              
              <div className="absolute top-4 right-4">
                <button onClick={() => setShowTrialBlock(false)} className="p-2 text-[#A09A94] hover:text-[#1A1A1A] transition-colors rounded-full hover:bg-[#F9F8F6]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center space-y-6 pt-4">
                <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-light serif text-[#1A1A1A]">Trải nghiệm đã kết thúc</h3>
                  <p className="text-sm text-[#7A7570] leading-relaxed px-4">
                    Bạn đã sử dụng hết lượt hỏi tư vấn trải nghiệm. Để mở khóa đầy đủ tính năng và sử dụng không giới hạn, hãy kích hoạt phần mềm.
                  </p>
                </div>

                <div className="bg-[#F9F8F6] p-6 rounded-2xl border border-[#EEEAE5] text-left space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#A09A94]">Thông tin Nhà Phát triển</p>
                  
                  {appInfo?.admin_name && (
                    <div className="flex justify-between items-center pb-3 border-b border-[#EEEAE5]">
                      <span className="text-xs text-[#7A7570]">Tên người quản trị</span>
                      <strong className="text-sm hidden sm:block">{appInfo.admin_name}</strong>
                    </div>
                  )}
                  {appInfo?.admin_zalo && (
                    <div className="flex justify-between items-center pb-3 border-b border-[#EEEAE5]">
                      <span className="text-xs text-[#7A7570]">Zalo / Số Điện Thoại</span>
                      <strong className="text-sm hidden sm:block">{appInfo.admin_zalo}</strong>
                    </div>
                  )}
                  {appInfo?.admin_trial_link && (
                    <div className="pt-2">
                      <a href={appInfo.admin_trial_link} target="_blank" rel="noopener noreferrer" className="block w-full py-3 text-center bg-white border border-[#EEEAE5] rounded-xl text-xs font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] transition-colors">
                        Mở liên kết gốc
                      </a>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowTrialBlock(false)}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-black transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Drawer/Modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-[#EEEAE5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  <h3 className="font-bold uppercase tracking-widest text-xs">Lịch sử tư vấn</h3>
                </div>
                <button onClick={() => setShowHistory(false)}><X className="w-5 h-5 text-[#7A7570]" /></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#A09A94] text-center space-y-4">
                    <History className="w-8 h-8 opacity-20" />
                    <p className="text-xs uppercase tracking-widest">Chưa có dữ liệu nào được lưu</p>
                  </div>
                ) : (
                  history.map(item => (
                    <div 
                      key={item.id}
                      className="group p-4 bg-[#F9F8F6] border border-[#EEEAE5] rounded-2xl hover:border-[#1A1A1A] transition-all cursor-pointer relative"
                      onClick={() => loadFromHistory(item)}
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-20 bg-white rounded-lg border border-[#EEEAE5] overflow-hidden shrink-0 flex items-center justify-center">
                          {(item.type === 'consult' || item.type === 'commentary') ? (
                            <img src={item.images.input || ''} className="w-full h-full object-contain" />
                          ) : (
                            item.knowledgeImages && Object.values(item.knowledgeImages).length > 0 ? (
                               <img src={Object.values(item.knowledgeImages)[0]} className="w-full h-full object-cover" />
                            ) : (
                               <BookOpen className="w-6 h-6 text-[#A09A94]" />
                            )
                          )}
                        </div>
                        <div className="space-y-1 py-1 flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] line-clamp-1">
                            {item.type === 'consult' ? 'Tư vấn phong cách' : (item.type === 'commentary' ? 'Bình luận trang phục' : (item.result?.title || 'Kiến thức mở rộng'))}
                          </p>
                          <p className="text-[9px] text-[#A09A94]">{item.date}</p>
                          {item.type !== 'knowledge' && (
                            <div className="flex gap-1 mt-2">
                              {item.images.fullBody && <div className="w-4 h-4 bg-[#1A1A1A] rounded-full" />}
                              {item.images.detail && <div className="w-4 h-4 bg-[#EEEAE5] rounded-full" />}
                              {item.images.improvement && <div className="w-4 h-4 bg-[#1A1A1A] rounded-full" />}
                            </div>
                          )}
                          {item.type === 'knowledge' && item.knowledgeImages && (
                            <p className="text-[9px] mt-2 text-[#7A7570]">{Object.keys(item.knowledgeImages).length} ảnh đã tạo</p>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); }}
                        className="absolute top-2 right-2 p-2 text-[#A09A94] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-[#F9F8F6] rounded-full"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-[#EEEAE5]">
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-full py-4 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                >
                  Đóng lịch sử
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn("pt-20 h-screen flex flex-col", isFullscreen ? "md:flex-row-reverse" : "md:flex-row")}>
        {/* Left Panel */}
        <section className={cn(
          "bg-white border-[#EEEAE5] h-full overflow-y-auto custom-scrollbar transition-all duration-500",
          isFullscreen ? "w-full md:w-[30%] lg:w-[25%] border-l" : "w-full md:w-[45%] lg:w-[40%] border-r"
        )}>
          <div className="p-8 lg:p-12 space-y-10">
            {activeTab === 'consult' ? (
              <>
                <header className="space-y-2">
                  <h2 className="text-3xl font-light leading-tight italic serif">Kiến tạo phong cách</h2>
                  <p className="text-sm text-[#7A7570] leading-relaxed">
                    Nhập các thông số của bạn để AI phân tích và đưa ra giải pháp thời trang hoàn mỹ nhất.
                  </p>
                </header>

                <form onSubmit={handleAnalyze} className="space-y-8">
                  {/* Image Upload Area */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Ảnh khuôn mặt (Tùy chọn)</label>
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
                          <div className="text-center"><p className="text-xs font-medium">Chạm để tải ảnh</p></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Data Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7570] block">Cao (cm)</label>
                      <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7570] block">Nặng (kg)</label>
                      <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7570] block">Giới tính</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm leading-tight h-10 outline-none">
                         <option value="Nam">Nam</option>
                         <option value="Nữ">Nữ</option>
                         <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7570] block">Tuổi (năm sinh)</label>
                      <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="vd: 25 hoặc 1999" className="w-full px-3 py-2.5 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm outline-none" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570] block">Gu thời trang mong muốn</label>
                      <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570] block">Màu sắc ưu thích</label>
                      <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570] block">Bối cảnh sử dụng</label>
                      <input type="text" value={context} onChange={(e) => setContext(e.target.value)} className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7570] block">Chọn phụ kiện tư vấn (Mặc định 2)</label>
                      <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1 border border-dashed border-[#EEEAE5] rounded-lg">
                        {accessoryOptions.map(acc => (
                          <button
                            key={acc}
                            type="button"
                            onClick={() => {
                              setSelectedAccessories(prev => 
                                prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc]
                              );
                            }}
                            className={cn(
                              "px-2 py-1 rounded-full text-[9px] font-bold uppercase transition-all border",
                              selectedAccessories.includes(acc) 
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" 
                                : "bg-white text-[#7A7570] border-[#EEEAE5] hover:border-[#1A1A1A]"
                            )}
                          >
                            {acc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                       <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Mức độ phân tích</label>
                       <div className="flex bg-[#F9F8F6] p-1 rounded-xl border border-[#EEEAE5] w-fit">
                         <button
                           type="button"
                           onClick={() => setDepthLevel('basic')}
                           className={cn(
                             "px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                             depthLevel === 'basic' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#A09A94] hover:text-[#1A1A1A]"
                           )}
                         >
                           Cơ bản (Nhanh)
                         </button>
                         <button
                           type="button"
                           onClick={() => setDepthLevel('detailed')}
                           className={cn(
                             "px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                             depthLevel === 'detailed' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#A09A94] hover:text-[#1A1A1A]"
                           )}
                         >
                           Chuyên sâu
                         </button>
                       </div>
                    </div>

                    <div className="pt-2">
                       <button 
                        type="button" 
                        onClick={() => setShowFlawsInput(!showFlawsInput)}
                        className={cn(
                          "text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2",
                          showFlawsInput ? "bg-[#1A1A1A] text-white" : "bg-[#EEEAE5] text-[#7A7570] hover:bg-[#DDD6CE]"
                        )}
                       >
                         <AlertCircle className="w-3.5 h-3.5" />
                         {showFlawsInput ? "Ẩn tùy chọn che khuyết điểm" : "Tư vấn thêm: Che khuyết điểm cơ thể"}
                       </button>
                    </div>

                    <AnimatePresence>
                      {showFlawsInput && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-2"
                        >
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570] block">Mô tả khuyết điểm (VD: bụng to, chân ngắn...)</label>
                          <textarea 
                            value={flaws} 
                            onChange={(e) => setFlaws(e.target.value)} 
                            placeholder="VD: Da bánh mật, bụng bự, chân ngắn lưng dài..."
                            className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm min-h-[80px]"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <button type="button" onClick={handleClearImage} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors border border-red-100 shadow-sm">Xóa ảnh tải lên</button>
                    {(result || fullBodyImage) && (
                      <button type="button" onClick={handleClearResult} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-100 shadow-sm">Xóa kết quả</button>
                    )}
                    <button type="button" onClick={handleResetTab} className="px-3 py-1.5 bg-[#F9F8F6] text-[#7A7570] rounded-lg text-xs font-medium hover:bg-[#EEEAE5] transition-colors border border-[#DDD6CE] shadow-sm">Làm mới Tab</button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      queueTime > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-yellow-400">Server quá tải. Đợi {queueTime}s...</span></div>
                          <span className="text-[8px] opacity-70">Thêm API Key cá nhân để bỏ qua hàng chờ</span>
                        </div>
                      ) : (
                        <><Loader2 className="w-5 h-5 animate-spin" /><span>Đang phân tích...</span></>
                      )
                    ) : <><span>Bắt đầu tư vấn</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            ) : activeTab === 'commentary' ? (
              <>
                <header className="space-y-2 relative">
                  <h2 className="text-3xl font-light leading-tight italic serif">Bình luận phong thái</h2>
                  <p className="text-sm text-[#7A7570] leading-relaxed">
                    Tải lên ảnh trang phục hiện tại của bạn để nhận những lời khuyên chân thành và cách tối ưu hóa sự xuất hiện của mình.
                  </p>
                  {commentaryImage && !loading && (
                    <button 
                      onClick={() => { setCommentaryImage(null); setAnalysisResult(null); setImprovementImage(null); }}
                      className="absolute top-0 right-0 text-[10px] uppercase font-bold text-[#A09A94] hover:text-[#1A1A1A]"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </header>

                <form onSubmit={handleCommentary} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Ảnh trang phục của bạn</label>
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
                          <div className="text-center"><p className="text-xs font-medium">Tải ảnh bộ đồ</p></div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                    <button type="button" onClick={handleClearImage} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors border border-red-100 shadow-sm">Xóa ảnh tải lên</button>
                    {(analysisResult || commentaryImage) && (
                      <button type="button" onClick={handleClearResult} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors border border-orange-100 shadow-sm">Xóa kết quả</button>
                    )}
                    <button type="button" onClick={handleResetTab} className="px-3 py-1.5 bg-[#F9F8F6] text-[#7A7570] rounded-lg text-xs font-medium hover:bg-[#EEEAE5] transition-colors border border-[#DDD6CE] shadow-sm">Làm mới Tab</button>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading || !commentaryImage}
                    className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Đang thẩm định...</span></> : <><span>Xem bình luận</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            ) : activeTab === 'knowledge' ? (
              <>
                <header className="space-y-2 relative">
                  <h2 className="text-3xl font-light leading-tight italic serif">Kiến thức Thời trang</h2>
                  <p className="text-sm text-[#7A7570] leading-relaxed">
                    Khám phá bách khoa toàn thư về thời trang. Hãy nhập bất kỳ câu hỏi hoặc chủ đề nào bạn muốn tìm hiểu.
                  </p>
                </header>

                <form onSubmit={(e) => { e.preventDefault(); handleKnowledgeSearch(); }} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Chủ đề / Yêu cầu</label>
                    <textarea 
                      value={knowledgeQuery}
                      onChange={(e) => setKnowledgeQuery(e.target.value)}
                      placeholder="VD: Cách chọn áo sơ mi nam, Quy tắc phối đồ cho nữ thấp bé, Sai lầm khi mặc vest..."
                      className="w-full p-4 bg-[#F9F8F6] border border-[#EEEAE5] rounded-2xl resize-none focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Gợi ý chủ đề</label>
                    <div className="flex flex-wrap gap-2">
                      {['Cách chọn áo sơ mi nam', 'Phối đồ cho bé gái', 'Thời trang tiệc tối U45', 'Sai lầm phối đồ nam', 'Bảng phối màu quần áo'].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setKnowledgeQuery(topic)}
                          className="px-3 py-1.5 bg-[#EEEAE5] text-[#1A1A1A] text-xs rounded-full hover:bg-[#DDD6CE] transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSearchingKnowledge || !knowledgeQuery.trim()}
                    className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    {isSearchingKnowledge ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Đang tìm kiếm...</span></> : <><span>Tìm hiểu ngay</span><ChevronRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </>
            ) : activeTab === 'user' ? (
              <>
                <header className="space-y-4 relative">
                  <h2 className="text-3xl font-light leading-tight italic serif">Cấu hình Cá nhân</h2>
                  <p className="text-sm text-[#7A7570] leading-relaxed">
                    Cấu hình cửa hàng, mạng xã hội và API Key để loại bỏ mọi giới hạn hệ thống.
                  </p>
                </header>

                <div className="space-y-4 pt-6 pb-6 border-b border-[#EEEAE5]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">API Key Tạo Văn Bản (Bản quyền bộ não AI)</label>
                      <p className="text-[9px] text-[#A09A94] mt-1">Dùng Key của bạn để bỏ qua hàng chờ & giới hạn</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      value={userGeminiKey}
                      onChange={(e) => setUserGeminiKey(e.target.value)}
                      placeholder="AIzaSy... (Chỉ dành cho tạo văn bản)"
                      className="flex-1 px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-xs focus:outline-none focus:border-[#1A1A1A] transition-colors font-mono"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">API Key Tạo Ảnh (Imagen/Flux)</label>
                      <p className="text-[9px] text-[#A09A94] mt-1">Dùng Key của bạn nếu hệ thống hết hạn mức tạo ảnh.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      value={userImageKey}
                      onChange={(e) => setUserImageKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="flex-1 px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-xs focus:outline-none focus:border-[#1A1A1A] transition-colors font-mono"
                    />
                    <button 
                      onClick={handleUserCheckKey}
                      className="px-4 py-3 bg-[#1A1A1A] text-white rounded-xl font-medium tracking-widest text-[9px] uppercase hover:bg-black transition-colors shrink-0"
                    >
                      Lưu / Kiểm tra
                    </button>
                  </div>
                </div>

                {!isUserUnlocked ? (
                  <div className="space-y-6 pt-10">
                    <div className="space-y-4">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">
                        {userPassword ? 'Nhập mật khẩu' : 'Tạo mật khẩu mới'}
                      </label>
                      <input 
                        type="password"
                        value={tempUserPassword}
                        onChange={(e) => setTempUserPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-sm focus:outline-none focus:border-[#1A1A1A] transition-colors"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if (!userPassword) {
                          if (tempUserPassword.length < 4) return alert("Mật khẩu phải từ 4 ký tự.");
                          setUserPassword(tempUserPassword);
                          localStorage.setItem('boutique_user_pwd', tempUserPassword);
                          setTempUserPassword('');
                          setIsUserUnlocked(true);
                        } else {
                          if (tempUserPassword === userPassword) {
                            setTempUserPassword('');
                            setIsUserUnlocked(true);
                          } else {
                            alert("Mật khẩu không đúng.");
                          }
                        }
                      }}
                      className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-medium tracking-widest text-[10px] uppercase hover:bg-black transition-colors"
                    >
                      {userPassword ? 'Đăng nhập' : 'Lưu mật khẩu'}
                    </button>
                    <p className="text-[10px] text-center text-[#A09A94]">Thiết lập này chỉ lưu trữ khả dụng trên thiết bị hiện tại.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Link Tiếp Thị Liên Kết (Của Bạn)</label>
                        <LockIcon className="w-3 h-3 text-[#A09A94]" />
                      </div>
                      <textarea 
                        value={userAffiliateLinks}
                        onChange={(e) => setUserAffiliateLinks(e.target.value)}
                        placeholder={`Nhập linh tiếp thị của bạn.\nCấu trúc:\nTừ khóa | Link TikTok/Shopee | Nguồn\nVD:\nÁo thun polo đen | https://vt.tiktok... | Áo Polo`}
                        rows={5}
                        className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-[11px] focus:outline-none focus:border-[#1A1A1A] transition-colors font-mono whitespace-pre-wrap resize-none"
                      />
                      <p className="text-[9.5px] text-[#A09A94] leading-relaxed">
                        Chuyên gia AI sẽ tự động lựa chọn link phù hợp với tư vấn và kết quả nhận xét của người dùng. Link CỦA BẠN luôn được ưu tiên cao nhất, nếu bạn không có link phù hợp hệ thống sẽ tự dùng link của Quản trị Hệ thống.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#7A7570]">Mạng Xã Hội Truyền Thông</label>
                      </div>
                      <div className="space-y-3">
                        <input type="text" value={socialLinks.facebook} onChange={(e) => setSocialLinks(s => ({...s, facebook: e.target.value}))} placeholder="Facebook URL" className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-[11px] focus:outline-none focus:border-[#1A1A1A] transition-colors" />
                        <input type="text" value={socialLinks.tiktok} onChange={(e) => setSocialLinks(s => ({...s, tiktok: e.target.value}))} placeholder="TikTok URL (vd: https://tiktok.com/@ban)" className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-[11px] focus:outline-none focus:border-[#1A1A1A] transition-colors" />
                        <input type="text" value={socialLinks.zalo} onChange={(e) => setSocialLinks(s => ({...s, zalo: e.target.value}))} placeholder="Zalo (SĐT hoặc Link)" className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-[11px] focus:outline-none focus:border-[#1A1A1A] transition-colors" />
                        <input type="text" value={socialLinks.shopee} onChange={(e) => setSocialLinks(s => ({...s, shopee: e.target.value}))} placeholder="Shopee Store URL" className="w-full px-4 py-3 bg-[#F9F8F6] border border-[#EEEAE5] rounded-xl text-[11px] focus:outline-none focus:border-[#1A1A1A] transition-colors" />
                      </div>
                      <p className="text-[9.5px] text-[#A09A94] leading-relaxed">
                        Cấu hình các liên kết phía trên, các ứng dụng truyền thông này sẽ được xuất hiện rõ dưới dạng "Liên hệ Tư vấn viên" ở các kết quả. Cực kỳ hiệu quả nếu bạn ghi hình / livestream kết quả tư vấn để người xem tìm tới bạn!
                      </p>
                    </div>

                    <button className="w-full py-4 text-[#A09A94] text-[10px] border border-[#EEEAE5] uppercase tracking-widest font-bold rounded-xl" onClick={() => setIsUserUnlocked(false)}>
                      Khóa truy cập
                    </button>
                  </div>
                )}
              </>
            ) : null}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: Results */}
        <section className={cn(
          isFullscreen ? "bg-black" : "bg-[#F9F8F6]", 
          "h-full overflow-y-auto relative custom-scrollbar transition-all duration-500 flex flex-col",
          isFullscreen ? "w-full md:w-[70%] lg:w-[75%]" : "w-full md:w-[55%] lg:w-[60%]"
        )}>
          {/* Action Bar */}
          {((activeTab === 'consult' && result) || (activeTab === 'commentary' && analysisResult) || (activeTab === 'knowledge' && knowledgeResult)) && (
            <div className={cn(
              "absolute top-6 right-6 z-[250] flex gap-2 transition-opacity duration-500",
              (isAppRecording) ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
              <button 
                onClick={handleSaveToHistory}
                className="p-3 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm hover:bg-white transition-all group"
                title="Lưu kết quả"
              >
                <Save className="w-5 h-5 text-[#7A7570] group-hover:text-[#1A1A1A]" />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={cn(
                  "p-3 transition-all group rounded-full shadow-sm flex items-center justify-center border",
                  isFullscreen ? "bg-[#1A1A1A] text-white border-black" : "bg-white/80 backdrop-blur-sm border-[#EEEAE5] hover:bg-white"
                )}
                title={isFullscreen ? "Thoát xem to" : "Toàn màn hình"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5 text-[#7A7570] group-hover:text-[#1A1A1A]" />}
              </button>
            </div>
          )}
          
          {(result || analysisResult) && !isFullscreen && (
            <div className="w-full bg-amber-50 border-b border-amber-100 p-4 pt-10 md:pt-4 text-center">
              <p className="text-[11.5px] md:text-sm text-amber-800 font-medium">Để dán câu lệnh và tạo ảnh AI, hãy mở: <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" className="font-bold underline text-blue-600 hover:text-blue-800 block sm:inline mt-1 sm:mt-0 px-2 py-1 bg-white/50 rounded-md sm:bg-transparent sm:px-0 sm:py-0">https://gemini.google.com/app</a></p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {isFullscreen ? (
              <motion.div 
                key="fullscreen-pane"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full w-full bg-black flex flex-col relative overflow-hidden"
              >
                {(() => {
                  let origImage = '';
                  let genImage = '';
                  let textStr = '';
                  let karaokeLabel = '';
                  
                  if (activeTab === 'consult' && result) {
                    origImage = image || '';
                    if (karaokeViewType === 'original') {
                       genImage = image || '';
                       karaokeLabel = 'Ảnh Gốc';
                    } else if (karaokeViewType === 'full') {
                       genImage = historyImages['full']?.[currentImageIndices['full'] || 0] || '';
                       karaokeLabel = 'Toàn bộ trang phục';
                    } else if (karaokeViewType.startsWith('detail_')) {
                       genImage = historyImages[karaokeViewType]?.[currentImageIndices[karaokeViewType] || 0] || '';
                       const name = karaokeViewType.replace('detail_', '');
                       karaokeLabel = `Chi tiết: ${name}`;
                    } else {
                       genImage = historyImages['full']?.[currentImageIndices['full'] || 0] || '';
                    }
                    textStr = result.advice;
                  } else if (activeTab === 'commentary' && analysisResult) {
                    origImage = commentaryImage || '';
                    if (karaokeViewType === 'original') {
                       genImage = commentaryImage || '';
                       karaokeLabel = 'Ảnh Gốc';
                    } else if (karaokeViewType === 'improvement') {
                       genImage = historyImages['improvement']?.[currentImageIndices['improvement'] || 0] || '';
                       karaokeLabel = 'AI Cải Thiện';
                    } else {
                       genImage = historyImages['improvement']?.[currentImageIndices['improvement'] || 0] || '';
                    }
                    textStr = analysisResult.analysis;
                  } else if (activeTab === 'knowledge' && knowledgeResult) {
                    textStr = knowledgeResult.content;
                    origImage = knowledgeImages[currentKnowledgeMediaIndex] || '';
                  }
                  
                  const isKnowledge = activeTab === 'knowledge';
                  const isKaraokeActive = !!karaokeViewType && !isKnowledge;
                  const currentMain = isKnowledge ? (origImage || image || '') : (isKaraokeActive ? (genImage || origImage || image || '') : (fsMainTab === 'original' ? (origImage || genImage || image || '') : (genImage || origImage || image || '')));
                  const currentThumb = isKnowledge ? null : (isKaraokeActive ? (karaokeViewType === 'original' ? (historyImages['full']?.[0] || historyImages['improvement']?.[0] || genImage) : (origImage || image)) : (fsMainTab === 'original' ? (genImage || historyImages['full']?.[0]) : (origImage || image)));
                  const mainLabel = null;
                  const thumbLabel = null;

                  const isGeneratingAny = Object.values(isGeneratingImg).some(Boolean);
                  const totalExpected = activeTab === 'consult' ? (result?.detailPrompts?.length || 0) + 1 : (activeTab === 'commentary' ? 1 : 0);
                  let generatedCount = 0;
                  if (activeTab === 'consult') {
                    if (historyImages['full']?.length) generatedCount++;
                    result?.detailPrompts?.forEach(dp => { if (historyImages[`detail_${dp.name}`]?.length) generatedCount++; });
                  } else if (activeTab === 'commentary') {
                    if (historyImages['improvement']?.length) generatedCount++;
                  }

                  return (
                    <div id="mobile-fullscreen-view" className="w-full h-full relative flex flex-col group overflow-hidden bg-black">
                      <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-[210] transition-opacity flex justify-between items-start pointer-events-none group-hover:opacity-100 opacity-0">
                        <div className="text-white">
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-2", isAppRecording ? "text-red-500" : "text-amber-500")}>
                            <span className={cn("w-2 h-2 rounded-full animate-pulse", isAppRecording ? "bg-red-500" : "bg-amber-500")}></span> 
                            {isAppRecording ? "ĐANG QUAY VIDEO..." : (isGeneratingAny ? "Đang chờ ảnh..." : "Chế độ quay chuẩn 9:16")}
                          </p>
                        </div>
                      </div>

                      {isGeneratingAny && totalExpected > 0 && (
                        <div className="absolute top-16 right-4 z-[210] pointer-events-none bg-black/60 text-white text-[10px] px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Loader2 className="w-3 h-3 animate-spin"/> Đã tạo {generatedCount}/{totalExpected}
                        </div>
                      )}

                      {currentThumb && currentThumb !== currentMain && (
                        <div className="absolute top-24 left-4 z-[215] flex flex-col items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-md">{thumbLabel}</span>
                          <button onClick={() => { setKaraokeViewType(''); setFsMainTab(fsMainTab === 'original' ? 'generated' : 'original'); }} className="relative w-16 h-28 border-2 border-white/40 rounded-xl overflow-hidden shadow-2xl hover:scale-105 transition-transform bg-black/50">
                            {currentThumb?.match(/\.(mp4|webm)(\?.*)?$/i) ? <video src={currentThumb} autoPlay loop muted playsInline className="w-full h-full object-cover" /> : <img src={currentThumb} className="w-full h-full object-cover" />}
                          </button>
                        </div>
                      )}

                      {mainLabel && (
                        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[215] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-[#FFD700]/30 shadow-lg">{mainLabel}</span>
                        </div>
                      )}

                      {!isKnowledge && (
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[215] flex gap-2 overflow-x-auto max-w-full px-4 hide-scrollbar opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setKaraokeViewType('original')} className={cn("px-3 py-1 rounded-full text-[10px] whitespace-nowrap", karaokeViewType === 'original' ? 'bg-white text-black' : 'bg-black/50 text-white')}>Ảnh Gốc</button>
                          <button onClick={() => setKaraokeViewType('full')} className={cn("px-3 py-1 rounded-full text-[10px] whitespace-nowrap", karaokeViewType === 'full' ? 'bg-white text-black' : 'bg-black/50 text-white')}>Toàn Thân</button>
                          {result?.detailPrompts?.map((dp, idx) => (
                            <button key={dp.name || idx} onClick={() => setKaraokeViewType(`detail_${dp.name}`)} className={cn("px-3 py-1 rounded-full text-[10px] whitespace-nowrap", karaokeViewType === `detail_${dp.name}` ? 'bg-white text-black' : 'bg-black/50 text-white')}>{dp.name}</button>
                          ))}
                        </div>
                      )}

                      <div className="w-full h-full relative z-[10] bg-black overflow-hidden flex flex-col pointer-events-auto">
                        <KaraokeText 
                          text={textStr} 
                          mediaUrl={currentMain}
                          isFullscreen={true} 
                          onClose={() => setIsFullscreen(false)}
                          onHighlightChange={isKnowledge ? handleKnowledgeHighlight : (activeTab === 'consult' ? handleConsultHighlight : (activeTab === 'commentary' ? handleCommentaryHighlight : undefined))}
                          onSpeakingChange={setIsSpeakingResult}
                          onRecordingChange={setIsAppRecording}
                          recAspectRatio={recAspectRatio}
                          setRecAspectRatio={setRecAspectRatio}
                          disabled={Object.values(isGeneratingImg).some(Boolean)}
                          disabledMessage="Vui lòng chờ AI tạo xong."
                        />
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : activeTab === 'consult' ? (
              <motion.div 
                key={result ? 'result-consult' : 'empty-consult'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 lg:p-16"
              >
                {!result && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-20 h-20 bg-white shadow-sm border border-[#EEEAE5] rounded-full flex items-center justify-center mb-6">
                      {image ? <img src={image} className="w-10 h-10 object-contain rounded-lg" /> : <Shirt className="w-8 h-8 text-[#A09A94]" />}
                    </div>
                    <h3 className="text-xl font-medium tracking-tight">
                      {image ? "Ảnh đã sẵn sàng" : "Cảm hứng đang chờ đợi"}
                    </h3>
                    <p className="text-xs text-[#7A7570] mt-2 max-w-xs">
                      {error ? (
                        <span className="text-red-500 font-medium">{error}</span>
                      ) : (
                        image ? "Bấm nút 'Bắt đầu tư vấn' để AI phân tích phong cách của bạn." : "Dán ảnh (Ctrl+V) hoặc điền form để bắt đầu"
                      )}
                    </p>
                  </div>
                ) : loading ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin" />
                    <p className="mt-6 text-sm font-medium tracking-widest uppercase text-[#7A7570]">Nghệ thuật phối đồ đang thành hình...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-6 lg:gap-8 items-start">
                      <div className="flex-1 space-y-6 w-full">
                         <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <h5 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#A09A94]">Hình ảnh phác họa</h5>
                            <div className="h-px bg-[#EEEAE5] grow" />
                          </div>
                          
                          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-8">
                        {/* Input Image Reference - Smaller on mobile */}
                        {image && !removedSlots.includes('original') && (
                          <div className="space-y-2 order-2 lg:order-1 relative group">
                            <h6 className="text-[9px] uppercase tracking-widest font-bold text-[#A09A94] text-center">Gốc</h6>
                            <div className="aspect-[4/5] max-w-[80px] lg:max-w-none mx-auto bg-white rounded-xl border border-[#EEEAE5] overflow-hidden shadow-sm">
                              <img src={image} className="w-full h-full object-contain" />
                            </div>
                            <button 
                              onClick={() => setRemovedSlots(prev => [...prev, 'original'])}
                              className="absolute top-4 right-1/2 translate-x-[45px] lg:translate-x-0 lg:top-5 lg:right-[-10px] p-1 bg-white border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        
                        {!removedSlots.includes('full') && (
                          <div className="lg:col-span-1 space-y-3 order-3 relative group">
                            <div className="aspect-[4/5] lg:aspect-[3/4] max-w-[240px] lg:max-w-none mx-auto bg-white rounded-2xl lg:rounded-3xl border border-[#EEEAE5] overflow-hidden shadow-sm relative z-0">
                              <ColorPalette colors={result.colors} />
                              {(historyImages['full'] || []).length > 0 ? (
                                <>
                                  {historyImages['full'][currentImageIndices['full'] || 0]?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                    <video src={historyImages['full'][currentImageIndices['full'] || 0]} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  ) : (
                                    <img src={historyImages['full'][currentImageIndices['full'] || 0]} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  )}
                                  <FloatingImageActions 
                                    url={historyImages['full'][currentImageIndices['full'] || 0]} 
                                    name="fashion-full-body" 
                                    prompt={result?.fullBodyPrompt}
                                    originalUrl={image}
                                    onPaste={(url) => addToHistory('full', url)}
                                  />
                                </>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                                  {isGeneratingImg.full ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-[#DDD6CE]" />
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => handleManualImageGen('full')}
                                        className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-lg"
                                      >
                                        Tạo ảnh toàn thân
                                      </button>
                                      <FloatingImageActions 
                                        url={image || ''} 
                                        name="empty-full" 
                                        prompt={result?.fullBodyPrompt}
                                        originalUrl={image}
                                        onPaste={(url) => addToHistory('full', url)}
                                      />
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                            <button 
                              onClick={() => setRemovedSlots(prev => [...prev, 'full'])}
                              className="absolute top-0 right-0 p-1 lg:p-2 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-3 h-3 lg:w-4 lg:h-4" />
                            </button>
                            {(historyImages['full'] || []).length > 0 && (
                              <div className="space-y-4">
                                <VersionGallery 
                                  history={historyImages['full'] || []} 
                                  currentIndex={currentImageIndices['full'] || 0}
                                  onSetIndex={(idx) => setCurrentImageIndices(prev => ({ ...prev, full: idx }))}
                                  onRegen={() => generateMoreImage('full')}
                                  isGenerating={isGeneratingImg['full']}
                                />
                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                  <p className="text-[9px] text-[#8B7E6D] italic leading-relaxed">
                                    Mẹo: Sử dụng nút "Copy" trên ảnh để lấy Prompt và dán vào <a href="https://gemini.google.com/app" target="_blank" className="font-bold underline text-amber-600 hover:text-amber-700 transition-colors">https://gemini.google.com/app</a> để tạo ảnh siêu nét bằng Gemini Image Generator.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {result?.detailPrompts && result.detailPrompts.length > 0 ? (
                          result.detailPrompts.filter(dp => !removedSlots.includes(`detail_${dp.name}`)).map((dp, idx) => {
                            const typeKey = `detail_${dp.name || idx}`;
                            return (
                              <div key={`${typeKey}-${idx}`} className="space-y-4 order-1 relative group">
                                <h6 className="text-[9px] uppercase tracking-widest font-bold text-[#A09A94] text-center">Chi tiết: {dp.name}</h6>
                                <div className="aspect-[4/5] lg:aspect-[3/4] max-w-[240px] lg:max-w-none mx-auto bg-white rounded-2xl lg:rounded-3xl border border-[#EEEAE5] overflow-hidden shadow-sm relative z-0">
                                  {(historyImages[typeKey] || []).length > 0 ? (
                                    <>
                                      {historyImages[typeKey][currentImageIndices[typeKey] || 0]?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                        <video src={historyImages[typeKey][currentImageIndices[typeKey] || 0]} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      ) : (
                                        <img src={historyImages[typeKey][currentImageIndices[typeKey] || 0]} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      )}
                                      <FloatingImageActions 
                                        url={historyImages[typeKey][currentImageIndices[typeKey] || 0]} 
                                        name={`fashion-detail-${dp.name}`} 
                                        prompt={dp.prompt}
                                        originalUrl={image}
                                        onPaste={(url) => addToHistory(typeKey, url)}
                                      />
                                    </>
                                  ) : (
                                    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                                      {isGeneratingImg[typeKey] ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-[#DDD6CE]" />
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => handleManualImageGen(typeKey, dp.prompt)}
                                            className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-lg"
                                          >
                                            Xem {dp.name}
                                          </button>
                                          <FloatingImageActions 
                                            url={image || ''} 
                                            name={`empty-detail-${dp.name}`} 
                                            prompt={dp.prompt}
                                            originalUrl={image}
                                            onPaste={(url) => addToHistory(typeKey, url)}
                                          />
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={() => setRemovedSlots(prev => [...prev, typeKey])}
                                  className="absolute top-9 right-4 lg:right-[-10px] p-1 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                                >
                                  <X className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                                </button>
                                {(historyImages[typeKey] || []).length > 0 && (
                                  <VersionGallery 
                                    history={historyImages[typeKey] || []} 
                                    currentIndex={currentImageIndices[typeKey] || 0}
                                    onSetIndex={(idx) => setCurrentImageIndices(prev => ({ ...prev, [typeKey]: idx }))}
                                    onRegen={() => generateMoreImage(typeKey)}
                                    isGenerating={isGeneratingImg[typeKey]}
                                  />
                                )}
                              </div>
                            );
                          })
                        ) : (
                          !removedSlots.includes('detail') && (
                            <div className="aspect-[4/5] lg:aspect-[3/4] max-w-[240px] lg:max-w-none mx-auto bg-white rounded-2xl lg:rounded-3xl border border-[#EEEAE5] overflow-hidden shadow-sm relative group self-start lg:mt-7 order-1 z-0">
                              {(historyImages['detail'] || []).length > 0 ? (
                                <>
                                  {historyImages['detail'][currentImageIndices['detail'] || 0]?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                    <video src={historyImages['detail'][currentImageIndices['detail'] || 0]} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  ) : (
                                    <img src={historyImages['detail'][currentImageIndices['detail'] || 0]} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                  <FloatingImageActions 
                                    url={historyImages['detail'][currentImageIndices['detail'] || 0]} 
                                    name="fashion-detail" 
                                    prompt={result?.detailPrompt}
                                    originalUrl={image}
                                    onPaste={(url) => addToHistory('detail', url)}
                                  />
                                </>
                              ) : (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                                  {isGeneratingImg.detail ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-[#DDD6CE]" />
                                  ) : (
                                    <>
                                      <button 
                                        onClick={() => handleManualImageGen('detail')}
                                        className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-lg"
                                      >
                                        Xem chi tiết
                                      </button>
                                      <FloatingImageActions 
                                        url={image || ''} 
                                        name="empty-detail" 
                                        prompt={result?.detailPrompt}
                                        originalUrl={image}
                                        onPaste={(url) => addToHistory('detail', url)}
                                      />
                                    </>
                                  )}
                                </div>
                              )}
                              {(historyImages['detail'] || []).length > 0 && (
                                <VersionGallery 
                                  history={historyImages['detail'] || []} 
                                  currentIndex={currentImageIndices['detail'] || 0}
                                  onSetIndex={(idx) => setCurrentImageIndices(prev => ({ ...prev, detail: idx }))}
                                  onRegen={() => generateMoreImage('detail')}
                                  isGenerating={isGeneratingImg['detail']}
                                />
                              )}
                              <button 
                                onClick={() => setRemovedSlots(prev => [...prev, 'detail'])}
                                className="absolute top-0 right-0 p-1 lg:p-2 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                              >
                                <X className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* 2. Advice Karaoke Below - Compact on mobile */}
                    <div className="w-full">
                      <AffiliateRecommendations links={result.affiliate_links} />
                      <KaraokeText 
                        text={result.advice} 
                        mediaUrl={fullBodyImage || image || undefined}
                        onHighlightChange={handleConsultHighlight}
                        onSpeakingChange={setIsSpeakingResult}
                        onRecordingChange={setIsAppRecording}
                        recAspectRatio={recAspectRatio}
                        setRecAspectRatio={setRecAspectRatio}
                        disabled={Object.values(isGeneratingImg).some(Boolean)}
                        disabledMessage="Vui lòng chờ AI tạo xong toàn bộ ảnh minh họa trước khi phát."
                      />
                      <SocialContactBadge links={socialLinks} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : activeTab === 'commentary' ? (
              <motion.div 
                key={analysisResult ? 'result-comment' : 'empty-comment'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 lg:p-16"
              >
                {!analysisResult && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-16 h-16 bg-white shadow-sm border border-[#EEEAE5] rounded-full flex items-center justify-center mb-4">
                      {commentaryImage ? <img src={commentaryImage} className="w-10 h-10 object-contain rounded-lg" /> : <CheckCircle2 className="w-6 h-6 text-[#A09A94]" />}
                    </div>
                    <h3 className="text-lg font-medium tracking-tight">
                      {commentaryImage ? "Đã nhận được ảnh của bạn" : "Thẩm định phong cách của bạn"}
                    </h3>
                    <p className="text-[10px] text-[#7A7570] mt-1 max-w-[220px]">
                      {error ? (
                        <span className="text-red-500 font-medium">Lỗi: {error.includes('JSON') ? 'Dữ liệu AI không hợp lệ, hãy thử lại.' : error}</span>
                      ) : (
                        commentaryImage ? "Bấm nút 'Xem bình luận' để nhận đánh giá từ chuyên gia." : "Dán ảnh (Ctrl+V) hoặc tải lên để xem bình luận"
                      )}
                    </p>
                  </div>
                ) : loading ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-10 h-10 text-[#1A1A1A] animate-spin" />
                    <p className="mt-4 text-[10px] font-medium tracking-widest uppercase text-[#7A7570]">Chuyên gia đang đánh giá...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-6 lg:gap-10 items-start">
                      <div className="flex-1 space-y-6 w-full">
                        {/* 1. Improvement Image First */}
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <h5 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#A09A94]">Thẩm định & Cải thiện</h5>
                            <div className="h-px bg-[#EEEAE5] grow" />
                          </div>
                      
                          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-8 items-start">
                            {/* Current Outfit - First on mobile */}
                            {!removedSlots.includes('commentary_original') && (
                              <div className="space-y-2 order-1 lg:order-1 w-full relative group">
                                <h6 className="text-[9px] uppercase tracking-widest font-bold text-center text-[#A09A94]">Gốc</h6>
                                <div className="aspect-[4/5] max-w-[100px] lg:max-w-none mx-auto bg-white rounded-xl lg:rounded-3xl border border-[#EEEAE5] overflow-hidden shadow-sm relative group z-0">
                                  <img src={commentaryImage || ''} className="w-full h-full object-contain" />
                                  <FloatingImageActions url={commentaryImage || ''} name="current-outfit" />
                                </div>
                                <button 
                                  onClick={() => setRemovedSlots(prev => [...prev, 'commentary_original'])}
                                  className="absolute top-0 right-0 p-1 lg:p-2 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                                >
                                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                              </div>
                            )}

                            {/* Improved Outfit - Last on mobile to be with Karaoke */}
                            {!removedSlots.includes('improvement') && (
                              <div className="space-y-2 order-2 lg:order-2 w-full relative group">
                                <h6 className="text-[9px] uppercase tracking-widest font-bold text-center text-[#A09A94]">Gợi ý cải thiện</h6>
                                <div className={cn(
                                  "aspect-[4/5] lg:aspect-[3/4] max-w-[240px] lg:max-w-none mx-auto bg-white rounded-2xl lg:rounded-3xl border border-[#EEEAE5] overflow-hidden shadow-sm relative flex flex-col items-center justify-center group z-0",
                                  (historyImages['improvement'] || []).length > 0 && "mb-2"
                                )}>
                                  <ColorPalette colors={analysisResult?.colors || []} />
                                  {(historyImages['improvement'] || []).length > 0 ? (
                                    <>
                                      {historyImages['improvement'][currentImageIndices['improvement'] || 0]?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                        <video src={historyImages['improvement'][currentImageIndices['improvement'] || 0]} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      ) : (
                                        <img src={historyImages['improvement'][currentImageIndices['improvement'] || 0]} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      )}
                                      <FloatingImageActions 
                                        url={historyImages['improvement'][currentImageIndices['improvement'] || 0]} 
                                        name="improved-outfit" 
                                        prompt={analysisResult?.improvementPrompt}
                                        originalUrl={commentaryImage}
                                        onPaste={(url) => addToHistory('improvement', url)}
                                      />
                                    </>
                                  ) : (
                                    <div className="p-6 text-center space-y-4">
                                      {isGeneratingImg.improvement ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-[#DDD6CE]" />
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => handleManualImageGen('improvement')}
                                            className="px-6 py-2 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-black transition-all shadow-lg active:scale-95"
                                          >
                                            Tạo ảnh đề xuất
                                          </button>
                                          <FloatingImageActions 
                                            url={commentaryImage || ''} 
                                            name="empty-improvement" 
                                            prompt={analysisResult?.improvementPrompt}
                                            originalUrl={commentaryImage}
                                            onPaste={(url) => addToHistory('improvement', url)}
                                          />
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <button 
                                  onClick={() => setRemovedSlots(prev => [...prev, 'improvement'])}
                                  className="absolute top-0 right-0 p-1 lg:p-2 bg-white/80 backdrop-blur-sm border border-[#EEEAE5] rounded-full shadow-sm text-[#A09A94] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20"
                                >
                                  <X className="w-3 h-3 lg:w-4 lg:h-4" />
                                </button>
                                {(historyImages['improvement'] || []).length > 0 && (
                                  <div className="space-y-3">
                                    <VersionGallery 
                                      history={historyImages['improvement'] || []} 
                                      currentIndex={currentImageIndices['improvement'] || 0}
                                      onSetIndex={(idx) => setCurrentImageIndices(prev => ({ ...prev, improvement: idx }))}
                                      onRegen={() => generateMoreImage('improvement')}
                                      isGenerating={isGeneratingImg['improvement']}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full">
                      <AffiliateRecommendations links={analysisResult?.affiliate_links} />
                      <KaraokeText 
                        text={analysisResult?.analysis || ''} 
                        mediaUrl={improvementImage || commentaryImage || undefined}
                        onHighlightChange={handleCommentaryHighlight}
                        onSpeakingChange={setIsSpeakingResult}
                        onRecordingChange={setIsAppRecording}
                        recAspectRatio={recAspectRatio}
                        setRecAspectRatio={setRecAspectRatio}
                        disabled={Object.values(isGeneratingImg).some(Boolean)}
                        disabledMessage="Vui lòng chờ AI tạo xong toàn bộ ảnh minh họa trước khi phát."
                      />
                      <SocialContactBadge links={socialLinks} />
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key={knowledgeResult ? 'result-knowledge' : 'empty-knowledge'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 lg:p-16 h-full flex flex-col"
              >
                {!knowledgeResult ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-[#A09A94] h-full">
                    <div className="w-16 h-16 rounded-full bg-[#F9F8F6] flex items-center justify-center">
                      <User className="w-6 h-6 opacity-50" />
                    </div>
                    <p className="text-sm max-w-[200px] leading-relaxed">
                      Sẵn sàng khám phá kiến thức thời trang. Hãy nhập yêu cầu của bạn!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar pb-10">
                    <div className="flex items-center justify-between pb-8 border-b border-[#EEEAE5]">
                      <h3 className="text-xl font-medium serif">{knowledgeResult.title}</h3>
                      <button onClick={() => setIsFullscreen(true)} className="p-3 bg-[#F9F8F6] rounded-full hover:bg-[#EEEAE5] transition-colors"><Maximize2 className="w-4 h-4 text-[#1A1A1A]" /></button>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-8">
                       <div className="w-full xl:w-[45%] shrink-0">
                         {knowledgeResult.media && (
                           <div className="flex flex-col gap-4">
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                               {knowledgeResult.media.map((item, idx) => {
                                 const imgKw = item.keywords.join(", ");
                                 const charFeature = gender === 'Nam' ? 'Vietnamese man named Nam, handsome, distinct facial features' : gender === 'Nữ' ? 'Vietnamese woman named Lan, beautiful, distinct facial features' : 'Vietnamese person, distinct facial features';
                                 const imagePrompt = `Vertical 9:16 aspect ratio (1080x1920) for TikTok: photorealistic portrait, ${charFeature}. Wearing detailed clothing based on: ${imgKw}. High quality, emotional lighting, cinematic composition.`;
                                 const videoPrompt = `A 8-seconds cinematic video of a ${charFeature}. Consistent character design: wearing specific detailed clothing (${imgKw}) including shirt, pants, shoes. Camera angle: dynamic tracking shot. Lighting: soft emotional sunlight, cinematic rim light. Setting/Background: realistic Vietnamese authentic background, depth of field. Motion: natural, slow motion, expressing deep emotion that touches the heart.`;
                                 return (
                                 <div key={idx} className={cn("relative rounded-xl overflow-hidden bg-[#EEEAE5] shadow-sm flex flex-col transition-all", currentKnowledgeMediaIndex === idx ? "ring-2 ring-[#1A1A1A]" : "")}>
                                   <div className="aspect-[3/4] relative w-full group overflow-hidden">
                                   {knowledgeImages[idx] ? (
                                      <div className="relative w-full h-full group">
                                        {knowledgeImages[idx]?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                                           <video src={knowledgeImages[idx]} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(knowledgeImages[idx])} />
                                        ) : (
                                           <img src={knowledgeImages[idx]} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={() => setViewingImageModal(knowledgeImages[idx])} />
                                        )}
                                        <button 
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             handleGenerateKnowledgeImage(idx, item.keywords);
                                          }}
                                          disabled={isGeneratingKnowledgeImage[idx]}
                                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-100 shadow-md backdrop-blur-sm"
                                          title="Tạo lại ảnh"
                                        >
                                          {isGeneratingKnowledgeImage[idx] ? <Loader2 className="w-3 h-3 animate-spin"/> : <RefreshCw className="w-3 h-3" />}
                                        </button>
                                      </div>
                                   ) : (
                                      <div className="p-4 flex flex-col items-center justify-center h-full gap-3 text-center">
                                        <div className="text-[9px] text-[#7A7570] font-medium leading-tight">Cảnh {idx + 1}</div>
                                        <button 
                                          onClick={() => handleGenerateKnowledgeImage(idx, item.keywords)}
                                          disabled={isGeneratingKnowledgeImage[idx]}
                                          className="px-3 py-1.5 bg-[#1A1A1A] text-white text-[10px] font-medium rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-1 w-full"
                                        >
                                          {isGeneratingKnowledgeImage[idx] ? <><Loader2 className="w-3 h-3 animate-spin"/> <span>Đang tạo...</span></> : <span>Tạo Ảnh</span>}
                                        </button>
                                      </div>
                                   )}
                                  </div>
                                  <div className="p-2 flex flex-col gap-1 w-full bg-white border-t border-[#EEEAE5] shrink-0 relative z-20">
                                    <div className="flex gap-1 w-full">
                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(imagePrompt); alert("Đã copy Prompt Ảnh!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Ảnh">📄 Prompt Ảnh (9:16 TikTok)</button>
                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(videoPrompt); alert("Đã copy Prompt Video Veo3 8s!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Video Veo3 8s">🎬 Prompt Video</button>
                                    </div>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const fallbackUpload = () => {
                                           const input = document.createElement('input');
                                           input.type = 'file';
                                           input.accept = 'image/*,video/mp4,video/webm,video/*';
                                           input.onchange = (ev: any) => {
                                              const file = ev.target.files[0];
                                              if (file) {
                                                 let url = URL.createObjectURL(file);
                                                 if (file.type.startsWith('video/') || file.name?.match(/\.(mp4|webm|mov)$/i)) {
                                                    url += '#ext=.mp4';
                                                 }
                                                 setKnowledgeImages(prev => ({ ...prev, [idx]: url }));
                                              }
                                           };
                                           input.click();
                                        };
                                        try {
                                           navigator.clipboard.readText().then(text => {
                                              if (text && (text.startsWith('http') || text.startsWith('data:'))) {
                                                 if (confirm('Dán link này?\n' + text.substring(0,50) + '...')) {
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
                                        }
                                      }} 
                                      className="text-center w-full text-[8px] font-bold uppercase py-1.5 px-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      📥 Dán Ảnh/Video Đã Tạo
                                    </button>
                                  </div>
                                </div>
                               )})} 
                             </div>
                             
                             <div className="flex justify-center">
                               <button 
                                 onClick={async () => {
                                    const toGenerate = knowledgeResult.media.map((m, idx) => ({m, idx}))
                                      .filter(({idx}) => !knowledgeImages[idx] && !isGeneratingKnowledgeImage[idx]);
                                    
                                    for (const item of toGenerate) {
                                       await handleGenerateKnowledgeImage(item.idx, item.m.keywords);
                                       await new Promise(r => setTimeout(r, 2000));
                                    }
                                 }}
                                 className="px-5 py-2.5 bg-[#1A1A1A]/5 hover:bg-[#1A1A1A]/10 text-[#1A1A1A] text-[10px] font-bold tracking-widest uppercase rounded-full transition-colors flex items-center justify-center gap-2"
                               >
                                  <span>Tạo Tất Cả Ảnh</span>
                               </button>
                             </div>
                           </div>
                         )}
                       </div>

                       <div className="w-full xl:w-[55%]">
                         <AffiliateRecommendations links={knowledgeResult.affiliate_links} />
                         <KaraokeText 
                           text={knowledgeResult.content} 
                           mediaUrl={knowledgeImages[currentKnowledgeMediaIndex]} 
                           onHighlightChange={handleKnowledgeHighlight} 
                           onRecordingChange={setIsAppRecording}
                           recAspectRatio={recAspectRatio}
                           setRecAspectRatio={setRecAspectRatio}
                         />
                         <SocialContactBadge links={socialLinks} />
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {viewingImageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setViewingImageModal(null)}
          >
            <button 
              onClick={() => setViewingImageModal(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-[310]"
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg"
              onClick={e => e.stopPropagation()}
            >
              {viewingImageModal?.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                <video src={viewingImageModal} autoPlay loop muted playsInline className="max-w-[90vw] max-h-[90vh] object-contain scale-[1.08] shadow-2xl" />
              ) : (
                <img src={viewingImageModal} className="max-w-[90vw] max-h-[90vh] object-contain scale-[1.08] shadow-2xl" />
              )}
              <FloatingImageActions 
                url={viewingImageModal} 
                name="fashion-view" 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
        .serif { font-family: 'Cormorant Garamond', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #EEEAE5; border-radius: 10px; }
        .prose h1, .prose h2, .prose h3 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 300; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}