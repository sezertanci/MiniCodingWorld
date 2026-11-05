// Eğer Böyleyse: 20 seviyenin verisi. Yol işaretleri engine.js dosyasında açıklanır.
//   lane:   Robotun geçeceği kareler (soldan sağa). Robot başlangıçtan çıkar, son kareden sonra bayrağa varır.
//   rules:  "Eğer ... varsa" satırları. if verilirse koşul hazır gelir, then verilirse hareket hazır gelir;
//           verilmeyenleri çocuk seçer.
//   else:   "Değilse" hareketi hazır gelirse burada yazılır; yazılmazsa çocuk seçer.
//   extras: Yolda olmayan ama blok olarak gösterilecek nesneler (isteğe bağlı, çeldirici)
//   intro:  Robotun seviye başında söylediği cümle
(function (MKD) {
  "use strict";

  const { KIND, ACTION } = MKD.ifThen;

  const levels = [
    // Kolay 1–5: tek koşul ve tek karar. "Değilse" hazır: İleri Git.
    { lane: "..#..", rules: [{ if: KIND.ROCK }], else: ACTION.FORWARD, intro: "Önünde taş varsa robot ne yapmalı? Boş kutuya bir hareket koy." },
    { lane: ".~..~", rules: [{ if: KIND.WATER }], else: ACTION.FORWARD, intro: "Robot yüzemez. Önünde su varsa ne yapmalı?" },
    { lane: "..D..", rules: [{ if: KIND.DOOR }], else: ACTION.FORWARD, intro: "Yolda kapalı bir kapı var. Kapının önüne gelince ne yapmalı?" },
    { lane: ".*.*.", rules: [{ if: KIND.STAR }], else: ACTION.FORWARD, intro: "Yıldızları toplamadan geçme! Önünde yıldız varsa ne yapmalı?" },
    { lane: "#..#.", rules: [{}], else: ACTION.FORWARD, extras: [KIND.WATER], intro: "Bu kez koşulu da sen seç. Yolda ne var?" },

    // Orta 6–10: eğer / değilse ile iki olasılık
    { lane: "..#..#", rules: [{ if: KIND.ROCK }], intro: "Taş varsa bir şey, yoksa başka bir şey yapmalı. İki kutuyu da doldur." },
    { lane: "~.~.~.", rules: [{ if: KIND.WATER }], intro: "Su varsa ne yapmalı? Su yoksa ne yapmalı?" },
    { lane: "D*D*D*", rules: [{ if: KIND.DOOR }], intro: "Bu yolda boş kare yok! Kapı yoksa önünde ne var?" },
    { lane: ".*..*.", rules: [{}], extras: [KIND.ROCK], intro: "Koşulu ve iki hareketi sen seç." },
    { lane: "~#~~#", rules: [{}], intro: "Yolda taş ve su var. Bir kural ve bir \"değilse\" yeter." },

    // Zor 11–15: birden fazla koşul
    { lane: ".#.~.#.", rules: [{}, {}], intro: "Taş da var su da. Her biri için bir kural kur." },
    { lane: "D.*.D.*", rules: [{}, {}], intro: "Kapıları aç, yıldızları topla." },
    { lane: "#~*#~*", rules: [{}, {}], intro: "Üç farklı şey var ama iki kural satırı. Üçüncüsü için \"değilse\" kullan." },
    { lane: "~D~.D~", rules: [{}, {}], intro: "Su, kapı ve boş yol. Hangisini \"değilse\"ye bırakırsın?" },
    { lane: "*#.*#.", rules: [{}, {}], extras: [KIND.WATER], intro: "Dikkat: bloklardan biri bu yolda hiç yok." },

    // Uzman 16–20: birkaç koşulu birleştiren küçük senaryolar
    { lane: "#~D.#~D.", rules: [{}, {}, {}], intro: "Robot kaleye gidiyor: taşlar, hendekler ve kale kapıları var." },
    { lane: ".*#~*.#~", rules: [{}, {}, {}], intro: "Hazine yolu: yıldızları topla, engelleri aş." },
    { lane: "D*~#D*~#", rules: [{}, {}, {}], intro: "Bu yolda hiç boş kare yok. Dört şey için dört karar gerek." },
    { lane: "~#..D~#.D", rules: [{}, {}, {}], intro: "Uzun bir yolculuk! Su, taş, kapı ve boş yol." },
    { lane: "*D#~*D#~*", rules: [{}, {}, {}], intro: "Son görev: bütün yıldızları toplayıp bayrağa ulaş." },
  ];

  MKD.ifThen = Object.assign(MKD.ifThen ?? {}, {
    levels: Object.freeze(levels.map(Object.freeze)),
  });
})((globalThis.MKD ??= {}));
