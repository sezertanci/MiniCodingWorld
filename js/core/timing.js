// Oyunların ortak zamanlama sabitleri ve yardımcıları: bekleme, adım süresi, kutlama gecikmesi
// ve kısa tepki animasyonlarının (zıplama, çarpma, kafa sallama) yeniden oynatılması.
(function (MKD) {
  "use strict";

  // Seviye bitince kutlamanın sürdüğü, sonuç kaydedilmeden önce beklenen süre
  const CELEBRATE_MS = 900;
  // Hareket azaltma tercihi açıkken bir robot adımının süresi
  const REDUCED_STEP_MS = 150;
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  // Sonuç paneli: panel yaylanarak girer; seviye sonu melodisi bitince yıldızlar bu aralıkla tek tek belirir.
  // Rozet/kupa kutlaması son yıldızdan sonra başlar; böylece sesler üst üste binmez.
  // Gecikmeler CSS'e değişkenle verilir; ses ve görüntü aynı sabitten beslenir.
  const RESULT = Object.freeze({ PANEL_ENTER_MS: 450, FIRST_STAR_MS: 750, STAR_INTERVAL_MS: 380 });

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /** Hareket azaltma tercihi açıksa kısa süreyi, değilse oyunun kendi adım süresini döndürür. */
  const stepDuration = (normalMs) =>
    globalThis.matchMedia?.(REDUCED_MOTION_QUERY).matches ? REDUCED_STEP_MS : normalMs;

  /**
   * Sonuç panelindeki index. yıldızın (0'dan başlar) belirme gecikmesi.
   * starPopDelay(yıldız sayısı): son yıldızdan bir aralık sonrası, yani yıldız gösterisinin bittiği an.
   */
  const starPopDelay = (index) => RESULT.FIRST_STAR_MS + index * RESULT.STAR_INTERVAL_MS;

  /** Kutlama bitince onComplete'i çağırır. Çocuk kutlama sürerken başka ekrana geçtiyse sonuç kaydedilmez. */
  function completeAfterCelebration(container, onComplete, stars) {
    wait(CELEBRATE_MS).then(() => container.isConnected && onComplete(stars));
  }

  /**
   * Bir CSS animasyon sınıfını baştan oynatır ve animasyon bitince sınıfı kaldırır; böylece robot
   * bekleme hareketine geri döner. Animasyonun süresi yalnızca CSS'te yazılıdır.
   * Hareket azaltma açıkken animasyon olmadığından sınıf kalabilir; bir sonraki çağrı yine baştan başlatır.
   */
  function replayAnimation(node, className) {
    node.classList.remove(className);
    void node.offsetWidth; // Tarayıcı sınıfın kalktığını görsün diye yerleşim yeniden hesaplatılır.
    node.classList.add(className);
    node.addEventListener("animationend", () => node.classList.remove(className), { once: true });
  }

  MKD.timing = Object.freeze({ RESULT, wait, stepDuration, starPopDelay, completeAfterCelebration, replayAnimation });
})((globalThis.MKD ??= {}));
