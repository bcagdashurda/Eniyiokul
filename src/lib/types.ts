export type School = {
  ilce: string;
  ad: string;
  tur: string;
  adres: string;
  tel: string;
};

/** Tek bir ilin tam kaydı — /data/provinces/<slug>.json */
export type ProvinceFile = {
  il: string;
  slug: string;
  sayi: number;
  sitedeSoylenen: number;
  ilceler: string[];
  turler: Record<string, number>;
  okullar: School[];
};

/** Harita için il özeti — /data/summary.json */
export type ProvinceSummary = {
  il: string;
  slug: string;
  sayi: number;
  sitedeSoylenen: number;
  ilceSayisi: number;
  turler: Record<string, number>;
};

export type Summary = {
  guncelleme: string;
  kaynak: string;
  kaynakUrl: string;
  not: string;
  toplamKurum: number;
  iller: ProvinceSummary[];
  turDagilimi: Record<string, number>;
};

/** Velinin verdiği puan — 6 kriter, her biri 1-5 */
export type Criteria = {
  akademik: number;
  ogretmen: number;
  imkanlar: number;
  ucret: number;
  iletisim: number;
  sosyal: number;
};

/**
 * Değerlendirme yalnızca puandan oluşur; serbest metin yorum alınmaz.
 * Böylece hakaret, kişisel veri ifşası ve içerik denetimi sorunları
 * baştan doğmuyor, karşılaştırma da tek ölçüte oturuyor.
 */
export type Review = {
  id: string;
  schoolId: string;
  author: string;
  relation: string;
  createdAt: number;
  criteria: Criteria;
};

export const CRITERIA_LABELS: { key: keyof Criteria; label: string; hint: string }[] = [
  { key: 'akademik', label: 'Akademik başarı', hint: 'Sınav sonuçları, ders programı, üniversite yerleştirme' },
  { key: 'ogretmen', label: 'Öğretmen kadrosu', hint: 'Deneyim, ilgi, kadro sürekliliği' },
  { key: 'imkanlar', label: 'Fiziki imkânlar', hint: 'Derslik, laboratuvar, spor alanı, servis' },
  { key: 'ucret', label: 'Ücret karşılığı', hint: 'Ödenen ücretin karşılığını verip vermediği' },
  { key: 'iletisim', label: 'Veli iletişimi', hint: 'Geri dönüş hızı, şeffaflık, toplantılar' },
  { key: 'sosyal', label: 'Sosyal etkinlik', hint: 'Kulüpler, geziler, sanat ve spor' },
];

/** Okul için kalıcı kimlik. MEB kurum kodu yayınlamadığı için ad ve ilçeden türetilir. */
export const schoolId = (provinceSlug: string, s: School) =>
  `${provinceSlug}::${s.ilce}::${s.ad}`.toLocaleLowerCase('tr-TR');
