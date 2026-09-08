/**
 * Sabitlenmiş sahneyi kaydırma ilerlemesine göre yakalar.
 * Sinematik bölümü gerçekten görmek için: node tools/scene.mjs guven
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('tools/shots', { recursive: true });
const id = process.argv[2] ?? 'guven';
const BASE = process.env.BASE ?? 'http://localhost:5173';

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));

await p.goto(BASE, { waitUntil: 'networkidle' });
await p.waitForSelector('svg[role="img"]');
await p.waitForTimeout(2200);

const box = await p.evaluate((i) => {
  const el = document.getElementById(i);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top + window.scrollY, height: r.height };
}, id);

if (!box) {
  console.log('bölüm bulunamadı:', id);
} else {
  console.log(`bölüm yüksekliği: ${Math.round(box.height)}px`);
  for (const t of [0, 0.25, 0.5, 0.75]) {
    const y = box.top + box.height * t;
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(900);
    await p.screenshot({ path: `tools/shots/scene-${id}-${Math.round(t * 100)}.png` });
  }
}

console.log(errs.length ? errs.slice(0, 4).join('\n') : 'hata yok');
await b.close();
