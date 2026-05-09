import React from "react";
import { useNavigate } from "react-router-dom";
// İkonları da ekleyelim ki Danışan paneli gibi şık dursun
import { 
  FiGrid, FiUsers, FiFileText, FiActivity, 
  FiCheckCircle, FiBell, FiLogOut 
} from "react-icons/fi";

function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();

  const menuItems = [
    { key: "dashboard", label: "Danışan Yönetimi", icon: <FiGrid /> },
    { key: "danisanlar", label: "Danışanlar", icon: <FiUsers /> },
    { key: "plan", label: "Plan Yönetimi", icon: <FiFileText /> },
    { key: "gunluk", label: "Günlük Takip", icon: <FiActivity /> },
    { key: "onay", label: "Onay Bekleyenler", icon: <FiCheckCircle /> },
    { key: "bildirim", label: "Bildirimler", icon: <FiBell /> },
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
      {/* Üst Logo Alanı - Danışan Paneli Stili */}
      <div style={{ marginBottom: "40px", padding: "0 10px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-1px" }}>
          Diyet <span style={{ color: "#4ade80" }}>Dostu</span>
        </h1>
        <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "5px" }}>Diyetisyen Paneli</p>
      </div>

      {/* Menü Listesi */}
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

      {/* Alt Kullanıcı/Çıkış Alanı */}
      <div style={{ marginTop: "auto" }}>
        <div style={{ 
          display: "flex", alignItems: "center", gap: "10px", 
          padding: "10px", marginBottom: "15px", borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "20px"
        }}>
          <div style={{ 
            width: "40px", height: "40px", backgroundColor: "#4ade80", 
            borderRadius: "10px", display: "flex", alignItems: "center", 
            justifyContent: "center", color: "#1e4d3b", fontWeight: "bold" 
          }}>DYT</div>
          <div>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Dyt. Mustafa Yalçın</p>
            <span style={{ fontSize: "11px", opacity: 0.6 }}>Uzman Diyetisyen</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 20px", backgroundColor: "rgba(248, 113, 113, 0.1)",
            border: "none", borderRadius: "12px", color: "#f87171",
            cursor: "pointer", fontWeight: "700", transition: "0.3s"
          }}
        >
          <FiLogOut size={18} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
}

export default Sidebar;