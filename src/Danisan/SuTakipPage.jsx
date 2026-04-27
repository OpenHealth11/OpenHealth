import React from "react";

function SuTakipPage({ water, addWater, removeWater }) {
  // Yüzdeyi hesapla, ancak barın tasarımını bozmaması için maksimum %100'de sınırla
  const yuzde = Math.min(Math.round((water.icilen / water.hedef) * 100), 100);
  // Gerçek yüzdeyi metin olarak göstermek için (Örn: %110 tamamlandı)
  const gercekYuzde = Math.round((water.icilen / water.hedef) * 100);

  return (
    <div style={{ padding: "10px", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* Üst Başlık Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "28px", color: "#1f2937", margin: 0, fontWeight: "800" }}>
          Su Takibi
        </h2>
        <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          💧 Hedefine Ulaş
        </span>
      </div>

      {/* Ana Su Kartı */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "40px 20px",
        borderRadius: "32px",
        boxShadow: "0 15px 35px rgba(14, 165, 233, 0.08)", // Su mavisi hafif gölge
        borderTop: "8px solid #0ea5e9",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        
        {/* Damla İkonu */}
        <div style={{ fontSize: "64px", marginBottom: "10px", textShadow: "0 10px 20px rgba(14, 165, 233, 0.3)" }}>
          💧
        </div>
        
        <h3 style={{ fontSize: "22px", color: "#1f2937", marginBottom: "30px", fontWeight: "800" }}>
          Bugünkü Su Tüketimi
        </h3>

        {/* Sayaç */}
        <div style={{ fontSize: "56px", fontWeight: "900", color: "#0ea5e9", marginBottom: "24px" }}>
          {water.icilen} <span style={{ fontSize: "24px", color: "#94a3b8", fontWeight: "600" }}>/ {water.hedef} brdk</span>
        </div>

        {/* İlerleme Çubuğu */}
        <div style={{ width: "100%", maxWidth: "500px", height: "24px", backgroundColor: "#f1f5f9", borderRadius: "20px", overflow: "hidden", marginBottom: "16px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
          <div style={{
            width: `${yuzde}%`,
            height: "100%",
            background: "linear-gradient(90deg, #38bdf8, #0284c7)", // Harika bir açık maviden koyu maviye geçiş
            borderRadius: "20px",
            transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
          }} />
        </div>

        {/* Yüzde Metni ve Tebrik Mesajı */}
        <p style={{ margin: "0 0 40px 0", fontSize: "16px", color: "#64748b", fontWeight: "600" }}>
          %{gercekYuzde} tamamlandı {gercekYuzde >= 100 && <span style={{ color: "#10b981" }}>🎉 Harikasın!</span>}
        </p>

        {/* Butonlar */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
          
          {/* Eksi Butonu */}
          <button
            onClick={removeWater}
            disabled={water.icilen === 0}
            style={{
              padding: "16px 24px",
              fontSize: "18px",
              fontWeight: "700",
              color: water.icilen === 0 ? "#94a3b8" : "#ef4444",
              backgroundColor: water.icilen === 0 ? "#f1f5f9" : "#fef2f2",
              border: "none",
              borderRadius: "20px",
              cursor: water.icilen === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { if(water.icilen > 0) { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.backgroundColor = "#fee2e2"; }}}
            onMouseLeave={(e) => { if(water.icilen > 0) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.backgroundColor = "#fef2f2"; }}}
          >
            ➖ 1
          </button>

          {/* Artı Butonu */}
          <button
            onClick={addWater}
            style={{
              padding: "16px 40px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#ffffff",
              backgroundColor: "#0ea5e9",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 8px 20px rgba(14, 165, 233, 0.3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.backgroundColor = "#0284c7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.backgroundColor = "#0ea5e9"; }}
          >
            ➕ 1 Bardak
          </button>

        </div>
      </div>
    </div>
  );
}

export default SuTakipPage;