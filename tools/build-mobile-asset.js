// Android uygulamasının yüklediği oyun dosyasını üretir. Tek dosyalık sürüm
// (build-single-html.js) Flutter projesinin asset klasörüne yazılır; uygulama bunu
// internetsiz açar. Dosya git dışında kalır, oyun kodu değiştikçe komut yeniden çalıştırılır.
//
// Kullanım (proje klasöründe):  node tools/build-mobile-asset.js
// Çıktı:                         mobile/assets/game.html
"use strict";

const path = require("node:path");
const { writeSingleHtml } = require("./build-single-html.js");

const ROOT = path.resolve(__dirname, "..");
// Bu yol mobile/lib/game_page.dart içindeki gameAssetPath ile aynı kalmalı.
const OUTPUT_PATH = path.join(ROOT, "mobile", "assets", "game.html");

writeSingleHtml(OUTPUT_PATH);
