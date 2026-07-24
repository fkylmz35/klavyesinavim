import http from 'http'; import fs from 'fs'; import path from 'path';
const root = process.cwd();
const mime = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json' };
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]); if (p==='/') p='/index.html';
  const fp = path.join(root, p);
  fs.readFile(fp,(e,d)=>{ if(e){res.writeHead(404);res.end('yok');return;}
    res.writeHead(200,{'Content-Type':(mime[path.extname(fp)]||'application/octet-stream')+'; charset=utf-8'}); res.end(d);});
}).listen(8080,()=>console.log('http://localhost:8080'));
