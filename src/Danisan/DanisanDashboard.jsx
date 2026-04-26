import React from "react";
import { 
  FiActivity, 
  FiDroplet, 
  FiTrendingUp, 
  FiTarget, 
  FiClock, 
  FiPlusSquare, 
  FiCheckCircle 
} from "react-icons/fi";

function DanisanDashboard({ data }) {
  // Toplam kaloriyi hesapla
  const toplamKalori = data.gunlukKayitlar.reduce(
    (total, item) => total + item.kalori,
    0
  );

  // Su içme yüzdesini hesapla (progress bar için)
  const suYuzdesi = Math.min((data.water.icilen / data.water.hedef) * 100, 100);

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "25px", fontWeight: "800", color: "#1e4d3b" }}>Genel Bakış</h2>

      {/* Üst Kartlar: Özet Bilgiler */}
      <div className="stats-grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        
        {/* Kalori Kartı */}
        <div className="card stat-card" style={{ borderBottom: "5px solid #f59e0b", padding: "20px", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
            <FiActivity color="#f59e0b" size={18} /> GÜNLÜK KALORİ
          </div>
          <p style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0", color: "#1e4d3b" }}>
            {toplamKalori} <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "400" }}>kcal</span>
          </p>
        </div>

        {/* Su Kartı */}
        <div className="card stat-card" style={{ borderBottom: "5px solid #0ea5e9", padding: "20px", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
            <FiDroplet color="#0ea5e9" size={18} /> SU TAKİBİ
          </div>
          <p style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0", color: "#1e4d3b" }}>
            {data.water.icilen} / {data.water.hedef} <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "400" }}>brdk</span>
          </p>
          {/* Su İlerleme Çubuğu */}
          <div style={{ width: "100%", height: "8px", backgroundColor: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ width: `${suYuzdesi}%`, height: "100%", backgroundColor: "#0ea5e9", transition: "width 0.5s ease-out" }} />
          </div>
        </div>

        {/* Mevcut Kilo Kartı */}
        <div className="card stat-card" style={{ borderBottom: "5px solid #10b981", padding: "20px", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
            <FiTrendingUp color="#10b981" size={18} /> MEVCUT KİLO
          </div>
          <p style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0", color: "#1e4d3b" }}>
            {data.user.kilo || "-"} <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "400" }}>kg</span>
          </p>
        </div>

        {/* Hedef Kilo Kartı */}
        <div className="card stat-card" style={{ borderBottom: "5px solid #8b5cf6", padding: "20px", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "700" }}>
            <FiTarget color="#8b5cf6" size={18} /> HEDEF KİLO
          </div>
          <p style={{ fontSize: "28px", fontWeight: "800", margin: "10px 0", color: "#1e4d3b" }}>
            {data.user.hedef || "-"} <span style={{ fontSize: "14px", color: "#9ca3af", fontWeight: "400" }}>kg</span>
          </p>
        </div>
      </div>

      {/* Alt Bölüm: Öğünler ve Son Kayıtlar */}
      <div className="two-column" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", 
        gap: "25px" 
      }}>
        
        {/* Öğün Planı Bölümü */}
        <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", marginBottom: "20px", color: "#1e4d3b", fontWeight: "700" }}>
            <FiClock color="#10b981" /> Bugünkü Öğün Planı
          </h3>
          <div className="list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.meals.map((meal) => (
              <div className="list-item" key={meal.id} style={{ 
                padding: "15px", 
                backgroundColor: "#f8fafc", 
                borderRadius: "15px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                transition: "transform 0.2s"
              }}>
                <div>
                  <strong style={{ color: "#334155", display: "block", fontSize: "15px" }}>{meal.ogun}</strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>{meal.saat} • {meal.yemek}</span>
                </div>
                <span style={{ fontWeight: "700", color: "#10b981", fontSize: "14px", backgroundColor: "white", padding: "5px 10px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {meal.kalori} kcal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Son Kayıtlar Bölümü */}
        <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "18px", marginBottom: "20px", color: "#1e4d3b", fontWeight: "700" }}>
            <FiPlusSquare color="#3b82f6" /> Son Günlük Kayıtlar
          </h3>
          <div className="list" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.gunlukKayitlar.slice(-4).reverse().map((item) => (
              <div className="list-item" key={item.id} style={{ 
                padding: "15px", 
                backgroundColor: "#f8fafc", 
                borderRadius: "15px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ backgroundColor: "#dbeafe", padding: "8px", borderRadius: "10px" }}>
                    <FiCheckCircle color="#3b82f6" size={16} />
                  </div>
                  <strong style={{ color: "#334155" }}>{item.besin}</strong>
                </div>
                <span style={{ fontWeight: "700", color: "#64748b", fontSize: "14px" }}>{item.kalori} kcal</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DanisanDashboard;