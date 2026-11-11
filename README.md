# Mini Coding World

7 yaşındaki çocuklar için tarayıcıda çalışan, Türkçe ve eğitici bir kodlama oyunu. Oyun HTML, CSS ve düz JavaScript ile yazılır. Sunucu, üyelik veya veritabanı gerekmez.

Ana ekranda dört mini oyun bulunur: Robotun Yolunu Bul, Komutları Sırala, Eğer Böyleyse ve Tekrar Et. Her oyunda dört zorluk grubunda 20 seviye vardır: Kolay (1–5), Orta (6–10), Zor (11–15) ve Uzman (16–20). Seviyeler sırayla açılır. Bir grup, önceki grup bitmeden açılmaz. Her seviye 1–3 yıldız verir. İlerleme tarayıcının `localStorage` alanında saklanır.

## Oyunlar

| Oyun | Çocuk ne yapar? | Öğrettiği fikir |
|---|---|---|
| **Robotun Yolunu Bul** | Yön oklarını sıraya koyar, robotu taş ve sulardan kaçırarak bayrağa götürür. Uzman seviyelerinde önce altınları toplar. | Sıralı komut (algoritma) |
| **Komutları Sırala** | Diş fırçalama, kek yapma gibi günlük işlerin karışık adım kartlarını doğru sıraya dizer. Uzman seviyelerinde göreve ait olmayan kartları dışarıda bırakır. | Adım adım düşünme |
| **Eğer Böyleyse** | "Eğer taş varsa → Zıpla" gibi kurallar kurar; robot yolda karşılaştığı her şeye kurala göre tepki verir. | Koşul (eğer / değilse) |
| **Tekrar Et** | Aynı hareketleri tek tek eklemek yerine "3 kez tekrarla" bloğunun içine koyar. Blok sınırı bunu gerekli kılar. | Döngü (tekrar) |

Ortak kurallar:

- **Yıldız:** İpucu kullanılırsa 1, ipucusuz bitirilirse 2, ipucusuz ve en kısa/en doğru çözümle bitirilirse 3 yıldız. Bir sonraki seviyeyi açmak için 1 yıldız yeter; yıldız sayısı ilerlemeyi engellemez.
- **Yanlış cevap cezalandırılmaz.** Robot neyin neden olmadığını tek cümleyle söyler, yanlış yer kırmızıyla gösterilir ve çocuk hemen yeniden dener.
- **Dokunmatik ekran:** Sürükle-bırak olan yerlerde dokunarak seçme de çalışır.
- **İpucu** cevabı vermez; sıradaki doğru adımı ya da yanlış yeri gösterir.

## Başarılar: rozetler ve kupalar

Ana ekranın üstünde, yıldız sayacının yanındaki kupa düğmesi **Başarılarım** ekranını açar. Bu ekran kazanılan ve henüz kazanılmamış ödülleri gösterir. Kazanılanlar renkli, kilitliler soluk görünür; kilitli ödülün altında hedefe ne kadar kaldığı yazar (ör. `3/5`).

- **Rozetler** küçük başarılar içindir: kurdeleli, renkli, yuvarlak madalyalar.
- **Kupalar** büyük hedefler içindir: rafta duran büyük altın kupalar, kaidesi oyunun renginde.

| Rozet | Nasıl kazanılır? |
|---|---|
| İlk Oyunum | İlk oyun seviyesini tamamla. |
| Hızlı Başlangıç | Bir oyunda 5 seviye tamamla. |
| Azimli Oyuncu | Bir oyunda 10 seviye tamamla. |
| Usta Kodlayıcı | Bir oyunun 20 seviyesini tamamla. |
| Dört Dörtlük | Dört oyunun tamamında en az bir seviye bitir. |
| Yıldız Avcısı | Toplam 20 yıldız kazan. |
| Yıldız Ustası | Toplam 50 yıldız kazan. |
| Mükemmel Oyuncu | Bir seviyeyi 3 yıldızla tamamla. |
| İpucusuz Kahraman | 5 seviyeyi ipucu kullanmadan tamamla (2 veya 3 yıldızlı seviyeler). |
| Büyük Başarı | Dört oyunun tüm seviyelerini tamamla. |

