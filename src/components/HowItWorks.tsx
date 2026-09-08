import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { reveal, withMotion } from '../lib/motion';
import { CRITERIA_LABELS } from '../lib/types';

/* Bu gerçekten sıralı bir akış olduğu için numaralandırma bilgi taşıyor. */
const STEPS = [
  {
    t: 'Haritadan daraltın',
    d: 'İlden ilçeye inin. Her ilçe kendi okul sayısına göre boyalı; yoğunlaşmanın nerede olduğunu bir bakışta görürsünüz.',
  },
  {
    t: 'Listeyi süzün',
    d: 'Kademe, ilçe ve ada göre filtreleyin. Sponsorlu yerleşimler ayrı blokta durur, normal listeye karışmaz.',
  },
  {
    t: 'Puanınızı verin',
    d: 'Altı başlıkta puanlayın. Okullar puansız başlar; puan yalnızca velilerin verdiği notlarla oluşur.',
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => withMotion(() => {
      reveal('.hw-step', { trigger: '.hw-grid', y: 26, stagger: 0.09 });
      reveal('.hw-crit', { trigger: '.hw-crit-wrap', y: 16, stagger: 0.05 });
    }), root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="nasil" className="border-b border-line bg-surface" aria-labelledby="hw-title">
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
        <div className="max-w-[660px]">
          <p className="label text-brand">Nasıl çalışır</p>
          <h2 id="hw-title" className="display mt-3 text-[clamp(28px,3.6vw,42px)] text-ink">
            Tanıtım değil, veli deneyimi.
          </h2>
          <p className="pretty mt-4 text-[16px] leading-relaxed text-muted">
            Kurum bilgileri MEB’in resmî kayıtlarından gelir. Puanlar okuldan değil,
            o okula çocuğunu gönderen velilerden.
          </p>
        </div>

        <ol className="hw-grid mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.t} className="hw-step bg-surface p-6 lg:p-8">
              <span className="plate inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-[12px] text-brand-600">
                {i + 1}
              </span>
              <h3 className="display-sm mt-4 text-[19px] text-ink">{s.t}</h3>
              <p className="pretty mt-2.5 text-[14.5px] leading-relaxed text-muted">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="hw-crit-wrap mt-16 grid gap-10 lg:grid-cols-[360px_1fr]">
          <div>
            <p className="label text-brand">Puanlama</p>
            <h3 className="display mt-3 text-[clamp(22px,2.6vw,32px)] text-ink">
              Tek yıldız yerine altı başlık.
            </h3>
            <p className="pretty mt-3.5 text-[15px] leading-relaxed text-muted">
              Tek bir ortalama, okulun neyi iyi neyi zayıf yaptığını gizler. Her başlık
              ayrı puanlanır, ayrı gösterilir; ortalama bunların üzerinden hesaplanır.
            </p>
          </div>

          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {CRITERIA_LABELS.map((c) => (
              <li key={c.key} className="hw-crit bg-surface p-5">
                <p className="text-[15px] font-semibold text-ink">{c.label}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{c.hint}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
