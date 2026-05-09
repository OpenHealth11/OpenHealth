import React from "react";
import { FiDroplet, FiPlus, FiMinus, FiCheckCircle, FiTarget } from "react-icons/fi";

function SuTakipPage({ water, addWater, removeWater }) {
  const yuzde = Math.min(Math.round((water.icilen / water.hedef) * 100), 100);

  let mesaj = "Hadi ilk yudumu alarak başlayalım!";
  if (yuzde === 100) mesaj = "Tebrikler, bugünkü hedefine ulaştın! 🥳";
  else if (yuzde >= 75) mesaj = "Harika gidiyorsun, hedefe çok az kaldı! 💧";
  else if (yuzde >= 50) mesaj = "Yarıladık bile, böyle devam! 🌊";
  else if (yuzde > 0) mesaj = "İyi bir başlangıç! Yudumlamaya devam. 🥤";

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "30px", fontWeight: "800", color: "#1e4d3b" }}>
        Su Takibi
      </h2>

      {/* Tam Genişlikte (Full-Width) Kart */}
      <div 
        className="card" 
        style={{ 
          padding: "40px", 
          borderRadius: "24px", 
          backgroundColor: "white", 
          boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.12)", 
          borderLeft: "8px solid #0ea5e9", // Vurguyu sola aldık
          width: "100%", // Anine genişlettik!
          display: "flex",
          flexDirection: "column",
          gap: "30px"
        }}
      >
        
        {/* ÜST KISIM: İkon, Başlık ve Hedef Bilgisi (Yatay Düzen) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ 
              display: "flex", justifyContent: "center", alignItems: "center", 
              backgroundColor: "#e0f2fe", color: "#0ea5e9", width: "70px", height: "70px", 
              borderRadius: "20px" 
            }}>
              <FiDroplet size={35} /> 
            </div>
            <div>
              <h3 style={{ color: "#1e4d3b", fontSize: "24px", fontWeight: "800", margin: 0 }}>
                Bugünkü Su Tüketimi
              </h3>
              <p style={{ color: "#64748b", fontSize: "16px", margin: "5px 0 0 0", fontWeight: "500" }}>
                {mesaj}
              </p>
            </div>
          </div>
          
          {/* Hedef Rozeti */}
          <div style={{ 
            display: "flex", alignItems: "center", gap: "10px", 
            backgroundColor: "#f8fafc", padding: "15px 25px", borderRadius: "15px",
            border: "1px solid #e2e8f0"
          }}>
            <FiTarget color="#94a3b8" size={20} />
            <span style={{ color: "#64748b", fontWeight: "600" }}>Günlük Hedef:</span>
            <span style={{ color: "#1e4d3b", fontWeight: "800", fontSize: "18px" }}>{water.hedef} Bardak</span>
          </div>
        </div>

        {/* ORTA KISIM: Büyük Sayaç ve Progress Bar (Yatay Düzen) */}
        <div style={{ 
          display: "flex", alignItems: "center", gap: "40px", 
          backgroundColor: "#f8fafc", padding: "30px", borderRadius: "20px",
          flexWrap: "wrap"
        }}>
          {/* Büyük Sayaç */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "5px", minWidth: "150px" }}>
            <span style={{ fontSize: "70px", fontWeight: "900", color: "#0ea5e9", lineHeight: "1" }}>
              {water.icilen}
            </span>
            <span style={{ fontSize: "24px", fontWeight: "700", color: "#94a3b8" }}>
              / {water.hedef}
            </span>
            <span style={{ fontSize: "16px", fontWeight: "600", color: "#64748b", marginLeft: "5px" }}>
              bardak
            </span>
          </div>

          {/* Progress Bar Alanı (Esnek Genişlik) */}
          <div style={{ flex: "1", minWidth: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", color: "#64748b" }}>İlerleme</span>
              <span style={{ fontWeight: "900", color: yuzde === 100 ? "#10b981" : "#0ea5e9", fontSize: "20px" }}>
                %{yuzde}
              </span>
            </div>
            <div style={{ width: "100%", height: "20px", backgroundColor: "#e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
              <div style={{ 
                width: `${yuzde}%`, 
                height: "100%", 
                backgroundColor: yuzde === 100 ? "#10b981" : "#0ea5e9", 
                transition: "width 0.5s ease-out, background-color 0.5s",
              }} />
            </div>
          </div>
        </div>

        {/* ALT KISIM: Aksiyon Butonları (Yatay Düzen) */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}>
          {/* Azalt Butonu */}
          <button 
            onClick={removeWater}
            disabled={water.icilen === 0}
            style={{ 
              padding: "15px 25px", 
              backgroundColor: "white", 
              color: water.icilen === 0 ? "#cbd5e1" : "#ef4444", 
              border: `2px solid ${water.icilen === 0 ? "#e2e8f0" : "#fee2e2"}`,
              borderRadius: "14px", 
              cursor: water.icilen === 0 ? "not-allowed" : "pointer", 
              display: "flex", alignItems: "center", gap: "8px", 
              fontWeight: "700", fontSize: "16px", transition: "0.2s" 
            }}
            onMouseEnter={(e) => { if(water.icilen > 0) e.currentTarget.style.backgroundColor = "#fee2e2" }}
            onMouseLeave={(e) => { if(water.icilen > 0) e.currentTarget.style.backgroundColor = "white" }}
          >
            <FiMinus size={20} /> Bardak Azalt
          </button>

          {/* Ekle Butonu */}
          <button 
            onClick={addWater}
            disabled={water.icilen >= water.hedef}
            style={{ 
              padding: "15px 35px", 
              backgroundColor: water.icilen >= water.hedef ? "#10b981" : "#0ea5e9", 
              color: "white", 
              border: "none", 
              borderRadius: "14px", 
              cursor: water.icilen >= water.hedef ? "not-allowed" : "pointer", 
              display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", 
              fontWeight: "700", fontSize: "16px", transition: "0.2s",
              boxShadow: "0 4px 10px rgba(14, 165, 233, 0.2)"
            }}
            onMouseEnter={(e) => { if(water.icilen < water.hedef) e.currentTarget.style.backgroundColor = "#0284c7" }}
            onMouseLeave={(e) => { if(water.icilen < water.hedef) e.currentTarget.style.backgroundColor = "#0ea5e9" }}
          >
            {water.icilen >= water.hedef ? <FiCheckCircle size={20} /> : <FiPlus size={20} />} 
            {water.icilen >= water.hedef ? "Bugün Tamamlandı!" : "Bir Bardak Daha İçtim"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default SuTakipPage;