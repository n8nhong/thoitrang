const fs = require('fs');
const path = require('path');

function search(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' && dir === '.') continue;
        if (file === '.git') continue;
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results = results.concat(search(full));
        } else {
            results.push(full);
        }
    }
    return results;
}

const allFiles = search('.');
const backups = allFiles.filter(f => f.includes('App') || f.endsWith('.bak') || f.includes('swap'));
console.log(backups);
