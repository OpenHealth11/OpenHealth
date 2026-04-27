import { useState, useEffect } from "react";
import { FiUsers } from "react-icons/fi"; 

function DiyetisyenDashboard() {
  const [danisanlar, setDanisanlar] = useState([]);
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
  const pasifDanisan = danisanlar.filter((d) => d.durum !== "Aktif").length;

  // TASARIM STİLLERİ
  const styles = {
    page: { 
      padding: "30px", 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      marginLeft: "280px", // İŞTE BURAYI GERİ EKLEDİK! Sayfa artık barın altına girmeyecek.
      boxSizing: "border-box" 
    },
    welcomeBar: {
      backgroundColor: "white",
      padding: "20px 30px",
      borderRadius: "20px",
      marginBottom: "25px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      border: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    hero: {
      backgroundColor: "#1e4d3b",
      borderRadius: "24px",
      padding: "40px",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "30px"
    },
    statGrid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(4, 1fr)", 
      gap: "20px", 
      marginBottom: "30px" 
    },
    card: { 
      backgroundColor: "white", 
      padding: "24px", 
      borderRadius: "20px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)", 
      border: "1px solid #f1f5f9" 
    },
    emptyState: { 
      textAlign: "center", 
      padding: "50px 20px", 
      color: "#64748b", 
      backgroundColor: "#f8fafc", 
      borderRadius: "20px", 
      border: "2px dashed #e2e8f0" 
    }
  };

  const bugun = new Date().toLocaleDateString('tr-TR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div style={styles.page}>
      
      {/* HOŞ GELDİN BARI */}
      <div style={styles.welcomeBar}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>
            Hoş geldiniz, Dyt. Merve 👋
          </h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>
            Bugün danışanlarınızı takip etmek için harika bir gün!
          </p>
        </div>
        <div style={{ backgroundColor: "#e6f4ea", color: "#1e4d3b", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", fontSize: "14px" }}>
          {bugun}
        </div>
      </div>

      {/* YEŞİL BANNER */}
      <div style={styles.hero}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", opacity: 0.7, margin: 0 }}>Genel Durum</p>
          <h2 style={{ fontSize: "32px", margin: "10px 0", fontWeight: "800" }}>Bugünkü danışan durum özeti</h2>
          <p style={{ opacity: 0.8, maxWidth: "500px", fontSize: "15px" }}>
            Verilerinizi buradan takip edebilir ve hızlı aksiyonlar alabilirsiniz.
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", padding: "25px", borderRadius: "20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.2)" }}>
          <h2 style={{ fontSize: "40px", margin: 0 }}>{toplamDanisan}</h2>
          <p style={{ margin: 0, fontSize: "12px", fontWeight: "600" }}>Toplam Danışan</p>
        </div>
      </div>

      {/* 4'LÜ KUTUCUKLAR */}
      <div style={styles.statGrid}>
        <div style={styles.card}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Aktif Danışan</span>
          <h3 style={{ fontSize: "28px", color: "#1e4d3b", margin: "10px 0 0 0" }}>{aktifDanisan}</h3>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Pasif Danışan</span>
          <h3 style={{ fontSize: "28px", color: "#1e4d3b", margin: "10px 0 0 0" }}>{pasifDanisan}</h3>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Aktif Plan</span>
          <h3 style={{ fontSize: "28px", color: "#1e4d3b", margin: "10px 0 0 0" }}>{toplamDanisan}</h3>
        </div>
        <div style={styles.card}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Bugünkü Kayıt</span>
          <h3 style={{ fontSize: "28px", color: "#1e4d3b", margin: "10px 0 0 0" }}>0</h3>
        </div>
      </div>

      {/* DANIŞAN KARTLARI BAŞLIĞI VE LİSTESİ */}
      <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>Danışan Kartları</h3>
      
      {/* EĞER DANIŞAN YOKSA BOŞ DURUM EKRANI ÇIKACAK */}
      {danisanlar.length === 0 ? (
        <div style={styles.emptyState}>
          <FiUsers size={45} color="#cbd5e1" style={{ marginBottom: "15px" }} />
          <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>Henüz kayıtlı danışanınız bulunmuyor</h4>
          <p style={{ margin: 0, fontSize: "14px" }}>Sisteme yeni bir danışan eklendiğinde, sağlık profili burada kart olarak görünecektir.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
          {danisanlar.map((d) => (
            <div key={d.id} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
                <div style={{ width: "45px", height: "45px", background: "#39d373", color: "#1e4d3b", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", marginRight: "12px" }}>
                  {d.fullName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px" }}>{d.fullName}</h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{d.yas} Yaş • {d.durum}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "15px", textAlign: "center" }}>
                <div><small style={{ fontSize: "10px", color: "#64748b", fontWeight: "700" }}>KİLO</small><br /><strong style={{ color: "#1e4d3b" }}>{d.kilo}</strong></div>
                <div><small style={{ fontSize: "10px", color: "#64748b", fontWeight: "700" }}>HEDEF</small><br /><strong style={{ color: "#1e4d3b" }}>{d.hedef}</strong></div>
                <div><small style={{ fontSize: "10px", color: "#64748b", fontWeight: "700" }}>FARK</small><br /><strong style={{ color: "#1e4d3b" }}>{Math.abs(d.kilo - d.hedef).toFixed(1)}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DiyetisyenDashboard;