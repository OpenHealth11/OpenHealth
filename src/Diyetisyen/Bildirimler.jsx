import React from "react";
import { FiBell, FiClock, FiInfo } from "react-icons/fi";

function Bildirimler({ bildirimler = [] }) {
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    border: "none",
    marginBottom: "15px"
  };

  return (
    /* GÜNCELLEME: marginLeft kaldırıldı, okuma kolaylığı için maxWidth eklendi */
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      
      {/* Başlık Alanı */}
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
        <div style={{ backgroundColor: "#4ade80", color: "#1e4d3b", padding: "10px", borderRadius: "12px", display: "flex" }}>
          <FiBell size={24} />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e4d3b", margin: 0 }}>Bildirimler</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {bildirimler.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "50px", color: "#64748b" }}>
            <FiInfo size={40} style={{ marginBottom: "15px", opacity: 0.5, color: "#94a3b8" }} />
            <p style={{ margin: 0, fontWeight: "600" }}>Henüz yeni bir bildiriminiz bulunmuyor.</p>
          </div>
        ) : (
          bildirimler.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "15px" }}>
                  {/* Bildirim İkonu/Avatar */}
                  <div style={{ 
                    width: "45px", 
                    height: "45px", 
                    backgroundColor: "#f0fdf4", 
                    color: "#166534", 
                    borderRadius: "12px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <FiBell size={20} />
                  </div>
                  
                  <div>
                    <strong style={{ display: "block", fontSize: "16px", color: "#1e293b", marginBottom: "5px" }}>
                      {item.mesaj}
                    </strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8", fontSize: "13px" }}>
                      <FiClock size={14} />
                      <span>{item.saat}</span>
                    </div>
                  </div>
                </div>
                
                {/* Okundu İşareti */}
                <div style={{ width: "8px", height: "8px", backgroundColor: "#4ade80", borderRadius: "50%", marginTop: "5px" }}></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Bildirimler;