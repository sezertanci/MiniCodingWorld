// Rozet ve kupa görselleri. Başarılarım ekranı ve kutlama pencereleri aynı çizimi kullanır.
// Rozet: kurdeleli, renkli, yuvarlak küçük madalya (küçük başarılar).
// Kupa: büyük altın kupa ve oyun renginde kaide (büyük hedefler).
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS } = MKD.components;

  // Rozetin ya da kupanın ortasındaki işaret: sayı, ikon, yıldız sırası veya üstü çizili ikon.
  function symbol({ text, image, crossed = false, stars = 0 }) {
    return el("span", { className: `reward-symbol${crossed ? " is-crossed" : ""}${image && text ? " has-caption" : ""}` }, [
      image && el("span", { className: "reward-symbol-icon" }, [el("img", { src: image, alt: "" })]),
      stars > 0 && el("span", { className: "reward-symbol-stars" },
        Array.from({ length: stars }, () => el("img", { src: ICONS.star, alt: "" }))),
      text && el("span", { className: "reward-symbol-text", text }),
    ]);
  }

  function badge(item) {
    return el("span", { className: `reward-badge color-${item.color}`, "aria-hidden": "true" }, [
      el("span", { className: "badge-ribbon" }),
      el("span", { className: "badge-medal" }, [symbol(item.symbol)]),
    ]);
  }

  function trophy(item) {
    return el("span", { className: `reward-trophy color-${item.color}`, "aria-hidden": "true" }, [
      el("img", { className: "trophy-cup", src: ICONS.trophy, alt: "" }),
      el("span", { className: "trophy-emblem" }, [symbol(item.symbol)]),
      el("span", { className: "trophy-base" }),
    ]);
  }

  /** Ödülün türüne göre rozet veya kupa çizer. */
  function emblem(item) {
    return item.kind === MKD.ACHIEVEMENT_KIND.TROPHY ? trophy(item) : badge(item);
  }

  MKD.rewardView = Object.freeze({ emblem });
})((globalThis.MKD ??= {}));
