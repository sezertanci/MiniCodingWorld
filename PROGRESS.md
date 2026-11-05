# İlerleme Notları

Bu dosya, sohbet sıkıştırıldığında veya yeni bir oturuma geçildiğinde işe kaldığı yerden devam etmek içindir.

## Kaynak

İş tanımı: `~/İndirilenler/Mini_Kodlama_Dunyasi_Claude_Code_Promptlari_ve_Gorseller.docx`. Belgede 7 prompt ve 6 örnek ekran görseli var.

## Çalışma düzeni (kullanıcıyla anlaşılanlar)

- **2026-11-06 itibarıyla otomatik mod:** Kullanıcı, Prompt 4–7'nin onay beklenmeden sırayla yapılmasını ve her birinin ayrı commit'lenmesini istedi. Sonra tek HTML betiği yazılacak, her şey baştan kontrol edilip düzeltilecek ve kullanıcı dönünce okuyacağı bir rapor hazırlanacak. Push yine yapılmaz.
- **Yalnızca bu oturum için:** Bütün işler bitince devlog worklog kaydı ve gerekiyorsa devlog todo kayıtları kullanıcı onayı beklenmeden oluşturulur. Sonraki oturumlarda bu izin geçerli değildir.
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

## Sıradaki adımlar

1. Prompt 6 (Tekrar Et), Prompt 7 (son kontrol), tek HTML betiği; her biri ayrı commit.
2. Hepsi bitince baştan uçtan uca kontrol, rapor, ardından worklog ve todo kayıtları.

## Notlar

- Tarayıcı paneli `dialog` öğesinde `close` olayını tetiklemedi. Bu yüzden ayarlar penceresi kapatılınca doğrudan sayfadan kaldırılıyor.
- Önizleme sunucusu ayarı proje dışında: `Projeler/.claude/launch.json` (ad: `mini-kodlama-gallery`, port 5178).
