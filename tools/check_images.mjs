/**
 * Sponsorlu okul görsellerinin varlığını ve boyutlarını denetler.
 *   node tools/check_images.mjs
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);
const SPONSORS_FILE = join(ROOT, 'src', 'lib', 'sponsors.ts');
const SCHOOLS_DIR = join(ROOT, 'public', 'img', 'schools');

// Session kotasını korumak adına okul başına 2 görsel (cover.jpg ve 01.jpg)
const EXPECTED_FILES = ['cover.jpg', '01.jpg'];
const MAX_RECOMMENDED_KB = 1200;

const tsContent = readFileSync(SPONSORS_FILE, 'utf-8');

// PLACEMENTS listesindeki okulları ve img klasör adlarını ayıkla
const placementRegex = /\{\s*province:\s*'([^']+)',\s*ilce:\s*'([^']+)',\s*ad:\s*'([^']+)',\s*img:\s*'([^']+)'/g;
const placements = [];
let match;
while ((match = placementRegex.exec(tsContent)) !== null) {
  placements.push({
    province: match[1],
    ilce: match[2],
    ad: match[3],
    img: match[4],
  });
}

console.log(`\nSponsorlu Okul Görsel Kontrolü (${placements.length} okul, okul başına ${EXPECTED_FILES.length} görsel)\n` + '='.repeat(70));

let totalExpected = placements.length * EXPECTED_FILES.length;
let totalFound = 0;

for (const p of placements) {
  const schoolDir = join(SCHOOLS_DIR, p.img);
  const statusList = [];
  let foundCount = 0;

  for (const file of EXPECTED_FILES) {
    const filePath = join(schoolDir, file);
    if (existsSync(filePath)) {
      foundCount++;
      totalFound++;
      const stats = statSync(filePath);
      const kb = Math.round(stats.size / 1024);
      statusList.push(`${file} (✓ ${kb} KB)`);
    } else {
      statusList.push(`${file} (❌ yok)`);
    }
  }

  const badge =
    foundCount === EXPECTED_FILES.length
      ? '✓ TAMAM '
      : foundCount > 0
        ? '⚡ KISMİ '
        : '✗ YOK   ';

  console.log(`\n${badge} [${p.img}] - ${p.ad} (${p.province.toUpperCase()} / ${p.ilce})`);
  console.log(`       Durum: ${foundCount}/${EXPECTED_FILES.length} görsel`);
  console.log(`       Dosyalar: ${statusList.join(' | ')}`);
}

console.log('\n' + '='.repeat(70));
const percent = Math.round((totalFound / totalExpected) * 100);
console.log(`ÖZET: Toplam ${totalFound}/${totalExpected} görsel mevcut (%${percent}).`);
console.log(`Dizin: ${SCHOOLS_DIR}\n`);
