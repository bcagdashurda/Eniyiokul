# Sponsorlu okul görselleri — üretim rehberi

> [!IMPORTANT]
> ### CLAUDE İÇİN GÜNCELLEME VE DÜZENLEME NOTU
> 1. **Görsel Üretim Limiti & Okul Sayısı:** AI oturum limitine (session limit) takılmamak adına ve site şu anda demo aşamasında olduğu için okul başına 3-4 görsel yerine **2 görsel** (`cover.jpg` [16:9 dış cephe/kampüs] ve `01.jpg` [3:2 derslik/iç mekân]) üretilmiştir.
> 2. **3 Sponsorlu Okul Hazır:** Toplam 6 okul yerine ilk **3 okulun** görselleri üretilmiş ve `public/img/schools/` altına yerleştirilmiştir:
>    - `public/img/schools/bursa-arena/` (`cover.jpg`, `01.jpg`)
>    - `public/img/schools/cekirge-bilimsel/` (`cover.jpg`, `01.jpg`)
>    - `public/img/schools/anakent-koleji/` (`cover.jpg`, `01.jpg`)
> 3. **Diğer Sponsorların Kaldırılması:** Görseli üretilmeyen diğer 3 okul (`baskent-ayseabla`, `arkas-piri-reis`, `antalya-aci`) `src/lib/sponsors.ts` içerisindeki `PLACEMENTS` listesinden kaldırılmalı; sitede sadece görselleri hazır olan bu 3 okul sponsorlu olarak tutulmalıdır.
> 4. **Yeni Navbar Logosu:** `public/img/logo.jpg` konumuna özel olarak tasarlanmış modern bir logo (açık kitap, mezuniyet kepi ve pusula/konum pini motifli) yerleştirildi. `src/components/Navbar.tsx` içindeki `<Mark />` SVG ikonu yerine bu görselin eklenmesi ve navbar tasarımına entegre edilmesi gerekiyor.
> 5. **Kontrol Aracı:** `tools/check_images.mjs` dosyası oluşturulmuştur (`node tools/check_images.mjs` komutu ile okul görsellerinin durumunu denetleyebilirsiniz).

## Klasör yapısı

Görselleri şu klasörlere koy. Klasör adları koddaki `img` alanıyla birebir aynı olmalı
(`src/lib/sponsors.ts`). Dosya yoksa arayüz sessizce armaya (monogram) döner, hata vermez.

```
public/img/schools/
  bursa-arena/          Özel Bursa Arena Yusuf Ziya Karakuş Anadolu Lisesi  (Bursa / Nilüfer)
    cover.jpg
    01.jpg  02.jpg  03.jpg
  cekirge-bilimsel/     Özel Çekirge Bilimsel Farklılık Fen Lisesi          (Bursa / Osmangazi)
  anakent-koleji/       Özel Anakent Koleji Anadolu Lisesi                  (İstanbul / Kadıköy)
  baskent-ayseabla/     Başkent Üniversitesi Özel Ayşeabla Fen Lisesi       (Ankara / Çankaya)
  arkas-piri-reis/      Özel Arkas Piri Reis Anadolu Lisesi                 (İzmir / Bornova)
  antalya-aci/          Özel Antalya Açı Fen Lisesi                         (Antalya / Muratpaşa)
```

## Okul başına kaç görsel?

**4 adet.**

| Dosya | Oran | Boyut | Nerede görünür |
|---|---|---|---|
| `cover.jpg` | 16:9 | 1600 × 900 | Vitrin kartı, liste kartı, profil başlığı |
| `01.jpg` | 3:2 | 1200 × 800 | Profil galerisi |
| `02.jpg` | 3:2 | 1200 × 800 | Profil galerisi |
| `03.jpg` | 3:2 | 1200 × 800 | Profil galerisi |

- Format **JPEG**, kalite ~82, dosya başına **300 KB altı** tut.
- `cover` her zaman **dış cephe / kampüs** olsun — kartta en çok o görünüyor.
- Galeri üçlüsü sırayla: **derslik**, **laboratuvar veya kütüphane**, **sosyal alan / spor**.

## Tüm görsellerde ortak kurallar

Bunlar tek tek prompta yazılacak; site bütünlüğü buna bağlı:

1. **Yazı yok.** Tabela, logo, pano, okul adı — hiçbiri olmasın. AI yazıları bozuk çıkarır
   ve gerçek olmayan bir okul adı üretir.
2. **Tanınabilir yüz yok.** Öğrenci görünsün ama uzaktan, arkadan ya da bulanık.
3. **Bayrak, arma, sembol yok.**
4. **Aynı ışık dili:** gündüz, doğal ışık, hafif bulutlu, yumuşak gölge. Hepsinde aynı olsun.
5. **Aynı renk dili:** sitenin markası petrol yeşili/teal. Görsellerde soğuk-nötr tonlar,
   beyaz-gri cephe, cam, ahşap ve yeşil bitki. Turuncu/kırmızı baskın olmasın.
6. **Fotoğraf gerçekçiliği**, illüstrasyon değil. Mimari fotoğrafçılık dili.
7. **Geniş açı, düz perspektif** (balık gözü ve aşırı eğim yok).

## Ortak prompt eki

Aşağıdaki her prompta bu satırı ekle:

```
photorealistic architectural photography, natural daylight, soft overcast light,
neutral cool color grading, teal and grey and white palette, no text, no signage,
no logos, no flags, no readable writing anywhere, no recognizable faces,
wide angle, straight-on perspective, high detail, 35mm lens look
```

---

## Prompt'lar

### 1. `bursa-arena/` — Bursa, Nilüfer (Anadolu lisesi, geniş kampüs)

