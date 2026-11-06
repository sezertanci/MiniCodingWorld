# İlerleme Notları

Bu dosya, sohbet sıkıştırıldığında veya yeni bir oturuma geçildiğinde işe kaldığı yerden devam etmek içindir.

## Kaynak

İş tanımı: "Mini Kodlama Dünyası — Claude Code Promptları ve Görseller" belgesi (repoda değil). Belgede 7 prompt ve 6 örnek ekran görseli var.

## Çalışma düzeni (kullanıcıyla anlaşılanlar)

- Kullanıcı bilgi verirken hiçbir şey yapılmaz. İşe yalnızca açıkça "başla" veya "uygula" denince geçilir.
- Promptlar sırayla uygulanır. Kullanıcı bir promptu "tamam" diye onaylamadan sonrakine geçilmez.
- Her prompt ayrı bir commit olur. Commit kullanıcı onayladıktan sonra atılır. Push yalnızca kullanıcı isterse yapılır.
- Proje klasörü PascalCase (`MiniKodlamaDunyasi`). Web klasör ve dosyaları küçük harf ve tireyle yazılır (`button-play.svg`). C# yazılırsa PascalCase kullanılır.
- Teknoloji: düz HTML, CSS ve JS, klasik `<script>` etiketleri (ES modülü yok). Tüm kod tek ortak nesne `MKD` altında. Testler `node --test` ile çalışır.
- Geliştirme bölünmüş dosyalarla yapılır. Bütün promptlar bitince Node.js betiğiyle tek bir paylaşılabilir HTML dosyası üretilecek ve kullanıcı bunu kendi cihazında test edecek.
- Görseller: SVG'leri Claude çizer. Karakter ve hayvan görselleri kullanıcı tarafından ChatGPT ile üretilir (stil promptu README'de). Tasarımdan kesilen PNG'ler geçicidir, gerekirse kullanılırken değiştirilir.

## Yapılanlar

