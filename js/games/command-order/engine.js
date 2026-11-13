// Komutları Sırala: oyun kuralları. Ekrandan bağımsızdır, Node testleriyle de çalışır.
// Kart kimlikleri adımın doğru sırasıdır (0, 1, 2...). Göreve ait olmayan kartlar adımlardan sonra numaralanır.
(function (MKD) {
  "use strict";

  const REASON = Object.freeze({
    EXTRA: "extra", // Kart bu görevde kullanılmaz
    TOO_EARLY: "too-early", // Kart olması gerekenden önceki bir kutuda; ondan önce yapılacak bir adım var
  });

  // Basit, tekrarlanabilir rastgele sayı üreteci: aynı tohum her zaman aynı karışık sırayı verir.
  // Oyun her açılışta yeni bir tohum (createSeed) kullanır; testler sabit tohumla çalışır.
  const LCG_MULTIPLIER = 1103515245;
  const LCG_INCREMENT = 12345;
  const LCG_MODULUS = 2 ** 31;
  // Karışık sıra çözülmüş sıraya ya da kaçınılan sıraya denk gelirse yeniden karıştırma sınırı
  const MAX_SHUFFLE_ATTEMPTS = 20;

  const createSeed = () => Math.floor(Math.random() * LCG_MODULUS);

  function createRandom(seed) {
    let value = seed;
    return () => {
      value = (value * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
      return value / LCG_MODULUS;
    };
  }

  /** Seviyedeki adımları ve göreve ait olmayan kartları tek bir kart listesine çevirir. */
  function buildCards(level) {
    const steps = level.steps.map((step, index) => ({ id: index, ...step, extra: false }));
    const extras = (level.extras ?? []).map((step, index) => ({ id: level.steps.length + index, ...step, extra: true }));
    return [...steps, ...extras];
  }

  const isInOrder = (cards) => cards.every((card, index) => card.id === index);

  const hasOrder = (cards, ids) => cards.length === ids.length && cards.every((card, index) => card.id === ids[index]);

  function shuffleOnce(cards, random) {
    const result = [...cards];
    for (let index = result.length - 1; index > 0; index--) {
      const other = Math.floor(random() * (index + 1));
      [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
  }

  /**
   * Kartları karıştırır. Sonuç hiçbir zaman zaten doğru sıralı olmaz.
   * @param {number[]} avoidIds Kaçınılacak sıra (ör. bir önceki açılış); başka sıra kalmadıysa yine de gelebilir.
   */
  function shuffleCards(cards, seed, avoidIds = []) {
    const random = createRandom(seed);
    let result = shuffleOnce(cards, random);
    for (let attempt = 1; attempt < MAX_SHUFFLE_ATTEMPTS && (isInOrder(result) || hasOrder(result, avoidIds)); attempt++) {
      result = shuffleOnce(cards, random);
    }
    if (isInOrder(result)) {
      result.push(result.shift());
    }
    return result;
  }

  /**
   * Kutulardaki sırayı denetler ve soldan ilk yanlış kutuyu bildirir.
   * İlk yanlış kutudan öncekiler doğru olduğu için oradaki kart ya göreve ait değildir ya da erkene konmuştur.
   * @param {(number|null)[]} slots Her kutudaki kart kimliği
   * @returns {{ correct: true } | { correct: false, index: number, reason: string }}
   */
  function checkOrder(slots) {
    const index = slots.findIndex((cardId, slot) => cardId !== slot);
    if (index < 0) {
      return { correct: true };
    }
    const cardId = slots[index];
    if (cardId >= slots.length) {
      return { correct: false, index, reason: REASON.EXTRA };
    }
    return { correct: false, index, reason: REASON.TOO_EARLY };
  }

  /** İlk yanlış ya da boş kutuyu ve oraya gelmesi gereken kartı döndürür; sıra doğruysa null. */
  function nextHint(slots) {
    const slot = slots.findIndex((cardId, index) => cardId !== index);
    return slot < 0 ? null : { slot, cardId: slot };
  }

  MKD.commandOrder = Object.assign(MKD.commandOrder ?? {}, { REASON, createSeed, buildCards, shuffleCards, checkOrder, nextHint });
})((globalThis.MKD ??= {}));
