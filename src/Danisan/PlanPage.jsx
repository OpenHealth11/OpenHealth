import React from "react";
import { FiClock, FiCoffee, FiSun, FiMoon, FiCheckCircle } from "react-icons/fi";

function PlanPage({ meals }) {
  // Öğüne göre ikon ve renk belirleyen küçük bir yardımcı fonksiyon
  const getMealStyle = (ogunAdi) => {
    const name = ogunAdi.toLowerCase();
    if (name.includes("kahvaltı")) return { icon: <FiCoffee />, color: "#f59e0b", bg: "#fef3c7" }; // Turuncu
    if (name.includes("öğle")) return { icon: <FiSun />, color: "#0ea5e9", bg: "#e0f2fe" }; // Mavi
    if (name.includes("akşam")) return { icon: <FiMoon />, color: "#8b5cf6", bg: "#ede9fe" }; // Mor
    return { icon: <FiCheckCircle />, color: "#10b981", bg: "#d1fae5" }; // Ara öğünler için Yeşil
  };

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "25px", fontWeight: "800", color: "#1e4d3b" }}>
        Beslenme Planım
      </h2>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
        gap: "25px" 
      }}>
        {meals.map((meal) => {
          const style = getMealStyle(meal.ogun);

          return (
            <div 
              key={meal.id} 
              className="card meal-card" 
              style={{ 
                padding: "25px", 
                borderRadius: "20px", 
                backgroundColor: "white", 
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                borderLeft: `6px solid ${style.color}`,
                transition: "transform 0.2s"
              }}
            >
              {/* Kartın Üst Kısmı: Öğün Adı ve Saat */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                marginBottom: "20px",
                paddingBottom: "15px",
                borderBottom: "1px solid #f1f5f9"
              }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "20px", color: "#1e4d3b", margin: 0, fontWeight: "800" }}>
                  <span style={{ color: style.color, display: "flex", alignItems: "center", fontSize: "24px" }}>
                    {style.icon}
                  </span>
                  {meal.ogun}
                </h3>
                
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#64748b", fontWeight: "600", backgroundColor: "#f8fafc", padding: "6px 12px", borderRadius: "10px" }}>
                  <FiClock size={16} /> {meal.saat}
                </span>
              </div>

              {/* Kartın Orta Kısmı: Yemek İçeriği */}
              <p style={{ color: "#334155", fontSize: "16px", lineHeight: "1.6", marginBottom: "20px", fontWeight: "500" }}>
                {meal.yemek}
              </p>

              {/* Kartın Alt Kısmı: Kalori */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ 
                  fontWeight: "700", 
                  color: style.color, 
                  fontSize: "15px", 
                  backgroundColor: style.bg, 
                  padding: "8px 16px", 
                  borderRadius: "12px",
                  display: "inline-block"
                }}>
                  {meal.kalori} kcal
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