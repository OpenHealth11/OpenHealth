import { FiBell, FiBellOff, FiClock, FiInfo } from "react-icons/fi";

function Bildirimler({ bildirimler = [] }) {
  
  // TASARIM STİLLERİ (Bozulmaz Satır İçi Stiller)
  const styles = {
    page: { 
      padding: "30px", 
      backgroundColor: "#f8fafc", 
      minHeight: "100vh", 
      marginLeft: "280px", // Diğer sayfalarla uyumlu hizalama
      boxSizing: "border-box", 
      fontFamily: "'Inter', sans-serif" 
    },
    headerCard: { 
      backgroundColor: "white", 
      padding: "24px 30px", 
      borderRadius: "20px", 
      marginBottom: "25px", 
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)", 
      border: "1px solid #f1f5f9" 
    },
    card: { 
      backgroundColor: "white", 
      padding: "25px", 
      borderRadius: "24px", 
      boxShadow: "0 4px 15px rgba(0,0,0,0.03)", 
      border: "1px solid #f1f5f9" 
    },
    listItem: { 
      backgroundColor: "#f8fafc", 
      padding: "20px", 
      borderRadius: "16px", 
      marginBottom: "15px", 
      border: "1px solid #e2e8f0", 
      display: "flex", 
      alignItems: "center", // İkon ve metni ortalar
      gap: "15px", 
      transition: "0.2s" 
    },
    iconWrapper: { 
      width: "45px", 
      height: "45px", 
      borderRadius: "14px", 
      backgroundColor: "#e6f4ea", 
      color: "#1e4d3b", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      flexShrink: 0 
    },
    emptyState: { 
      textAlign: "center", 
      padding: "60px 20px", 
      color: "#64748b", 
      backgroundColor: "#f8fafc", 
      borderRadius: "16px", 
      border: "2px dashed #e2e8f0" 
    }
  };

  return (
    <div style={styles.page}>
      
      {/* ÜST BAŞLIK */}
      <div style={styles.headerCard}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiBell color="#39d373" /> Bildirimler
        </h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>
          Sistem uyarıları, talep onayları ve önemli güncellemeleri buradan takip edin.
        </p>
      </div>

      {/* BİLDİRİM LİSTESİ */}
      <div style={styles.card}>
        {bildirimler.length === 0 ? (
          <div style={styles.emptyState}>
            <FiBellOff size={45} color="#cbd5e1" style={{ marginBottom: "15px" }} />
            <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>Henüz bildiriminiz yok.</h4>
            <p style={{ margin: 0, fontSize: "14px" }}>Yeni bir gelişme veya onaylanan bir işlem olduğunda burada görebileceksiniz.</p>
          </div>
        ) : (
          <div>
            {bildirimler.map((item, index) => (
              <div 
                key={item.id || index} 
                style={styles.listItem}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#39d373"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                {/* BİLDİRİM İKONU */}
                <div style={styles.iconWrapper}>
                  <FiInfo size={22} />
                </div>
                
                {/* BİLDİRİM METNİ VE SAATİ */}
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "16px", color: "#1e293b", marginBottom: "6px" }}>
                    {item.mesaj}
                  </strong>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                    <FiClock /> {item.saat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Bildirimler;