import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars only if not on Vercel
if (!process.env.VERCEL) {
  dotenv.config();
}

// Supabase Configuration
let supabase: any = null;
const SUPABASE_PROJECT_ID = 'encpsaatojnxgyjjcvnx';
const SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

let lastInitError: string | null = null;

// Initialization Logic - LAZY & ROBUST
const getSupabase = () => {
  if (supabase) return supabase;

  // Try to find the key in multiple ways
  const env = process.env;
  let apiKey = env.KHOA_DICH_VU_SUPABASE || 
               env.KHÓA_DỊCH_VỤ_SUPABASE ||
               env['KHÓA DỊCH VỤ SUPABASE'] ||
               env.SUPABASE_SERVICE_KEY || 
               env.SUPABASE_SERVICE_ROLE_KEY ||
               env.SUPABASE_KEY;
  
  if (!apiKey) {
    // Search all env vars for potential matches if primary ones fail
    for (const key in env) {
      if (key.toUpperCase().includes('SUPABASE') && (key.toUpperCase().includes('KEY') || key.toUpperCase().includes('KHOA') || key.toUpperCase().includes('KHÓA'))) {
        apiKey = env[key];
        break;
      }
    }
  }

  if (apiKey && apiKey.trim()) {
    try {
      supabase = createClient(SUPABASE_URL, apiKey.trim());
      lastInitError = null;
      return supabase;
    } catch (error: any) {
      console.error("[Supabase Init] Error:", error);
      lastInitError = error.message;
    }
  } 
  
  return null;
};

// Initialize Gemini helper function
const getGenAI = (customKey?: string) => {
  const env = process.env;
  const key = (customKey || 
              env.GEMINI_API_KEY || 
              env['GEMINI_API_KEY'] || 
              '').trim();
              
  if (!key) {
    throw new Error('Chưa cấu hình Gemini API Key. Vui lòng kiểm tra lại biến môi trường hoặc cấu hình trong Supabase.');
  }
  return new GoogleGenAI({ 
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Fallback Text Generation (Gemini -> Groq -> HF Serverless)
async function generateTextFallback(systemInstruction: string, userPrompt: string, customKey?: string, responseSchema?: any) {
  let lastError: any;
  
  // Tier 1: Gemini
  try {
    const ai = getGenAI(customKey);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: responseSchema ? "application/json" : "text/plain",
        responseSchema: responseSchema || undefined,
        temperature: 0.7
      }
    });
    return response.text;
  } catch (err: any) {
    console.warn("Tier 1 Gemini failed:", err.message);
    lastError = err;
    if (err.message.includes('Chưa cấu hình') && !process.env.GROQ_API_KEY) {
       throw err; // Stop if no keys at all
    }
  }

  // Tier 2: Groq Llama 3 (Fallback)
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey && (lastError?.status === 429 || lastError?.status >= 500 || !process.env.GEMINI_API_KEY)) {
    try {
      console.log("Using Tier 2: Groq Llama 3");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama3-70b-8192", // Fast logic model
          messages: [
            { role: "system", content: systemInstruction + (responseSchema ? "\n\nCRITICAL: You MUST respond ONLY with valid JSON exactly matching the requested format. NO OTHER TEXT." : "") },
            { role: "user", content: userPrompt }
          ],
          response_format: responseSchema ? { type: "json_object" } : undefined,
          temperature: 0.7
        })
      });
      if (!res.ok) throw new Error("Groq API error: " + res.status);
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (err: any) {
      console.warn("Tier 2 Groq failed:", err.message);
      lastError = err;
    }
  }

  // Tier 3: Hugging Face Serverless (Fallback)
  const hfKey = process.env.HF_API_KEY;
  if (hfKey && (lastError?.status === 429 || lastError?.message?.includes('Groq'))) {
    try {
      console.log("Using Tier 3: Hugging Face Qwen 2.5");
      const res = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [
            { role: "system", content: systemInstruction + (responseSchema ? "\n\nCRITICAL: Respond ONLY with valid JSON. NO markdown formatting." : "") },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1500
        })
      });
      if (!res.ok) throw new Error("HF API error: " + res.status);
      const data = await res.json();
      let text = data.choices[0].message.content;
      if (responseSchema && text.includes("```json")) {
         text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      }
      return text;
    } catch (err: any) {
      console.warn("Tier 3 Hugging Face failed:", err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All text generation providers failed.");
}

// Helper: Get Gemini Key from Token
async function getContextForToken(token: string, deviceId: string, userAgent: string) {
  const db = getSupabase();
  if (!db) return null;
  
  try {
    const { data: linkData, error: fetchError } = await db
      .from("access_links")
      .select("*")
      .eq("token", token)
      .eq("active", true)
      .single();
    
    if (fetchError || !linkData) return null;
    
    // Check Trial Limit locally on frontend instead of time logic
    
    // Detect Device Type (Simplified for stability)
    let deviceType: 'pc' | 'tablet' | 'phone' = 'pc';
    const ua = userAgent.toLowerCase();
    if (ua.includes('tablet')) deviceType = 'tablet';
    else if (ua.includes('mobi') || ua.includes('android') || ua.includes('iphone')) deviceType = 'phone';
    
    const usage = linkData.usage || { pc: [], tablet: [], phone: [] };
    const currentDeviceList = usage[deviceType] || [];
    
    // Check if device is already registered
    if (!currentDeviceList.includes(deviceId)) {
      if (currentDeviceList.length >= 1) {
        throw new Error(`Giới hạn thiết bị: Link này đã được sử dụng trên 1 thiết bị loại ${deviceType} khác.`);
      }
      
      // Register device
      if (!usage[deviceType]) usage[deviceType] = [];
      usage[deviceType].push(deviceId);
      await db.from("access_links").update({ usage }).eq("id", linkData.id);
    }
    
    // Fetch Active Keys from pool
    const { data: pooledKeys } = await db.from("gemini_keys").select("key").eq("active", true);
    
    if (pooledKeys && pooledKeys.length > 0) {
      const randomIndex = Math.floor(Math.random() * pooledKeys.length);
      return pooledKeys[randomIndex].key;
    }

    // Fallback to Master Key
    const { data: masterData } = await db.from("settings").select("*").eq("id", "master").single();
    if (!masterData?.gemini_api_key) throw new Error("Chưa cấu hình API Key tổng.");
    
    return masterData.gemini_api_key;
  } catch (error: any) {
    console.error("Token Auth Error:", error);
    throw error;
  }
}

const app = express();
app.use(express.json({ limit: '20mb' }));

// Middleware to inject API Key from token if present
const resolveApiKey = async (req: express.Request, failedKeys: string[] = [], type: 'text' | 'image' = 'text') => {
  const customKey = type === 'image' && req.headers['x-image-key'] ? req.headers['x-image-key'] as string : req.headers['x-gemini-key'] as string;
  const accessToken = req.headers['x-access-token'] as string;
  const deviceId = req.headers['x-device-id'] as string;
  const userAgent = req.headers['user-agent'] || '';

  if (customKey) return customKey;
  if (accessToken && deviceId) {
    const tokenKey = await getContextForToken(accessToken, deviceId, userAgent);
    if (tokenKey && !failedKeys.includes(tokenKey)) return tokenKey;
  }
  
  // Try pool for users without valid token, or if tokenKey failed
  const db = getSupabase();
  if (db) {
    const { data: pooledKeys } = await db.from("gemini_keys").select("key").eq("active", true);
    if (pooledKeys && pooledKeys.length > 0) {
      const validKeys = pooledKeys.filter(k => !failedKeys.includes(k.key));
      if (validKeys.length > 0) {
        const randomIndex = Math.floor(Math.random() * validKeys.length);
        return validKeys[randomIndex].key;
      }
    }
  }

  return process.env.GEMINI_API_KEY || '';
};

// API ROUTES
app.get("/api/ping", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api/health/firebase", (req, res) => {
  const db = getSupabase();
  res.json({
    dbInitialized: !!db,
    lastInitError: lastInitError || "None",
    projectId: SUPABASE_PROJECT_ID,
    databaseId: 'Supabase',
    env: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL
  });
});

