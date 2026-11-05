// Robotun Yolunu Bul: kural ve seviye verisi testleri.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/games/path-finder/engine.js");
require("../js/games/path-finder/levels.js");

const { config, pathFinder } = globalThis.MKD;
const { parseLevel, runProgram, optimalLength, findHint, parseSolution, OUTCOME, HINT, levels } = pathFinder;

// Robot (0,1), bayrak (2,1), aradaki (1,1) karesinde taş var. Üstte bir altın.
const ROCK_MAP = { map: ["*..", "S#G", "..."] };
const NO_LIMIT = 99;

describe("levels", () => {
  test("levels_Count_MatchesLevelsPerGame", () => {
    assert.equal(levels.length, config.LEVELS_PER_GAME);
  });

  levels.forEach((definition, index) => {
    const number = index + 1;

    test(`levels_Level${number}_SolutionReachesGoal`, () => {
      const level = parseLevel(definition);

      const result = runProgram(level, parseSolution(definition.solution));

      assert.equal(result.outcome, OUTCOME.SUCCESS);
    });

    test(`levels_Level${number}_SolutionIsShortestAndFitsLimit`, () => {
      const level = parseLevel(definition);

      const shortest = optimalLength(level);

      assert.equal(definition.solution.length, shortest);
      assert.ok((definition.maxCommands ?? NO_LIMIT) >= shortest);
    });
  });
});

describe("runProgram", () => {
  test("runProgram_PathIntoRock_ReturnsBlockedWithIndex", () => {
    const level = parseLevel(ROCK_MAP);

    const result = runProgram(level, ["right"]);

    assert.equal(result.outcome, OUTCOME.BLOCKED);
    assert.equal(result.failedIndex, 0);
    assert.deepEqual(result.position, { x: 0, y: 1 });
  });

  test("runProgram_PathOutsideMap_ReturnsBlocked", () => {
    const level = parseLevel(ROCK_MAP);

    const result = runProgram(level, ["left"]);

    assert.equal(result.outcome, OUTCOME.BLOCKED);
  });

  test("runProgram_StopsBeforeGoal_ReturnsMissedGoal", () => {
    const level = parseLevel(ROCK_MAP);

    const result = runProgram(level, ["down", "right"]);

    assert.equal(result.outcome, OUTCOME.MISSED_GOAL);
    assert.equal(result.steps.length, 2);
  });

  test("runProgram_GoalWithoutCoin_ReturnsMissingCoins", () => {
    const level = parseLevel(ROCK_MAP);

    const result = runProgram(level, ["down", "right", "right", "up"]);

    assert.equal(result.outcome, OUTCOME.MISSING_COINS);
  });

  test("runProgram_CoinThenGoal_ReturnsSuccessAndMarksCoinStep", () => {
    const level = parseLevel(ROCK_MAP);

    const result = runProgram(level, ["up", "right", "right", "down"]);

    assert.equal(result.outcome, OUTCOME.SUCCESS);
    assert.equal(result.steps[0].coin, 0);
  });
});

describe("findHint", () => {
  test("findHint_NoCommands_ReturnsFirstMoveTowardsCoin", () => {
    const level = parseLevel(ROCK_MAP);

    const hint = findHint(level, [], NO_LIMIT);

    assert.equal(hint.type, HINT.NEXT_MOVE);
    assert.equal(hint.direction, "up");
    assert.deepEqual(hint.target, { x: 0, y: 0 });
  });

  test("findHint_BlockedCommand_ReturnsFixWithIndex", () => {
    const level = parseLevel(ROCK_MAP);

    const hint = findHint(level, ["up", "left"], NO_LIMIT);

    assert.deepEqual(hint, { type: HINT.FIX_COMMAND, index: 1 });
  });

  test("findHint_LimitTooSmall_ReturnsTooManyCommands", () => {
    const level = parseLevel(ROCK_MAP);

    const hint = findHint(level, ["down"], 4);

    assert.equal(hint.type, HINT.TOO_MANY_COMMANDS);
  });

  test("findHint_SolvedProgram_ReturnsSolved", () => {
    const level = parseLevel(ROCK_MAP);

    const hint = findHint(level, ["up", "right", "right", "down"], NO_LIMIT);

    assert.equal(hint.type, HINT.SOLVED);
  });
});
