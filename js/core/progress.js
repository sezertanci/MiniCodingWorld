// Oyuncu ilerlemesi: kazanılan yıldızlar, seviye kilitleri ve grup kilitleri.
// Kayıt yeri dışarıdan verilir ({ load, save, clear }); böylece testlerde bellekte çalışır.
(function (MKD) {
  "use strict";

  function createProgress(storage, config = MKD.config) {
    let data = normalize(storage.load());

    // Bozuk veya eski kayıtlar oyunu çökertmesin diye yalnızca beklenen biçim kabul edilir.
    function normalize(raw) {
      const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
      const games = isRecord(raw) && isRecord(raw.games) ? raw.games : {};
      return { games };
    }

    function assertLevel(level) {
      if (!Number.isInteger(level) || level < 1 || level > config.LEVELS_PER_GAME) {
        throw new RangeError(`Geçersiz seviye: ${level}`);
      }
    }

    function clampStars(stars) {
      if (!Number.isFinite(stars)) {
        return config.MIN_STARS;
      }
      return Math.min(config.MAX_STARS, Math.max(config.MIN_STARS, Math.round(stars)));
    }

    function getStars(gameId, level) {
      const stars = data.games[gameId]?.[level];
      const isValid = Number.isInteger(stars) && stars >= config.MIN_STARS && stars <= config.MAX_STARS;
      return isValid ? stars : 0;
    }

    function isCompleted(gameId, level) {
      return getStars(gameId, level) > 0;
    }

    function findGroup(level) {
      assertLevel(level);
      return config.GROUPS.find((group) => level <= group.lastLevel);
    }

    function isGroupCompleted(gameId, group) {
      for (let level = group.firstLevel; level <= group.lastLevel; level++) {
        if (!isCompleted(gameId, level)) {
          return false;
        }
      }
      return true;
    }

    // Bir grup, önceki grubun bütün seviyeleri tamamlanınca açılır.
    function isGroupUnlocked(gameId, group) {
      return group.index === 0 || isGroupCompleted(gameId, config.GROUPS[group.index - 1]);
    }

    // Bir seviye, grubu açıksa ve bir önceki seviye tamamlandıysa açılır.
    function isLevelUnlocked(gameId, level) {
      if (!isGroupUnlocked(gameId, findGroup(level))) {
        return false;
      }
      return level === 1 || isCompleted(gameId, level - 1);
    }

    // Seviyeyi kaydeder. Daha önce daha çok yıldız alındıysa en iyi sonuç korunur.
    function completeLevel(gameId, level, stars) {
      assertLevel(level);
      const best = Math.max(clampStars(stars), getStars(gameId, level));
      data.games[gameId] = { ...data.games[gameId], [level]: best };
      storage.save(data);
      return best;
    }

    function getGameStars(gameId) {
      let total = 0;
      for (let level = 1; level <= config.LEVELS_PER_GAME; level++) {
        total += getStars(gameId, level);
      }
      return total;
    }

    function getCompletedCount(gameId) {
      let count = 0;
      for (let level = 1; level <= config.LEVELS_PER_GAME; level++) {
        count += isCompleted(gameId, level) ? 1 : 0;
      }
      return count;
    }

    // Sıradaki oynanacak seviye: açık ama henüz bitmemiş ilk seviye. Hepsi bittiyse null.
    function getNextLevel(gameId) {
      for (let level = 1; level <= config.LEVELS_PER_GAME; level++) {
        if (!isCompleted(gameId, level) && isLevelUnlocked(gameId, level)) {
          return level;
        }
      }
      return null;
    }

    function getTotalStars() {
      return Object.keys(data.games).reduce((sum, gameId) => sum + getGameStars(gameId), 0);
    }

    function reset() {
      data = normalize(null);
      storage.clear();
    }

    return Object.freeze({
      getStars,
      isCompleted,
      findGroup,
      isGroupUnlocked,
      isLevelUnlocked,
      completeLevel,
      getGameStars,
      getCompletedCount,
      getNextLevel,
      getTotalStars,
      reset,
    });
  }

  MKD.createProgress = createProgress;
})((globalThis.MKD ??= {}));
