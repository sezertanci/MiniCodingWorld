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
    previous: "assets/ui/button-arrow-left.svg",
    next: "assets/ui/button-arrow-right.svg",
  });

  function iconButton({ icon, label, onClick, disabled = false }) {
    return el("button", { type: "button", className: "icon-button", "aria-label": label, title: label, disabled, onClick }, [
      el("img", { src: icon, alt: "" }),
    ]);
  }

  // Oyunlardaki işlem düğmeleri her ekranda aynı ikonla, yazısız gösterilir.
  // Adları ekran okuyucu ve fareyle üstüne gelince çıkan ipucu yazısı içindir.
  const ACTIONS = Object.freeze({
    run: { label: "Başlat", icon: "assets/ui/button-play.svg" },
    check: { label: "Kontrol et", icon: "assets/ui/button-check.svg" },
    hint: { label: "İpucu", icon: "assets/ui/button-hint.svg" },
    clear: { label: "Temizle", icon: "assets/ui/button-clear.svg" },
  });

  function actionButton(key, onClick) {
    const { label, icon } = ACTIONS[key];
    return el("button", { type: "button", className: "action-button", "aria-label": label, title: label, onClick }, [
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

  // Doluluk çubuğu. Genişlik CSS'e --value değişkeniyle verilir.
  function progressBar(value, max, label) {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    return el("div", {
      className: "progress-bar",
      role: "progressbar",
      "aria-valuemin": "0",
      "aria-valuemax": String(max),
      "aria-valuenow": String(value),
      "aria-label": label,
      style: `--value: ${percent}%`,
    }, [el("span", { className: "progress-bar-fill" })]);
  }

  // Başlığın yanında isteğe bağlı küçük bir ikon gösterilebilir (ör. oyun ikonu).
  function topBar({ left = null, title, icon = null, right = [] }) {
    return el("header", { className: "top-bar" }, [
      el("div", { className: "top-bar-side" }, [left]),
      el("h1", { className: "top-bar-title" }, [
        icon && el("img", { className: "top-bar-icon", src: icon, alt: "" }),
        el("span", { text: title }),
      ]),
      el("div", { className: "top-bar-side top-bar-right" }, right),
    ]);
  }

  // Oyunlarda robotun konuşma balonu. Dönen say(text) mesajı değiştirir; ekran okuyucular yeni mesajı duyurur.
  function speechBubble(text) {
    const message = el("p", { className: "speech-message", "aria-live": "polite", text });
    const element = el("div", { className: "speech-bubble" }, [
      el("img", { className: "speech-robot", src: "assets/characters/robot.svg", alt: "" }),
      message,
    ]);
    return { element, say: (next) => { message.textContent = next; } };
  }

  MKD.components = Object.freeze({ ICONS, ACTIONS, iconButton, actionButton, starCounter, starRow, progressBar, topBar, speechBubble });
})((globalThis.MKD ??= {}));