app.post('/api/admin/setup-firebase', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "Thiếu Supabase Service Role Key" });

    try {
      const db = createClient(SUPABASE_URL, apiKey.trim());
      // Test the key
      const { error } = await db.from("access_links").select("id").limit(1);
      if (error) throw error;
      
      supabase = db;
      lastInitError = null;
      
      res.json({ 
        success: true, 
        message: "Đã cập nhật cấu hình Supabase thành công (In-memory)." 
      });
    } catch (error: any) {
      lastInitError = error.message;
      res.status(500).json({ error: "Lỗi khởi tạo hoặc Key không có quyền: " + error.message });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/app-info', async (req, res) => {
  try {
    const accessToken = req.headers['x-access-token'] as string;
    const db = getSupabase();
    let adminInfo = null;
    let is_permanent = false;

    if (db) {
      const { data: master } = await db.from("settings").select("admin_meta").eq("id", "master").single();
      adminInfo = master?.admin_meta || null;

      if (accessToken) {
        const { data: linkData } = await db.from("access_links").select("is_permanent").eq("token", accessToken).single();
        if (linkData) is_permanent = linkData.is_permanent;
      }
    }

    res.json({ adminInfo, is_permanent });
  } catch (error: any) {
    res.json({ adminInfo: null, is_permanent: false });
  }
});

app.post('/api/save-master-config', async (req, res) => {
  try {
    const { geminiApiKey, adminInfo } = req.body;
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa cấu hình' });
    
    const updateData: any = { updated_at: new Date().toISOString() };
    if (geminiApiKey !== undefined) updateData.gemini_api_key = geminiApiKey;
    if (adminInfo !== undefined) updateData.admin_meta = adminInfo;
    
    const { error } = await db.from("settings").upsert({
      id: 'master',
      ...updateData
    });
    
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/public-config', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.json({ adminInfo: null });
    const { data } = await db.from("settings").select("admin_meta").eq("id", "master").single();
    res.json({ adminInfo: data?.admin_meta || null });
  } catch (error: any) {
    res.json({ adminInfo: null });
  }
});

