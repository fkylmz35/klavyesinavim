// Basit statik geliştirme sunucusu (yalnızca yerel geliştirme için).
// Güvenlik: path traversal engellenir; istek yalnızca proje kökü altında kalır.
import http from 'http';
import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain',
};

http.createServer((req, res) => {
  let istekYolu;
  try { istekYolu = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { res.writeHead(400); res.end('geçersiz istek'); return; }
  if (istekYolu === '/' || istekYolu === '') istekYolu = '/index.html';

  // Kök altına normalize et; dışarı çıkışı engelle.
  const hedef = path.resolve(root, '.' + istekYolu);
  if (hedef !== root && !hedef.startsWith(root + path.sep)) {
    res.writeHead(403); res.end('yasak'); return;
  }

  fs.stat(hedef, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end('yok'); return; }
    fs.readFile(hedef, (e, d) => {
      if (e) { res.writeHead(404); res.end('yok'); return; }
      res.writeHead(200, {
        'Content-Type': (mime[path.extname(hedef).toLowerCase()] || 'application/octet-stream') + '; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',              // clickjacking
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
          "img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; " +
          "base-uri 'self'; frame-ancestors 'none'; form-action 'none'",
      });
      res.end(d);
    });
  });
}).listen(8080, () => console.log('http://localhost:8080'));
