import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PATHS } from '../lib/router';

gsap.registerPlugin(ScrollTrigger);

/**
 * Güven bölümü.
 *
 * Odak: puan vermenin SMS doğrulaması istemesi. Bu, platformun puanını
 * benzerlerinden ayıran tek mekanizma olduğu için başlıkta vurgulanıyor.
 *
 * Görsel karar: telefon mockup'ı denendi ve bırakıldı — oran tutmadığı için
 * akıllı saat gibi okunuyordu. Yerine açık zeminde tek bir koyu nesne var:
 * kural panosu. Metafor kurmaya çalışmadığı için yarım kalmıyor.
 *
 * Kitle veli olduğu için kaydırmaya bağlı sahne de yok; bölüm görününce
 * içerik yarım saniyede yerine oturuyor ve orada kalıyor.
 */
const CLAIMS = [
  'Doğrulanmamış hesap puan veremez.',
  'Aynı numara aynı okula ikinci kez puan veremez.',
  'Numara maskelenerek saklanır, hiçbir ekranda tam görünmez.',
  'Pazarlama amacıyla kullanılmaz, üçüncü taraflara verilmez.',
];

/* Panoda gösterilen kural durumları */
const RULES: { t: string; s: 'ok' | 'blocked' }[] = [
  { t: 'Doğrulanmış hesap', s: 'ok' },
  { t: 'Aynı okula ikinci puan', s: 'blocked' },
  { t: 'Doğrulanmamış hesap', s: 'blocked' },
];

const POINTS = [
  {
    t: 'Puan tek kaynaktan gelir',
    d: 'Bütün okullar puansız başlar. Ortalamayı oluşturan tek şey, doğrulanmış velilerin verdiği notlardır.',
  },
  {
    t: 'Altı ayrı başlık',
    d: 'Tek yıldız yerine akademikten servise altı ölçüt, hepsi ayrı ayrı gösterilir.',
  },
  {
    t: 'Kaç kişi puanladı, hep görünür',
    d: 'Üç kişilik ortalamayla iki yüz kişilik ortalama aynı şey değil. Sayı her zaman yanında.',
  },
];

