import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Summary } from '../lib/types';
import { PROVINCES, bySlug, displayName, plateLabel } from '../lib/provinces';
import { LEVEL_LABEL, n, schoolName, titleCase } from '../lib/format';

/** search-index.json: [ad, ilIndex, ilçe, kademe] */
type Row = [string, number, string, number];
type Index = { iller: string[]; okullar: Row[] };

const LEVELS = ['anaokulu', 'ilkokul', 'ortaokul', 'lise', 'diger'] as const;

/* İndeks bir kez yüklenir ve tüm arama kutuları paylaşır. */
let indexCache: Index | null = null;
let indexPromise: Promise<Index> | null = null;

function loadIndex() {
  if (indexCache) return Promise.resolve(indexCache);
  if (!indexPromise) {
    indexPromise = fetch('data/search-index.json')
      .then((r) => r.json() as Promise<Index>)
      .then((d) => {
        indexCache = d;
        return d;
      })
      .catch(() => ({ iller: [], okullar: [] }));
  }
  return indexPromise;
}

/** Türkçe'ye duyarlı, aksan bağımsız arama anahtarı. */
function norm(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

type Hit =
  | { kind: 'il'; slug: string; label: string; sub: string; plate: string }
  | { kind: 'okul'; slug: string; ad: string; ilce: string; label: string; sub: string };

export default function ProvinceSearch({
  summary,
  onPick,
  onOpenSchool,
  compact = false,
}: {
  summary: Summary;
  onPick: (slug: string) => void;
  onOpenSchool?: (provinceSlug: string, ilce: string, ad: string) => void;
  compact?: boolean;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [index, setIndex] = useState<Index | null>(indexCache);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const counts = useMemo(
    () => new Map(summary.iller.map((i) => [i.slug, i.sayi])),
    [summary],
  );

  /* İndeks ilk yazışta gelsin — açılışta 0,7 MB indirmeye gerek yok. */
  useEffect(() => {
    if (q.length >= 2 && !index) void loadIndex().then(setIndex);
  }, [q, index]);

  const hits = useMemo<Hit[]>(() => {
    const t = norm(q.trim());
    if (t.length < 1) return [];

    const iller: Hit[] = PROVINCES.filter((p) => {
      const nm = norm(displayName(p));
      return nm.includes(t) || plateLabel(p) === t || String(p.plate) === t;
    })
      .sort((a, b) => {
        const an = norm(displayName(a)).startsWith(t) ? 0 : 1;
        const bn = norm(displayName(b)).startsWith(t) ? 0 : 1;
        return an - bn || (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0);
      })
      .slice(0, 3)
      .map((p) => ({
        kind: 'il' as const,
        slug: p.slug,
        label: displayName(p),
        sub: `${n(counts.get(p.slug) ?? 0)} okul · ${p.region}`,
        plate: plateLabel(p),
      }));

    let okullar: Hit[] = [];
    if (index && t.length >= 2) {
      const scored: { row: Row; score: number }[] = [];
      for (const row of index.okullar) {
        const nm = norm(row[0]);
        const at = nm.indexOf(t);
        if (at === -1) continue;
        // Kelime başından eşleşme daha alakalı
        const wordStart = at === 0 || nm[at - 1] === ' ';
        scored.push({ row, score: (wordStart ? 0 : 100) + at });
        if (scored.length > 400) break;
      }
      scored.sort((a, b) => a.score - b.score);
      okullar = scored.slice(0, 7).map(({ row }) => {
        const slug = index.iller[row[1]];
        const meta = bySlug(slug);
        return {
          kind: 'okul' as const,
          slug,
          ad: row[0],
          ilce: row[2],
          label: schoolName(row[0]),
          sub: `${LEVEL_LABEL[LEVELS[row[3]]]} · ${titleCase(row[2])}${
            meta ? `, ${displayName(meta)}` : ''
          }`,
        };
      });
    }

    return [...iller, ...okullar];
  }, [q, index, counts]);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (h: Hit) => {
    if (h.kind === 'il') onPick(h.slug);
    else if (onOpenSchool) onOpenSchool(h.slug, h.ilce, h.ad);
    else onPick(h.slug);
    setQ('');
    setOpen(false);
  };

  const loading = q.trim().length >= 2 && !index;
  const firstSchool = hits.findIndex((h) => h.kind === 'okul');

  return (
    <div ref={boxRef} className="relative w-full">
      <label htmlFor={listId + '-in'} className="sr-only">
        Okul veya il ara
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border border-line bg-bg px-3 transition-colors focus-within:border-brand focus-within:bg-surface focus-within:shadow-[0_0_0_3px_var(--color-brand-50)] ${
          compact ? 'h-10' : 'h-11'
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-2)" strokeWidth="2" aria-hidden="true" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={listId + '-in'}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            void loadIndex().then(setIndex);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setCursor((c) => Math.min(hits.length - 1, c + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setCursor((c) => Math.max(0, c - 1));
            } else if (e.key === 'Enter' && hits[cursor]) {
              e.preventDefault();
              choose(hits[cursor]);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          placeholder="Okul veya il ara…"
          autoComplete="off"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full bg-transparent text-[14px] text-ink placeholder:text-muted-2 focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="shrink-0 rounded p-1 text-muted-2 hover:text-ink"
            aria-label="Aramayı temizle"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && (hits.length > 0 || loading || q.trim().length >= 2) && (
        <div className="float absolute z-50 mt-1.5 w-[min(460px,90vw)] overflow-hidden rounded-xl">
          {hits.length > 0 && (
            <ul id={listId} role="listbox" className="max-h-[400px] overflow-y-auto py-1">
              {hits.map((h, i) => (
                <li key={`${h.kind}-${h.slug}-${h.kind === 'okul' ? h.ad : ''}`}>
                  {i === 0 && h.kind === 'il' && <Group>İller</Group>}
                  {i === firstSchool && <Group>Okullar</Group>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(h)}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left ${
                      i === cursor ? 'bg-brand-50' : ''
                    }`}
                  >
                    {h.kind === 'il' ? (
                      <span className="plate w-7 shrink-0 rounded border border-line bg-surface py-0.5 text-center text-[11px] text-muted">
                        {h.plate}
                      </span>
                    ) : (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-bg-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2" aria-hidden="true">
                          <path d="M3 10 12 5l9 5-9 5-9-5Z" />
                          <path d="M7 12.5V17c0 1 2.2 2 5 2s5-1 5-2v-4.5" />
                        </svg>
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium text-ink">
                        {h.label}
                      </span>
                      <span className="block truncate text-[12px] text-muted">{h.sub}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {hits.length === 0 && !loading && q.trim().length >= 2 && (
            <div className="px-4 py-4 text-center">
              <p className="text-[13.5px] font-semibold text-ink">Eşleşen okul veya il bulunamadı</p>
              <p className="mt-1 text-[12px] text-muted">
                İl adı veya kurum adının yazımını kontrol edebilirsiniz.
              </p>
            </div>
          )}

          {loading && (
            <p className="border-t border-line px-3 py-2 text-[12.5px] text-muted" aria-live="polite">
              Okul listesi yükleniyor…
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <p className="label px-3 pb-1 pt-2 text-muted-2">{children}</p>
  );
}
