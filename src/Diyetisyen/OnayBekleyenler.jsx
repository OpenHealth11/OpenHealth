import React from "react";
import { FiCheck, FiX, FiClock, FiUserPlus, FiCalendar } from "react-icons/fi";

// Prop'ları parantez içinde (talepler, onaylaTalep, reddetTalep) olarak alıyoruz
export default function OnayBekleyenler({ talepler = [], onaylaTalep, reddetTalep }) {
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
        <div style={{ backgroundColor: "#4ade80", color: "#1e4d3b", padding: "10px", borderRadius: "12px", display: "flex" }}>
          <FiUserPlus size={24} />
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e4d3b", margin: 0 }}>Onay Bekleyen Başvurular</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {talepler.length === 0 ? (
          <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "50px", textAlign: "center", color: "#64748b", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
            <FiClock size={40} style={{ marginBottom: "15px", opacity: 0.5 }} />
            <p style={{ margin: 0, fontWeight: "600" }}>Şu an bekleyen bir danışan talebi bulunmuyor.</p>
          </div>
        ) : (
          talepler.map((item) => (
            <div key={item.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "55px", height: "55px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "800" }}>
                  {item.danisanAdi ? item.danisanAdi[0] : "D"}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 5px 0", fontSize: "17px", color: "#1e293b" }}>{item.danisanAdi}</h3>
                  <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>{item.talep}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#94a3b8", fontSize: "12px" }}>
                    <FiCalendar /> {item.tarih}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  onClick={() => onaylaTalep(item.id)} 
                  style={{ padding: "10px 20px", backgroundColor: "#4ade80", color: "#1e4d3b", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Onayla
                </button>
                <button 
                  onClick={() => reddetTalep(item.id)} 
                  style={{ padding: "10px 20px", backgroundColor: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Reddet
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}