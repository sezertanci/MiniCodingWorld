// Oyunda seçilebilen karakterler ve çocuğun seçtiği karakterin kaydı.
// Seçilen karakter ana ekranda ve bütün oyunlarda (harita, konuşma balonu, yol sahnesi) görünür.
(function (MKD) {
  "use strict";

  const CHARACTERS = Object.freeze([
    { id: "robi", name: "Robi", image: "assets/characters/robot.webp" },
    { id: "fiyo", name: "Fiyo", image: "assets/characters/robot-bow.webp" },
    { id: "isil", name: "Işıl", image: "assets/characters/robot-lamp.webp" },
    { id: "pembe", name: "Pembe", image: "assets/characters/robot-ribbon.webp" },
    { id: "piril", name: "Pırıl", image: "assets/characters/robot-cape.webp" },
  ].map(Object.freeze));

  const DEFAULT_CHARACTER = CHARACTERS[0];

  const findCharacter = (id) => CHARACTERS.find((character) => character.id === id) ?? null;

  /** @param {{ load, save }} storage Seçilen karakterin kayıt yeri */
  function createCharacters(storage) {
    // Kayıt yoksa veya artık bulunmayan bir karakteri gösteriyorsa ilk karakterle başlanır.
    let current = findCharacter(storage.load()?.characterId) ?? DEFAULT_CHARACTER;

    /** Karakteri seçer ve kaydeder. Bilinmeyen bir karakterde hiçbir şey değişmez ve false döner. */
    function select(id) {
      const character = findCharacter(id);
      if (!character) {
        return false;
      }
      current = character;
      storage.save({ characterId: id });
      return true;
    }

    return Object.freeze({ list: CHARACTERS, current: () => current, select });
  }

  MKD.CHARACTERS = CHARACTERS;
  MKD.DEFAULT_CHARACTER = DEFAULT_CHARACTER;
  MKD.createCharacters = createCharacters;
})((globalThis.MKD ??= {}));
