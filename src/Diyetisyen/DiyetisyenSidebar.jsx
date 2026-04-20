function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { key: "dashboard", label: "Danışan Yönetimi", icon: "📊" },
    { key: "danisanlar", label: "Danışanlar", icon: "👥" },
    { key: "plan", label: "Plan Yönetimi", icon: "🥗" },
    { key: "gunluk", label: "Günlük Takip", icon: "📝" },
    { key: "onay", label: "Onay Bekleyenler", icon: "✅" },
    { key: "bildirim", label: "Bildirimler", icon: "🔔" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">DYT</div>
        <div>
          <h2>Diyetisyen Paneli</h2>
          <p>Yönetim Alanı</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`sidebar-item ${activePage === item.key ? "active" : ""}`}
            onClick={() => setActivePage(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">DY</div>
          <div>
            <h4>Dyt. DENİZ DEMİRLİ</h4>
            <p>Uzman Diyetisyen</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar; 