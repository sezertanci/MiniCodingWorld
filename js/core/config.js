// Oyun genelindeki sabit değerler.
// Tüm dosyalar tek bir ortak nesne (MKD) altında toplanır; başka global değişken oluşturulmaz.
(function (MKD) {
  "use strict";

  const LEVELS_PER_GROUP = 5;

  // Zorluk grupları. Seviye aralıkları sıradan hesaplanır: 1–5, 6–10, 11–15, 16–20.
  const GROUP_DEFINITIONS = [
    { id: "easy", title: "Kolay" },
    { id: "medium", title: "Orta" },
    { id: "hard", title: "Zor" },
    { id: "expert", title: "Uzman" },
  ];

  const GROUPS = Object.freeze(
    GROUP_DEFINITIONS.map((group, index) =>
      Object.freeze({
        ...group,
        index,
        firstLevel: index * LEVELS_PER_GROUP + 1,
        lastLevel: (index + 1) * LEVELS_PER_GROUP,
      })
    )
  );

  MKD.config = Object.freeze({
    LEVELS_PER_GAME: GROUPS.length * LEVELS_PER_GROUP,
    MIN_STARS: 1,
    MAX_STARS: 3,
    GROUPS,
    STORAGE_KEY: "mini-coding-world.progress.v1",
    ACHIEVEMENTS_KEY: "mini-coding-world.achievements.v1",
    SETTINGS_KEY: "mini-coding-world.settings.v1",
    CHARACTER_KEY: "mini-coding-world.character.v1",
  });
})((globalThis.MKD ??= {}));
