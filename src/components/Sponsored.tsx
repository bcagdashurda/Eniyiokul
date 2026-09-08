import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { reveal, withMotion } from '../lib/motion';
import { PLACEMENTS, TIERS } from '../lib/sponsors';
import { bySlug, displayName, plateLabel } from '../lib/provinces';
import { schoolName, titleCase } from '../lib/format';
import { PATHS } from '../lib/router';
import SchoolPhoto from './SchoolPhoto';

export default function Sponsored({
  onOpen,
}: {
  onOpen: (provinceSlug: string, ilce: string, ad: string) => void;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => withMotion(() => {
      reveal('.sp-head', { trigger: root.current, y: 20, start: 'top 84%' });
      reveal('.sp-card', { trigger: '.sp-grid', y: 30, stagger: 0.08 });
    }), root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="one-cikan"
      className="border-b border-line bg-surface py-20 lg:py-24"
      aria-labelledby="sp-title"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="sp-head flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[620px]">
            <p className="label text-amber-700">Sponsorlu yerleşim</p>
            <h2 id="sp-title" className="display mt-3 text-[clamp(28px,3.6vw,42px)] text-ink">
              Öne çıkan okullar
            </h2>
            <p className="pretty mt-3 text-[15.5px] leading-relaxed text-muted">
              Bu bölümdeki sıralama ücretlidir ve okulun puanıyla ilgisi yoktur.
              Puanlar yalnızca velilerin verdiği notlardan oluşur.
            </p>
          </div>
          <a
            href={PATHS.schools}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
          >
            Okul sahibi misiniz?
          </a>
        </div>

        <div className="sp-grid mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLACEMENTS.map((p) => {
            const meta = bySlug(p.province);
            if (!meta) return null;
            const tier = TIERS[p.tier];
            const platin = p.tier === 'platin';
            return (
              <button
                key={p.ad}
                type="button"
                onClick={() => onOpen(p.province, p.ilce, p.ad)}
                className={`sp-card group flex flex-col rounded-2xl border bg-surface p-5 text-left transition-shadow hover:shadow-[var(--shadow-card)] ${
                  platin ? 'border-amber-200 ring-1 ring-amber/20' : 'border-line'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="badge badge-sponsor">Sponsorlu · {tier.label}</span>
                  <span className="plate text-[12px] text-muted-2">
                    {plateLabel(meta)} · {displayName(meta)}
                  </span>
                </div>

                <SchoolPhoto img={p.img} name={p.ad} className="mt-3.5" />

                <div className="mt-3.5 min-w-0">
                  <h3 className="display-sm text-[17px] text-ink group-hover:text-brand">
                    {schoolName(p.ad)}
                  </h3>
                  <p className="mt-1 text-[12.5px] text-muted-2">{titleCase(p.ilce)}</p>
                </div>

                <p className="pretty mt-3.5 flex-1 text-[13.5px] leading-relaxed text-muted">
                  {p.tagline}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 border-t border-line-2 pt-3.5 text-[13.5px] font-semibold text-brand">
                  Okulu incele
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14m0 0-6-6m6 6-6 6" />
                  </svg>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
