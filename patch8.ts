import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const tFull = `<FloatingImageActions 
                                    url={historyImages['full'][currentImageIndices['full'] || 0]} 
                                    name="fashion-full-body" 
                                    prompt={currentHistory?.fullBodyPrompt}
                                  />`;
const rFull = `<FloatingImageActions 
                                    url={historyImages['full'][currentImageIndices['full'] || 0]} 
                                    name="fashion-full-body" 
                                    prompt={currentHistory?.fullBodyPrompt}
                                    onPaste={(url) => {
                                      const currentList = [...(historyImages['full'] || [])];
                                      const currentIndex = currentImageIndices['full'] || 0;
                                      currentList[currentIndex] = url;
                                      setHistoryImages(prev => ({ ...prev, 'full': currentList }));
                                    }}
                                  />`;
content = content.replace(tFull, rFull);

const tDetail = `<FloatingImageActions 
                                        url={historyImages[typeKey][currentImageIndices[typeKey] || 0]} 
                                        name={\`fashion-detail-\${dp.name}\`} 
                                        prompt={dp.prompt}
                                      />`;
const rDetail = `<FloatingImageActions 
                                        url={historyImages[typeKey][currentImageIndices[typeKey] || 0]} 
                                        name={\`fashion-detail-\${dp.name}\`} 
                                        prompt={dp.prompt}
                                        onPaste={(url) => {
                                          const currentList = [...(historyImages[typeKey] || [])];
                                          const currentIndex = currentImageIndices[typeKey] || 0;
                                          currentList[currentIndex] = url;
                                          setHistoryImages(prev => ({ ...prev, [typeKey]: currentList }));
                                        }}
                                      />`;
content = content.replace(tDetail, rDetail);

const tImp = `<FloatingImageActions 
                                        url={historyImages['improvement'][currentImageIndices['improvement'] || 0]} 
                                        name="improved-outfit" 
                                        prompt={currentHistory?.improvementPrompt}
                                      />`;
const rImp = `<FloatingImageActions 
                                        url={historyImages['improvement'][currentImageIndices['improvement'] || 0]} 
                                        name="improved-outfit" 
                                        prompt={currentHistory?.improvementPrompt}
                                        onPaste={(url) => {
                                          const currentList = [...(historyImages['improvement'] || [])];
                                          const currentIndex = currentImageIndices['improvement'] || 0;
                                          currentList[currentIndex] = url;
                                          setHistoryImages(prev => ({ ...prev, 'improvement': currentList }));
                                        }}
                                      />`;
content = content.replace(tImp, rImp);

fs.writeFileSync('src/App.tsx', content);
