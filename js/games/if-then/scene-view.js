// Eğer Böyleyse: robotun yürüdüğü yolun görünümü. Kurallardan habersizdir; yalnızca çizer ve oynatır.
// Sıra: başlangıç karesi, yol kareleri, bayrak karesi. Robotun konumu bu sıradaki karedir.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { BUMP_MS, wait } = MKD.timing;
  const { IMAGES } = MKD.components;
  const { KIND, ACTION } = MKD.ifThen;

  // Yol karesinde görünen nesneler; su ve boş yolun görseli yoktur.
  const KIND_IMAGES = Object.freeze({
    [KIND.ROCK]: IMAGES.rock,
    [KIND.DOOR]: IMAGES.door,
    [KIND.STAR]: IMAGES.star,
  });

  // Hareketten önce karede oynayan küçük animasyon: köprü kurulur, kapı açılır, yıldız alınır.
  const CELL_EFFECT = Object.freeze({
    [ACTION.BRIDGE]: "is-bridged",
    [ACTION.OPEN]: "is-open",
    [ACTION.COLLECT]: "is-collected",
  });

  const ROBOT_CLASSES = Object.freeze({ jump: "is-jumping", bump: "is-bumping", happy: "is-happy" });
  const MARK_CLASSES = ["is-wrong", "is-hint", ...Object.values(CELL_EFFECT)];
  const START_OFFSET = 1;

  function laneCell(kind) {
    const classes = `if-cell ${kind === KIND.WATER ? "if-water" : "if-path"} kind-${kind}`;
    return el("div", { className: classes }, [KIND_IMAGES[kind] && el("img", { className: "if-object", src: KIND_IMAGES[kind], alt: "" })]);
  }

  function createSceneView(lane) {
    const cells = lane.map(laneCell);
    const allCells = [
      el("div", { className: "if-cell if-path if-start" }),
      ...cells,
      el("div", { className: "if-cell if-path if-goal" }, [el("img", { className: "if-object", src: IMAGES.goal, alt: "Bayrak" })]),
    ];
    const robot = el("div", { className: "if-robot" }, [el("img", { src: IMAGES.robot, alt: "Robot" })]);
    const row = el("div", { className: "if-lane" }, [...allCells, robot]);
    row.style.setProperty("--count", allCells.length);
    const scroller = el("div", { className: "if-lane-scroll" }, [row]);
    const element = el("div", { className: "if-scene card", role: "img", "aria-label": "Robotun yolu" }, [scroller]);

    // Dar ekranda yol yatay kayar; robotun bulunduğu kare ortada tutulur. Sayfanın kendisi kaydırılmaz.
    function moveRobot(position) {
      robot.style.setProperty("--x", position);
      const cell = allCells[position];
      scroller.scrollTo?.({ left: cell.offsetLeft - (scroller.clientWidth - cell.offsetWidth) / 2, behavior: "smooth" });
    }

    // Taşın üstüne inilmez. Zıplama kararı bekletilir; robot sonraki karenin hareketiyle birlikte
    // taşın üstünden atlar ve taştan sonraki kareye (ya da bayrağa) iner. Böylece taştan sonra su
    // varsa önce köprü kurulur, robot köprüye iner.
    let jumpPending = false;

    function moveOrJump(position) {
      robot.classList.toggle(ROBOT_CLASSES.jump, jumpPending);
      jumpPending = false;
      moveRobot(position);
    }

    /** Bir yol karesine geçişi oynatır: varsa önce karedeki etki, sonra yürüme ya da zıplama. */
    async function playStep(step, duration) {
      if (step.action === ACTION.JUMP) {
        jumpPending = true;
        await wait(duration / 2);
        return;
      }
      const effect = CELL_EFFECT[step.action];
      if (effect) {
        cells[step.index].classList.add(effect);
        await wait(duration / 2);
      }
      moveOrJump(step.index + START_OFFSET);
      await wait(duration);
      robot.classList.remove(ROBOT_CLASSES.jump);
    }

    function fail(index) {
      jumpPending = false;
      cells[index].classList.add("is-wrong");
      robot.classList.add(ROBOT_CLASSES.bump);
      setTimeout(() => robot.classList.remove(ROBOT_CLASSES.bump), BUMP_MS);
    }

    function reset() {
      jumpPending = false;
      cells.forEach((cell) => cell.classList.remove(...MARK_CLASSES));
      robot.classList.remove(...Object.values(ROBOT_CLASSES));
      moveRobot(0);
    }

    function showHint(index) {
      cells.forEach((cell) => cell.classList.remove("is-hint"));
      cells[index].classList.add("is-hint");
    }

    moveRobot(0);
    return Object.freeze({
      element,
      playStep,
      fail,
      reset,
      showHint,
      reachGoal: () => moveOrJump(allCells.length - 1),
      celebrate: () => {
        robot.classList.remove(ROBOT_CLASSES.jump);
        robot.classList.add(ROBOT_CLASSES.happy);
      },
    });
  }

  MKD.ifThen = Object.assign(MKD.ifThen ?? {}, { createSceneView });
})((globalThis.MKD ??= {}));
