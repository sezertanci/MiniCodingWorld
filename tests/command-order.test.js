// Komutları Sırala: kural ve seviye verisi testleri.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/games/command-order/engine.js");
require("../js/games/command-order/levels.js");

const { config, commandOrder } = globalThis.MKD;
const { buildCards, shuffleCards, checkOrder, nextHint, REASON, levels } = commandOrder;

const GROUP_STEP_RANGES = [
  { from: 1, to: 5, min: 2, max: 3 },
  { from: 6, to: 10, min: 4, max: 5 },
  { from: 11, to: 15, min: 5, max: 7 },
  { from: 16, to: 20, min: 6, max: 7 },
];
const THREE_STEP_LEVEL = { steps: [{ text: "A" }, { text: "B" }, { text: "C" }], extras: [{ text: "X" }] };

describe("levels", () => {
  test("levels_Count_MatchesLevelsPerGame", () => {
    assert.equal(levels.length, config.LEVELS_PER_GAME);
  });

  GROUP_STEP_RANGES.forEach(({ from, to, min, max }) => {
    test(`levels_Levels${from}To${to}_StepCountInGroupRange`, () => {
      const counts = levels.slice(from - 1, to).map((level) => level.steps.length);

      counts.forEach((count) => assert.ok(count >= min && count <= max, `adım sayısı ${count}`));
    });
  });

  levels.forEach((level, index) => {
    const number = index + 1;

    test(`levels_Level${number}_HasTitleIconAndHint`, () => {
      assert.ok(level.title && level.icon && level.hint);
      level.steps.forEach((step) => assert.ok(step.text && step.icon));
    });

    test(`levels_Level${number}_StageSizesCoverAllSteps`, () => {
      const total = (level.stages ?? [{ size: level.steps.length }]).reduce((sum, stage) => sum + stage.size, 0);

      assert.equal(total, level.steps.length);
    });

    test(`levels_Level${number}_CardTextsAreUnique`, () => {
      const texts = buildCards(level).map((card) => card.text);

      assert.equal(new Set(texts).size, texts.length);
    });
  });

  test("levels_ExpertLevels_HaveExtraCards", () => {
    levels.slice(15).forEach((level) => assert.ok(level.extras?.length > 0));
  });
});

describe("shuffleCards", () => {
  test("shuffleCards_SameSeed_ReturnsSameOrder", () => {
    const cards = buildCards(THREE_STEP_LEVEL);

    assert.deepEqual(shuffleCards(cards, 7), shuffleCards(cards, 7));
  });

  test("shuffleCards_AnySeed_NeverReturnsSolvedOrder", () => {
    const cards = buildCards({ steps: THREE_STEP_LEVEL.steps });

    for (let seed = 1; seed <= 50; seed++) {
      const ids = shuffleCards(cards, seed).map((card) => card.id);
      assert.notDeepEqual(ids, [0, 1, 2]);
    }
  });

  test("shuffleCards_AvoidIdsGiven_ReturnsDifferentOrder", () => {
    const cards = buildCards({ steps: THREE_STEP_LEVEL.steps });

    for (let seed = 1; seed <= 50; seed++) {
      const avoidIds = shuffleCards(cards, seed).map((card) => card.id);
      const ids = shuffleCards(cards, seed, avoidIds).map((card) => card.id);
      assert.notDeepEqual(ids, avoidIds);
      assert.notDeepEqual(ids, [0, 1, 2]);
    }
  });

  test("shuffleCards_OnlyOtherOrderAvoided_ReturnsAvoidedOrder", () => {
    const cards = buildCards({ steps: THREE_STEP_LEVEL.steps.slice(0, 2) });

    assert.deepEqual(shuffleCards(cards, 7, [1, 0]).map((card) => card.id), [1, 0]);
  });

  test("createSeed_Called_ReturnsNonNegativeInteger", () => {
    const seed = commandOrder.createSeed();

    assert.ok(Number.isInteger(seed) && seed >= 0);
  });
});

describe("checkOrder", () => {
  test("checkOrder_CorrectOrder_ReturnsCorrect", () => {
    assert.deepEqual(checkOrder([0, 1, 2]), { correct: true });
  });

  test("checkOrder_ExtraCard_ReturnsExtraWithIndex", () => {
    assert.deepEqual(checkOrder([0, 3, 2]), { correct: false, index: 1, reason: REASON.EXTRA });
  });

  test("checkOrder_LaterStepFirst_ReturnsTooEarly", () => {
    assert.deepEqual(checkOrder([2, 0, 1]), { correct: false, index: 0, reason: REASON.TOO_EARLY });
  });

  test("checkOrder_SwappedSteps_ReturnsTooEarlyAtFirstWrongSlot", () => {
    assert.deepEqual(checkOrder([0, 2, 1]), { correct: false, index: 1, reason: REASON.TOO_EARLY });
  });
});

describe("nextHint", () => {
  test("nextHint_EmptySlots_ReturnsFirstSlot", () => {
    assert.deepEqual(nextHint([null, null]), { slot: 0, cardId: 0 });
  });

  test("nextHint_SecondSlotWrong_ReturnsSecondSlot", () => {
    assert.deepEqual(nextHint([0, 2, null]), { slot: 1, cardId: 1 });
  });

  test("nextHint_SolvedOrder_ReturnsNull", () => {
    assert.equal(nextHint([0, 1, 2]), null);
  });
});
