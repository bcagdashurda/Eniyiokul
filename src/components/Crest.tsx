/**
 * Okul arması.
 *
 * MEB kayıtlarında okul fotoğrafı yok. Stok görsel koymak gerçek bir kurumu
 * yanlış temsil eder; bunun yerine okul adından türetilen kalıcı bir kimlik
 * işareti üretiliyor — aynı okul her zaman aynı armayı alır.
 *
 * `photo` verildiğinde (okul kendi görselini yüklediğinde) arma yerine o kullanılır.
 */
/* Marka teali etrafında toplanmış, birbirinden ayırt edilebilir tonlar.
   Hepsi beyaz metinle en az 4.5:1 kontrast verir. */
const PALETTE: [string, string][] = [
  ['#0E5C6B', '#2B8494'],
  ['#1C5B85', '#3E86B4'],
  ['#2A6A55', '#469079'],
  ['#8C5A13', '#B8791F'],
  ['#5B4A8C', '#7E6BB8'],
  ['#7A3B4E', '#A85F73'],
  ['#3F5B2E', '#628A4A'],
  ['#1F4E60', '#3C7C91'],
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** "ÖZEL BURSA ARENA ... ANADOLU LİSESİ" -> "BA" */
function initials(name: string) {
  const skip = new Set([
    'ÖZEL', 'VE', 'İLE', 'ANADOLU', 'FEN', 'LİSESİ', 'İLKOKULU', 'ORTAOKULU',
    'ANAOKULU', 'KOLEJİ', 'OKULU', 'VAKFI', 'TÜRK', 'MESLEKİ', 'TEKNİK',
    'HAZIRLIK', 'SINIFI', 'BULUNAN', 'ÜNİVERSİTESİ', 'EĞİTİM', 'KURUMU',
  ]);
  const words = name
    .split(/[\s.()-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !skip.has(w.toLocaleUpperCase('tr-TR')));
  const pick = words.length >= 2 ? [words[0], words[1]] : words.length === 1 ? [words[0]] : [name];
  return pick
    .map((w) => w[0])
    .join('')
    .toLocaleUpperCase('tr-TR')
    .slice(0, 2);
}

export default function Crest({
  name,
  photo,
  size = 52,
  className = '',
}: {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
}) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={`shrink-0 rounded-xl object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const h = hash(name);
  const [a, b] = PALETTE[h % PALETTE.length];
  const rot = (h >> 3) % 90;

  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(${rot + 130}deg, ${a}, ${b})`,
      }}
    >
      {/* İnce kartografik halka — marka dilindeki pusula motifi */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 opacity-30"
        style={{ transform: `rotate(${rot}deg)` }}
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="1.2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="0.7" strokeDasharray="3 5" />
      </svg>
      <span
        className="relative font-semibold text-white"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.36,
          letterSpacing: '-0.02em',
        }}
      >
        {initials(name)}
      </span>
    </span>
  );
}
