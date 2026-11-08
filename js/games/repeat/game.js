// Tekrar Et: oyun ekranı. Çocuk yön oklarını ve "N kez tekrarla" bloklarını ekler, Başlat ile çalıştırır.
// Harita ve yön tuşları Robotun Yolunu Bul oyunuyla ortaktır (aynı görünüm ve CSS sınıfları).
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { wait, stepDuration, completeAfterCelebration } = MKD.timing;
  const { OUTCOME, COMMANDS, obstacleName } = MKD.pathFinder;
  const { BLOCK, TIMES, TOP_LEVEL, HINT } = MKD.repeatGame;

  const GAME_ID = "repeat";
  const NO_TARGET = -1;
  const STEP_MS = 450;
  // Tekrarla bloğu ile içindeki bir ok: en az iki blok yer kaplar
  const REPEAT_WITH_MOVE = 2;
  // Tekrarla bloğunun ikonu, oyunun ana ekrandaki ikonuyla aynıdır; yol oyun kaydından okunur.
  const REPEAT_ICON = MKD.findGame(GAME_ID).icon;
  // Tekrarla düğmesi, bir blok açıkken (oklar içine eklenirken) bloktan çıkma düğmesine dönüşür.
  const REPEAT_BUTTON_TEXT = Object.freeze({ add: "Tekrarla", leave: "Bloktan çık ✓" });

  const MESSAGES = Object.freeze({
    intro: "Robotu bayrağa götür. Aynı hareketi tekrar tekrar eklemek yerine Tekrarla bloğunu kullan.",
    coinIntro: "Önce bütün altınları topla, sonra bayrağa git. Tekrarla bloğu işini kolaylaştırır.",
    empty: "Önce bir ok ya da Tekrarla bloğu ekle.",
    full: "Blok sınırına ulaştın. Hazırsan yeşil Başlat tuşuna dokun; değiştirmek istersen bir bloğu seçip sil.",
    insideRepeat: "Şimdi eklediğin oklar turuncu bloğun içine girecek. Bitince lacivert Bloktan çık düğmesine dokun.",
    emptyStrip: "Ok ya da Tekrarla bloğu ekle, bloklar burada sıralansın.",
    outsideRepeat: "Şimdi eklediğin oklar bloğun dışına, sona eklenecek.",
    movedOut: "Ok bloğun dışına çıktı. Şimdi eklediğin oklar da dışarıya, sona eklenecek.",
    emptyRepeat: "Turuncu bloğun içi boş. Onu seçtim; şimdi içine bir ok ekle.",
    running: "Robot yola çıktı...",
    success: "Harika! Robot bayrağa ulaştı!",
    missedGoal: "Robot bayrağa ulaşamadı. Tekrar sayısını ya da okları değiştirmeyi dene.",
    missingCoins: "Bayrağa ulaştın ama bütün altınları toplamadın. Önce altınları topla.",
    solved: "Blokların doğru! Yeşil Başlat tuşuna dokun.",
    fullHint: "Blok sınırın doldu. Bir tekrar sayısını değiştirmeyi ya da bir bloğu silip yerine Tekrarla bloğu koymayı dene.",
  });

  const samePlace = (a, b) => a !== null && b !== null && a.block === b.block && a.inner === b.inner;
  // Şeritteki öğeyi bulmak için yer bilgisi data-place özelliğine yazılır (ör. "2:-1").
  const placeKey = ({ block, inner }) => `${block}:${inner}`;

  function placeName({ block, inner }) {
    return inner === TOP_LEVEL ? `${block + 1}. blok` : `${block + 1}. bloğun içindeki ${inner + 1}. ok`;
  }

  // Tekrar bloğu ilk turu sorunsuz geçip sonraki bir turda yoldan çıktıysa sorun büyük olasılıkla tekrar sayısıdır.
  function fixAdvice(place) {
    if (place.inner !== TOP_LEVEL && place.round > 0) {
      return `${place.block + 1}. bloğun tekrar sayısını ya da içindeki okları değiştirmeyi dene.`;
    }
    return `${placeName(place)} robotu yoldan çıkarıyor.`;
  }

  function blockedMessage(level, result) {
    const step = result.trace[result.failedIndex];
    const obstacle = obstacleName(level, result.position, step.direction);
    const when = step.inner !== TOP_LEVEL && step.round > 0 ? `${step.round + 1}. turda ` : "";
    return `Robot ${when}${obstacle} çarptı. ${fixAdvice(step)}`;
  }

  // Blok sınırı doluysa yön tuşları basılamaz; o zaman sıradaki yön yerine deseni değiştirmesi önerilir.
  function hintMessage(hint, definition, full) {
    if (hint.type === HINT.EMPTY_REPEAT) return MESSAGES.emptyRepeat;
    if (hint.type === HINT.FIX_COMMAND) return `${fixAdvice(hint)} Yanlış yeri senin için kırmızıyla gösterdim.`;
    if (hint.type === HINT.SOLVED) return MESSAGES.solved;
    if (full) return `${definition.hint} ${MESSAGES.fullHint}`;
    return `${definition.hint} Parlayan kareye bak; robot oraya ${COMMANDS[hint.direction].label.toLowerCase()} gitmeli.`;
  }

  function mount(container, { level: levelNumber, feedback, character, onComplete }) {
    const engine = MKD.repeatGame;
    const definition = engine.levels[levelNumber - 1];
    const level = MKD.pathFinder.parseLevel(definition);
    const targetBlocks = engine.countBlocks(engine.parseSolution(definition.solution));
    const board = MKD.pathFinder.createBoardView(level, character);
    const introText = definition.intro ?? (level.coins.length > 0 ? MESSAGES.coinIntro : MESSAGES.intro);

    // target: içine ok eklenen tekrar bloğu; selected: silmek için seçilen yer ({ block, inner }).
    const state = { program: [], target: NO_TARGET, selected: null, highlight: null, hintUsed: false, running: false };

    const bubble = MKD.components.speechBubble(introText, feedback, character);
    const programList = el("ol", { className: "pf-program-list pf-strip rp-program-list", "aria-label": "Bloklarım" });
    const programCount = el("span", { className: "pf-program-count" });
    const editBar = el("div", { className: "pf-edit-popover", role: "toolbar", "aria-label": "Seçili blok" });
    const programCard = el("div", { className: "pf-program card" }, [programList, programCount, editBar]);
    const placeEditBar = MKD.pathFinder.trackPopover({
      popover: editBar, card: programCard, strip: programList, container,
      getAnchor: () => placeElement(state.selected),
    });
    const padButtons = {};
    const actionButtons = {};
    const say = bubble.say;

    const blockCount = () => engine.countBlocks(state.program);

    function changeProgram(update) {
      update();
      state.highlight = null;
      board.reset();
      board.hideHint();
      clearPadHint();
      render();
    }

    function addMove(direction) {
      changeProgram(() => {
        const block = state.program[state.target];
        if (block) block.body.push(direction);
        else state.program.push(engine.move(direction));
        state.selected = null;
      });
      revealPlace({ block: state.target === NO_TARGET ? state.program.length - 1 : state.target, inner: TOP_LEVEL });
      if (blockCount() >= definition.maxBlocks) say(MESSAGES.full);
    }

    function addRepeat() {
      changeProgram(() => {
        state.program.push(engine.repeat(TIMES.DEFAULT, []));
        state.target = state.program.length - 1;
        state.selected = null;
      });
      say(blockCount() >= definition.maxBlocks ? MESSAGES.full : MESSAGES.insideRepeat);
    }

    function changeTimes(index, offset) {
      const block = state.program[index];
      const times = Math.min(TIMES.MAX, Math.max(TIMES.MIN, block.times + offset));
      changeProgram(() => { block.times = times; });
    }

    function toggleTarget(index) {
      const leaving = state.target === index;
      state.target = leaving ? NO_TARGET : index;
      state.selected = leaving ? null : { block: index, inner: TOP_LEVEL };
      say(leaving ? MESSAGES.outsideRepeat : MESSAGES.insideRepeat);
      render();
    }

    function toggleSelect(place) {
      state.selected = samePlace(state.selected, place) ? null : place;
      render();
    }

    function deleteSelected() {
      const { block, inner } = state.selected;
      changeProgram(() => {
        if (inner === TOP_LEVEL) {
          state.program.splice(block, 1);
          if (state.target === block) state.target = NO_TARGET;
          else if (state.target > block) state.target -= 1;
        } else {
          state.program[block].body.splice(inner, 1);
        }
        state.selected = null;
      });
    }

    // Bloğun içindeki seçili oku bloğun hemen arkasına taşır; sonraki oklar da dışarıya eklenir.
    function moveSelectedOut() {
      const { block, inner } = state.selected;
      changeProgram(() => {
        const [direction] = state.program[block].body.splice(inner, 1);
        state.program.splice(block + 1, 0, engine.move(direction));
        state.target = NO_TARGET;
        state.selected = null;
      });
      revealPlace({ block: block + 1, inner: TOP_LEVEL });
      say(MESSAGES.movedOut);
    }

    function leaveTarget() {
      state.target = NO_TARGET;
      say(MESSAGES.outsideRepeat);
      render();
    }

    function clearAll() {
      changeProgram(() => {
        state.program = [];
        state.target = NO_TARGET;
        state.selected = null;
      });
      say(introText);
    }

    function placeClasses(place, base) {
      const classes = [base];
      if (samePlace(state.selected, place)) classes.push("is-selected");
      if (samePlace(state.highlight, place)) classes.push(state.highlight.className);
      return classes.join(" ");
    }

    function moveChip(direction, place) {
      const label = place.inner === TOP_LEVEL ? `${place.block + 1}. blok` : `${place.inner + 1}. ok`;
      return el("li", {}, [
        el("button", {
          type: "button",
          className: placeClasses(place, "pf-chip"),
          "data-place": placeKey(place),
          "aria-label": `${label}: ${COMMANDS[direction].label}`,
          "aria-pressed": String(samePlace(state.selected, place)),
          disabled: state.running,
          onClick: () => toggleSelect(place),
        }, [
          place.inner === TOP_LEVEL && el("span", { className: "pf-chip-number", text: String(place.block + 1) }),
          el("img", { src: COMMANDS[direction].icon, alt: "" }),
        ]),
      ]);
    }

    function timesButton(text, label, index, offset, disabled) {
      return el("button", {
        type: "button", className: "rp-times-button", text, "aria-label": label,
        disabled: state.running || disabled, onClick: () => changeTimes(index, offset),
      });
    }

    function roundBadge(index, block) {
      const active = state.highlight?.block === index && state.highlight.inner !== TOP_LEVEL;
      return active && el("span", { className: "rp-round", text: `${state.highlight.round + 1}/${block.times}` });
    }

    function repeatBlock(block, index, full) {
      const place = { block: index, inner: TOP_LEVEL };
      const isTarget = state.target === index;
      const inner = block.body.map((direction, innerIndex) => moveChip(direction, { block: index, inner: innerIndex }));
      const classes = [placeClasses(place, "rp-repeat")];
      if (isTarget) classes.push("is-target");
      if (state.highlight?.block === index) classes.push("is-running");
      return el("li", { className: "rp-repeat-item" }, [
        el("div", { className: classes.join(" "), "data-place": placeKey(place) }, [
          el("div", { className: "rp-repeat-head" }, [
            el("span", { className: "pf-chip-number", text: String(index + 1) }),
            timesButton("−", "Tekrar sayısını azalt", index, -1, block.times <= TIMES.MIN),
            el("button", {
              type: "button", className: "rp-repeat-label",
              "aria-pressed": String(isTarget), disabled: state.running,
              "aria-label": `${index + 1}. blok: ${block.times} kez tekrarla. İçine ok eklemek için dokun.`,
              onClick: () => toggleTarget(index),
            }, [
              el("img", { src: REPEAT_ICON, alt: "" }),
              el("span", { text: `${block.times} kez` }),
              el("span", { className: "rp-label-word", text: "tekrarla" }),
            ]),
            timesButton("+", "Tekrar sayısını artır", index, 1, block.times >= TIMES.MAX),
            roundBadge(index, block),
          ]),
          el("ol", { className: "rp-repeat-body", "aria-label": `${index + 1}. bloğun içi` }, [
            ...inner,
            ((isTarget && !full) || inner.length === 0) && el("li", {
              className: "rp-drop-hint", text: isTarget && !full ? "Okları buraya ekle" : "Boş",
            }),
          ]),
        ]),
      ]);
    }

    // Balon yalnızca bir şey seçiliyken açılır; bloğun içine ok eklerken haritanın üstünü kapatmaz.
    // Bloğun içindeki ok seçiliyse "Dışarı çıkar" o oku bloğun dışına taşır.
    function renderEditBar() {
      const visible = !state.running && state.selected !== null;
      const insideBlock = visible && state.selected.inner !== TOP_LEVEL;
      const buttons = visible ? [
        el("button", {
          type: "button", className: "btn pf-edit-button pf-delete-button", text: "Sil ✕",
          "aria-label": "Seçili bloğu sil", onClick: deleteSelected,
        }),
        insideBlock && el("button", {
          type: "button", className: "btn pf-edit-button rp-leave-button", text: "Dışarı çıkar ⤵",
          "aria-label": "Seçili oku turuncu bloğun dışına taşı", onClick: moveSelectedOut,
        }),
      ].filter(Boolean) : [];
      editBar.hidden = !visible;
      editBar.replaceChildren(...buttons);
    }

    function placeElement(place) {
      return place && programList.querySelector(`[data-place="${placeKey(place)}"]`);
    }

    function revealPlace(place) {
      const element = placeElement(place);
      if (element) MKD.pathFinder.scrollIntoStrip(programList, element);
    }

    // Balon açıkken başka bir yere dokunulursa seçim kalkar; turuncu bloğa ok ekleme durumu sürer.
    function closeOnOutsideTap(event) {
      if (state.selected !== null && !programCard.contains(event.target)) {
        state.selected = null;
        render();
      }
    }

    function render() {
      const full = blockCount() >= definition.maxBlocks;
      const empty = el("li", { className: "pf-strip-empty", text: MESSAGES.emptyStrip });
      programList.replaceChildren(...(state.program.length > 0 ? state.program.map((block, index) =>
        block.type === BLOCK.REPEAT ? repeatBlock(block, index, full) : moveChip(block.direction, { block: index, inner: TOP_LEVEL })
      ) : [empty]));
      programCount.textContent = `${blockCount()} / ${definition.maxBlocks}`;
      renderEditBar();
      // Çalışan, hatalı, seçili ya da ok eklenen yer şeritte görünür hale getirilir.
      const target = state.target === NO_TARGET ? null : { block: state.target, inner: TOP_LEVEL };
      revealPlace(state.highlight ?? state.selected ?? target);
      placeEditBar();
      Object.values(padButtons).forEach((button) => { button.disabled = state.running || full; });
      renderRepeatButton();
      ["run", "hint", "clear"].forEach((key) => { actionButtons[key].disabled = state.running; });
    }

    function renderRepeatButton() {
      const open = state.target !== NO_TARGET;
      const button = actionButtons.repeat;
      button.classList.toggle("is-leave", open);
      button.querySelector("span").textContent = open ? REPEAT_BUTTON_TEXT.leave : REPEAT_BUTTON_TEXT.add;
      // Tekrarla bloğu ve içine en az bir ok sığmıyorsa eklenmez; yoksa boş blokla sınır dolar.
      button.disabled = state.running || (!open && blockCount() + REPEAT_WITH_MOVE > definition.maxBlocks);
    }

    function clearPadHint() {
      Object.values(padButtons).forEach((button) => button.classList.remove("is-hint"));
    }

    function showHint() {
      state.hintUsed = true;
      const hint = engine.findHint(level, state.program);
      const full = blockCount() >= definition.maxBlocks;
      board.hideHint();
      clearPadHint();
      if (hint.type === HINT.NEXT_MOVE && !full) {
        board.showHint(hint.target);
        padButtons[hint.direction].classList.add("is-hint");
      }
      if (hint.type === HINT.EMPTY_REPEAT) {
        state.target = hint.block;
        state.selected = null;
      }
      if (hint.type === HINT.FIX_COMMAND) {
        state.selected = { block: hint.block, inner: hint.inner };
        state.highlight = { block: hint.block, inner: hint.inner, className: "is-wrong" };
      }
      render();
      say(hintMessage(hint, definition, full));
    }

    async function playSteps(result) {
      const duration = stepDuration(STEP_MS);
      for (let index = 0; index < result.steps.length; index++) {
        const { direction, ...place } = result.trace[index];
        state.highlight = { ...place, className: "is-active" };
        render();
        const step = result.steps[index];
        board.moveRobot(step, direction);
        await wait(duration);
        if (!container.isConnected) return;
        if (step.coin >= 0) board.collectCoin(step.coin);
      }
    }

    function finish(result) {
      if (result.outcome === OUTCOME.SUCCESS) {
        bubble.correct(MESSAGES.success);
        board.celebrate();
        const stars = MKD.calculateStars({ hintUsed: state.hintUsed, targetMet: blockCount() <= targetBlocks });
        completeAfterCelebration(container, onComplete, stars);
        return;
      }
      if (result.outcome === OUTCOME.BLOCKED) {
        const { direction, ...place } = result.trace[result.failedIndex];
        board.bump(direction);
        state.highlight = { ...place, className: "is-wrong" };
        bubble.wrong(blockedMessage(level, result));
      } else {
        state.highlight = null;
        board.shakeHead();
        bubble.wrong(result.outcome === OUTCOME.MISSING_COINS ? MESSAGES.missingCoins : MESSAGES.missedGoal);
      }
      state.running = false;
      render();
    }

    async function run() {
      if (state.program.length === 0) {
        say(MESSAGES.empty);
        return;
      }
      const empty = engine.findEmptyRepeat(state.program);
      if (empty >= 0) {
        state.target = empty;
        render();
        say(MESSAGES.emptyRepeat);
        return;
      }
      state.running = true;
      state.target = NO_TARGET;
      state.selected = null;
      board.reset();
      board.hideHint();
      clearPadHint();
      say(MESSAGES.running);
      const result = engine.runProgram(level, state.program);
      await playSteps(result);
      finish(result);
    }

    function padButton(direction) {
      const button = el("button", {
        type: "button",
        className: `pf-pad-button pad-${direction}`,
        "aria-label": `${COMMANDS[direction].label} oku ekle`,
        title: COMMANDS[direction].label,
        onClick: () => addMove(direction),
      }, [el("img", { src: COMMANDS[direction].icon, alt: "" })]);
      padButtons[direction] = button;
      return button;
    }

    function actionButton(key, onClick) {
      const button = MKD.components.actionButton(key, onClick);
      actionButtons[key] = button;
      return button;
    }

    function repeatButton() {
      const onClick = () => (state.target === NO_TARGET ? addRepeat() : leaveTarget());
      const button = el("button", { type: "button", className: "btn rp-add-repeat", onClick }, [
        el("img", { src: REPEAT_ICON, alt: "" }),
        el("span", { text: REPEAT_BUTTON_TEXT.add }),
      ]);
      actionButtons.repeat = button;
      return button;
    }

    const layout = el("section", { className: "game-layout" }, [
      bubble.element,
      programCard,
      el("div", { className: "pf-main" }, [
        board.element,
        el("div", { className: "pf-controls card" }, [
          el("div", { className: "pf-pad" }, Object.keys(COMMANDS).map(padButton)),
          el("div", { className: "action-row pf-actions rp-actions" }, [
            repeatButton(),
            actionButton("run", run),
            actionButton("hint", showHint),
            actionButton("clear", clearAll),
          ]),
        ]),
      ]),
    ]);
    layout.addEventListener("pointerdown", closeOnOutsideTap);
    container.append(layout);
    render();
  }

  MKD.gameModules[GAME_ID] = Object.freeze({ mount });
})((globalThis.MKD ??= {}));
