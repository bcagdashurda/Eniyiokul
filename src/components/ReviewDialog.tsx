import { useEffect, useRef, useState } from 'react';
import type { Criteria, Review, School } from '../lib/types';
import { CRITERIA_LABELS, schoolId } from '../lib/types';
import { addReview, aggregate, averageOf } from '../lib/reviews';
import { n, rating, relTime, schoolName, shortAddress, telHref, titleCase } from '../lib/format';
import { Stars, StarInput } from './Stars';
import Crest from './Crest';
import PhoneVerify from './PhoneVerify';
import { useSession } from '../lib/auth';
import SchoolPhoto from './SchoolPhoto';
import { sponsorshipOf, TIERS } from '../lib/sponsors';

const EMPTY: Criteria = {
  akademik: 0, ogretmen: 0, imkanlar: 0, ucret: 0, iletisim: 0, sosyal: 0,
};

const RELATIONS = ['Veli', 'Mezun veli', 'Öğrenci', 'Mezun'];

export default function ReviewDialog({
  school,
  provinceSlug,
  reviews,
  onClose,
}: {
  school: School;
  provinceSlug: string;
  reviews: Review[];
  onClose: () => void;
}) {
  const [criteria, setCriteria] = useState<Criteria>(EMPTY);
  const [author, setAuthor] = useState('');
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const session = useSession();
  const id = schoolId(provinceSlug, school);
  const sp = sponsorshipOf(provinceSlug, school);
  const agg = aggregate(reviews);
  const filled = Object.values(criteria).filter((v) => v > 0).length;
  const live = filled > 0 ? Object.values(criteria).reduce((a, b) => a + b, 0) / filled : 0;

  /* Odak tuzağı + Escape */
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes?.length) return;
      const list = Array.from(nodes).filter((el) => el.offsetParent !== null);
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    // SMS sağlayıcısı henüz bağlanmadığı için doğrulama bu prototipte
    // akışı durdurmuyor; canlıda `session` zorunlu olacak.
    const missing = CRITERIA_LABELS.filter((c) => criteria[c.key] === 0);
    if (missing.length) {
      setError(`Şu başlıklar puanlanmadı: ${missing.map((m) => m.label).join(', ')}`);
      return;
    }
    setError(null);
    addReview({
      schoolId: id,
      author: author.trim() || 'İsimsiz veli',
      relation,
      criteria,
    });
    setCriteria(EMPTY);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/45 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rev-title"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        className="thin-scroll flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-[var(--shadow-float)] sm:rounded-2xl"
      >
        {/* Başlık */}
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex min-w-0 gap-3.5">
            <Crest name={school.ad} size={52} />
            <div className="min-w-0">
              <h2 id="rev-title" className="display-sm text-[19px] text-ink">
                {schoolName(school.ad)}
              </h2>
              <p className="mt-1 text-[13px] text-muted">
                {school.tur} · {titleCase(school.ilce)}
              </p>
              <p className="mt-1 text-[12.5px] text-muted-2">{shortAddress(school.adres)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {school.tel && (
              <a href={telHref(school.tel)} className="btn btn-outline hidden h-10 min-h-10 plate text-[13px] sm:inline-flex">
                {school.tel}
              </a>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="btn btn-outline h-10 w-10 min-h-10 !px-0"
              aria-label="Kapat"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="thin-scroll grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.1fr_1fr]">
          {/* Form */}
          <form onSubmit={submit} noValidate className="p-6 lg:border-r lg:border-line">
            {/* Puan yalnızca doğrulanmış hesaplardan alınır. */}
            {!session && !skipped && (
              <div className="mb-6">
                <PhoneVerify onDone={() => setError(null)} onSkip={() => setSkipped(true)} />
              </div>
            )}

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="display-sm text-[16px] text-ink">Bu okulu puanlayın</h3>
              {filled > 0 && (
                <span className="text-[12.5px] text-muted tnum">
                  {filled}/6 · ortalama <b className="text-ink">{rating(live)}</b>
                </span>
              )}
            </div>

            <div className="mt-4 divide-y divide-line-2 rounded-xl border border-line">
              {CRITERIA_LABELS.map((c) => (
                <div
                  key={c.key}
                  /* Sabit sütun: yıldızlar her satırda aynı hizada kalsın */
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-2"
                >
                  <div className="min-w-0">
                    <p id={`lbl-${c.key}`} className="text-[14px] font-semibold text-ink">
                      {c.label}
                    </p>
                    <p className="text-[11.5px] leading-snug text-muted">{c.hint}</p>
                  </div>
                  <StarInput
                    id={`lbl-${c.key}`}
                    label={c.label}
                    value={criteria[c.key]}
                    onChange={(v) => setCriteria((p) => ({ ...p, [c.key]: v }))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Adınız</span>
                <input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Boş bırakırsanız isimsiz yayınlanır"
                  className="field"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[13px] font-semibold text-ink">Okulla ilginiz</span>
                <select value={relation} onChange={(e) => setRelation(e.target.value)} className="field">
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>

            <p className="mt-4 rounded-xl border border-line bg-bg px-3.5 py-3 text-[13px] leading-relaxed text-muted">
              Yazılı yorum alınmıyor. Değerlendirme yalnızca bu altı başlıktaki
              puanlardan oluşuyor; böylece okullar aynı ölçütlerle karşılaştırılabiliyor.
            </p>

            {error && (
              <p role="alert" className="mt-3 rounded-lg border border-danger/25 bg-danger/8 px-3.5 py-2.5 text-[13px] text-danger">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="submit" className="btn btn-primary">
                Puanı yayınla
              </button>
              {session && (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ok">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  {session.masked} doğrulandı
                </span>
              )}
              {saved && (
                <span role="status" className="text-[13px] font-medium text-ok">
                  Yayınlandı, puan güncellendi.
                </span>
              )}
            </div>
          </form>

          {/* Mevcut puan */}
          <aside className="bg-bg p-6">
            {/* Sponsorlu okullarda galeri */}
            {sp && (
              <div className="mb-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="badge badge-sponsor">Sponsorlu · {TIERS[sp.tier].label}</span>
                </div>
                <SchoolPhoto img={sp.img} name={school.ad} className="mt-3" />
                {/* Yalnızca var olan galeri görselleri; boş kutu bırakılmaz */}
                <div className="mt-2">
                  <SchoolPhoto
                    img={sp.img}
                    file="01.jpg"
                    name={school.ad}
                    ratio="3 / 2"
                    rounded="rounded-lg"
                    hideIfMissing
                  />
                </div>
                <p className="mt-2.5 text-[13px] leading-relaxed text-muted">{sp.tagline}</p>
              </div>
            )}

            <h3 className="display-sm text-[16px] text-ink">Okulun puanı</h3>

            {agg ? (
              <>
                <div className="mt-4 flex items-center gap-4">
                  <span className="display text-[42px] leading-none text-ink tnum">
                    {rating(agg.average)}
                  </span>
                  <div>
                    <Stars value={agg.average} size={16} />
                    <p className="mt-1 text-[12.5px] text-muted tnum">
                      {n(agg.count)} değerlendirme
                    </p>
                  </div>
                </div>

                <dl className="mt-5 space-y-2.5">
                  {CRITERIA_LABELS.map((c) => {
                    const v = agg.perCriterion[c.key];
                    return (
                      <div key={c.key} className="flex items-center gap-3">
                        <dt className="w-[36%] shrink-0 text-[12.5px] text-muted">{c.label}</dt>
                        <dd className="flex flex-1 items-center gap-2.5">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-2">
                            <span
                              className="block h-full rounded-full bg-star"
                              style={{ width: `${(v / 5) * 100}%` }}
                            />
                          </span>
                          <span className="w-7 shrink-0 text-right text-[12px] font-semibold text-ink tnum">
                            {rating(v)}
                          </span>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line bg-surface p-5">
                <p className="text-[14px] font-semibold text-ink">Bu okul henüz puanlanmadı.</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  Okullar platforma puansız girer. Puan yalnızca velilerin
                  değerlendirmeleriyle oluşur. İlkini siz verebilirsiniz.
                </p>
              </div>
            )}

            {reviews.length > 0 && (
              <ul className="mt-6 space-y-3">
                {reviews.slice(0, 8).map((r) => (
                  <li key={r.id} className="rounded-xl border border-line bg-surface p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-ink">{r.author}</span>
                      <Stars value={averageOf(r.criteria)} size={12} />
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-muted-2">
                      {r.relation} · {relTime(r.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
