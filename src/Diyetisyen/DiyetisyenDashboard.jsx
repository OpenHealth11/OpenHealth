import { useState, useEffect } from "react";
import { FiUsers, FiUserCheck, FiFileText, FiActivity, FiArrowRight } from "react-icons/fi";

function DiyetisyenDashboard() {
  const [danisanlar, setDanisanlar] = useState([]);
  const [planlar, setPlanlar] = useState([]);
  const [gunlukKayitlar, setGunlukKayitlar] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/api/diyetisyen/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDanisanlar(data.clients || []);
      } catch (err) {
        console.error("Dashboard veri hatası:", err);
      }
    };
    fetchData();
  }, []);

  const toplamDanisan = danisanlar.length;
  const aktifDanisan = danisanlar.filter((d) => d.durum === "Aktif").length;
  const aktifPlan = planlar.filter((p) => p.durum === "Aktif").length;

  const takipGerekenler = danisanlar.filter(
    (d) => d.durum === "Pasif" || Math.abs(Number(d.kilo) - Number(d.hedef)) >= 8
  );

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    border: "1px solid #f1f5f9"
  };

  const statIconStyle = {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    marginBottom: "10px"
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(135deg, #1e4d3b 0%, #2d5a4a 100%)", 
        padding: "40px", 
        borderRadius: "30px", 
        color: "white", 
        marginBottom: "30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 10px 0" }}>Hoş Geldiniz, Dyt. Mustafa</h2>
          <p style={{ opacity: 0.8, fontSize: "16px", margin: 0 }}>Danışanlarınızın bugünkü durumunu inceleyin.</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "48px", fontWeight: "800", display: "block" }}>{toplamDanisan}</span>
          <p style={{ margin: 0, opacity: 0.7, textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>Toplam Danışan</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={cardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: "#ecfdf5", color: "#10b981" }}><FiUsers /></div>
          <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Aktif Danışan</span>
          <strong style={{ fontSize: "26px", color: "#1e293b" }}>{aktifDanisan}</strong>
        </div>

        <div style={cardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: "#fef2f2", color: "#ef4444" }}><FiActivity /></div>
          <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Takip Bekleyen</span>
          <strong style={{ fontSize: "26px", color: "#1e293b" }}>{takipGerekenler.length}</strong>
        </div>

        <div style={cardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: "#eff6ff", color: "#3b82f6" }}><FiFileText /></div>
          <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Aktif Plan</span>
          <strong style={{ fontSize: "26px", color: "#1e293b" }}>{aktifPlan}</strong>
        </div>

        <div style={cardStyle}>
          <div style={{ ...statIconStyle, backgroundColor: "#fdf4ff", color: "#a855f7" }}><FiUserCheck /></div>
          <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "600" }}>Günlük Kayıt</span>
          <strong style={{ fontSize: "26px", color: "#1e293b" }}>{gunlukKayitlar.length}</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "25px" }}>
        {/* Liste Paneli */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
            Öncelikli Takip Gerekenler
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {takipGerekenler.length === 0 ? (
              <p style={{ color: "#94a3b8", padding: "20px", textAlign: "center" }}>Şu an kritik bir durum bulunmuyor.</p>
            ) : (
              takipGerekenler.slice(0, 5).map((d) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", backgroundColor: "#f8fafc", borderRadius: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "35px", height: "35px", backgroundColor: "#e2e8f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>{d.fullName[0]}</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{d.fullName}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{d.kilo} kg / Hedef: {d.hedef} kg</p>
                    </div>
                  </div>
                  <FiArrowRight style={{ color: "#cbd5e1" }} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Aksiyon Paneli */}
        <div style={{ ...cardStyle, background: "#4ade80", border: "none", justifyContent: "center", textAlign: "center", color: "#064e3b" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}>Hızlı Aksiyon</h3>
          <p style={{ fontSize: "15px", opacity: 0.9, marginBottom: "20px" }}>Bekleyen yeni danışan taleplerini hemen inceleyin.</p>
          <button style={{ 
            padding: "14px", 
            borderRadius: "15px", 
            border: "none", 
            backgroundColor: "#1e4d3b", 
            color: "white", 
            fontWeight: "700",
            cursor: "pointer"
          }}>Talepleri Gör</button>
        </div>
      </div>
    </div>
  );
}

export default DiyetisyenDashboard;