| Kupa | Nasıl kazanılır? |
|---|---|
| İlk Macera Kupası | Dört oyunun her birinde ilk seviyeyi tamamla. |
| Robot Ustası | Robotun Yolunu Bul oyununu bitir. |
| Algoritma Ustası | Komutları Sırala oyununu bitir. |
| Karar Ustası | Eğer Böyleyse oyununu bitir. |
| Döngü Ustası | Tekrar Et oyununu bitir. |
| Kodlama Şampiyonu | Dört oyunun 80 seviyesinin tamamını bitir. |

Nasıl çalışır:

- Koşulların hepsi `js/core/achievements.js` içinde, tek yerden hesaplanır. Ayrı bir sayaç tutulmaz; koşullar ilerleme kaydındaki yıldızlardan okunur. İpucu kullanılan seviye 1 yıldız aldığı için 2 ve 3 yıldızlı seviyeler ipucusuz sayılır.
- Kazanılan ödüller `localStorage` içinde ayrı bir anahtarda (`mini-coding-world.achievements.v1`) saklanır. Her ödül bir kez kazanılır ve bir kez kutlanır; sayfa yenilense de kaybolmaz.
- Bu özellik eklenmeden önce bitirilmiş seviyeler de sayılır. Bunların ödülleri oyun açılırken sessizce eklenir; çocuğun önüne art arda pencere açılmaz.
- Yeni rozet kazanılınca ekranın üstünde kısa bir kart çıkar ve kendiliğinden kapanır. Yeni kupa kazanılınca konfetili, tam ekran bir kutlama açılır ve **Harika!** ile kapanır. Aynı anda birden çok ödül gelirse sırayla gösterilir.
- Kutlama sesleri ses dosyası kullanmadan tarayıcıda çalınır. Ses, ayarlar penceresindeki **Ses: Açık / Kapalı** düğmesiyle kapatılır; bu tercih de kaydedilir.
- **İlerlemeyi sıfırla** yıldızlarla birlikte rozet ve kupaları da siler.

## Ses ve animasyonlar

Oyun ses dosyası kullanmaz; kısa melodiler tarayıcının Web Audio özelliğiyle çalınır. Böylece tek dosyalık sürüm büyümez ve internet gerekmez.

| Ses | Ne zaman çalar? |
|---|---|
| Doğru | Robot bayrağa ulaşınca ya da Kontrol et doğru çıkınca (kısa, neşeli iki nota) |
| Yanlış | Robot yoldan çıkınca ya da sıralama yanlış çıkınca (yumuşak, korkutmayan iki alçalan nota) |
| Seviye bitti | Sonuç paneli açılınca kısa başarı melodisi |
| Yıldız | Sonuç panelinde her yıldız belirdiğinde; her yıldızda ton biraz yükselir |
| Rozet / Kupa | Yeni ödül kutlamasında |

- **Ses: Açık / Kapalı** ayarı (ayarlar penceresi) bütün seslere uygulanır. Bütün sesler tek yoldan, `sound.play` üzerinden çalar; ses kapalıyken ses altyapısı hiç kurulmaz. Testler bunu sahte bir AudioContext ile ve kaynak kodu tarayarak denetler.
- Oyunlar sesi kendileri oluşturmaz. Oyun ekranı, `mount` seçeneklerinde ortak bir **geri bildirim nesnesi** verir (`feedback.correct()`, `feedback.wrong()`); dört oyun da aynı nesneyi kullanır.

Animasyonlar (hepsi CSS ile; görsel dosyası değişmez):

