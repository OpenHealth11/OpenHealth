function DiyetisyenTopbar({ fullName, onLogout }) {
  return (
    <header className="dy-topbar">
      <div>
        <h1>Diyetisyen Paneli</h1>
        <p>Hoş geldiniz, {fullName}</p>
      </div>

      <button className="dy-primary-btn" onClick={onLogout}>
        Çıkış
      </button>
    </header>
  );
}
export default DiyetisyenTopbar;