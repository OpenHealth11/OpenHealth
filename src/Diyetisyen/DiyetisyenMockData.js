export const initialDiyetisyenData = {
  diyetisyen: {
    fullName: "Dyt. Elif Yılmaz",
    uzmanlik: "Klinik Beslenme",
  },

  danisanlar: [
    {
      id: 1,
      fullName: "Ayşe Kaya",
      yas: 24,
      kilo: 68,
      hedef: 60,
      durum: "Aktif",
    },
    {
      id: 2,
      fullName: "Zeynep Demir",
      yas: 29,
      kilo: 74,
      hedef: 65,
      durum: "Aktif",
    },
    {
      id: 3,
      fullName: "Merve Aydın",
      yas: 32,
      kilo: 81,
      hedef: 72,
      durum: "Pasif",
    },
  ],

  planlar: [
    {
      id: 1,
      danisanId: 1,
      danisanAdi: "Ayşe Kaya",
      baslik: "Kilo Kontrol Planı",
      durum: "Aktif",
    },
    {
      id: 2,
      danisanId: 2,
      danisanAdi: "Zeynep Demir",
      baslik: "Yağ Yakım Planı",
      durum: "Aktif",
    },
  ],

  gunlukKayitlar: [
    {
      id: 1,
      danisanAdi: "Ayşe Kaya",
      ogun: "Kahvaltı",
      detay: "Yulaf, süt, muz",
      kalori: 320,
    },
    {
      id: 2,
      danisanAdi: "Zeynep Demir",
      ogun: "Öğle",
      detay: "Tavuk salata",
      kalori: 410,
    },
    {
      id: 3,
      danisanAdi: "Ayşe Kaya",
      ogun: "Akşam",
      detay: "Çorba, yoğurt",
      kalori: 260,
    },
  ],

  onayBekleyenler: [
    {
      id: 1,
      danisanAdi: "Ayşe Kaya",
      talep: "Beslenme planı güncelleme isteği",
      tarih: "20.04.2026",
    },
    {
      id: 2,
      danisanAdi: "Merve Aydın",
      talep: "Yeni günlük kayıt onayı",
      tarih: "20.04.2026",
    },
  ],

  bildirimler: [
    {
      id: 1,
      mesaj: "Ayşe Kaya yeni bir günlük kayıt ekledi.",
      saat: "09:15",
    },
    {
      id: 2,
      mesaj: "Zeynep Demir su hedefini tamamladı.",
      saat: "11:40",
    },
    {
      id: 3,
      mesaj: "Merve Aydın plan güncelleme talebi gönderdi.",
      saat: "13:05",
    },
  ],
};