- **Robot:** Beklerken hafifçe sallanır ve nefes alır. Konuşma balonundaki yazı değişince ağzı oynar. Doğruda sevinçle zıplar, yanlışta yumuşakça kafa sallar. Haritadaki robot da bayrağa ulaşamayınca kafa sallar.
- **Sonuç paneli:** Panel yaylanarak girer, kazanılan yıldızlar tek tek "pop" ile belirir ve ekrana bir kez konfeti yağar.
- **Ekran geçişleri:** Yeni ekran hafifçe kayarak ve belirerek gelir.
- **Düğmeler ve kartlar:** Basınca küçülür, bırakınca yaylanır. Ana ekrandaki oyun kartları ve seviye düğmeleri sırayla içeri girer.
- Cihazda **hareketi azalt** tercihi açıksa bu animasyonlar kapanır ve her şey anında görünür. Animasyonlar tıklamayı engellemez ve oyunu yavaşlatmaz.
- Süreler `css/animations.css` başındaki CSS değişkenlerinde, sonuç panelinin yıldız gecikmeleri `MKD.timing.RESULT` sabitinde toplanır (yıldız sesleri ve görüntü aynı sabitten beslenir).

## Gereksinimler

- Güncel bir tarayıcı (Chrome, Firefox, Edge veya Safari)
- Testleri çalıştırmak için Node.js (LTS). Ek paket gerekmez, `npm install` yapılmaz.
- Görsel üretmek için isteğe bağlı olarak ChatGPT veya benzeri bir araç

## Çalıştırma

İki yol var. İkisinde de kurulum veya derleme gerekmez.

- **Çift tıklama:** `index.html` dosyasını tarayıcıda açarsın.
- **VS Code + Live Server (geliştirirken önerilir):** "Live Server" eklentisini kurarsın. `index.html` dosyasına sağ tıklayıp **Open with Live Server** seçersin. Dosyalar değişince sayfa kendiliğinden yenilenir.

İki yolun ilerleme kayıtları birbirinden ayrıdır. Test ederken hep aynı yolu kullan.

İlerlemeyi sıfırlamak için ana ekrandaki ayarlar (dişli) butonuna basıp **İlerlemeyi sıfırla** seçilir. Sesi açıp kapatma düğmesi de bu penceredir.

Görsel galerisi için `gallery/index.html` açılır.

### Tek dosyalık sürüm (paylaşmak için)

Oyunu başka bir cihaza göndermek için bütün kod ve görseller tek bir HTML dosyasına gömülebilir:

```bash
node tools/build-single-html.js
```

Çıktı `dist/mini-coding-world.html` dosyasıdır (yaklaşık 480 KB). Bu dosya e-posta, mesaj veya USB bellekle gönderilir ve çift tıklanarak açılır; internet gerekmez. `dist/` klasörü sürüm kontrolüne eklenmez, kod değiştikçe komut yeniden çalıştırılır. Tek dosyanın ilerleme kaydı, proje klasöründeki `index.html` kaydından ayrıdır.

### Android sürümü (tablet için)

`mobile/` klasöründe, oyunu Android tablette (Redmi Pad 2 üzerinde denenmek üzere) uygulama olarak açan bir Flutter projesi vardır. Uygulama tek dosyalık sürümü WebView içinde gösterir; internet gerekmez. İlerleme tablette kalır, uygulama kapatılıp açılınca kaybolmaz. Oyun tam ekran açılır ve tablet çevrildikçe döner. Android geri tuşu oyunda bir önceki ekrana döner, ana ekranda uygulamadan çıkar.

Gereksinimler: Flutter (güncel kararlı sürüm) ve Android SDK. Tablette **Geliştirici seçenekleri** ve **USB hata ayıklama** açık olmalıdır.

1. Oyun dosyası üretilir (oyun kodu her değiştiğinde yeniden çalıştırılır):

   ```bash
   node tools/build-mobile-asset.js
   ```

   Çıktı `mobile/assets/game.html` dosyasıdır ve sürüm kontrolüne eklenmez.

2. `mobile/` klasöründe uygulama çalıştırılır veya APK üretilir:

   ```bash
   cd mobile
   flutter run                 # USB ile bağlı tablette açar
   flutter build apk --debug   # build/app/outputs/flutter-apk/app-debug.apk
   ```

