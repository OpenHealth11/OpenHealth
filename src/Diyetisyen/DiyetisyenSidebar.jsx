import { useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiMessageSquare, 
  FiCheckCircle, 
  FiBell,
  FiLogOut 
} from "react-icons/fi";

function Sidebar({ activePage, setActivePage }) {
  const navigate = useNavigate();

  const menuItems = [
    { key: "dashboard", label: "Sağlık Özeti", icon: <FiHome /> },
    { key: "danisanlar", label: "Danışanlar", icon: <FiUsers /> },
    { key: "plan", label: "Plan Yönetimi", icon: <FiCalendar /> },
    { key: "gunluk", label: "Günlük Takip", icon: <FiMessageSquare /> },
    { key: "onay", label: "Onay Bekleyenler", icon: <FiCheckCircle /> },
    { key: "bildirim", label: "Bildirimler", icon: <FiBell /> },
  ];

  const sidebarStyle = {
    width: "280px",
    backgroundColor: "#1e4d3b",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "30px 20px",
    position: "fixed",
    left: 0,
    top: 0,
    color: "white",
    boxSizing: "border-box",
    zIndex: 1000
  };

  const activeBtnStyle = {
    backgroundColor: "#39d373",
    color: "#1e4d3b",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(57, 211, 115, 0.2)"
  };

  const normalBtnStyle = {
    backgroundColor: "transparent",
    color: "rgba(255, 255, 255, 0.7)",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside style={sidebarStyle}>
      <div>
        {/* LOGO BÖLÜMÜ */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ width: "45px", height: "45px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>DYT</div>
          <div>
            <h2 style={{ fontSize: "20px", margin: 0, fontWeight: "800" }}>Diyet <span style={{ color: "#39d373" }}>Dostu</span></h2>
            <p style={{ fontSize: "11px", opacity: 0.6, margin: 0 }}>Diyetisyen Paneli</p>
          </div>
        </div>

        {/* MENÜ LİSTESİ */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActivePage(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "14px 18px",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                fontSize: "15px",
                transition: "0.3s",
                textAlign: "left",
                ...(activePage === item.key ? activeBtnStyle : normalBtnStyle)
              }}
            >
              <span style={{ display: "flex", alignItems: "center", fontSize: "18px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ALT KISIM: SADECE ÇIKIŞ BUTONU KALDI */}
      <div style={{ paddingBottom: "10px" }}>
        <button 
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            backgroundColor: "rgba(255, 75, 75, 0.1)",
            color: "#ff4b4b",
            border: "none",
            borderRadius: "14px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            transition: "0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 75, 75, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 75, 75, 0.1)";
          }}
        >
          <FiLogOut size={18} />
          <span>Sistemden Çık</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;