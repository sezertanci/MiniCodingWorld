// Oyun ekranı: üst çubuğu çizer, seçilen oyunun modülünü yükler ve seviye bitince sonucu gösterir.
// Sonuç paneli yaylanarak girer, kazanılan yıldızlar tek tek (her biri sesli) belirir ve konfeti yağar.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, starRow, topBar, confetti } = MKD.components;
  const { RESULT, wait, starPopDelay } = MKD.timing;

  // feedback: oyunlarla paylaşılan ses geri bildirimi (doğru, yanlış, yıldız, seviye sonu).
  // onLevelCompleted: seviye kaydedildikten sonra, yıldız gösterisi bitince çağrılır (yeni ödüller burada
  // denetlenir ve kutlanır). Böylece rozet/kupa sesi seviye sonu ve yıldız sesleriyle üst üste binmez.
  // Çocuk bu sırada başka ekrana geçse de çağrılır; kazanılan ödül kaybolmaz.
  function createGameScreen({ progress, router, feedback, onLevelCompleted }) {
    // Kazanılan yıldızlar sırayla "pop" ile belirir; gecikme CSS'e değişkenle verilir ve her yıldızda
    // sırası yükselen yıldız sesi çalar. Çocuk bu sırada başka ekrana geçerse ses çalınmaz.
    function animatedStars(panel, stars) {
      const row = starRow(stars);
      [...row.children].slice(0, stars).forEach((star, index) => {
        star.classList.add("result-star");
        star.style.setProperty("--pop-delay", `${starPopDelay(index)}ms`);
        wait(starPopDelay(index)).then(() => panel.isConnected && feedback.star(index));
      });
      return row;
    }

    function resultPanel(game, level, stars) {
      const next = level + 1;
      const hasNext = next <= MKD.config.LEVELS_PER_GAME && progress.isLevelUnlocked(game.id, next);
      const panel = el("section", {
        className: "result-panel card",
        role: "status",
        style: `--enter-duration: ${RESULT.PANEL_ENTER_MS}ms`,
      });
      panel.append(
        el("h2", { text: "Harika! Seviye tamamlandı." }),
        animatedStars(panel, stars),
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
      );
      feedback.levelComplete();
      return panel;
    }

    // Oklarla geçiş geçmişe kayıt eklemez; tarayıcının geri tuşu seviye listesine döner.
    function levelArrow(game, level, icon, label) {
      return iconButton({
        icon,
        label,
        disabled: !progress.isLevelUnlocked(game.id, level),
        onClick: () => router.redirect(MKD.paths.play(game.id, level)),
      });
    }

    // Seviye rozeti ve iki yanındaki oklar. İlk seviyede geri, son seviyede ileri ok gösterilmez.
    function levelNav(game, level) {
      const group = progress.findGroup(level);
      const previous = level > 1 ? levelArrow(game, level - 1, ICONS.previous, "Önceki seviye") : null;
      const next = level < MKD.config.LEVELS_PER_GAME ? levelArrow(game, level + 1, ICONS.next, "Sonraki seviye") : null;
      const element = el("div", { className: "level-nav" }, [
        previous,
        el("span", { className: `level-badge group-${group.id}`, text: `${group.title} · ${level}`, "aria-label": `${group.title}, seviye ${level}` }),
        next,
      ]);
      // Seviye bitince sonraki seviyenin kilidi açılmış olabilir; ileri ok sayfa yenilenmeden etkinleşir.
      const refresh = () => {
        if (next) {
          next.disabled = !progress.isLevelUnlocked(game.id, level + 1);
        }
      };
      return { element, refresh };
    }

    function render({ game, level }) {
      const stage = el("div", { className: "game-stage" });
      const gameModule = MKD.gameModules[game.id];
      const nav = levelNav(game, level);

      gameModule.mount(stage, {
        game,
        level,
        feedback,
        onComplete: (stars) => {
          progress.completeLevel(game.id, level, stars);
          nav.refresh();
          stage.replaceChildren(resultPanel(game, level, stars), confetti("result-confetti"));
          wait(starPopDelay(stars)).then(onLevelCompleted);
        },
      });

      return el("div", { className: "screen game-screen" }, [
        topBar({
          left: iconButton({ icon: ICONS.back, label: "Seviyelere dön", onClick: () => router.go(MKD.paths.levels(game.id)) }),
          title: game.title,
          right: [nav.element],
        }),
        stage,
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createGameScreen = createGameScreen;
})((globalThis.MKD ??= {}));