Uygulamanın ilerleme kaydı tarayıcıdaki kayıtlardan ayrıdır.

### Testler

Proje klasöründe şu komut çalıştırılır:

```bash
node --test
```

Testler seviye kilidi, grup kilidi, yıldız kaydı, yıldız hesabı ve her rozet ile kupanın koşulunu (tekrar verilmemesi ve yenilemede korunması dahil) denetler. Ayrıca dört oyunun kurallarını ve 80 seviyenin her birinin çözülebildiğini (çözümün sınırlara sığdığını) dener. Ses testleri, ses kapalıyken hiçbir efektin çalmadığını, yanlış sesinin yumuşak ve alçalan olduğunu, yıldız sesinin her yıldızda yükseldiğini ve robotun doğru/yanlış tepkilerini denetler.

Android uygulamasının testleri `mobile/` klasöründe `flutter test` ile çalışır.

## Klasör yapısı

```
index.html                 Uygulama çerçevesi ve script sırası
css/
  base.css                 Renk paleti, butonlar, kartlar, üst çubuk, sürükleme
  animations.css           Ortak animasyonlar: ekran geçişi, düğmeler, robot, sonuç paneli, konfeti
  screens/                 Ana ekran, seviye seçimi, oyun ekranı ve başarılar stilleri
  games/                   Her oyunun kendi stili
js/
  core/                    Ortak çekirdek
    config.js              Sabitler: seviye sayısı, zorluk grupları, kayıt anahtarları
    storage.js             localStorage okuma/yazma
    stars.js               Yıldız hesabı (1–3)
    progress.js            İlerleme, seviye ve grup kilitleri
    achievements.js        Rozet ve kupa koşulları, kazanılan ödüllerin kaydı
    sound.js               Ses efektleri, ses açık/kapalı ayarı ve oyunlara verilen geri bildirim nesnesi
    timing.js              Bekleme, adım süresi, kutlama ve animasyon zamanlaması
    dom.js, components.js  DOM yardımcısı ve ortak arayüz parçaları (robot konuşma balonu dahil)
    drag-drop.js           Fare ve dokunmatikte aynı çalışan sürükle-bırak
    router.js              Ekran geçişleri (#/, #/achievements, #/game/<oyun>, #/game/<oyun>/level/<n>)
    games-registry.js      Oyun listesi
  games/                   Her oyun ayrı klasörde:
    path-finder/           Robotun Yolunu Bul
    command-order/         Komutları Sırala
    if-then/               Eğer Böyleyse
    repeat/                Tekrar Et (harita ve yön tuşlarını path-finder'dan kullanır)
  screens/                 Ana ekran, seviye seçimi, oyun ekranı, ayarlar penceresi,
                           Başarılarım ekranı, rozet/kupa çizimi ve kutlamalar
  app.js                   Başlangıç: servisleri oluşturur, ekranlara verir
tests/                     node --test ile çalışan testler
tools/
  build-single-html.js     Tek dosyalık sürümü üretir (dist/ klasörüne)
  build-mobile-asset.js    Tek dosyalık sürümü Android uygulamasına yazar (mobile/assets/)
mobile/                    Android uygulaması (Flutter, oyunu WebView ile açar)
  lib/                     Uygulama kodu: tam ekran WebView ve geri tuşu
  test/                    flutter test ile çalışan testler
assets/
  characters/    Robot ve diğer karakterler
  backgrounds/   Ekran arka planları
  icons/         Yıldız, kupa, madalya, puan, kilit, ipucu, oyun ikonları
  puzzles/       Geometrik şekiller, harita kareleri, engeller, komut kartları
  ui/            Butonlar, paneller, logo, sayaçlar
  generated/     Ham kaynaklar (mockups/: belgedeki tasarım ekranları)
  asset-manifest.js  Tüm görsellerin listesi ve açıklamaları
gallery/         Görsel galerisi (index.html, gallery.css, gallery.js)
```

## Kod düzeni

