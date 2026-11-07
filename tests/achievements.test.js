// Rozet ve kupa koşullarının testleri.
// Çalıştırma (proje klasöründe): node --test
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/core/stars.js");
require("../js/core/progress.js");
require("../js/core/dom.js");
require("../js/core/components.js");
require("../js/core/games-registry.js");
require("../js/core/achievements.js");

const { createProgress, createAchievements, countEarnedRewards, ACHIEVEMENT_KIND, games, config } = globalThis.MKD;

const LEVELS = config.LEVELS_PER_GAME;
const [FIRST_GAME, SECOND_GAME] = games;

// Bellekte çalışan sahte kayıt yeri
function createMemoryStorage(initial = null) {
  const storage = {
    data: initial,
    saveCount: 0,
    load: () => storage.data,
    save: (data) => { storage.data = structuredClone(data); storage.saveCount++; },
    clear: () => { storage.data = null; },
  };
  return storage;
}

function setup({ progressData = null, achievementData = null } = {}) {
  const progressStorage = createMemoryStorage(progressData);
  const achievementStorage = createMemoryStorage(achievementData);
  const progress = createProgress(progressStorage);
  const achievements = createAchievements({ progress, storage: achievementStorage });
  return { progress, achievements, progressStorage, achievementStorage };
}

function complete(progress, gameId, count, stars = 1, from = 1) {
  for (let level = from; level < from + count; level++) {
    progress.completeLevel(gameId, level, stars);
  }
}

const ids = (items) => items.map((item) => item.id);
const earnedIds = (achievements) => ids(achievements.getStatus().filter((item) => item.earned));

describe("tanımlar", () => {
  test("getStatus_Definitions_HasTenBadgesAndSixTrophies", () => {
    const { achievements } = setup();

    const items = achievements.getStatus();

    assert.equal(countEarnedRewards(items, ACHIEVEMENT_KIND.BADGE).total, 10);
    assert.equal(countEarnedRewards(items, ACHIEVEMENT_KIND.TROPHY).total, 6);
  });

  test("countEarnedRewards_NoKind_CountsAllRewards", () => {
    const items = [
      { kind: ACHIEVEMENT_KIND.BADGE, earned: true },
      { kind: ACHIEVEMENT_KIND.BADGE, earned: false },
      { kind: ACHIEVEMENT_KIND.TROPHY, earned: true },
    ];

    const result = countEarnedRewards(items);

    assert.deepEqual(result, { earned: 2, total: 3 });
  });

  test("getStatus_Definitions_EveryRewardHasTitleDescriptionAndCondition", () => {
    const { achievements } = setup();

    for (const item of achievements.getStatus()) {
      assert.ok(item.title && item.description && item.condition, item.id);
    }
  });

  test("getStatus_NoProgress_NothingEarned", () => {
    const { achievements } = setup();

    assert.deepEqual(earnedIds(achievements), []);
    assert.deepEqual(achievements.sync(), []);
  });
});

