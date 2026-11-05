// Küçük DOM yardımcısı: öğe oluşturmayı kısa ve okunur hale getirir.
(function (MKD) {
  "use strict";

  const EVENT_PREFIX = "on";

  function applyProp(node, key, value) {
    if (key === "className") {
      node.className = value;
    } else if (key === "text") {
      node.textContent = value;
    } else if (key.startsWith(EVENT_PREFIX)) {
      node.addEventListener(key.slice(EVENT_PREFIX.length).toLowerCase(), value);
    } else {
      node.setAttribute(key, value === true ? "" : value);
    }
  }

  /**
   * Örnek: el("button", { className: "btn", text: "Başlat", onClick: start })
   * false, null veya undefined olan özellikler ve çocuklar atlanır.
   */
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (value !== undefined && value !== null && value !== false) {
        applyProp(node, key, value);
      }
    }
    node.append(...[].concat(children).filter((child) => child || child === 0));
    return node;
  }

  MKD.dom = Object.freeze({ el });
})((globalThis.MKD ??= {}));
