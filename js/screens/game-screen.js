// Oyun ekranı: üst çubuğu çizer, seçilen oyunun modülünü yükler ve seviye bitince sonucu gösterir.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starRow, topBar } = MKD.components;

  function createGameScreen({ progress, router }) {
    function resultPanel(game, level, stars) {
      const next = level + 1;
      const hasNext = next <= MKD.config.LEVELS_PER_GAME && progress.isLevelUnlocked(game.id, next);
      return el("section", { className: "result-panel card", role: "status" }, [
        el("h2", { text: "Harika! Seviye tamamlandı." }),
        starRow(stars),
        el("div", { className: "button-row" }, [
          el("button", {
            type: "button",
            className: "btn btn-secondary",
            text: "Seviyelere dön",
            onClick: () => router.go(MKD.paths.levels(game.id)),
          }),
          hasNext && el("button", {
            type: "button",
            className: "btn btn-primary",
            text: "Sonraki seviye",
            onClick: () => router.go(MKD.paths.play(game.id, next)),
          }),
        ]),
      ]);
    }

    function render({ game, level }) {
      const group = progress.findGroup(level);
      const stage = el("div", { className: "game-stage" });
      const gameModule = MKD.gameModules[game.id];

      gameModule.mount(stage, {
        game,
        level,
        onComplete: (stars) => {
          progress.completeLevel(game.id, level, stars);
          stage.replaceChildren(resultPanel(game, level, stars));
        },
      });

      return el("div", { className: "screen game-screen" }, [
        topBar({
          left: iconButton({ icon: ICONS.back, label: "Seviyelere dön", onClick: () => router.go(MKD.paths.levels(game.id)) }),
          title: game.title,
          right: [el("span", { className: `level-badge group-${group.id}`, text: `${group.title} · ${level}`, "aria-label": `${group.title}, seviye ${level}` })],
        }),
        stage,
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createGameScreen = createGameScreen;
})((globalThis.MKD ??= {}));
