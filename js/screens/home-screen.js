// Ana ekran: toplam yıldız, ayarlar ve dört oyun kartı.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starCounter, topBar } = MKD.components;

  function createHomeScreen({ progress, games, router, settingsDialog }) {
    function gameCard(game) {
      const completed = progress.getCompletedCount(game.id);
      const stars = progress.getGameStars(game.id);
      return el("button", {
        type: "button",
        className: `game-card color-${game.color}`,
        onClick: () => router.go(MKD.paths.levels(game.id)),
      }, [
        el("img", { className: "game-card-icon", src: game.icon, alt: "" }),
        el("span", { className: "game-card-title", text: game.title }),
        el("span", { className: "game-card-desc", text: game.description }),
        el("span", {
          className: "game-card-progress",
          text: `${completed}/${MKD.config.LEVELS_PER_GAME} seviye · ${stars} yıldız`,
        }),
      ]);
    }

    function render() {
      return el("div", { className: "screen home-screen" }, [
        topBar({
          title: "Mini Kodlama Dünyası",
          right: [
            starCounter(progress.getTotalStars()),
            iconButton({ icon: ICONS.settings, label: "Ayarlar", onClick: settingsDialog.open }),
          ],
        }),
        el("p", { className: "home-tagline", text: "Oyna • Öğren • Keşfet" }),
        el("div", { className: "game-grid" }, games.map(gameCard)),
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createHomeScreen = createHomeScreen;
})((globalThis.MKD ??= {}));
