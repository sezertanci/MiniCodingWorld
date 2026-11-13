// Komutları Sırala: 20 görevin verisi. Kod bu dosyadaki içerikten habersizdir.
//   title:  Görevin adı
//   icon:   Görevin büyük resmi
//   steps:  Adımlar, doğru sırayla. Her adım { text, icon }. Ekranda karışık gösterilir.
//           Okumayı yeni öğrenen çocuk için görsel, eylemin kendisini anlatır (ör. fırçaya sıkılan macun).
//           icon her zaman bir SVG görselinin yoludur.
//   extras: Göreve ait olmayan kartlar (isteğe bağlı, Uzman). Sıraya konmamalıdır.
//   stages: Adımları ara hedeflere bölen başlıklar (isteğe bağlı, Zor ve Uzman). size toplamı adım sayısına eşittir.
//   hint:   İpucu düğmesine basılınca robotun söylediği cümle
(function (MKD) {
  "use strict";

  const step = (text, icon) => Object.freeze({ text, icon });

  const levels = [
    // Kolay 1–5: 2–3 adımlı günlük işler
    {
      title: "Çiçeği sula", icon: "assets/command-order/flower-water.webp",
      steps: [step("Sulama kabını doldur", "assets/command-order/flower-fill-can.webp"), step("Çiçeği sula", "assets/command-order/flower-water.webp")],
      hint: "Çiçeği sulamak için önce kabın içinde su olmalı.",
    },
    {
      title: "Dişlerini fırçala", icon: "assets/command-order/teeth-brush.webp",
      steps: [
        step("Fırçaya macun sık", "assets/command-order/teeth-paste.webp"), step("Dişlerini fırçala", "assets/command-order/teeth-brush.webp"),
        step("Ağzını çalkala", "assets/command-order/teeth-rinse.webp"),
      ],
      hint: "Fırçalamaya başlamadan önce fırçanın üstünde macun olmalı.",
    },
    {
      title: "Ellerini yıka", icon: "assets/command-order/hands-soap.webp",
      steps: [
        step("Ellerini sabunla", "assets/command-order/hands-soap.webp"), step("Ellerini durula", "assets/command-order/hands-rinse.webp"),
        step("Ellerini kurula", "assets/command-order/hands-dry.webp"),
      ],
      hint: "Köpükler gitmeden elini kurulamak olmaz.",
    },
    {
      title: "Ayakkabını giy", icon: "assets/command-order/shoe-tie.webp",
      steps: [
        step("Çorabını giy", "assets/command-order/shoe-sock.webp"), step("Ayakkabını giy", "assets/command-order/shoe-on.webp"),
        step("Bağcığını bağla", "assets/command-order/shoe-tie.webp"),
      ],
      hint: "Ayakkabının içine girmeden önce ayağında ne olmalı?",
    },
    {
      title: "Resim yap", icon: "assets/command-order/draw-color.webp",
      steps: [
        step("Kâğıdı al", "assets/command-order/draw-paper.webp"), step("Resmini çiz", "assets/command-order/draw-sketch.webp"),
        step("Resmini boya", "assets/command-order/draw-color.webp"),
      ],
      hint: "Boyamak için önce çizilmiş bir resim gerekir.",
    },

    // Orta 6–10: 4–5 adım
    {
      title: "Sandviç hazırla", icon: "assets/command-order/sandwich-close.webp",
      steps: [
        step("Tabağı masaya koy", "assets/command-order/sandwich-plate.webp"), step("Ekmeği tabağa koy", "assets/command-order/sandwich-bread.webp"), step("Üstüne peynir koy", "assets/command-order/sandwich-cheese.webp"),
        step("Üstünü ekmekle kapat", "assets/command-order/sandwich-close.webp"), step("Afiyetle ye", "assets/command-order/sandwich-eat.webp"),
      ],
      hint: "Ekmeği koyacak bir yer lazım. Masada ilk ne olmalı?",
    },
    {
      title: "Oyuncakları topla", icon: "assets/command-order/toys-in.svg",
      steps: [
        step("Kutuyu getir", "assets/command-order/toys-box-bring.svg"), step("Oyuncakları kutuya koy", "assets/command-order/toys-in.svg"),
        step("Kutunun kapağını kapat", "assets/command-order/toys-lid.svg"), step("Kutuyu rafa kaldır", "assets/command-order/toys-shelf.svg"),
      ],
      hint: "Oyuncakları koyacağın kutu yanında değilse ne yaparsın?",
    },
    {
      title: "Tohum ek", icon: "assets/command-order/seed-sprout.webp",
      steps: [
        step("Toprakta çukur kaz", "assets/command-order/seed-dig.webp"), step("Tohumu çukura koy", "assets/command-order/seed-drop.webp"), step("Üstünü toprakla ört", "assets/command-order/seed-cover.webp"),
        step("Tohumu sula", "assets/command-order/seed-water.webp"), step("Filizin çıkmasını bekle", "assets/command-order/seed-sprout.webp"),
      ],
      hint: "Tohumun gireceği bir çukur olmadan onu toprağa koyamazsın.",
    },
    {
      title: "Okula hazırlan", icon: "assets/command-order/school-bag.webp",
      steps: [
        step("Alarm çalınca uyan", "assets/command-order/school-wake.webp"), step("Okul kıyafetini giy", "assets/command-order/school-dress.webp"),
        step("Çantanı sırtına tak", "assets/command-order/school-bag.webp"), step("Servise bin", "assets/command-order/school-bus.webp"),
      ],
      hint: "Uyanmadan giyinmek olmaz. Sabah ilk ne olur?",
    },
    {
      title: "Mektup gönder", icon: "assets/command-order/letter-post.svg",
      steps: [
        step("Mektubu yaz", "assets/command-order/letter-write.svg"), step("Mektubu zarfa koy", "assets/command-order/letter-in-envelope.svg"),
        step("Zarfı kapat", "assets/command-order/letter-seal.svg"), step("Posta kutusuna at", "assets/command-order/letter-post.svg"),
      ],
      hint: "Zarfın içine koyacak bir mektup olmalı.",
    },

    // Zor 11–15: 5–7 adım, ara hedefler
    {
      title: "Kek yap", icon: "assets/command-order/cake-slice.svg",
      stages: [{ title: "Hamuru hazırla", size: 3 }, { title: "Keki pişir", size: 3 }],
      steps: [
        step("Malzemeleri masaya koy", "assets/command-order/cake-ingredients.svg"), step("Hepsini kapta karıştır", "assets/command-order/cake-mix.svg"), step("Hamuru kalıba dök", "assets/command-order/cake-pour.svg"),
        step("Kalıbı fırına koy", "assets/command-order/cake-oven.svg"), step("Pişmesini bekle", "assets/command-order/cake-bake.svg"), step("Keki dilimle", "assets/command-order/cake-slice.svg"),
      ],
      hint: "Hamur hazır olmadan fırına bir şey koyamazsın.",
    },
    {
      title: "Banyo yap", icon: "assets/command-order/bath-in.svg",
      stages: [{ title: "Banyoya hazırlan", size: 2 }, { title: "Yıkan", size: 2 }, { title: "Kurulan", size: 1 }],
      steps: [
        step("Küveti suyla doldur", "assets/command-order/bath-fill.svg"), step("Küvete gir", "assets/command-order/bath-in.svg"), step("Saçını şampuanla", "assets/command-order/bath-shampoo.svg"),
        step("Köpükleri durula", "assets/command-order/bath-rinse.svg"), step("Havluyla kurulan", "assets/command-order/bath-dry.svg"),
      ],
      hint: "Boş küvete girersen yıkanamazsın.",
    },
    {
      title: "Bisiklet sür", icon: "assets/command-order/bike-pedal.svg",
      stages: [{ title: "Hazırlan", size: 2 }, { title: "Sür", size: 2 }, { title: "Bitir", size: 1 }],
      steps: [
        step("Kaskını tak", "assets/command-order/bike-helmet.svg"), step("Bisiklete bin", "assets/command-order/bike-mount.svg"), step("Pedal çevir", "assets/command-order/bike-pedal.svg"),
        step("Fren yap", "assets/command-order/bike-brake.svg"), step("Bisikletten in", "assets/command-order/bike-off.svg"),
      ],
      hint: "Güvenlik önce gelir. Bisiklete binmeden ne takarsın?",
    },
    {
      title: "Kütüphaneden kitap al", icon: "assets/command-order/library-choose.svg",
      stages: [{ title: "Kütüphanede", size: 3 }, { title: "Evde", size: 2 }, { title: "Geri ver", size: 1 }],
      steps: [
        step("Kütüphaneye git", "assets/command-order/library-go.svg"), step("Bir kitap seç", "assets/command-order/library-choose.svg"), step("Kitabı ödünç al", "assets/command-order/library-borrow.svg"),
        step("Kitabı eve getir", "assets/command-order/library-home.svg"), step("Kitabı oku", "assets/command-order/library-read.svg"), step("Kitabı geri götür", "assets/command-order/library-return.svg"),
      ],
      hint: "Kitap seçmek için önce kitapların olduğu yere gitmelisin.",
    },
    {
      title: "Çadır kur", icon: "assets/command-order/tent-light.svg",
      stages: [{ title: "Yeri hazırla", size: 2 }, { title: "Çadırı kur", size: 3 }, { title: "İçini hazırla", size: 2 }],
      steps: [
        step("Düz bir yer bul", "assets/command-order/tent-spot.svg"), step("Çadırı yere ser", "assets/command-order/tent-lay.svg"), step("Direkleri tak", "assets/command-order/tent-poles.svg"),
        step("Çadırı kaldır", "assets/command-order/tent-raise.svg"), step("Kazıklarla sabitle", "assets/command-order/tent-stake.svg"), step("Uyku tulumunu içine koy", "assets/command-order/tent-sleep.svg"),
        step("Fenerini yak", "assets/command-order/tent-light.svg"),
      ],
      hint: "Çadırı sermek için önce uygun bir yer bulmalısın.",
    },

    // Uzman 16–20: birden çok aşama, göreve ait olmayan kartlar (verimli sıralama)
    {
      title: "Pizza yap", icon: "assets/command-order/pizza-slice.svg",
      stages: [{ title: "Hamur", size: 1 }, { title: "Malzemeler", size: 2 }, { title: "Pişirme", size: 3 }],
      steps: [
        step("Hamuru aç", "assets/command-order/pizza-roll.svg"), step("Domates sosu sür", "assets/command-order/pizza-sauce.svg"), step("Peynir serp", "assets/command-order/pizza-cheese.svg"),
        step("Fırına koy", "assets/command-order/pizza-oven.svg"), step("Pişmesini bekle", "assets/command-order/pizza-bake.svg"), step("Dilimle", "assets/command-order/pizza-slice.svg"),
      ],
      extras: [step("Televizyon aç", "assets/command-order/tv-on.svg")],
      hint: "Her kart bu göreve ait değil. Pizza yaparken televizyona gerek var mı?",
    },
    {
      title: "Çamaşır yıka", icon: "assets/command-order/laundry-hang.svg",
      stages: [{ title: "Hazırlık", size: 3 }, { title: "Yıkama", size: 1 }, { title: "Kurutma", size: 2 }],
      steps: [
        step("Kirlileri topla", "assets/command-order/laundry-gather.svg"), step("Makineye koy", "assets/command-order/laundry-load.svg"), step("Deterjanı ekle", "assets/command-order/laundry-soap.svg"),
        step("Makineyi çalıştır", "assets/command-order/laundry-run.svg"), step("Çamaşırları as", "assets/command-order/laundry-hang.svg"), step("Kuruyunca katla", "assets/command-order/laundry-fold.svg"),
      ],
      extras: [step("Top oyna", "assets/command-order/ball-play.svg")],
      hint: "Kirli çamaşırlar bir yere dağılmışsa önce ne yapmalısın?",
    },
    {
      title: "Trenle yolculuk", icon: "assets/command-order/train-board.svg",
      stages: [{ title: "İstasyonda", size: 3 }, { title: "Trende", size: 2 }, { title: "Varış", size: 1 }],
      steps: [
        step("Bilet al", "assets/command-order/train-ticket.svg"), step("Perona git", "assets/command-order/train-platform.svg"), step("Treni bekle", "assets/command-order/train-wait.svg"),
        step("Trene bin", "assets/command-order/train-board.svg"), step("Koltuğuna otur", "assets/command-order/train-seat.svg"), step("Durağında in", "assets/command-order/train-off.svg"),
      ],
      extras: [step("Uçağa bin", "assets/command-order/plane-board.svg")],
      hint: "Trene binmek için yanında ne olmalı?",
    },
    {
      title: "Fidan yetiştir", icon: "assets/command-order/sapling-plant.svg",
      stages: [{ title: "Ek", size: 2 }, { title: "Bakım yap", size: 2 }, { title: "Büyüt", size: 2 }],
      steps: [
        step("Saksıya toprak koy", "assets/command-order/sapling-soil.svg"), step("Tohumu ek", "assets/command-order/sapling-seed.svg"), step("Tohumu sula", "assets/command-order/sapling-water.svg"),
        step("Saksıyı güneşe koy", "assets/command-order/sapling-sun.svg"), step("Filizi bekle", "assets/command-order/sapling-sprout.svg"), step("Bahçeye dik", "assets/command-order/sapling-plant.svg"),
      ],
      extras: [step("Şemsiye aç", "assets/command-order/umbrella-open.svg"), step("Saksıyı karanlığa koy", "assets/command-order/pot-dark.svg")],
      hint: "Bitkiler büyümek için su ve güneş ister. Hangi kartlar onlara zarar verir?",
    },
    {
      title: "Kurabiye yap ve paylaş", icon: "assets/command-order/cookie-share.svg",
      stages: [{ title: "Hazırla", size: 3 }, { title: "Pişir", size: 2 }, { title: "Paylaş", size: 2 }],
      steps: [
        step("Ellerini yıka", "assets/command-order/hands-rinse.webp"), step("Malzemeleri karıştır", "assets/command-order/cake-mix.svg"), step("Hamura şekil ver", "assets/command-order/cookie-shape.svg"),
        step("Fırında pişir", "assets/command-order/cookie-bake.svg"), step("Soğumasını bekle", "assets/command-order/cookie-cool.svg"), step("Kutuya koy", "assets/command-order/cookie-box.svg"),
        step("Arkadaşlarına ikram et", "assets/command-order/cookie-share.svg"),
      ],
      extras: [step("Oyuncak araba sür", "assets/command-order/toy-car.svg"), step("Uyumaya git", "assets/command-order/sleep.svg")],
      hint: "Mutfakta çalışmadan önce temizlik gerekir.",
    },
  ];

  MKD.commandOrder = Object.assign(MKD.commandOrder ?? {}, {
    levels: Object.freeze(levels.map(Object.freeze)),
  });
})((globalThis.MKD ??= {}));
