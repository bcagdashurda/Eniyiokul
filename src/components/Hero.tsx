import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { countUp, reveal, withMotion } from '../lib/motion';
import TurkeyMap, { RAMP } from './TurkeyMap';
import ProvincePanel from './ProvincePanel';
import type { DistrictFile, ProvinceGeo } from '../lib/useData';
import type { ProvinceFile, Summary } from '../lib/types';
import { bySlug, displayName } from '../lib/provinces';
import { n, titleCase } from '../lib/format';

type Props = {
  geo: ProvinceGeo;
  summary: Summary;
  activeSlug: string | null;
  detail: ProvinceFile | null;
  districts: DistrictFile | null;
  loadingDetail: boolean;
  activeDistrict: string | null;
  onSelectProvince: (s: string | null) => void;
  onSelectDistrict: (d: string | null) => void;
  onBrowse: () => void;
};

/* Başlık (72) + sponsor şeridi (44) */
const TOP = 116;

export default function Hero(p: Props) {
  const root = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  /* Panel geniş ekranda sağda, dar ekranda altta duruyor. */
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(
      () =>
        withMotion(() => {
          reveal('.h-bar', { trigger: root.current, y: 16, delay: 0.25, start: 'top bottom' });
          reveal('.h-stat', { trigger: root.current, y: 14, stagger: 0.07, delay: 0.35, start: 'top bottom' });
          // Sayı ilk ekranda olduğu için tetikleyici hemen çalışmalı.
          if (countRef.current) countUp(countRef.current, p.summary.toplamKurum, n, 'top bottom');
        }),
      root,
    );
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.summary.toplamKurum]);

  const meta = p.activeSlug ? bySlug(p.activeSlug) : null;
  const districtMax = p.districts
    ? Math.max(0, ...p.districts.features.map((d) => d.properties.okulSayisi))
    : 0;

  return (
    <section
      ref={root}
      id="harita"
      className="relative h-[100svh] min-h-[620px] w-full overflow-hidden"
      aria-label="Türkiye özel okul haritası"
    >
      <TurkeyMap
        geo={p.geo}
        summary={p.summary}
        activeSlug={p.activeSlug}
        districts={p.districts}
        activeDistrict={p.activeDistrict}
        onSelectProvince={p.onSelectProvince}
        onSelectDistrict={p.onSelectDistrict}
        /* Başlık, şerit, panel ve alt çubuk haritayı kırpmasın.
           Dar ekranda panel alttan açıldığı için boşluk sağdan değil alttan
           düşülüyor. */
        inset={
          wide
            ? { right: p.activeSlug ? 424 : 0, top: TOP, bottom: 92 }
            : { right: 0, top: TOP, bottom: p.activeSlug ? 300 : 92 }
        }
      />

      {/* İl paneli.
          Geniş ekranda sağda sütun, dar ekranda alttan açılan yaprak:
          telefonda haritayı tamamen kapatmasın diye. */}
      {p.activeSlug && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex max-h-[62%] items-end p-3 lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-full lg:max-w-[400px] lg:items-stretch lg:p-6"
        >
          <div className="pointer-events-auto w-full lg:pt-[140px] lg:pb-[92px]">
            <ProvincePanel
              slug={p.activeSlug}
              detail={p.detail}
              districts={p.districts}
              loading={p.loadingDetail}
              activeDistrict={p.activeDistrict}
              onSelectDistrict={p.onSelectDistrict}
              onClose={() => p.onSelectProvince(null)}
              onBrowse={p.onBrowse}
            />
          </div>
        </div>
      )}

      {/* Sol üst: seçili ilde geri dönüş izi (breadcrumb) */}
      {meta && (
        <div className="pointer-events-none absolute left-0 z-30 px-4 sm:px-6" style={{ top: TOP + 12 }}>
          <nav className="float pointer-events-auto flex items-center gap-1 rounded-xl px-2 py-1.5 text-[13px]" aria-label="Konum">
            <button
              type="button"
              onClick={() => p.onSelectProvince(null)}
              className="rounded-lg px-2.5 py-1.5 font-medium text-muted hover:bg-bg-2 hover:text-ink"
            >
              Türkiye
            </button>
            <Chevron />
            <span className="px-2.5 py-1.5 font-semibold text-ink">{displayName(meta)}</span>
            {p.activeDistrict && (
              <>
                <Chevron />
                <button
                  type="button"
                  onClick={() => p.onSelectDistrict(null)}
                  className="rounded-lg bg-amber-50 px-2.5 py-1.5 font-semibold text-amber-700 hover:bg-amber-50/70"
                >
                  {titleCase(p.activeDistrict)}
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Alt şerit: lejant + sayılar. Panel açıkken dar ekranda gizlenir. */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-4 sm:px-6 sm:pb-5 ${
          p.activeSlug ? 'hidden lg:block' : ''
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-3">
          <div className="h-bar float pointer-events-auto hidden rounded-xl px-3.5 py-2.5 sm:block">
            <p className="label text-muted-2">
              {p.activeSlug ? 'İlçedeki okul sayısı' : 'İldeki okul sayısı'}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[11px] text-muted tnum">0</span>
              <span className="flex h-2 w-[128px] overflow-hidden rounded-full">
                {RAMP.map((c) => (
                  <span key={c} className="h-full flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="text-[11px] text-muted tnum">
                {n(p.activeSlug ? districtMax : 3518)}
              </span>
            </div>
          </div>

          {!p.activeSlug && (
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              {/* Sayfanın tek h1'i burada: harita başlığı örtmesin diye
                  başlık, sayının kendisi olarak duruyor. */}
              <h1 className="h-stat float m-0 rounded-xl px-3.5 py-2.5 font-normal">
                <span
                  ref={countRef}
                  className="display text-[19px] text-ink tnum"
                  aria-label={`${n(p.summary.toplamKurum)} özel okul`}
                >
                  {n(p.summary.toplamKurum)}
                </span>
                <span className="ml-1.5 text-[12.5px] text-muted">
                  özel okul, tek haritada
                </span>
              </h1>
              {[
                { v: '81', l: 'il' },
                { v: '973', l: 'ilçe' },
              ].map((s) => (
                <div key={s.l} className="h-stat float hidden rounded-xl px-3.5 py-2.5 sm:block">
                  <span className="display text-[19px] text-ink tnum">{s.v}</span>
                  <span className="ml-1.5 text-[12.5px] text-muted">{s.l}</span>
                </div>
              ))}
              <button type="button" onClick={p.onBrowse} className="btn btn-primary h-[46px] min-h-[46px]">
                Okulları listele
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="scroll-cue" aria-hidden="true">
                  <path d="M12 5v14m0 0-6-6m6 6 6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted-2)" strokeWidth="2" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
