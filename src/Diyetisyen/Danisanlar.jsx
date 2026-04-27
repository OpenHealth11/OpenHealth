import { useState } from "react";

function Danisanlar({ danisanlar = [] }) {
  const [arama, setArama] = useState("");
  const [secilenDanisan, setSecilenDanisan] = useState(null);

  function bmiHesapla(kilo, boy) {
    if (!kilo || !boy) return "-";
    const metre = boy / 100;
    return (kilo / (metre * metre)).toFixed(1);
  }

  const filtreliDanisanlar = danisanlar.filter((item) =>
    item.fullName.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Danışanlar</h2>

      <div className="dy-card">
        <input
          className="dy-search-input"
          type="text"
          placeholder="Danışan ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      <div className="dy-table-card dy-card">
        <table className="dy-table">
          <thead>
            <tr>
              <th>Ad Soyad</th>
              <th>Yaş</th>
              <th>Boy</th>
              <th>Kilo</th>
              <th>Hedef</th>
              <th>BMI</th>
              <th>Son Görüşme</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filtreliDanisanlar.map((item) => (
              <tr key={item.id}>
                <td>{item.fullName}</td>
                <td>{item.yas}</td>
                <td>{item.boy} cm</td>
                <td>{item.kilo} kg</td>
                <td>{item.hedef} kg</td>
                <td>{bmiHesapla(item.kilo, item.boy)}</td>
                <td>{item.sonGorusme || "-"}</td>
                <td>
                  <span
                    className={`dy-status ${
                      item.durum === "Aktif" ? "active" : "passive"
                    }`}
                  >
                    {item.durum}
                  </span>
                </td>
                <td>
                  <button
                    className="dy-primary-btn"
                    onClick={() => setSecilenDanisan(item)}
                  >
                    Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {secilenDanisan && (
        <div className="dy-card">
          <h3>Danışan Detayı</h3>

          <p><strong>Ad Soyad:</strong> {secilenDanisan.fullName}</p>
          <p><strong>Yaş:</strong> {secilenDanisan.yas}</p>
          <p><strong>Boy:</strong> {secilenDanisan.boy} cm</p>
          <p><strong>Kilo:</strong> {secilenDanisan.kilo} kg</p>
          <p><strong>Hedef:</strong> {secilenDanisan.hedef} kg</p>
          <p><strong>BMI:</strong> {bmiHesapla(secilenDanisan.kilo, secilenDanisan.boy)}</p>
          <p><strong>Alerji:</strong> {secilenDanisan.alerji || "Yok"}</p>
          <p><strong>Hastalık:</strong> {secilenDanisan.hastalik || "Yok"}</p>
          <p><strong>Son Görüşme:</strong> {secilenDanisan.sonGorusme || "-"}</p>
          <p><strong>Durum:</strong> {secilenDanisan.durum}</p>

          <button
            className="dy-secondary-btn"
            onClick={() => setSecilenDanisan(null)}
          >
            Detayı Kapat
          </button>
        </div>
      )}
    </div>
  );
}

export default Danisanlar;