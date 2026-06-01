export const initialDanisanData = {
  user: {
    fullName: "Yaren Demirli",
    boy: 163,
    kilo: 56,
    hedef: 52,
    alerji: "Yok",
    hastalik: "Yok",
  },

  water: {
    icilen: 5,
    hedef: 8,
  },

  meals: [
    {
      id: 1,
      ogun: "Kahvaltı",
      saat: "09:00",
      yemek: "Yulaf, süt, muz",
      kalori: 320,
    },
    {
      id: 2,
      ogun: "Öğle",
      saat: "13:00",
      yemek: "Izgara tavuk, salata",
      kalori: 450,
    },
    {
      id: 3,
      ogun: "Akşam",
      saat: "19:00",
      yemek: "Çorba, yoğurt",
      kalori: 280,
    },
  ],

  gunlukKayitlar: [
    { id: 1, besin: "Elma", kalori: 80 },
    { id: 2, besin: "Yoğurt", kalori: 120 },
  ],

  takasOnerileri: [
  {
    id: 1,
    kategori: "Tahıllar",
    eski: "Beyaz Pirinç Pilavı",
    yeni: "Bulgur Pilavı",
    eskiKalori: 250,
    yeniKalori: 180,
    neden: "Bulgur daha fazla lif içerir ve daha uzun süre tok tutar.",
    etiketler: ["Lifli", "Tok tutar", "Daha sağlıklı"],
  },
  {
    id: 2,
    kategori: "Tahıllar",
    eski: "Beyaz Makarna",
    yeni: "Tam Buğday Makarna",
    eskiKalori: 220,
    yeniKalori: 190,
    neden: "Tam buğday makarna daha fazla posa içerir.",
    etiketler: ["Tam tahıl", "Daha doyurucu"],
  },
  {
    id: 3,
    kategori: "Tahıllar",
    eski: "Pirinç Pilavı",
    yeni: "Kinoa Salatası",
    eskiKalori: 250,
    yeniKalori: 170,
    neden: "Kinoa protein ve lif açısından daha dengeli bir alternatiftir.",
    etiketler: ["Proteinli", "Lifli", "Hafif"],
  },
  {
    id: 4,
    kategori: "Ekmekler",
    eski: "Beyaz Ekmek",
    yeni: "Tam Buğday Ekmeği",
    eskiKalori: 80,
    yeniKalori: 70,
    neden: "Tam buğday ekmeği daha fazla lif içerir.",
    etiketler: ["Tam tahıl", "Tok tutar"],
  },
  {
    id: 5,
    kategori: "Ekmekler",
    eski: "Simit",
    yeni: "Tam Buğday Tostu",
    eskiKalori: 320,
    yeniKalori: 220,
    neden: "Tam buğday tost daha dengeli ve kontrollü bir öğün alternatifi olabilir.",
    etiketler: ["Daha az kalori", "Daha dengeli"],
  },
  {
    id: 6,
    kategori: "Ekmekler",
    eski: "Poğaça",
    yeni: "Peynirli Tam Buğday Sandviç",
    eskiKalori: 350,
    yeniKalori: 240,
    neden: "Poğaça yağ oranı yüksek olabilir. Tam buğday sandviç daha doyurucudur.",
    etiketler: ["Daha az yağ", "Tok tutar"],
  },
  {
    id: 7,
    kategori: "İçecekler",
    eski: "Kola",
    yeni: "Maden Suyu",
    eskiKalori: 140,
    yeniKalori: 0,
    neden: "Maden suyu kalorisizdir ve şeker içermez.",
    etiketler: ["Şekersiz", "Kalorisiz"],
  },
  {
    id: 8,
    kategori: "İçecekler",
    eski: "Gazlı İçecek",
    yeni: "Ayran",
    eskiKalori: 150,
    yeniKalori: 70,
    neden: "Ayran daha besleyici ve protein içeren bir alternatiftir.",
    etiketler: ["Proteinli", "Daha sağlıklı"],
  },
  {
    id: 9,
    kategori: "İçecekler",
    eski: "Şekerli Kahve",
    yeni: "Sade Türk Kahvesi",
    eskiKalori: 180,
    yeniKalori: 20,
    neden: "Sade kahve şekerli kahveye göre çok daha düşük kalorilidir.",
    etiketler: ["Şekersiz", "Düşük kalori"],
  },
  {
    id: 10,
    kategori: "Proteinler",
    eski: "Kızarmış Tavuk",
    yeni: "Izgara Tavuk",
    eskiKalori: 350,
    yeniKalori: 220,
    neden: "Izgara tavuk daha az yağ içerir.",
    etiketler: ["Proteinli", "Daha az yağ"],
  },
  {
    id: 11,
    kategori: "Proteinler",
    eski: "Yağlı Kırmızı Et",
    yeni: "Izgara Balık",
    eskiKalori: 400,
    yeniKalori: 250,
    neden: "Balık daha hafif ve omega-3 açısından daha iyi bir alternatiftir.",
    etiketler: ["Omega-3", "Proteinli", "Hafif"],
  },
  {
    id: 12,
    kategori: "Proteinler",
    eski: "Kızarmış Köfte",
    yeni: "Fırında Köfte",
    eskiKalori: 330,
    yeniKalori: 240,
    neden: "Fırında pişirme daha az yağ kullanımına yardımcı olur.",
    etiketler: ["Daha az yağ", "Proteinli"],
  },
  {
    id: 13,
    kategori: "Sebzeler",
    eski: "Patates Kızartması",
    yeni: "Fırın Patates",
    eskiKalori: 320,
    yeniKalori: 180,
    neden: "Fırın patates kızartmaya göre daha az yağ içerir.",
    etiketler: ["Daha az yağ", "Daha hafif"],
  },
  {
    id: 14,
    kategori: "Sebzeler",
    eski: "Kremalı Sebze Yemeği",
    yeni: "Zeytinyağlı Sebze Yemeği",
    eskiKalori: 280,
    yeniKalori: 180,
    neden: "Kremalı yemekler daha yüksek kalori içerebilir.",
    etiketler: ["Hafif", "Sebze ağırlıklı"],
  },
  {
    id: 15,
    kategori: "Sebzeler",
    eski: "Mayonezli Salata",
    yeni: "Yoğurtlu Salata",
    eskiKalori: 250,
    yeniKalori: 140,
    neden: "Yoğurtlu salata mayoneze göre daha düşük kalorili olabilir.",
    etiketler: ["Daha hafif", "Proteinli"],
  },
  {
    id: 16,
    kategori: "Meyveler",
    eski: "Muz",
    yeni: "Elma",
    eskiKalori: 105,
    yeniKalori: 70,
    neden: "Elma daha düşük kalorili ve lifli bir alternatiftir.",
    etiketler: ["Lifli", "Düşük kalori"],
  },
  {
    id: 17,
    kategori: "Meyveler",
    eski: "Üzüm",
    yeni: "Çilek",
    eskiKalori: 120,
    yeniKalori: 50,
    neden: "Çilek daha düşük kalorili ve ferah bir meyve alternatifidir.",
    etiketler: ["Düşük kalori", "Tatlı isteğine uygun"],
  },
  {
    id: 18,
    kategori: "Meyveler",
    eski: "Kuru Meyve",
    yeni: "Taze Meyve",
    eskiKalori: 200,
    yeniKalori: 80,
    neden: "Kuru meyveler porsiyon küçük olsa da kalorisi daha yoğun olabilir.",
    etiketler: ["Daha hacimli", "Daha hafif"],
  },
  {
    id: 19,
    kategori: "Süt Ürünleri",
    eski: "Meyveli Yoğurt",
    yeni: "Sade Yoğurt + Taze Meyve",
    eskiKalori: 180,
    yeniKalori: 120,
    neden: "Hazır meyveli yoğurtlar ilave şeker içerebilir.",
    etiketler: ["Şekersiz", "Proteinli"],
  },
  {
    id: 20,
    kategori: "Süt Ürünleri",
    eski: "Tam Yağlı Süt",
    yeni: "Yarım Yağlı Süt",
    eskiKalori: 150,
    yeniKalori: 100,
    neden: "Yarım yağlı süt kalori kontrolü için daha uygun olabilir.",
    etiketler: ["Daha az yağ", "Kalsiyum"],
  },
  {
    id: 21,
    kategori: "Süt Ürünleri",
    eski: "Krem Peynir",
    yeni: "Lor Peyniri",
    eskiKalori: 190,
    yeniKalori: 100,
    neden: "Lor peyniri daha düşük kalorili ve proteinli bir seçenektir.",
    etiketler: ["Proteinli", "Düşük kalori"],
  },
  {
    id: 22,
    kategori: "Tatlılar",
    eski: "Çikolatalı Pasta",
    yeni: "Meyveli Yoğurt Kasesi",
    eskiKalori: 450,
    yeniKalori: 180,
    neden: "Meyveli yoğurt kasesi tatlı isteğini daha dengeli karşılar.",
    etiketler: ["Tatlı alternatifi", "Daha hafif"],
  },
  {
    id: 23,
    kategori: "Tatlılar",
    eski: "Çikolata",
    yeni: "Bitter Çikolata",
    eskiKalori: 250,
    yeniKalori: 150,
    neden: "Bitter çikolata daha küçük porsiyonla tatlı isteğini bastırabilir.",
    etiketler: ["Porsiyon kontrolü", "Tatlı isteği"],
  },
  {
    id: 24,
    kategori: "Tatlılar",
    eski: "Dondurma",
    yeni: "Donmuş Yoğurt",
    eskiKalori: 220,
    yeniKalori: 130,
    neden: "Donmuş yoğurt daha hafif bir tatlı alternatifi olabilir.",
    etiketler: ["Daha hafif", "Serin alternatif"],
  },
  {
    id: 25,
    kategori: "Atıştırmalıklar",
    eski: "Cips",
    yeni: "Baharatlı Fırın Nohut",
    eskiKalori: 300,
    yeniKalori: 160,
    neden: "Fırın nohut daha lifli ve daha doyurucu bir atıştırmalıktır.",
    etiketler: ["Lifli", "Tok tutar"],
  },
  {
    id: 26,
    kategori: "Atıştırmalıklar",
    eski: "Bisküvi",
    yeni: "Yulaflı Kurabiye",
    eskiKalori: 250,
    yeniKalori: 170,
    neden: "Yulaflı kurabiye daha lifli bir seçenek olabilir.",
    etiketler: ["Lifli", "Ara öğün"],
  },
  {
    id: 27,
    kategori: "Atıştırmalıklar",
    eski: "Şekerleme",
    yeni: "Kuruyemiş + Meyve",
    eskiKalori: 220,
    yeniKalori: 160,
    neden: "Kuruyemiş ve meyve daha dengeli bir ara öğün alternatifi sunar.",
    etiketler: ["Dengeli", "Tok tutar"],
  },
  ],

};

