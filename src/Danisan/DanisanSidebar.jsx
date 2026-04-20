function DanisanSidebar({ activePage, setActivePage }) {
  const menuItems = [
    { key: "dashboard", label: "Sağlık Özeti" },
    { key: "plan", label: "Planım" },
    { key: "gunluk", label: "Günlük Takip" },
    { key: "su", label: "Su Takibi" },
    { key: "takas", label: "Besin Takası" },
    { key: "rapor", label: "Raporlar" },
    { key: "profil", label: "Profil" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">D</div>
        <div>
          <h2>Diyet Dostu</h2>
          <p>Danışan</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`menu-btn ${activePage === item.key ? "active" : ""}`}
            onClick={() => setActivePage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
} 
export default  DanisanSidebar;
