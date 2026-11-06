// Komutları Sırala: 20 görevin verisi. Kod bu dosyadaki içerikten habersizdir.
//   title:  Görevin adı
//   icon:   Görevin büyük resmi (emoji)
//   steps:  Adımlar, doğru sırayla. Her adım { text, icon }. Ekranda karışık gösterilir.
//   extras: Göreve ait olmayan kartlar (isteğe bağlı, Uzman). Sıraya konmamalıdır.
//   stages: Adımları ara hedeflere bölen başlıklar (isteğe bağlı, Zor ve Uzman). size toplamı adım sayısına eşittir.
//   hint:   İpucu düğmesine basılınca robotun söylediği cümle
(function (MKD) {
  "use strict";

  const step = (text, icon) => Object.freeze({ text, icon });

  const levels = [
    // Kolay 1–5: 2–3 adımlı günlük işler
    {
      title: "Çiçeği sula", icon: "🌷",
      steps: [step("Sulama kabını doldur", "💧"), step("Çiçeği sula", "🌷")],
      hint: "Çiçeği sulamak için önce kabın içinde su olmalı.",
    },
    {
      title: "Dişlerini fırçala", icon: "🦷",
      steps: [step("Fırçaya macun sık", "🪥"), step("Dişlerini fırçala", "😁"), step("Ağzını çalkala", "💦")],
      hint: "Fırçalamaya başlamadan önce fırçanın üstünde macun olmalı.",
    },
    {
      title: "Ellerini yıka", icon: "🧼",
      steps: [step("Ellerini sabunla", "🧼"), step("Ellerini durula", "🚿"), step("Ellerini kurula", "🧻")],
      hint: "Köpükler gitmeden elini kurulamak olmaz.",
    },
    {
      title: "Ayakkabını giy", icon: "👟",
      steps: [step("Çorabını giy", "🧦"), step("Ayakkabını giy", "👟"), step("Bağcığını bağla", "🎀")],
      hint: "Ayakkabının içine girmeden önce ayağında ne olmalı?",
    },
    {
      title: "Resim yap", icon: "🎨",
      steps: [step("Kâğıdı al", "📄"), step("Resmini çiz", "✏️"), step("Resmini boya", "🖍️")],
      hint: "Boyamak için önce çizilmiş bir resim gerekir.",
    },

    // Orta 6–10: 4–5 adım
    {
      title: "Sandviç hazırla", icon: "🥪",
      steps: [
        step("Tabağı masaya koy", "🍽️"), step("Ekmeği tabağa koy", "🍞"), step("Üstüne peynir koy", "🧀"),
        step("Üstünü ekmekle kapat", "🥪"), step("Afiyetle ye", "😋"),
      ],
      hint: "Ekmeği koyacak bir yer lazım. Masada ilk ne olmalı?",
    },
    {
      title: "Oyuncakları topla", icon: "🧸",
      steps: [
        step("Kutuyu getir", "📦"), step("Oyuncakları kutuya koy", "🧸"),
        step("Kutunun kapağını kapat", "🔒"), step("Kutuyu rafa kaldır", "🗄️"),
      ],
      hint: "Oyuncakları koyacağın kutu yanında değilse ne yaparsın?",
    },
    {
      title: "Tohum ek", icon: "🌱",
      steps: [
        step("Toprakta çukur kaz", "🕳️"), step("Tohumu çukura koy", "🌰"), step("Üstünü toprakla ört", "🟫"),
        step("Tohumu sula", "💧"), step("Filizin çıkmasını bekle", "🌱"),
      ],
      hint: "Tohumun gireceği bir çukur olmadan onu toprağa koyamazsın.",
    },
    {
      title: "Okula hazırlan", icon: "🎒",
      steps: [
        step("Alarm çalınca uyan", "⏰"), step("Okul kıyafetini giy", "👕"),
        step("Çantanı sırtına tak", "🎒"), step("Servise bin", "🚌"),
      ],
      hint: "Uyanmadan giyinmek olmaz. Sabah ilk ne olur?",
    },
    {
      title: "Mektup gönder", icon: "✉️",
      steps: [
        step("Mektubu yaz", "✍️"), step("Mektubu zarfa koy", "✉️"),
        step("Zarfı kapat", "📩"), step("Posta kutusuna at", "📮"),
      ],
      hint: "Zarfın içine koyacak bir mektup olmalı.",
    },

    // Zor 11–15: 5–7 adım, ara hedefler
    {
      title: "Kek yap", icon: "🍰",
      stages: [{ title: "Hamuru hazırla", size: 3 }, { title: "Keki pişir", size: 3 }],
      steps: [
        step("Malzemeleri masaya koy", "🧺"), step("Hepsini kapta karıştır", "🥣"), step("Hamuru kalıba dök", "🫗"),
        step("Kalıbı fırına koy", "🔥"), step("Pişmesini bekle", "⏲️"), step("Keki dilimle", "🍰"),
      ],
      hint: "Hamur hazır olmadan fırına bir şey koyamazsın.",
    },
    {
      title: "Banyo yap", icon: "🛁",
      stages: [{ title: "Banyoya hazırlan", size: 2 }, { title: "Yıkan", size: 2 }, { title: "Kurulan", size: 1 }],
      steps: [
        step("Küveti suyla doldur", "🛁"), step("Küvete gir", "🦶"), step("Saçını şampuanla", "🧴"),
        step("Köpükleri durula", "🚿"), step("Havluyla kurulan", "🧻"),
      ],
      hint: "Boş küvete girersen yıkanamazsın.",
    },
    {
      title: "Bisiklet sür", icon: "🚲",
      stages: [{ title: "Hazırlan", size: 2 }, { title: "Sür", size: 2 }, { title: "Bitir", size: 1 }],
      steps: [
        step("Kaskını tak", "⛑️"), step("Bisiklete bin", "🚲"), step("Pedal çevir", "🦵"),
        step("Fren yap", "🛑"), step("Bisikletten in", "👋"),
      ],
      hint: "Güvenlik önce gelir. Bisiklete binmeden ne takarsın?",
    },
    {
      title: "Kütüphaneden kitap al", icon: "📚",
      stages: [{ title: "Kütüphanede", size: 3 }, { title: "Evde", size: 2 }, { title: "Geri ver", size: 1 }],
      steps: [
        step("Kütüphaneye git", "🏛️"), step("Bir kitap seç", "📚"), step("Kitabı ödünç al", "🎫"),
        step("Kitabı eve getir", "🏠"), step("Kitabı oku", "📖"), step("Kitabı geri götür", "↩️"),
      ],
      hint: "Kitap seçmek için önce kitapların olduğu yere gitmelisin.",
    },
    {
      title: "Çadır kur", icon: "⛺",
      stages: [{ title: "Yeri hazırla", size: 2 }, { title: "Çadırı kur", size: 3 }, { title: "İçini hazırla", size: 2 }],
      steps: [
        step("Düz bir yer bul", "🏕️"), step("Çadırı yere ser", "🟩"), step("Direkleri tak", "🦯"),
        step("Çadırı kaldır", "⛺"), step("Kazıklarla sabitle", "📌"), step("Uyku tulumunu içine koy", "🛌"),
        step("Fenerini yak", "🔦"),
      ],
      hint: "Çadırı sermek için önce uygun bir yer bulmalısın.",
    },

    // Uzman 16–20: birden çok aşama, göreve ait olmayan kartlar (verimli sıralama)
    {
      title: "Pizza yap", icon: "🍕",
      stages: [{ title: "Hamur", size: 1 }, { title: "Malzemeler", size: 2 }, { title: "Pişirme", size: 3 }],
      steps: [
        step("Hamuru aç", "🫓"), step("Domates sosu sür", "🍅"), step("Peynir serp", "🧀"),
        step("Fırına koy", "🔥"), step("Pişmesini bekle", "⏲️"), step("Dilimle", "🍕"),
      ],
      extras: [step("Televizyon aç", "📺")],
      hint: "Her kart bu göreve ait değil. Pizza yaparken televizyona gerek var mı?",
    },
    {
      title: "Çamaşır yıka", icon: "🧺",
      stages: [{ title: "Hazırlık", size: 3 }, { title: "Yıkama", size: 1 }, { title: "Kurutma", size: 2 }],
      steps: [
        step("Kirlileri topla", "🧺"), step("Makineye koy", "🫧"), step("Deterjanı ekle", "🧴"),
        step("Makineyi çalıştır", "▶️"), step("Çamaşırları as", "👕"), step("Kuruyunca katla", "🗂️"),
      ],
      extras: [step("Top oyna", "⚽")],
      hint: "Kirli çamaşırlar bir yere dağılmışsa önce ne yapmalısın?",
    },
    {
      title: "Trenle yolculuk", icon: "🚆",
      stages: [{ title: "İstasyonda", size: 3 }, { title: "Trende", size: 2 }, { title: "Varış", size: 1 }],
      steps: [
        step("Bilet al", "🎫"), step("Perona git", "🚉"), step("Treni bekle", "⏳"),
        step("Trene bin", "🚆"), step("Koltuğuna otur", "💺"), step("Durağında in", "🚶"),
      ],
      extras: [step("Uçağa bin", "✈️")],
      hint: "Trene binmek için yanında ne olmalı?",
    },
    {
      title: "Fidan yetiştir", icon: "🌳",
      stages: [{ title: "Ek", size: 2 }, { title: "Bakım yap", size: 2 }, { title: "Büyüt", size: 2 }],
      steps: [
        step("Saksıya toprak koy", "🪴"), step("Tohumu ek", "🌰"), step("Tohumu sula", "💧"),
        step("Saksıyı güneşe koy", "☀️"), step("Filizi bekle", "🌱"), step("Bahçeye dik", "🌳"),
      ],
      extras: [step("Şemsiye aç", "☂️"), step("Saksıyı karanlığa koy", "🌑")],
      hint: "Bitkiler büyümek için su ve güneş ister. Hangi kartlar onlara zarar verir?",
    },
    {
      title: "Kurabiye yap ve paylaş", icon: "🍪",
      stages: [{ title: "Hazırla", size: 3 }, { title: "Pişir", size: 2 }, { title: "Paylaş", size: 2 }],
      steps: [
        step("Ellerini yıka", "🧼"), step("Malzemeleri karıştır", "🥣"), step("Hamura şekil ver", "🍪"),
        step("Fırında pişir", "🔥"), step("Soğumasını bekle", "⏲️"), step("Kutuya koy", "📦"),
        step("Arkadaşlarına ikram et", "🤝"),
      ],
      extras: [step("Oyuncak araba sür", "🚗"), step("Uyumaya git", "😴")],
      hint: "Mutfakta çalışmadan önce temizlik gerekir.",
    },
  ];

  MKD.commandOrder = Object.assign(MKD.commandOrder ?? {}, {
    levels: Object.freeze(levels.map(Object.freeze)),
  });
})((globalThis.MKD ??= {}));
