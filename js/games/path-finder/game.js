// Robotun Yolunu Bul: oyun ekranı. Çocuk yön komutlarını listeye ekler, sıralar ve Başlat ile çalıştırır.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { OUTCOME, HINT, TILE, DIRECTIONS } = MKD.pathFinder;

  const GAME_ID = "path-finder";
  const DEFAULT_MAX_COMMANDS = 16;
  const STEP_MS = 450;
  const REDUCED_STEP_MS = 150;
  const CELEBRATE_MS = 900;

  // Yön tuşları artı şeklinde dizilir; sıra CSS ızgarasındaki yerleri belirler.
  const COMMANDS = Object.freeze({
    up: { label: "Yukarı", icon: "assets/ui/button-arrow-up.svg" },
    left: { label: "Sola", icon: "assets/ui/button-arrow-left.svg" },
    right: { label: "Sağa", icon: "assets/ui/button-arrow-right.svg" },
    down: { label: "Aşağı", icon: "assets/ui/button-arrow-down.svg" },
  });

  const MESSAGES = Object.freeze({
    intro: "Robotu bayrağa ulaştırmak için komutları sırayla seç.",
    coinIntro: "Önce bütün altınları topla, sonra bayrağa git.",
    empty: "Önce bir yön komutu ekle.",
    full: "Komut sınırına ulaştın. Bir komutu silip yerine başkasını koyabilirsin.",
    running: "Robot yola çıktı...",
    success: "Harika! Robot bayrağa ulaştı!",
    missedGoal: "Robot bayrağa ulaşamadı. Komut eklemeyi ya da değiştirmeyi dene.",
    missingCoins: "Bayrağa ulaştın ama bütün altınları toplamadın. Önce altınları topla.",
    tooMany: "Bu komutlarla sınır içinde bitiremezsin. Gereksiz adımları silmeyi dene.",
    solved: "Komutların doğru! Başlat'a dokun.",
  });

  const OBSTACLE_NAMES = Object.freeze({ [TILE.ROCK]: "taşa", [TILE.WATER]: "suya" });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stepDuration = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? REDUCED_STEP_MS : STEP_MS;

  function blockedMessage(level, position, direction, index) {
    const { dx, dy } = DIRECTIONS[direction];
    const tile = level.blocked.get(`${position.x + dx},${position.y + dy}`);
    const target = OBSTACLE_NAMES[tile] ?? "harita kenarına";
    return `Robot ${target} çarptı. ${index + 1}. komutu değiştirmeyi dene.`;
  }

  function hintMessage(hint) {
    if (hint.type === HINT.FIX_COMMAND) {
      return `${hint.index + 1}. komut robotu yoldan çıkarıyor. Onu senin için seçtim; silebilir ya da yerini değiştirebilirsin.`;
    }
    if (hint.type === HINT.TOO_MANY_COMMANDS) {
      return MESSAGES.tooMany;
    }
    if (hint.type === HINT.SOLVED) {
      return MESSAGES.solved;
    }
    return `Parlayan kareye bak. Sıradaki komut: ${COMMANDS[hint.direction].label}.`;
  }

  function mount(container, { level: levelNumber, onComplete }) {
    const definition = MKD.pathFinder.levels[levelNumber - 1];
    const level = MKD.pathFinder.parseLevel(definition);
    const maxCommands = definition.maxCommands ?? DEFAULT_MAX_COMMANDS;
    const targetLength = MKD.pathFinder.optimalLength(level);
    const board = MKD.pathFinder.createBoardView(level);
    const introText = definition.intro ?? (level.coins.length > 0 ? MESSAGES.coinIntro : MESSAGES.intro);

    const state = { commands: [], selected: -1, hintUsed: false, running: false, highlight: null };

    const bubble = MKD.components.speechBubble(introText);
    const programList = el("ol", { className: "pf-program-list", "aria-label": "Komutlarım" });
    const programCount = el("span", { className: "pf-program-count" });
    const editBar = el("div", { className: "pf-edit-bar" });
    const padButtons = {};
    const actionButtons = {};

    const say = bubble.say;

    // Komut listesi değişince robot başa döner, eski ipucu silinir ve liste yeniden çizilir.
    function changeProgram(update) {
      update();
      state.highlight = null;
      board.reset();
      board.hideHint();
      renderProgram();
    }

    // Sınıra ulaşınca yön tuşları pasifleşir; çocuk nedenini robotun mesajından öğrenir.
    function addCommand(direction) {
      changeProgram(() => {
        state.commands.push(direction);
        state.selected = -1;
      });
      if (state.commands.length >= maxCommands) {
        say(MESSAGES.full);
      }
    }

    function moveSelected(offset) {
      const from = state.selected;
      const to = from + offset;
      if (to < 0 || to >= state.commands.length) {
        return;
      }
      changeProgram(() => {
        [state.commands[from], state.commands[to]] = [state.commands[to], state.commands[from]];
        state.selected = to;
      });
    }

    function deleteSelected() {
      changeProgram(() => {
        state.commands.splice(state.selected, 1);
        state.selected = -1;
      });
    }

    function clearAll() {
      changeProgram(() => {
        state.commands = [];
        state.selected = -1;
      });
      say(introText);
    }

    function restart() {
      changeProgram(() => { state.selected = -1; });
      say(introText);
    }

    function toggleSelect(index) {
      state.selected = state.selected === index ? -1 : index;
      renderProgram();
    }

    function chip(direction, index) {
      const classes = ["pf-chip"];
      if (index === state.selected) classes.push("is-selected");
      if (state.highlight?.index === index) classes.push(state.highlight.className);
      return el("li", {}, [
        el("button", {
          type: "button",
          className: classes.join(" "),
          "aria-label": `${index + 1}. komut: ${COMMANDS[direction].label}`,
          "aria-pressed": String(index === state.selected),
          disabled: state.running,
          onClick: () => toggleSelect(index),
        }, [
          el("span", { className: "pf-chip-number", text: String(index + 1) }),
          el("img", { src: COMMANDS[direction].icon, alt: "" }),
        ]),
      ]);
    }

    function editButton(text, label, onClick, disabled) {
      return el("button", { type: "button", className: "btn pf-edit-button", text, "aria-label": label, onClick, disabled });
    }

    function renderEditBar() {
      const index = state.selected;
      const visible = index >= 0 && !state.running;
      editBar.hidden = !visible;
      editBar.replaceChildren(...(visible ? [
        editButton("◀ Öne", "Seçili komutu bir öne taşı", () => moveSelected(-1), index === 0),
        editButton("Sona ▶", "Seçili komutu bir sona taşı", () => moveSelected(1), index === state.commands.length - 1),
        editButton("Sil ✕", "Seçili komutu sil", deleteSelected, false),
      ] : []));
    }

    function renderProgram() {
      programList.replaceChildren(...state.commands.map(chip));
      programCount.textContent = `${state.commands.length} / ${maxCommands}`;
      renderEditBar();
      updateButtons();
    }

    function updateButtons() {
      const full = state.commands.length >= maxCommands;
      Object.values(padButtons).forEach((button) => { button.disabled = state.running || full; });
      Object.values(actionButtons).forEach((button) => { button.disabled = state.running; });
    }

    function showHint() {
      state.hintUsed = true;
      const hint = MKD.pathFinder.findHint(level, state.commands, maxCommands);
      board.hideHint();
      Object.values(padButtons).forEach((button) => button.classList.remove("is-hint"));
      if (hint.type === HINT.NEXT_MOVE) {
        board.showHint(hint.target);
        padButtons[hint.direction].classList.add("is-hint");
      }
      if (hint.type === HINT.FIX_COMMAND) {
        state.selected = hint.index;
        state.highlight = { index: hint.index, className: "is-wrong" };
        renderProgram();
      }
      say(hintMessage(hint));
    }

    async function playSteps(result) {
      const duration = stepDuration();
      for (let index = 0; index < result.steps.length; index++) {
        state.highlight = { index, className: "is-active" };
        renderProgram();
        const step = result.steps[index];
        board.moveRobot(step, state.commands[index]);
        await wait(duration);
        if (step.coin >= 0) board.collectCoin(step.coin);
      }
    }

    function finish(result) {
      if (result.outcome === OUTCOME.SUCCESS) {
        say(MESSAGES.success);
        board.celebrate();
        const stars = MKD.calculateStars({ hintUsed: state.hintUsed, targetMet: state.commands.length <= targetLength });
        // Çocuk animasyon sürerken başka ekrana geçtiyse sonuç kaydedilmez.
        wait(CELEBRATE_MS).then(() => container.isConnected && onComplete(stars));
        return;
      }
      if (result.outcome === OUTCOME.BLOCKED) {
        const direction = state.commands[result.failedIndex];
        board.bump(direction);
        state.highlight = { index: result.failedIndex, className: "is-wrong" };
        say(blockedMessage(level, result.position, direction, result.failedIndex));
      } else {
        state.highlight = null;
        say(result.outcome === OUTCOME.MISSING_COINS ? MESSAGES.missingCoins : MESSAGES.missedGoal);
      }
      state.running = false;
      renderProgram();
    }

    async function run() {
      if (state.commands.length === 0) {
        say(MESSAGES.empty);
        return;
      }
      state.running = true;
      state.selected = -1;
      board.reset();
      board.hideHint();
      Object.values(padButtons).forEach((button) => button.classList.remove("is-hint"));
      say(MESSAGES.running);
      const result = MKD.pathFinder.runProgram(level, state.commands);
      await playSteps(result);
      finish(result);
    }

    function padButton(direction) {
      const button = el("button", {
        type: "button",
        className: `pf-pad-button pad-${direction}`,
        "aria-label": `${COMMANDS[direction].label} komutu ekle`,
        title: COMMANDS[direction].label,
        onClick: () => addCommand(direction),
      }, [el("img", { src: COMMANDS[direction].icon, alt: "" })]);
      padButtons[direction] = button;
      return button;
    }

    function actionButton(key, text, className, onClick) {
      const button = el("button", { type: "button", className: `btn ${className}`, text, onClick });
      actionButtons[key] = button;
      return button;
    }

    container.append(el("section", { className: "game-layout" }, [
      bubble.element,
      el("div", { className: "pf-program card" }, [
        programList,
        programCount,
        editBar,
      ]),
      el("div", { className: "pf-main" }, [
        board.element,
        el("div", { className: "pf-controls card" }, [
          el("div", { className: "pf-pad" }, Object.keys(COMMANDS).map(padButton)),
          actionButton("run", "Başlat ▶", "btn-primary pf-run", run),
          el("div", { className: "pf-secondary-actions" }, [
            actionButton("hint", "İpucu", "btn-hint", showHint),
            actionButton("restart", "Baştan", "btn-secondary", restart),
            actionButton("clear", "Temizle", "btn-danger", clearAll),
          ]),
        ]),
      ]),
    ]));
    renderProgram();
  }

  MKD.gameModules[GAME_ID] = Object.freeze({ mount });
})((globalThis.MKD ??= {}));
