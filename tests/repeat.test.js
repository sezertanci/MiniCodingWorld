// Tekrar Et: kural ve seviye verisi testleri.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/config.js");
require("../js/games/path-finder/engine.js");
require("../js/games/repeat/engine.js");
require("../js/games/repeat/levels.js");

const { config, pathFinder, repeatGame } = globalThis.MKD;
const { parseLevel, optimalLength, OUTCOME } = pathFinder;
const { move, repeat, parseSolution, countBlocks, expand, runProgram, findHint, HINT, BLOCK, TIMES, TOP_LEVEL, levels } = repeatGame;

// Robot (0,1), bayrak (3,1); (1,0) karesinde taş var.
const LINE_MAP = parseLevel({ map: [".#..", "S..G"] });

describe("levels", () => {
  test("levels_Count_MatchesLevelsPerGame", () => {
    assert.equal(levels.length, config.LEVELS_PER_GAME);
  });

  levels.forEach((definition, index) => {
    const number = index + 1;

    test(`levels_Level${number}_SolutionReachesGoalInShortestPath`, () => {
      const level = parseLevel(definition);
      const program = parseSolution(definition.solution);

      const result = runProgram(level, program);

      assert.equal(result.outcome, OUTCOME.SUCCESS);
      assert.equal(result.steps.length, optimalLength(level));
    });

    test(`levels_Level${number}_SolutionFitsLimitButSingleMovesDoNot`, () => {
      const level = parseLevel(definition);

      const blocks = countBlocks(parseSolution(definition.solution));

      assert.ok(blocks <= definition.maxBlocks);
      assert.ok(optimalLength(level) > definition.maxBlocks);
    });

    test(`levels_Level${number}_RepeatCountsStayInRange`, () => {
      const repeats = parseSolution(definition.solution).filter((block) => block.type === BLOCK.REPEAT);

      assert.ok(repeats.length > 0);
      repeats.forEach((block) => assert.ok(block.times >= TIMES.MIN && block.times <= TIMES.MAX));
    });
  });
});

describe("parseSolution", () => {
  test("parseSolution_RepeatAndMove_ReturnsBlocks", () => {
    const program = parseSolution("3(RD) U");

    assert.deepEqual(program, [repeat(3, ["right", "down"]), move("up")]);
  });
});

describe("countBlocks", () => {
  test("countBlocks_RepeatWithTwoMovesAndOneMove_ReturnsFour", () => {
    assert.equal(countBlocks([repeat(5, ["right", "down"]), move("up")]), 4);
  });
});

describe("expand", () => {
  test("expand_RepeatBlock_ReturnsStepsWithBlockRoundAndInner", () => {
    const trace = expand([move("up"), repeat(2, ["right", "down"])]);

    assert.deepEqual(trace.map((step) => step.direction), ["up", "right", "down", "right", "down"]);
    assert.deepEqual(trace[0], { direction: "up", block: 0, inner: TOP_LEVEL, round: 0 });
    assert.deepEqual(trace[4], { direction: "down", block: 1, inner: 1, round: 1 });
  });
});

describe("runProgram", () => {
  test("runProgram_RepeatReachesGoal_ReturnsSuccess", () => {
    const result = runProgram(LINE_MAP, [repeat(3, ["right"])]);

    assert.equal(result.outcome, OUTCOME.SUCCESS);
    assert.equal(result.trace.length, 3);
  });

  test("runProgram_TooManyRounds_ReturnsBlockedAtLastRound", () => {
    const result = runProgram(LINE_MAP, [repeat(4, ["right"])]);

    assert.equal(result.outcome, OUTCOME.BLOCKED);
    assert.equal(result.trace[result.failedIndex].round, 3);
  });
});

describe("findHint", () => {
  test("findHint_EmptyRepeat_ReturnsEmptyRepeat", () => {
    const hint = findHint(LINE_MAP, [move("right"), repeat(2, [])]);

    assert.deepEqual(hint, { type: HINT.EMPTY_REPEAT, block: 1 });
  });

  test("findHint_WrongInnerMove_ReturnsBlockAndInner", () => {
    const hint = findHint(LINE_MAP, [repeat(2, ["right", "up"])]);

    assert.deepEqual(hint, { type: HINT.FIX_COMMAND, block: 0, inner: 1, round: 0 });
  });

  test("findHint_TooManyRounds_ReturnsFixWithRound", () => {
    const hint = findHint(LINE_MAP, [repeat(4, ["right"])]);

    assert.deepEqual(hint, { type: HINT.FIX_COMMAND, block: 0, inner: 0, round: 3 });
  });

  test("findHint_ShortProgram_ReturnsNextMove", () => {
    const hint = findHint(LINE_MAP, [repeat(2, ["right"])]);

    assert.equal(hint.type, HINT.NEXT_MOVE);
    assert.equal(hint.direction, "right");
  });

  test("findHint_SolvedProgram_ReturnsSolved", () => {
    assert.deepEqual(findHint(LINE_MAP, [repeat(3, ["right"])]), { type: HINT.SOLVED });
  });
});
