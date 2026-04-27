import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome, FiCalendar, FiEdit3, FiDroplet, 
  FiRepeat, FiPieChart, FiUser, FiLogOut 
} from "react-icons/fi";

function DanisanSidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();

  const menuItems = [
    { key: "dashboard", label: "Sağlık Özeti", icon: <FiHome /> },
    { key: "plan", label: "Planım", icon: <FiCalendar /> },
    { key: "gunluk", label: "Günlük Takip", icon: <FiEdit3 /> },
    { key: "su", label: "Su Takibi", icon: <FiDroplet /> },
    { key: "takas", label: "Besin Takası", icon: <FiRepeat /> },
    { key: "rapor", label: "Raporlar", icon: <FiPieChart /> },
    { key: "profil", label: "Profil", icon: <FiUser /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ 
      width: "280px", backgroundColor: "#1e4d3b", height: "100vh", 
      color: "white", padding: "30px 20px", display: "flex", 
      flexDirection: "column", boxShadow: "4px 0 15px rgba(0,0,0,0.1)",
      position: "fixed", left: 0, top: 0, zIndex: 100
    }}>
      <div style={{ marginBottom: "40px", padding: "0 10px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>
          Diyet <span style={{ color: "#4ade80" }}>Dostu</span>
        </h1>
        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>Danışan Paneli</p>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setActivePage(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: "15px",
              padding: "15px 20px", cursor: "pointer", borderRadius: "15px",
              marginBottom: "8px", transition: "all 0.3s",
              backgroundColor: activePage === item.key ? "#4ade80" : "transparent",
              color: activePage === item.key ? "#1e4d3b" : "#ecfdf5",
              fontWeight: activePage === item.key ? "700" : "500"
            }}
          >
            <span style={{ fontSize: "20px", display: "flex" }}>{item.icon}</span>
            <span style={{ fontSize: "16px" }}>{item.label}</span>
          </div>
        ))}
      </nav>

      <button 
        onClick={handleLogout}
        style={{
          marginTop: "auto", display: "flex", alignItems: "center", gap: "10px",
          padding: "15px 20px", backgroundColor: "rgba(255,255,255,0.05)",
          border: "none", borderRadius: "15px", color: "#f87171",
          cursor: "pointer", fontWeight: "700", transition: "0.3s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(248, 113, 113, 0.1)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
      >
        <FiLogOut size={18} /> Çıkış Yap
      </button>
    </div>
  );
}

export default DanisanSidebar;