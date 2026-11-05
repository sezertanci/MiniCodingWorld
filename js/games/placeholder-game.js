// Geçici oyun: gerçek oyun yazılana kadar seviyeyi elle 1–3 yıldızla bitirmeyi sağlar.
// Bütün oyun modülleri aynı sözleşmeye uyar:
//   mount(container, { game, level, onComplete(stars) })
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;

  function mount(container, { game, onComplete }) {
    const buttons = Array.from({ length: MKD.config.MAX_STARS }, (_, index) => {
      const stars = index + 1;
      return el("button", {
        type: "button",
        className: "btn btn-primary",
        text: `${stars} yıldızla bitir`,
        onClick: () => onComplete(stars),
      });
    });

    container.append(
      el("section", { className: "placeholder-game card" }, [
        el("p", { className: "placeholder-title", text: `"${game.title}" oyunu yakında burada olacak.` }),
        el("p", { text: "Kilit sistemini denemek için seviyeyi bitir:" }),
        el("div", { className: "button-row" }, buttons),
      ])
    );
  }

  MKD.placeholderGame = Object.freeze({ mount });
})((globalThis.MKD ??= {}));