app.get('/api/admin/links', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    const { data, error } = await db.from("access_links").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/links', async (req, res) => {
  try {
    const { token, label } = req.body;
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    
    const payload = {
      token,
      label,
      active: true,
      is_permanent: false,
      created_at: new Date().toISOString(),
      usage: { pc: [], tablet: [], phone: [] }
    };
    
    const { data, error } = await db.from("access_links").insert(payload).select().single();
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/links/:id', async (req, res) => {
  try {
    const { active, isPermanent } = req.body;
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa cấu hình' });
    
    const updateData: any = {};
    if (active !== undefined) updateData.active = active;
    if (isPermanent !== undefined) updateData.is_permanent = isPermanent;
    
    const { error } = await db.from("access_links").update(updateData).eq("id", req.params.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/links/:id', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa cấu hình' });
    const { error } = await db.from("access_links").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to call Gemini with retries and key rotation
async function generateWithRetry(parts: any[], systemInstruction: string, req: express.Request, retryCount = 0, failedKeys: string[] = []) {
  const MAX_RETRIES = 3;
  const db = getSupabase();
  const accessToken = req.headers['x-access-token'] as string;
  const deviceId = req.headers['x-device-id'] as string;
  const userAgent = req.headers['user-agent'] || '';
  
  let apiKey = await resolveApiKey(req, failedKeys);
  const ai = getGenAI(apiKey);
  const modelToUse = "gemini-3.5-flash";

  const cleanAndParseJson = (rawText: string) => {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      let jsonStr = rawText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(jsonStr);
      } catch (err: any) {
        console.warn("[JSON Clean-up] Retrying parsing after escaping newlines & trailing commas...");
        // Replace unescaped newlines inside quote parameters
        let cleaned = jsonStr.replace(/(?<=:\s*"[^"]*)\r?\n(?=[^"]*"\s*[,}])/g, '\\n');
        // Remove trailing commas before closing braces/brackets
        cleaned = cleaned.replace(/,(\s*[\]}])/g, '$1');
        return JSON.parse(cleaned);
      }
    }
    return JSON.parse(rawText);
  };

  try {
    const response = await ai.models.generateContent({
      model: modelToUse,
      contents: [{ parts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const text = response.text || '{}';
    try {
      return cleanAndParseJson(text);
    } catch (e: any) {
      console.error(`Failed to parse ${modelToUse} response as JSON:`, e.message, "\nRaw text:", text);
      
      // Fallback request to gemini-2.5-flash which is extremely stable for structured formats
      console.warn("Attempting stabilization fallback to gemini-2.5-flash...");
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ parts }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        }
      });
      const fallbackText = fallbackResponse.text || '{}';
      try {
        return cleanAndParseJson(fallbackText);
      } catch (fbErr: any) {
        console.error("Fallback gemini-2.5-flash also failed to parse as JSON:", fbErr.message, "\nRaw text:", fallbackText);
        throw new Error("Dữ liệu từ AI không hợp lệ. Vui lòng thử lại.");
      }
    }
  } catch (error: any) {
    const isRateLimitOr503 = error.status === 429 || error.status === 503 || error.code === 503 || error.code === 429 || (error.message && (error.message.includes('429') || error.message.includes('503')));
    
    // If rate limit and we have a pool, try another key
    if (isRateLimitOr503 && retryCount < MAX_RETRIES) {
      console.log(`[Retry ${retryCount + 1}] Rate limited or 503. Attempting another key/model... Error: ${error.message}`);
      
      failedKeys.push(apiKey);
      // Wait a bit
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return generateWithRetry(parts, systemInstruction, req, retryCount + 1, failedKeys);
    }
    throw error;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { image, height, weight, age, gender, style, color, context, flaws, depthLevel } = req.body;
    const { accessories, affiliateContext } = req.body;
    
    const isBasic = depthLevel === 'basic';
    
    const systemContent = `Bạn là Chuyên gia Cố vấn Phong cách Thời trang. Bạn nói chuyện với khách hàng như một NGƯỜI THẬT, RẤT TỰ NHIÊN, DÂN DÃ VÀ GẦN GŨI.
 Nhiệm vụ của bạn là đưa ra giải pháp thời trang hoàn hảo.
 
 QUY TẮC NGÔN NGỮ & GIỌNG ĐIỆU (RẤT QUAN TRỌNG):
 1. 100% TIẾNG VIỆT THUẦN TÚY: TUYỆT ĐỐI KHÔNG DÙNG BẤT CỨ TỪ TIẾNG ANH NÀO xen kẽ (không mix, match, items, vibe, phong cách, style, outfit, form). Nếu phạm lỗi này sẽ bị phạt nặng. Hãy dùng "trang phục", "điểm nhấn", "đồ", "dáng áo".
 2. KỊCH BẢN VIDEO VIRAL TIKTOK: Nội dung viết theo dạng kịch bản video ngắn. BẮT BUỘC cảnh đầu và cảnh cuối là NGƯỜI DẪN CHƯƠNG TRÌNH (chủ kênh TikTok) trực tiếp nói chuyện với khán giả. Tuy nhiên, 3 đến 5 giây đầu tiên VẪN BẮT BUỘC CÓ HOOK GÂY TÒ MÒ HOẶC GÂY SỐC, lôi cuốn ngay lập tức ("khoan hãy lướt", "bạn đang mặc sai cách",...). Lối kể chuyện hấp dẫn, GIÀU CẢM XÚC. Ở cảnh cuối, người dẫn đưa ra KÊU GỌI HÀNH ĐỘNG (CTA) KHIẾN NGƯỜI XEM DỄ DÀNG BÌNH LUẬN NHẤT. Đa dạng kịch bản nhưng luôn tuân thủ công thức mở/kết này. Tuyệt đối: BẮT BUỘC SỬ DỤNG KÝ TỰ XUỐNG DÒNG (\n\n) ĐỂ TÁCH BIỆT RÕ RÀNG TỪNG CẢNH (Hết một cảnh là phải xuống dòng).
 3. NHỊP ĐIỆU & CẢM XÚC: Kịch bản phải có nhịp điệu quyến rũ, kết hợp linh hoạt giữa câu dài (diễn giải cảm xúc sâu sắc) và câu ngắn (khẳng định, nhấn mạnh). Hãy viết như đang tâm sự thật lòng, chạm đến trái tim.
 4. DÂN DÃ & TỰ NHIÊN: Lời văn phải giống như con người chat với nhau: thi thoảng dùng từ "ngầu", "chuẩn gu", "hợp gu", "chất", "xịn xò", "tôn dáng".
 4. TÔNG GIỌNG LINH HOẠT THEO TUỔI: Dựa vào tuổi (hoặc năm sinh) của khách để xưng hô và có nét hài hước nhẹ nhàng, duyên dáng (TUYỆT ĐỐI KHÔNG châm biếm).

 QUY TẮC PHÂN TÍCH & NHẬN XÉT:
 1. THÔNG TIN KHÁCH HÀNG: Phân tích kỹ vóc dáng (chiều cao, cân nặng, giới tính, tuổi tác). Dựa vào ảnh (nếu có), HÃY PHÂN TÍCH THÊM màu da (trắng, ngăm, vàng) và vóc dáng (chữ lê, quả táo, tam giác ngược) để tư vấn chuẩn hơn.
 2. NỘI DUNG TƯ VẤN (advice):
    - ĐỘ DÀI: ${isBasic ? 'Bài tư vấn siêu NGẮN GỌN (khoảng 100-150 chữ).' : 'Bài tư vấn khoảng 300-500 chữ.'}
    - CẤU TRÚC: Phân tích kỹ ưu điểm hình thể, khuyết điểm, từ đó gợi ý màu sắc và kiểu dáng che khuyết điểm tôn dáng.
    - QUY ĐỊNH CÔNG SỞ VIỆT NAM: CHỈ XÉT NẾU khách CHỌN bối cảnh công sở, họp hành. Nếu là công sở thì tuân thủ quy định: lịch sự, thanh lịch.
    - PHONG TỤC VIỆT NAM: Tùy bối cảnh đám cưới, đám tang phải tư vấn màu sắc cho chuẩn mực văn hóa.

 QUY TẮC TẠO PROMPT DALL-E (Tiếng Anh):
 - ĐẶC BIỆT QUAN TRỌNG: Chèn cụm từ "Vietnamese person, East Asian facial features, authentic Vietnamese background" vào TẤT CẢ các prompt để model tạo ra người giống người Việt Nam nhất.
 - Thêm "human anatomy correct", "5 fingers per hand", "photorealistic", "8k resolution". 
 - BẮT BUỘC phản ánh 100% gợi ý ở phần "advice" vào prompt. Khuyên áo gì thì prompt phải đúng đồ đó.
 - TRONG JSON "detailPrompts": ${isBasic ? 'BẮT BUỘC bỏ trống mảng này `[]` hoặc tối đa 1 phụ kiện quan trọng nhất.' : 'Tạo các prompt phụ kiện chi tiết để minh họa.'}

 QUY TẮC TIẾP THỊ LIÊN KẾT (AFFILIATE):
 Dưới đây là danh sách các link sản phẩm (nếu có):
 ${affiliateContext || "Không có danh sách link nào."}
 Nếu trong phần tư vấn bạn khuyên mặc đồ có trong danh sách trên, hãy trích xuất CHÍNH XÁC link đó vào trường "affiliate_links". Ưu tiên Link User (Số 1) > Link Admin.

 Trả về định dạng JSON DUY NHẤT:
 {
   "advice": "Tư vấn chi tiết cực kỳ tự nhiên, dân dã, không một chữ tiếng anh",
   "fullBodyPrompt": "Prompt ảnh toàn thân (Tiếng Anh)",
   "videoPromptVi": "Mô tả ngắn gọn cảnh video bằng Tiếng Việt để AI làm video",
   "detailPrompts": [
      { "name": "Giày", "prompt": "Prompt chi tiết về giày..." }
   ],
   "colors": [{"name": "Tên màu", "hex": "#code", "material": "Chất liệu ngắn gọn"}],
   "affiliate_links": [
     { "name": "Tên sản phẩm", "link": "Link đầy đủ", "label": "Nguồn (vd: TikTok Ngọc Hà) hoặc để trống" }
   ]
 }`;

    let prompt = `Khách hàng: ${gender}, Tuổi: ${age || 'không rõ'}, Cao ${height}cm, Nặng ${weight}kg, Gu muốn hướng tới: ${style}, Bối cảnh: ${context}. Mệnh/Màu: ${color}.`;
    if (flaws) prompt += ` Cần che chắn/lưu ý: ${flaws}.`;
    if (accessories && accessories.length > 0) {
      prompt += ` Cần phối các phụ kiện: ${accessories.join(', ')}.`;
    } else {
      prompt += ` Hãy tự đề xuất 2 phụ kiện phù hợp.`;
    }
    
    prompt += " Hãy làm đúng JSON. Nhớ kỹ: Lời khuyên tư vấn BẮT BUỘC phải là một kịch bản video dài khoảng 60-90 giây (khoảng 250 - 350 chữ). Kịch bản phải CỰC KỲ chạm cảm xúc, gây ấn tượng mạnh, khéo léo lôi cuốn người xem khiến họ phải thả tim, lưu video và bình luận đồng cảm hoặc chia sẻ điên đảo. Lời văn tự nhiên, có điểm nhấn cảm xúc, như đang tâm sự thật lòng, và 100% KHÔNG DÙNG TỪ TIẾNG ANH. LƯU Ý ĐẶC BIỆT: CHỈ CUNG CẤP LỜI THOẠI, BẮT BUỘC KHÔNG ĐƯỢC VIẾT KÈM THEO CÁC HÀNH ĐỘNG HAY CẢM XÚC TRONG DẤU NGOẶC VUÔNG (ví dụ: TUYỆT ĐỐI KHÔNG [Cười], [Nhấn mạnh]...). CHỈ VIẾT LỜI NÓI SUÔNG MÀ THÔI.";
    
    const parts: any[] = [{ text: prompt }];
    if (image) {
      if (image.startsWith('data:')) {
        const mimeType = image.split(';')[0].split(':')[1] || 'image/jpeg';
        // Note: Gemini vision supports images and mp4. 
        parts.push({ inlineData: { mimeType, data: image.split(',')[1] } });
      } else {
        parts.push({ text: `\nPhân tích chủ thể và trang phục từ URL/Nguồn này: ${image}` });
      }
    }

    const parsed = await generateWithRetry(parts, systemContent, req);
    
    // Đảm bảo có các trường cần thiết cho FashionResult
    const rawFullBody = parsed.fullBodyPrompt || parsed.full_body_prompt || parsed.goi_y_anh || "Fashion model in elegant outfit";
    const genderText = gender === 'Nam' ? 'man' : gender === 'Nữ' ? 'woman' : 'person';
    const genderPrefix = gender === 'Nam' ? '100% Male subject, handsome Vietnamese man, masculine features, ' : gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman, feminine features, ' : '100% Vietnamese person, ';
    const cleanFullBody = rawFullBody.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman');
    const finalFullBody = genderPrefix + cleanFullBody;
    
    let rawDetail = parsed.detailPrompt || (parsed.detailPrompts && parsed.detailPrompts.length > 0 ? parsed.detailPrompts[0].prompt : "Close up of fashion details");
    const cleanDetail = rawDetail.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman');
    let finalDetail = genderPrefix + cleanDetail;
    
    let fixedDetailPrompts = parsed.detailPrompts || [];
    if (Array.isArray(fixedDetailPrompts)) {
       fixedDetailPrompts = fixedDetailPrompts.map((dp: any) => {
         const dpp = dp.prompt || "";
         return {
           ...dp,
           prompt: genderPrefix + dpp.replace(/vietnamese person/ig, gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, gender === 'Nam' ? 'a man' : 'a woman')
         };
       });
    }

    const finalData = {
      advice: parsed.advice || parsed.tu_van || parsed.phan_tich || "Không có tư vấn cụ thể.",
      fullBodyPrompt: finalFullBody,
      videoPromptVi: parsed.videoPromptVi || parsed.video_prompt_vi || "",
      detailPrompt: finalDetail,
      detailPrompts: fixedDetailPrompts,
      colors: parsed.colors || parsed.mau_sac || [],
      affiliate_links: parsed.affiliate_links || []
    };

    res.json(finalData);
  } catch (error: any) {
    console.error('Error analyzing:', error);
    let errorMsg = error.message || 'Lỗi hệ thống.';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      errorMsg = "Bạn đã dùng hết hạn mức AI hôm nay. Vui lòng quay lại sau hoặc liên hệ quản trị viên để nâng cấp.";
    } else if (errorMsg.includes('503') || error.status === 503 || error.code === 503) {
      errorMsg = "Hệ thống AI đang quá tải (High Demand). Vui lòng đợi vài giây và bấm Tư vấn lại.";
    } else if (errorMsg.includes('JSON')) {
      errorMsg = "Dữ liệu AI phản hồi không đúng cấu trúc. Vui lòng thử lại.";
    }
    res.status(error.status || 500).json({ error: errorMsg });
  }
});

