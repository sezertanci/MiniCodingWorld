// Robotun Yolunu Bul: 20 seviyenin verisi. Harita işaretleri engine.js dosyasında açıklanır.
//   map:         Harita satırları
//   solution:    Bilinen en kısa çözüm (U yukarı, D aşağı, L sol, R sağ). Ekranda gösterilmez,
//                testlerde haritanın çözülebildiğini ve 3 yıldız hedefinin doğru olduğunu denetler.
//   intro:       Robotun seviye başında söylediği cümle (isteğe bağlı)
//   maxCommands: Kullanılabilecek en fazla komut (isteğe bağlı; Uzman seviyelerinde sınır)
(function (MKD) {
  "use strict";

  const levels = [
    // Kolay 1–5: tek ve kısa hareketler, yönleri tanıma
    { map: ["....", "SG..", "...."], solution: "R", intro: "Robotu bayrağa götür. Sağa okuna bas, sonra Başlat'a dokun." },
    { map: ["..G.", "..S.", "...."], solution: "U", intro: "Bayrak robotun yukarısında. Hangi oku seçmelisin?" },
    { map: [".....", "G.S..", "....."], solution: "LL", intro: "Bayrak solda ve iki kare uzakta." },
    { map: [".S..", "....", ".G.."], solution: "DD", intro: "Robot aşağı inmeli. Kaç kez?" },
    { map: ["...G", ".S..", "...."], solution: "URR", intro: "Bu kez iki farklı yön kullanacaksın." },

    // Orta 6–10: 3–6 hareketli rotalar ve dönüşler
    { map: ["S....", ".....", "...G."], solution: "DDRRR" },
    { map: [".....", "..G..", ".....", "S...."], solution: "UURR" },
    { map: ["G....", ".....", "....S"], solution: "UULLLL" },
    { map: ["..S..", ".....", "G....", "....."], solution: "DDLL" },
    { map: ["....G", "S....", "....."], solution: "URRRR" },

    // Zor 11–15: engellerin çevresinden dolaşma, alternatif rota
    { map: ["S.#.G", ".....", "....."], solution: "DRRRUR", intro: "Yolda taş var. Taşın etrafından dolaş." },
    { map: ["S.#G.", "..#..", "....."], solution: "DDRRRUU", intro: "Taşlar duvar gibi dizilmiş. Altından dolaş." },
    { map: ["S~~~G", ".....", "~~.~~"], solution: "DRRRRU", intro: "Robot suya giremez. Kuru yolu bul." },
    { map: ["..#..", "S.#.G", "..#..", "....."], solution: "DDRRRRUU" },
    { map: ["S.#...", "..#.#.", "....#G", "......"], solution: "DDDRRRRRU", intro: "Birden çok yol var. En kısasını bulabilir misin?" },

    // Uzman 16–20: geniş haritalar, altın toplama ve sınırlı komut sayısı
    { map: ["S.....G", "...*...", "......."], solution: "DRRRURRR", maxCommands: 10 },
    { map: [".......", "S.#*#..", "..#.#..", "......G"], solution: "URRRDDDRRR", maxCommands: 12 },
    { map: ["*.....*", "..#~#..", "S.....G"], solution: "UURRRRRRDD", maxCommands: 12 },
    { map: ["S..#...", ".#.#.#.", "...*...", "~#.#.#.", "......G"], solution: "DDRRRRDDRR", maxCommands: 12 },
    { map: ["*..#..*", ".#...#.", "S#.#.#.", "...#..G"], solution: "UURRDRRURRDDD", maxCommands: 15 },
  ];

  MKD.pathFinder = Object.assign(MKD.pathFinder ?? {}, {
    levels: Object.freeze(levels.map(Object.freeze)),
  });
})((globalThis.MKD ??= {}));
