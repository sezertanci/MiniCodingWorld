// Ayarlar penceresi. İlerlemeyi sıfırlama, yanlışlıkla basılmasın diye ikinci bir onay ister.
// Her adımda odak güvenli butona ("Kapat" / "Vazgeç") verilir; Enter'a basmak bir şey silmez.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;

  function button(text, className, onClick) {
    return el("button", { type: "button", className: `btn ${className}`, text, onClick });
  }

  function createSettingsDialog({ onReset }) {
    function open() {
      const dialog = el("dialog", { className: "dialog", "aria-labelledby": "dialog-title" });
      const close = () => {
        dialog.close();
        dialog.remove();
      };

      function showStep(title, content, safeButton) {
        dialog.replaceChildren(el("h2", { id: "dialog-title", text: title }), ...content);
        safeButton.focus();
      }

      function showMain() {
        const closeButton = button("Kapat", "btn-secondary", close);
        showStep("Ayarlar", [button("İlerlemeyi sıfırla", "btn-danger", showConfirm), closeButton], closeButton);
      }

      function showConfirm() {
        const cancelButton = button("Vazgeç", "btn-secondary", showMain);
        const confirmButton = button("Evet, sıfırla", "btn-danger", () => {
          onReset();
          close();
        });
        showStep("Emin misin?", [
          el("p", { text: "Bütün yıldızlar silinecek ve seviyeler yeniden kilitlenecek." }),
          el("div", { className: "button-row" }, [cancelButton, confirmButton]),
        ], cancelButton);
      }

      // Esc tuşuyla kapatıldığında da pencere sayfadan kaldırılır.
      dialog.addEventListener("close", () => dialog.remove());
      document.body.append(dialog);
      dialog.showModal();
      showMain();
    }

    return Object.freeze({ open });
  }

  MKD.createSettingsDialog = createSettingsDialog;
})((globalThis.MKD ??= {}));
