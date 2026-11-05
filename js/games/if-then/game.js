// Eğer Böyleyse: oyun ekranı. Çocuk "Eğer ... varsa → hareket" bloklarını doldurur, Çalıştır ile robotu yürütür.
// Bloklar dokunarak (seçili ya da ilk uygun boş kutuya gider) veya sürüklenerek yerleştirilir.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { KIND, ACTION, OUTCOME, ELSE_RULE } = MKD.ifThen;

  const GAME_ID = "if-then";
  const STEP_MS = 650;
  const REDUCED_STEP_MS = 150;
  const CELEBRATE_MS = 900;
  const ELSE_KEY = "else";
  const SLOT_TYPE = Object.freeze({ CONDITION: "condition", ACTION: "action" });

  const OBJECTS = Object.freeze({
    [KIND.ROCK]: { label: "Taş", image: "assets/puzzles/rock.svg" },
    [KIND.WATER]: { label: "Su", image: "assets/puzzles/tile-water.svg" },
    [KIND.DOOR]: { label: "Kapı", image: "assets/puzzles/door.svg" },
    [KIND.STAR]: { label: "Yıldız", image: "assets/icons/star.svg" },
  });

  const ACTIONS = Object.freeze({
    [ACTION.FORWARD]: { label: "İleri Git", icon: "➡️", tone: "green" },
    [ACTION.JUMP]: { label: "Zıpla", icon: "🦘", tone: "orange" },
    [ACTION.BRIDGE]: { label: "Köprü Kur", icon: "🌉", tone: "blue" },
    [ACTION.OPEN]: { label: "Kapıyı Aç", icon: "🔑", tone: "purple" },
    [ACTION.COLLECT]: { label: "Topla", icon: "✋", tone: "yellow" },
  });

  // Mesajlarda karede ne olduğu, yanlış hareketin neden olmadığı ve ipucu cümlesi
  const KIND_TEXT = Object.freeze({
    [KIND.EMPTY]: { name: "boş yol", problem: "Boş yolda buna gerek yok.", hint: "Yol boşsa robot ileri gidebilir." },
    [KIND.ROCK]: { name: "taş", problem: "Taşın içinden geçilemez.", hint: "Taşın üstünden zıplayarak geçilir." },
    [KIND.WATER]: { name: "su", problem: "Robot yüzemez!", hint: "Suyun üstünden geçmek için köprü kurmak gerekir." },
    [KIND.DOOR]: { name: "kapı", problem: "Kapı kapalıyken geçilemez.", hint: "Kapıdan geçmek için önce kapıyı açmalısın." },
    [KIND.STAR]: { name: "yıldız", problem: "Yıldız yerde kaldı.", hint: "Yıldızı almak için Topla bloğunu kullan." },
  });

  const MESSAGES = Object.freeze({
    incomplete: "Önce boş kutuları doldur.",
    running: "Robot yola çıktı...",
    success: "Harika! Robot kurallarını izleyip bayrağa ulaştı!",
    solved: "Kuralların doğru! Çalıştır'a dokun.",
    noSlot: "Bu blok için boş kutu yok. Değiştirmek istediğin kutuya dokunup onu boşalt.",
    wrongType: "Bu blok oraya uymaz. Nesneler «Eğer» kutusuna, hareketler ok işaretinin yanına gider.",
  });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const stepDuration = () =>
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? REDUCED_STEP_MS : STEP_MS;

  const conditionKey = (index) => `c${index}`;
  const actionKey = (index) => `a${index}`;
  const slotType = (key) => (key.startsWith("c") ? SLOT_TYPE.CONDITION : SLOT_TYPE.ACTION);
  const ruleName = (rule) => (rule === ELSE_RULE ? "«Değilse» satırı" : `${rule + 1}. kural`);

  function wrongMessage(step) {
    const kind = KIND_TEXT[step.kind];
    return `Önünde ${kind.name} vardı. ${ruleName(step.rule)} çalıştı ve robot «${ACTIONS[step.action].label}» yaptı. `
      + `${kind.problem} Kuralları değiştirip yeniden dene.`;
  }

  // Kutular ve hazır gelen (kilitli) değerler seviye verisinden kurulur.
  function createSlots(level) {
    const values = {};
    const locked = new Set();
    const set = (key, value) => {
      values[key] = value ?? null;
      if (value) locked.add(key);
    };
    level.rules.forEach((rule, index) => {
      set(conditionKey(index), rule.if);
      set(actionKey(index), rule.then);
    });
    set(ELSE_KEY, level.else);
    return { values, locked, order: Object.keys(values) };
  }

  function blockContent(type, value) {
    if (type === SLOT_TYPE.CONDITION) {
      return [
        el("img", { className: "if-block-image", src: OBJECTS[value].image, alt: "" }),
        el("span", { className: "if-block-text", text: OBJECTS[value].label }),
      ];
    }
    return [
      el("span", { className: "if-block-icon", text: ACTIONS[value].icon }),
      el("span", { className: "if-block-text", text: ACTIONS[value].label }),
    ];
  }

  const blockClass = (type, value) =>
    `if-block ${type === SLOT_TYPE.CONDITION ? "if-block-condition" : `if-block-action if-tone-${ACTIONS[value].tone}`}`;

  function mount(container, { level: levelNumber, onComplete }) {
    const level = MKD.ifThen.levels[levelNumber - 1];
    const lane = MKD.ifThen.parseLane(level.lane);
    const palette = MKD.ifThen.paletteFor(level);
    const scene = MKD.ifThen.createSceneView(lane);
    const slots = createSlots(level);

    const state = { target: null, hintUsed: false, runs: 0, running: false, activeRule: null, mark: null, hintAction: null };

    const bubble = MKD.components.speechBubble(level.intro);
    const say = bubble.say;
    const rulesBox = el("div", { className: "if-rules" });
    const paletteBox = el("div", { className: "if-palette" });
    const runButton = el("button", { type: "button", className: "btn btn-primary if-run", text: "Çalıştır ▶", onClick: run });
    const hintButton = el("button", { type: "button", className: "btn btn-hint", text: "İpucu", onClick: showHint });
    const clearButton = el("button", { type: "button", className: "btn btn-danger", text: "Temizle", onClick: clearAll });

    const isOpen = (key) => !slots.locked.has(key);
    const program = () => ({
      branches: level.rules.map((_, index) => ({
        condition: slots.values[conditionKey(index)],
        action: slots.values[actionKey(index)],
      })),
      otherwise: slots.values[ELSE_KEY],
    });

    // Kurallar her değiştiğinde robot başa döner, eski işaretler silinir ve ekran yeniden çizilir.
    function change(update) {
      update();
      if (state.mark !== null) say(level.intro);
      state.mark = null;
      state.hintAction = null;
      state.activeRule = null;
      scene.reset();
      render();
    }

    function setSlot(key, value) {
      change(() => {
        slots.values[key] = value;
        state.target = null;
      });
    }

    function tapBlock(type, value) {
      const fits = (key) => isOpen(key) && slotType(key) === type;
      const key = state.target && fits(state.target)
        ? state.target
        : slots.order.find((candidate) => fits(candidate) && slots.values[candidate] === null);
      if (!key) {
        say(MESSAGES.noSlot);
        return;
      }
      setSlot(key, value);
    }

    function dropBlock(type, value, zone) {
      const key = zone.dataset.slot;
      if (!isOpen(key) || slotType(key) !== type) {
        say(MESSAGES.wrongType);
        return;
      }
      setSlot(key, value);
    }

    function tapSlot(key) {
      if (slots.values[key] !== null) {
        setSlot(key, null);
        return;
      }
      state.target = state.target === key ? null : key;
      render();
    }

    function slotView(key) {
      const type = slotType(key);
      const value = slots.values[key];
      const locked = !isOpen(key);
      const classes = ["if-slot", `if-slot-${type}`];
      if (key === state.target) classes.push("is-target");
      if (locked) classes.push("is-locked");
      const label = value === null ? "boş" : (OBJECTS[value] ?? ACTIONS[value]).label;
      const button = el("button", {
        type: "button",
        className: value === null ? "if-slot-empty" : blockClass(type, value),
        "aria-label": `${type === SLOT_TYPE.CONDITION ? "Koşul" : "Hareket"} kutusu: ${label}${locked ? ", hazır" : ""}`,
        disabled: locked || state.running,
        onClick: () => tapSlot(key),
      }, value === null ? [el("span", { text: "?" })] : blockContent(type, value));
      return el("div", { className: classes.join(" "), "data-drop-zone": "slot", "data-slot": key }, [button]);
    }

    function ruleView(rule) {
      const isElse = rule === ELSE_RULE;
      const classes = `if-rule${isElse ? " if-else" : ""}${state.activeRule === rule ? " is-active" : ""}`
        + `${state.mark?.rule === rule ? ` ${state.mark.className}` : ""}`;
      const head = isElse
        ? [el("span", { className: "if-word", text: "Değilse" })]
        : [
          el("span", { className: "if-word", text: rule === 0 ? "Eğer" : "Değilse eğer" }),
          slotView(conditionKey(rule)),
          el("span", { className: "if-word", text: "varsa" }),
        ];
      return el("div", { className: classes }, [
        el("div", { className: "if-rule-head" }, head),
        el("div", { className: "if-rule-body" }, [
          el("span", { className: "if-arrow", "aria-hidden": "true", text: "→" }),
          slotView(isElse ? ELSE_KEY : actionKey(rule)),
        ]),
      ]);
    }

    function paletteBlock(type, value) {
      const hinted = state.hintAction === value;
      const button = el("button", {
        type: "button",
        className: `${blockClass(type, value)}${hinted ? " is-hint" : ""}`,
        "aria-label": `${type === SLOT_TYPE.CONDITION ? "Nesne" : "Hareket"}: ${(OBJECTS[value] ?? ACTIONS[value]).label}`,
        disabled: state.running,
        onClick: () => tapBlock(type, value),
      }, blockContent(type, value));
      MKD.dragDrop.makeDraggable(button, {
        canDrag: () => !state.running,
        onDrop: (zone) => dropBlock(type, value, zone),
      });
      return button;
    }

    function paletteGroup(title, type, values) {
      return el("div", { className: "if-palette-group" }, [
        el("h3", { className: "if-palette-title", text: title }),
        el("div", { className: "if-palette-blocks" }, values.map((value) => paletteBlock(type, value))),
      ]);
    }

    function render() {
      rulesBox.replaceChildren(...level.rules.map((_, index) => ruleView(index)), ruleView(ELSE_RULE));
      const needsConditions = slots.order.some((key) => isOpen(key) && slotType(key) === SLOT_TYPE.CONDITION);
      const groups = [paletteGroup("Hareketler", SLOT_TYPE.ACTION, palette.actions)];
      if (needsConditions) groups.unshift(paletteGroup("Nesneler", SLOT_TYPE.CONDITION, palette.conditions));
      paletteBox.replaceChildren(...groups);
      [runButton, hintButton, clearButton].forEach((button) => { button.disabled = state.running; });
    }

    async function play(result) {
      const duration = stepDuration();
      for (const step of result.steps) {
        state.activeRule = step.rule;
        render();
        if (step.index === result.failedIndex) return;
        await scene.playStep(step, duration);
        if (!container.isConnected) return;
      }
      scene.reachGoal();
      await wait(duration);
    }

    async function run() {
      if (slots.order.some((key) => slots.values[key] === null)) {
        say(MESSAGES.incomplete);
        return;
      }
      state.running = true;
      state.runs += 1;
      state.mark = null;
      scene.reset();
      say(MESSAGES.running);
      const result = MKD.ifThen.runProgram(lane, program());
      await play(result);
      if (result.outcome === OUTCOME.SUCCESS) {
        finish();
        return;
      }
      const step = result.steps[result.failedIndex];
      scene.fail(step.index);
      state.running = false;
      state.mark = { rule: step.rule, className: "is-wrong" };
      render();
      say(wrongMessage(step));
    }

    function finish() {
      say(MESSAGES.success);
      scene.celebrate();
      const stars = MKD.calculateStars({ hintUsed: state.hintUsed, targetMet: state.runs === 1 });
      // Çocuk kutlama sürerken başka ekrana geçtiyse sonuç kaydedilmez.
      wait(CELEBRATE_MS).then(() => container.isConnected && onComplete(stars));
    }

    function showHint() {
      state.hintUsed = true;
      const hint = MKD.ifThen.findHint(lane, program());
      if (!hint) {
        say(MESSAGES.solved);
        return;
      }
      scene.reset();
      scene.showHint(hint.index);
      state.mark = { rule: hint.rule, className: "is-hint" };
      state.hintAction = hint.action;
      render();
      say(`Parlayan karede ${KIND_TEXT[hint.kind].name} var. ${KIND_TEXT[hint.kind].hint}`);
    }

    function clearAll() {
      change(() => {
        slots.order.filter(isOpen).forEach((key) => { slots.values[key] = null; });
        state.target = null;
      });
      say(level.intro);
    }

    container.append(el("section", { className: "game-layout" }, [
      bubble.element,
      scene.element,
      el("div", { className: "if-main" }, [
        el("div", { className: "if-program card" }, [rulesBox]),
        el("div", { className: "if-side card" }, [
          paletteBox,
          el("div", { className: "if-actions" }, [runButton, hintButton, clearButton]),
        ]),
      ]),
    ]));
    render();
  }

  MKD.gameModules[GAME_ID] = Object.freeze({ mount });
})((globalThis.MKD ??= {}));
