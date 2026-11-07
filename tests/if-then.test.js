// Eğer Böyleyse: kural ve seviye verisi testleri.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/games/if-then/engine.js");
require("../js/games/if-then/levels.js");

const { config, ifThen } = globalThis.MKD;
const { KIND, ACTION, OUTCOME, ELSE_RULE, parseLane, paletteFor, decide, runProgram, findHint, levels } = ifThen;

const GROUP_BRANCH_COUNTS = [
  { from: 1, to: 5, branches: 1, fixedElse: true },
  { from: 6, to: 10, branches: 1, fixedElse: false },
  { from: 11, to: 15, branches: 2, fixedElse: false },
  { from: 16, to: 20, branches: 3, fixedElse: false },
];

const ROCK_RULE = { branches: [{ condition: KIND.ROCK, action: ACTION.JUMP }], otherwise: ACTION.FORWARD };

// Çocuğun seçebileceği her blok birleşimini dener; en az biri yolu bitirmelidir.
function hasSolution(level) {
  const { conditions, actions } = paletteFor(level);
  const options = [
    ...level.rules.flatMap((rule) => [rule.if ? [rule.if] : conditions, rule.then ? [rule.then] : actions]),
    level.else ? [level.else] : actions,
  ];
  const lane = parseLane(level.lane);
  const combine = (index, picked) => {
    if (index === options.length) {
      const branches = level.rules.map((_, i) => ({ condition: picked[i * 2], action: picked[i * 2 + 1] }));
      return runProgram(lane, { branches, otherwise: picked.at(-1) }).outcome === OUTCOME.SUCCESS;
    }
    return options[index].some((value) => combine(index + 1, [...picked, value]));
  };
  return combine(0, []);
}

describe("levels", () => {
  test("levels_Count_MatchesLevelsPerGame", () => {
    assert.equal(levels.length, config.LEVELS_PER_GAME);
  });

  GROUP_BRANCH_COUNTS.forEach(({ from, to, branches, fixedElse }) => {
    test(`levels_Levels${from}To${to}_HaveGroupRuleShape`, () => {
      levels.slice(from - 1, to).forEach((level) => {
        assert.equal(level.rules.length, branches);
        assert.equal(Boolean(level.else), fixedElse);
      });
    });
  });

  // Hazır koşul boş yol olamaz; boş yol "Değilse" satırının işidir.
  test("levels_FixedConditions_AreNeverEmptyKind", () => {
    levels.forEach((level) => {
      level.rules.forEach((rule) => assert.notEqual(rule.if, KIND.EMPTY));
    });
  });

  levels.forEach((level, index) => {
    test(`levels_Level${index + 1}_HasSolutionWithPalette`, () => {
      assert.ok(level.intro);
      assert.ok(hasSolution(level));
    });
  });
});

describe("parseLane", () => {
  test("parseLane_AllSymbols_ReturnsKinds", () => {
    assert.deepEqual(parseLane(".#~D*"), [KIND.EMPTY, KIND.ROCK, KIND.WATER, KIND.DOOR, KIND.STAR]);
  });

  test("parseLane_UnknownSymbol_Throws", () => {
    assert.throws(() => parseLane(".x"));
  });
});

describe("paletteFor", () => {
  test("paletteFor_LaneWithExtras_ReturnsObjectsAndTheirActionsPlusForward", () => {
    const palette = paletteFor({ lane: ".#.", extras: [KIND.WATER] });

    assert.deepEqual(palette.conditions, [KIND.ROCK, KIND.WATER]);
    assert.deepEqual(palette.actions, [ACTION.FORWARD, ACTION.JUMP, ACTION.BRIDGE]);
  });
});

describe("decide", () => {
  test("decide_MatchingRule_ReturnsRuleAction", () => {
    assert.deepEqual(decide(ROCK_RULE, KIND.ROCK), { action: ACTION.JUMP, rule: 0 });
  });

  test("decide_NoMatchingRule_ReturnsElseAction", () => {
    assert.deepEqual(decide(ROCK_RULE, KIND.EMPTY), { action: ACTION.FORWARD, rule: ELSE_RULE });
  });

  test("decide_SameConditionTwice_FirstRuleWins", () => {
    const program = { branches: [{ condition: KIND.ROCK, action: ACTION.OPEN }, ROCK_RULE.branches[0]], otherwise: null };

    assert.equal(decide(program, KIND.ROCK).action, ACTION.OPEN);
  });
});

describe("runProgram", () => {
  test("runProgram_CorrectRules_ReturnsSuccessWithAllSteps", () => {
    const result = runProgram(parseLane(".#."), ROCK_RULE);

    assert.equal(result.outcome, OUTCOME.SUCCESS);
    assert.equal(result.steps.length, 3);
  });

  test("runProgram_WaterWithoutRule_StopsAtWater", () => {
    const result = runProgram(parseLane(".~#"), ROCK_RULE);

    assert.equal(result.outcome, OUTCOME.WRONG_ACTION);
    assert.equal(result.failedIndex, 1);
    assert.deepEqual(result.steps.at(-1), { index: 1, kind: KIND.WATER, action: ACTION.FORWARD, rule: ELSE_RULE });
  });
});

describe("findHint", () => {
  test("findHint_FailingProgram_ReturnsCellAndNeededAction", () => {
    const hint = findHint(parseLane(".~"), ROCK_RULE);

    assert.deepEqual(hint, { index: 1, kind: KIND.WATER, action: ACTION.BRIDGE, rule: ELSE_RULE });
  });

  test("findHint_SolvedProgram_ReturnsNull", () => {
    assert.equal(findHint(parseLane("#."), ROCK_RULE), null);
  });
});
