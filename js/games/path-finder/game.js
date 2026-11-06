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
  const CHIP_ZONE = "chip";
  const LIST_ZONE = "list";
  const STRIP_EDGE_PX = 12;
  const POPOVER_GAP_PX = 14;
  const POPOVER_ARROW_MIN_PX = 20;

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
    emptyStrip: "Yön tuşlarına bas, komutların burada sıralansın.",
  });

  const OBSTACLE_NAMES = Object.freeze({ [TILE.ROCK]: "taşa", [TILE.WATER]: "suya" });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stepDuration = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? REDUCED_STEP_MS : STEP_MS;

  /** Robotun çarptığı şeyin adı ("taşa", "suya", "harita kenarına"). Tekrar Et oyunu da kullanır. */
  function obstacleName(level, position, direction) {
    const { dx, dy } = DIRECTIONS[direction];
    const tile = level.blocked.get(`${position.x + dx},${position.y + dy}`);
    return OBSTACLE_NAMES[tile] ?? "harita kenarına";
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Yana kayan şeritte öğe görünmüyorsa şerit yalnızca yatayda kaydırılır; sayfa kaymaz.
  function scrollIntoStrip(strip, item) {
    const box = item.getBoundingClientRect();
    const view = strip.getBoundingClientRect();
    if (box.left < view.left) strip.scrollLeft -= view.left - box.left + STRIP_EDGE_PX;
    else if (box.right > view.right) strip.scrollLeft += box.right - view.right + STRIP_EDGE_PX;
  }

  // Balon, seçili komutun altına ortalanır ama kartın dışına taşmaz; oku komutu gösterir.
  function placePopover(popover, card, anchor) {
    const cardBox = card.getBoundingClientRect();
    const anchorBox = anchor.getBoundingClientRect();
    const center = anchorBox.left + anchorBox.width / 2 - cardBox.left;
    const width = popover.offsetWidth;
    const left = clamp(center - width / 2, 0, Math.max(0, cardBox.width - width));
    popover.style.left = `${left}px`;
    popover.style.top = `${anchorBox.bottom - cardBox.top + POPOVER_GAP_PX}px`;
    popover.style.setProperty("--arrow-x", `${clamp(center - left, POPOVER_ARROW_MIN_PX, width - POPOVER_ARROW_MIN_PX)}px`);
  }

  /**
   * Balonu seçili öğenin altında tutar: şerit kayınca ya da pencere boyu değişince yeniden yerleştirir.
   * Tekrar Et oyunu da kullanır. Dönen fonksiyon her çizimden sonra çağrılır.
   */
  function trackPopover({ popover, card, strip, container, getAnchor }) {
    function place() {
      const anchor = getAnchor();
      if (!popover.hidden && anchor) placePopover(popover, card, anchor);
    }
    function onResize() {
      if (!container.isConnected) {
        globalThis.removeEventListener("resize", onResize);
        return;
      }
      place();
    }
    strip.addEventListener("scroll", place, { passive: true });
    globalThis.addEventListener("resize", onResize);
    return place;
  }

  function blockedMessage(level, position, direction, index) {
    return `Robot ${obstacleName(level, position, direction)} çarptı. ${index + 1}. komutu değiştirmeyi dene.`;
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
    const programList = el("ol", {
      className: "pf-program-list pf-strip", "aria-label": "Komutlarım", "data-drop-zone": LIST_ZONE,
    });
    const programCount = el("span", { className: "pf-program-count" });
    const editBar = el("div", { className: "pf-edit-popover", role: "toolbar", "aria-label": "Seçili komut" });
    const programCard = el("div", { className: "pf-program card" }, [programList, programCount, editBar]);
    const placeEditBar = trackPopover({
      popover: editBar, card: programCard, strip: programList, container,
      getAnchor: () => programList.children[state.selected],
    });
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
      revealChip(state.commands.length - 1);
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

    // Sürüklenen komut, bırakıldığı komutun yerine geçer; listenin boş yerine bırakılırsa sona gider.
    function dropCommand(from, zone) {
      const to = zone.dataset.dropZone === LIST_ZONE ? state.commands.length - 1 : Number(zone.dataset.index);
      if (to === from) return;
      changeProgram(() => {
        const [direction] = state.commands.splice(from, 1);
        state.commands.splice(to, 0, direction);
        state.selected = -1;
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
      const button = el("button", {
        type: "button",
        className: classes.join(" "),
        "aria-label": `${index + 1}. komut: ${COMMANDS[direction].label}`,
        "aria-pressed": String(index === state.selected),
        disabled: state.running,
        onClick: () => toggleSelect(index),
      }, [
        el("span", { className: "pf-chip-number", text: String(index + 1) }),
        el("img", { src: COMMANDS[direction].icon, alt: "" }),
      ]);
      MKD.dragDrop.makeDraggable(button, {
        canDrag: () => !state.running,
        onDrop: (zone) => dropCommand(index, zone),
      });
      return el("li", { "data-drop-zone": CHIP_ZONE, "data-index": String(index) }, [button]);
    }

    function editButton({ text, label, onClick, disabled = false, icon, className = "" }) {
      return el("button", {
        type: "button", className: `btn pf-edit-button ${className}`.trim(), "aria-label": label, onClick, disabled,
      }, [icon && el("img", { src: icon, alt: "" }), el("span", { text })]);
    }

    function renderEditBar() {
      const index = state.selected;
      const visible = index >= 0 && !state.running;
      editBar.hidden = !visible;
      editBar.replaceChildren(...(visible ? [
        editButton({
          text: COMMANDS.left.label, icon: COMMANDS.left.icon, label: "Seçili komutu bir sola taşı",
          onClick: () => moveSelected(-1), disabled: index === 0,
        }),
        editButton({
          text: COMMANDS.right.label, icon: COMMANDS.right.icon, label: "Seçili komutu bir sağa taşı",
          onClick: () => moveSelected(1), disabled: index === state.commands.length - 1, className: "pf-icon-end",
        }),
        editButton({ text: "Sil ✕", label: "Seçili komutu sil", onClick: deleteSelected, className: "pf-delete-button" }),
      ] : []));
    }

    function renderProgram() {
      const empty = el("li", { className: "pf-strip-empty", text: MESSAGES.emptyStrip });
      programList.replaceChildren(...(state.commands.length > 0 ? state.commands.map(chip) : [empty]));
      programCount.textContent = `${state.commands.length} / ${maxCommands}`;
      renderEditBar();
      // Çalışan, hatalı ya da seçili komut şeritte görünür hale getirilir.
      const focus = state.highlight?.index ?? state.selected;
      if (focus >= 0) revealChip(focus);
      placeEditBar();
      updateButtons();
    }

    function revealChip(index) {
      const item = programList.children[index];
      if (item) scrollIntoStrip(programList, item);
    }

    // Balon açıkken başka bir yere dokunulursa seçim kalkar ve balon kapanır.
    function closeOnOutsideTap(event) {
      if (state.selected >= 0 && !programCard.contains(event.target)) {
        state.selected = -1;
        renderProgram();
      }
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
        if (!container.isConnected) return;
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

    const layout = el("section", { className: "game-layout" }, [
      bubble.element,
      programCard,
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
    ]);
    layout.addEventListener("pointerdown", closeOnOutsideTap);
    container.append(layout);
    renderProgram();
  }

  MKD.gameModules[GAME_ID] = Object.freeze({ mount });
  MKD.pathFinder = Object.assign(MKD.pathFinder, { COMMANDS, obstacleName, scrollIntoStrip, trackPopover });
})((globalThis.MKD ??= {}));
