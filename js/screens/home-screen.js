// Ana ekran: logo, seçili karakter, toplam yıldız, ayarlar, Başarılarım düğmesi ve oyun kartları.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starCounter, progressBar } = MKD.components;

  function createHomeScreen({ progress, achievements, games, router, settingsDialog, characters, characterDialog }) {
    const totalLevels = MKD.config.LEVELS_PER_GAME;

    // Başarılarım düğmesi: yıldız sayacının yanında kupa ve kazanılan ödül sayısı.
    // Üst çubukta durur; oyun sayısı arttıkça sayfanın altında kaybolmaz.
    function achievementsButton() {
      const { earned, total } = MKD.countEarnedRewards(achievements.getStatus());
      const label = `Başarılarım: ${earned} / ${total} ödül`;
      return el("button", {
        type: "button",
        className: "star-counter achievements-button",
        title: label,
        "aria-label": label,
        onClick: () => router.go(MKD.paths.achievements()),
      }, [
        el("img", { src: ICONS.trophy, alt: "" }),
        el("span", { text: `${earned}/${total}` }),
      ]);
    }

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

    // Kartlar sırayla içeri girer; sırası CSS'e --i değişkeniyle verilir (css/animations.css).
    function gameCard(game, index) {
      return el("button", {
        type: "button",
        className: `game-card color-${game.color}`,
        style: `--i: ${index}`,
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
        achievementsButton(),
        starCounter(progress.getTotalStars()),
        iconButton({ icon: ICONS.settings, label: "Ayarlar", onClick: settingsDialog.open }),
      ]);
    }

    // Seçili karakter; dokununca karakter seçme penceresi açılır ve seçilen karakter hemen görünür.
    function characterButton() {
      const image = el("img", { className: "home-robot", alt: "" });
      const button = el("button", { type: "button", className: "home-character" }, [
        image,
        el("span", { className: "home-character-change", text: "Değiştir" }),
      ]);
      const show = (character) => {
        image.src = character.image;
        const label = `Karakterin: ${character.name}. Değiştirmek için dokun.`;
        button.title = label;
        button.setAttribute("aria-label", label);
      };
      button.addEventListener("click", () => characterDialog.open(show));
      show(characters.current());
      return button;
    }

    function hero() {
      return el("div", { className: "home-hero" }, [
        characterButton(),
        el("div", { className: "home-title" }, [
          el("h1", { className: "logo", "aria-label": "Mini Coding World" }, [
            el("span", { className: "logo-top", text: "Mini Coding" }),
            el("span", { className: "logo-bottom", text: "World" }),
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
