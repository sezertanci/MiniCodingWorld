// Eğer Böyleyse: oyun kuralları. Ekrandan bağımsızdır, Node testleriyle de çalışır.
// Robot düz bir yolda ilerler. Her karede önündekine bakar ve çocuğun kurduğu kurallardan
// ilk uyanını uygular; hiçbiri uymazsa "Değilse" hareketini yapar.
//
// Yol işaretleri:  .  boş yol   #  taş   ~  su   D  kapı   *  yıldız
(function (MKD) {
  "use strict";

  const KIND = Object.freeze({ EMPTY: "empty", ROCK: "rock", WATER: "water", DOOR: "door", STAR: "star" });
  const ACTION = Object.freeze({ FORWARD: "forward", JUMP: "jump", BRIDGE: "bridge", OPEN: "open", COLLECT: "collect" });
  const OUTCOME = Object.freeze({ SUCCESS: "success", WRONG_ACTION: "wrong-action" });
  const ELSE_RULE = -1;

  const SYMBOLS = Object.freeze({ ".": KIND.EMPTY, "#": KIND.ROCK, "~": KIND.WATER, D: KIND.DOOR, "*": KIND.STAR });

  // Her nesne için tek doğru hareket vardır.
  const CORRECT_ACTION = Object.freeze({
    [KIND.EMPTY]: ACTION.FORWARD,
    [KIND.ROCK]: ACTION.JUMP,
    [KIND.WATER]: ACTION.BRIDGE,
    [KIND.DOOR]: ACTION.OPEN,
    [KIND.STAR]: ACTION.COLLECT,
  });

  function parseLane(text) {
    return [...text].map((symbol) => {
      const kind = SYMBOLS[symbol];
      if (!kind) throw new Error(`Bilinmeyen yol işareti: ${symbol}`);
      return kind;
    });
  }

  /** Seviyede seçilebilecek bloklar: yoldaki nesneler, onların hareketleri ve her zaman İleri Git. */
  function paletteFor(level) {
    const objects = new Set([...parseLane(level.lane), ...(level.extras ?? [])]);
    objects.delete(KIND.EMPTY);
    const conditions = Object.values(KIND).filter((kind) => objects.has(kind));
    const actions = Object.values(ACTION).filter((action) =>
      action === ACTION.FORWARD || conditions.some((kind) => CORRECT_ACTION[kind] === action)
    );
    return { conditions, actions };
  }

  /**
   * Önündeki nesneye göre hangi kuralın çalışacağını bulur.
   * @param {{ branches: { condition: string|null, action: string|null }[], otherwise: string|null }} program
   * @returns {{ action: string|null, rule: number }} rule: kural sırası, "Değilse" için ELSE_RULE
   */
  function decide(program, kind) {
    const rule = program.branches.findIndex((branch) => branch.condition === kind);
    return rule >= 0 ? { action: program.branches[rule].action, rule } : { action: program.otherwise, rule: ELSE_RULE };
  }

  /** Programı yolun başından sonuna çalıştırır; ilk yanlış harekette durur. */
  function runProgram(lane, program) {
    const steps = [];
    for (let index = 0; index < lane.length; index++) {
      const kind = lane[index];
      const { action, rule } = decide(program, kind);
      steps.push({ index, kind, action, rule });
      if (action !== CORRECT_ACTION[kind]) {
        return { outcome: OUTCOME.WRONG_ACTION, steps, failedIndex: index };
      }
    }
    return { outcome: OUTCOME.SUCCESS, steps, failedIndex: -1 };
  }

  /** İlk sorunlu kareyi ve orada gereken hareketi döndürür; program doğruysa null. */
  function findHint(lane, program) {
    const result = runProgram(lane, program);
    if (result.outcome === OUTCOME.SUCCESS) return null;
    const step = result.steps[result.failedIndex];
    return { index: step.index, kind: step.kind, action: CORRECT_ACTION[step.kind], rule: step.rule };
  }

  MKD.ifThen = Object.assign(MKD.ifThen ?? {}, {
    KIND, ACTION, OUTCOME, ELSE_RULE, CORRECT_ACTION, parseLane, paletteFor, decide, runProgram, findHint,
  });
})((globalThis.MKD ??= {}));
