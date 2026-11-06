// Tek dosyalık sürüm üretir: index.html, bütün CSS ve JS dosyaları ile kullanılan görseller
// tek bir HTML dosyasına gömülür. Bu dosya e-postayla, mesajla ya da USB bellekle paylaşılabilir;
// açmak için internet veya sunucu gerekmez.
//
// Kullanım (proje klasöründe):  node tools/build-single-html.js
// Çıktı:                         dist/mini-kodlama-dunyasi.html
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = "dist";
const OUTPUT_FILE = "mini-kodlama-dunyasi.html";

const MIME_TYPES = Object.freeze({ ".svg": "image/svg+xml", ".png": "image/png" });

// index.html içindeki bağlantılar
const STYLESHEET_TAG = /<link rel="stylesheet" href="([^"]+)">/g;
const SCRIPT_TAG = /<script src="([^"]+)"><\/script>/g;
const ICON_TAG = /<link rel="icon" href="([^"]+)">/g;
// CSS içindeki görseller: url("../../assets/...")
const CSS_URL = /url\("([^"]+\.(?:svg|png))"\)/g;
// JS içindeki görsel yolları: "assets/icons/star.svg"
const JS_ASSET = /"(assets\/[^"]+\.(?:svg|png))"/g;

function readText(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

/** Görseli base64 veri adresine çevirir. Aynı görsel birden çok yerde geçerse bir kez okunur. */
function createAssetEncoder() {
  const cache = new Map();
  return function toDataUri(file) {
    const normalized = path.normalize(file);
    if (!cache.has(normalized)) {
      const mime = MIME_TYPES[path.extname(normalized)];
      if (!mime) {
        throw new Error(`Desteklenmeyen görsel türü: ${file}`);
      }
      const base64 = fs.readFileSync(path.join(ROOT, normalized)).toString("base64");
      cache.set(normalized, `data:${mime};base64,${base64}`);
    }
    return cache.get(normalized);
  };
}

function inlineStylesheet(file, toDataUri) {
  const css = readText(file).replace(CSS_URL, (_, url) =>
    `url("${toDataUri(path.join(path.dirname(file), url))}")`
  );
  // Gömülü CSS'te "</style" geçerse tarayıcı style etiketini erken kapatır; bu yüzden kaçırılır.
  return `<style>\n/* ${file} */\n${css.replace(/<\/style/gi, "<\\/style")}</style>`;
}

// Gömülü kodda "</script" geçerse tarayıcı script etiketini erken kapatır; bu yüzden kaçırılır.
function inlineScript(file, toDataUri) {
  const js = readText(file)
    .replace(JS_ASSET, (_, url) => `"${toDataUri(url)}"`)
    .replace(/<\/script/gi, "<\\/script");
  return `<script>\n// ${file}\n${js}</script>`;
}

/** index.html'i okur ve bütün bağlantıları gömülü içerikle değiştirir. */
function buildSingleHtml() {
  const toDataUri = createAssetEncoder();
  // replace içinde fonksiyon kullanılır; böylece içerikteki "$&" gibi ifadeler özel anlam kazanmaz.
  return readText("index.html")
    .replace(ICON_TAG, (_, href) => `<link rel="icon" href="${toDataUri(href)}">`)
    .replace(STYLESHEET_TAG, (_, href) => inlineStylesheet(href, toDataUri))
    .replace(SCRIPT_TAG, (_, src) => inlineScript(src, toDataUri));
}

function main() {
  const html = buildSingleHtml();
  const outputDir = path.join(ROOT, OUTPUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, OUTPUT_FILE);
  fs.writeFileSync(outputPath, html, "utf8");
  const sizeKb = Math.round(Buffer.byteLength(html) / 1024);
  console.log(`Oluşturuldu: ${path.relative(ROOT, outputPath)} (${sizeKb} KB)`);
}

if (require.main === module) {
  main();
}

module.exports = { buildSingleHtml };
