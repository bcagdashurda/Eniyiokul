const STAR_PATH =
  'M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.44l-5.81 3.06L7.3 14.03 2.6 9.45l6.5-.95L12 2.6z';

/**
 * Puan göstergesi. Renk tek başına anlam taşımasın diye yıldızların
 * yanında her zaman sayısal değer de gösterilir (WCAG 1.4.1).
 */
export function Stars({
  value,
  size = 14,
  className = '',
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ height: size }}
      aria-hidden="true"
    >
      <Row size={size} color="var(--color-line)" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <Row size={size} color="var(--color-star)" />
      </span>
    </span>
  );
}

function Row({ size, color }: { size: number; color: string }) {
  return (
    <span className="flex gap-[2px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

const WORD = ['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Çok iyi'];

/** Etkileşimli puanlama — ok tuşlarıyla da değiştirilebilir. */
export function StarInput({
  value,
  onChange,
  label,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  id: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div
        role="radiogroup"
        aria-labelledby={id}
        className="flex items-center"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            onChange(Math.min(5, value + 1));
          }
          if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            onChange(Math.max(1, value - 1));
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const on = i <= value;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={value === i}
              aria-label={`${label}: ${i} yıldız — ${WORD[i]}`}
              tabIndex={value === i || (value === 0 && i === 1) ? 0 : -1}
              onClick={() => onChange(i)}
              className="grid h-10 w-7 place-items-center rounded-md transition-transform hover:scale-110 active:scale-95"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill={on ? 'var(--color-star)' : '#fff'}
                stroke={on ? 'var(--color-star)' : 'var(--color-muted-2)'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                <path d={STAR_PATH} />
              </svg>
            </button>
          );
        })}
      </div>
      <span
        className={`w-14 shrink-0 text-[12px] ${value ? 'font-medium text-ink' : 'text-muted-2'}`}
      >
        {value ? WORD[value] : '—'}
      </span>
    </div>
  );
}
