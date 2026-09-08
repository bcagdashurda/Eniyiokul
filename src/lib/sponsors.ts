import { schoolId, type School } from './types';

/**
 * Sponsorlu yerleşim.
 *
 * Sponsorluk bir ticari yerleşimdir, kalite göstergesi değildir — bu yüzden
 * her sponsorlu kart görünür biçimde "Sponsorlu" etiketiyle işaretlenir ve
 * sıralama etiketi listenin üstünde açıkça belirtilir.
 *
 * Aşağıdaki liste yerleşimi belirleyen tek kaynaktır; yeni sponsor eklemek
 * için ile ait `slug`, MEB'deki ilçe ve okul adını yazmak yeterlidir.
 */
export type Tier = 'platin' | 'altin' | 'gumus';

/**
 * Paket fiyatları kamuya açık gösterilmez; okullar teklif için iletişime geçer.
 * Bu yüzden tanımda fiyat alanı yok — sızdırılacak bir yer bırakmamak için.
 */
export const TIERS: Record<
  Tier,
  { label: string; blurb: string; features: string[]; slots: string }
> = {
  platin: {
    label: 'Platin',
    blurb: 'İl sayfasının en üstünde sabit yerleşim ve ana sayfa vitrini.',
    slots: 'İl başına 3 kontenjan',
    features: [
      'Ana sayfa vitrininde yer alma',
      'İl listesinde en üstte sabit sıra',
      'Genişletilmiş okul profili ve galeri',
      'Rakip karşılaştırma ekranında öne çıkma',
      'Aylık performans raporu',
      'Öncelikli veli talep yönlendirme',
    ],
  },
  altin: {
    label: 'Altın',
    blurb: 'İlçe listelerinde üst sıralarda vurgulu kart.',
    slots: 'İlçe başına 5 kontenjan',
    features: [
      'İlçe listesinde vurgulu kart',
      'Okul profilinde iletişim formu',
      'Arama sonuçlarında rozet',
      'Aylık performans raporu',
    ],
  },
  gumus: {
    label: 'Gümüş',
    blurb: 'Doğrulanmış profil ve temel görünürlük.',
    slots: 'Sınırsız',
    features: ['Doğrulanmış profil rozeti', 'Fotoğraf ve tanıtım metni', 'İletişim bilgisi vurgusu'],
  },
};

export const TIER_ORDER: Tier[] = ['platin', 'altin', 'gumus'];

type Placement = {
  province: string; // il slug
  ilce: string; // MEB ilçe adı
  ad: string; // MEB okul adı
  tier: Tier;
  tagline: string;
  /**
   * Görsel klasörü: public/img/schools/<img>/
   *   cover.jpg  — kart ve profil başlığı (16:9)
   *   01..03.jpg — profil galerisi (3:2)
   * Dosya yoksa arayüz sessizce armaya döner.
   */
  img: string;
};

/**
 * Yerleşim listesi — düzenlenebilir.
 * Buradaki her kayıt MEB verisindeki gerçek bir okulla birebir eşleşir;
 * `tools/check_sponsors.py` bunu doğrular.
 */
export const PLACEMENTS: Placement[] = [
  {
    province: 'bursa',
    ilce: 'NİLÜFER',
    ad: 'ÖZEL BURSA ARENA YUSUF ZİYA KARAKUŞ ANADOLU LİSESİ',
    img: 'bursa-arena',
    tier: 'platin',
    tagline: 'Nilüfer kampüsünde tam gün eğitim ve üniversite hazırlık programı',
  },
  {
    province: 'bursa',
    ilce: 'OSMANGAZİ',
    ad: 'ÖZEL ÇEKİRGE BİLİMSEL FARKLILIK FEN LİSESİ',
    img: 'cekirge-bilimsel',
    tier: 'altin',
    tagline: 'Çekirge’de fen odaklı program, servis ağı geniş',
  },
  {
    province: 'istanbul',
    ilce: 'KADIKÖY',
    ad: 'ÖZEL ANAKENT KOLEJİ ANADOLU LİSESİ',
    img: 'anakent-koleji',
    tier: 'platin',
    tagline: 'Anadolu yakasında hazırlık sınıflı program',
  },
];

/*
 * Not: Ankara / İzmir / Antalya yerleşimleri görselleri hazır olmadığı için
 * şimdilik listede tutulmuyor. Görseller `public/img/schools/<klasör>/`
 * altına eklendiğinde kayıtları buraya geri koymak yeterli:
 *   baskent-ayseabla · ankara/ÇANKAYA · BAŞKENT ÜNİVERSİTESİ ÖZEL AYŞEABLA FEN LİSESİ
 *   arkas-piri-reis  · izmir/BORNOVA  · ÖZEL ARKAS PİRİ REİS ANADOLU LİSESİ
 *   antalya-aci      · antalya/MURATPAŞA · ÖZEL ANTALYA AÇI FEN LİSESİ
 */

const key = (p: string, ilce: string, ad: string) =>
  `${p}::${ilce}::${ad}`.toLocaleLowerCase('tr-TR');

const INDEX = new Map(PLACEMENTS.map((p) => [key(p.province, p.ilce, p.ad), p]));

export const sponsorshipOf = (provinceSlug: string, s: School) =>
  INDEX.get(schoolId(provinceSlug, s));

export const isSponsored = (provinceSlug: string, s: School) =>
  INDEX.has(schoolId(provinceSlug, s));

const RANK: Record<Tier, number> = { platin: 0, altin: 1, gumus: 2 };

/**
 * Sponsorlu okulları öne alır. Sponsorluk kalite iddiası olmadığı için
 * sıralama sponsorlu blok / normal blok biçiminde ayrıktır; normal blok
 * kendi içinde değiştirilmeden kalır.
 */
export function withSponsoredFirst(provinceSlug: string, list: School[]) {
  const sponsored: School[] = [];
  const rest: School[] = [];
  for (const s of list) (isSponsored(provinceSlug, s) ? sponsored : rest).push(s);
  sponsored.sort(
    (a, b) =>
      RANK[sponsorshipOf(provinceSlug, a)!.tier] - RANK[sponsorshipOf(provinceSlug, b)!.tier],
  );
  return { sponsored, rest };
}
