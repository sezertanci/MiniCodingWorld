// Ekranlarda tekrar kullanılan küçük arayüz parçaları.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;

  const ICONS = Object.freeze({
    star: "assets/icons/star.svg",
    starEmpty: "assets/icons/star-empty.svg",
    lock: "assets/icons/lock.svg",
    back: "assets/ui/button-back.svg",
    settings: "assets/ui/button-settings.svg",
  });

  function iconButton({ icon, label, onClick }) {
    return el("button", { type: "button", className: "icon-button", "aria-label": label, title: label, onClick }, [
      el("img", { src: icon, alt: "" }),
    ]);
  }

  function starCounter(total) {
    return el("div", { className: "star-counter", role: "img", "aria-label": `${total} yıldız` }, [
      el("img", { src: ICONS.star, alt: "" }),
      el("span", { text: String(total) }),
    ]);
  }

  function starRow(stars, max = MKD.config.MAX_STARS) {
    const items = Array.from({ length: max }, (_, index) =>
      el("img", { src: index < stars ? ICONS.star : ICONS.starEmpty, alt: "" })
    );
    return el("div", { className: "star-row", role: "img", "aria-label": `${stars} yıldız` }, items);
  }

  function topBar({ left = null, title, right = [] }) {
    return el("header", { className: "top-bar" }, [
      el("div", { className: "top-bar-side" }, [left]),
      el("h1", { className: "top-bar-title", text: title }),
      el("div", { className: "top-bar-side top-bar-right" }, right),
    ]);
  }

  MKD.components = Object.freeze({ ICONS, iconButton, starCounter, starRow, topBar });
})((globalThis.MKD ??= {}));
