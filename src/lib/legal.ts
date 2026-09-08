import type { LegalDoc } from './router';

/**
 * Hukuki metinler.
 *
 * KVKK m.10'un zorunlu beş unsuru (veri sorumlusu kimliği, işleme amacı,
 * aktarım, toplama yöntemi ve hukuki sebep, ilgili kişinin hakları) ve
 * 5651 sayılı Kanun'un yer sağlayıcıya yüklediği yükümlülükler esas alındı.
 *
 * Köşeli parantezli alanlar şirket kurulunca doldurulacak. Metinler
 * yayına çıkmadan önce bir avukat tarafından gözden geçirilmelidir —
 * burada yazılanlar hukuki görüş değildir.
 */
export type Block =
  | { t: 'p'; x: string }
  | { t: 'h'; x: string }
  | { t: 'ul'; x: string[] }
  | { t: 'ol'; x: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'note'; x: string };

export type Doc = {
  title: string;
  updated: string;
  intro: string;
  blocks: Block[];
};

const UPDATED = '8 Eylül 2026';

const CONTROLLER = [
  ['Veri sorumlusu', '[Şirket unvanı]'],
  ['Adres', '[Açık adres]'],
  ['MERSİS / Vergi no', '[MERSİS numarası]'],
  ['E-posta', 'kvkk@eniyiokul.com'],
  ['İnternet adresi', 'eniyiokul.com'],
];

