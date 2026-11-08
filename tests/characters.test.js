// Karakter listesi ve seçilen karakterin kaydı testleri.
// Çalıştırma (proje klasöründe): node --test
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

require("../js/core/characters.js");

const { createCharacters, CHARACTERS, DEFAULT_CHARACTER } = globalThis.MKD;

// Bellekte çalışan sahte kayıt yeri
function createMemoryStorage(initial = null) {
  const storage = {
    data: initial,
    load: () => storage.data,
    save: (data) => { storage.data = structuredClone(data); },
  };
  return storage;
}

describe("CHARACTERS", () => {
  test("CHARACTERS_AllEntries_HaveUniqueIdsAndExistingImages", () => {
    const ids = CHARACTERS.map((character) => character.id);

    assert.equal(new Set(ids).size, ids.length);
    CHARACTERS.forEach((character) => {
      assert.ok(fs.existsSync(path.join(__dirname, "..", character.image)), character.image);
    });
  });

  test("DEFAULT_CHARACTER_IsRobi", () => {
    assert.equal(DEFAULT_CHARACTER.name, "Robi");
  });
});

describe("createCharacters", () => {
  test("current_NoSavedChoice_ReturnsDefault", () => {
    const characters = createCharacters(createMemoryStorage());

    assert.equal(characters.current(), DEFAULT_CHARACTER);
  });

  test("current_SavedChoice_ReturnsSavedCharacter", () => {
    const characters = createCharacters(createMemoryStorage({ characterId: CHARACTERS[2].id }));

    assert.equal(characters.current(), CHARACTERS[2]);
  });

  test("current_SavedChoiceNoLongerExists_ReturnsDefault", () => {
    const characters = createCharacters(createMemoryStorage({ characterId: "silinmis" }));

    assert.equal(characters.current(), DEFAULT_CHARACTER);
  });

  test("select_KnownCharacter_ChangesCurrentAndSaves", () => {
    const storage = createMemoryStorage();
    const characters = createCharacters(storage);

    const result = characters.select(CHARACTERS[1].id);

    assert.equal(result, true);
    assert.equal(characters.current(), CHARACTERS[1]);
    assert.deepEqual(storage.data, { characterId: CHARACTERS[1].id });
  });

  test("select_UnknownCharacter_KeepsCurrentAndDoesNotSave", () => {
    const storage = createMemoryStorage();
    const characters = createCharacters(storage);

    const result = characters.select("yok");

    assert.equal(result, false);
    assert.equal(characters.current(), DEFAULT_CHARACTER);
    assert.equal(storage.data, null);
  });
});
