// İlerleme, kilit ve yıldız kurallarının testleri.
// Çalıştırma (proje klasöründe): node --test
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/core/stars.js");
require("../js/core/progress.js");

const { createProgress, calculateStars, config } = globalThis.MKD;

const GAME_ID = "path-finder";
const OTHER_GAME_ID = "repeat";

// Bellekte çalışan sahte kayıt yeri
function createMemoryStorage(initial = null) {
  const storage = {
    data: initial,
    load: () => storage.data,
    save: (data) => { storage.data = structuredClone(data); },
    clear: () => { storage.data = null; },
  };
  return storage;
}

function completeLevels(progress, from, to, stars = 1) {
  for (let level = from; level <= to; level++) {
    progress.completeLevel(GAME_ID, level, stars);
  }
}

describe("isLevelUnlocked", () => {
  test("isLevelUnlocked_FirstLevel_ReturnsTrue", () => {
    const progress = createProgress(createMemoryStorage());

    const result = progress.isLevelUnlocked(GAME_ID, 1);

    assert.equal(result, true);
  });

  test("isLevelUnlocked_PreviousLevelNotCompleted_ReturnsFalse", () => {
    const progress = createProgress(createMemoryStorage());

    const result = progress.isLevelUnlocked(GAME_ID, 2);

    assert.equal(result, false);
  });

  test("isLevelUnlocked_PreviousLevelCompleted_ReturnsTrue", () => {
    const progress = createProgress(createMemoryStorage());
    progress.completeLevel(GAME_ID, 1, 1);

    const result = progress.isLevelUnlocked(GAME_ID, 2);

    assert.equal(result, true);
  });

  test("isLevelUnlocked_PreviousGroupHasGap_ReturnsFalse", () => {
    const storage = createMemoryStorage({ games: { [GAME_ID]: { 1: 3, 2: 3, 4: 3, 5: 3 } } });
    const progress = createProgress(storage);

    const result = progress.isLevelUnlocked(GAME_ID, 6);

    assert.equal(result, false);
  });

  test("isLevelUnlocked_OtherGameProgress_DoesNotUnlock", () => {
    const progress = createProgress(createMemoryStorage());
    progress.completeLevel(OTHER_GAME_ID, 1, 3);

    const result = progress.isLevelUnlocked(GAME_ID, 2);

    assert.equal(result, false);
  });

  test("isLevelUnlocked_InvalidLevel_ThrowsRangeError", () => {
    const progress = createProgress(createMemoryStorage());

    assert.throws(() => progress.isLevelUnlocked(GAME_ID, config.LEVELS_PER_GAME + 1), RangeError);
  });
});

describe("isGroupUnlocked", () => {
  const [easy, medium, hard] = config.GROUPS;

  test("isGroupUnlocked_FirstGroup_ReturnsTrue", () => {
    const progress = createProgress(createMemoryStorage());

    assert.equal(progress.isGroupUnlocked(GAME_ID, easy), true);
  });

  test("isGroupUnlocked_PreviousGroupIncomplete_ReturnsFalse", () => {
    const progress = createProgress(createMemoryStorage());
    completeLevels(progress, easy.firstLevel, easy.lastLevel - 1);

    const result = progress.isGroupUnlocked(GAME_ID, medium);

    assert.equal(result, false);
  });

  test("isGroupUnlocked_PreviousGroupComplete_ReturnsTrue", () => {
    const progress = createProgress(createMemoryStorage());
    completeLevels(progress, easy.firstLevel, easy.lastLevel);

    const result = progress.isGroupUnlocked(GAME_ID, medium);

    assert.equal(result, true);
  });

  test("isGroupUnlocked_TwoGroupsAhead_ReturnsFalse", () => {
    const progress = createProgress(createMemoryStorage());
    completeLevels(progress, easy.firstLevel, easy.lastLevel);

    const result = progress.isGroupUnlocked(GAME_ID, hard);

    assert.equal(result, false);
  });
});

describe("completeLevel", () => {
  test("completeLevel_LowerStarsThanBest_KeepsBest", () => {
    const progress = createProgress(createMemoryStorage());
    progress.completeLevel(GAME_ID, 1, 3);

    const result = progress.completeLevel(GAME_ID, 1, 1);

    assert.equal(result, 3);
    assert.equal(progress.getStars(GAME_ID, 1), 3);
  });

  test("completeLevel_HigherStarsThanBest_UpdatesBest", () => {
    const progress = createProgress(createMemoryStorage());
    progress.completeLevel(GAME_ID, 1, 1);

    progress.completeLevel(GAME_ID, 1, 2);

    assert.equal(progress.getStars(GAME_ID, 1), 2);
  });

  test("completeLevel_StarsOutOfRange_ClampsToValidRange", () => {
    const progress = createProgress(createMemoryStorage());

    const tooLow = progress.completeLevel(GAME_ID, 1, 0);
    const tooHigh = progress.completeLevel(GAME_ID, 2, 99);

    assert.equal(tooLow, config.MIN_STARS);
    assert.equal(tooHigh, config.MAX_STARS);
  });

  test("completeLevel_Called_PersistsAcrossInstances", () => {
    const storage = createMemoryStorage();
    createProgress(storage).completeLevel(GAME_ID, 1, 2);

    const reloaded = createProgress(storage);

    assert.equal(reloaded.getStars(GAME_ID, 1), 2);
  });
});

describe("totals and reset", () => {
  test("getTotalStars_MultipleGames_ReturnsSum", () => {
    const progress = createProgress(createMemoryStorage());
    progress.completeLevel(GAME_ID, 1, 3);
    progress.completeLevel(GAME_ID, 2, 2);
    progress.completeLevel(OTHER_GAME_ID, 1, 1);

    assert.equal(progress.getTotalStars(), 6);
    assert.equal(progress.getGameStars(GAME_ID), 5);
    assert.equal(progress.getCompletedCount(GAME_ID), 2);
  });

  test("reset_AfterProgress_ClearsEverything", () => {
    const storage = createMemoryStorage();
    const progress = createProgress(storage);
    progress.completeLevel(GAME_ID, 1, 3);

    progress.reset();

    assert.equal(progress.getTotalStars(), 0);
    assert.equal(progress.isLevelUnlocked(GAME_ID, 2), false);
    assert.equal(storage.data, null);
  });

  test("createProgress_CorruptedData_StartsEmpty", () => {
    const storage = createMemoryStorage({ games: "bozuk" });

    const progress = createProgress(storage);

    assert.equal(progress.getTotalStars(), 0);
    assert.equal(progress.isLevelUnlocked(GAME_ID, 1), true);
  });

  test("getStars_InvalidStoredValue_ReturnsZero", () => {
    const storage = createMemoryStorage({ games: { [GAME_ID]: { 1: 7, 2: "3" } } });

    const progress = createProgress(storage);

    assert.equal(progress.getStars(GAME_ID, 1), 0);
    assert.equal(progress.getStars(GAME_ID, 2), 0);
  });
});

describe("calculateStars", () => {
  test("calculateStars_HintUsed_ReturnsOne", () => {
    assert.equal(calculateStars({ hintUsed: true, targetMet: true }), 1);
  });

  test("calculateStars_NoHintTargetMissed_ReturnsTwo", () => {
    assert.equal(calculateStars({ hintUsed: false, targetMet: false }), 2);
  });

  test("calculateStars_NoHintTargetMet_ReturnsThree", () => {
    assert.equal(calculateStars({ hintUsed: false, targetMet: true }), 3);
  });
});
