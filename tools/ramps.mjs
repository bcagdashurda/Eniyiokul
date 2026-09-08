/** Üç renk rampasını aynı görünümde yan yana karşılaştırmak için. */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('tools/shots', { recursive: true });
const b = await chromium.launch();

for (const r of ['a', 'b', 'c']) {
  const page = await b.newPage({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
  await page.goto(`http://localhost:5173/?ramp=${r}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('svg[role="img"]');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `tools/shots/ramp-${r}-turkiye.png` });

  // il görünümü de aynı rampayla
  await page.getByRole('button', { name: /^Bursa —/ }).click();
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `tools/shots/ramp-${r}-bursa.png` });
  await page.close();
  console.log('ok', r);
}

await b.close();
