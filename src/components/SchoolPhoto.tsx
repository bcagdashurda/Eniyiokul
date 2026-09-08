import { useState } from 'react';
import Crest from './Crest';

/**
 * Sponsorlu okul görseli.
 *
 * Dosya yoksa ya da yüklenemezse sessizce armaya döner — eksik görsel
 * arayüzü bozmaz. Görsel AI üretimi olduğu sürece köşede "Temsili görsel"
 * etiketi durur: okullar gerçek olduğu için bir velinin bunu gerçek kampüs
 * fotoğrafı sanması yanıltıcı olurdu.
 */
export default function SchoolPhoto({
  img,
  file = 'cover.jpg',
  name,
  real = false,
  ratio = '16 / 9',
  className = '',
  rounded = 'rounded-xl',
  hideIfMissing = false,
}: {
  img?: string;
  file?: string;
  name: string;
  real?: boolean;
  ratio?: string;
  className?: string;
  rounded?: string;
  /** Görsel yoksa arma yerine hiçbir şey çizme — boş kutu bırakmamak için. */
  hideIfMissing?: boolean;
}) {
  // .jpg bulunamazsa .webp denenir; ikisi de yoksa armaya dönülür.
  const [attempt, setAttempt] = useState(0);
  const exts = ['jpg', 'webp', 'png'];
  const base = file.replace(/\.[a-z]+$/i, '');
  const failed = attempt >= exts.length;
  const src = img ? `img/schools/${img}/${base}.${exts[Math.min(attempt, exts.length - 1)]}` : null;

  if ((!src || failed) && hideIfMissing) return null;

  if (!src || failed) {
    return (
      <div
        className={`relative grid place-items-center overflow-hidden bg-bg-2 ${rounded} ${className}`}
        style={{ aspectRatio: ratio }}
      >
        <Crest name={name} size={64} />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-bg-2 ${rounded} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <img
        key={src}
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setAttempt((a) => a + 1)}
        className="h-full w-full object-cover"
      />
      {!real && (
        <span className="absolute bottom-2 left-2 rounded-md bg-ink/72 px-1.5 py-0.5 text-[9.5px] font-medium tracking-wide text-white backdrop-blur-sm">
          Temsili görsel
        </span>
      )}
    </div>
  );
}