- [x] Görsel sistemi: commit `624529d`
- [x] Prompt 1 (iskelet, ilerleme ve kilit sistemi, geçici oyun ekranı, ayarlarda "İlerlemeyi sıfırla"). Kullanıcı çift tıklama dahil test edip onayladı. Commit `c7ff1d3`.
- [x] Prompt 2 (ana ekran ve seviye seçimi tasarımı). Kullanıcı onayladı, commit atıldı.
  - Logo CSS yazısıyla yapıldı (kesilen logo.png'nin arka planı saydam değildi). Dört oyun ikonu SVG olarak çizildi (`assets/icons/game-*.svg`).
  - Ana ekran: robot her genişlikte başlığın solunda (ekran daraldıkça küçülür; kullanıcı isteği), kartlarda ilerleme çubuğu, seviye sayısı ve yıldız.
  - Seviye seçimi: başlıkta oyun ikonu, grup başlığında "x/5", kilitli grupta "Önce … seviyelerini bitir" ipucu, sıradaki seviye sarı halkayla vurgulanır (`progress.getNextLevel`).

- [x] Prompt 3 (Robotun Yolunu Bul). Kullanıcı onayladı, commit atıldı.
  - Dosyalar: `js/games/path-finder/` (`engine.js` kurallar ve BFS ipucu, `levels.js` 20 seviye, `board-view.js` harita çizimi, `game.js` ekran), `css/games/path-finder.css`, `tests/path-finder.test.js`.
  - Harita işaretleri: S başlangıç, G bayrak, # taş, ~ su, * altın, . çimen. Uzman seviyelerinde altın toplama ve komut sınırı var.
  - 3 yıldız: ipucu yok ve komut sayısı en kısa çözüm kadar. Çözüm ekranda gösterilmez; testler her seviyenin çözülebildiğini denetler.
  - Kullanıcı isteğiyle: komut listesi haritanın üstünde, başlıksız; sayaç sağ üst köşede rozet. Robot geçtiği karelere yön oku bırakır (karede son geçişin oku), başlangıç karesi kesik çizgili. Telefonda Başlat normal boyutta.
  - Masaüstü ve telefonda tarayıcıda denendi; 74 test geçiyor.

- [x] Prompt 4 (Komutları Sırala). Otomatik modda yapıldı, commit atıldı.
  - Ortak parçalar: `MKD.components.speechBubble` (robot balonu), `.game-layout`, `js/core/drag-drop.js` (Pointer Events ile sürükle-bırak; dokunuş tıklama sayılır), `.btn-hint` base.css'e taşındı.
  - Dosyalar: `js/games/command-order/` (`engine.js`, `levels.js`, `game.js`), `css/games/command-order.css`, `tests/command-order.test.js`.
  - Kartlar dokunarak (seçili ya da ilk boş kutuya) veya sürüklenerek yerleşir. Zor/Uzman seviyelerinde kutular aşama başlıklarıyla gruplanır; Uzman'da göreve ait olmayan kartlar var.
  - Yanlışta yalnızca ilk yanlış kutu ve nedeni söylenir. 3 yıldız: ipucu yok ve hiç yanlış kontrol yok.

- [x] Prompt 5 (Eğer Böyleyse). Otomatik modda yapıldı, commit atıldı.
  - Dosyalar: `js/games/if-then/` (`engine.js`, `levels.js`, `scene-view.js`, `game.js`), `css/games/if-then.css`, `tests/if-then.test.js`, yeni `assets/puzzles/door.svg`.
  - Robot düz bir yolda ilerler; her karede ilk uyan "Eğer ... varsa" kuralını, hiçbiri uymazsa "Değilse" hareketini uygular. Her nesnenin tek doğru hareketi var (taş→Zıpla, su→Köprü Kur, kapı→Kapıyı Aç, yıldız→Topla, boş→İleri Git).
  - Kolay: tek kural, "Değilse" hazır. Orta: kural + değilse. Zor: 2 kural. Uzman: 3 kural. Testler her seviyenin bloklarla çözülebildiğini dener.
  - 3 yıldız: ipucu yok ve ilk çalıştırmada doğru. Yanlışta hangi kuralın çalıştığı ve neden olmadığı söylenir.
  - Ortak düzeltmeler: sürüklenen öğedeki resmin tarayıcıya özgü sürüklenmesi kapatıldı; `.game-stage` tek sütunu ekran genişliğini aşmaz.

- [x] Prompt 6 (Tekrar Et). Otomatik modda yapıldı, commit atıldı.
  - Dosyalar: `js/games/repeat/` (`engine.js`, `levels.js`, `game.js`), `css/games/repeat.css`, `tests/repeat.test.js`.
  - Harita, hareket kuralları, yön tuşları ve görünüm Robotun Yolunu Bul'dan gelir (`MKD.pathFinder`; `COMMANDS` ve `obstacleName` oradan dışa açıldı).
  - Program: tek oklar ve turuncu "N kez tekrarla" blokları (2–6 kez, −/+ ile). Tekrarla bloğuna dokununca eklenen oklar içine girer; "Dışarıya ekle" ile çıkılır. İç içe tekrar yok.
  - Her seviyede blok sınırı var ve tek tek oklarla sığmaz; çocuk tekrar bloğunu kullanmak zorunda kalır. Çalışırken blokta "2/3" tur rozeti görünür.
  - Yanlışta: ilk turda çarparsa yanlış ok, sonraki turda çarparsa tekrar sayısı önerilir. 3 yıldız: ipucu yok ve blok sayısı çözümdeki kadar.

- [x] Prompt 7 (son kontrol). Otomatik modda yapıldı, commit atıldı.
  - Kontrol listesi tarayıcıda denendi: dört oyunda 20 seviye, grup kilitleri, kilitli seviyeye adresle girilemiyor, biten seviye yeniden oynanabiliyor, ilerleme yenilemede korunuyor, konsolda hata yok.
  - Geçici deneme oyunu (`placeholder-game.js`) ve stilleri kaldırıldı; kullanılmayan `MKD.STARS` dışa açılması silindi.
  - Telefonda Komutları Sırala kart yazısı 13 → 14 px yapıldı (kartlar 100×94 px; uzun kelime taşmaz).
  - README oyunları, yıldız kuralını ve klasör düzenini anlatacak şekilde güncellendi.

- [x] Tek HTML betiği: `node tools/build-single-html.js` → `dist/mini-kodlama-dunyasi.html` (~210 KB, `dist/` git'e girmez). CSS/JS gömülür, görseller base64 veri adresine çevrilir. Testi: `tests/build-single-html.test.js`. Sunucudan açılınca hiçbir ek dosya isteği yapmadığı denendi.

- [x] Uçtan uca son kontrol (2026-11-06): sıfır ilerlemeyle ana ekran → seviye → 3 yıldız → sonraki seviye → yenileme → ayarlardan sıfırlama zinciri denendi. 80 seviye telefonda (375 px), tablette (768 px) ve masaüstünde (1280 px) taşmasız açılıyor; konsolda hata yok; 258 test geçiyor.
  - Düzeltilen: Tekrar Et'te blok sınırı doluyken ipucu basılamayan yön tuşunu gösteriyordu; artık tekrar sayısını değiştirmeyi veya blok silmeyi öneriyor.
  - Rapor kullanıcıya sohbet içinde verildi.

## Sıradaki adımlar

1. Kullanıcı dönünce oyunları kendi cihazında (tercihen `dist/mini-kodlama-dunyasi.html` ile tablette) deneyecek; geri bildirime göre düzeltme.
2. Push yalnızca kullanıcı isterse yapılır.

## Notlar

- Tarayıcı paneli `dialog` öğesinde `close` olayını tetiklemedi. Bu yüzden ayarlar penceresi kapatılınca doğrudan sayfadan kaldırılıyor.
- Önizleme sunucusu ayarı proje dışında: `Projeler/.claude/launch.json` (ad: `mini-kodlama-gallery`, port 5178).
