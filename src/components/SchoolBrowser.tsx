import { useEffect, useMemo, useState } from 'react';
import type { ProvinceFile, Review, School } from '../lib/types';
import { schoolId } from '../lib/types';
import { LEVEL_LABEL, levelOf, n, titleCase } from '../lib/format';
import { withSponsoredFirst } from '../lib/sponsors';
import { aggregate } from '../lib/reviews';
import { PROVINCES, displayName, plateLabel } from '../lib/provinces';
import SchoolCard from './SchoolCard';

const PAGE = 18;
const LEVELS = ['anaokulu', 'ilkokul', 'ortaokul', 'lise', 'diger'] as const;
type Level = (typeof LEVELS)[number];
type Sort = 'puan' | 'ad' | 'ilce';

const QUICK = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'kocaeli', 'konya', 'adana'];

export default function SchoolBrowser({
  slug,
  detail,
  loading,
  activeDistrict,
  reviews,
  onSelectProvince,
  onSelectDistrict,
  onRate,
}: {
  slug: string | null;
  detail: ProvinceFile | null;
  loading: boolean;
  activeDistrict: string | null;
  reviews: Review[];
  onSelectProvince: (s: string) => void;
  onSelectDistrict: (d: string | null) => void;
  onRate: (s: School) => void;
}) {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [sort, setSort] = useState<Sort>('puan');
  const [shown, setShown] = useState(PAGE);

  useEffect(() => setShown(PAGE), [slug, activeDistrict, q, level, sort]);

  const byId = useMemo(() => {
    const m = new Map<string, Review[]>();
    reviews.forEach((r) => {
      const arr = m.get(r.schoolId);
      if (arr) arr.push(r);
      else m.set(r.schoolId, [r]);
    });
    return m;
  }, [reviews]);

  const filtered = useMemo(() => {
    if (!detail) return [];
    const t = q.trim().toLocaleLowerCase('tr-TR');
    let list = detail.okullar;
    if (activeDistrict) list = list.filter((s) => s.ilce === activeDistrict);
    if (level) list = list.filter((s) => levelOf(s.tur) === level);
    if (t) {
      list = list.filter(
        (s) =>
          s.ad.toLocaleLowerCase('tr-TR').includes(t) ||
          s.adres.toLocaleLowerCase('tr-TR').includes(t),
      );
    }
    return list;
  }, [detail, activeDistrict, level, q]);

  const { sponsored, rest } = useMemo(
    () => (slug ? withSponsoredFirst(slug, filtered) : { sponsored: [], rest: filtered }),
    [slug, filtered],
  );

  const sortedRest = useMemo(() => {
    if (!slug) return rest;
    const arr = [...rest];
    if (sort === 'ad') arr.sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    else if (sort === 'ilce')
      arr.sort((a, b) => a.ilce.localeCompare(b.ilce, 'tr') || a.ad.localeCompare(b.ad, 'tr'));
    else
      arr.sort((a, b) => {
        const ra = aggregate(byId.get(schoolId(slug, a)) ?? [])?.average ?? -1;
        const rb = aggregate(byId.get(schoolId(slug, b)) ?? [])?.average ?? -1;
        return rb - ra || a.ad.localeCompare(b.ad, 'tr');
      });
    return arr;
  }, [rest, sort, slug, byId]);

  const levelCounts = useMemo(() => {
    const m = new Map<Level, number>();
    if (!detail) return m;
    const base = activeDistrict
      ? detail.okullar.filter((s) => s.ilce === activeDistrict)
      : detail.okullar;
    base.forEach((s) => {
      const l = levelOf(s.tur);
      m.set(l, (m.get(l) ?? 0) + 1);
    });
    return m;
  }, [detail, activeDistrict]);

  const meta = slug ? PROVINCES.find((p) => p.slug === slug) : null;

  return (
    <section id="okullar" className="border-b border-line bg-bg py-20 lg:py-24" aria-labelledby="ok-title">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label text-brand">Okul listesi</p>
            <h2 id="ok-title" className="display mt-3 text-[clamp(28px,3.6vw,42px)] text-ink">
              {meta ? displayName(meta) : 'Önce bir il seçin'}
              {activeDistrict && <span className="text-muted"> · {titleCase(activeDistrict)}</span>}
            </h2>
            {meta && (
              <p className="mt-2.5 text-[15px] text-muted tnum">
                {n(filtered.length)} okul listeleniyor
                {activeDistrict
                  ? ` · ${displayName(meta)} genelinde ${n(detail?.sayi ?? 0)} okul var`
                  : ''}
              </p>
            )}
          </div>

          {activeDistrict && (
            <button type="button" onClick={() => onSelectDistrict(null)} className="btn btn-outline">
              İl geneline dön
            </button>
          )}
        </div>

        {/* İl seçilmediyse hızlı seçim */}
        {!slug && (
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
            <p className="text-[14px] text-muted">
              Haritadan bir il seçin ya da buradan hızlıca başlayın:
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {QUICK.map((s) => {
                const m = PROVINCES.find((p) => p.slug === s)!;
                return (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => onSelectProvince(s)}
                      className="btn btn-outline h-11 min-h-11"
                    >
                      <span className="plate text-[11.5px] text-brand">{plateLabel(m)}</span>
                      {displayName(m)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {slug && (
          <>
            {/* Filtre çubuğu */}
            <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-line bg-bg/92 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--color-brand-50)] sm:max-w-[300px]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-2)" strokeWidth="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <span className="sr-only">Okul adı veya adreste ara</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Okul adı veya adres"
                    className="w-full bg-transparent text-[14px] text-ink placeholder:text-muted-2 focus:outline-none"
                  />
                </label>

                <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Kademe filtresi">
                  <Chip on={level === null} onClick={() => setLevel(null)}>
                    Tümü <b className="tnum font-semibold opacity-60">{n(filtered.length)}</b>
                  </Chip>
                  {LEVELS.filter((l) => (levelCounts.get(l) ?? 0) > 0).map((l) => (
                    <Chip key={l} on={level === l} onClick={() => setLevel(level === l ? null : l)}>
                      {LEVEL_LABEL[l]}{' '}
                      <b className="tnum font-semibold opacity-60">{n(levelCounts.get(l) ?? 0)}</b>
                    </Chip>
                  ))}
                </div>

                <label className="ml-auto flex items-center gap-2 text-[13px] text-muted">
                  <span className="hidden sm:inline">Sırala</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as Sort)}
                    className="field h-11 w-auto pr-8 text-[13.5px]"
                  >
                    <option value="puan">Puana göre</option>
                    <option value="ad">Ada göre</option>
                    <option value="ilce">İlçeye göre</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Sponsorlu blok */}
            {sponsored.length > 0 && (
              <div className="mt-8">
                <p className="label mb-3 text-amber-700">
                  Öne çıkan okullar · Sponsorlu yerleşim
                </p>
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                  {sponsored.map((s) => (
                    <SchoolCard
                      key={s.ad + s.ilce}
                      school={s}
                      provinceSlug={slug}
                      reviews={byId.get(schoolId(slug, s)) ?? []}
                      onRate={onRate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Liste */}
            <div className="mt-8">
              {sponsored.length > 0 && <p className="label mb-3 text-muted-2">Tüm okullar</p>}

              {loading ? (
                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3" aria-live="polite">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-52 animate-pulse rounded-2xl border border-line bg-surface" />
                  ))}
                </div>
              ) : sortedRest.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-surface p-12 text-center">
                  <p className="display-sm text-[18px] text-ink">Sonuç bulunamadı</p>
                  <p className="mt-2 text-[14px] text-muted">
                    Aramayı sadeleştirin veya kademe filtresini kaldırın.
                  </p>
                  {(q || level !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setQ('');
                        setLevel(null);
                      }}
                      className="btn btn-outline mt-4"
                    >
                      Filtreleri temizle
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {sortedRest.slice(0, shown).map((s) => (
                      <SchoolCard
                        key={s.ad + s.ilce + s.adres}
                        school={s}
                        provinceSlug={slug}
                        reviews={byId.get(schoolId(slug, s)) ?? []}
                        onRate={onRate}
                      />
                    ))}
                  </div>
                  {shown < sortedRest.length && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setShown((v) => v + PAGE * 2)}
                        className="btn btn-outline"
                      >
                        {n(sortedRest.length - shown)} okul daha göster
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-[13.5px] font-medium transition-colors ${
        on
          ? 'border-brand bg-brand text-white'
          : 'border-line bg-surface text-ink hover:border-muted-2'
      }`}
    >
      {children}
    </button>
  );
}
