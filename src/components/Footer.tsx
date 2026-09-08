import { useState } from 'react';
import type { Summary } from '../lib/types';
import { n } from '../lib/format';
import { PROVINCES, displayName } from '../lib/provinces';
import { PATHS } from '../lib/router';
import Logo from './Logo';

/** Her bağlantı gerçek bir hedefe gider — ölü bağlantı bırakılmadı. */
const COLS: { title: string; links: { href: string; label: string; ext?: boolean }[] }[] = [
  {
    title: 'Keşfet',
    links: [
      { href: `${PATHS.home}`, label: 'Türkiye haritası' },
      { href: '#okullar', label: 'Okul listesi' },
      { href: '#one-cikan', label: 'Öne çıkan okullar' },
      { href: PATHS.about, label: 'Nasıl çalışır' },
    ],
  },
  {
    title: 'Veliler için',
    links: [
      { href: PATHS.about, label: 'Neden eniyiokul' },
      { href: PATHS.puanlama, label: 'Puanlama kuralları' },
      { href: 'mailto:bildirim@eniyiokul.com', label: 'Puan bildirimi', ext: true },
      { href: 'mailto:merhaba@eniyiokul.com', label: 'Bize yazın', ext: true },
    ],
  },
  /* Ticari başlıklar veliye dönük alanda tek bir bağlantıya indirildi;
     ayrıntılar okul sahiplerinin sayfasında. */
  {
    title: 'Okullar için',
    links: [
      { href: PATHS.schools, label: 'Kurumsal profil yönetimi' },
      { href: 'mailto:merhaba@eniyiokul.com', label: 'Bilgi düzeltme talebi', ext: true },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { href: PATHS.kvkk, label: 'KVKK aydınlatma metni' },
      { href: PATHS.gizlilik, label: 'Gizlilik politikası' },
      { href: PATHS.kosullar, label: 'Kullanım koşulları' },
    ],
  },
];

export default function Footer({
  summary,
  onSelectProvince,
  onGoHome,
}: {
  summary: Summary;
  onSelectProvince: (s: string) => void;
  onGoHome?: () => void;
}) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer id="iletisim" className="bg-ink text-white">
      {/* Bülten */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
          <div className="max-w-[460px]">
            <h2 className="display text-[22px] text-white sm:text-[24px]">
              Puanlar güncellendikçe haberdar olun
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/60">
              Takip ettiğiniz ildeki okulların puanları değiştiğinde ayda bir özet
              gönderiyoruz. İstediğiniz an çıkabilirsiniz.
            </p>
          </div>
          <form
            className="flex w-full max-w-[440px] flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSubscribed(true);
            }}
          >
            <label htmlFor="bulten" className="sr-only">
              E-posta adresiniz
            </label>
            <input
              id="bulten"
              type="email"
              required
              placeholder="e-posta adresiniz"
              className="h-11 min-w-[190px] flex-1 rounded-xl border border-white/15 bg-white/8 px-3.5 text-[14px] text-white placeholder:text-white/40 focus:border-brand-300 focus:outline-none"
            />
            <button type="submit" className="btn btn-primary h-11 min-h-11">
              Abone olun
            </button>
            <p className="w-full text-[12px] text-white/45">
              Abone olarak{' '}
              <a href={PATHS.kvkk} className="underline underline-offset-2 hover:text-white/70">
                aydınlatma metnini
              </a>{' '}
              okuduğunuzu kabul edersiniz.
            </p>
            {subscribed && (
              <span role="status" className="w-full text-[13px] text-brand-200">
                Kaydınız alındı.
              </span>
            )}
          </form>
        </div>
      </div>

      {/* Sütunlar */}
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_2.4fr] lg:gap-12">
          <div>
            <a
              href={PATHS.home}
              onClick={(e) => {
                e.preventDefault();
                onGoHome?.();
              }}
              aria-label="eniyiokul ana sayfa"
            >
              <Logo onDark />
            </a>

            <p className="pretty mt-5 max-w-[380px] text-[14px] leading-relaxed text-white/60">
              Türkiye’deki {n(summary.toplamKurum)} özel okul tek haritada. Kurum
              bilgileri MEB’in resmî kayıtlarından alınır; puanlar velilerin
              değerlendirmelerinden oluşur.
            </p>

            <ul className="mt-6 space-y-2.5 text-[14px]">
              <li className="flex items-center gap-2.5 text-white/75">
                <Icon d="M4 6h16v12H4zM4 7l8 6 8-6" />
                <a href="mailto:merhaba@eniyiokul.com" className="hover:text-white">
                  merhaba@eniyiokul.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-white/75">
                <Icon d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3Z" />
                <a href="tel:+902241234567" className="plate hover:text-white">
                  0224 123 45 67
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/60">
                <Icon d="M12 21s6.5-6.1 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 14.9 12 21 12 21Z" />
                <span>Nilüfer, Bursa</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="label text-white/40">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        onClick={
                          l.label === 'Türkiye haritası'
                            ? (e) => {
                                e.preventDefault();
                                onGoHome?.();
                              }
                            : undefined
                        }
                        className="text-[14px] text-white/70 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* İl dizini */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <p className="label text-white/40">Popüler iller</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
            {summary.iller.slice(0, 24).map((i) => {
              const m = PROVINCES.find((p) => p.slug === i.slug);
              if (!m) return null;
              return (
                <li key={i.slug}>
                  <button
                    type="button"
                    onClick={() => onSelectProvince(i.slug)}
                    className="text-[13.5px] text-white/65 transition-colors hover:text-white"
                  >
                    {displayName(m)} <span className="text-white/35 tnum">{n(i.sayi)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Künye */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 pt-7">
          <p className="text-[13px] text-white/45">
            © {new Date().getFullYear()} eniyiokul, prototip
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-white/45">
            <a
              href={summary.kaynakUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-white/80"
            >
              Kaynak: MEB Özel Öğretim Kurumları
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                <path d="M7 17 17 7m0 0H8m9 0v9" />
              </svg>
            </a>
            <span>Veri güncellemesi: {summary.guncelleme.split('-').reverse().join('.')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-white/40"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
