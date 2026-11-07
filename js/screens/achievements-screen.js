// Başarılarım ekranı: rozetler ve kupalar, kazanılanlar ve kilitliler ayrı gruplarda.
// Kazanılanlar renkli, kilitliler soluk görünür; kilitlilerde hedefe ne kadar kaldığı gösterilir.
(function (MKD) {
  "use strict";

  const { el } = MKD.dom;
  const { ICONS, iconButton, progressBar, topBar } = MKD.components;
  const { emblem } = MKD.rewardView;
  const { ACHIEVEMENT_KIND: KIND, countEarnedRewards } = MKD;

  // Her ödül türünün ekrandaki yazıları
  const SECTIONS = Object.freeze([
    { kind: KIND.BADGE, title: "Rozetler", subtitle: "Küçük başarılar", icon: ICONS.medal,
      earnedTitle: "Kazandığın rozetler", lockedTitle: "Kazanılacak rozetler", empty: "Henüz rozetin yok. İlk seviyeni bitir!" },
    { kind: KIND.TROPHY, title: "Kupalar", subtitle: "Büyük hedefler", icon: ICONS.trophy,
      earnedTitle: "Kazandığın kupalar", lockedTitle: "Kilitli kupalar", empty: "Henüz kupan yok. Büyük hedeflere doğru devam!" },
  ]);

  function rewardCard(item) {
    const status = item.earned
      ? el("span", { className: "reward-earned", text: "Kazanıldı!" })
      : el("span", { className: "reward-progress" }, [
        progressBar(item.current, item.goal, `${item.goal} hedefin ${item.current} tanesi tamam`),
        el("span", { className: "reward-progress-text", text: `${item.current}/${item.goal}` }),
      ]);
    return el("article", {
      className: `reward-card is-${item.kind}${item.earned ? "" : " is-locked"}`,
      "aria-label": `${item.title}, ${item.earned ? "kazanıldı" : "kilitli"}`,
    }, [
      el("span", { className: "reward-card-art" }, [
        emblem(item),
        !item.earned && el("img", { className: "reward-lock", src: ICONS.lock, alt: "" }),
      ]),
      el("h4", { className: "reward-title", text: item.title }),
      el("p", { className: "reward-description", text: item.description }),
      el("p", { className: "reward-condition" }, [el("strong", { text: "Nasıl kazanılır? " }), item.condition]),
      status,
    ]);
  }

  function group(title, items, emptyText) {
    return el("div", { className: "reward-group" }, [
      el("h3", { className: "reward-group-title", text: title }),
      items.length > 0
        ? el("div", { className: "reward-grid" }, items.map(rewardCard))
        : el("p", { className: "reward-empty", text: emptyText }),
    ]);
  }

  function section(definition, items) {
    const ofKind = items.filter((item) => item.kind === definition.kind);
    const { earned, total } = countEarnedRewards(ofKind);
    const locked = ofKind.filter((item) => !item.earned);
    return el("section", { className: `reward-section is-${definition.kind}` }, [
      el("h2", { className: "reward-section-title" }, [
        el("img", { src: definition.icon, alt: "" }),
        el("span", { text: definition.title }),
        el("span", { className: "reward-section-subtitle", text: definition.subtitle }),
        el("span", { className: "reward-section-count", text: `${earned}/${total}` }),
      ]),
      group(definition.earnedTitle, ofKind.filter((item) => item.earned), definition.empty),
      locked.length > 0 && group(definition.lockedTitle, locked, ""),
    ]);
  }

  function summary(items) {
    const { earned: earnedAll } = countEarnedRewards(items);
    return el("p", { className: "reward-summary card" }, [
      el("strong", { text: `${earnedAll} ödül kazandın!` }),
      ...SECTIONS.map((definition) => {
        const { earned, total: all } = countEarnedRewards(items, definition.kind);
        return el("span", { className: "reward-summary-item" }, [
          el("img", { src: definition.icon, alt: "" }),
          `${definition.title}: ${earned}/${all}`,
        ]);
      }),
    ]);
  }

  function createAchievementsScreen({ achievements, router }) {
    function render() {
      const items = achievements.getStatus();
      return el("div", { className: "screen achievements-screen" }, [
        topBar({
          left: iconButton({ icon: ICONS.back, label: "Ana ekrana dön", onClick: () => router.go(MKD.paths.home()) }),
          title: "Başarılarım",
          icon: ICONS.trophy,
        }),
        summary(items),
        ...SECTIONS.map((definition) => section(definition, items)),
      ]);
    }

    return Object.freeze({ render });
  }

  MKD.createAchievementsScreen = createAchievementsScreen;
})((globalThis.MKD ??= {}));
