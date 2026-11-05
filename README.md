# Mini Kodlama Dünyası

7 yaşındaki çocuklar için tarayıcıda çalışan, Türkçe ve eğitici bir kodlama oyunu. Oyun HTML, CSS ve düz JavaScript ile yazılır. Sunucu, üyelik veya veritabanı gerekmez.

Bu aşamada projede yalnızca **ortak görsel sistemi** bulunur: tüm mini oyunların kullanacağı karakterler, ikonlar, butonlar, şekiller ve arka planlar. Oyun kodu sonraki adımlarda eklenecek.

## Gereksinimler

- Güncel bir tarayıcı (Chrome, Firefox, Edge veya Safari)
- Görsel üretmek için isteğe bağlı olarak ChatGPT veya benzeri bir araç

## Çalıştırma

Galeri sayfası bütün görselleri açıklamalarıyla birlikte gösterir. Açmak için `gallery/index.html` dosyasını tarayıcıda açman yeterli; sunucu gerekmez.

## Klasör yapısı

```
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
