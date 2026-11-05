// Sürükle-bırak: fare ve dokunmatik ekranda aynı şekilde çalışır (Pointer Events).
// Küçük bir dokunuş sürükleme sayılmaz; öğenin normal tıklama davranışı çalışır.
// Bırakma alanları HTML'de data-drop-zone özelliğiyle işaretlenir.
(function (MKD) {
  "use strict";

  const DRAG_THRESHOLD_PX = 8;
  const DROP_ZONE_SELECTOR = "[data-drop-zone]";
  const OVER_CLASS = "is-drop-over";
  const SOURCE_CLASS = "is-drag-source";
  const CLICK_SWALLOW_MS = 300;

  function findDropZone(x, y) {
    return document.elementFromPoint(x, y)?.closest(DROP_ZONE_SELECTOR) ?? null;
  }

  // Parmağın altında sürüklenen öğenin bir kopyası (hayalet) gösterilir.
  function createGhost(source, rect) {
    const ghost = source.cloneNode(true);
    ghost.classList.add("drag-ghost");
    ghost.removeAttribute("id");
    Object.assign(ghost.style, { width: `${rect.width}px`, height: `${rect.height}px` });
    document.body.append(ghost);
    return ghost;
  }

  // Sürüklemeden sonra tarayıcının gönderdiği tıklama yutulur; yoksa dokunma davranışı da çalışırdı.
  // Tıklama hiç gelmezse dinleyici kısa süre sonra kaldırılır, böylece sonraki gerçek dokunuş kaybolmaz.
  function swallowNextClick(element) {
    const swallow = (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
    };
    element.addEventListener("click", swallow, { capture: true, once: true });
    setTimeout(() => element.removeEventListener("click", swallow, { capture: true }), CLICK_SWALLOW_MS);
  }

  /**
   * @param {HTMLElement} element Sürüklenecek öğe
   * @param {{ canDrag?: () => boolean, onDrop: (zone: HTMLElement) => void }} options
   */
  function makeDraggable(element, { canDrag = () => true, onDrop }) {
    element.classList.add("is-draggable");

    element.addEventListener("pointerdown", (down) => {
      if (down.button !== 0 || !canDrag()) return;
      const rect = element.getBoundingClientRect();
      const offset = { x: down.clientX - rect.left, y: down.clientY - rect.top };
      let ghost = null;
      let zone = null;

      function setZone(next) {
        zone?.classList.remove(OVER_CLASS);
        zone = next;
        zone?.classList.add(OVER_CLASS);
      }

      function move(event) {
        const distance = Math.hypot(event.clientX - down.clientX, event.clientY - down.clientY);
        if (!ghost && distance < DRAG_THRESHOLD_PX) return;
        if (!ghost) {
          ghost = createGhost(element, rect);
          element.classList.add(SOURCE_CLASS);
        }
        ghost.style.transform = `translate(${event.clientX - offset.x}px, ${event.clientY - offset.y}px)`;
        setZone(findDropZone(event.clientX, event.clientY));
      }

      function end() {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", end);
        element.removeEventListener("pointercancel", end);
        if (!ghost) return;
        ghost.remove();
        element.classList.remove(SOURCE_CLASS);
        swallowNextClick(element);
        const target = zone;
        setZone(null);
        if (target) onDrop(target);
      }

      element.setPointerCapture(down.pointerId);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", end);
      element.addEventListener("pointercancel", end);
    });
  }

  MKD.dragDrop = Object.freeze({ makeDraggable });
})((globalThis.MKD ??= {}));
