/**
 * Tasarım denetimi: bölüm zeminlerini, kontrastları ve tipografi
 * ölçeklerini toplayıp raporlar. Gözle bakmadan önce ölçmek için.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('tools/shots', { recursive: true });
const BASE = process.env.BASE ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('svg[role="img"]');
await page.waitForTimeout(2500);

/* 1. Bölüm zeminleri sırayla */
const sections = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('main > section, main > div > section, footer').forEach((el) => {
    const cs = getComputedStyle(el);
    out.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || '(id yok)',
      bg: cs.backgroundColor,
      color: cs.color,
      h: Math.round(el.getBoundingClientRect().height),
    });
  });
  return out;
});

console.log('=== BÖLÜM ZEMİNLERİ (sırayla) ===');
let prev = null;
for (const s of sections) {
  const same = prev === s.bg ? '  <-- ÖNCEKİYLE AYNI ZEMİN' : '';
  console.log(`${s.id.padEnd(14)} ${s.bg.padEnd(22)} y=${String(s.h).padStart(5)}${same}`);
  prev = s.bg;
}

/* 2. Kullanılan tüm renkler ve kaç kez */
const colors = await page.evaluate(() => {
  const bg = {};
  const fg = {};
  document.querySelectorAll('*').forEach((el) => {
    const cs = getComputedStyle(el);
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bg[cs.backgroundColor] = (bg[cs.backgroundColor] || 0) + 1;
    }
    if (el.children.length === 0 && el.textContent?.trim()) {
      fg[cs.color] = (fg[cs.color] || 0) + 1;
    }
  });
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 16);
  return { bg: top(bg), fg: top(fg) };
});

console.log('\n=== EN ÇOK KULLANILAN ZEMİN RENKLERİ ===');
colors.bg.forEach(([c, n]) => console.log(`${String(n).padStart(4)}x  ${c}`));
console.log('\n=== EN ÇOK KULLANILAN METİN RENKLERİ ===');
colors.fg.forEach(([c, n]) => console.log(`${String(n).padStart(4)}x  ${c}`));

/* 3. Başlık ölçeği */
const type = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('h1, h2, h3').forEach((el) => {
    const cs = getComputedStyle(el);
    out.push({
      tag: el.tagName,
      size: Math.round(parseFloat(cs.fontSize)),
      weight: cs.fontWeight,
      family: cs.fontFamily.split(',')[0].replace(/"/g, ''),
      text: (el.textContent || '').trim().slice(0, 34),
    });
  });
  return out;
});

console.log('\n=== BAŞLIK ÖLÇEĞİ ===');
type.forEach((t) =>
  console.log(`${t.tag}  ${String(t.size).padStart(3)}px  ${t.weight.padEnd(4)} ${t.family.padEnd(16)} ${t.text}`),
);

/* 4. Tam sayfa görüntü.
   Önce baştan sona kaydırılıyor: kaydırmayla gelen içerik aksi halde
   gizli kalıyor ve görüntü gerçeği yansıtmıyor. */
const total = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < total; y += 500) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.screenshot({ path: 'tools/shots/audit-tam-sayfa.png', fullPage: true });
console.log('\ntools/shots/audit-tam-sayfa.png yazıldı');

await browser.close();
