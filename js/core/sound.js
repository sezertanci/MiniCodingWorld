// Kısa ses efektleri. Ses dosyası kullanılmaz; notalar tarayıcının Web Audio özelliğiyle çalınır.
// Böylece tek dosyalık sürüm büyümez ve internet gerekmez.
// Ses ayarı (açık/kapalı) kaydedilir; ses kapalıysa hiçbir şey çalınmaz. Oyundaki bütün sesler
// play() üzerinden geçer, bu yüzden ayar her efekte (doğru, yanlış, yıldız, rozet, kupa) uygulanır.
(function (MKD) {
  "use strict";

  const SOUNDS = Object.freeze({
    BADGE: "badge",
    TROPHY: "trophy",
    CORRECT: "correct",
    WRONG: "wrong",
    STAR: "star",
    LEVEL_COMPLETE: "level-complete",
  });

  // Her nota: [frekans (Hz), başlangıç (sn), süre (sn)]
  const MELODIES = Object.freeze({
    [SOUNDS.BADGE]: [[784, 0, 0.14], [988, 0.12, 0.14], [1319, 0.24, 0.3]],
    [SOUNDS.TROPHY]: [[523, 0, 0.16], [659, 0.16, 0.16], [784, 0.32, 0.16], [1047, 0.48, 0.24], [784, 0.72, 0.14], [1047, 0.86, 0.6]],
    // Doğru: kısa, neşeli iki yükselen nota
    [SOUNDS.CORRECT]: [[659, 0, 0.12], [988, 0.1, 0.22]],
    // Yanlış: yumuşak, korkutmayan iki alçalan nota ("hımm" gibi); cezalandırıcı bir vızıltı değildir
    [SOUNDS.WRONG]: [[440, 0, 0.2], [370, 0.18, 0.3]],
    // Yıldız: kısa bir parıltı; sıradaki her yıldızda ton yükselir (bkz. play'in step değeri)
    [SOUNDS.STAR]: [[880, 0, 0.12], [1319, 0.06, 0.22]],
    [SOUNDS.LEVEL_COMPLETE]: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.12], [1047, 0.3, 0.4]],
  });

  const WAVE = Object.freeze({ BRIGHT: "triangle", SOFT: "sine" });
  // Yumuşak (sinüs) dalgayla çalınan efektler; diğerleri daha parlak üçgen dalgayla çalınır
  const SOFT_SOUNDS = new Set([SOUNDS.WRONG]);

  const VOLUME = 0.18;
  const ATTACK_SECONDS = 0.02;
  const SILENT_GAIN = 0.0001; // Üstel azalma sıfıra inemez; duyulmayacak kadar küçük bir değer kullanılır.
  // Bir efekt art arda çalınırken (ör. yıldızlar) her adımda ton bu kadar yarım ses yükselir.
  const STEP_SEMITONES = 4;
  const SEMITONES_PER_OCTAVE = 12;

  /** Notanın frekansını step adım kadar yükseltir; step 0 ise nota değişmez. */
  function transpose(frequency, step) {
    return frequency * 2 ** ((step * STEP_SEMITONES) / SEMITONES_PER_OCTAVE);
  }

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

    function playNote(audio, { startAt, wave, step }, [frequency, offset, duration]) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const begin = startAt + offset;
      oscillator.type = wave;
      oscillator.frequency.value = transpose(frequency, step);
      gain.gain.setValueAtTime(SILENT_GAIN, begin);
      gain.gain.exponentialRampToValueAtTime(VOLUME, begin + ATTACK_SECONDS);
      gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, begin + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(begin);
      oscillator.stop(begin + duration);
    }

    /**
     * Ses açıksa verilen efekti çalar. Ses kapalıysa hiçbir şey yapmaz (ses altyapısı bile kurulmaz).
     * step: aynı efekt art arda çalınırken kaçıncı tekrar olduğu; her adımda ton yükselir.
     * Ses çalınamazsa oyun etkilenmez.
     */
    function play(name, step = 0) {
      if (!enabled) {
        return;
      }
      try {
        const audio = getContext();
        if (audio) {
          audio.resume();
          const options = { startAt: audio.currentTime, wave: SOFT_SOUNDS.has(name) ? WAVE.SOFT : WAVE.BRIGHT, step };
          MELODIES[name].forEach((note) => playNote(audio, options, note));
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

  /**
   * Oyunlara ve sonuç ekranına verilen ortak geri bildirim nesnesi. Oyunlar ses servisini kendileri
   * oluşturmaz; doğru ve yanlış anını bu nesneye bildirir. Bütün çağrılar sound.play'e gider,
   * böylece ses kapalıyken hiçbiri çalmaz.
   */
  function createFeedback(sound) {
    return Object.freeze({
      correct: () => sound.play(SOUNDS.CORRECT),
      wrong: () => sound.play(SOUNDS.WRONG),
      // index: sonuç ekranında beliren yıldızın sırası (0'dan başlar); ton her yıldızda yükselir.
      star: (index) => sound.play(SOUNDS.STAR, index),
      levelComplete: () => sound.play(SOUNDS.LEVEL_COMPLETE),
    });
  }

  MKD.SOUNDS = SOUNDS;
  MKD.createSound = createSound;
  MKD.createFeedback = createFeedback;
})((globalThis.MKD ??= {}));
