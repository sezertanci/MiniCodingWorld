// Kısa ses efektleri. Ses dosyası kullanılmaz; notalar tarayıcının Web Audio özelliğiyle çalınır.
// Böylece tek dosyalık sürüm büyümez ve internet gerekmez.
// Ses ayarı (açık/kapalı) kaydedilir; ses kapalıysa hiçbir şey çalınmaz.
(function (MKD) {
  "use strict";

  const SOUNDS = Object.freeze({ BADGE: "badge", TROPHY: "trophy" });

  // Her nota: [frekans (Hz), başlangıç (sn), süre (sn)]
  const MELODIES = Object.freeze({
    [SOUNDS.BADGE]: [[784, 0, 0.14], [988, 0.12, 0.14], [1319, 0.24, 0.3]],
    [SOUNDS.TROPHY]: [[523, 0, 0.16], [659, 0.16, 0.16], [784, 0.32, 0.16], [1047, 0.48, 0.24], [784, 0.72, 0.14], [1047, 0.86, 0.6]],
  });

  const VOLUME = 0.18;
  const ATTACK_SECONDS = 0.02;
  const SILENT_GAIN = 0.0001; // Üstel azalma sıfıra inemez; duyulmayacak kadar küçük bir değer kullanılır.

  /** @param {{ load, save }} storage Ses ayarının kayıt yeri */
  function createSound(storage) {
    let enabled = storage.load()?.soundEnabled !== false;
    let context = null;

    function getContext() {
      const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!AudioContextClass) {
        return null;
      }
      context ??= new AudioContextClass();
      return context;
    }

    // Tarayıcılar sesi ancak bir dokunuştan sonra çalar. Dokunuşta ses hazırlanır;
    // böylece biraz sonra açılan kutlama penceresinin sesi de duyulur.
    function unlock() {
      if (enabled && getContext()?.state === "suspended") {
        context.resume();
      }
    }

    function playNote(audio, startAt, [frequency, offset, duration]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const begin = startAt + offset;
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(SILENT_GAIN, begin);
      gain.gain.exponentialRampToValueAtTime(VOLUME, begin + ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, begin + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(begin);
      oscillator.stop(begin + duration);
    }

    /** Ses açıksa verilen efekti çalar. Ses çalınamazsa oyun etkilenmez. */
    function play(name) {
      if (!enabled) {
        return;
      }
      try {
        const audio = getContext();
        if (audio) {
          audio.resume();
          MELODIES[name].forEach((note) => playNote(audio, audio.currentTime, note));
        }
      } catch (error) {
        console.warn("Ses çalınamadı.", error);
      }
    }

    function setEnabled(value) {
      enabled = value;
      storage.save({ soundEnabled: value });
    }

    globalThis.addEventListener("pointerdown", unlock);

    return Object.freeze({ play, isEnabled: () => enabled, setEnabled });
  }

  MKD.SOUNDS = SOUNDS;
  MKD.createSound = createSound;
})((globalThis.MKD ??= {}));