/** Raporlar sayfası — günlük kayıt / su / profil kilosu ile özet (duruma göre güncellenir). */
export function buildHaftalikRaporSnapshot(data) {
  const fallback = {
    ortalamaKalori: 1850,
    suOrtalama: 6,
    kiloDegisim: "—",
    uyumOrani: 72,
  };
  if (!data) return fallback;

  const entries = Array.isArray(data.gunlukKayitlar) ? data.gunlukKayitlar : [];
  const meals = entries.filter((e) => e.kind !== "activity");
  const water = data.water || {};

  let ortalamaKalori = fallback.ortalamaKalori;
  if (meals.length > 0) {
    const sum = meals.reduce((acc, e) => acc + (Number(e.kalori) || 0), 0);
    ortalamaKalori = Math.round(sum / meals.length);
  }

  const suRaw = water.icilen;
  const suOrtalama =
    typeof suRaw === "number" && Number.isFinite(suRaw) && suRaw >= 0
      ? Math.round(suRaw)
      : fallback.suOrtalama;

  const uyumOrani =
    meals.length > 0
      ? Math.min(100, Math.round((meals.length / 21) * 100))
      : fallback.uyumOrani;

  let kiloDegisim = fallback.kiloDegisim;
  const kilo = data.user?.kilo;
  const hedef = data.user?.hedef;
  if (kilo !== "" && kilo != null && hedef !== "" && hedef != null) {
    const k = Number(kilo);
    const h = Number(hedef);
    if (Number.isFinite(k) && Number.isFinite(h)) {
      const diff = k - h;
      const sign = diff > 0 ? "+" : "";
      kiloDegisim = `${sign}${diff.toFixed(1)} kg (hedefe göre)`;
    }
  }

  return { ortalamaKalori, suOrtalama, kiloDegisim, uyumOrani };
}