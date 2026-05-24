const fs = require('fs');
const temp = fs.readFileSync('src/App.tsx.temp', 'utf8').split('\n');
const app = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
console.log('temp length', temp.length);
console.log('app length', app.length);

let firstDiff = -1;
for (let i = 0; i < Math.min(temp.length, app.length); i++) {
  if (temp[i] !== app[i]) {
    firstDiff = i;
    break;
  }
}
console.log('first diff line:', firstDiff);

// find where app resumes
let resumeLine = -1;
let endApp = app[app.length - 100];
for(let i = temp.length - 1; i >= 0; i--) {
  if (temp[i] === endApp) {
    resumeLine = i;
    break;
  }
}
console.log('app resumes in temp around line:', resumeLine);
