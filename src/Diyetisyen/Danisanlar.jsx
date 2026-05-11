import { useState, useEffect } from "react";

function Danisanlar() {
  const [arama, setArama] = useState("");
  const [secilenDanisan, setSecilenDanisan] = useState(null);
  const [danisanlar, setDanisanlar] = useState([]);

  useEffect(() => {
    async function fetchClients() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/diyetisyen/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let clients = [];
        if (res.ok) {
          const data = await res.json();
          clients = Array.isArray(data.clients) ? data.clients : [];
        }
        setDanisanlar(clients);
      } catch (err) {
        console.error("Danışanlar alınamadı:", err);
        setDanisanlar([]);
      }
    }

    fetchClients();
  }, []);



  function bmiHesapla(kilo, boy) {
    if (!kilo || !boy) return "-";
    const metre = boy / 100;
    return (kilo / (metre * metre)).toFixed(1);
  }

  const filtreliDanisanlar = (Array.isArray(danisanlar) ? danisanlar : []).filter((item) =>
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