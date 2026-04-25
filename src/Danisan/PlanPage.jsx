import React from "react";

function PlanPage({ meals }) {
  // Öğünün ismine göre renk, arka plan ve ikon belirleyen yardımcı fonksiyon
  const getMealStyle = (ogunAdi) => {
    if (!ogunAdi) return { icon: "🍽️", color: "#64748b", bg: "#f1f5f9", border: "#e2e8f0" };
    
    const ad = ogunAdi.toLowerCase();
    
    if (ad.includes("kahvaltı") || ad.includes("sabah")) {
      return { icon: "🌅", color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" }; // Sıcak sarı/turuncu
    }
    if (ad.includes("öğle")) {
      return { icon: "☀️", color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7" }; // Ferah yeşil
    }
    if (ad.includes("akşam")) {
      return { icon: "🌙", color: "#6366f1", bg: "#e0e7ff", border: "#a5b4fc" }; // Sakin indigo/mor
    }
    // Ara öğünler veya diğerleri için varsayılan tatlı bir pembe
    return { icon: "🍎", color: "#ec4899", bg: "#fdf2f8", border: "#fbcfe8" }; 
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px" }}>
      
      {/* Üst Başlık Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "28px", color: "#1f2937", margin: 0, fontWeight: "800" }}>
          Beslenme Planım
        </h2>
        <span style={{ backgroundColor: "#e6f4ea", color: "#1b5e20", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          🎯 Hedefe Doğru Adım Adım
        </span>
      </div>

      {/* Kartların Grid Yapısı */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {meals.map((meal) => {
          const style = getMealStyle(meal.ogun);
          
          return (
            <div 
              key={meal.id} 
              style={{ 
                backgroundColor: "#ffffff", 
                borderRadius: "24px", 
                padding: "24px", 
                boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                borderTop: `6px solid ${style.color}`, // Öğüne özel renkli üst çizgi
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default"
              }}
              // Fare üzerine gelince havaya kalkma efekti
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.03)";
              }}
            >
              
              {/* Kart Üst Kısım: İkon, Öğün Adı ve Saat */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "52px", height: "52px", backgroundColor: style.bg, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", border: `1px solid ${style.border}` }}>
                    {style.icon}
                  </div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: "800", color: "#1f2937" }}>
                    {meal.ogun}
                  </h3>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700", color: "#64748b", backgroundColor: "#f8fafc", padding: "8px 14px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                  🕒 {meal.saat}
                </span>
              </div>

              {/* Yemek İçeriği Kutusu */}
              <div style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "16px", flexGrow: 1, border: "1px solid #f1f5f9" }}>
                <p style={{ margin: 0, fontSize: "15px", color: "#475569", lineHeight: "1.6", fontWeight: "500" }}>
                  {meal.yemek}
                </p>
              </div>

              {/* Kalori Rozeti */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ backgroundColor: style.bg, color: style.color, padding: "8px 16px", borderRadius: "20px", fontSize: "15px", fontWeight: "800", display: "inline-block" }}>
                  🔥 {meal.kalori} kcal
                </div>
              </div>

            </div>
          );
        })}
      </div>
      
    </div>
  );
}

export default PlanPage;