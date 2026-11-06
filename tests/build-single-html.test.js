// Tek dosyalık sürüm: dış bağlantı kalmadığı ve bütün dosyaların gömüldüğü denetlenir.
const { describe, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { buildSingleHtml } = require("../tools/build-single-html.js");

const indexHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const html = buildSingleHtml();
const countMatches = (text, pattern) => (text.match(pattern) ?? []).length;

describe("buildSingleHtml", () => {
  test("buildSingleHtml_IndexWithLinks_LeavesNoExternalFiles", () => {
    assert.doesNotMatch(html, /<link rel="stylesheet"/);
    assert.doesNotMatch(html, /<script src=/);
    assert.doesNotMatch(html, /["(](?:\.\.\/)*assets\//);
  });

  test("buildSingleHtml_IndexWithLinks_InlinesEveryStylesheetAndScript", () => {
    assert.equal(countMatches(html, /<style>/g), countMatches(indexHtml, /<link rel="stylesheet"/g));
    assert.equal(countMatches(html, /<script>/g), countMatches(indexHtml, /<script src=/g));
  });

  test("buildSingleHtml_Output_KeepsLoadWarningForViewersWithoutJavaScript", () => {
    assert.match(html, /class="load-warning card"/);
  });

  test("buildSingleHtml_Images_BecomeDataUris", () => {
    assert.match(html, /data:image\/svg\+xml;base64,/);
  });
});
