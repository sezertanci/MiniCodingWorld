// Seviye seçimi: 20 seviye dört zorluk grubunda. Kilitli seviyeler seçilemez.
// Sıradaki oynanacak seviye, çocuk nereden devam edeceğini görsün diye vurgulanır.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starCounter, starRow, topBar } = MKD.components;
  const { GROUPS } = MKD.config;

  function createLevelSelectScreen({ progress, router }) {
    function levelLabel(level, unlocked, stars) {
      if (!unlocked) {
        return `Seviye ${level}, kilitli`;
      }
      return stars > 0 ? `Seviye ${level}, ${stars} yıldız` : `Seviye ${level}`;
    }

    function levelClassName(unlocked, isNext) {
      if (!unlocked) {
        return "level-button is-locked";
      }
      return isNext ? "level-button is-next" : "level-button";
    }

    // Düğmeler seviye sırasıyla içeri girer; sırası CSS'e --i değişkeniyle verilir (css/animations.css).
    function levelButton(game, level, nextLevel) {
      const unlocked = progress.isLevelUnlocked(game.id, level);
      const stars = progress.getStars(game.id, level);
      return el("button", {
        type: "button",
        className: levelClassName(unlocked, level === nextLevel),
        style: `--i: ${level - 1}`,
        disabled: !unlocked,
        "aria-label": levelLabel(level, unlocked, stars),
        onClick: () => router.go(MKD.paths.play(game.id, level)),
      }, [
        el("span", { className: "level-number", text: String(level) }),
        unlocked ? starRow(stars) : el("img", { className: "level-lock", src: ICONS.lock, alt: "" }),
      ]);
    }

    function groupHeader(game, group, unlocked) {
      const total = group.lastLevel - group.firstLevel + 1;
      return el("h2", { className: "level-group-title" }, [
        el("span", { text: group.title }),
        unlocked
          ? el("span", { className: "level-group-count", text: `${progress.getGroupCompletedCount(game.id, group)}/${total}` })
          : el("img", { className: "group-lock", src: ICONS.lock, alt: "kilitli" }),
      ]);
    }

    function groupPanel(game, group, nextLevel) {
      const unlocked = progress.isGroupUnlocked(game.id, group);
      const levels = [];
      for (let level = group.firstLevel; level <= group.lastLevel; level++) {
        levels.push(levelButton(game, level, nextLevel));
      }
      const previousGroup = GROUPS[group.index - 1];
      return el("section", { className: `level-group group-${group.id}${unlocked ? "" : " is-locked"}` }, [
        groupHeader(game, group, unlocked),
        !unlocked && el("p", { className: "level-group-hint", text: `Önce ${previousGroup.title} seviyelerini bitir` }),
        el("div", { className: "level-list" }, levels),
      ]);
    }

    function render({ game }) {
      const nextLevel = progress.getNextLevel(game.id);
      return el("div", { className: "screen level-select-screen" }, [
        topBar({
          left: iconButton({ icon: ICONS.back, label: "Ana ekrana dön", onClick: () => router.go(MKD.paths.home()) }),
          title: game.title,
          icon: game.icon,
          right: [starCounter(progress.getGameStars(game.id))],
        }),
        el("div", { className: "level-groups" }, GROUPS.map((group) => groupPanel(game, group, nextLevel))),
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createLevelSelectScreen = createLevelSelectScreen;
})((globalThis.MKD ??= {}));
