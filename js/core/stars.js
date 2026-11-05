// Seviye sonunda verilecek yıldız sayısını hesaplar. Dört oyun da bu kuralı kullanır.
(function (MKD) {
  "use strict";

  const STARS = Object.freeze({
    COMPLETED: 1, // Görev tamamlandı
    NO_HINT: 2, // İpucu kullanılmadan tamamlandı
    PERFECT: 3, // İpucu kullanılmadan ve hedef komut/verimlilik koşulu sağlanarak tamamlandı
  });

  /**
   * @param {{ hintUsed: boolean, targetMet: boolean }} result
   *   hintUsed: ipucu kullanıldı mı, targetMet: hedeflenen komut sayısı veya verimlilik sağlandı mı
   * @returns {number} 1–3 arası yıldız
   */
  function calculateStars({ hintUsed, targetMet }) {
    if (hintUsed) {
      return STARS.COMPLETED;
    }
    return targetMet ? STARS.PERFECT : STARS.NO_HINT;
  }

  MKD.calculateStars = calculateStars;
})((globalThis.MKD ??= {}));
