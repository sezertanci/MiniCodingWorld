// Robotun konuşma balonundaki doğru/yanlış tepkileri, animasyon yardımcısı ve sonuç paneli zamanlaması.
// Ayrıca bütün seslerin tek yoldan (sound.play) çaldığı, böylece ses ayarının her efekte uygulandığı denetlenir.
// Tarayıcı yerine yalnızca gereken kadarını taklit eden küçük bir sahte DOM kullanılır.
// Çalıştırma (proje klasöründe): node --test
const { describe, test, before } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SOUND_MODULE = path.join("js", "core", "sound.js");

// Sahte DOM öğesi: el() yardımcısının ve animasyon yardımcısının kullandığı kadarı
function createFakeNode(tag) {
  const classes = new Set();
  const listeners = {};
  return {
    tag,
    children: [],
    attributes: {},
    textContent: "",
    offsetWidth: 0,
    set className(value) { classes.clear(); value.split(" ").filter(Boolean).forEach((name) => classes.add(name)); },
    get className() { return [...classes].join(" "); },
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
    },
    setAttribute(key, value) { this.attributes[key] = value; },
    append(...nodes) { this.children.push(...nodes); },
    addEventListener(type, listener) { (listeners[type] ??= []).push(listener); },
    dispatch(type) {
      const pending = listeners[type] ?? [];
      listeners[type] = [];
      pending.forEach((listener) => listener());
    },
  };
}

before(() => {
  globalThis.document = { createElement: createFakeNode };
  require("../js/core/config.js");
  require("../js/core/dom.js");
  require("../js/core/characters.js");
  require("../js/core/components.js");
  require("../js/core/timing.js");
});

function createFakeFeedback() {
  const calls = [];
  return { calls, correct: () => calls.push("correct"), wrong: () => calls.push("wrong") };
}

function setupBubble() {
  const feedback = createFakeFeedback();
  const bubble = globalThis.MKD.components.speechBubble("Merhaba", feedback);
  const [robot, message] = bubble.element.children;
  return { bubble, feedback, robot, message };
}

describe("speechBubble", () => {
  test("say_NewText_ChangesMessageAndRobotTalksWithoutSound", () => {
    const { bubble, feedback, robot, message } = setupBubble();

    bubble.say("Robot yola çıktı...");

    assert.equal(message.textContent, "Robot yola çıktı...");
    assert.ok(robot.classList.contains("is-talking"));
    assert.deepEqual(feedback.calls, []);
  });

  test("correct_Called_RobotCheersAndCorrectSoundPlays", () => {
    const { bubble, feedback, robot, message } = setupBubble();

    bubble.correct("Harika!");

    assert.equal(message.textContent, "Harika!");
    assert.ok(robot.classList.contains("is-cheering"));
    assert.deepEqual(feedback.calls, ["correct"]);
  });

  test("wrong_Called_RobotShakesHeadAndWrongSoundPlays", () => {
    const { bubble, feedback, robot } = setupBubble();

    bubble.wrong("Robot taşa çarptı.");

    assert.ok(robot.classList.contains("is-shaking"));
    assert.ok(!robot.classList.contains("is-talking"));
    assert.deepEqual(feedback.calls, ["wrong"]);
  });

  test("wrong_AfterCorrect_KeepsOnlyLatestReaction", () => {
    const { bubble, robot } = setupBubble();

    bubble.correct("Harika!");
    bubble.wrong("Olmadı.");

    assert.ok(robot.classList.contains("is-shaking"));
    assert.ok(!robot.classList.contains("is-cheering"));
  });
});

describe("replayAnimation", () => {
  test("replayAnimation_AnimationEnds_RemovesClassSoRobotReturnsToIdle", () => {
    const node = createFakeNode("img");

    globalThis.MKD.timing.replayAnimation(node, "is-bumping");
    const whilePlaying = node.classList.contains("is-bumping");
    node.dispatch("animationend");

    assert.ok(whilePlaying);
    assert.ok(!node.classList.contains("is-bumping"));
  });
});

describe("starPopDelay", () => {
  test("starPopDelay_LaterStar_AppearsAfterLevelSoundAndPreviousStar", () => {
    const { starPopDelay, RESULT } = globalThis.MKD.timing;

    const delays = [0, 1, 2].map(starPopDelay);

    assert.ok(delays[0] >= RESULT.PANEL_ENTER_MS);
    assert.equal(delays[1] - delays[0], RESULT.STAR_INTERVAL_MS);
    assert.equal(delays[2] - delays[1], RESULT.STAR_INTERVAL_MS);
  });

  // Rozet/kupa kutlaması starPopDelay(yıldız sayısı) anında başlar; son yıldızın sesiyle çakışmamalı.
  test("starPopDelay_StarCount_IsOneIntervalAfterLastStar", () => {
    const { starPopDelay, RESULT } = globalThis.MKD.timing;

    const celebrationStart = starPopDelay(3);

    assert.equal(celebrationStart - starPopDelay(2), RESULT.STAR_INTERVAL_MS);
  });
});

describe("tek ses yolu", () => {
  function listJsFiles(dir) {
    return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJsFiles(relative);
      return entry.name.endsWith(".js") ? [relative] : [];
    });
  }

  // Ses ayarı yalnızca sound.play içinde denetlenir. Başka bir dosya sesi doğrudan çalarsa
  // ses kapalıyken de duyulurdu; bu test bunun önüne geçer.
  test("sourceFiles_OutsideSoundModule_DoNotPlayAudioDirectly", () => {
    const directAudio = /AudioContext|createOscillator|new Audio\(|<audio|\.mp3|\.wav|\.ogg/;

    const offenders = listJsFiles("js")
      .filter((file) => file !== SOUND_MODULE)
      .filter((file) => directAudio.test(fs.readFileSync(path.join(ROOT, file), "utf8")));

    assert.deepEqual(offenders, []);
  });
});
