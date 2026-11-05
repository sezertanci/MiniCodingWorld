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
- [x] Prompt 1 (iskelet, ilerleme ve kilit sistemi, geçici oyun ekranı, ayarlarda "İlerlemeyi sıfırla"). Tarayıcıda test edildi, 21 test geçiyor. **Kullanıcı onayı ve commit bekleniyor.**

## Sıradaki adımlar

1. Kullanıcı Prompt 1'i onaylayınca commit: `feat: proje iskeleti, ilerleme ve seviye kilidi sistemi`
2. Prompt 2: ana ekran ve seviye seçimi tasarımı (görsel cila, logo, robot)
3. Prompt 3–6: dört oyun. Her oyun `js/games/<id>/` altında olur ve `MKD.gameModules` sözleşmesine uyar (README'de anlatılıyor).
4. Prompt 7: son kontrol
5. Tek HTML dosyası üreten betik

## Notlar

- Tarayıcı paneli `dialog` öğesinde `close` olayını tetiklemedi. Bu yüzden ayarlar penceresi kapatılınca doğrudan sayfadan kaldırılıyor.
- Önizleme sunucusu ayarı proje dışında: `Projeler/.claude/launch.json` (ad: `mini-kodlama-gallery`, port 5178).
