/**
 * Bağımlılıksız statik sunucu.
 *
 * Derlenmiş site `dist/` klasöründen servis edilir. Tarayıcılar `file://`
 * üzerinden `fetch` çağrılarını engellediği için siteyi doğrudan çift
 * tıklayarak açmak veriyi yükleyemiyor; bu küçük sunucu o sorunu çözüyor.
 *
 *   node tools/serve.mjs           -> dist/ klasörünü 4173 portunda açar
 *   node tools/serve.mjs public 8080
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

if (!existsSync(root)) {
  console.error(`\n  "${root}" bulunamadı.\n  Önce "npm run build" çalıştırın.\n`);
  process.exit(1);
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  // Klasör dışına çıkmaya çalışan istekleri engelle
  let file = join(root, normalize(url).replace(/^(\.\.[/\\])+/, ''));

  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  // Tek sayfalık uygulama: bilinmeyen yol index.html'e düşer
  if (!existsSync(file)) file = join(root, 'index.html');

  res.writeHead(200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`\n  eniyiokul hazır:  http://localhost:${port}\n`);
  console.log(`  Klasör: ${root}`);
  console.log('  Durdurmak için Ctrl+C\n');
});
