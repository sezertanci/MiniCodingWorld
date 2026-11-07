// Ses efektleri, ortak geri bildirim nesnesi ve ses açık/kapalı ayarının testleri.
// Tarayıcının Web Audio özelliği yerine notaları kaydeden sahte bir AudioContext kullanılır.
// Çalıştırma (proje klasöründe): node --test
const { describe, test, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");

require("../js/core/sound.js");

const { createSound, createFeedback, SOUNDS } = globalThis.MKD;

// Oluşturulan her sahte AudioContext ve çalınan her nota burada toplanır.
let audioLog;
// Sesin dinlediği sayfa olayları (pointerdown ile ses hazırlanır)
let windowListeners;

class FakeAudioContext {
  constructor() {
    this.state = "suspended";
    this.currentTime = 0;
    this.destination = {};
    audioLog.contexts += 1;
  }

  resume() {
    this.state = "running";
    return Promise.resolve();
  }

  createOscillator() {
    const oscillator = {
      type: null,
      frequency: { value: 0 },
      connect: (node) => node,
      start: () => {},
      stop: () => {},
    };
    audioLog.notes.push(oscillator);
    return oscillator;
  }

  createGain() {
    const param = { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} };
    return { gain: param, connect: (node) => node };
  }
}

function createMemoryStorage(initial = null) {
  const storage = {
    data: initial,
    load: () => storage.data,
    save: (data) => { storage.data = structuredClone(data); },
  };
  return storage;
}

const ALL_SOUNDS = Object.values(SOUNDS);
const frequencies = () => audioLog.notes.map((note) => note.frequency.value);
const firstFrequencyOf = (sound, name, step) => {
  audioLog.notes = [];
  sound.play(name, step);
  return audioLog.notes[0].frequency.value;
};

beforeEach(() => {
  audioLog = { contexts: 0, notes: [] };
  windowListeners = {};
  globalThis.AudioContext = FakeAudioContext;
  globalThis.addEventListener = (type, listener) => { windowListeners[type] = listener; };
});

afterEach(() => {
  delete globalThis.AudioContext;
  delete globalThis.addEventListener;
});

describe("ses kapalı", () => {
  test("play_SoundDisabled_CreatesNoAudioContextForAnySound", () => {
    const sound = createSound(createMemoryStorage({ soundEnabled: false }));

    ALL_SOUNDS.forEach((name) => sound.play(name));

    assert.equal(audioLog.contexts, 0);
    assert.equal(audioLog.notes.length, 0);
  });

  test("feedback_SoundDisabled_PlaysNoNotes", () => {
    const feedback = createFeedback(createSound(createMemoryStorage({ soundEnabled: false })));

    feedback.correct();
    feedback.wrong();
    feedback.star(0);
    feedback.star(2);
    feedback.levelComplete();

    assert.equal(audioLog.contexts, 0);
    assert.equal(audioLog.notes.length, 0);
  });

  test("pointerdown_SoundDisabled_DoesNotPrepareAudio", () => {
    createSound(createMemoryStorage({ soundEnabled: false }));

    windowListeners.pointerdown();

    assert.equal(audioLog.contexts, 0);
  });

  test("setEnabled_TurnedOffAfterPlaying_StopsAllFurtherNotes", () => {
    const sound = createSound(createMemoryStorage());
    sound.play(SOUNDS.CORRECT);
    const playedBefore = audioLog.notes.length;

    sound.setEnabled(false);
    ALL_SOUNDS.forEach((name) => sound.play(name));

    assert.ok(playedBefore > 0);
    assert.equal(audioLog.notes.length, playedBefore);
  });

  test("setEnabled_False_IsSavedAndKeptAfterReload", () => {
    const storage = createMemoryStorage();
    createSound(storage).setEnabled(false);

    const reloaded = createSound(storage);
    reloaded.play(SOUNDS.STAR);

    assert.equal(reloaded.isEnabled(), false);
    assert.equal(audioLog.contexts, 0);
  });
});

describe("ses açık", () => {
  test("play_EverySound_PlaysNotesWithoutWarning", (t) => {
    const warn = t.mock.method(console, "warn", () => {});
    const sound = createSound(createMemoryStorage());

    for (const name of ALL_SOUNDS) {
      audioLog.notes = [];
      sound.play(name);
      assert.ok(audioLog.notes.length > 0, `${name} sesi nota çalmadı`);
    }

    assert.equal(warn.mock.callCount(), 0);
    assert.equal(audioLog.contexts, 1);
  });

  test("play_Wrong_PlaysTwoSoftFallingNotes", () => {
    const sound = createSound(createMemoryStorage());

    sound.play(SOUNDS.WRONG);

    const [first, second] = frequencies();
    assert.equal(audioLog.notes.length, 2);
    assert.ok(second < first);
    assert.ok(audioLog.notes.every((note) => note.type === "sine"));
  });

  test("play_StarWithHigherStep_PlaysHigherTone", () => {
    const sound = createSound(createMemoryStorage());

    const tones = [0, 1, 2].map((step) => firstFrequencyOf(sound, SOUNDS.STAR, step));

    assert.ok(tones[0] < tones[1] && tones[1] < tones[2]);
  });

  test("play_NoAudioSupport_DoesNothing", () => {
    delete globalThis.AudioContext;
    const sound = createSound(createMemoryStorage());

    assert.doesNotThrow(() => sound.play(SOUNDS.CORRECT));
    assert.equal(audioLog.notes.length, 0);
  });
});

describe("createFeedback", () => {
  function setup() {
    const calls = [];
    const feedback = createFeedback({ play: (name, step) => calls.push([name, step]) });
    return { feedback, calls };
  }

  test("correct_Called_PlaysCorrectSound", () => {
    const { feedback, calls } = setup();

    feedback.correct();

    assert.deepEqual(calls, [[SOUNDS.CORRECT, undefined]]);
  });

  test("wrong_Called_PlaysWrongSound", () => {
    const { feedback, calls } = setup();

    feedback.wrong();

    assert.deepEqual(calls, [[SOUNDS.WRONG, undefined]]);
  });

  test("star_StarIndex_PlaysStarSoundWithIndexAsStep", () => {
    const { feedback, calls } = setup();

    feedback.star(0);
    feedback.star(2);

    assert.deepEqual(calls, [[SOUNDS.STAR, 0], [SOUNDS.STAR, 2]]);
  });

  test("levelComplete_Called_PlaysLevelCompleteSound", () => {
    const { feedback, calls } = setup();

    feedback.levelComplete();

    assert.deepEqual(calls, [[SOUNDS.LEVEL_COMPLETE, undefined]]);
  });
});
