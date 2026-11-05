// Galeri: asset-manifest.js içindeki görselleri kategoriye göre listeler.
(() => {
  const ASSET_ROOT = "../assets/";
  const CATEGORY_TITLES = Object.freeze({
    characters: "Karakterler",
    backgrounds: "Arka planlar",
    icons: "İkonlar",
    ui: "Arayüz",
    puzzles: "Bulmaca parçaları",
    generated: "Üretilmiş ve kaynak görseller",
  });
  const SOURCE_LABELS = Object.freeze({ svg: "SVG", mockup: "Tasarımdan", ai: "Yapay zekâ" });
  const ALL = "all";

  const container = document.getElementById("gallery");
  const filterButtons = document.querySelectorAll(".filters button");

  function createItem(asset) {
    const item = document.createElement("figure");
    item.className = "item";
    item.innerHTML = `
      <div class="preview"><img loading="lazy" alt=""></div>
      <p class="name"></p>
      <p class="desc"></p>
      <span class="badge ${asset.source}"></span>`;
    const img = item.querySelector("img");
    img.src = ASSET_ROOT + asset.file;
    img.alt = asset.description;
    item.querySelector(".name").textContent = asset.file;
    item.querySelector(".desc").textContent = asset.description;
    item.querySelector(".badge").textContent = SOURCE_LABELS[asset.source];
    return item;
  }

  function render(source) {
    container.replaceChildren();
    for (const [category, title] of Object.entries(CATEGORY_TITLES)) {
      const assets = ASSET_MANIFEST.filter(
        (a) => a.category === category && (source === ALL || a.source === source)
      );
      if (assets.length === 0) continue;
      const heading = document.createElement("h2");
      heading.textContent = `${title} (${assets.length})`;
      const grid = document.createElement("div");
      grid.className = "grid";
      grid.append(...assets.map(createItem));
      container.append(heading, grid);
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.toggle("active", b === button));
      render(button.dataset.source);
    });
  });

  render(ALL);
})();
