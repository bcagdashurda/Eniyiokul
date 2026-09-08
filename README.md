# eniyiokul — özel okul rehberi (prototip)

Türkiye'deki **12.844 özel okulun tamamı** tek haritada. İl seç, ilçeye in,
okulları listele, velilerin değerlendirmelerini oku ve yaz.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # üretim derlemesi -> dist/
```

## Veri

Kurum bilgileri MEB Özel Öğretim Kurumları Genel Müdürlüğü kayıtlarından
(`ookgm.meb.gov.tr/kurumlar.php`) çekildi.

| Ne | Kaç |
|---|---|
| Okul kaydı | 12.844 |
| İl | 81 (Ardahan MEB listesinde yok → 0 okul) |
| İlçe sınırı | 973 |
| MEB ilçesiyle eşleşen poligon | 473 / 473 |

Sitenin kendi sayacı listelediğinden fazla gösteriyor (Bursa: sayaç 703,
listelenen 633). Her yerde **gerçekten listelenen kayıt sayısı** kullanılıyor.

### Veri dosyaları

| Dosya | İçerik | Yükleme |
|---|---|---|
| `public/data/tr-provinces.json` | 81 il sınırı | açılışta (236 KB) |
| `public/data/summary.json` | il özetleri | açılışta |
| `public/data/provinces/<il>.json` | ilin tüm okulları | ile tıklayınca |
| `public/data/districts/<il>.json` | ilçe sınırları + okul sayıları | ile tıklayınca |

Kaynaklar: il sınırları [cihadturhan/tr-geojson](https://github.com/cihadturhan/tr-geojson),
ilçe sınırları [ttezer/turkiye-harita-verisi](https://github.com/ttezer/turkiye-harita-verisi).

### Veriyi yeniden üretmek

```bash
python tools/scrape_all.py         # MEB'den tüm iller
python tools/build_public_data.py  # public/data hazırla
python tools/build_districts.py    # ilçe sınırlarını işle
```

## Puanlama

Okullar **puansız** başlar. Puan yalnızca veliler değerlendirdikçe oluşur —
altı ayrı başlıkta (akademik, öğretmen kadrosu, fiziki imkânlar, ücret/karşılık,
veli iletişimi, sosyal etkinlik). Bu prototipte değerlendirmeler tarayıcıda
(`localStorage`) tutulur; üretimde bu katmanın yerini API alır, arayüz aynı kalır.

## Sponsorluk

Yerleşimler `src/lib/sponsors.ts` içinde. Sponsorluk **sıralamayı** belirler,
puana dokunmaz; her sponsorlu kart görünür biçimde "Sponsorlu" etiketlenir.
Paket fiyatları arayüzde gösterilmez — okullar teklif formuyla iletişime geçer.

Görseller `public/img/schools/<klasör>/cover.jpg` ve `01.jpg`. AI üretimi
oldukları için üzerlerinde **"Temsili görsel"** etiketi durur; gerçek fotoğraf
geldiğinde `SchoolPhoto` bileşenine `real` verilerek kaldırılır.
Ayrıntı: `GORSEL-REHBERI.md`.

## Geliştirme araçları

```bash
node tools/shot.mjs          # tüm ekranların görüntüsünü al (tools/shots/)
node tools/shot.mjs hero     # tek ekran
node tools/check_images.mjs  # sponsor görsellerini denetle
python tools/check_sponsors.py  # sponsor kayıtları veride var mı
```

## Yapı

```
src/
  components/   Navbar, SponsorTicker, Hero, TurkeyMap, ProvincePanel,
                SchoolBrowser, SchoolCard, ReviewDialog, Sponsored,
                HowItWorks, Pricing, Footer, Stars, Crest, SchoolPhoto
  lib/          provinces (plaka/ad eşlemesi), types, reviews, sponsors,
                useData (veri yükleme), format
```

Yığın: Vite + React 19 + TypeScript + Tailwind v4 + GSAP + d3-geo.
