/**
 * Tasarımı gözden geçirmek için ekran görüntüleri.
 *   node tools/shot.mjs           -> hepsi
 *   node tools/shot.mjs pages     -> yalnızca sayfalar
 *   node tools/shot.mjs responsive
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'tools/shots';
mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const BASE = process.env.BASE ?? 'http://localhost:5173';

const browser = await chromium.launch();
const errors = [];

async function newPage(w = 1440, h = 900) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    locale: 'tr-TR',
  });
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  return page;
}

async function shot(page, hash, file, wait = 2200) {
  await page.goto(`${BASE}/${hash}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${OUT}/${file}.png` });
}

const groups = {
  /* Ana sayfa akışı */
  home: async () => {
    const page = await newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('svg[role="img"]');
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/01-hero.png` });

    await page.getByRole('button', { name: /^Bursa —/ }).click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${OUT}/02-il.png` });

    await page.getByRole('button', { name: /Nilüfer ilçesi/i }).first().click();
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/03-ilce.png` });

    await page.evaluate(() => document.getElementById('okullar')?.scrollIntoView());
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/04-liste.png` });

    await page.getByRole('button', { name: /değerlendirmeyi yap|Değerlendir/ }).first().click();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/05-puanlama.png` });
    await page.keyboard.press('Escape');

    for (const [id, f] of [
      ['one-cikan', '06-sponsorlu'],
      ['iletisim', '07-footer'],
    ]) {
      await page.evaluate((i) => document.getElementById(i)?.scrollIntoView(), id);
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `${OUT}/${f}.png` });
    }
    await page.close();
  },

  /* Ayrı sayfalar */
  pages: async () => {
    const page = await newPage();
    await shot(page, '#/neden-eniyiokul', '10-neden');
    await shot(page, '#/okullar-icin', '11-okullar-icin');
    await shot(page, '#/kvkk', '12-kvkk');
    await shot(page, '#/puanlama-kurallari', '13-puanlama');
    await page.close();
  },

  /* Kırılma noktaları */
  responsive: async () => {
    for (const [w, h, name] of [
      [1024, 800, '20-1024'],
      [820, 1180, '21-tablet'],
      [390, 844, '22-telefon'],
    ]) {
      const page = await newPage(w, h);
      await page.goto(BASE, { waitUntil: 'networkidle' });
      await page.waitForSelector('svg[role="img"]');
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `${OUT}/${name}-hero.png` });

      await page.getByRole('button', { name: /^Bursa —/ }).click();
      await page.waitForTimeout(2200);
      await page.screenshot({ path: `${OUT}/${name}-il.png` });

      // Mobil menü
      if (w < 1280) {
        const btn = page.getByRole('button', { name: 'Menüyü aç' });
        if (await btn.count()) {
          await btn.click();
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${OUT}/${name}-menu.png` });
        }
      }
      await page.close();
    }
  },
};

for (const [name, fn] of Object.entries(groups)) {
  if (only && only !== name) continue;
  try {
    await fn();
    console.log('ok   ', name);
  } catch (e) {
    console.log('HATA ', name, '->', String(e).split('\n')[0]);
  }
}

if (errors.length) {
  console.log('\n--- konsol hataları ---');
  [...new Set(errors)].slice(0, 12).forEach((e) => console.log('  ', e.slice(0, 220)));
} else {
  console.log('\nkonsol temiz');
}

await browser.close();
