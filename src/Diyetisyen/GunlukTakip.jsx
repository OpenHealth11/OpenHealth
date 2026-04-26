import { useState } from "react";

function GunlukTakip({ gunlukKayitlar = [] }) {
  const [secilenDanisan, setSecilenDanisan] = useState("Tümü");
  const [secilenTarih, setSecilenTarih] = useState("");
  const [secilenKayit, setSecilenKayit] = useState(null);

  const danisanIsimleri = [
    "Tümü",
    ...new Set(gunlukKayitlar.map((item) => item.danisanAdi)),
  ];

  const filtreliKayitlar = gunlukKayitlar.filter((item) => {
    const danisanUygun =
      secilenDanisan === "Tümü" || item.danisanAdi === secilenDanisan;

    const tarihUygun = !secilenTarih || item.tarih === secilenTarih;

    return danisanUygun && tarihUygun;
  });

  const toplamKalori = filtreliKayitlar.reduce(
    (toplam, item) => toplam + Number(item.kalori || 0),
    0
  );

  const toplamSu = filtreliKayitlar.reduce(
    (toplam, item) => toplam + Number(item.su || 0),
    0
  );

  const hedefKalori = filtreliKayitlar[0]?.hedefKalori || 1600;
  const suHedefi = filtreliKayitlar[0]?.suHedefi || 8;

  const kaloriDurumu =
    toplamKalori > hedefKalori
      ? "Hedef üstü"
      : toplamKalori >= hedefKalori * 0.8
      ? "Uygun"
      : "Eksik";

  const suDurumu = toplamSu >= suHedefi ? "Tamamlandı" : "Eksik";

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Günlük Takip</h2>

      <div className="dy-card">
        <h3>Filtreler</h3>

        <div className="dy-form-grid">
          <select
            value={secilenDanisan}
            onChange={(e) => setSecilenDanisan(e.target.value)}
          >
            {danisanIsimleri.map((isim) => (
              <option key={isim} value={isim}>
                {isim}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={secilenTarih}
            onChange={(e) => setSecilenTarih(e.target.value)}
          />

          <button
            type="button"
            className="dy-secondary-btn"
            onClick={() => {
              setSecilenDanisan("Tümü");
              setSecilenTarih("");
              setSecilenKayit(null);
            }}
          >
            Filtreyi Temizle
          </button>
        </div>
      </div>

      <div className="dy-stats-grid">
        <div className="dy-card dy-stat-card">
          <h3>Toplam Kalori</h3>
          <p>{toplamKalori} kcal</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>Hedef Kalori</h3>
          <p>{hedefKalori} kcal</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>İçilen Su</h3>
          <p>{toplamSu} bardak</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>Su Hedefi</h3>
          <p>{suHedefi} bardak</p>
        </div>
      </div>

      <div className="dy-card">
        <h3>Günlük Değerlendirme</h3>

        <p>
          <strong>Kalori Durumu:</strong> {kaloriDurumu}
        </p>

        <p>
          <strong>Su Durumu:</strong> {suDurumu}
        </p>
      </div>

      <div className="dy-card">
        <h3>Günlük Kayıtlar</h3>

        <div className="dy-list">
          {filtreliKayitlar.length === 0 ? (
            <p>Kayıt bulunamadı.</p>
          ) : (
            filtreliKayitlar.map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.danisanAdi}</strong>
                  <p>
                    {item.tarih || "-"} • {item.ogun}
                  </p>
                  <p>{item.detay}</p>
                  <p>
                    Kalori: {item.kalori} kcal • Su: {item.su || 0} bardak
                  </p>
                </div>

                <div className="dy-action-group">
                  <span
                    className={`dy-status ${
                      item.durum === "Onaylandı" ? "active" : "passive"
                    }`}
                  >
                    {item.durum || "Takipte"}
                  </span>

                  <button
                    className="dy-primary-btn"
                    onClick={() => setSecilenKayit(item)}
                  >
                    Detay
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {secilenKayit && (
        <div className="dy-card">
          <h3>Kayıt Detayı</h3>

          <p>
            <strong>Danışan:</strong> {secilenKayit.danisanAdi}
          </p>
          <p>
            <strong>Tarih:</strong> {secilenKayit.tarih || "-"}
          </p>
          <p>
            <strong>Öğün:</strong> {secilenKayit.ogun}
          </p>
          <p>
            <strong>Detay:</strong> {secilenKayit.detay}
          </p>
          <p>
            <strong>Kalori:</strong> {secilenKayit.kalori} kcal
          </p>
          <p>
            <strong>İçilen Su:</strong> {secilenKayit.su || 0} bardak
          </p>
          <p>
            <strong>Not:</strong> {secilenKayit.not || "Not girilmedi."}
          </p>

          <button
            className="dy-secondary-btn"
            onClick={() => setSecilenKayit(null)}
          >
            Detayı Kapat
          </button>
        </div>
      )}
    </div>
  );
}

export default GunlukTakip;