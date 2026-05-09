import { useState, useEffect } from "react";
import { FiSearch, FiUser, FiInfo, FiX } from "react-icons/fi";

function Danisanlar() {
  const [arama, setArama] = useState("");
  const [secilenDanisan, setSecilenDanisan] = useState(null);
  const [danisanlar, setDanisanlar] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/diyetisyen/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDanisanlar(data.clients || []);
      } catch (err) {
        console.error("Danışanlar alınamadı:", err);
      }
    };
    fetchClients();
  }, []);

  function bmiHesapla(kilo, boy) {
    if (!kilo || !boy) return "-";
    const metre = boy / 100;
    return (kilo / (metre * metre)).toFixed(1);
  }

  const filtreliDanisanlar = danisanlar.filter((item) =>
    item.fullName.toLowerCase().includes(arama.toLowerCase())
  );

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    border: "none"
  };

  return (
    /* GÜNCELLEME: marginLeft ve minHeight kaldırıldı, genişlik %100 yapıldı */
    <div style={{ width: "100%" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e4d3b", marginBottom: "30px" }}>
        Danışan Listesi
      </h2>

      {/* Arama Alanı */}
      <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "15px", padding: "15px 25px" }}>
        <FiSearch style={{ color: "#94a3b8", fontSize: "20px" }} />
        <input
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "16px",
            color: "#1e293b",
            backgroundColor: "transparent"
          }}
          type="text"
          placeholder="Danışan adı ile arama yapın..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      {/* Tablo Kartı */}
      <div style={{ ...cardStyle, padding: "10px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Danışan</th>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Boy/Kilo</th>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>BMI</th>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Hedef</th>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>Durum</th>
              <th style={{ padding: "20px", color: "#64748b", fontWeight: "600", fontSize: "14px" }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtreliDanisanlar.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", backgroundColor: "#ecfdf5", color: "#10b981", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                      {item.fullName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{item.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{item.yas} Yaş</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "20px", fontSize: "14px", color: "#475569" }}>
                  {item.boy}cm / {item.kilo}kg
                </td>
                <td style={{ padding: "20px" }}>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "4px 8px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" }}>
                    {bmiHesapla(item.kilo, item.boy)}
                  </span>
                </td>
                <td style={{ padding: "20px", fontWeight: "600", color: "#10b981" }}>{item.hedef} kg</td>
                <td style={{ padding: "20px" }}>
                  <span style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    backgroundColor: item.durum === "Aktif" ? "#dcfce7" : "#fee2e2",
                    color: item.durum === "Aktif" ? "#166534" : "#991b1b"
                  }}>
                    {item.durum}
                  </span>
                </td>
                <td style={{ padding: "20px" }}>
                  <button
                    onClick={() => setSecilenDanisan(item)}
                    style={{
                      border: "none",
                      backgroundColor: "#1e4d3b",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px"
                    }}
                  >
                    <FiInfo /> Detay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detay Modal */}
      {secilenDanisan && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "500px", position: "relative", margin: "20px" }}>
            <button 
              onClick={() => setSecilenDanisan(null)}
              style={{ position: "absolute", right: "20px", top: "20px", border: "none", background: "none", cursor: "pointer", fontSize: "20px" }}
            >
              <FiX />
            </button>
            
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <div style={{ width: "80px", height: "80px", backgroundColor: "#4ade80", color: "#1e4d3b", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "800", margin: "0 auto 15px" }}>
                {secilenDanisan.fullName[0]}
              </div>
              <h3 style={{ margin: 0 }}>{secilenDanisan.fullName}</h3>
              <p style={{ color: "#64748b" }}>Danışan Detay Bilgileri</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", fontSize: "14px" }}>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                <strong>Alerjiler:</strong> <br/> {secilenDanisan.alerji || "Yok"}
              </div>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                <strong>Hastalıklar:</strong> <br/> {secilenDanisan.hastalik || "Yok"}
              </div>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                <strong>Son Görüşme:</strong> <br/> {secilenDanisan.sonGorusme || "-"}
              </div>
              <div style={{ padding: "12px", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                <strong>Cinsiyet:</strong> <br/> {secilenDanisan.cinsiyet || "Belirtilmemiş"}
              </div>
            </div>

            <button
              style={{ width: "100%", marginTop: "25px", padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#f1f5f9", fontWeight: "700", cursor: "pointer" }}
              onClick={() => setSecilenDanisan(null)}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Danisanlar;