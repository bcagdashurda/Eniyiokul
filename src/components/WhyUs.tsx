import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { reveal, withMotion } from '../lib/motion';
import { PATHS } from '../lib/router';
import { n } from '../lib/format';

/**
 * Veliye dönük güven bölümü.
 *
 * Metin, başka platformlar hakkında iddia içermez; yalnızca bu platformun
 * kendi taahhütlerini anlatır. Doğrulanamayan bir karşılaştırma yapmak hem
 * yanıltıcı hem de gereksiz bir hukuki risk olurdu.
 */
const PROMISES = [
  {
    t: 'Puan vermek SMS doğrulaması ister',
    d: 'Doğrulanmamış hesap puan veremez. Bir numara bir hesaptır ve bir okula yalnızca bir kez puan verebilir; toplu ve sahte puanlamanın önündeki asıl engel bu.',
  },
  {
    t: 'Okullar puansız başlar',
    d: 'Listedeki 12.844 okulun tamamı sıfırdan başlıyor. Ortalamayı oluşturan tek kaynak, doğrulanmış velilerin verdiği notlar.',
  },
  {
    t: 'Yazılı yorum yok, yalnızca puan',
    d: 'Serbest metin almıyoruz. Herkes aynı altı başlığı puanlıyor, bu yüzden okullar aynı ölçütle karşılaştırılabiliyor ve hakaret, dedikodu, kişisel hesaplaşma sorunu doğmuyor.',
  },
  {
    t: 'Tek yıldız yerine altı başlık',
    d: 'Akademik başarı, öğretmen kadrosu, fiziki imkânlar, ücret karşılığı, veli iletişimi ve sosyal etkinlik ayrı puanlanıyor ve ayrı gösteriliyor. Bir okul nerede iyi, nerede zayıf, görebiliyorsunuz.',
  },
  {
    t: 'Sahte puan baştan giremez',
    d: 'Doğrulanmamış hesap puan veremediği için sahte puanı sonradan temizlemek gerekmiyor; sisteme hiç girmiyor. Aynı numara aynı okula ikinci kez puan veremez.',
  },
  {
    t: 'Sponsorluk sıralamayı değiştirir, puanı değiştirmez',
    d: 'Sponsorlu yerleşimler ayrı blokta duruyor ve her ekranda “Sponsorlu” etiketiyle görünüyor. Puana ve puana göre sıralamaya dokunmuyor.',
  },
  {
    t: 'Kaç kişinin puanladığı hep görünür',
    d: 'Üç kişinin puanladığı bir okulla iki yüz kişinin puanladığı okul aynı şey değil. Ortalamanın yanında değerlendirme sayısı her zaman yazıyor.',
  },
];

export default function WhyUs({ reviewCount }: { reviewCount: number }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => withMotion(() => {
      reveal('.wu-item', { trigger: '.wu-grid', y: 24, stagger: 0.07 });
    }), root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="neden-biz"
      className="border-b border-line bg-surface"
      aria-labelledby="wu-title"
    >
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16">
          <div>
            <p className="label text-brand">Neden eniyiokul</p>
            <h2 id="wu-title" className="display mt-3 text-[clamp(28px,3.6vw,42px)] text-ink">
              Bir okulu en iyi, oraya çocuğunu gönderen veli bilir.
            </h2>
            <p className="pretty mt-4 text-[16px] leading-relaxed text-muted">
              Tanıtım broşürü her okulda aynı. Fark servis saatinde, öğretmen
              değişim sıklığında, veliye dönüş hızında ortaya çıkıyor. Bunu da
              ancak o okulda bulunmuş biri bilir.
            </p>

            <div className="mt-7 rounded-2xl border border-line bg-bg p-5">
              <p className="text-[13.5px] font-semibold text-ink">Şeffaflık taahhüdü</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                Puanlama kurallarımızın tamamı herkese açık ve önceden yazılı.
                Uyguladığımız her karar aylık olarak yayımlanıyor.
              </p>
              <a
                href={PATHS.puanlama}
                className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand underline underline-offset-4 hover:text-brand-600"
              >
                Puanlama kurallarını okuyun
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="M5 12h14m0 0-6-6m6 6-6 6" />
                </svg>
              </a>
            </div>

            {reviewCount > 0 && (
              <p className="mt-4 text-[13px] text-muted-2 tnum">
                Bu tarayıcıda şu ana kadar {n(reviewCount)} okul puanlandı.
              </p>
            )}
          </div>

          <ul className="wu-grid grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {PROMISES.map((p) => (
              <li key={p.t} className="wu-item bg-surface p-6">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.4" aria-hidden="true">
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                </span>
                <h3 className="display-sm mt-3.5 text-[16px] text-ink">{p.t}</h3>
                <p className="pretty mt-2 text-[14px] leading-relaxed text-muted">{p.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