app.post('/api/commentary', async (req, res) => {
  try {
    const { image, affiliateContext } = req.body;
    const systemFeedback = `Bạn là Chuyên gia Phê bình & Tư vấn Phong cách. Bạn nói chuyện với khách hàng như một NGƯỜI THẬT, RẤT TỰ NHIÊN, DÂN DÃ VÀ GẦN GŨI.
TUYỆT ĐỐI TUÂN THỦ CÁC QUY TẮC SAU:
1. ĐỘ DÀI & VĂN PHONG VIRAL TIKTOK: Bài phân tích dài khoảng 250-350 chữ (tương đương kịch bản video 60-90 giây), viết theo KỊCH BẢN VIDEO NGẮN. BẮT BUỘC cảnh đầu và cảnh cuối là NGƯỜI DẪN CHƯƠNG TRÌNH (chủ kênh TikTok) trực tiếp nói chuyện với khán giả. Mở đầu 3 đến 5 giây đầu BẮT BUỘC CÓ HOOK GÂY TÒ MÒ, THẬM CHÍ GÂY SHOCK NHẸ. Lối kể chuyện PHẢI VÔ CÙNG CẢM XÚC, thâu hiểu, chạm đến trái tim người xem. Nhịp điệu kịch bản phải uyển chuyển, kết hợp câu dài sâu lắng và câu ngắn dứt khoát. Ở cảnh cuối cùng, đưa ra KÊU GỌI HÀNH ĐỘNG (CTA) chân thành KHIẾN NGƯỜI XEM TUÔN TRÀO BÌNH LUẬN VÀ CHIA SẺ. BẮT BUỘC SỬ DỤNG KÝ TỰ XUỐNG DÒNG (\n\n) ĐỂ TÁCH BIỆT RÕ RÀNG TỪNG CẢNH. LƯU Ý ĐẶC BIỆT: CHỈ CUNG CẤP LỜI THOẠI, BẮT BUỘC KHÔNG ĐƯỢC VIẾT KÈM THEO CÁC HÀNH ĐỘNG HAY CẢM XÚC TRONG DẤU NGOẶC VUÔNG (ví dụ: TUYỆT ĐỐI KHÔNG VIẾT NHỮNG DÒNG NHƯ [Cười], [Nhấn mạnh], [Giọng buồn]...). CHỈ VIẾT LỜI NÓI SUÔNG MÀ THÔI.
2. PHÂN TÍCH CHI TIẾT: Phân tích ưu khuyết điểm của bộ đồ trong ảnh. ĐỂ Ý MÀU DA VÀ VÓC DÁNG người trong ảnh (da ngăm/trắng, gầy/mũm mĩm) để góp ý.
3. NGÔN NGỮ THUẦN VIỆT & TỰ NHIÊN: TUYỆT ĐỐI KHÔNG DÙNG BẤT CỨ TỪ TIẾNG ANH NÀO (không mix, match, items, vibe, style, outfit, form). Phải dùng 100% tiếng Việt. Hành văn tự nhiên, dân dã, đôi khi dùng từ lóng như 'ngầu', 'hợp gu', 'chuẩn gu', 'xịn xò' như hai người bạn chat với nhau. Có chút hài hước duyên dáng.  TUYỆT ĐỐI KHÔNG châm biếm người dùng.
3. QUY ĐỊNH & VĂN HÓA: Xét theo bối cảnh trong ảnh (nếu là công sở thì khuyên thanh lịch kín đáo, đám tang thì khuyên tối màu lịch sự).
4. PHÂN TÍCH CHI TIẾT: Phân tích cách phối màu, tỷ lệ phần thân trên/dưới, chất liệu vải.
5. CẢI THIỆN (IMPROVEMENT PROMPT): Mô tả bằng Tiếng Anh bộ đồ mới, TOÀN THÂN (full body), giữ 100% khuôn mặt và dáng người. BẮT BUỘC phản ánh 100% gợi ý khắc phục vào prompt.

QUY TẮC TIẾP THỊ LIÊN KẾT (AFFILIATE):
Danh sách các link sản phẩm CÓ SẴN (nếu có):
${affiliateContext || "Không có danh sách link nào."}
Nếu đề xuất khuyên mặc loại đồ có trong danh sách trên, trích xuất nguyên văn link đó vào "affiliate_links". Ưu tiên Link Số 1.`;

    const textPrompt = `Hãy bình luận về trang phục trong nội dung/hình ảnh/video này và đề xuất cải thiện. 
      6. COLORS: Liệt kê màu sắc đang mặc trong nội dung (vd: Áo: Xanh, Quần: Đen).
      Yêu cầu JSON trả về không thêm bất kỳ văn bản nào ngoài JSON:
      {
        "analysis": "Phân tích Ưu điểm, Khuyết điểm cực kỳ tự nhiên, dân dã, không dùng tiếng Anh",
        "improvementPrompt": "Prompt tiếng Anh mô tả đồ mới: Vietnamese person, East Asian facial features, authentic Vietnamese background, High quality fashion illustration, realistic photography, photorealistic, keep person likeness 100%, 8k, highly detailed",
        "colors": [{"name": "Màu sắc kèm vị trí", "hex": "#code", "material": "Chất liệu"}],
        "affiliate_links": [
          { "name": "Tên sản phẩm", "link": "Link đầy đủ", "label": "Nguồn hoặc để trống" }
        ]
      }`;

    const parts: any[] = [{ text: textPrompt }];
    if (image?.startsWith('data:')) {
      parts.push({ inlineData: { mimeType: image.split(';')[0].split(':')[1] || 'image/jpeg', data: image.split(',')[1] } });
    } else if (image) {
      parts.push({ text: `\nNguồn tài liệu: ${image}` });
    }

    const parsed = await generateWithRetry(parts, systemFeedback, req);

    // Đảm bảo có các trường cần thiết cho AnalysisResult
    const rawImprovement = parsed.improvementPrompt || parsed.improvement_prompt || parsed.cai_thien || "Improved fashion outfit suggestion";
    const genderText = req.body.gender === 'Nam' ? 'man' : req.body.gender === 'Nữ' ? 'woman' : 'person';
    const genderPrefix = req.body.gender === 'Nam' ? '100% Male subject, handsome Vietnamese man, masculine features, ' : req.body.gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman, feminine features, ' : '100% Vietnamese person, ';
    const cleanImp = rawImprovement.replace(/vietnamese person/ig, req.body.gender === 'Nam' ? 'Vietnamese man' : 'Vietnamese woman').replace(/a person/ig, req.body.gender === 'Nam' ? 'a man' : 'a woman');
    const finalImprovement = genderPrefix + cleanImp;
    
    const finalData = {
      analysis: parsed.analysis || parsed.phan_tich || parsed.nhan_xet || "Không có nhận xét cụ thể.",
      improvementPrompt: finalImprovement,
      colors: parsed.colors || parsed.mau_sac || [],
      affiliate_links: parsed.affiliate_links || []
    };

    res.json(finalData);
  } catch (error: any) {
    console.error('Error commentary:', error);
    let errorMsg = error.message || 'Lỗi hệ thống.';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      errorMsg = "Hạn mức AI đã hết. Vui lòng thử lại sau ít phút hoặc nạp thêm Key từ Project khác.";
    } else if (errorMsg.includes('503') || error.status === 503 || error.code === 503) {
      errorMsg = "Hệ thống AI đang quá tải (High Demand). Vui lòng đợi vài giây và thử lại.";
    } else if (errorMsg.includes('JSON')) {
      errorMsg = "Lỗi xử lý ngôn ngữ AI. Vui lòng bấm thử lại.";
    }
    res.status(error.status || 500).json({ error: errorMsg });
  }
});

