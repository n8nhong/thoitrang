const http = require('http');

http.get('http://localhost:3000/src/App.tsx?v=1', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data.substring(0, 500));
    require('fs').writeFileSync('recovered_app.js', data);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
