// Oyunların ortak zamanlama sabitleri ve yardımcıları: bekleme, adım süresi ve kutlama gecikmesi.
(function (MKD) {
  "use strict";

  // Seviye bitince kutlamanın sürdüğü, sonuç kaydedilmeden önce beklenen süre
  const CELEBRATE_MS = 900;
  // Hareket azaltma tercihi açıkken bir robot adımının süresi
  const REDUCED_STEP_MS = 150;
  // Robotun engele çarpma animasyonunun süresi
  const BUMP_MS = 400;
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Hareket azaltma tercihi açıksa kısa süreyi, değilse oyunun kendi adım süresini döndürür. */
  const stepDuration = (normalMs) =>
    globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches ? REDUCED_STEP_MS : normalMs;

  /** Kutlama bitince onComplete'i çağırır. Çocuk kutlama sürerken başka ekrana geçtiyse sonuç kaydedilmez. */
  function completeAfterCelebration(container, onComplete, stars) {
    wait(CELEBRATE_MS).then(() => container.isConnected && onComplete(stars));
  }

  MKD.timing = Object.freeze({ BUMP_MS, wait, stepDuration, completeAfterCelebration });
})((globalThis.MKD ??= {}));
