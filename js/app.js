// Uygulamanın başlangıç noktası: servisleri oluşturur, ekranlara verir ve yönlendirmeyi başlatır.
(function (MKD) {
  "use strict";

  const { ROUTES, paths, config } = MKD;

  function start() {
    const container = document.getElementById("app");
    const progress = MKD.createProgress(MKD.createLocalStorage(config.STORAGE_KEY));
    let currentRoute = null;

    const router = MKD.createRouter((route) => {
      currentRoute = route;
      show(route);
    });

    const settingsDialog = MKD.createSettingsDialog({
      onReset: () => {
        progress.reset();
        show(currentRoute);
      },
    });

    const screens = {
      [ROUTES.HOME]: MKD.createHomeScreen({ progress, games: MKD.games, router, settingsDialog }),
      [ROUTES.LEVELS]: MKD.createLevelSelectScreen({ progress, router }),
      [ROUTES.PLAY]: MKD.createGameScreen({ progress, router }),
    };

    // Adresteki oyun ve seviyeyi doğrular. Geçersiz veya kilitliyse uygun ekrana yönlendirir.
    function resolveParams({ name, params }) {
      if (name === ROUTES.HOME) {
        return {};
      }
      const game = MKD.findGame(params.gameId);
      if (!game) {
        router.redirect(paths.home());
        return null;
      }
      if (name === ROUTES.LEVELS) {
        return { game };
      }
      const level = Number(params.level);
      const isValid = Number.isInteger(level) && level >= 1 && level <= config.LEVELS_PER_GAME;
      if (!isValid || !progress.isLevelUnlocked(game.id, level)) {
        router.redirect(paths.levels(game.id));
        return null;
      }
      return { game, level };
    }

    function show(route) {
      const params = resolveParams(route);
      if (params) {
        container.replaceChildren(screens[route.name].render(params));
        globalThis.scrollTo(0, 0);
      }
    }

    router.start();
  }

  document.addEventListener("DOMContentLoaded", start);
})((globalThis.MKD ??= {}));
