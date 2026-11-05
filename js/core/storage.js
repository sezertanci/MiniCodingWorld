// Tarayıcının localStorage alanına JSON olarak okuma/yazma.
// localStorage kapalı veya dolu olsa bile oyun çalışmaya devam eder; yalnızca ilerleme kaydedilmez.
(function (MKD) {
  "use strict";

  function createLocalStorage(key) {
    function load() {
      try {
        const raw = globalThis.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn("İlerleme okunamadı, sıfırdan başlanıyor.", error);
        return null;
      }
    }

    function save(data) {
      try {
        globalThis.localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.warn("İlerleme kaydedilemedi.", error);
      }
    }

    function clear() {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (error) {
        console.warn("İlerleme silinemedi.", error);
      }
    }

    return Object.freeze({ load, save, clear });
  }

  MKD.createLocalStorage = createLocalStorage;
})((globalThis.MKD ??= {}));