**cover.jpg**
```
Modern Turkish private high school campus exterior, three-storey building with
white render and large grey aluminium window frames, glass entrance canopy,
neatly trimmed lawn and young plane trees in front, wide paved forecourt,
low hills visible in the far background, empty campus, morning light
```

**01.jpg**
```
Bright modern high school classroom interior, rows of light wood desks,
large windows along one wall, interactive whiteboard on the front wall,
pale grey walls, empty room, clean and orderly
```

**02.jpg**
```
High school science laboratory, black lab benches with sinks and gas taps,
glassware neatly arranged on shelves, tall windows, a few students in plain
uniforms seen from behind working at a bench
```

**03.jpg**
```
Indoor school sports hall with wooden floor and line markings, basketball hoops,
high ceiling with skylights, retractable seating on one side, empty hall
```

---

### 2. `cekirge-bilimsel/` — Bursa, Osmangazi (fen lisesi, şehir içi)

**cover.jpg**
```
Compact urban private science high school building, four storeys, warm beige stone
and glass facade, narrow street frontage with mature trees, city apartment blocks
alongside, small paved entrance plaza with bollards, wooded hillside behind the city
```

**01.jpg**
```
Small focused science high school classroom, twenty desks, whiteboard covered with
handwritten-looking mathematical diagrams that are illegible and blurred,
daylight from side windows, empty room
```

**02.jpg**
```
School physics laboratory, optical benches and measuring instruments on tables,
wall cabinets with equipment, cool daylight, two students in plain uniforms
seen from behind
```

**03.jpg**
```
School library reading room, floor to ceiling wooden bookshelves, long study tables
with individual reading lamps, warm wood and pale grey palette, a few students
seated far from camera seen from behind
```

---

### 3. `anakent-koleji/` — İstanbul, Kadıköy (köklü kolej, hazırlık sınıflı)

**cover.jpg**
```
Established private college campus in a dense Istanbul neighbourhood, five-storey
building combining older stone lower floors with a modern glass upper extension,
mature plane trees lining the pavement, wrought iron perimeter fence,
wide steps up to a covered entrance, overcast daylight
```

**01.jpg**
```
Language preparatory classroom, U-shaped desk arrangement, projector screen,
world map poster with no readable text, tall windows with city view, empty room
```

**02.jpg**
```
School computer laboratory, rows of desktop workstations on light desks,
cable management tidy, acoustic ceiling, cool neutral lighting, empty room
```

**03.jpg**
```
Covered school courtyard used for breaks, columns and glass roof, wooden benches,
potted plants, a few students walking in the distance seen from behind
```

---

### 4. `baskent-ayseabla/` — Ankara, Çankaya (üniversite kampüsü içinde)

**cover.jpg**
```
Private science high school building inside a university campus, modern low-rise
architecture with horizontal bands of glass and pale concrete, broad pedestrian
walkway lined with young trees, other campus buildings visible in the background,
Ankara plateau light, crisp clear day
```

**01.jpg**
```
University-style high school lecture classroom, tiered seating with continuous
desks, large whiteboard, ceiling projector, cool grey and light wood palette, empty
```

**02.jpg**
```
Advanced school chemistry laboratory with fume hoods, stainless steel benches,
safety shower, glassware on shelves, clinical white and grey palette, empty room
```

**03.jpg**
```
Campus outdoor study terrace, concrete planters, wooden bench seating,
students at a distance seen from behind, trees and lawn, clear daylight
```

---

### 5. `arkas-piri-reis/` — İzmir, Bornova (yabancı dil ağırlıklı, yeşil kampüs)

**cover.jpg**
```
Aegean private high school campus, two-storey buildings with white walls and
terracotta tiled roofs, arcaded walkway, tall cypress and olive trees,
generous green lawn, Mediterranean vegetation, bright clear morning light
```

**01.jpg**
```
Modern language classroom, round tables for group work, colourful but muted
wall panels, large windows opening to greenery, empty room
```

**02.jpg**
```
School library with double height space, mezzanine walkway, timber shelving,
soft daylight from clerestory windows, reading armchairs, empty
```

**03.jpg**
```
Outdoor school sports field with running track and green pitch, low stands,
cypress trees along the boundary, hills behind, empty field, clear day
```

---

### 6. `antalya-aci/` — Antalya, Muratpaşa (fen lisesi, Akdeniz)

**cover.jpg**
```
Mediterranean private science high school, modern white building with deep
horizontal shading fins over the windows, palm trees and bougainvillea in the
forecourt, bright limestone paving, strong sunlight with soft shadows, clear sky
```

**01.jpg**
```
Science high school classroom with sun shading louvres outside the windows,
light wood desks, whiteboard, bright but not harsh daylight, empty room
```

**02.jpg**
```
School biology laboratory, microscopes lined up on white benches, plant specimens
on the windowsill, tall bright windows, one student seen from behind
```

**03.jpg**
```
Outdoor school courtyard with pergola shading, stone paving, planted beds,
long benches, palm trees, students in the far distance seen from behind
```

---

## Görseller hazır olduğunda

Klasörlere at, başka bir şey yapman gerekmiyor — arayüz onları otomatik alır.

Kontrol için:

```
node tools/check_images.mjs
```

## Bir uyarı

Bu okullar **gerçek**; görseller ise AI üretimi. Bir velinin bunu gerçek kampüs
fotoğrafı sanması yanıltıcı olur. Bu yüzden her görselin köşesine arayüz otomatik
olarak küçük bir **“Temsili görsel”** etiketi koyuyor. Gerçek fotoğraflar geldiğinde
`src/lib/sponsors.ts` içinde ilgili okulun `gercekFoto: true` alanını açman yeterli;
etiket kalkar.
