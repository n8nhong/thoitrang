import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const zClasses = "w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer";
const zClassesNoCursor = "w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";

content = content.replace(
  '<img src={historyImages[\'full\'][currentImageIndices[\'full\'] || 0]} className="w-full h-full object-contain cursor-pointer" onClick={() => setViewingImageModal(historyImages[\'full\'][currentImageIndices[\'full\'] || 0])} />',
  `{historyImages['full'][currentImageIndices['full'] || 0]?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                                    <video src={historyImages['full'][currentImageIndices['full'] || 0]} autoPlay loop muted playsInline className="${zClasses}" onClick={() => setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  ) : (
                                    <img src={historyImages['full'][currentImageIndices['full'] || 0]} className="${zClasses}" onClick={() => setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  )}`
);

content = content.replace(
  '<img src={historyImages[typeKey][currentImageIndices[typeKey] || 0]} className="w-full h-full object-contain cursor-pointer" onClick={() => setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />',
  `{historyImages[typeKey][currentImageIndices[typeKey] || 0]?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                                        <video src={historyImages[typeKey][currentImageIndices[typeKey] || 0]} autoPlay loop muted playsInline className="${zClasses}" onClick={() => setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      ) : (
                                        <img src={historyImages[typeKey][currentImageIndices[typeKey] || 0]} className="${zClasses}" onClick={() => setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      )}`
);

content = content.replace(
  '<img src={historyImages[\'detail\'][currentImageIndices[\'detail\'] || 0]} className="w-full h-full object-contain" />',
  `{historyImages['detail'][currentImageIndices['detail'] || 0]?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                                    <video src={historyImages['detail'][currentImageIndices['detail'] || 0]} autoPlay loop muted playsInline className="${zClassesNoCursor}" />
                                  ) : (
                                    <img src={historyImages['detail'][currentImageIndices['detail'] || 0]} className="${zClassesNoCursor}" />
                                  )}`
);

content = content.replace(
  '<img src={historyImages[\'improvement\'][currentImageIndices[\'improvement\'] || 0]} className="w-full h-full object-contain cursor-pointer" onClick={() => setViewingImageModal(historyImages[\'improvement\'][currentImageIndices[\'improvement\'] || 0])} />',
  `{historyImages['improvement'][currentImageIndices['improvement'] || 0]?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                                        <video src={historyImages['improvement'][currentImageIndices['improvement'] || 0]} autoPlay loop muted playsInline className="${zClasses}" onClick={() => setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      ) : (
                                        <img src={historyImages['improvement'][currentImageIndices['improvement'] || 0]} className="${zClasses}" onClick={() => setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      )}`
);

const knowTarget = `{knowledgeImages[idx].endsWith('.mp4') || knowledgeImages[idx].endsWith('.webm') ? (
                                           <video src={knowledgeImages[idx]} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                        ) : (
                                           <img src={knowledgeImages[idx]} className="w-full h-full object-cover cursor-pointer" onClick={() => setViewingImageModal(knowledgeImages[idx])} />
                                        )}`;
const knowReplace = `{knowledgeImages[idx]?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                                           <video src={knowledgeImages[idx]} autoPlay loop muted playsInline className="${zClasses}" onClick={() => setViewingImageModal(knowledgeImages[idx])} />
                                        ) : (
                                           <img src={knowledgeImages[idx]} className="${zClasses}" onClick={() => setViewingImageModal(knowledgeImages[idx])} />
                                        )}`;
content = content.replace(knowTarget, knowReplace);

const viewingTarget = `<img src={viewingImageModal} className="w-full h-full object-contain max-h-[90vh] rounded-lg shadow-2xl" />`;
const viewingReplace = `{viewingImageModal?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                <div className="w-full h-full object-contain max-h-[90vh] rounded-lg shadow-2xl overflow-hidden relative">
                  <video src={viewingImageModal} autoPlay loop muted playsInline className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              ) : (
                <div className="w-full h-full object-contain max-h-[90vh] rounded-lg shadow-2xl overflow-hidden relative">
                  <img src={viewingImageModal} className="w-[110%] h-[110%] max-w-none object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
              )}`;
content = content.replace(viewingTarget, viewingReplace);

const mainTarget = `<img src={currentMain} className="w-full h-full object-cover" />`;
const mainReplace = `{currentMain?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                         <video src={currentMain} autoPlay loop muted playsInline className="${zClassesNoCursor}" />
                       ) : (
                         <img src={currentMain} className="${zClassesNoCursor}" />
                       )}`;
content = content.replace(mainTarget, mainReplace);

const thumbTarget = `<img src={currentThumb} className="w-full h-full object-cover" />`;
const thumbReplace = `{currentThumb?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                             <video src={currentThumb} autoPlay loop muted playsInline className="${zClassesNoCursor}" />
                           ) : (
                             <img src={currentThumb} className="${zClassesNoCursor}" />
                           )}`;
content = content.replace(thumbTarget, thumbReplace);

// Also the root background gradient:
const bgTarget = `{origImage.endsWith('.mp4') || origImage.endsWith('.webm') ? (
                  <video src={origImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={origImage} className="w-full h-full object-cover" />
                )}`;
const bgReplace = `{origImage?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                  <video src={origImage} autoPlay loop muted playsInline className="${zClassesNoCursor}" />
                ) : (
                  <img src={origImage} className="${zClassesNoCursor}" />
                )}`;
content = content.replace(bgTarget, bgReplace);

const karaokeThumbTarget = `{(karaokeViewType === 'original' || activeTab === 'knowledge') && origImage && (origImage.endsWith('.mp4') || origImage.endsWith('.webm')) ? (
                  <video src={origImage} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img 
                    src={genImage || origImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070'} 
                    className="w-full h-full object-cover transition-all duration-1000"
                  />
                )}`;
const karaokeThumbReplace = `{(karaokeViewType === 'original' || activeTab === 'knowledge') && origImage && origImage.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                  <video src={origImage} autoPlay loop muted playsInline className="${zClassesNoCursor}" />
                ) : (
                  (genImage || origImage)?.match(/\\.(mp4|webm)(\\?.*)?$/i) ? (
                    <video src={genImage || origImage} autoPlay loop muted playsInline className="${zClassesNoCursor} transition-all duration-1000" />
                  ) : (
                    <img 
                      src={genImage || origImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070'} 
                      className="${zClassesNoCursor} transition-all duration-1000"
                    />
                  )
                )}`;
content = content.replace(karaokeThumbTarget, karaokeThumbReplace);

fs.writeFileSync('src/App.tsx', content);
