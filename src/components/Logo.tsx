/**
 * Marka işareti.
 *
 * Fikir: harita iğnesi + mezuniyet kepi. İğne "yer", kepin eşkenar dörtgeni
 * "okul" demek; ikisi tek siluette birleşiyor.
 *
 * Kurallar: tek renk, gradyan yok, üç şekil. Böylece 16 px favicon'da da,
 * 96 px başlıkta da aynı okunuyor. Kep, iğnenin içinde boşluk (negatif alan)
 * olarak duruyor — ayrı bir renk gerekmiyor.
 */
export function LogoMark({
  size = 28,
  className = '',
  tone = 'var(--color-brand)',
}: {
  size?: number;
  className?: string;
  tone?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* İğne gövdesi — tek parça siluet */}
      <path
        d="M16 2.5c-6.2 0-11.2 4.9-11.2 11 0 3.6 2 7.3 4.6 10.4 2.3 2.8 4.8 5 5.9 5.9a1.1 1.1 0 0 0 1.4 0c1.1-.9 3.6-3.1 5.9-5.9 2.6-3.1 4.6-6.8 4.6-10.4 0-6.1-5-11-11.2-11Z"
        fill={tone}
      />
      {/* Kep — negatif alan */}
      <path d="M16 7.8 25 12.4l-9 4.6-9-4.6 9-4.6Z" fill="#fff" />
      {/* Kep bandı: kepin kep olduğunu belli eden tek ayrıntı */}
      <path
        d="M10.6 14.3v3.4c0 .4.2.7.5.9 1.4.9 3.1 1.4 4.9 1.4s3.5-.5 4.9-1.4c.3-.2.5-.5.5-.9v-3.4l-5.4 2.8-5.4-2.8Z"
        fill="#fff"
        fillOpacity="0.55"
      />
    </svg>
  );
}

/** İşaret + kelime markası. */
export default function Logo({
  size = 'md',
  onDark = false,
}: {
  size?: 'sm' | 'md';
  onDark?: boolean;
}) {
  const mark = size === 'sm' ? 26 : 30;
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={mark} tone={onDark ? 'var(--color-brand-300)' : 'var(--color-brand)'} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-bold tracking-[-0.035em] ${
            size === 'sm' ? 'text-[18px]' : 'text-[20px]'
          } ${onDark ? 'text-white' : 'text-ink'}`}
        >
          eniyi
          <span className={onDark ? 'text-brand-300' : 'text-brand'}>okul</span>
        </span>
        <span
          className={`label mt-1 text-[9px] tracking-[0.17em] ${
            onDark ? 'text-white/45' : 'text-muted-2'
          }`}
        >
          özel okul rehberi
        </span>
      </span>
    </span>
  );
}