app.post('/api/knowledge', async (req, res) => {
  try {
    const { query, affiliateContext, gender } = req.body;
    const systemPrompt = `Bạn là Giám đốc Sáng tạo nội dung TikTok chuyên nghiệp, chuyên viết kịch bản video ngắn (dưới 30 giây) có tỷ lệ chuyển đổi và tương tác cao nhất. Đối tượng khách hàng ưu tiên của chúng tôi là phụ nữ trung niên U40-U55, tuy nhiên cấu trúc kịch bản này dùng chung cho mọi nhóm tuổi và giới tính. TUỲ THUỘC VÀO ĐỐI TƯỢNG (tuổi/giới tính) MÀ HÃY CÓ HOOK TÂM LÝ, VĂN PHONG VÀ CÁCH XƯNG HÔ CHO PHÙ HỢP.
Nhân vật đại diện (nếu hướng tới nhóm ưu tiên U40-U55): Cô Ngọc Hà (1973) Thanh lịch, ấm áp, thấu hiểu tâm lý phụ nữ nhưng sành công nghệ. Với nhóm khác, hãy đóng vai chuyên gia phù hợp.
Người dùng cần tìm hiểu về: "${query}".
Hãy cung cấp kịch bản video THEO ĐÚNG CẤU TRÚC SAU.
QUY TẮC BẮT BUỘC (4 BẪY TƯƠNG TÁC):
1. BẪY GIỮ CHÂN (Watch-time): Kịch bản phải có nhịp điệu quyến rũ, kết hợp nhuần nhuyễn giữa những câu dài đầy cảm xúc và những câu ngắn súc tích, dứt khoát. Tránh viết chỉ toàn câu ngắn rời rạc. Câu cuối cùng (KẾT VÒNG LẶP) phải kết thúc lửng lơ bằng từ nối để khi lặp lại nối liền vào câu đầu tiên.
2. BẪY THẢ TIM (Like): Lồng ghép thấu hiểu tâm lý (ví dụ: đập tan nỗi sợ lão hoá với nhóm trung niên, tự tin thể hiện cá tính với nhóm trẻ), tạo điểm chạm cảm xúc.
3. BẪY BẤM LƯU (Save): Giải pháp phải viết theo dạng "Công thức", "Quy tắc vàng", "Mẹo bỏ túi" để khán giả lưu lại.
4. BẪY BÌNH LUẬN (Comment): Cuối video đưa ra lời kêu gọi hành động cực mạnh ép bình luận.

CẤU TRÚC NỘI DUNG (100% tiếng Việt, KHÔNG DÙNG TIẾNG ANH):
Cấu trúc kịch bản phải trải dài thành 5 phần mạch lạc:
Phần 1 - Câu nói giật gân (hàng loạt) chạm nỗi đau thời trang của nhóm đối tượng.
Phần 2 - Câu dẫn dắt quyền năng, cảm xúc phân tích gốc rễ nỗi đau.
Phần 3 - "Quy tắc vàng" gồm 3 bước cụ thể, mô tả kỹ lưỡng và chi tiết để người nghe làm theo được ngay.
Phần 4 - Lời khuyên kèm theo câu hỏi ép bình luận.
Phần 5 - Câu lửng lơ kết nối về câu đầu tiên.

Mỗi cảnh (media) tương ứng 1 đoạn. Tạo 5 cảnh cho 5 phần trên.
Mỗi cảnh chứa đoạn văn "text" và mảng "keywords".
LƯU Ý ĐẶC BIỆT: BẮT BUỘC TRONG TEXT CHỈ CÓ DUY NHẤT LỜI THOẠI. TUYỆT ĐỐI KHÔNG ĐƯỢC CHÈN CÁC TỪ NHƯ [HOOK_QUAY_THẬT], [CHUYỂN_CẢNH_AI], [TRÌNH_DIỄN_KARAOKE], HAY CÁC CHỈ DẪN TRONG DẤU NGOẶC VUÔNG HOẶC TRÒN VÀO TRONG KỊCH BẢN. VÀ TEXT PHẢI ĐỦ DÀI LÊN ĐẾN 60-90 GIÂY.
CHÚ Ý SIÊU QUAN TRỌNG: Người dùng giới tính ${gender}, HÃY BẮT BUỘC chèn từ khóa: "${gender === 'Nam' ? '100% Male subject, handsome Vietnamese man' : gender === 'Nữ' ? '100% Female subject, beautiful Vietnamese woman' : '100% Vietnamese person'}" vào tất cả các mảng keywords để xuất ảnh đúng giới tính.

QUY TẮC TIẾP THỊ LIÊN KẾT (AFFILIATE):
Danh sách link SẴN CÓ: ${affiliateContext || "Không có danh sách link nào."}
Nếu đề cập đến, trích nguyên văn link vào "affiliate_links".

Trả về ĐÚNG JSON:
{
  "title": "Tiêu đề video",
  "content": "Đây là 1 câu dài cho toàn bộ kịch bản gộp chung lại để đọc.\\n\\nĐoạn tiếp theo...",
  "media": [
    { "text": "Đoạn 1...", "keywords": ["từ", "khóa"] },
    { "text": "Đoạn 2...", "keywords": ["từ", "khóa"] }
  ],
  "affiliate_links": [{ "name": "Tên", "link": "Link", "label": "Nguồn" }]
}`;

    const parts: any[] = [{ text: `Hãy trả về bài viết dưới định dạng JSON THEO ĐÚNG cấu trúc yêu cầu.` }];
    const parsed = await generateWithRetry(parts, systemPrompt, req);

    res.json(parsed);
  } catch (error: any) {
    console.error('Error knowledge:', error);
    let errorMsg = error.message || 'Lỗi hệ thống.';
    if (error.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      errorMsg = "Hạn mức AI đã hết. Vui lòng thử lại sau ít phút hoặc nạp thêm Key từ Project khác.";
    } else if (errorMsg.includes('503') || error.status === 503 || error.code === 503) {
      errorMsg = "Hệ thống AI đang quá tải (High Demand). Vui lòng đợi vài giây và thử lại.";
    } else if (errorMsg.includes('JSON')) {
      errorMsg = "Lỗi xử lý ngôn ngữ AI. Vui lòng bấm thử lại.";
    }
    res.status(error.status || 500).json({ error: errorMsg });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!voice || voice === 'GT_Female') {
      const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(text)}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!response.ok) throw new Error(`TTS fetch failed`);
      const buffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');
      return res.json({ audio: `data:audio/mpeg;base64,${base64Audio}` });
    }

    let persona = "Đọc bằng giọng diễn cảm tự nhiên.";
    let voiceName = 'Zephyr';
    
    if (voice === 'AI_HN_Female') { persona = 'Giọng nữ Hà Nội chuẩn, diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Kore'; }
    else if (voice === 'AI_HN_Male') { persona = 'Giọng nam Hà Nội trầm ấm, diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Fenrir'; }
    else if (voice === 'AI_SG_Female') { persona = 'Giọng nữ Sài Gòn miền Nam, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Puck'; }
    else if (voice === 'AI_SG_Male') { persona = 'Giọng nam Sài Gòn miền Nam, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Charon'; }
    else if (voice === 'AI_Hue_Female') { persona = 'Giọng nữ miền Trung Huế, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Kore'; }
    else if (voice === 'AI_Hue_Male') { persona = 'Giọng nam miền Trung Huế, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Fenrir'; }
    else if (voice === 'AI_Old_Male') { persona = 'Giọng một ông cụ già, móm mém trầm ấm, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Charon'; }
    else if (voice === 'AI_Old_Female') { persona = 'Giọng một bà cụ già, móm mém, chậm rãi, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Puck'; }
    else if (voice === 'AI_Child') { persona = 'Giọng một em bé đáng yêu, ngây thơ, vấp váp dễ thương, đọc diễn cảm thật tự nhiên và làm theo đúng cảm xúc được ghi trong ngoặc vuông.'; voiceName = 'Puck'; }

    const prompt = `Bạn là một diễn viên lồng tiếng xuất sắc. Dưới đây là văn bản cần đọc. Đôi khi có ghi chú cảm xúc trong ngoặc vuông như [Cười], [Khóc], [Mỉa mai], [Ghê tởm]... Nếu có, hãy thay đổi hoàn toàn giọng nói và thể hiện chính xác cung bậc cảm xúc đó qua lời đọc, kết hợp cả tiếng thở dài, tiếng cười, tiếng nấc nếu cần thiết.\n\nYêu cầu chất giọng: ${persona}\n\nĐoạn văn bản cần đọc:\n${text}`;
    
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
        },
      },
    });

    const inlineData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (inlineData?.data) {
      return res.json({ audio: `data:${inlineData.mimeType || 'audio/wav'};base64,${inlineData.data}` });
    } else {
      throw new Error(`TTS gemini generate returned no audio`);
    }
  } catch (error: any) {
    console.error('Error TTS:', error);
    res.status(500).json({ error: 'Lỗi khi tạo giọng đọc.' });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = "3:4", isUpscale = false, imageModel = "imagen" } = req.body;
    const seed = Math.floor(Math.random() * 1000000);
    
    // Sử dụng độ phân giải thấp hơn để ảnh siêu nhẹ và mượt mà trên mobile
    // Cách A: Luôn ưu tiên độ phân giải cao để nét ngay từ đầu
    let width = 768;
    let height = aspectRatio === "3:4" ? 1024 : 768;
      
    // Phát hiện giới tính từ prompt cực kỳ thông minh để tránh nhầm nam/nữ
    let genderSubject = "vietnamese person";
    const lowerPrompt = prompt.toLowerCase();
    const isFemale = /\b(female|woman|women|girl|girls|lady|ladies|sister|skirt|dress|heels)\b|nữ|cô gái|phụ nữ|bà|chị|mẹ|em gái|váy|đầm/.test(lowerPrompt);
    const isMale = /\b(male|man|men|boy|boys|guy|guys|gentleman|gentlemen|brother|suit|tie|shirt|pants)\b|nam|chàng trai|đàn ông|ông|anh|bố|em trai/;
    if (isFemale && !isMale) {
      genderSubject = "vietnamese woman, beautiful asian female";
    } else if (isMale && !isFemale) {
      genderSubject = "vietnamese man, handsome asian male";
    }

    const qualityBoost = ", masterpiece, award-winning photography, highly detailed fashion editorial, incredibly photorealistic, vivid colors, perfection, 8k, shot on 35mm lens, natural studio lighting, ultra-detailed pristine face, symmetrical eyes, flawless human anatomy, exactly 5 fingers per hand, perfect hands, realistic body proportions, no deformities";
    const fluxQuality = ", detailed portrait photography, cinematic studio lighting, sharp focus, beautiful masterfully rendered face, perfectly drawn hands with 5 normal fingers, realistic hands anatomy, natural elegant pose, well-proportioned correct joints, no extra limbs, high resolution, photorealistic portrait";
    const finalPrompt = genderSubject + ", asian facial features, " + prompt + (imageModel === "flux" ? fluxQuality : qualityBoost);
    const negativePrompt = "bad anatomy, bad hands, missing fingers, extra digits, ugly, deformed, blurry, low resolution, poorly drawn face, poorly drawn eyes";
    let finalImageUrl = "";

    if (imageModel === "flux") {
      finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;
    } else {
      try {
        // Ưu tiên gọi bộ não Google (Imagen 3)
        const apiKey = await resolveApiKey(req, [], 'image');
        if (apiKey) {
          const ai = getGenAI(apiKey);
          const result = await ai.models.generateImages({
            model: 'imagen-3.0-generate-001',
            prompt: finalPrompt,
            config: {
              numberOfImages: 1,
              aspectRatio: aspectRatio === "3:4" ? "3:4" : "1:1",
              outputMimeType: "image/jpeg"
            }
          });
          if (result.generatedImages && result.generatedImages.length > 0) {
            const imgBase64 = result.generatedImages[0].image.imageBytes;
            finalImageUrl = `data:image/jpeg;base64,${imgBase64}`;
            console.log("Image generated via Imagen 3");
          } else {
            throw new Error("No image generated by Imagen 3");
          }
        } else {
           throw new Error("Missing API Key");
        }
      } catch (err: any) {
        console.error("Lỗi Imagen 3:", err);
        const errorMsg = err.message || '';
        if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('exhausted') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
           return res.status(429).json({ error: 'Đã hết lượt tạo ảnh miễn phí của API Key (Quota Exceeded). Vui lòng nạp thêm Key mới để tiếp tục tạo ảnh.' });
        }
        if (errorMsg.includes('Missing API Key')) {
           return res.status(400).json({ error: 'Bạn cần nhập Google Gemini API Key để tạo ảnh bằng Imagen 3.' });
        }
        if (errorMsg.toLowerCase().includes('not found') || errorMsg.includes('404')) {
           return res.status(404).json({ error: 'API Key này chưa hỗ trợ Imagen 3 (tài khoản miễn phí có thể bị giới hạn hoặc chưa có quyền). Hãy nhấn biểu tượng cài đặt (bánh răng) ở góc trên, đổi model tạo ảnh sang FLUX.1 để tiếp tục sử dụng miễn phí.' });
        }
        return res.status(500).json({ error: 'Lỗi từ Google Imagen 3: ' + errorMsg + '. Hãy thử thay API Key hoặc đổi sang mô hình FLUX.' });
      }
    }

    res.json({ imageUrl: finalImageUrl });
  } catch (error: any) {
    res.status(500).json({ error: 'Lỗi khi tạo ảnh.' });
  }
});

