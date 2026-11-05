// Seviye seçimi: 20 seviye dört zorluk grubunda. Kilitli seviyeler seçilemez.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starCounter, starRow, topBar } = MKD.components;

  function createLevelSelectScreen({ progress, router }) {
    function levelLabel(level, unlocked, stars) {
      if (!unlocked) {
        return `Seviye ${level}, kilitli`;
      }
      return stars > 0 ? `Seviye ${level}, ${stars} yıldız` : `Seviye ${level}`;
    }

    function levelButton(game, level) {
      const unlocked = progress.isLevelUnlocked(game.id, level);
      const stars = progress.getStars(game.id, level);
      return el("button", {
        type: "button",
        className: unlocked ? "level-button" : "level-button is-locked",
        disabled: !unlocked,
        "aria-label": levelLabel(level, unlocked, stars),
        onClick: () => router.go(MKD.paths.play(game.id, level)),
      }, [
        el("span", { className: "level-number", text: String(level) }),
        unlocked ? starRow(stars) : el("img", { className: "level-lock", src: ICONS.lock, alt: "" }),
      ]);
    }

    function groupPanel(game, group) {
      const unlocked = progress.isGroupUnlocked(game.id, group);
      const levels = [];
      for (let level = group.firstLevel; level <= group.lastLevel; level++) {
        levels.push(levelButton(game, level));
      }
      return el("section", { className: `level-group group-${group.id}${unlocked ? "" : " is-locked"}` }, [
        el("h2", { className: "level-group-title" }, [
          group.title,
          !unlocked && el("img", { className: "group-lock", src: ICONS.lock, alt: "kilitli" }),
        ]),
        el("div", { className: "level-list" }, levels),
      ]);
    }

    function render({ game }) {
      return el("div", { className: "screen level-select-screen" }, [
        topBar({
          left: iconButton({ icon: ICONS.back, label: "Ana ekrana dön", onClick: () => router.go(MKD.paths.home()) }),
          title: game.title,
          right: [starCounter(progress.getGameStars(game.id))],
        }),
        el("div", { className: "level-groups" }, MKD.config.GROUPS.map((group) => groupPanel(game, group))),
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createLevelSelectScreen = createLevelSelectScreen;
})((globalThis.MKD ??= {}));