describe("rozet koşulları", () => {
  // Her satır: ödül, koşulun bir eksiği (kazanılmamalı) ve koşulun tamamı (kazanılmalı)
  const cases = [
    { id: "first-game", before: () => {}, after: (p) => complete(p, FIRST_GAME.id, 1) },
    { id: "quick-start", before: (p) => complete(p, FIRST_GAME.id, 4), after: (p) => complete(p, FIRST_GAME.id, 1, 1, 5) },
    { id: "determined", before: (p) => complete(p, FIRST_GAME.id, 9), after: (p) => complete(p, FIRST_GAME.id, 1, 1, 10) },
    { id: "master-coder", before: (p) => complete(p, FIRST_GAME.id, LEVELS - 1), after: (p) => complete(p, FIRST_GAME.id, 1, 1, LEVELS) },
    {
      id: "four-games",
      before: (p) => games.slice(0, -1).forEach((game) => complete(p, game.id, 1)),
      after: (p) => complete(p, games.at(-1).id, 1),
    },
    { id: "star-hunter", before: (p) => complete(p, FIRST_GAME.id, 19), after: (p) => complete(p, FIRST_GAME.id, 1, 1, 20) },
    {
      id: "star-master",
      before: (p) => { complete(p, FIRST_GAME.id, 16, 3); complete(p, SECOND_GAME.id, 1, 1); },
      after: (p) => complete(p, SECOND_GAME.id, 1, 1, 2),
    },
    { id: "perfect", before: (p) => complete(p, FIRST_GAME.id, 3, 2), after: (p) => complete(p, FIRST_GAME.id, 1, 3, 4) },
    { id: "no-hint", before: (p) => complete(p, FIRST_GAME.id, 4, 2), after: (p) => complete(p, FIRST_GAME.id, 1, 2, 5) },
    {
      id: "big-success",
      before: (p) => games.slice(0, -1).forEach((game) => complete(p, game.id, LEVELS)),
      after: (p) => complete(p, games.at(-1).id, LEVELS),
    },
  ];

  for (const { id, before, after } of cases) {
    test(`sync_${id}ConditionMet_EarnsBadgeOnlyThen`, () => {
      const { progress, achievements } = setup();

      before(progress);
      const beforeIds = ids(achievements.sync());
      after(progress);
      const afterIds = ids(achievements.sync());

      assert.ok(!beforeIds.includes(id), `${id} erken kazanıldı`);
      assert.ok(afterIds.includes(id), `${id} kazanılmadı`);
    });
  }

  test("sync_LevelsWithHint_DoNotCountForNoHintBadge", () => {
    const { progress, achievements } = setup();

    complete(progress, FIRST_GAME.id, 10, 1);

    assert.ok(!earnedIds(achievements).includes("no-hint"));
    assert.ok(!ids(achievements.sync()).includes("no-hint"));
  });

  test("sync_FiveLevelsSpreadAcrossGames_DoesNotEarnQuickStart", () => {
    const { progress, achievements } = setup();

    complete(progress, FIRST_GAME.id, 3);
    complete(progress, SECOND_GAME.id, 2);

    assert.ok(!ids(achievements.sync()).includes("quick-start"));
  });
});

describe("kupa koşulları", () => {
  test("sync_FirstLevelInEveryGame_EarnsFirstAdventureTrophy", () => {
    const { progress, achievements } = setup();
    games.slice(0, -1).forEach((game) => complete(progress, game.id, 1));
    assert.ok(!ids(achievements.sync()).includes("first-adventure"));

    complete(progress, games.at(-1).id, 1);

    assert.ok(ids(achievements.sync()).includes("first-adventure"));
  });

  const gameTrophies = { "path-finder": "path-master", "command-order": "order-master", "if-then": "if-master", repeat: "loop-master" };

  for (const [gameId, trophyId] of Object.entries(gameTrophies)) {
    test(`sync_All${gameId}Levels_EarnsOnly${trophyId}`, () => {
      const { progress, achievements } = setup();
      complete(progress, gameId, LEVELS - 1);
      assert.ok(!ids(achievements.sync()).includes(trophyId));

      complete(progress, gameId, 1, 1, LEVELS);
      const fresh = achievements.sync().filter((item) => item.kind === ACHIEVEMENT_KIND.TROPHY);

      assert.deepEqual(ids(fresh), [trophyId]);
    });
  }

  test("sync_AllEightyLevels_EarnsChampionTrophy", () => {
    const { progress, achievements } = setup();
    games.forEach((game) => complete(progress, game.id, game === games.at(-1) ? LEVELS - 1 : LEVELS));
    assert.ok(!ids(achievements.sync()).includes("champion"));

    complete(progress, games.at(-1).id, 1, 1, LEVELS);

    assert.ok(ids(achievements.sync()).includes("champion"));
  });

  test("sync_SeveralNewRewards_ReturnsBadgesBeforeTrophies", () => {
    const { progress, achievements } = setup();
    games.forEach((game) => complete(progress, game.id, 1));

    const kinds = achievements.sync().map((item) => item.kind);

    assert.ok(kinds.includes(ACHIEVEMENT_KIND.TROPHY));
    assert.ok(kinds.lastIndexOf(ACHIEVEMENT_KIND.BADGE) < kinds.indexOf(ACHIEVEMENT_KIND.TROPHY));
  });
});

