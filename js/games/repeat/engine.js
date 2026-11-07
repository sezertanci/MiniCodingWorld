// Tekrar Et: oyun kuralları. Ekrandan bağımsızdır, Node testleriyle de çalışır.
// Harita ve hareket kuralları Robotun Yolunu Bul oyunundan (MKD.pathFinder) gelir.
// Program, hareket bloklarından ve "N kez tekrarla" bloklarından oluşur. Tekrar bloğunun içinde
// yalnızca hareket blokları bulunur; iç içe tekrar yoktur (7 yaş için sade tutuldu).
//
// Seviye verisindeki çözüm kısaltması: "3(RD) U" = 3 kez (sağa, aşağı), sonra yukarı.
(function (MKD) {
  "use strict";

  const BLOCK = Object.freeze({ MOVE: "move", REPEAT: "repeat" });
  const TIMES = Object.freeze({ MIN: 2, MAX: 6, DEFAULT: 2 });
  const TOP_LEVEL = -1;

  const HINT = Object.freeze({
    EMPTY_REPEAT: "empty-repeat",
    FIX_COMMAND: "fix-command",
    NEXT_MOVE: "next-move",
    SOLVED: "solved",
  });

  const REPEAT_TOKEN = /^(\d+)\(([UDLR]+)\)$/;

  const move = (direction) => ({ type: BLOCK.MOVE, direction });
  const repeat = (times, body) => ({ type: BLOCK.REPEAT, times, body });

  function parseSolution(text) {
    const { parseSolution: letters } = MKD.pathFinder;
    return text.trim().split(/\s+/).flatMap((token) => {
      const match = REPEAT_TOKEN.exec(token);
      return match ? [repeat(Number(match[1]), letters(match[2]))] : letters(token).map(move);
    });
  }

  /** Blok sayısı: her hareket ve her tekrar bloğu bir sayılır; tekrar bloğunun içindekiler de sayılır. */
  function countBlocks(program) {
    return program.reduce((sum, block) => sum + (block.type === BLOCK.REPEAT ? 1 + block.body.length : 1), 0);
  }

  /**
   * Programı tek tek hareketlere açar. Her hareket hangi bloktan geldiğini taşır;
   * ekran bunu çalışırken bloğu ve tekrar sayacını vurgulamak için kullanır.
   * @returns {{ direction: string, block: number, inner: number, round: number }[]}
   */
  function expand(program) {
    return program.flatMap((block, index) => {
      if (block.type === BLOCK.MOVE) {
        return [{ direction: block.direction, block: index, inner: TOP_LEVEL, round: 0 }];
      }
      return Array.from({ length: block.times }, (_, round) =>
        block.body.map((direction, inner) => ({ direction, block: index, inner, round }))
      ).flat();
    });
  }

  function runProgram(level, program) {
    const trace = expand(program);
    return { ...MKD.pathFinder.runProgram(level, trace.map((step) => step.direction)), trace };
  }

  /** İçi boş ilk tekrar bloğunun sırası; yoksa -1. Boş blok varken program çalıştırılmaz. */
  function findEmptyRepeat(program) {
    return program.findIndex((block) => block.type === BLOCK.REPEAT && block.body.length === 0);
  }

  /** İpucu: önce boş tekrar bloğu, sonra robotu yoldan çıkaran hareket, yoksa sıradaki doğru hareket. */
  function findHint(level, program) {
    const empty = findEmptyRepeat(program);
    if (empty >= 0) {
      return { type: HINT.EMPTY_REPEAT, block: empty };
    }
    const trace = expand(program);
    const { HINT: PF_HINT, findHint: pathHint } = MKD.pathFinder;
    const hint = pathHint(level, trace.map((step) => step.direction), Infinity);
    if (hint.type === PF_HINT.FIX_COMMAND) {
      const { block, inner, round } = trace[hint.index];
      return { type: HINT.FIX_COMMAND, block, inner, round };
    }
    if (hint.type === PF_HINT.SOLVED) {
      return { type: HINT.SOLVED };
    }
    return { type: HINT.NEXT_MOVE, direction: hint.direction, target: hint.target };
  }

  MKD.repeatGame = Object.assign(MKD.repeatGame ?? {}, {
    BLOCK, TIMES, TOP_LEVEL, HINT, move, repeat, parseSolution, countBlocks, expand, runProgram, findEmptyRepeat, findHint,
  });
})((globalThis.MKD ??= {}));
