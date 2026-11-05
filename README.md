# Mini Kodlama Dünyası

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

## Gereksinimler

- Güncel bir tarayıcı (Chrome, Firefox, Edge veya Safari)
- Testleri çalıştırmak için Node.js (LTS). Ek paket gerekmez, `npm install` yapılmaz.
- Görsel üretmek için isteğe bağlı olarak ChatGPT veya benzeri bir araç

## Çalıştırma

İki yol var. İkisinde de kurulum veya derleme gerekmez.

- **Çift tıklama:** `index.html` dosyasını tarayıcıda açarsın.
- **VS Code + Live Server (geliştirirken önerilir):** "Live Server" eklentisini kurarsın. `index.html` dosyasına sağ tıklayıp **Open with Live Server** seçersin. Dosyalar değişince sayfa kendiliğinden yenilenir.

İki yolun ilerleme kayıtları birbirinden ayrıdır. Test ederken hep aynı yolu kullan.

İlerlemeyi sıfırlamak için ana ekrandaki ayarlar (dişli) butonuna basıp **İlerlemeyi sıfırla** seçilir.

Görsel galerisi için `gallery/index.html` açılır.

### Testler

Proje klasöründe şu komut çalıştırılır:

```bash
node --test
```

Testler seviye kilidi, grup kilidi, yıldız kaydı ve yıldız hesabı kurallarını denetler. Ayrıca dört oyunun kurallarını ve 80 seviyenin her birinin çözülebildiğini (çözümün sınırlara sığdığını) dener.

## Klasör yapısı

```
index.html                 Uygulama çerçevesi ve script sırası
css/
  base.css                 Renk paleti, butonlar, kartlar, üst çubuk, sürükleme
  screens/                 Ana ekran, seviye seçimi ve oyun ekranı stilleri
  games/                   Her oyunun kendi stili
js/
  core/                    Ortak çekirdek
    config.js              Sabitler: seviye sayısı, zorluk grupları, kayıt anahtarı
    storage.js             localStorage okuma/yazma
    stars.js               Yıldız hesabı (1–3)
    progress.js            İlerleme, seviye ve grup kilitleri
    dom.js, components.js  DOM yardımcısı ve ortak arayüz parçaları (robot konuşma balonu dahil)
    drag-drop.js           Fare ve dokunmatikte aynı çalışan sürükle-bırak
    router.js              Ekran geçişleri (#/, #/game/<oyun>, #/game/<oyun>/level/<n>)
    games-registry.js      Oyun listesi
  games/                   Her oyun ayrı klasörde:
    path-finder/           Robotun Yolunu Bul
    command-order/         Komutları Sırala
    if-then/               Eğer Böyleyse
    repeat/                Tekrar Et (harita ve yön tuşlarını path-finder'dan kullanır)
  screens/                 Ana ekran, seviye seçimi, oyun ekranı, ayarlar penceresi
  app.js                   Başlangıç: servisleri oluşturur, ekranlara verir
tests/                     node --test ile çalışan testler
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
  2. Oyun kendini `MKD.gameModules["<oyun-id>"] = { mount(container, { game, level, onComplete }) }` şeklinde kaydeder.
  3. `games-registry.js` dosyasına oyun bilgisi eklenir.
  4. Dosyalar `index.html` içine eklenir (kurallar, seviyeler, ekran sırasıyla).

  Oyun bitince `onComplete(yıldız)` çağrılır. Yıldız `MKD.calculateStars({ hintUsed, targetMet })` ile hesaplanır.

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