app.post("/api/check-key", async (req, res) => {
  try {
    const apiKey = await resolveApiKey(req);
    if (!apiKey) return res.status(400).json({ error: 'Thiếu Key' });
    const ai = getGenAI(apiKey);
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [{ parts: [{ text: "hi" }] }],
    });
    res.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Check Key] Error for individual key:", error);
    res.status(500).json({ error: error.message });
  }
});

// New Routes for Multiple Keys
app.get('/api/admin/keys', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    const { data, error } = await db.from("gemini_keys").select("*").order("created_at", { ascending: false });
    
    if (error) {
      if (error.code === '42P01') {
        return res.json([]); // Return empty if table doesn't exist
      }
      throw error;
    }
    res.json(data || []);
  } catch (error: any) {
    console.error("[GET Keys] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/keys', async (req, res) => {
  try {
    const { keysString } = req.body;
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    
    if (!keysString) return res.status(400).json({ error: 'Chưa nhập Key' });

    // Tách key theo dòng và lọc dòng trống
    const keys = keysString.split('\n').map((k: string) => k.trim()).filter((k: string) => k.length > 5);
    
    if (keys.length === 0) return res.status(400).json({ error: 'Không tìm thấy Key hợp lệ' });

    const insertData = keys.map((key: string, index: number) => ({
      key,
      label: `Key ${new Date().toLocaleDateString()} - ${index + 1}`,
      active: true,
      created_at: new Date().toISOString()
    }));

    const { data, error } = await db.from("gemini_keys").insert(insertData).select();
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('status_message')) {
        // Fallback for missing status_message column
        const minimalInsert = keys.map((key: string, index: number) => ({
          key,
          label: `Key ${new Date().toLocaleDateString()} - ${index + 1}`,
          active: true,
          created_at: new Date().toISOString()
        }));
        const { data: retryData, error: retryError } = await db.from("gemini_keys").insert(minimalInsert).select();
        if (retryError) throw retryError;
        return res.json(retryData);
      }
      
      if (error.code === '42P01') {
        throw new Error("Bảng 'gemini_keys' chưa tồn tại. Vui lòng chạy mã SQL trong Dashboard Supabase (Nút Sao chép SQL trong Cài đặt).");
      }
      throw error;
    }
    res.json(data);
  } catch (error: any) {
    console.error("[POST Keys] Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/keys/check/:id', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    
    const { data: keyData, error: fetchError } = await db.from("gemini_keys").select("key").eq("id", req.params.id).single();
    if (fetchError || !keyData) throw new Error("Không tìm thấy Key");

    let status = "Hoạt động";
    let isActive = true;

    try {
      const ai = getGenAI(keyData.key);
      await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ parts: [{ text: "hi" }] }],
        config: { maxOutputTokens: 1 }
      });
    } catch (err: any) {
      status = `Lỗi: ${err.message || 'Không xác định'}`;
      isActive = false;
    }

    try {
      await db.from("gemini_keys").update({ 
        status_message: status, 
        active: isActive,
        last_checked: new Date().toISOString()
      }).eq("id", req.params.id);
    } catch (ignore) {
      console.warn("Could not update status_message - column might be missing");
    }

    res.json({ id: req.params.id, status, active: isActive });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/keys/:id', async (req, res) => {
  try {
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    const { error } = await db.from("gemini_keys").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/keys/:id', async (req, res) => {
  try {
    const { active } = req.body;
    const db = getSupabase();
    if (!db) return res.status(500).json({ error: 'Supabase chưa khởi tạo.' });
    const { error } = await db.from("gemini_keys").update({ active }).eq("id", req.params.id);
    if (error) throw error;
    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GLOBAL ERROR HANDLER
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Error Handled]:', err);
  res.status(500).json({ error: 'Internal Error', message: err.message });
});

export default app;
