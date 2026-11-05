# İlerleme Notları

Bu dosya, sohbet sıkıştırıldığında veya yeni bir oturuma geçildiğinde işe kaldığı yerden devam etmek içindir.

## Kaynak

İş tanımı: `~/İndirilenler/Mini_Kodlama_Dunyasi_Claude_Code_Promptlari_ve_Gorseller.docx`. Belgede 7 prompt ve 6 örnek ekran görseli var.

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

## Sıradaki adımlar

1. Prompt 3 (Robotun Yolunu Bul): kullanıcı "başla/devam et" deyince.
2. (Kullanıcı devlog todo ve worklog sorularını yanıtlamadı. Tekrar sorulmayacak.)
3. Prompt 3–6: dört oyun. Her oyun `js/games/<id>/` altında olur ve `MKD.gameModules` sözleşmesine uyar (README'de anlatılıyor).
4. Prompt 7: son kontrol
5. Tek HTML dosyası üreten betik

## Notlar

- Tarayıcı paneli `dialog` öğesinde `close` olayını tetiklemedi. Bu yüzden ayarlar penceresi kapatılınca doğrudan sayfadan kaldırılıyor.
- Önizleme sunucusu ayarı proje dışında: `Projeler/.claude/launch.json` (ad: `mini-kodlama-gallery`, port 5178).
