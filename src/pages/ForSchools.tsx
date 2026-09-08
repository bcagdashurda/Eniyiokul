import Pricing from '../components/Pricing';
import { PATHS } from '../lib/router';
import { n } from '../lib/format';
import type { Summary } from '../lib/types';

/**
 * Okul sahiplerine ayrılmış ekran.
 *
 * Ana sayfa veliye hitap ettiği için sponsorluk, fiyat ve teklif adımları
 * buraya taşındı; veli tarafında yalnızca "Sponsorlu" etiketi görünüyor.
 */
const STEPS = [
  {
    t: 'Kaydınızı doğrulayın',
    d: 'Okulunuz MEB kayıtlarından geldiği için listede zaten var. Yetkili olduğunuzu doğrulayınca profili yönetmeye başlarsınız.',
  },
  {
    t: 'Profili tamamlayın',
    d: 'Fotoğraf, tanıtım metni, kademe ve iletişim bilgilerini siz güncellersiniz. Adres ve kurum türü MEB kaydından gelir.',
  },
  {
    t: 'Puanlarınızı takip edin',
    d: 'Altı başlığın hangisinde nerede olduğunuzu ve ilçenizdeki diğer okullara göre konumunuzu panelden görürsünüz.',
  },
  {
    t: 'İsterseniz öne çıkın',
    d: 'Sponsorluk yalnızca listedeki sıranızı değiştirir. Puanınıza ve puana göre sıralamaya dokunmaz.',
  },
];

const FAQ = [
  {
    q: 'Sponsor olursam puanım yükselir mi?',
    a: 'Hayır. Sponsorluk yalnızca yerleşim satın alır: kartınız ayrı bir blokta ve “Sponsorlu” etiketiyle üstte görünür. Puan yalnızca velilerin verdiği notlardan hesaplanır ve sponsorluk bu hesaba hiçbir şekilde girmez.',
  },
  {
    q: 'Puanımı nasıl yükseltirim?',
    a: 'Velilerin puanladığı altı başlıkta iyileşerek: akademik başarı, öğretmen kadrosu, fiziki imkânlar, ücret karşılığı, veli iletişimi ve sosyal etkinlik. Panelde hangi başlıkta nerede olduğunuzu görürsünüz, böylece nereye yükleneceğiniz belli olur. Bir puanın kurala aykırı olduğunu düşünüyorsanız bildirebilirsiniz; inceleme ölçütleri Puanlama Kuralları sayfasında yazılıdır.',
  },
  {
    q: 'Kurum bilgilerim yanlış görünüyor, ne yapmalıyım?',
    a: 'Adres, telefon ve kurum türü MEB kayıtlarından geliyor. Kaynakta düzelttirdikten sonra bize bildirin, güncellemeyi bekletmeden yansıtalım.',
  },
  {
    q: 'Okulum listede hiç yok.',
    a: 'MEB’in özel öğretim kurumları listesinde yer almıyorsa bizde de görünmez. Ruhsat bilgilerinizi gönderin, kaydı elle ekleyelim.',
  },
  {
    q: 'Fiyatlar neden sitede yazmıyor?',
    a: 'Fiyat; ilin büyüklüğüne, seçilen kademeye ve o dönemki boş kontenjana göre değişiyor. Sabit bir liste yayımlamak yanıltıcı olurdu; formu doldurun, size özel çıkaralım.',
  },
];

export default function ForSchools({ summary }: { summary: Summary | null }) {
  return (
    <main id="top" className="pt-[72px]">
      {/* Başlık */}
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

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div>
              <p className="label text-brand">Okullar için</p>
              <h1 className="display mt-3 text-[clamp(32px,4.6vw,54px)] text-ink">
                Okulunuz zaten listede. Sözü siz de alın.
              </h1>
              <p className="pretty mt-4 max-w-[640px] text-[17px] leading-relaxed text-muted">
                {summary ? n(summary.toplamKurum) : '12.844'} özel okulun tamamı MEB
                kayıtlarından geldiği için burada. Profilinizi doğrulayıp
                bilgilerinizi güncelleyebilir, puanlarınızı takip edebilir ve isterseniz öne çıkabilirsiniz.
              </p>
              <div className="mt-7 flex flex-wrap gap-2.5">
                <a href="#teklif" className="btn btn-primary">
                  Teklif alın
                </a>
                <a href="#nasil-olur" className="btn btn-outline">
                  Nasıl işliyor?
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6">
              <p className="text-[14px] font-semibold text-ink">Baştan söyleyelim</p>
              <ul className="mt-3.5 space-y-3">
                {[
                  'Sponsorluk listedeki sıranızı belirler; puanınız velilerin verdiği notlarla oluşur.',
                  'Sponsorlu her yerleşim kullanıcıya açıkça etiketlenir.',
                  'Puan vermek SMS doğrulaması ister; her puanın arkasında doğrulanmış bir hesap vardır.',
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-[14px] leading-snug text-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2.5" className="mt-0.5 shrink-0" aria-hidden="true">
                      <path d="m4 12.5 5 5L20 6.5" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
              <a
                href={PATHS.puanlama}
                className="mt-4 inline-block text-[13.5px] font-semibold text-brand underline underline-offset-4"
              >
                Değerlendirme kuralları
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Akış */}
      <section id="nasil-olur" className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
          <p className="label text-brand">Süreç</p>
          <h2 className="display mt-3 text-[clamp(26px,3.4vw,38px)] text-ink">Dört adım</h2>

          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.t} className="bg-surface p-6">
                <span className="plate inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-[12px] text-brand-600">
                  {i + 1}
                </span>
                <h3 className="display-sm mt-4 text-[17px] text-ink">{s.t}</h3>
                <p className="pretty mt-2 text-[14px] leading-relaxed text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Paketler + teklif formu */}
      <Pricing />

      {/* Sık sorulanlar */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-[900px] px-4 py-20 sm:px-6">
          <p className="label text-brand">Sık sorulanlar</p>
          <h2 className="display mt-3 text-[clamp(26px,3.4vw,38px)] text-ink">
            Merak edilenler
          </h2>

          <div className="mt-9 divide-y divide-line rounded-2xl border border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-semibold text-ink marker:hidden">
                  {f.q}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-muted-2)"
                    strokeWidth="2.2"
                    className="shrink-0 transition-transform duration-300 group-open:rotate-180"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="pretty mt-2.5 text-[14.5px] leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
