import WhyUs from '../components/WhyUs';
import HowItWorks from '../components/HowItWorks';
import { PATHS } from '../lib/router';
import { n } from '../lib/format';
import type { Summary } from '../lib/types';

/**
 * "Neden eniyiokul" sayfası.
 *
 * Ana sayfa veliyi doğrudan haritaya ve okul listesine götürüyor; anlatım
 * gerektiren bölümler buraya taşındı. Böylece ana sayfa kısa kalıyor,
 * merak eden okumaya devam edebiliyor.
 */
export default function About({
  summary,
  reviewCount,
}: {
  summary: Summary | null;
  reviewCount: number;
}) {
  return (
    <main id="top" className="pt-[72px]">
      <section className="rule-grid border-b border-line bg-bg">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-20">
          <a
            href={PATHS.home}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted hover:text-ink"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
            </svg>
            Ana sayfaya dön
          </a>

          <div className="mt-6 max-w-[760px]">
            <p className="label text-brand">Neden eniyiokul</p>
            <h1 className="display mt-3 text-[clamp(32px,4.6vw,54px)] text-ink">
              Okul seçimi, hayatınızın en pahalı kararlarından biri.
            </h1>
            <p className="pretty mt-5 text-[17px] leading-relaxed text-muted">
              Bir çocuğu on iki yıl boyunca aynı kuruma göndereceksiniz. Elinizdeki
              bilgi ise genelde okulun kendi tanıtımı, bir de kulaktan duyma.
              Biz araya velilerin ortak deneyimini koyuyoruz.
            </p>

            {summary && (
              <dl className="mt-9 grid max-w-[620px] grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { v: n(summary.toplamKurum), l: 'özel okul' },
                  { v: '81', l: 'il' },
                  { v: '973', l: 'ilçe' },
                  { v: '6', l: 'puan başlığı' },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-line bg-surface px-4 py-3.5">
                    <dd className="display text-[24px] leading-none text-ink tnum">{s.v}</dd>
                    <dt className="label mt-2 text-muted-2">{s.l}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      <WhyUs reviewCount={reviewCount} />
      <HowItWorks />

      {/* Kapanış */}
      <section className="border-b border-line bg-bg">
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-line bg-surface p-8">
            <div className="max-w-[520px]">
              <h2 className="display text-[24px] text-ink">Haritadan başlayın</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">
                İlinizi seçin, ilçeye inin, okulları karşılaştırın. Bildiğiniz bir
                okul varsa puanlayarak sonraki veliye yardım edin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <a href={PATHS.home} className="btn btn-primary">
                Haritaya dön
              </a>
              <a href={PATHS.puanlama} className="btn btn-outline">
                Puanlama kuralları
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
