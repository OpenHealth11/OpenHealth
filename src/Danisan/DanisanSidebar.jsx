import { useState } from "react";
// react-icons kütüphanesinden ince çizgili (Feather) ikonları içe aktarıyoruz
import { FiPieChart, FiCalendar, FiEdit3, FiDroplet, FiRefreshCw, FiTrendingUp, FiUser } from "react-icons/fi";

function DanisanSidebar({ activePage, setActivePage }) {
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const menuItems = [
    { key: "dashboard", label: "Sağlık Özeti", icon: <FiPieChart /> },
    { key: "plan", label: "Planım", icon: <FiCalendar /> },
    { key: "gunluk", label: "Günlük Takip", icon: <FiEdit3 /> },
    { key: "su", label: "Su Takibi", icon: <FiDroplet /> },
    { key: "takas", label: "Besin Takası", icon: <FiRefreshCw /> },
    { key: "rapor", label: "Raporlar", icon: <FiTrendingUp /> },
    { key: "profil", label: "Profil", icon: <FiUser /> },
  ];

  return (
    <aside 
      className="sidebar"
      style={{
        width: "280px",
        background: "linear-gradient(180deg, #1b4332 0%, #081c15 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "32px 20px",
        height: "100vh",
        position: "sticky",
        top: 0,
        boxSizing: "border-box",
        color: "#ffffff"
      }}
    >
      {/* Üst Logo ve Marka Alanı */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px", paddingLeft: "10px" }}>
        <div style={{
            width: "48px", height: "48px", backgroundColor: "#10b981", color: "#ffffff", 
            borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", fontWeight: "800", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)"
          }}>
          D
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#ffffff" }}>Diyet Dostu</h2>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#a7f3d0", fontWeight: "500" }}>Danışan Paneli</p>
        </div>
      </div>

      {/* Menü Linkleri */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {menuItems.map((item) => {
          const isActive = activePage === item.key;
          const isHovered = hoveredMenu === item.key;

          return (
            <button
              key={item.key}
              onMouseEnter={() => setHoveredMenu(item.key)}
              onMouseLeave={() => setHoveredMenu(null)}
              onClick={() => setActivePage(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "14px 20px",
                border: "none",
                borderRadius: "12px", 
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: isActive ? "600" : "500",
                transition: "all 0.2s ease-in-out",
                backgroundColor: isActive ? "#10b981" : (isHovered ? "rgba(255,255,255,0.1)" : "transparent"),
                color: isActive ? "#ffffff" : "#f8fafc",
                textAlign: "left",
                boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.4)" : "none",
              }}
            >
              <span style={{ 
                fontSize: "22px", // İkon boyutu
                display: "flex", // İkonun hizalaması için
                opacity: isActive ? 1 : 0.8,
                transform: isHovered && !isActive ? "scale(1.1)" : "scale(1)", 
                transition: "all 0.2s ease"
              }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default DanisanSidebar;