// Yeni ödül kutlamaları. Rozet için ekranın üstünde kısa bir kart açılır ve kendiliğinden kapanır.
// Kupa için konfetili, tam ekran özel bir pencere açılır; çocuk "Harika!" diyerek kapatır.
// Aynı anda birden çok ödül gelirse sırayla gösterilir (önce rozetler, sonra kupalar).
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { emblem } = MKD.rewardView;
  const { wait } = MKD.timing;

  const BADGE_VISIBLE_MS = 3200;
  const BADGE_LEAVE_MS = 300; // Kartın çıkış animasyonu (CSS ile aynı süre)
  const CONFETTI_COUNT = 28;

  function createCelebration({ sound }) {
    let queue = Promise.resolve();

    function badgeToast(item) {
      return new Promise((resolve) => {
        const toast = el("div", { className: "badge-toast", role: "status" }, [
          emblem(item),
          el("span", { className: "badge-toast-text" }, [
            el("span", { className: "celebration-label", text: "Yeni rozet!" }),
            el("strong", { className: "celebration-title", text: item.title }),
            el("span", { className: "celebration-description", text: item.description }),
          ]),
        ]);
        let closed = false;
        const close = () => {
          if (closed) {
            return;
          }
          closed = true;
          toast.classList.add("is-leaving");
          wait(BADGE_LEAVE_MS).then(() => {
            toast.remove();
            resolve();
          });
        };
        toast.addEventListener("click", close);
        document.body.append(toast);
        sound.play(MKD.SOUNDS.BADGE);
        wait(BADGE_VISIBLE_MS).then(close);
      });
    }

    // Konfeti parçalarının yeri ve gecikmesi sıradan hesaplanır; renkleri CSS verir.
    function confetti() {
      return el("div", { className: "confetti", "aria-hidden": "true" },
        Array.from({ length: CONFETTI_COUNT }, (_, index) => el("span", {
          style: `--x: ${(index * 37) % 100}%; --delay: ${(index % 7) * 0.18}s; --turn: ${(index % 2 ? 1 : -1) * 540}deg`,
        })));
    }

    function trophyDialog(item) {
      return new Promise((resolve) => {
        const button = el("button", { type: "button", className: "btn btn-primary", text: "Harika!" });
        const dialog = el("dialog", { className: "trophy-celebration", "aria-labelledby": "trophy-title" }, [
          confetti(),
          el("div", { className: "trophy-celebration-body" }, [
            el("span", { className: "celebration-label", text: "Yeni kupa kazandın!" }),
            el("div", { className: "trophy-stage" }, [el("span", { className: "trophy-rays" }), emblem(item)]),
            el("h2", { id: "trophy-title", className: "celebration-title", text: item.title }),
            el("p", { className: "celebration-description", text: item.description }),
            button,
          ]),
        ]);
        button.addEventListener("click", () => dialog.close());
        // Düğmeyle de Esc tuşuyla da kapansa pencere burada kaldırılır.
        dialog.addEventListener("close", () => {
          dialog.remove();
          resolve();
        });
        document.body.append(dialog);
        dialog.showModal();
        button.focus();
        sound.play(MKD.SOUNDS.TROPHY);
      });
    }

    /** Yeni kazanılan ödülleri sıraya ekler. Boş liste verilirse hiçbir şey olmaz. */
    function show(items) {
      for (const item of items) {
        const present = item.kind === MKD.ACHIEVEMENT_KIND.TROPHY ? trophyDialog : badgeToast;
        queue = queue.then(() => present(item));
      }
    }

    return Object.freeze({ show });
  }

  MKD.createCelebration = createCelebration;
})((globalThis.MKD ??= {}));
