import "./Diyetisyen.css";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { key: "dashboard", label: "Danışan Yönetimi" },
    { key: "danisanlar", label: "Danışanlar" },
    { key: "plan", label: "Plan Yönetimi" },
    { key: "gunluk", label: "Günlük Takip" },
    { key: "onay", label: "Onay Bekleyenler" },
    { key: "bildirim", label: "Bildirimler" },
  ];

  return (
    <aside className="dy-sidebar">
      <div className="dy-sidebar-top">
        <div className="dy-sidebar-brand">
          <div className="dy-brand-logo">DYT</div>

          <div>
            <h2>Diyetisyen Paneli</h2>
            <p>Yönetim Alanı</p>
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
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="dy-sidebar-user">
        <div className="dy-user-avatar">DYT</div>

        <div>
          <p>Dyt. DENİZ DEMİRLİ</p>
          <span>Uzman Diyetisyen</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;