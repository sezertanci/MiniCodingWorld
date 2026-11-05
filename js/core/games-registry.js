// Ana ekrandaki oyunların listesi. Yeni oyun eklemek için buraya bir kayıt eklenir.
(function (MKD) {
  "use strict";

  MKD.games = Object.freeze([
    {
      id: "path-finder",
      title: "Robotun Yolunu Bul",
      description: "Yön komutlarıyla robotu hedefe ulaştır.",
      icon: "assets/icons/game-path.png",
      color: "blue",
    },
    {
      id: "command-order",
      title: "Komutları Sırala",
      description: "Adımları doğru sıraya diz.",
      icon: "assets/icons/game-order.png",
      color: "green",
    },
    {
      id: "if-then",
      title: "Eğer Böyleyse",
      description: "Duruma göre doğru komutu seç.",
      icon: "assets/icons/game-if.png",
      color: "purple",
    },
    {
      id: "repeat",
      title: "Tekrar Et",
      description: "Tekrarlanan hareketleri tek blokla yap.",
      icon: "assets/icons/game-repeat.png",
      color: "orange",
    },
  ].map(Object.freeze));

  MKD.findGame = (id) => MKD.games.find((game) => game.id === id) ?? null;

  // Oyun modülleri kendi dosyalarında buraya kaydolur: MKD.gameModules["path-finder"] = { mount }.
  // Kaydı olmayan oyunlar için geçici oyun ekranı kullanılır.
  MKD.gameModules = {};
})((globalThis.MKD ??= {}));
