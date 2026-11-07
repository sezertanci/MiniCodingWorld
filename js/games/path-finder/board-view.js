// Robotun Yolunu Bul: ızgara haritanın görünümü. Kurallardan habersizdir; yalnızca çizer ve oynatır.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { BUMP_MS } = MKD.timing;
  const { IMAGES } = MKD.components;
  const { TILE, cellKey } = MKD.pathFinder;

  const COIN_IMAGE = "assets/icons/points.svg";
  const BUMP_CLASS = "is-bumping";

  function tileClass(level, x, y) {
    const tile = level.blocked.get(cellKey(x, y));
    const shade = (x + y) % 2 === 0 ? "tile-light" : "tile-dark";
    if (tile === TILE.WATER) {
      return "pf-tile tile-water";
    }
    return tile === TILE.ROCK ? `pf-tile ${shade} tile-rock` : `pf-tile ${shade}`;
  }

  function createCell(level, x, y) {
    const isRock = level.blocked.get(cellKey(x, y)) === TILE.ROCK;
    return el("div", { className: tileClass(level, x, y) }, [
      isRock && el("img", { className: "pf-object", src: IMAGES.rock, alt: "" }),
    ]);
  }

  // Bayrak, altın ve robot hücrelerin üstündeki katmanda durur; konumları CSS değişkenleriyle verilir.
  function moveTo(node, position) {
    node.style.setProperty("--x", position.x);
    node.style.setProperty("--y", position.y);
  }

  function placed(className, position, children = []) {
    const node = el("div", { className: `pf-piece ${className}` }, children);
    moveTo(node, position);
    return node;
  }

  function createBoardView(level) {
    const cells = [];
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        cells.push(createCell(level, x, y));
      }
    }

    const coins = level.coins.map((coin) => placed("pf-coin", coin, [el("img", { src: COIN_IMAGE, alt: "Altın" })]));
    const goal = placed("pf-goal", level.goal, [el("img", { src: IMAGES.goal, alt: "Bayrak" })]);
    const startMarker = placed("pf-start", level.start);
    const hintMarker = placed("pf-hint-marker", level.start);
    const robot = placed("pf-robot", level.start, [el("img", { src: IMAGES.robot, alt: "Robot" })]);
    hintMarker.hidden = true;

    const element = el("div", { className: "pf-board", role: "img", "aria-label": "Oyun haritası" }, [
      ...cells, startMarker, goal, ...coins, hintMarker, robot,
    ]);
    element.style.setProperty("--cols", level.width);
    element.style.setProperty("--rows", level.height);

    // Robotun izi: ayrıldığı her kareye gittiği yönü gösteren bir ok bırakılır.
    // Robot aynı kareden yeniden geçerse oklar üst üste binmesin diye son yön gösterilir.
    let current = level.start;
    const trail = new Map();

    function moveRobot(position, direction) {
      const key = cellKey(current.x, current.y);
      trail.get(key)?.remove();
      const mark = placed("pf-trail", current);
      mark.dataset.direction = direction;
      element.insertBefore(mark, hintMarker);
      trail.set(key, mark);
      current = position;
      moveTo(robot, position);
    }

    // Robot çarpacağı yöne doğru kısa bir sarsılma yapar ve yerine döner.
    function bump(direction) {
      robot.dataset.direction = direction;
      robot.classList.add(BUMP_CLASS);
      setTimeout(() => robot.classList.remove(BUMP_CLASS), BUMP_MS);
    }

    function reset() {
      moveTo(robot, level.start);
      current = level.start;
      trail.forEach((mark) => mark.remove());
      trail.clear();
      coins.forEach((coin) => coin.classList.remove("is-collected"));
      robot.classList.remove("is-happy");
    }

    function showHint(position) {
      moveTo(hintMarker, position);
      hintMarker.hidden = false;
    }

    return Object.freeze({
      element,
      moveRobot,
      collectCoin: (index) => coins[index].classList.add("is-collected"),
      celebrate: () => robot.classList.add("is-happy"),
      bump,
      reset,
      showHint,
      hideHint: () => { hintMarker.hidden = true; },
    });
  }

  MKD.pathFinder = Object.assign(MKD.pathFinder ?? {}, { createBoardView });
})((globalThis.MKD ??= {}));
