import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all occurrences of 110% with w-full h-full object-contain.
content = content.replace(/className="w-\[110%\] h-\[110%\] max-w-none object-cover/g, 'className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500');

// Now, we need to inject the watermark overlay.
// Since we don't want to mess up HTML tags, let's find all the occurrences where these videos/images are rendered.
// They are usually in an <div className="..."> wrapper, and there's a `<FloatingImageActions>` afterwards. Wait, no.
// A safe way to append the watermark is right after the `/>` or `</video>` tag of these specific media elements.
// Even simpler: Replace:
// `/>\n                                  )}`
// with 
// `/>\n  <div className="absolute bottom-[2%] right-[2%] w-[6%] h-[3%] min-w-[30px] min-h-[16px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none mix-blend-difference rounded-tl-sm hidden md:block"></div>\n<div className="absolute bottom-[1%] right-[1%] w-[8%] h-[4%] min-w-[20px] min-h-[10px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none md:hidden rounded-tl-sm"></div>\n                                  )}`
// We can just add this watermark div to ANY place where we render these AI images.

// Let's create a custom component `WatermarkHider`
const hider = `\nconst WatermarkHider = () => (
  <>
    <div className="absolute bottom-[2%] right-[2%] w-[6%] h-[3%] min-w-[30px] min-h-[16px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none mix-blend-difference rounded-tl-sm hidden md:block" />
    <div className="absolute bottom-[1%] right-[1%] w-[8%] h-[4%] min-w-[20px] min-h-[10px] bg-[#0A0A0A]/90 blur-[2px] z-20 pointer-events-none md:hidden rounded-tl-sm" />
  </>
);\n`;

if (!content.includes('WatermarkHider')) {
  content = content.replace('const FloatingImageActions =', hider + '\nconst FloatingImageActions =');
}

// Now we inject `<WatermarkHider />` safely.
// Where are the images rendered?
// 1. History Full Body:
content = content.replace(
  `setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  )}`,
  `setViewingImageModal(historyImages['full'][currentImageIndices['full'] || 0])} />
                                  )}
                                  <WatermarkHider />`
);

// 2. History TypeKey:
content = content.replace(
  `setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      )}`,
  `setViewingImageModal(historyImages[typeKey][currentImageIndices[typeKey] || 0])} />
                                      )}
                                      <WatermarkHider />`
);

// 3. History Detail:
content = content.replace(
  `className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  )}`,
  `className="w-full h-full object-contain hover:scale-[1.01] transition-transform duration-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  )}
                                  <WatermarkHider />`
);

// 4. History Improvement:
content = content.replace(
  `setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      )}`,
  `setViewingImageModal(historyImages['improvement'][currentImageIndices['improvement'] || 0])} />
                                      )}
                                      <WatermarkHider />`
);

// 5. Knowledge Modal:
content = content.replace(
  `setViewingImageModal(knowledgeImages[idx])} />
                                        )}`,
  `setViewingImageModal(knowledgeImages[idx])} />
                                        )}
                                        <WatermarkHider />`
);

// 6. Generated Output Modal Main
content = content.replace(
  `cursor-pointer" />
                       )
                       ) : (`,
  `cursor-pointer" />
                       )
                       <WatermarkHider />
                       ) : (`
);

// 7. Generated Output Thumbnails
content = content.replace(
  `cursor-pointer" />
                           )}
                           </button>`,
  `cursor-pointer" />
                           )}
                           <WatermarkHider />
                           </button>`
);

fs.writeFileSync('src/App.tsx', content);
