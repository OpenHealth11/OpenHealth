import { useState, useEffect } from "react";

function Danisanlar() {
  const [arama, setArama] = useState("");
  const [secilenDanisan, setSecilenDanisan] = useState(null);
  const [danisanlar, setDanisanlar] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/diyetisyen/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // TASARIM STİLLERİ (Bozulmaz Satır İçi Stiller)
  const styles = {
    page: {
      padding: "30px",
      backgroundColor: "#f8fafc",
      minHeight: "100vh",
      marginLeft: "280px", // Sidebar hizanı korur
      boxSizing: "border-box",
      fontFamily: "'Inter', sans-serif"
    },
    headerCard: {
      backgroundColor: "white",
      padding: "24px 30px",
      borderRadius: "20px",
      marginBottom: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      border: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    searchInput: {
      padding: "12px 20px",
      width: "300px",
      borderRadius: "14px",
      border: "1px solid #e2e8f0",
      backgroundColor: "#f8fafc",
      fontSize: "14px",
      outline: "none",
      transition: "0.2s"
    },
    tableCard: {
      backgroundColor: "white",
      padding: "20px",
      borderRadius: "24px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
      border: "1px solid #f1f5f9",
      overflowX: "auto",
      marginBottom: "25px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      textAlign: "left"
    },
    th: {
      padding: "15px",
      color: "#64748b",
      fontSize: "12px",
      fontWeight: "700",
      textTransform: "uppercase",
      borderBottom: "2px solid #f1f5f9"
    },
    td: {
      padding: "16px 15px",
      borderBottom: "1px solid #f8fafc",
      fontSize: "14px",
      color: "#1e293b",
      fontWeight: "500"
    },
    btnPrimary: {
      backgroundColor: "#39d373",
      color: "#1e4d3b",
      border: "none",
      padding: "8px 16px",
      borderRadius: "10px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "13px",
      transition: "0.2s"
    },
    btnSecondary: {
      backgroundColor: "#f1f5f9",
      color: "#64748b",
      border: "none",
      padding: "10px 20px",
      borderRadius: "12px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "20px"
    },
    statusActive: {
      backgroundColor: "#e6f4ea",
      color: "#1e4d3b",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "700"
    },
    statusPassive: {
      backgroundColor: "#f1f5f9",
      color: "#64748b",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "700"
    },
    detailGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "15px",
      marginTop: "15px"
    },
    detailBox: {
      backgroundColor: "#f8fafc",
      padding: "15px",
      borderRadius: "16px",
      textAlign: "center"
    }
  };

  return (
    <div style={styles.page}>
      {/* ÜST BAR VE ARAMA ALANI */}
      <div style={styles.headerCard}>
        <div>
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>Danışan Listesi</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>Tüm danışanlarınızı buradan yönetebilirsiniz.</p>
        </div>
        <div>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="🔍 İsim ile danışan ara..."
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            onFocus={(e) => e.target.style.border = "1px solid #39d373"}
            onBlur={(e) => e.target.style.border = "1px solid #e2e8f0"}
          />
        </div>
      </div>

      {/* DANIŞAN DETAY KARTI (Eğer biri seçildiyse tablonun üstünde şık bir şekilde görünür) */}
      {secilenDanisan && (
        <div style={{ ...styles.tableCard, backgroundColor: "#1e4d3b", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#39d373" }}>{secilenDanisan.fullName}</h3>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>Profil ve Sağlık Detayları</p>
            </div>
            <span style={secilenDanisan.durum === "Aktif" ? styles.statusActive : styles.statusPassive}>
              {secilenDanisan.durum}
            </span>
          </div>

          <div style={styles.detailGrid}>
            <div style={styles.detailBox}>
              <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700" }}>YAŞ / BOY</small>
              <div style={{ color: "#1e293b", fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{secilenDanisan.yas} / {secilenDanisan.boy}cm</div>
            </div>
            <div style={styles.detailBox}>
              <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700" }}>KİLO / HEDEF</small>
              <div style={{ color: "#1e293b", fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{secilenDanisan.kilo}kg / {secilenDanisan.hedef}kg</div>
            </div>
            <div style={styles.detailBox}>
              <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700" }}>VÜCUT KİTLE İNDEKSİ (BMI)</small>
              <div style={{ color: "#1e293b", fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{bmiHesapla(secilenDanisan.kilo, secilenDanisan.boy)}</div>
            </div>
            <div style={styles.detailBox}>
              <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700" }}>SON GÖRÜŞME</small>
              <div style={{ color: "#1e293b", fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{secilenDanisan.sonGorusme || "Kayıt Yok"}</div>
            </div>
          </div>

          <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "16px" }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px" }}><strong style={{ color: "#39d373" }}>Alerji:</strong> {secilenDanisan.alerji || "Belirtilmemiş"}</p>
            <p style={{ margin: 0, fontSize: "13px" }}><strong style={{ color: "#39d373" }}>Hastalık:</strong> {secilenDanisan.hastalik || "Belirtilmemiş"}</p>
          </div>

          <button 
            style={{ ...styles.btnSecondary, width: "100%", backgroundColor: "rgba(255,255,255,0.1)", color: "white" }} 
            onClick={() => setSecilenDanisan(null)}
          >
            Detayı Kapat
          </button>
        </div>
      )}

      {/* TABLO ALANI */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Ad Soyad</th>
              <th style={styles.th}>Yaş</th>
              <th style={styles.th}>Boy / Kilo</th>
              <th style={styles.th}>Hedef</th>
              <th style={styles.th}>BMI</th>
              <th style={styles.th}>Durum</th>
              <th style={styles.th}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtreliDanisanlar.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                  Aramanıza uygun danışan bulunamadı.
                </td>
              </tr>
            ) : (
              filtreliDanisanlar.map((item) => (
                <tr key={item.id} style={{ transition: "0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}>
                  <td style={styles.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "35px", height: "35px", backgroundColor: "#e2e8f0", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#64748b", fontSize: "12px" }}>
                        {item.fullName.charAt(0)}
                      </div>
                      {item.fullName}
                    </div>
                  </td>
                  <td style={styles.td}>{item.yas}</td>
                  <td style={styles.td}>{item.boy} cm / {item.kilo} kg</td>
                  <td style={styles.td}><strong>{item.hedef} kg</strong></td>
                  <td style={styles.td}>{bmiHesapla(item.kilo, item.boy)}</td>
                  <td style={styles.td}>
                    <span style={item.durum === "Aktif" ? styles.statusActive : styles.statusPassive}>
                      {item.durum}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.btnPrimary}
                      onClick={() => setSecilenDanisan(item)}
                      onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                      onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Danisanlar;