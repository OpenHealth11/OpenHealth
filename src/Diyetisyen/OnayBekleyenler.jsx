import { useState, useEffect } from "react";
import { 
  FiCheckCircle, 
  FiXCircle, 
  FiClock, 
  FiUser, 
  FiInbox, 
  FiMessageSquare 
} from "react-icons/fi";

function OnayBekleyenler() {
  const [talepler, setTalepler] = useState([]);
  const [loading, setLoading] = useState(true);

  // SENİN ORİJİNAL VERİ ÇEKME KODUN (Değiştirilmedi)
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3001/api/diyetisyen/requests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setTalepler(data.requests || []);
      } catch (err) {
        console.error("Talepler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // SENİN ORİJİNAL ONAYLAMA KODUN
  const onaylaTalep = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3001/api/diyetisyen/requests/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ekrandan kaldır
      setTalepler((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Onaylama hatası:", err);
    }
  };

  // SENİN ORİJİNAL REDDETME KODUN
  const reddetTalep = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:3001/api/diyetisyen/requests/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTalepler((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Reddetme hatası:", err);
    }
  };

  // TASARIM STİLLERİ
  const styles = {
    // EN KRİTİK KISIM: marginLeft: "280px" sayfanın menünün altında kalmasını engeller
    page: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", marginLeft: "280px", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" },
    headerCard: { backgroundColor: "white", padding: "24px 30px", borderRadius: "20px", marginBottom: "25px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" },
    card: { backgroundColor: "white", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" },
    listItem: { backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "15px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.2s" },
    
    // BUTON STİLLERİ
    btnApprove: { backgroundColor: "#e6f4ea", color: "#1e4d3b", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" },
    btnReject: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" },
    
    emptyState: { textAlign: "center", padding: "50px 20px", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "16px", border: "2px dashed #e2e8f0" }
  };

  return (
    <div style={styles.page}>
      
      {/* ÜST BAŞLIK */}
      <div style={styles.headerCard}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiCheckCircle color="#39d373" /> Onay Bekleyenler
        </h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>
          Danışanlarınızdan gelen talepleri buradan inceleyebilir, onaylayabilir veya reddedebilirsiniz.
        </p>
      </div>

      {/* LİSTE KARTI */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMessageSquare color="#64748b" /> Gelen Talepler
        </h3>

        <div>
          {loading ? (
            <div style={styles.emptyState}>
              <p>Talepler yükleniyor...</p>
            </div>
          ) : talepler.length === 0 ? (
            <div style={styles.emptyState}>
              <FiInbox size={40} color="#cbd5e1" style={{ marginBottom: "15px" }} />
              <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>Bekleyen talep yok.</h4>
              <p style={{ margin: 0, fontSize: "14px" }}>Şu an için onayınızı bekleyen yeni bir işlem bulunmuyor.</p>
            </div>
          ) : (
            talepler.map((item) => (
              <div 
                style={styles.listItem} 
                key={item.id}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#39d373"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                {/* SOL TARAF: İÇERİK */}
                <div style={{ flex: 1, paddingRight: "20px" }}>
                  <strong style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "16px", color: "#1e4d3b", marginBottom: "8px" }}>
                    <FiUser /> {item.danisanAdi}
                  </strong>
                  <p style={{ margin: "0 0 8px 0", fontSize: "15px", color: "#1e293b", lineHeight: "1.5" }}>
                    {item.talep}
                  </p>
                  <small style={{ display: "flex", alignItems: "center", gap: "5px", color: "#64748b", fontSize: "12px", fontWeight: "600" }}>
                    <FiClock /> {item.tarih || "Tarih belirtilmedi"}
                  </small>
                </div>

                {/* SAĞ TARAF: BUTONLAR */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    style={styles.btnApprove}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#d1fae5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e6f4ea"}
                    onClick={() => onaylaTalep(item.id)}
                  >
                    <FiCheckCircle size={16} /> Onayla
                  </button>
                  <button
                    style={styles.btnReject}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                    onClick={() => reddetTalep(item.id)}
                  >
                    <FiXCircle size={16} /> Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OnayBekleyenler;