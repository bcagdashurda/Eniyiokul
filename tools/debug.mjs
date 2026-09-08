import { chromium } from 'playwright';

const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push('pageerror: ' + e.message));

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForSelector('svg[role="img"]');
await page.waitForTimeout(1500);

const dump = async (tag) => {
  const r = await page.evaluate(() => {
    const svg = document.querySelector('svg[role="img"]');
    const layers = svg.querySelectorAll('g');
    const labelG = svg.querySelector('g[aria-hidden="true"]');
    const zoomG = svg.querySelector('g');
    return {
      viewBox: svg.getAttribute('viewBox'),
      groups: layers.length,
      zoomTransform: zoomG?.getAttribute('transform') ?? null,
      labelChildren: labelG ? labelG.children.length : -1,
      labelOpacity: labelG ? getComputedStyle(labelG).opacity : 'n/a',
      labelVisibility: labelG ? getComputedStyle(labelG).visibility : 'n/a',
      provinces: svg.querySelectorAll('path.province').length,
      districts: svg.querySelectorAll('path.district').length,
      texts: svg.querySelectorAll('text').length,
    };
  });
  console.log(tag, JSON.stringify(r, null, 1));
};

await dump('ULKE ');
await page.getByRole('button', { name: /^Bursa —/ }).click();
await page.waitForTimeout(2500);
await dump('BURSA');

if (logs.length) {
  console.log('\n--- konsol ---');
  logs.slice(0, 15).forEach((l) => console.log('  ', l.slice(0, 200)));
}
await b.close();
