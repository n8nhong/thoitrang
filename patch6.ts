import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const t1 = `                                 const imagePrompt = \`vietnamese person, asian facial features, \${imgKw}\`;
                                 const videoPrompt = \`A 8 seconds cinematic video of vietnamese person, asian facial features, \${imgKw}\`;`;

const r1 = `                                 const charFeature = gender === 'Nam' ? 'Vietnamese man named Nam, handsome, distinct facial features' : gender === 'Nữ' ? 'Vietnamese woman named Lan, beautiful, distinct facial features' : 'Vietnamese person, distinct facial features';
                                 const imagePrompt = \`Vertical 9:16 aspect ratio (1080x1920) for TikTok: photorealistic portrait, \${charFeature}. Wearing detailed clothing based on: \${imgKw}. High quality, emotional lighting, cinematic composition.\`;
                                 const videoPrompt = \`A 8-seconds cinematic video of a \${charFeature}. Consistent character design: wearing specific detailed clothing (\${imgKw}) including shirt, pants, shoes. Camera angle: dynamic tracking shot. Lighting: soft emotional sunlight, cinematic rim light. Setting/Background: realistic Vietnamese authentic background, depth of field. Motion: natural, slow motion, expressing deep emotion that touches the heart.\`;`;

content = content.replace(t1, r1);

// Also let's rename the button to "Dán Media Đã Tạo"
const t2 = `                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(imagePrompt); alert("Đã copy Prompt Ảnh!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Ảnh">📄 Prompt Ảnh</button>
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
                                    </button>`;

const r2 = `                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(imagePrompt); alert("Đã copy Prompt Ảnh!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Ảnh">📄 Prompt Ảnh (9:16 TikTok)</button>
                                      <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(videoPrompt); alert("Đã copy Prompt Video Veo3 8s!"); }} className="flex-1 text-[7px] font-bold py-1.5 px-0.5 bg-[#F9F8F6] border border-[#DDD6CE] rounded hover:bg-[#EAE5DF] text-[#1A1A1A] transition-colors" title="Copy Prompt Video Veo3 8s">🎬 Prompt Video</button>
                                    </div>
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const url = window.prompt("Dán URL Ảnh hoặc Video (mp4, webm) vừa tạo:"); 
                                        if (url && url.trim()) {
                                          setKnowledgeImages(prev => ({ ...prev, [idx]: url.trim() }));
                                        }
                                      }} 
                                      className="text-center w-full text-[8px] font-bold uppercase py-1.5 px-1 bg-blue-50 text-blue-600 border border-blue-100 rounded hover:bg-blue-100 transition-colors"
                                    >
                                      📥 Dán Ảnh/Video Đã Tạo
                                    </button>`;

content = content.replace(t2, r2);

fs.writeFileSync('src/App.tsx', content);

