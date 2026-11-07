// Ekranlar arası geçiş. Adres çubuğundaki "#/..." kısmını okur; böylece tarayıcının
// geri tuşu da çalışır ve dosya çift tıklanarak açıldığında da sorun çıkmaz.
(function (MKD) {
  "use strict";

  const ROUTES = Object.freeze({ HOME: "home", ACHIEVEMENTS: "achievements", LEVELS: "levels", PLAY: "play" });

  const ROUTE_TABLE = Object.freeze([
    { name: ROUTES.HOME, pattern: /^$/, keys: [] },
    { name: ROUTES.ACHIEVEMENTS, pattern: /^achievements$/, keys: [] },
    { name: ROUTES.LEVELS, pattern: /^game\/([a-z-]+)$/, keys: ["gameId"] },
    { name: ROUTES.PLAY, pattern: /^game\/([a-z-]+)\/level\/(\d+)$/, keys: ["gameId", "level"] },
  ]);

  const paths = Object.freeze({
    home: () => "",
    achievements: () => "achievements",
    levels: (gameId) => `game/${gameId}`,
    play: (gameId, level) => `game/${gameId}/level/${level}`,
  });

  function parse(hash) {
    const path = hash.replace(/^#\/?/, "").replace(/\/$/, "");
    for (const route of ROUTE_TABLE) {
      const match = route.pattern.exec(path);
      if (match) {
        const params = Object.fromEntries(route.keys.map((key, index) => [key, match[index + 1]]));
        return { name: route.name, params };
      }
    }
    return null;
  }

  function createRouter(onRoute) {
    function go(path) {
      globalThis.location.hash = `#/${path}`;
    }

    // Geçmişe yeni kayıt eklemeden yönlendirir (geçersiz veya kilitli adresler için).
    function redirect(path) {
      globalThis.location.replace(`#/${path}`);
    }

    function handle() {
      const route = parse(globalThis.location.hash);
      if (route) {
        onRoute(route);
      } else {
        redirect(paths.home());
      }
    }

    function start() {
      globalThis.addEventListener("hashchange", handle);
      handle();
    }

    return Object.freeze({ start, go, redirect });
  }

  MKD.ROUTES = ROUTES;
  MKD.paths = paths;
  MKD.createRouter = createRouter;
})((globalThis.MKD ??= {}));
