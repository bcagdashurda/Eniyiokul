import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { reveal, withMotion } from '../lib/motion';
import { TIERS, TIER_ORDER } from '../lib/sponsors';
import { PROVINCES, displayName } from '../lib/provinces';

export default function Pricing() {
  const root = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [tier, setTier] = useState<string>('platin');

  useEffect(() => {
    const ctx = gsap.context(() => withMotion(() => {
      reveal('.pr-card', { trigger: '.pr-grid', y: 28, stagger: 0.08 });
    }), root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="sponsorluk" className="rule-grid border-b border-line bg-bg" aria-labelledby="pr-title">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-[680px]">
          <p className="label text-brand">Okullar için</p>
          <h2 id="pr-title" className="display mt-3 text-[clamp(28px,3.6vw,42px)] text-ink">
            Sıranızı siz belirleyin, puanınızı veliler.
          </h2>
          <p className="pretty mt-4 text-[16px] leading-relaxed text-muted">
            Sponsorluk, okulunuzun listede nerede durduğunu belirler. Puanınız ise
            doğrulanmış velilerin altı başlıkta verdiği notlardan oluşur. Her
            sponsorlu yerleşim kullanıcıya açıkça etiketlenir.
          </p>
        </div>

        <div className="pr-grid mt-12 grid items-stretch gap-5 lg:grid-cols-3">
          {TIER_ORDER.map((t) => {
            const tr = TIERS[t];
            const featured = t === 'platin';
            return (
              <article
                key={t}
                className={`pr-card relative flex flex-col rounded-2xl p-6 lg:p-7 ${
                  featured
                    ? 'bg-ink text-white shadow-[0_24px_60px_-28px_rgba(15,27,36,.55)]'
                    : 'border border-line bg-surface'
                }`}
              >
                {featured && (
                  <span className="badge absolute right-6 top-6 border border-white/25 bg-white/10 text-amber-200">
                    En çok tercih edilen
                  </span>
                )}

                <h3 className={`display text-[24px] ${featured ? 'text-white' : 'text-ink'}`}>
                  {tr.label}
                </h3>
                <p
                  className={`pretty mt-2 text-[13.5px] leading-relaxed ${
                    featured ? 'text-white/70' : 'text-muted'
                  }`}
                >
                  {tr.blurb}
                </p>

                <p
                  className={`label mt-5 inline-flex w-fit rounded-full px-2.5 py-1.5 ${
                    featured ? 'bg-white/10 text-amber-200' : 'bg-brand-50 text-brand-600'
                  }`}
                >
                  {tr.slots}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {tr.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={featured ? 'var(--color-amber-200)' : 'var(--color-brand)'}
                        strokeWidth="2.6"
                        className="mt-1 shrink-0"
                        aria-hidden="true"
                      >
                        <path d="m4 12.5 5 5L20 6.5" />
                      </svg>
                      <span className={`text-[14px] leading-snug ${featured ? 'text-white/90' : 'text-ink'}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    setTier(t);
                    document.getElementById('teklif')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    window.setTimeout(() => document.getElementById('okul-adi')?.focus(), 500);
                  }}
                  className={`btn mt-7 w-full ${featured ? 'btn-amber' : 'btn-outline'}`}
                >
                  {tr.label} için teklif alın
                </button>
              </article>
            );
          })}
        </div>

        {/* Teklif formu — fiyat açıkta değil, okul iletişime geçer */}
        <div id="teklif" className="mt-14 overflow-hidden rounded-2xl border border-line bg-surface">
          <div className="grid lg:grid-cols-[1fr_1.15fr]">
            <div className="border-b border-line p-7 lg:border-b-0 lg:border-r lg:p-9">
              <h3 className="display text-[26px] text-ink">Size özel teklif hazırlayalım</h3>
              <p className="pretty mt-3 text-[15px] leading-relaxed text-muted">
                Fiyat; ilin büyüklüğüne, seçtiğiniz kademeye ve kontenjan durumuna göre
                değişir. Formu doldurun, iki iş günü içinde uygun paketleri ve
                fiyatlandırmayı paylaşalım.
              </p>

              <dl className="mt-7 space-y-4">
                {[
                  ['Kontenjan sınırlı', 'Her il ve ilçede belirli sayıda yerleşim açılır; boş kontenjanı size bildiririz.'],
                  ['Sözleşme öncesi deneme', 'İlk ay performans raporunu görüp devam kararı verirsiniz.'],
                  ['Puanlar tamamen bağımsızdır', 'Sponsorluk yalnızca görünürlük sağlar; velilerin verdiği 6 başlıktaki değerlendirme puanlarını hiçbir şekilde etkilemez.'],
                ].map(([t, d]) => (
                  <div key={t} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <div>
                      <dt className="text-[14px] font-semibold text-ink">{t}</dt>
                      <dd className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{d}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            <form
              className="p-7 lg:p-9"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">Okul adı</span>
                  <input id="okul-adi" required className="field" placeholder="Örn. Özel Nilüfer Koleji" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">Yetkili adı</span>
                  <input required className="field" placeholder="Ad Soyad" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">Telefon</span>
                  <input required type="tel" className="field" placeholder="0 5xx xxx xx xx" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">E-posta</span>
                  <input required type="email" className="field" placeholder="ad@okul.k12.tr" />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">İl</span>
                  <select required className="field" defaultValue="">
                    <option value="" disabled>
                      Seçiniz
                    </option>
                    {PROVINCES.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {displayName(p)}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset className="sm:col-span-2">
                  <legend className="mb-2 text-[13px] font-semibold text-ink">
                    İlgilendiğiniz paket
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {TIER_ORDER.map((t) => (
                      <label
                        key={t}
                        className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-[14px] font-medium transition-colors ${
                          tier === t
                            ? 'border-brand bg-brand text-white'
                            : 'border-line bg-surface text-ink hover:border-muted-2'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paket"
                          value={t}
                          checked={tier === t}
                          onChange={() => setTier(t)}
                          className="sr-only"
                        />
                        {TIERS[t].label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[13px] font-semibold text-ink">
                    Not <span className="font-normal text-muted">(isteğe bağlı)</span>
                  </span>
                  <textarea
                    rows={3}
                    className="field h-auto resize-y py-3 leading-relaxed"
                    placeholder="Hedeflediğiniz ilçeler, kademe veya kampanya dönemi"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="submit" className="btn btn-primary">
                  Teklif isteyin
                </button>
                {sent && (
                  <span role="status" className="text-[13.5px] font-medium text-ok">
                    Talebiniz alındı, iki iş günü içinde dönüş yapılacak.
                  </span>
                )}
              </div>

              <p className="mt-4 text-[12px] leading-relaxed text-muted-2">
                Formu göndererek iletişim bilgilerinizin teklif hazırlığı amacıyla
                işlenmesine izin vermiş olursunuz.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
