import "./Diyetisyen.css";

import {
  FiGrid,
  FiUsers,
  FiClipboard,
  FiEdit,
  FiClock,
  FiBell,
  FiLogOut,
} from "react-icons/fi";


function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { key: "dashboard", label: "Danışan Yönetimi",icon: <FiGrid /> },
    { key: "danisanlar", label: "Danışanlar", icon: <FiUsers />, },
    { key: "plan", label: "Plan Yönetimi",icon: <FiClipboard />, },
    { key: "gunluk", label: "Günlük Takip", icon: <FiEdit />,},
    { key: "onay", label: "Onay Bekleyenler",icon: <FiClock />, },
    { key: "bildirim", label: "Bildirimler",icon: <FiBell />,},
  ];

  return (
    <aside className="dy-sidebar">
      <div className="dy-sidebar-top">
        <div className="dy-sidebar-brand">
        

          <div>
            <h2 className="dy-logo">
            <span className="white-text">Diyet</span>{" "}
            <span className="green-text">Dostu</span>
            </h2>
          </div>
        </div>

        <nav className="dy-sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`dy-menu-btn ${
                activePage === item.key ? "active" : ""
              }`}
              onClick={() => setActivePage(item.key)}
            >
             <span className="dy-menu-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

            </button>

          ))}

        </nav>

      </div> 

      <button
      className="dy-logout-btn"
      onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
     }}
  >
     <span className="dy-logout-icon">
    <FiLogOut />
    </span>

  <span>Çıkış Yap</span>
</button>
    </aside>
  );
}

export default Sidebar;