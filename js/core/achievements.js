// Başarı sistemi: rozetler (küçük başarılar) ve kupalar (büyük hedefler).
// Bütün koşullar burada, tek yerden hesaplanır. Koşullar ilerleme kaydındaki yıldızlardan okunur;
// böylece bu özellik eklenmeden önce bitirilmiş seviyeler de hesaba katılır.
// Kazanılan ödüller ayrı bir kayıtta tutulur ve her ödül yalnızca bir kez kazanılır.
(function (MKD) {
  "use strict";

  const KIND = Object.freeze({ BADGE: "badge", TROPHY: "trophy" });

  // Sabit hedefli rozetlerin hedef sayıları. Hedef, sembol ve koşul yazısı buradan üretilir.
  const GOALS = Object.freeze({ FIRST_GAME: 1, QUICK_START: 5, DETERMINED: 10, STAR_HUNTER: 20, STAR_MASTER: 50, NO_HINT: 5 });

  // Oyuna özel kupalar. Koşul yazısı oyunun adından üretilir.
  const GAME_TROPHIES = Object.freeze([
    { id: "path-master", gameId: "path-finder", title: "Robot Ustası", description: "Robot artık her yolu biliyor!" },
    { id: "order-master", gameId: "command-order", title: "Algoritma Ustası", description: "Adımları sıralamakta bir numarasın!" },
    { id: "if-master", gameId: "if-then", title: "Karar Ustası", description: "Her durumda doğru kararı veriyorsun!" },
    { id: "loop-master", gameId: "repeat", title: "Döngü Ustası", description: "Tekrarları ustaca kullanıyorsun!" },
  ]);

  /** İlerleme kaydından başarı koşullarının kullandığı sayıları çıkarır. */
  function collectStats(progress, games, config) {
    const stats = {
      byGame: {}, totalCompleted: 0, bestGameCompleted: 0, gamesStarted: 0, gamesFirstDone: 0,
      gamesFinished: 0, totalStars: progress.getTotalStars(), perfectCount: 0, noHintCount: 0,
    };
    for (const game of games) {
      const completed = progress.getCompletedCount(game.id);
      stats.byGame[game.id] = completed;
      stats.totalCompleted += completed;
      stats.bestGameCompleted = Math.max(stats.bestGameCompleted, completed);
      stats.gamesStarted += completed > 0 ? 1 : 0;
      stats.gamesFirstDone += progress.isCompleted(game.id, 1) ? 1 : 0;
      stats.gamesFinished += completed === config.LEVELS_PER_GAME ? 1 : 0;
      for (let level = 1; level <= config.LEVELS_PER_GAME; level++) {
        const stars = progress.getStars(game.id, level);
        stats.perfectCount += stars === config.MAX_STARS ? 1 : 0;
        // İpucu kullanılan seviye en fazla 1 yıldız alır; 2 ve üstü ipucusuz bitmiş demektir.
        stats.noHintCount += stars >= MKD.STARS.NO_HINT ? 1 : 0;
      }
    }
    return stats;
  }

  /**
   * Ödül listesi. Her ödülde: ad, açıklama, kazanılma koşulu, görsel sembol, hedef sayı
   * ve ilerlemeden o sayıyı ölçen measure(stats). Ölçülen sayı hedefe ulaşınca ödül kazanılır.
   */
  function buildDefinitions(games, config) {
    const { IMAGES, ICONS } = MKD.components;
    const levels = config.LEVELS_PER_GAME;
    const allLevels = levels * games.length;
    const badge = (item) => ({ kind: KIND.BADGE, ...item });

    const badges = [
      badge({ id: "first-game", title: "İlk Oyunum", color: "green", symbol: { text: String(GOALS.FIRST_GAME) },
        description: "Kodlama macerana ilk adımı attın!", condition: "İlk oyun seviyeni tamamla.",
        goal: GOALS.FIRST_GAME, measure: (s) => s.totalCompleted }),
      badge({ id: "quick-start", title: "Hızlı Başlangıç", color: "blue", symbol: { text: String(GOALS.QUICK_START) },
        description: "Robotlar seninle gurur duyuyor!", condition: `Bir oyunda ${GOALS.QUICK_START} seviye tamamla.`,
        goal: GOALS.QUICK_START, measure: (s) => s.bestGameCompleted }),
      badge({ id: "determined", title: "Azimli Oyuncu", color: "purple", symbol: { text: String(GOALS.DETERMINED) },
        description: "Pes etmeden devam ettin!", condition: `Bir oyunda ${GOALS.DETERMINED} seviye tamamla.`,
        goal: GOALS.DETERMINED, measure: (s) => s.bestGameCompleted }),
      badge({ id: "master-coder", title: "Usta Kodlayıcı", color: "orange", symbol: { text: String(levels) },
        description: "Bir oyunun bütün seviyelerini bitirdin!", condition: `Bir oyunun ${levels} seviyesini tamamla.`,
        goal: levels, measure: (s) => s.bestGameCompleted }),
      badge({ id: "four-games", title: "Dört Dörtlük", color: "pink", symbol: { text: String(games.length) },
        description: "Dört oyunun hepsini denedin!", condition: "Dört oyunun tamamında en az bir seviye bitir.",
        goal: games.length, measure: (s) => s.gamesStarted }),
      badge({ id: "star-hunter", title: "Yıldız Avcısı", color: "red", symbol: { image: ICONS.star, text: String(GOALS.STAR_HUNTER) },
        description: "Yıldızları toplamaya başladın!", condition: `Toplam ${GOALS.STAR_HUNTER} yıldız kazan.`,
        goal: GOALS.STAR_HUNTER, measure: (s) => s.totalStars }),
      badge({ id: "star-master", title: "Yıldız Ustası", color: "navy", symbol: { image: ICONS.star, text: String(GOALS.STAR_MASTER) },
        description: "Gökyüzü kadar yıldızın var!", condition: `Toplam ${GOALS.STAR_MASTER} yıldız kazan.`,
        goal: GOALS.STAR_MASTER, measure: (s) => s.totalStars }),
      badge({ id: "perfect", title: "Mükemmel Oyuncu", color: "green", symbol: { stars: config.MAX_STARS },
        description: "Bir seviyeyi kusursuz bitirdin!", condition: `Bir seviyeyi ${config.MAX_STARS} yıldızla tamamla.`,
        goal: 1, measure: (s) => s.perfectCount }),
      badge({ id: "no-hint", title: "İpucusuz Kahraman", color: "purple", symbol: { image: ICONS.hint, crossed: true, text: String(GOALS.NO_HINT) },
        description: "Kendi başına çözmeyi başardın!", condition: `${GOALS.NO_HINT} seviyeyi ipucu kullanmadan tamamla.`,
        goal: GOALS.NO_HINT, measure: (s) => s.noHintCount }),
      badge({ id: "big-success", title: "Büyük Başarı", color: "blue", symbol: { image: ICONS.medal },
        description: "Bütün oyunları baştan sona bitirdin!", condition: "Dört oyunun tüm seviyelerini tamamla.",
        goal: games.length, measure: (s) => s.gamesFinished }),
    ];

    const trophies = [
      { kind: KIND.TROPHY, id: "first-adventure", title: "İlk Macera Kupası", color: "green", symbol: { image: IMAGES.robot },
        description: "Dört oyunun hepsinde ilk adımı attın!", condition: "Dört oyunun her birinde ilk seviyeyi tamamla.",
        goal: games.length, measure: (s) => s.gamesFirstDone },
      ...GAME_TROPHIES.map(({ gameId, ...item }) => {
        const game = games.find((candidate) => candidate.id === gameId);
        return { kind: KIND.TROPHY, ...item, color: game.color, symbol: { image: game.icon },
          condition: `${game.title} oyununu bitir.`, goal: levels, measure: (s) => s.byGame[gameId] ?? 0 };
      }),
      { kind: KIND.TROPHY, id: "champion", title: "Kodlama Şampiyonu", color: "gold", symbol: { image: ICONS.star },
        description: "Sen gerçek bir kodlama şampiyonusun!", condition: `Dört oyunun ${allLevels} seviyesinin tamamını bitir.`,
        goal: allLevels, measure: (s) => s.totalCompleted },
    ];

    return Object.freeze([...badges, ...trophies].map(Object.freeze));
  }

  /**
   * @param {{ progress: object, storage: { load, save, clear }, games?: object[], config?: object }} deps
   */
  function createAchievements({ progress, storage, games = MKD.games, config = MKD.config }) {
    const definitions = buildDefinitions(games, config);
    const knownIds = new Set(definitions.map((definition) => definition.id));
    // Set, aynı ödülün iki kez kaydedilmesini engeller. Bilinmeyen veya bozuk kayıtlar yok sayılır.
    const saved = storage.load()?.earned;
    let earned = new Set((Array.isArray(saved) ? saved : []).filter((id) => knownIds.has(id)));

    const stats = () => collectStats(progress, games, config);

    /** Bütün ödüller; kazanılıp kazanılmadığı ve hedefe ne kadar yaklaşıldığıyla birlikte. */
    function getStatus() {
      const current = stats();
      return definitions.map((definition) => ({
        ...definition,
        current: Math.min(definition.measure(current), definition.goal),
        earned: earned.has(definition.id),
      }));
    }

    /** Koşulu yeni sağlanan ödülleri kaydeder ve döndürür (önce rozetler, sonra kupalar). */
    function sync() {
      const current = stats();
      const fresh = definitions.filter((definition) => !earned.has(definition.id) && definition.measure(current) >= definition.goal);
      if (fresh.length > 0) {
        fresh.forEach((definition) => earned.add(definition.id));
        storage.save({ earned: [...earned] });
      }
      return fresh;
    }

    function reset() {
      earned = new Set();
      storage.clear();
    }

    return Object.freeze({ getStatus, sync, reset });
  }

  /** getStatus() listesinde bir türün (rozet veya kupa) kazanılan ve toplam sayısı; tür verilmezse bütün ödüllerinki. */
  function countEarnedRewards(items, kind) {
    const ofKind = kind === undefined ? items : items.filter((item) => item.kind === kind);
    return { earned: ofKind.filter((item) => item.earned).length, total: ofKind.length };
  }

  MKD.ACHIEVEMENT_KIND = KIND;
  MKD.countEarnedRewards = countEarnedRewards;
  MKD.createAchievements = createAchievements;
})((globalThis.MKD ??= {}));
