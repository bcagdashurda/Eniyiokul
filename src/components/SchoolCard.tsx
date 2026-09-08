import type { Review, School } from '../lib/types';
import { schoolId } from '../lib/types';
import {
  LEVEL_LABEL,
  levelOf,
  n,
  rating,
  schoolName,
  shortAddress,
  telHref,
  titleCase,
} from '../lib/format';
import { sponsorshipOf, TIERS } from '../lib/sponsors';
import { aggregate } from '../lib/reviews';
import { Stars } from './Stars';
import Crest from './Crest';
import SchoolPhoto from './SchoolPhoto';

const LEVEL_TONE: Record<string, string> = {
  anaokulu: 'text-brand-600 bg-brand-50 border-brand-200',
  ilkokul: 'text-brand-600 bg-brand-50 border-brand-200',
  ortaokul: 'text-brand-600 bg-brand-50 border-brand-200',
  lise: 'text-amber-700 bg-amber-50 border-amber-200',
  diger: 'text-muted bg-bg-2 border-line',
};

export default function SchoolCard({
  school,
  provinceSlug,
  reviews,
  onRate,
}: {
  school: School;
  provinceSlug: string;
  reviews: Review[];
  onRate: (s: School) => void;
}) {
  const sp = sponsorshipOf(provinceSlug, school);
  const agg = aggregate(reviews);
  const lvl = levelOf(school.tur);

  return (
    <article
      className={`group relative flex flex-col rounded-2xl border bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-card)] ${
        sp ? 'border-amber-200 ring-1 ring-amber/20' : 'border-line'
      }`}
    >
      {sp && (
        <div className="mb-3.5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="badge badge-sponsor">Sponsorlu · {TIERS[sp.tier].label}</span>
            <span className="text-[12.5px] text-muted">{sp.tagline}</span>
          </div>
          <SchoolPhoto img={sp.img} name={school.ad} />
        </div>
      )}

      <div className="flex items-start gap-3.5">
        {!sp && <Crest name={school.ad} size={46} />}

        <div className="min-w-0 flex-1">
          <h3 className="display-sm text-[16.5px] text-ink">{schoolName(school.ad)}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`badge border ${LEVEL_TONE[lvl]}`}>{LEVEL_LABEL[lvl]}</span>
            <span className="text-[12.5px] text-muted">{school.tur}</span>
          </div>
        </div>

        {/* Puan — okullar puansız başlar, bu normal bir durum */}
        <div className="shrink-0 text-right">
          {agg ? (
            <>
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[19px] font-bold text-ink tnum">{rating(agg.average)}</span>
                <Stars value={agg.average} size={13} />
              </div>
              <p className="mt-0.5 text-[11.5px] text-muted tnum">
                {n(agg.count)} değerlendirme
              </p>
            </>
          ) : (
            <span className="badge badge-neutral">Puanlanmadı</span>
          )}
        </div>
      </div>

      <p className="mt-3.5 flex-1 text-[13px] leading-relaxed text-muted">
        {shortAddress(school.adres)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-2 pt-4">
        <button
          type="button"
          onClick={() => onRate(school)}
          className="btn btn-outline h-10 min-h-10 text-[13.5px]"
        >
          {agg ? 'Değerlendir' : 'İlk değerlendirmeyi yap'}
        </button>
        {school.tel && (
          <a
            href={telHref(school.tel)}
            className="btn btn-quiet h-10 min-h-10 plate text-[13px]"
            aria-label={`Telefon: ${school.tel}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3Z" />
            </svg>
            {school.tel}
          </a>
        )}
        <span className="ml-auto text-[12px] text-muted-2">{titleCase(school.ilce)}</span>
      </div>

      <span className="sr-only">{schoolId(provinceSlug, school)}</span>
    </article>
  );
}
