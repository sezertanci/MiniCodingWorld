// Karakter seçme penceresi: bütün karakterler resimleriyle listelenir, seçili olan çerçeveyle gösterilir.
// Bir karaktere dokununca seçim kaydedilir ve pencere kapanır.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;

  function createCharacterDialog({ characters }) {
    /** onSelect: karakter değişince yeni karakterle çağrılır (ör. ana ekrandaki resmi yenilemek için). */
    function open(onSelect) {
      const dialog = el("dialog", { className: "dialog character-dialog", "aria-labelledby": "dialog-title" });
      const current = characters.current();

      const option = (character) => el("button", {
        type: "button",
        className: "character-option",
        "aria-pressed": String(character.id === current.id),
        onClick: () => {
          characters.select(character.id);
          dialog.close();
          onSelect(character);
        },
      }, [
        el("img", { src: character.image, alt: "" }),
        el("span", { className: "character-name", text: character.name }),
      ]);

      const options = characters.list.map(option);
      dialog.append(
        el("h2", { id: "dialog-title", text: "Karakterini seç" }),
        el("div", { className: "character-grid" }, options),
        el("button", { type: "button", className: "btn btn-secondary", text: "Kapat", onClick: () => dialog.close() }),
      );

      // Pencere düğmeyle de Esc tuşuyla da kapatılsa sayfadan burada kaldırılır.
      dialog.addEventListener("close", () => dialog.remove());
      document.body.append(dialog);
      dialog.showModal();
      options[characters.list.indexOf(current)].focus();
    }

    return Object.freeze({ open });
  }

  MKD.createCharacterDialog = createCharacterDialog;
})((globalThis.MKD ??= {}));