export default function TrustBand() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top 72%', once: true },
          defaults: { ease: 'expo.out' },
        });

        tl.from('.tb-head', { opacity: 0, y: 20, duration: 0.55 })
          .from('.tb-claim', { opacity: 0, x: -12, duration: 0.45, stagger: 0.06 }, '-=0.3')
          .from('.tb-panel', { opacity: 0, y: 26, duration: 0.7 }, '-=0.55')
          .from('.tb-rule', { opacity: 0, x: 14, duration: 0.4, stagger: 0.09 }, '-=0.4')
          .from('.tb-seal', { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2.4)' }, '-=0.35');

        gsap.from('.tb-point', {
          opacity: 0,
          y: 20,
          duration: 0.5,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.tb-points', start: 'top 88%', once: true },
        });
      });

      return () => mm.revert();
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    /* Zemin ritmi: okul listesi gri, vitrin beyaz, güven gri, footer koyu. */
    <section ref={root} id="guven" className="border-b border-line bg-bg" aria-labelledby="tb-title">
      <div className="relative overflow-hidden">
        {/* Zemin dokusu — kenarlara doğru eriyen ince ızgara */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 75% 55% at 50% 50%, #000, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 55% at 50% 50%, #000, transparent)',
            opacity: 0.6,
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_minmax(0,400px)] lg:gap-20">
            {/* Anlatım */}
            <div>
              <div className="tb-head">
                <p className="label text-brand">Güvenilirlik</p>

                <h2
                  id="tb-title"
                  className="display mt-4 max-w-[16ch] text-[clamp(30px,4.4vw,54px)] text-ink"
                >
                  Puan vermek{' '}
                  <span className="relative whitespace-nowrap">
                    <span className="relative z-10">SMS doğrulaması</span>
                    {/* Vurgu: altı çizili değil, arkası dolgulu — daha sakin */}
                    <span
                      className="absolute inset-x-0 bottom-[0.1em] -z-0 h-[0.34em] rounded-sm bg-brand-100"
                      aria-hidden="true"
                    />
                  </span>{' '}
                  ister.
                </h2>

                <p className="pretty mt-6 max-w-[520px] text-[16.5px] leading-relaxed text-muted">
                  Bir okul puanını değersizleştiren tek şey vardır: sahte puan.
                  Bir numara bir hesaptır ve bir okula yalnızca bir kez puan verir.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {CLAIMS.map((t) => (
                  <li key={t} className="tb-claim flex items-start gap-3">
                    <span className="mt-[3px] grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="3" aria-hidden="true">
                        <path d="m4 12.5 5 5L20 6.5" />
                      </svg>
                    </span>
                    <span className="text-[15px] leading-snug text-ink">{t}</span>
                  </li>
                ))}
              </ul>

              <a
                href={PATHS.puanlama}
                className="group mt-9 inline-flex items-center gap-2 text-[14.5px] font-semibold text-brand"
              >
                <span className="border-b border-brand/35 pb-0.5 group-hover:border-brand">
                  Puanlama kurallarının tamamı
                </span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="transition-transform group-hover:translate-x-1" aria-hidden="true">
                  <path d="M5 12h14m0 0-6-6m6 6-6 6" />
                </svg>
              </a>
            </div>

            {/* Kural panosu — açık zeminde tek koyu odak nesnesi */}
            <div className="tb-panel relative mx-auto w-full max-w-[400px]">
              <span
                className="pointer-events-none absolute -inset-10 -z-10 rounded-[80px] blur-[70px]"
                style={{ background: 'radial-gradient(closest-side, rgba(14,92,107,.28), transparent)' }}
                aria-hidden="true"
              />

              <div className="relative overflow-hidden rounded-3xl bg-brand-800 p-7 shadow-[0_36px_80px_-32px_rgba(6,39,47,.7)]">
                {/* Cam parlaması */}
                <span
                  className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/8 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-200)" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
                          <path d="M10.5 18.5h3" />
                        </svg>
                      </span>
                      <div>
                        <p className="label text-white/45">Doğrulanan numara</p>
                        <p className="plate mt-1.5 text-[16px] text-white">0532 *** ** 41</p>
                      </div>
                    </div>

                    <span className="tb-seal inline-flex shrink-0 items-center gap-1.5 rounded-full bg-ok/18 px-2.5 py-1.5 ring-1 ring-ok/35">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="3.4" aria-hidden="true">
                        <path d="m4 12.5 5 5L20 6.5" />
                      </svg>
                      <span className="text-[11px] font-semibold tracking-wide text-[#6ee7b7]">
                        Doğrulandı
                      </span>
                    </span>
                  </div>

                  <div className="mt-7 flex items-baseline gap-2.5">
                    <span className="display text-[40px] leading-none text-white">1</span>
                    <span className="text-[14px] leading-snug text-white/60">
                      numara = 1 hesap
                      <br />1 okula 1 puan
                    </span>
                  </div>

                  <div className="mt-7 space-y-px overflow-hidden rounded-xl bg-white/8">
                    {RULES.map((r) => (
                      <div
                        key={r.t}
                        className="tb-rule flex items-center justify-between gap-3 bg-brand-800 px-3.5 py-3"
                      >
                        <span className="text-[13.5px] text-white/80">{r.t}</span>
                        {r.s === 'ok' ? (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#6ee7b7]">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <path d="m4 12.5 5 5L20 6.5" />
                            </svg>
                            Puan verebilir
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/45">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                            Engellenir
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="mt-5 text-[12px] leading-relaxed text-white/45">
                    Numara yalnızca doğrulama için kullanılır, maskelenerek saklanır ve
                    hiçbir ekranda tam hâliyle gösterilmez.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destekleyici maddeler */}
      <div className="mx-auto max-w-[1400px] px-4 pb-20 sm:px-6">
        <ul className="tb-points grid gap-10 border-t border-line pt-12 md:grid-cols-3 md:gap-12">
          {POINTS.map((p, i) => (
            <li key={p.t} className="tb-point">
              <span className="plate text-[13px] text-brand/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="display-sm mt-3 text-[17px] text-ink">{p.t}</h3>
              <p className="pretty mt-2 text-[14px] leading-relaxed text-muted">{p.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
