import { useState, useEffect } from "react";

import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiEye,
  FiFileText,
} from "react-icons/fi";

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

 async function kanDosyasiAc(dosyaUrl) {
  if (!dosyaUrl) {
    alert("Bu danışanın yüklenmiş kan değeri dosyası yok.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
    return;
  }

  try {
    const res = await fetch(dosyaUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Kan raporu indirilemedi.");
      return;
    }

    const blob = await res.blob();
    const fileUrl = URL.createObjectURL(blob);

    window.open(fileUrl, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
    }, 60_000);
  } catch {
    alert("Kan raporu açılırken sunucuya bağlanılamadı.");
  }
}

  const liste = Array.isArray(danisanlar) ? danisanlar : [];
  const filtreliDanisanlar = liste.filter((item) =>
    item.fullName?.toLowerCase().includes(arama.toLowerCase())
  );

  const aktifDanisan = liste.filter((x) => x.durum === "Aktif").length;
  const pasifDanisan = liste.filter((x) => x.durum !== "Aktif").length;

  return (
    <div className="dy-page">
      <div className="dy-list-top">
        <div>
          <h2>Danışanlar</h2>
          <p>Tüm danışanlarını buradan yönetebilirsin</p>
        </div>

        <button type="button" className="dy-add-client-btn">+ Yeni Danışan</button>
      </div>

      <div className="dy-client-summary">
        <div className="dy-client-summary-card green">
          <FiUsers />
          <div>
            <span>Toplam</span>
            <strong>{liste.length}</strong>
          </div>
        </div>

        <div className="dy-client-summary-card blue">
          <FiUserCheck />
          <div>
            <span>Aktif</span>
            <strong>{aktifDanisan}</strong>
          </div>
        </div>

        <div className="dy-client-summary-card red">
          <FiUserX />
          <div>
            <span>Pasif</span>
            <strong>{pasifDanisan}</strong>
          </div>
        </div>
      </div>

      <div className="dy-card dy-search-card">
        <FiSearch className="dy-search-icon" />

        <input
          className="dy-search-input"
          type="text"
          placeholder="Danışan ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      <div className="dy-table-card">
        <table className="dy-table">
          <thead>
            <tr>
              <th>Danışan</th>
              <th>Yaş</th>
              <th>Kilo</th>
              <th>BMI</th>
              <th>İlaçlar</th>
              <th>Kan Değerleri</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>

          <tbody>
            {filtreliDanisanlar.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="dy-client-cell">
                    <div className="dy-client-avatar">
                      {item.fullName?.charAt(0)}
                    </div>

                    <div>
                      <strong>{item.fullName}</strong>
                      <p>Son görüşme: {item.sonGorusme || "-"}</p>
                    </div>
                  </div>
                </td>

                <td>{item.yas || "-"}</td>
                <td>{item.kilo ? `${item.kilo} kg` : "-"}</td>
                <td>{bmiHesapla(item.kilo, item.boy)}</td>

                <td>
                  {item.ilaclar ? (
                    <span className="dy-mini-badge warning">Var</span>
                  ) : (
                    <span className="dy-mini-badge gray">Yok</span>
                  )}
                </td>

                <td>
  {item.bloodReport?.exists ? (
    <button
      type="button"
      className="dy-file-btn"
      onClick={() => kanDosyasiAc(item.bloodReport.downloadUrl)}
      title={item.bloodReport.fileName}
    >
      <FiFileText />
      İndir
    </button>
  ) : (
    <span className="dy-mini-badge gray">Yok</span>
  )}
</td>

                <td>
                  <span
                    className={`dy-status ${
                      item.durum === "Aktif" ? "active" : "passive"
                    }`}
                  >
                    {item.durum || "Pasif"}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="dy-detail-btn"
                    onClick={() => setSecilenDanisan(item)}
                  >
                    <FiEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {secilenDanisan && (
        <div className="dy-detail-card">
          <div className="dy-detail-header">
            <div>
              <p>Danışan Detayı</p>
              <h3>{secilenDanisan.fullName}</h3>
            </div>

            <button type="button" onClick={() => setSecilenDanisan(null)}>✕</button>
          </div>

          <div className="dy-detail-grid">
            <p>
              <strong>Yaş</strong>
              <br />
              {secilenDanisan.yas || "-"}
            </p>

            <p>
              <strong>Boy</strong>
              <br />
              {secilenDanisan.boy ? `${secilenDanisan.boy} cm` : "-"}
            </p>

            <p>
              <strong>Kilo</strong>
              <br />
              {secilenDanisan.kilo ? `${secilenDanisan.kilo} kg` : "-"}
            </p>

            <p>
              <strong>Hedef</strong>
              <br />
              {secilenDanisan.hedef ? `${secilenDanisan.hedef} kg` : "-"}
            </p>

            <p>
              <strong>BMI</strong>
              <br />
              {bmiHesapla(secilenDanisan.kilo, secilenDanisan.boy)}
            </p>

            <p>
              <strong>Alerji</strong>
              <br />
              {secilenDanisan.alerji || "Yok"}
            </p>

            <p>
              <strong>Hastalık</strong>
              <br />
              {secilenDanisan.hastalik || "Yok"}
            </p>

            <p>
              <strong>Durum</strong>
              <br />
              {secilenDanisan.durum || "-"}
            </p>

            <p>
              <strong>Kullanılan İlaçlar</strong>
              <br />
              {secilenDanisan.ilaclar || "Kullanılan ilaç bilgisi yok"}
            </p>

            <p>
              <strong>Kan Değerleri</strong>
              <br />

              {secilenDanisan.bloodReport?.exists ? (
  <button
    type="button"
    className="dy-file-btn"
    onClick={() => kanDosyasiAc(secilenDanisan.bloodReport.downloadUrl)}
    title={secilenDanisan.bloodReport.fileName}
  >
    <FiFileText />
    Dosyayı İndir
  </button>
) : (
  "Dosya yüklenmemiş"
)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Danisanlar;
