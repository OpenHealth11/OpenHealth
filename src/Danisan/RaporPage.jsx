import React from "react";
import { FiTrendingDown, FiDroplet, FiZap, FiTarget, FiPieChart } from "react-icons/fi";

function RaporPage({ rapor }) {
  // Eğer veri yoksa koruma ekleyelim
  if (!rapor) return <div className="page">Yükleniyor...</div>;

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      
      {/* Üst Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>Haftalık Analiz</h2>
          <p style={{ color: "#64748b", margin: "5px 0 0 0", fontWeight: "500" }}>
            Son 7 günlük performansının özeti.
          </p>
        </div>
        <div style={{ backgroundColor: "white", padding: "10px 20px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiPieChart color="#10b981" />
          <span style={{ fontWeight: "700", color: "#1e4d3b", fontSize: "14px" }}>20 - 27 Nisan 2026</span>
        </div>
      </div>

      {/* İstatistik Kartları (Grid) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "25px" }}>
        
        {/* Kalori Kartı */}
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Ortalama Kalori</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.ortalamaKalori} <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>kcal</span></p>
            </div>
            <div style={{ backgroundColor: "#fef3c7", padding: "12px", borderRadius: "14px", color: "#f59e0b" }}>
              <FiZap size={24} />
            </div>
          </div>
        </div>

        {/* Su Ortalaması */}
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #0ea5e9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Su Ortalaması</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.suOrtalama} <span style={{ fontSize: "14px", fontWeight: "600", color: "#94a3b8" }}>Bardak</span></p>
            </div>
            <div style={{ backgroundColor: "#e0f2fe", padding: "12px", borderRadius: "14px", color: "#0ea5e9" }}>
              <FiDroplet size={24} />
            </div>
          </div>
        </div>

        {/* Kilo Değişimi */}
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #ef4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Kilo Değişimi</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>{rapor.kiloDegisim}</p>
            </div>
            <div style={{ backgroundColor: "#fee2e2", padding: "12px", borderRadius: "14px", color: "#ef4444" }}>
              <FiTrendingDown size={24} />
            </div>
          </div>
        </div>

        {/* Uyum Oranı */}
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", borderLeft: "6px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <h3 style={{ fontSize: "14px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Programa Uyum</h3>
              <p style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>%{rapor.uyumOrani}</p>
            </div>
            <div style={{ backgroundColor: "#dcfce7", padding: "12px", borderRadius: "14px", color: "#10b981" }}>
              <FiTarget size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* Alt Bilgi - Diyetisyen Notu Alanı (Ekstra Şıklık) */}
      <div style={{ 
        marginTop: "30px", 
        padding: "25px", 
        backgroundColor: "white", 
        borderRadius: "24px", 
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "20px"
      }}>
        <div style={{ minWidth: "50px", height: "50px", backgroundColor: "#f1f5f9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#1e4d3b" }}>
          D
        </div>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>
          "Harika bir hafta geçirdin! Kilo değişimindeki istikrarın çok iyi. Önümüzdeki hafta su tüketimini biraz daha artırabiliriz."
        </p>
      </div>

    </div>
  );
}

export default RaporPage;