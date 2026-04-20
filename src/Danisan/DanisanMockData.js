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
    { id: 1, kaynak: "Pirinç pilavı", alternatif: "Bulgur pilavı" },
    { id: 2, kaynak: "Beyaz ekmek", alternatif: "Tam buğday ekmeği" },
    { id: 3, kaynak: "Gazlı içecek", alternatif: "Maden suyu" },
  ],

  haftalikRapor: {
    ortalamaKalori: 1450,
    suOrtalama: 6,
    kiloDegisim: "-1.2 kg",
    uyumOrani: "%82",
  },
};