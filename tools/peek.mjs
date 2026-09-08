/** Belirli bir bölümü gerçekten görmek için. node tools/peek.mjs guven */
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

await p.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
await p.waitForTimeout(1800);
await p.screenshot({ path: `tools/shots/peek-${id}-1.png` });

await p.evaluate(() => window.scrollBy(0, 760));
await p.waitForTimeout(1500);
await p.screenshot({ path: `tools/shots/peek-${id}-2.png` });

console.log(errs.length ? errs.slice(0, 5).join('\n') : 'hata yok');
await b.close();
