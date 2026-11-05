// Robotun Yolunu Bul oyununun kuralları. Ekrandan bağımsızdır; bu yüzden node ile test edilebilir.
//
// Harita, satırlardan oluşan bir metin dizisidir:
//   S = robotun başlangıcı, G = hedef bayrak, # = taş, ~ = su, * = toplanacak altın, . = çim
(function (MKD) {
  "use strict";

  const TILE = Object.freeze({
    START: "S",
    GOAL: "G",
    ROCK: "#",
    WATER: "~",
    COIN: "*",
  });

  const DIRECTIONS = Object.freeze({
    up: Object.freeze({ dx: 0, dy: -1 }),
    down: Object.freeze({ dx: 0, dy: 1 }),
    left: Object.freeze({ dx: -1, dy: 0 }),
    right: Object.freeze({ dx: 1, dy: 0 }),
  });

  // Seviye verisindeki çözüm kısaltması: "RRD" = sağa, sağa, aşağı
  const SOLUTION_LETTERS = Object.freeze({ U: "up", D: "down", L: "left", R: "right" });

  const OUTCOME = Object.freeze({
    SUCCESS: "success",
    BLOCKED: "blocked", // Taşa, suya veya harita kenarına çarptı
    MISSED_GOAL: "missed-goal", // Komutlar bitti, robot bayrağa ulaşmadı
    MISSING_COINS: "missing-coins", // Bayrağa ulaştı ama altınların hepsini toplamadı
  });

  const HINT = Object.freeze({
    NEXT_MOVE: "next-move",
    FIX_COMMAND: "fix-command",
    TOO_MANY_COMMANDS: "too-many-commands",
    SOLVED: "solved",
  });

  const cellKey = (x, y) => `${x},${y}`;

  function parseLevel(definition) {
    const rows = definition.map;
    const level = {
      width: rows[0].length,
      height: rows.length,
      start: null,
      goal: null,
      blocked: new Map(), // "x,y" -> TILE.ROCK | TILE.WATER
      coins: [],
    };
    rows.forEach((row, y) => [...row].forEach((tile, x) => placeTile(level, tile, x, y)));
    return Object.freeze(level);
  }

  function placeTile(level, tile, x, y) {
    if (tile === TILE.START) {
      level.start = { x, y };
    } else if (tile === TILE.GOAL) {
      level.goal = { x, y };
    } else if (tile === TILE.ROCK || tile === TILE.WATER) {
      level.blocked.set(cellKey(x, y), tile);
    } else if (tile === TILE.COIN) {
      level.coins.push({ x, y });
    }
  }

  function isWalkable(level, x, y) {
    const inside = x >= 0 && y >= 0 && x < level.width && y < level.height;
    return inside && !level.blocked.has(cellKey(x, y));
  }

  function coinIndexAt(level, x, y) {
    return level.coins.findIndex((coin) => coin.x === x && coin.y === y);
  }

  /**
   * Komutları sırayla çalıştırır. Ekran, dönen adımları animasyonla oynatır.
   * steps: robotun her komuttan sonraki konumu; collected: o adımda alınan altının sırası (yoksa -1).
   */
  function runProgram(level, commands) {
    let { x, y } = level.start;
    const collected = new Set();
    const steps = [];

    for (let index = 0; index < commands.length; index++) {
      const { dx, dy } = DIRECTIONS[commands[index]];
      if (!isWalkable(level, x + dx, y + dy)) {
        return { outcome: OUTCOME.BLOCKED, steps, failedIndex: index, position: { x, y }, collected };
      }
      x += dx;
      y += dy;
      const coin = coinIndexAt(level, x, y);
      if (coin >= 0) {
        collected.add(coin);
      }
      steps.push({ x, y, coin });
    }

    return { outcome: finalOutcome(level, x, y, collected), steps, failedIndex: -1, position: { x, y }, collected };
  }

  function finalOutcome(level, x, y, collected) {
    if (x !== level.goal.x || y !== level.goal.y) {
      return OUTCOME.MISSED_GOAL;
    }
    return collected.size === level.coins.length ? OUTCOME.SUCCESS : OUTCOME.MISSING_COINS;
  }

  // Durum = konum + toplanan altınlar (bit maskesi). Altınlar bittikten sonra bayrağa giden en kısa yol aranır.
  function shortestPath(level, from, collected) {
    const allCoins = (1 << level.coins.length) - 1;
    const startMask = [...collected].reduce((mask, index) => mask | (1 << index), 0);
    const startKey = `${from.x},${from.y},${startMask}`;
    const queue = [{ x: from.x, y: from.y, mask: startMask, path: [] }];
    const seen = new Set([startKey]);

    while (queue.length > 0) {
      const state = queue.shift();
      if (state.mask === allCoins && state.x === level.goal.x && state.y === level.goal.y) {
        return state.path;
      }
      for (const [name, { dx, dy }] of Object.entries(DIRECTIONS)) {
        const next = advance(level, state, name, dx, dy);
        const key = next && `${next.x},${next.y},${next.mask}`;
        if (next && !seen.has(key)) {
          seen.add(key);
          queue.push(next);
        }
      }
    }
    return null;
  }

  function advance(level, state, name, dx, dy) {
    const x = state.x + dx;
    const y = state.y + dy;
    if (!isWalkable(level, x, y)) {
      return null;
    }
    const coin = coinIndexAt(level, x, y);
    const mask = coin >= 0 ? state.mask | (1 << coin) : state.mask;
    return { x, y, mask, path: [...state.path, name] };
  }

  function optimalLength(level) {
    return shortestPath(level, level.start, new Set()).length;
  }

  /**
   * İpucu: cevabın tamamını vermez, yalnızca bir sonraki doğru adımı söyler.
   * Yanlış bir komut varsa önce onu gösterir.
   */
  function findHint(level, commands, maxCommands) {
    const result = runProgram(level, commands);
    if (result.outcome === OUTCOME.BLOCKED) {
      return { type: HINT.FIX_COMMAND, index: result.failedIndex };
    }
    if (result.outcome === OUTCOME.SUCCESS) {
      return { type: HINT.SOLVED };
    }
    const rest = shortestPath(level, result.position, result.collected);
    if (commands.length + rest.length > maxCommands) {
      return { type: HINT.TOO_MANY_COMMANDS };
    }
    const { dx, dy } = DIRECTIONS[rest[0]];
    return {
      type: HINT.NEXT_MOVE,
      direction: rest[0],
      target: { x: result.position.x + dx, y: result.position.y + dy },
    };
  }

  function parseSolution(text) {
    return [...text].map((letter) => SOLUTION_LETTERS[letter]);
  }

  MKD.pathFinder = Object.assign(MKD.pathFinder ?? {}, {
    TILE,
    DIRECTIONS,
    OUTCOME,
    HINT,
    parseLevel,
    runProgram,
    shortestPath,
    optimalLength,
    findHint,
    parseSolution,
  });
})((globalThis.MKD ??= {}));
