import * as fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 6. Generated Output Modal Main
content = content.replace(
  `-translate-y-1/2" />
                       )
                       ) : (`,
  `-translate-y-1/2" />
                       )
                       <WatermarkHider />
                       ) : (`
);

// 7. Generated Output Thumbnails
content = content.replace(
  `-translate-y-1/2" />
                           )}
                           </button>`,
  `-translate-y-1/2" />
                           )}
                           <WatermarkHider />
                           </button>`
);

fs.writeFileSync('src/App.tsx', content);
