/**
 * İl meta verisi.
 *
 * Plaka kodu bu arayüzde dekoratif bir numara değil: Türkiye'de her ilin
 * plakası herkesçe bilinir, bu yüzden listelerde ve harita etiketlerinde
 * gerçek bir tanımlayıcı olarak kullanılıyor.
 *
 * `geo` alanı GeoJSON'daki (tr-provinces.json) `properties.name` değeri,
 * `meb` alanı ise MEB kayıtlarındaki büyük harfli il adı. İkisi bazı
 * illerde farklı yazılıyor (Afyon / AFYONKARAHİSAR gibi).
 */
export type ProvinceMeta = {
  plate: number;
  geo: string;
  meb: string;
  slug: string;
  region: string;
};

export const PROVINCES: ProvinceMeta[] = [
  { plate: 1, geo: 'Adana', meb: 'ADANA', slug: 'adana', region: 'Akdeniz' },
  { plate: 2, geo: 'Adıyaman', meb: 'ADIYAMAN', slug: 'adiyaman', region: 'Güneydoğu Anadolu' },
  { plate: 3, geo: 'Afyon', meb: 'AFYONKARAHİSAR', slug: 'afyonkarahisar', region: 'Ege' },
  { plate: 4, geo: 'Ağrı', meb: 'AĞRI', slug: 'agri', region: 'Doğu Anadolu' },
  { plate: 5, geo: 'Amasya', meb: 'AMASYA', slug: 'amasya', region: 'Karadeniz' },
  { plate: 6, geo: 'Ankara', meb: 'ANKARA', slug: 'ankara', region: 'İç Anadolu' },
  { plate: 7, geo: 'Antalya', meb: 'ANTALYA', slug: 'antalya', region: 'Akdeniz' },
  { plate: 8, geo: 'Artvin', meb: 'ARTVİN', slug: 'artvin', region: 'Karadeniz' },
  { plate: 9, geo: 'Aydın', meb: 'AYDIN', slug: 'aydin', region: 'Ege' },
  { plate: 10, geo: 'Balıkesir', meb: 'BALIKESİR', slug: 'balikesir', region: 'Marmara' },
  { plate: 11, geo: 'Bilecik', meb: 'BİLECİK', slug: 'bilecik', region: 'Marmara' },
  { plate: 12, geo: 'Bingöl', meb: 'BİNGÖL', slug: 'bingol', region: 'Doğu Anadolu' },
  { plate: 13, geo: 'Bitlis', meb: 'BİTLİS', slug: 'bitlis', region: 'Doğu Anadolu' },
  { plate: 14, geo: 'Bolu', meb: 'BOLU', slug: 'bolu', region: 'Karadeniz' },
  { plate: 15, geo: 'Burdur', meb: 'BURDUR', slug: 'burdur', region: 'Akdeniz' },
  { plate: 16, geo: 'Bursa', meb: 'BURSA', slug: 'bursa', region: 'Marmara' },
  { plate: 17, geo: 'Çanakkale', meb: 'ÇANAKKALE', slug: 'canakkale', region: 'Marmara' },
  { plate: 18, geo: 'Çankırı', meb: 'ÇANKIRI', slug: 'cankiri', region: 'İç Anadolu' },
  { plate: 19, geo: 'Çorum', meb: 'ÇORUM', slug: 'corum', region: 'Karadeniz' },
  { plate: 20, geo: 'Denizli', meb: 'DENİZLİ', slug: 'denizli', region: 'Ege' },
  { plate: 21, geo: 'Diyarbakır', meb: 'DİYARBAKIR', slug: 'diyarbakir', region: 'Güneydoğu Anadolu' },
  { plate: 22, geo: 'Edirne', meb: 'EDİRNE', slug: 'edirne', region: 'Marmara' },
  { plate: 23, geo: 'Elazığ', meb: 'ELAZIĞ', slug: 'elazig', region: 'Doğu Anadolu' },
  { plate: 24, geo: 'Erzincan', meb: 'ERZİNCAN', slug: 'erzincan', region: 'Doğu Anadolu' },
  { plate: 25, geo: 'Erzurum', meb: 'ERZURUM', slug: 'erzurum', region: 'Doğu Anadolu' },
  { plate: 26, geo: 'Eskişehir', meb: 'ESKİŞEHİR', slug: 'eskisehir', region: 'İç Anadolu' },
  { plate: 27, geo: 'Gaziantep', meb: 'GAZİANTEP', slug: 'gaziantep', region: 'Güneydoğu Anadolu' },
  { plate: 28, geo: 'Giresun', meb: 'GİRESUN', slug: 'giresun', region: 'Karadeniz' },
  { plate: 29, geo: 'Gümüşhane', meb: 'GÜMÜŞHANE', slug: 'gumushane', region: 'Karadeniz' },
  { plate: 30, geo: 'Hakkari', meb: 'HAKKARİ', slug: 'hakkari', region: 'Doğu Anadolu' },
  { plate: 31, geo: 'Hatay', meb: 'HATAY', slug: 'hatay', region: 'Akdeniz' },
  { plate: 32, geo: 'Isparta', meb: 'ISPARTA', slug: 'isparta', region: 'Akdeniz' },
  { plate: 33, geo: 'Mersin', meb: 'MERSİN', slug: 'mersin', region: 'Akdeniz' },
  { plate: 34, geo: 'İstanbul', meb: 'İSTANBUL', slug: 'istanbul', region: 'Marmara' },
  { plate: 35, geo: 'İzmir', meb: 'İZMİR', slug: 'izmir', region: 'Ege' },
  { plate: 36, geo: 'Kars', meb: 'KARS', slug: 'kars', region: 'Doğu Anadolu' },
  { plate: 37, geo: 'Kastamonu', meb: 'KASTAMONU', slug: 'kastamonu', region: 'Karadeniz' },
  { plate: 38, geo: 'Kayseri', meb: 'KAYSERİ', slug: 'kayseri', region: 'İç Anadolu' },
  { plate: 39, geo: 'Kırklareli', meb: 'KIRKLARELİ', slug: 'kirklareli', region: 'Marmara' },
  { plate: 40, geo: 'Kırşehir', meb: 'KIRŞEHİR', slug: 'kirsehir', region: 'İç Anadolu' },
  { plate: 41, geo: 'Kocaeli', meb: 'KOCAELİ', slug: 'kocaeli', region: 'Marmara' },
  { plate: 42, geo: 'Konya', meb: 'KONYA', slug: 'konya', region: 'İç Anadolu' },
  { plate: 43, geo: 'Kütahya', meb: 'KÜTAHYA', slug: 'kutahya', region: 'Ege' },
  { plate: 44, geo: 'Malatya', meb: 'MALATYA', slug: 'malatya', region: 'Doğu Anadolu' },
  { plate: 45, geo: 'Manisa', meb: 'MANİSA', slug: 'manisa', region: 'Ege' },
  { plate: 46, geo: 'Kahramanmaraş', meb: 'KAHRAMANMARAŞ', slug: 'kahramanmaras', region: 'Akdeniz' },
  { plate: 47, geo: 'Mardin', meb: 'MARDİN', slug: 'mardin', region: 'Güneydoğu Anadolu' },
  { plate: 48, geo: 'Muğla', meb: 'MUĞLA', slug: 'mugla', region: 'Ege' },
  { plate: 49, geo: 'Muş', meb: 'MUŞ', slug: 'mus', region: 'Doğu Anadolu' },
  { plate: 50, geo: 'Nevşehir', meb: 'NEVŞEHİR', slug: 'nevsehir', region: 'İç Anadolu' },
  { plate: 51, geo: 'Niğde', meb: 'NİĞDE', slug: 'nigde', region: 'İç Anadolu' },
  { plate: 52, geo: 'Ordu', meb: 'ORDU', slug: 'ordu', region: 'Karadeniz' },
  { plate: 53, geo: 'Rize', meb: 'RİZE', slug: 'rize', region: 'Karadeniz' },
  { plate: 54, geo: 'Sakarya', meb: 'SAKARYA', slug: 'sakarya', region: 'Marmara' },
  { plate: 55, geo: 'Samsun', meb: 'SAMSUN', slug: 'samsun', region: 'Karadeniz' },
  { plate: 56, geo: 'Siirt', meb: 'SİİRT', slug: 'siirt', region: 'Güneydoğu Anadolu' },
  { plate: 57, geo: 'Sinop', meb: 'SİNOP', slug: 'sinop', region: 'Karadeniz' },
  { plate: 58, geo: 'Sivas', meb: 'SİVAS', slug: 'sivas', region: 'İç Anadolu' },
  { plate: 59, geo: 'Tekirdağ', meb: 'TEKİRDAĞ', slug: 'tekirdag', region: 'Marmara' },
  { plate: 60, geo: 'Tokat', meb: 'TOKAT', slug: 'tokat', region: 'Karadeniz' },
  { plate: 61, geo: 'Trabzon', meb: 'TRABZON', slug: 'trabzon', region: 'Karadeniz' },
  { plate: 62, geo: 'Tunceli', meb: 'TUNCELİ', slug: 'tunceli', region: 'Doğu Anadolu' },
  { plate: 63, geo: 'Şanlıurfa', meb: 'ŞANLIURFA', slug: 'sanliurfa', region: 'Güneydoğu Anadolu' },
  { plate: 64, geo: 'Uşak', meb: 'UŞAK', slug: 'usak', region: 'Ege' },
  { plate: 65, geo: 'Van', meb: 'VAN', slug: 'van', region: 'Doğu Anadolu' },
  { plate: 66, geo: 'Yozgat', meb: 'YOZGAT', slug: 'yozgat', region: 'İç Anadolu' },
  { plate: 67, geo: 'Zonguldak', meb: 'ZONGULDAK', slug: 'zonguldak', region: 'Karadeniz' },
  { plate: 68, geo: 'Aksaray', meb: 'AKSARAY', slug: 'aksaray', region: 'İç Anadolu' },
  { plate: 69, geo: 'Bayburt', meb: 'BAYBURT', slug: 'bayburt', region: 'Karadeniz' },
  { plate: 70, geo: 'Karaman', meb: 'KARAMAN', slug: 'karaman', region: 'İç Anadolu' },
  { plate: 71, geo: 'Kırıkkale', meb: 'KIRIKKALE', slug: 'kirikkale', region: 'İç Anadolu' },
  { plate: 72, geo: 'Batman', meb: 'BATMAN', slug: 'batman', region: 'Güneydoğu Anadolu' },
  { plate: 73, geo: 'Şırnak', meb: 'ŞIRNAK', slug: 'sirnak', region: 'Güneydoğu Anadolu' },
  { plate: 74, geo: 'Bartın', meb: 'BARTIN', slug: 'bartin', region: 'Karadeniz' },
  { plate: 75, geo: 'Ardahan', meb: 'ARDAHAN', slug: 'ardahan', region: 'Doğu Anadolu' },
  { plate: 76, geo: 'Iğdır', meb: 'IĞDIR', slug: 'igdir', region: 'Doğu Anadolu' },
  { plate: 77, geo: 'Yalova', meb: 'YALOVA', slug: 'yalova', region: 'Marmara' },
  { plate: 78, geo: 'Karabük', meb: 'KARABÜK', slug: 'karabuk', region: 'Karadeniz' },
  { plate: 79, geo: 'Kilis', meb: 'KİLİS', slug: 'kilis', region: 'Güneydoğu Anadolu' },
  { plate: 80, geo: 'Osmaniye', meb: 'OSMANİYE', slug: 'osmaniye', region: 'Akdeniz' },
  { plate: 81, geo: 'Düzce', meb: 'DÜZCE', slug: 'duzce', region: 'Karadeniz' },
];

const BY_GEO = new Map(PROVINCES.map((p) => [p.geo, p]));
const BY_MEB = new Map(PROVINCES.map((p) => [p.meb, p]));
const BY_SLUG = new Map(PROVINCES.map((p) => [p.slug, p]));

export const byGeoName = (n: string) => BY_GEO.get(n);
export const byMebName = (n: string) => BY_MEB.get(n);
export const bySlug = (s: string) => BY_SLUG.get(s);

/** Görüntülenecek il adı — MEB'in büyük harfli kaydı yerine düzgün yazım. */
export const displayName = (p: ProvinceMeta) =>
  p.slug === 'mersin' ? 'Mersin' : titleCaseTr(p.meb);

export function titleCaseTr(s: string) {
  return s
    .toLocaleLowerCase('tr-TR')
    .split(/(\s|-)/)
    .map((w) =>
      w.length > 1 ? w[0].toLocaleUpperCase('tr-TR') + w.slice(1) : w,
    )
    .join('');
}

export const plateLabel = (p: ProvinceMeta) => String(p.plate).padStart(2, '0');
