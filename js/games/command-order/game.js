// Komutları Sırala: oyun ekranı. Çocuk karışık adım kartlarını numaralı kutulara dizer ve Kontrol et'e dokunur.
// Kartlar dokunarak (ilk boş ya da seçili kutuya gider) veya sürüklenerek yerleştirilir.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { REASON } = MKD.commandOrder;

  const GAME_ID = "command-order";
  const SHUFFLE_SEED_STEP = 7919;
  const TONE_COUNT = 5;
  const CELEBRATE_MS = 900;
  const POOL_ZONE = "pool";

  const MESSAGES = Object.freeze({
    intro: "Görevi bitirmek için kartları doğru sıraya diz. Bir karta dokun ya da onu bir kutuya sürükle.",
    extrasIntro: "Dikkat! Bazı kartlar bu göreve ait değil. Yalnızca gereken kartları sıraya diz.",
    full: "Bütün kutular dolu. Bir kartı geri almak için ona dokun.",
    notFull: "Önce bütün kutuları doldur.",
    success: "Harika! Bütün adımlar doğru sırada.",
    solved: "Sıralama doğru! Yeşil Kontrol et tuşuna dokun.",
  });

  function wrongMessage(result, card) {
    if (result.reason === REASON.EXTRA) {
      return `«${card.text}» bu görev için gerekli değil. Onu kutudan çıkar.`;
    }
    return `${result.index + 1}. kutudaki «${card.text}» için henüz erken. Ondan önce yapılması gereken bir adım var.`;
  }

  // Kutular ara hedeflere (aşamalara) bölünür; aşama yoksa tek ve başlıksız bir grup olur.
  function stageGroups(level) {
    const stages = level.stages ?? [{ title: "", size: level.steps.length }];
    let start = 0;
    return stages.map((stage) => {
      const group = { title: stage.title, slots: Array.from({ length: stage.size }, (_, i) => start + i) };
      start += stage.size;
      return group;
    });
  }

  function mount(container, { level: levelNumber, onComplete }) {
    const level = MKD.commandOrder.levels[levelNumber - 1];
    const cards = MKD.commandOrder.shuffleCards(MKD.commandOrder.buildCards(level), levelNumber * SHUFFLE_SEED_STEP);
    const cardById = new Map(cards.map((card, index) => [card.id, { ...card, tone: index % TONE_COUNT }]));
    const introText = level.extras ? MESSAGES.extrasIntro : MESSAGES.intro;

    const state = {
      slots: Array(level.steps.length).fill(null),
      target: -1,
      mark: null, // { slot, cardId, className } yanlış ya da ipucu işareti
      hintUsed: false,
      failedChecks: 0,
      done: false,
    };

    const bubble = MKD.components.speechBubble(introText);
    const say = bubble.say;
    const slotsBox = el("div", { className: "co-slots" });
    const pool = el("div", { className: "co-pool", "data-drop-zone": POOL_ZONE, "aria-label": "Kartlar" });
    const { actionButton } = MKD.components;
    const checkButton = actionButton("check", check);
    const hintButton = actionButton("hint", showHint);
    const clearButton = actionButton("clear", clearAll);

    // Sıra her değiştiğinde eski yanlış/ipucu işareti ve ona ait mesaj silinir, ekran yeniden çizilir.
    function change(update) {
      update();
      if (state.mark) say(introText);
      state.mark = null;
      render();
    }

    const firstEmpty = () => state.slots.indexOf(null);

    function placeFromPool(cardId, slot) {
      change(() => {
        state.slots[slot] = cardId;
        state.target = -1;
      });
    }

    function tapPoolCard(cardId) {
      const slot = state.target >= 0 ? state.target : firstEmpty();
      if (slot < 0) {
        say(MESSAGES.full);
        return;
      }
      placeFromPool(cardId, slot);
    }

    function returnToPool(slot) {
      change(() => { state.slots[slot] = null; });
    }

    function toggleTarget(slot) {
      state.target = state.target === slot ? -1 : slot;
      render();
    }

    // Sürükleme: havuzdan kutuya (kutudaki kart havuza döner), kutudan kutuya (yer değiştirir), kutudan havuza.
    function dropCard(cardId, fromSlot, zone) {
      if (zone.dataset.dropZone === POOL_ZONE) {
        if (fromSlot >= 0) returnToPool(fromSlot);
        return;
      }
      const toSlot = Number(zone.dataset.slot);
      if (toSlot === fromSlot) return;
      change(() => {
        if (fromSlot >= 0) state.slots[fromSlot] = state.slots[toSlot];
        state.slots[toSlot] = cardId;
        state.target = -1;
      });
    }

    function markClass(kind, value) {
      return state.mark?.[kind] === value ? ` ${state.mark.className}` : "";
    }

    function cardButton(cardId, slot) {
      const card = cardById.get(cardId);
      const button = el("button", {
        type: "button",
        className: `co-card co-tone-${card.tone}${markClass("cardId", cardId)}`,
        "aria-label": slot >= 0 ? `${slot + 1}. kutu: ${card.text}. Geri almak için dokun.` : card.text,
        disabled: state.done,
        onClick: () => (slot >= 0 ? returnToPool(slot) : tapPoolCard(cardId)),
      }, [
        el("span", { className: "co-card-icon", text: card.icon }),
        el("span", { className: "co-card-text", text: card.text }),
      ]);
      MKD.dragDrop.makeDraggable(button, {
        canDrag: () => !state.done,
        onDrop: (zone) => dropCard(cardId, slot, zone),
      });
      return button;
    }

    function slotView(slot) {
      const cardId = state.slots[slot];
      const classes = `co-slot${slot === state.target ? " is-target" : ""}${markClass("slot", slot)}`;
      const content = cardId === null
        ? el("button", {
          type: "button",
          className: "co-slot-empty",
          text: String(slot + 1),
          "aria-label": `${slot + 1}. kutu, boş. Kartın buraya gelmesi için dokun.`,
          "aria-pressed": String(slot === state.target),
          disabled: state.done,
          onClick: () => toggleTarget(slot),
        })
        : cardButton(cardId, slot);
      return el("div", { className: classes, "data-drop-zone": "slot", "data-slot": String(slot) }, [content]);
    }

    function render() {
      slotsBox.replaceChildren(...stageGroups(level).map((group) => el("div", { className: "co-stage" }, [
        group.title && el("h3", { className: "co-stage-title", text: group.title }),
        el("div", { className: "co-stage-slots" }, group.slots.map(slotView)),
      ])));
      const placed = new Set(state.slots);
      pool.replaceChildren(...cards.filter((card) => !placed.has(card.id)).map((card) => cardButton(card.id, -1)));
      checkButton.disabled = state.done || firstEmpty() >= 0;
      hintButton.disabled = state.done;
      clearButton.disabled = state.done;
    }

    function check() {
      if (firstEmpty() >= 0) {
        say(MESSAGES.notFull);
        return;
      }
      const result = MKD.commandOrder.checkOrder(state.slots);
      if (result.correct) {
        finish();
        return;
      }
      state.failedChecks += 1;
      const cardId = state.slots[result.index];
      state.mark = { slot: result.index, className: "is-wrong" };
      render();
      say(wrongMessage(result, cardById.get(cardId)));
    }

    function finish() {
      state.done = true;
      render();
      say(MESSAGES.success);
      slotsBox.classList.add("is-solved");
      const stars = MKD.calculateStars({ hintUsed: state.hintUsed, targetMet: state.failedChecks === 0 });
      // Çocuk kutlama sürerken başka ekrana geçtiyse sonuç kaydedilmez.
      setTimeout(() => container.isConnected && onComplete(stars), CELEBRATE_MS);
    }

    function showHint() {
      state.hintUsed = true;
      const hint = MKD.commandOrder.nextHint(state.slots);
      if (!hint) {
        say(MESSAGES.solved);
        return;
      }
      const card = cardById.get(hint.cardId);
      state.mark = { slot: hint.slot, cardId: hint.cardId, className: "is-hint" };
      // Kutu seçili kalır; parlayan karta dokununca kart oraya gider, kutudaki yanlış kart havuza döner.
      state.target = hint.slot;
      render();
      say(`${level.hint} Parlayan kart «${card.text}» ${hint.slot + 1}. kutuya gelmeli.`);
    }

    function clearAll() {
      change(() => {
        state.slots.fill(null);
        state.target = -1;
      });
      say(introText);
    }

    container.append(el("section", { className: "game-layout" }, [
      bubble.element,
      el("div", { className: "co-main" }, [
        el("div", { className: "co-task card" }, [
          el("span", { className: "co-task-icon", text: level.icon }),
          el("h2", { className: "co-task-title", text: level.title }),
        ]),
        el("div", { className: "co-board card" }, [
          slotsBox,
          pool,
          el("div", { className: "action-row" }, [checkButton, hintButton, clearButton]),
        ]),
      ]),
    ]));
    render();
  }

  MKD.gameModules[GAME_ID] = Object.freeze({ mount });
})((globalThis.MKD ??= {}));