describe("tekrar ve kalıcılık", () => {
  test("sync_CalledTwice_ReturnsRewardOnlyOnce", () => {
    const { progress, achievements } = setup();
    complete(progress, FIRST_GAME.id, 1);

    const first = ids(achievements.sync());
    const second = ids(achievements.sync());

    assert.ok(first.includes("first-game"));
    assert.deepEqual(second, []);
  });

  test("sync_NothingNew_DoesNotWriteStorage", () => {
    const { progress, achievements, achievementStorage } = setup();
    complete(progress, FIRST_GAME.id, 1);
    achievements.sync();
    const saves = achievementStorage.saveCount;

    achievements.sync();

    assert.equal(achievementStorage.saveCount, saves);
  });

  test("createAchievements_AfterReload_KeepsEarnedRewardsAndDoesNotNotifyAgain", () => {
    const { progress, achievements, progressStorage, achievementStorage } = setup();
    complete(progress, FIRST_GAME.id, 5, 3);
    const earned = ids(achievements.sync());

    // Sayfa yenilenmiş gibi aynı kayıtlardan yeniden oluşturulur
    const reloadedProgress = createProgress(progressStorage);
    const reloaded = createAchievements({ progress: reloadedProgress, storage: achievementStorage });

    assert.deepEqual(earnedIds(reloaded), earned);
    assert.deepEqual(reloaded.sync(), []);
  });

  test("createAchievements_SavedListHasDuplicatesAndUnknownIds_KeepsEachKnownRewardOnce", () => {
    const { achievements } = setup({ achievementData: { earned: ["first-game", "first-game", "unknown", 42] } });

    assert.deepEqual(earnedIds(achievements), ["first-game"]);
  });

  test("createAchievements_CorruptedSave_StartsEmpty", () => {
    const { achievements } = setup({ achievementData: { earned: "bozuk" } });

    assert.deepEqual(earnedIds(achievements), []);
  });

  test("sync_ProgressSavedBeforeFeature_EarnsRewardsFromOldLevelsAndStars", () => {
    const oldProgress = { games: { [FIRST_GAME.id]: { 1: 3, 2: 2, 3: 2, 4: 2, 5: 2 } } };
    const { achievements } = setup({ progressData: oldProgress });

    const fresh = ids(achievements.sync());

    assert.deepEqual(fresh, ["first-game", "quick-start", "perfect", "no-hint"]);
  });

  test("getStatus_LockedReward_ReportsProgressTowardsGoal", () => {
    const { progress, achievements } = setup();
    complete(progress, FIRST_GAME.id, 3);

    const quickStart = achievements.getStatus().find((item) => item.id === "quick-start");

    assert.equal(quickStart.current, 3);
    assert.equal(quickStart.goal, 5);
    assert.equal(quickStart.earned, false);
  });

  test("reset_AfterEarning_ClearsRewardsSoTheyCanBeEarnedAgain", () => {
    const { progress, achievements, achievementStorage } = setup();
    complete(progress, FIRST_GAME.id, 1);
    achievements.sync();

    achievements.reset();
    progress.reset();

    assert.equal(achievementStorage.data, null);
    assert.deepEqual(earnedIds(achievements), []);
    complete(progress, FIRST_GAME.id, 1);
    assert.ok(ids(achievements.sync()).includes("first-game"));
  });
});
