// Ana ekran: logo, robot, toplam yıldız, ayarlar ve dört oyun kartı.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starCounter, progressBar } = MKD.components;

  const ROBOT_IMAGE = "assets/characters/robot.svg";

  function createHomeScreen({ progress, games, router, settingsDialog }) {
    const totalLevels = MKD.config.LEVELS_PER_GAME;

    function cardProgress(game) {
      const completed = progress.getCompletedCount(game.id);
      return el("span", { className: "game-card-progress" }, [
        progressBar(completed, totalLevels, `${completed} / ${totalLevels} seviye tamamlandı`),
        el("span", { className: "game-card-stats" }, [
          el("span", { text: `${completed}/${totalLevels} seviye` }),
          el("span", { className: "game-card-stars" }, [
            el("img", { src: ICONS.star, alt: "" }),
            el("span", { text: String(progress.getGameStars(game.id)) }),
          ]),
        ]),
      ]);
    }

    function gameCard(game) {
      return el("button", {
        type: "button",
        className: `game-card color-${game.color}`,
        onClick: () => router.go(MKD.paths.levels(game.id)),
      }, [
        el("span", { className: "game-card-icon" }, [el("img", { src: game.icon, alt: "" })]),
        el("span", { className: "game-card-title", text: game.title }),
        el("span", { className: "game-card-desc", text: game.description }),
        cardProgress(game),
      ]);
    }

    function header() {
      return el("header", { className: "home-header" }, [
        starCounter(progress.getTotalStars()),
        iconButton({ icon: ICONS.settings, label: "Ayarlar", onClick: settingsDialog.open }),
      ]);
    }

    function hero() {
      return el("div", { className: "home-hero" }, [
        el("img", { className: "home-robot", src: ROBOT_IMAGE, alt: "Robot Robi el sallıyor" }),
        el("div", { className: "home-title" }, [
          el("h1", { className: "logo", "aria-label": "Mini Kodlama Dünyası" }, [
            el("span", { className: "logo-top", text: "Mini Kodlama" }),
            el("span", { className: "logo-bottom", text: "Dünyası" }),
          ]),
          el("p", { className: "home-tagline", text: "Oyna • Öğren • Keşfet" }),
        ]),
      ]);
    }

    function render() {
      return el("div", { className: "screen home-screen" }, [
        header(),
        hero(),
        el("div", { className: "game-grid" }, games.map(gameCard)),
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createHomeScreen = createHomeScreen;
})((globalThis.MKD ??= {}));
