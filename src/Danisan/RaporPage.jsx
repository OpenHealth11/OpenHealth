import React from "react";

function RaporPage({ rapor }) {
  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Üst Başlık Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "#1f2937", margin: "0 0 8px 0", fontWeight: "800" }}>
            Haftalık Rapor
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "15px", fontWeight: "500" }}>
            Son 7 günlük performansının özeti ve istatistikleri.
          </p>
        </div>
        <span style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          📊 Haftalık Analiz
        </span>
      </div>

      {/* Rapor Kartları Grid Yapısı */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
        
        {/* Ortalama Kalori Kartı */}
        <div 
          style={{ backgroundColor: "#ffffff", padding: "30px 24px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px", transition: "transform 0.2s", borderBottom: "6px solid #f59e0b" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-6px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#fffbeb", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🔥</div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Ortalama Kalori</h3>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
              {rapor.ortalamaKalori} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: "600" }}>kcal</span>
            </div>
          </div>
        </div>

        {/* Su Ortalaması Kartı */}
        <div 
          style={{ backgroundColor: "#ffffff", padding: "30px 24px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px", transition: "transform 0.2s", borderBottom: "6px solid #0ea5e9" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-6px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#e0f2fe", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>💧</div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Su Ortalaması</h3>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
              {rapor.suOrtalama} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: "600" }}>bardak</span>
            </div>
          </div>
        </div>

        {/* Kilo Değişimi Kartı */}
        <div 
          style={{ backgroundColor: "#ffffff", padding: "30px 24px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px", transition: "transform 0.2s", borderBottom: "6px solid #8b5cf6" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-6px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#f3e8ff", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>⚖️</div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Kilo Değişimi</h3>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
              {rapor.kiloDegisim}
            </div>
          </div>
        </div>

        {/* Uyum Oranı Kartı */}
        <div 
          style={{ backgroundColor: "#ffffff", padding: "30px 24px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px", transition: "transform 0.2s", borderBottom: "6px solid #10b981" }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-6px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "56px", height: "56px", backgroundColor: "#ecfdf5", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>🎯</div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#64748b", fontWeight: "600" }}>Programa Uyum</h3>
            <div style={{ fontSize: "36px", fontWeight: "800", color: "#10b981" }}>
              {rapor.uyumOrani}
            </div>
          </div>
        </div>

      </div>

      {/* Motivasyon Kutusu */}
      <div style={{ marginTop: "40px", padding: "30px", backgroundColor: "#f8fafc", borderRadius: "24px", border: "2px dashed #cbd5e1", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ fontSize: "56px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" }}>🏆</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "#1e293b", fontWeight: "800" }}>Harika İlerliyorsun!</h4>
          <p style={{ margin: 0, color: "#475569", fontSize: "16px", lineHeight: "1.6", fontWeight: "500" }}>
            Haftalık istatistiklerine göre programına genel olarak sadık kalıyorsun. Suyunu içmeyi ihmal etme ve aynı disiplinle yoluna devam et. Başarı yakında!
          </p>
        </div>
      </div>
      
    </div>
  );
}

export default RaporPage;