- Kod modül sistemi kullanmaz, klasik `<script>` etiketleriyle yüklenir. Böylece dosya çift tıklanarak da çalışır. Script sırası `index.html` içinde belirlenir.
- Bütün kod tek bir ortak nesne (`MKD`) altında toplanır. Başka global değişken oluşturulmaz.
- Servisler (ilerleme, yönlendirme) `app.js` içinde bir kez oluşturulur ve ekranlara parametre olarak verilir.
- Her oyun klasöründe aynı düzen vardır:
  - `engine.js`: oyunun kuralları. Ekrandan bağımsızdır, testler doğrudan bunu çağırır.
  - `levels.js`: 20 seviyenin verisi. Seviyeler buradan kod değiştirmeden düzenlenir; testler her seviyenin çözülebildiğini denetler.
  - `game.js`: ekran ve etkileşim (gerekirse ayrı bir görünüm dosyası: `board-view.js`, `scene-view.js`).
- **Yeni oyun eklemek için:**
  1. `js/games/<oyun-adı>/` klasörü açılır.
  2. Oyun kendini `MKD.gameModules["<oyun-id>"] = { mount(container, { game, level, feedback, onComplete }) }` şeklinde kaydeder.
  3. `games-registry.js` dosyasına oyun bilgisi eklenir.
  4. Dosyalar `index.html` içine eklenir (kurallar, seviyeler, ekran sırasıyla).

  Oyun bitince `onComplete(yıldız)` çağrılır. Doğru ve yanlış anında robotun balonu `bubble.correct(mesaj)` / `bubble.wrong(mesaj)` ile kullanılır (`MKD.components.speechBubble(metin, feedback)`); ses ve robot tepkisi böylece birlikte gelir. Yıldız `MKD.calculateStars({ hintUsed, targetMet })` ile hesaplanır.

## Görsel türleri

| Tür | Uzantı | Nereden geliyor | Kullanım |
|---|---|---|---|
| SVG | `.svg` | Claude Code ile elle çizildi | Kalıcı oyun görseli. Her boyutta net görünür. |
| Tasarımdan kesilen | `.png` | Proje belgesindeki 6 tasarım ekranından kesildi | **Geçici.** Çözünürlükleri düşük (yaklaşık 50–250 px) ve arka planları saydam değil. Yerleşim denemesi ve referans için kullanılır. |
| Yapay zekâ | `.png` | ChatGPT vb. ile üretilir | Karakterler, hayvanlar, detaylı nesneler ve arka planlar. |

Tasarımdan kesilen bir PNG'nin yerine daha iyisi üretildiğinde dosya **aynı adla** üzerine yazılır. Böylece oyun kodunu değiştirmek gerekmez.

## Sanat stili

Bütün görseller aynı kurallarla çizilir:

- Sevimli, çizgi film tarzı. Yuvarlak köşeler, basit şekiller, keskin uç yok.
- Canlı ama yumuşak (pastel) renkler. Aşağıdaki paletten dışarı çıkılmaz.
- **Çerçeve:** 4 px. Siyah değil, şeklin kendi renginin koyu tonu.
- **Gölgelendirme:** Şeklin sağ ve alt kısmında, aynı rengin bir ton koyusu. Sol üstte yarı saydam beyaz bir parlama.
- **Zemin gölgesi:** Serbest duran nesnelerin (yıldız, taş, robot) altında `#1F2D4F` renginde, %12 saydamlıkta bir elips.
- **Butonlar:** Altta 6 px koyu ton kenar ile kabarık görünüm ve beyaz sembol.
- İkon, buton ve şekiller `128×128` görüntü alanında çizilir.

### Renk paleti

