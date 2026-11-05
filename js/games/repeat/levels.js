// Tekrar Et: 20 seviyenin verisi. Harita işaretleri path-finder/engine.js dosyasında açıklanır.
//   map:       Harita satırları
//   solution:  Bilinen en az bloklu çözüm (engine.js'deki kısaltmayla). Ekranda gösterilmez; testler
//              haritanın çözülebildiğini, en kısa yol olduğunu ve blok sınırına sığdığını denetler.
//   maxBlocks: Kullanılabilecek en fazla blok. Tek tek hareketlerle sığmayacak kadar küçüktür;
//              böylece çocuk tekrar bloğunu kullanmaya yönelir.
//   hint:      İpucu düğmesinde robotun söylediği cümle (deseni anlatır, cevabı vermez)
//   intro:     Robotun seviye başında söylediği cümle (isteğe bağlı)
(function (MKD) {
  "use strict";

  const levels = [
    // Kolay 1–5: tek komutu 2–3 kez tekrarlama
    {
      map: ["....", "S..G", "...."], solution: "3(R)", maxBlocks: 2,
      intro: "Robot 3 kez sağa gitmeli ama yalnızca 2 blok kullanabilirsin. Tekrarla bloğunu ekle, içine sağ oku koy.",
      hint: "Tekrarla bloğu, içindeki oku söylediğin kadar yapar. Kaç kez sağa gitmeli?",
    },
    {
      map: [".G.", "...", "...", ".S."], solution: "3(U)", maxBlocks: 2,
      intro: "Bayrak yukarıda. Aynı oku tekrar tekrar eklemek yerine Tekrarla bloğunu kullan.",
      hint: "Robot hep aynı yöne gidiyor. Hangi yöne ve kaç kez?",
    },
    {
      map: ["..S..", ".....", ".....", "..G.."], solution: "3(D)", maxBlocks: 2,
      hint: "Robot aşağı iniyor. Kareleri say ve tekrar sayısını ayarla.",
    },
    {
      map: ["....", "G..S", "...."], solution: "3(L)", maxBlocks: 2,
      hint: "Bu kez sola. Tekrar sayısını − ve + düğmeleriyle değiştirebilirsin.",
    },
    {
      map: ["S**G"], solution: "3(R)", maxBlocks: 2,
      intro: "Yoldaki altınları da topla! Yine yalnızca 2 blok var.",
      hint: "Altınlar robotla bayrak arasında, aynı sırada. Robot yalnızca sağa gidiyor.",
    },

    // Orta 6–10: birden fazla komutu döngü içinde tekrarlama
    {
      map: ["S...", "....", "....", "...G"], solution: "3(RD)", maxBlocks: 4,
      intro: "Merdiven gibi in: sağa, aşağı, sağa, aşağı... Tekrarla bloğunun içine iki ok koyabilirsin.",
      hint: "Bir basamak: bir sağa, bir aşağı. Kaç basamak var?",
    },
    {
      map: ["....G", ".....", "S...."], solution: "2(RRU)", maxBlocks: 5,
      hint: "İki kez sağa, bir kez yukarı. Bu desen kaç kez tekrar ediyor?",
    },
    {
      map: ["S....", ".....", "....G"], solution: "2(RRD)", maxBlocks: 5,
      hint: "Önce iki sağa, sonra bir aşağı. Bunu tekrar et.",
    },
    {
      map: ["G...", "....", "....", "....", "...S"], solution: "3(UL) U", maxBlocks: 5,
      intro: "Tekrarla bloğundan sonra tek bir ok da ekleyebilirsin.",
      hint: "Yukarı-sol desenini tekrarla; sonunda bir adım daha gerekebilir.",
    },
    {
      map: ["S......", ".......", ".......", "......G"], solution: "3(RRD)", maxBlocks: 5,
      hint: "Her basamak iki kare geniş, bir kare yüksek.",
    },

    // Zor 11–15: farklı tekrar sayıları ve ardışık döngüler
    {
      map: ["S....", "####.", "....G"], solution: "4(R) 2(D)", maxBlocks: 5,
      intro: "Bu kez iki Tekrarla bloğu gerekiyor: biri sağa, biri aşağı.",
      hint: "Önce sağa kaç kare? Sonra aşağı kaç kare? Her biri için ayrı bir Tekrarla bloğu kullan.",
    },
    {
      map: ["....G", ".####", ".####", "S####"], solution: "3(U) 4(R)", maxBlocks: 5,
      hint: "Önce yukarı çık, sonra sağa git. İki Tekrarla bloğu, iki farklı sayı.",
    },
    {
      map: ["S...", "###.", "G..."], solution: "3(R) 2(D) 3(L)", maxBlocks: 7,
      hint: "Taşların etrafından dolaş: sağa, aşağı, sola. Her yön için kareleri say.",
    },
    {
      map: ["S..##", "##.##", "##.##", "##..G"], solution: "2(R) 3(D) 2(R)", maxBlocks: 6,
      hint: "Yol üç parça: sağa, aşağı, yine sağa.",
    },
    {
      map: ["S.*###", "##.###", "##*..G"], solution: "2(R) 2(D) 3(R)", maxBlocks: 6,
      hint: "İki altın da yolun köşelerinde. Her düz parçayı bir Tekrarla bloğuyla yap.",
    },

    // Uzman 16–20: daha uzun desenleri daha az komutla tamamlama
    {
      map: ["S.....", ".*....", "......", "...*..", ".....G"], solution: "4(RD) R", maxBlocks: 4,
      intro: "Yalnızca 4 blok! Uzun yolu kısa bir desenle yürü.",
      hint: "Altınlar çapraz dizilmiş: sağa-aşağı desenine bak.",
    },
    {
      map: ["......G", ".......", "....*..", ".......", "..*....", ".......", "S......"], solution: "3(UURR)", maxBlocks: 5,
      hint: "Her basamak iki kare yüksek, iki kare geniş.",
    },
    {
      map: ["S......", ".......", "..*....", ".......", "....*..", ".......", "......G"], solution: "3(RRDD)", maxBlocks: 5,
      hint: "İki sağa, iki aşağı. Bu desen bayrağa kadar sürüyor.",
    },
    {
      map: ["S........", "..*......", "....*....", "......*..", "........G"], solution: "4(RRD)", maxBlocks: 4,
      hint: "Altınlar basamakların köşesinde. Bir basamak: iki sağa, bir aşağı.",
    },
    {
      map: ["S.*..", "####.", "..*..", ".####", "..*.G"], solution: "4(R) 2(D) 4(L) 2(D) 4(R)", maxBlocks: 10,
      intro: "Yılan gibi kıvrılan uzun bir yol. 10 bloğu akıllıca kullan.",
      hint: "Yol beş düz parçadan oluşuyor. Her parçayı bir Tekrarla bloğuyla yap.",
    },
  ];

  MKD.repeatGame = Object.assign(MKD.repeatGame ?? {}, {
    levels: Object.freeze(levels.map(Object.freeze)),
  });
})((globalThis.MKD ??= {}));