export const DOCS: Record<LegalDoc, Doc> = {
  /* ------------------------------------------------------------------ */
  kvkk: {
    title: 'KVKK Aydınlatma Metni',
    updated: UPDATED,
    intro:
      '6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi uyarınca, kişisel verilerinizi kimin, hangi amaçla, hangi hukuki sebebe dayanarak işlediğini ve haklarınızı açıklar.',
    blocks: [
      { t: 'h', x: '1. Veri sorumlusunun kimliği' },
      {
        t: 'p',
        x: 'Kişisel verileriniz, veri sorumlusu sıfatıyla aşağıdaki kuruluş tarafından işlenmektedir.',
      },
      { t: 'table', head: ['Alan', 'Bilgi'], rows: CONTROLLER },

      { t: 'h', x: '2. İşlenen kişisel veriler ve işleme amaçları' },
      {
        t: 'table',
        head: ['Veri kategorisi', 'Hangi veriler', 'İşleme amacı'],
        rows: [
          [
            'Kimlik ve iletişim',
            'Puanlama sırasında belirttiğiniz ad, okulla ilginiz (veli, öğrenci, mezun), bülten aboneliğinde e-posta',
            'Puanın yayımlanması, size ait olduğunun doğrulanması, bülten gönderimi',
          ],
          [
            'Cep telefonu numarası',
            'Puan verebilmek için doğrulanan numara. Yalnızca maskelenmiş biçimde saklanır ve hiçbir ekranda tam gösterilmez.',
            'Hesabın doğrulanması, sahte ve yinelenen puanların engellenmesi',
          ],
          [
            'Değerlendirme verisi',
            'Altı başlıkta verdiğiniz puanlar. Serbest metin yorum alınmaz.',
            'Okul puanlarının hesaplanması ve yayımlanması',
          ],
          [
            'İşlem güvenliği',
            'IP adresi, tarayıcı ve cihaz bilgisi, işlem zamanı',
            'Sahte ve yinelenen puanların engellenmesi, güvenlik, 5651 sayılı Kanun kapsamındaki kayıt yükümlülüğü',
          ],
          [
            'Okul yetkilisi verileri',
            'Teklif formunda verdiğiniz ad, unvan, telefon, e-posta, okul bilgisi',
            'Talebinizin yanıtlanması, sözleşme öncesi görüşmelerin yürütülmesi',
          ],
          [
            'Çerez verileri',
            'Zorunlu çerezler ve, onay verirseniz, ölçümleme çerezleri',
            'Sitenin çalışması ve kullanım istatistikleri',
          ],
        ],
      },

      { t: 'h', x: '3. Kişisel verilerin aktarılması' },
      {
        t: 'p',
        x: 'Verileriniz aşağıdaki alıcı gruplarına, yalnızca belirtilen amaçlarla ve KVKK m.8 ile m.9’daki şartlara uygun olarak aktarılabilir.',
      },
      {
        t: 'table',
        head: ['Alıcı grubu', 'Aktarım amacı'],
        rows: [
          ['Barındırma ve altyapı hizmet sağlayıcıları', 'Sitenin çalıştırılması ve verilerin saklanması'],
          ['E-posta gönderim hizmet sağlayıcısı', 'Bülten ve bildirim gönderimi'],
          ['Ölçümleme hizmet sağlayıcısı', 'Yalnızca açık rızanız varsa, kullanım istatistikleri'],
          ['Yetkili kamu kurum ve kuruluşları', 'Kanunlarda öngörülen hallerde ve talep üzerine'],
        ],
      },
      {
        t: 'p',
        x: 'Hizmet sağlayıcılarımızın sunucuları yurt dışında bulunabilir. Bu durumda aktarım, KVKK m.9 uyarınca yeterlilik kararı, standart sözleşme veya açık rıza dayanaklarından birine göre yapılır ve aktarım yapılan ülkeler bu metinde güncel olarak duyurulur.',
      },

      { t: 'h', x: '4. Toplama yöntemi ve hukuki sebep' },
      {
        t: 'p',
        x: 'Kişisel verileriniz, siteyi kullanmanız ve formları doldurmanız yoluyla elektronik ortamda otomatik olarak toplanır. İşlemenin hukuki sebepleri şunlardır:',
      },
      {
        t: 'ul',
        x: [
          'KVKK m.5/2-c, sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması: teklif talebinizin yanıtlanması.',
          'KVKK m.5/2-ç, veri sorumlusunun hukuki yükümlülüğü: 5651 sayılı Kanun kapsamındaki trafik bilgisi kayıtları.',
          'KVKK m.5/2-f, meşru menfaat: sahte ve yinelenen puanların engellenmesi, platform güvenliği.',
          'KVKK m.5/1, açık rıza: bülten aboneliği ve zorunlu olmayan çerezler.',
        ],
      },
      {
        t: 'note',
        x: 'Puan verirken adınızı yazmak zorunda değilsiniz. Boş bırakırsanız kayıt “İsimsiz veli” olarak görünür.',
      },

      { t: 'h', x: '5. Saklama süreleri' },
      {
        t: 'table',
        head: ['Veri', 'Süre'],
        rows: [
          ['Yayımlanan puan', 'Siz geri çekene kadar'],
          ['Hesaptan çıkarılan puanın kaydı ve gerekçesi', 'Çıkarma tarihinden itibaren 2 yıl'],
          ['5651 kapsamındaki trafik bilgisi', 'Mevzuatta öngörülen süre boyunca'],
          ['Bülten e-postası', 'Abonelikten çıkana kadar'],
          ['Teklif formu verileri', 'Son temastan itibaren 2 yıl'],
        ],
      },

      { t: 'h', x: '6. İlgili kişi olarak haklarınız (KVKK m.11)' },
      {
        t: 'ul',
        x: [
          'Kişisel verinizin işlenip işlenmediğini öğrenme.',
          'İşlenmişse buna ilişkin bilgi talep etme.',
          'İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.',
          'Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü kişileri bilme.',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme.',
          'Şartları oluştuğunda silinmesini veya yok edilmesini isteme.',
          'Düzeltme, silme ve yok etme işlemlerinin aktarım yapılan üçüncü kişilere bildirilmesini isteme.',
          'Münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhinize bir sonuç doğmasına itiraz etme.',
          'Kanuna aykırı işleme sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.',
        ],
      },
      {
        t: 'p',
        x: 'Taleplerinizi kvkk@eniyiokul.com adresine veya yazılı olarak yukarıdaki adrese iletebilirsiniz. Başvurunuz, KVKK m.13 uyarınca en geç otuz gün içinde sonuçlandırılır. İşlemin ayrıca maliyet gerektirmesi hâlinde Kurul tarifesindeki ücret alınabilir.',
      },
      {
        t: 'p',
        x: 'Başvurunuzun reddedilmesi, verilen yanıtı yetersiz bulmanız veya süresinde yanıt verilmemesi hâlinde Kişisel Verileri Koruma Kurulu’na şikâyette bulunabilirsiniz.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  gizlilik: {
    title: 'Gizlilik Politikası',
    updated: UPDATED,
    intro:
      'Hangi verileri neden topladığımızı, çerezleri nasıl kullandığımızı ve tercihlerinizi nasıl yöneteceğinizi anlatır.',
    blocks: [
      { t: 'h', x: 'Kısaca' },
      {
        t: 'ul',
        x: [
          'Okul bilgileri kamuya açık MEB kayıtlarından gelir, kişisel veri içermez.',
          'Puan vermek için hesap açmanız gerekmez.',
          'Adınızı yazmak zorunda değilsiniz.',
          'Verilerinizi satmıyoruz ve reklam amacıyla üçüncü taraflarla paylaşmıyoruz.',
        ],
      },

      { t: 'h', x: 'Çerezler' },
      {
        t: 'table',
        head: ['Tür', 'Ne işe yarar', 'Onay'],
        rows: [
          [
            'Zorunlu',
            'Oturum, güvenlik, tercihlerinizin (örneğin kapatılan bilgi kutusu) hatırlanması',
            'Gerekmez, site bunlar olmadan çalışmaz',
          ],
          ['Ölçümleme', 'Hangi sayfaların kullanıldığını toplu ve anonim biçimde görmek', 'Açık rızanıza bağlı'],
          ['Reklam', 'Kullanılmıyor', 'Yok'],
        ],
      },
      {
        t: 'p',
        x: 'Çerez tercihlerinizi site altındaki çerez ayarlarından istediğiniz zaman değiştirebilirsiniz. Tarayıcınızın ayarlarından da çerezleri engelleyebilirsiniz; bu durumda sitenin bazı bölümleri çalışmayabilir.',
      },

      { t: 'h', x: 'Değerlendirmeleriniz' },
      {
        t: 'p',
        x: 'Yazdığınız değerlendirme, verdiğiniz ad (ya da “İsimsiz veli”) ve okulla ilginiz herkese açık olarak yayımlanır. E-posta adresiniz ve teknik kayıtlar hiçbir zaman yayımlanmaz.',
      },
      {
        t: 'p',
        x: 'Verdiğiniz puanı istediğiniz zaman güncelleyebilir veya geri çekebilirsiniz. Geri çektiğinizde okulun ortalamasından da düşer.',
      },

      { t: 'h', x: 'Güvenlik' },
      {
        t: 'p',
        x: 'Veriler şifreli bağlantı (HTTPS) üzerinden taşınır, erişim yetkilendirmeyle sınırlandırılır ve kayıtlar düzenli olarak yedeklenir. Bir veri ihlali olması hâlinde, KVKK m.12 uyarınca Kurul’a ve ilgili kişilere gecikmeksizin bildirim yapılır.',
      },

      { t: 'h', x: 'Çocukların verileri' },
      {
        t: 'p',
        x: 'Platform velilere yöneliktir. Serbest metin alınmadığı için öğrenciye ilişkin bir bilginin yayımlanması söz konusu değildir; yalnızca altı başlıktaki puanlar kaydedilir.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  kosullar: {
    title: 'Kullanım Koşulları',
    updated: UPDATED,
    intro: 'Platformu kullanırken geçerli olan kurallar ve tarafların sorumlulukları.',
    blocks: [
      { t: 'h', x: '1. Platformun konumu' },
      {
        t: 'p',
        x: 'eniyiokul, 5651 sayılı İnternet Ortamında Yapılan Yayınların Düzenlenmesi ve Bu Yayınlar Yoluyla İşlenen Suçlarla Mücadele Edilmesi Hakkında Kanun anlamında yer sağlayıcıdır. Platformda serbest metin yorum yayımlanmaz; kullanıcılar yalnızca altı başlıkta puan verir. Puanlar, veren kişinin kendi görüşüdür.',
      },
      {
        t: 'p',
        x: 'Kurum bilgileri (ad, tür, ilçe, adres, telefon) Millî Eğitim Bakanlığı Özel Öğretim Kurumları Genel Müdürlüğü’nün kamuya açık kayıtlarından alınır. Bu bilgilerdeki hataların kaynağı resmî kayıt olabilir; düzeltme talebinizi bize iletebilirsiniz.',
      },

      { t: 'h', x: '2. Puan verirken' },
      {
        t: 'ul',
        x: [
          'Yalnızca kendi doğrudan deneyiminize dayanarak puan verin.',
          'Aynı okula birden fazla kez puan vermeyin.',
          'Bir okul adına ya da bir okulun rakibi adına puan vermeyin.',
          'Verdiğiniz puanı istediğiniz zaman güncelleyebilir veya geri çekebilirsiniz.',
        ],
      },
      {
        t: 'p',
        x: 'Ayrıntılı ölçütler Puanlama Kuralları sayfasında. Kurallara aykırı puanlar hesaptan çıkarılır, tekrarlanması hâlinde erişiminiz kısıtlanabilir.',
      },

      { t: 'h', x: '3. Başvuru ve itiraz' },
      {
        t: 'p',
        x: 'Bir içerik nedeniyle haklarının ihlal edildiğini düşünen kişi, 5651 sayılı Kanun’un 9. maddesi uyarınca bize başvurarak içeriğin yayından çıkarılmasını isteyebilir. Başvuru bize ulaştığı tarihten itibaren iki gün içinde sonuçlandırılır ve karar gerekçesiyle birlikte bildirilir.',
      },
      {
        t: 'p',
        x: 'Hâkim kararı, idari yaptırım kararı veya gecikmesinde sakınca bulunan hâllere ilişkin usulüne uygun bir bildirim ulaştığında, karar en geç yirmi dört saat içinde uygulanır.',
      },
      { t: 'p', x: 'Başvuru adresi: bildirim@eniyiokul.com' },

      { t: 'h', x: '4. Okulların hakları' },
      {
        t: 'ul',
        x: [
          'Kurum bilgilerinin düzeltilmesini isteme hakkı.',
          'Kurallara aykırı olduğunu düşündüğü bir puanı bildirme hakkı.',
          'Verilen karara itiraz etme hakkı.',
        ],
      },
      {
        t: 'note',
        x: 'Bir puanın hesaptan çıkarılması yalnızca yayımlanmış kurallara aykırılık hâlinde mümkündür. Sponsorluk ilişkisi, puanın çıkarılması veya değiştirilmesi için gerekçe oluşturmaz.',
      },

      { t: 'h', x: '5. Sponsorlu içerik' },
      {
        t: 'p',
        x: 'Sponsorlu yerleşimler ticari nitelikte olup her ekranda “Sponsorlu” ibaresiyle işaretlenir. Sponsorluk okulun listedeki sırasını etkiler, değerlendirme puanını ve puana göre yapılan sıralamayı etkilemez.',
      },

      { t: 'h', x: '6. Sorumluluğun sınırı' },
      {
        t: 'p',
        x: 'Platformdaki puanlar kullanıcıların kişisel görüşlerini yansıtır, platform bu görüşlerin doğruluğunu garanti etmez. Okul seçimi gibi kararlarınızı yalnızca buradaki bilgilere dayandırmayın; okulu ziyaret edin ve resmî kaynaklardan doğrulayın.',
      },

      { t: 'h', x: '7. Uygulanacak hukuk' },
      {
        t: 'p',
        x: 'Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır. Uyuşmazlıklarda [şehir] mahkemeleri ve icra daireleri yetkilidir. Tüketici sıfatını taşıyan kullanıcıların tüketici hakem heyetlerine ve tüketici mahkemelerine başvurma hakkı saklıdır.',
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  puanlama: {
    title: 'Puanlama Kuralları',
    updated: UPDATED,
    intro:
      'Puanların güvenilirliğini korumak amacıyla platformda yalnızca SMS ile doğrulanmış hesaplar değerlendirme yapabilir. Uygulanan her ölçüt önceden ve açıkça burada yazılıdır; yayımlanmamış bir kural uygulanmaz.',
    blocks: [
      { t: 'h', x: 'Neden yazılı yorum almıyoruz' },
      {
        t: 'p',
        x: 'Serbest metin, bir okul hakkında en çok gürültü üreten şey. Hakaret, dedikodu, kişisel hesaplaşma ve rakip okul yorumları hep oradan geliyor. Yalnızca puan aldığımızda herkes aynı altı başlığı dolduruyor, okullar aynı ölçütle karşılaştırılabiliyor ve içerik denetimi tartışması baştan doğmuyor.',
      },
      {
        t: 'p',
        x: 'Bunun bedeli, ayrıntının kaybolması. Bu yüzden başlıkları altıya çıkardık: tek bir ortalama yerine akademik başarıdan servis ve iletişime kadar ayrı ayrı görüyorsunuz.',
      },

      { t: 'h', x: 'Kim puan verebilir' },
      {
        t: 'ul',
        x: [
          'Yalnızca cep telefonu SMS ile doğrulanmış hesaplar. Doğrulanmamış hesap puan veremez.',
          'Okulla doğrudan deneyimi olanlar: veli, mezun veli, öğrenci, mezun.',
          'Bir numara bir hesaptır ve bir okula yalnızca bir kez puan verebilir.',
          'Verdiğiniz puanı istediğiniz zaman güncelleyebilir veya geri çekebilirsiniz.',
        ],
      },
      {
        t: 'note',
        x: 'Numaranız yalnızca doğrulama için kullanılır, maskelenerek saklanır ve hiçbir ekranda tam hâliyle gösterilmez.',
      },

      { t: 'h', x: 'Puan hesaptan çıkarılır' },
      {
        t: 'table',
        head: ['Gerekçe', 'Kapsam'],
        rows: [
          [
            'Çıkar çatışması',
            'Okulun kendisi, çalışanı veya rakip bir okul tarafından verildiği tespit edilen puanlar',
          ],
          [
            'Toplu ve yapay puanlama',
            'Kısa sürede aynı kaynaktan gelen, aynı örüntüyü taşıyan puan yığınları',
          ],
          [
            'Yinelenen puan',
            'Aynı kişinin aynı okul için birden fazla kayıt açması',
          ],
          [
            'Deneyim yokluğu',
            'Okulla hiçbir ilişkisi bulunmadığı anlaşılan kullanıcıların puanları',
          ],
          [
            'Yasal zorunluluk',
            'Usulüne uygun mahkeme veya yetkili merci kararı',
          ],
        ],
      },

      { t: 'h', x: 'Puanın silinmeyeceği durumlar' },
      {
        t: 'ul',
        x: [
          'Okul yönetiminin talebi veya memnuniyetsizliği.',
          'Okulun sponsorluk veya kurumsal anlaşması bulunması.',
          'Puan ortalamasının düşük veya eleştirel olması.',
          'Somut kural ihlali içermeyen genel itirazlar.',
        ],
      },

      { t: 'h', x: 'İtiraz süreci' },
      {
        t: 'ol',
        x: [
          'Bildirim bize ulaşır (bildirim@eniyiokul.com).',
          'Puan, yalnızca yukarıdaki ölçütlere göre incelenir.',
          'Karar en geç iki gün içinde verilir ve gerekçesiyle birlikte bildirilir.',
          'Karara itiraz edilebilir. İtirazı ilk kararı veren kişi incelemez.',
          'Çıkarılan puanın kaydı ve gerekçesi iki yıl saklanır.',
        ],
      },

      { t: 'h', x: 'Ortalamanın gösterimi' },
      {
        t: 'ul',
        x: [
          'Ortalamanın yanında her zaman kaç kişinin puanladığı yazar.',
          'Hiç puanlanmamış okul “Puanlanmadı” olarak görünür; sıfır puan almış gibi gösterilmez.',
          'Altı başlığın her biri ayrı ayrı da gösterilir, yalnızca ortalama verilmez.',
        ],
      },

      { t: 'h', x: 'Şeffaflık raporu' },
      {
        t: 'p',
        x: 'Her ay şu sayıları yayımlıyoruz: verilen puan sayısı, gelen bildirim sayısı, hesaptan çıkarılan puan sayısı ve gerekçe dağılımı, itiraz sayısı ve itiraz sonucu değişen karar sayısı.',
      },
      {
        t: 'note',
        x: 'Bu bir prototip. İlk şeffaflık raporu platform yayına girdikten sonraki ilk ayın sonunda yayımlanacak.',
      },
    ],
  },
};