| Renk | Ana | Koyu ton | Kullanım |
|---|---|---|---|
| Sarı | `#FFD24D` | `#E8A920` | Yıldız, kupa, puan |
| Mavi | `#4DA6FF` | `#2B7BD9` | Yön komutları, gezinme butonları, Orta grubu |
| Yeşil | `#6CD46C` | `#3DA845` | Başlat, Kolay grubu |
| Mor | `#A97CFF` | `#7C4FE0` | Koşul blokları, ipucu, Zor grubu |
| Turuncu | `#FFA24A` | `#E8781C` | Tekrar blokları, ana sayfa |
| Kırmızı | `#FF6E6E` | `#D94848` | Hedef bayrağı, Uzman grubu |
| Pembe | `#FF8FB7` | `#E0608E` | Süs, çiçek, kalp |
| Gri | `#D9DEE8` | `#A9B1C2` | Pasif ve kilitli öğeler, taş |
| Lacivert | `#1F2D4F` | | Yazı, robot ekranı, gölge |

## Dosya adlandırma

- Küçük harf, İngilizce ve kelimeler tire ile ayrılır: `button-arrow-left.svg`, `robot-wave.png`.
- Önce tür, sonra ayrıntı yazılır: `button-…`, `shape-…`, `tile-…`, `card-game-…`, `block-…`.
- Her SVG dosyasının içinde Türkçe bir `<title>` ve `<desc>` bulunur.
- Yeni bir görsel eklendiğinde `assets/asset-manifest.js` dosyasına da bir satır eklenir. Satırda yol, kategori, kaynak (`svg`, `mockup` veya `ai`) ve kısa açıklama yer alır.

## Oyunda kullanım

```html
<!-- Düz görsel -->
<img src="assets/icons/star.svg" alt="Yıldız" width="48" height="48">

<!-- Buton: SVG görsel olarak, tıklama button öğesinde -->
<button class="icon-button" aria-label="Başlat">
  <img src="assets/ui/button-play.svg" alt="">
</button>
```

```css
/* Arka plan */
.screen { background: url("../assets/backgrounds/meadow.svg") center / cover no-repeat; }

/* Izgara harita karesi */
.cell { background: url("../assets/puzzles/tile-grass.svg") center / contain no-repeat; }

/* Kilitli seviye: aynı görsel soluklaştırılır */
.level.locked img { filter: grayscale(1); opacity: 0.5; }
```

- SVG'ler `width` ve `height` ile istenen boyuta büyütülüp küçültülebilir, netlikleri bozulmaz.
- Yazılı butonlar ("Başlat", "Sağa Git") metin çevrilebilsin ve büyütülebilsin diye CSS ile yapılır. Simge olarak bu klasördeki SVG'ler kullanılır.

## Yapay zekâ ile görsel üretme (ChatGPT)

Karakterler, hayvanlar ve detaylı nesneler ChatGPT ile üretilir. Stilin SVG'lerle uyumlu olması için her isteğin başına şu metin eklenir:

```
Çocuklar için 2D oyun görseli. Sevimli çizgi film tarzı, yuvarlak hatlar, basit şekiller.
Canlı pastel renkler; palet: sarı #FFD24D, mavi #4DA6FF, yeşil #6CD46C, mor #A97CFF,
turuncu #FFA24A, kırmızı #FF6E6E, pembe #FF8FB7, lacivert #1F2D4F.
Her şeklin çevresinde kendi renginin koyu tonunda ince çerçeve, sağ-alt tarafta yumuşak gölge,
sol üstte beyaz parlama. Düz, sade yüzeyler; doku ve fotoğraf gerçekçiliği yok.
Tek nesne, ortalanmış, saydam (transparent) arka plan, PNG, kare format.
Nesne: <buraya nesneyi yaz>
```

Üretilen dosya şöyle kaydedilir:

1. İlgili klasöre koyulur: karakter `characters/`, arka plan `backgrounds/`, nesne `puzzles/` …
2. Adlandırma kuralına uygun bir ad verilir: `characters/cat.png`, `backgrounds/space.png`.
3. Arka plan dışındaki görseller saydam olmalı ve en az 512×512 px boyutunda üretilmelidir.
4. `asset-manifest.js` dosyasına `source: "ai"` ile bir satır eklenir.
5. Ham veya denenmiş ama kullanılmayan çıktılar `generated/` klasörüne konur.
