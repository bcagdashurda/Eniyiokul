import { useEffect, useMemo, useState } from 'react';
import type { DistrictFile } from '../lib/useData';
import type { ProvinceFile } from '../lib/types';
import { bySlug, displayName, plateLabel } from '../lib/provinces';
import { LEVEL_LABEL, levelOf, n, titleCase } from '../lib/format';

const LEVEL_COLORS = ['#0e5c6b', '#3a919e', '#6fb5bf', '#b8791f', '#8996a0'];

export default function ProvincePanel({
  slug,
  detail,
  districts,
  loading,
  activeDistrict,
  onSelectDistrict,
  onClose,
  onBrowse,
}: {
  slug: string;
  detail: ProvinceFile | null;
  districts: DistrictFile | null;
  loading: boolean;
  activeDistrict: string | null;
  onSelectDistrict: (d: string | null) => void;
  onClose: () => void;
  onBrowse: () => void;
}) {
  const meta = bySlug(slug);

  /* Dar ekranda panel önce özet olarak açılır; haritayı kapatmasın diye
     ilçe listesi ancak istenince genişler. */
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  useEffect(() => setExpanded(false), [slug]);

  const showAll = wide || expanded;

  const levels = useMemo(() => {
    if (!detail) return [];
    const m = new Map<string, number>();
    detail.okullar.forEach((s) => {
      const l = levelOf(s.tur);
      m.set(l, (m.get(l) ?? 0) + 1);
    });
    return (['anaokulu', 'ilkokul', 'ortaokul', 'lise', 'diger'] as const)
      .map((k) => ({ k, label: LEVEL_LABEL[k], v: m.get(k) ?? 0 }))
      .filter((x) => x.v > 0);
  }, [detail]);

  const ranked = useMemo(
    () =>
      districts
        ? [...districts.features]
            .filter((f) => f.properties.okulSayisi > 0)
            .sort((a, b) => b.properties.okulSayisi - a.properties.okulSayisi)
        : [],
    [districts],
  );

  if (!meta) return null;
  const total = detail?.sayi ?? 0;
  const maxD = ranked[0]?.properties.okulSayisi ?? 1;

  return (
    <aside
      className="float thin-scroll flex h-full flex-col overflow-hidden rounded-2xl"
      aria-label={`${displayName(meta)} ili özeti`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="plate rounded border border-brand-200 bg-brand-50 px-1.5 py-0.5 text-[11px] text-brand-600">
              {plateLabel(meta)}
            </span>
            <span className="label text-muted-2">{meta.region}</span>
          </div>
          <h2 className="display mt-1.5 text-[26px] text-ink">{displayName(meta)}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline h-9 w-9 min-h-9 shrink-0 !px-0"
          aria-label="Türkiye görünümüne dön"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="space-y-2.5" aria-live="polite">
            <div className="h-16 animate-pulse rounded-xl bg-bg-2" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-bg-2" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="text-[14px] font-semibold text-ink">Kayıtlı özel okul yok</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {displayName(meta)} ilinde MEB'e kayıtlı faal özel öğretim kurumu bulunmamaktadır.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <Stat value={n(total)} label="Özel okul" />
              <Stat value={n(detail?.ilceler.length ?? 0)} label="İlçe" />
            </div>

            <div className={showAll ? 'mt-5' : 'hidden'}>
              <p className="label mb-2 text-muted-2">Kademe dağılımı</p>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-bg-2">
                {levels.map((l, i) => (
                  <span
                    key={l.k}
                    className="block h-full"
                    style={{ width: `${(l.v / total) * 100}%`, background: LEVEL_COLORS[i] }}
                  />
                ))}
              </div>
              <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
                {levels.map((l, i) => (
                  <li key={l.k} className="flex items-center gap-1.5 text-[12px] text-muted">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: LEVEL_COLORS[i] }}
                    />
                    {l.label} <span className="tnum font-medium text-ink">{n(l.v)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dar ekranda listeyi açma düğmesi */}
            {!wide && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-bg px-3.5 py-3 text-left"
              >
                <span className="text-[13.5px] font-semibold text-ink">
                  {expanded ? 'Ayrıntıyı gizle' : `${ranked.length} ilçeyi göster`}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-muted-2)"
                  strokeWidth="2.2"
                  style={{
                    transform: `rotate(${expanded ? 180 : 0}deg)`,
                    transition: 'transform 240ms var(--ease-out-soft)',
                  }}
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}

            <div className={showAll ? 'mt-5' : 'hidden'}>
              <div className="mb-2 flex items-center justify-between">
                <p className="label text-muted-2">İlçeler</p>
                {activeDistrict && (
                  <button
                    type="button"
                    onClick={() => onSelectDistrict(null)}
                    className="text-[12px] font-medium text-brand underline underline-offset-2"
                  >
                    Seçimi kaldır
                  </button>
                )}
              </div>
              <ul className="space-y-0.5">
                {ranked.map((f) => {
                  const pr = f.properties;
                  const on = pr.ad === activeDistrict;
                  return (
                    <li key={pr.ad}>
                      <button
                        type="button"
                        onClick={() => onSelectDistrict(on ? null : pr.ad)}
                        aria-pressed={on}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors ${
                          on ? 'bg-amber-50 ring-1 ring-amber/40' : 'hover:bg-bg-2'
                        }`}
                      >
                        <span className="flex-1 truncate text-[13.5px] font-medium text-ink">
                          {titleCase(pr.ad)}
                        </span>
                        <span className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-bg-2">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(pr.okulSayisi / maxD) * 100}%`,
                              background: on ? 'var(--color-amber)' : 'var(--color-brand)',
                            }}
                          />
                        </span>
                        <span className="w-8 shrink-0 text-right text-[12.5px] text-muted tnum">
                          {n(pr.okulSayisi)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </div>

      {total > 0 && !loading && (
        <div className="border-t border-line p-3.5">
          <button type="button" onClick={onBrowse} className="btn btn-primary w-full">
            {activeDistrict
              ? `${titleCase(activeDistrict)} okullarını gör`
              : `${n(total)} okulu listele`}
          </button>
        </div>
      )}
    </aside>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-bg px-3 py-2.5">
      <p className="display text-[24px] leading-none text-ink tnum">{value}</p>
      <p className="label mt-1.5 text-muted-2">{label}</p>
    </div>
  );
}
