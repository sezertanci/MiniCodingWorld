// Ekranlarda tekrar kullanılan küçük arayüz parçaları.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;

  // Birden çok ekranda ve oyunda geçen karakter ve nesne görselleri tek yerde tutulur.
  const IMAGES = Object.freeze({
    robot: "assets/characters/robot.svg",
    goal: "assets/puzzles/goal-flag.svg",
    rock: "assets/puzzles/rock.svg",
    door: "assets/puzzles/door.svg",
    star: "assets/icons/star.svg",
  });

  const ICONS = Object.freeze({
    star: IMAGES.star,
    starEmpty: "assets/icons/star-empty.svg",
    lock: "assets/icons/lock.svg",
    hint: "assets/icons/hint.svg",
    medal: "assets/icons/medal.svg",
    trophy: "assets/icons/trophy.svg",
    back: "assets/ui/button-back.svg",
    settings: "assets/ui/button-settings.svg",
    previous: "assets/ui/button-arrow-left.svg",
    next: "assets/ui/button-arrow-right.svg",
  });

  // Yazısız, yalnızca ikonlu düğme; adı ekran okuyucu ve ipucu yazısı içindir.
  function imageButton(className, { icon, label, onClick, disabled = false }) {
    return el("button", { type: "button", className, "aria-label": label, title: label, disabled, onClick }, [
      el("img", { src: icon, alt: "" }),
    ]);
  }

  function iconButton(options) {
    return imageButton("icon-button", options);
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
    return imageButton("action-button", { ...ACTIONS[key], onClick });
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

  // Konuşma balonundaki robotun tepkileri: her yeni mesajda ağzı oynar, doğruda sevinçle zıplar,
  // yanlışta yumuşakça kafa sallar. Animasyonlar css/animations.css dosyasındadır. Haritadaki robot da
  // kafa sallarken aynı sınıfı kullanır.
  const ROBOT_MOODS = Object.freeze({ TALK: "is-talking", HAPPY: "is-cheering", SAD: "is-shaking" });

  /**
   * Oyunlarda robotun konuşma balonu. Ekran okuyucular yeni mesajı duyurur.
   * say(text): mesajı değiştirir, robot konuşur. correct(text) / wrong(text): robot sevinir ya da
   * kafa sallar ve ortak geri bildirim nesnesi (feedback) doğru ya da yanlış sesini çalar.
   */
  function speechBubble(text, feedback) {
    const message = el("p", { className: "speech-message", "aria-live": "polite", text });
    const robot = el("img", { className: "speech-robot", src: IMAGES.robot, alt: "" });
    const element = el("div", { className: "speech-bubble" }, [robot, message]);

    function show(next, mood) {
      message.textContent = next;
      Object.values(ROBOT_MOODS).forEach((name) => robot.classList.remove(name));
      MKD.timing.replayAnimation(robot, mood);
    }

    return Object.freeze({
      element,
      say: (next) => show(next, ROBOT_MOODS.TALK),
      correct: (next) => {
        show(next, ROBOT_MOODS.HAPPY);
        feedback.correct();
      },
      wrong: (next) => {
        show(next, ROBOT_MOODS.SAD);
        feedback.wrong();
      },
    });
  }

  const CONFETTI_COUNT = 28;

  // Konfeti yağmuru (kupa kutlaması ve sonuç paneli). Parçaların yeri ve gecikmesi sıradan hesaplanır;
  // renkleri ve düşüşü CSS verir. Tıklamaları engellemez. className ile görünümü değiştirilebilir.
  function confetti(className = "") {
    return el("div", { className: `confetti ${className}`.trim(), "aria-hidden": "true" },
      Array.from({ length: CONFETTI_COUNT }, (_, index) => el("span", {
        style: `--x: ${(index * 37) % 100}%; --delay: ${(index % 7) * 0.18}s; --turn: ${(index % 2 ? 1 : -1) * 540}deg`,
      })));
  }

  MKD.components = Object.freeze({
    IMAGES, ICONS, ACTIONS, iconButton, actionButton, starCounter, starRow, progressBar, topBar, speechBubble, confetti,
    ROBOT_MOODS,
  });
})((globalThis.MKD ??= {}));
