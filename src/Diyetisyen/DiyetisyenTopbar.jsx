function DiyetisyenTopbar({ fullName, onLogout }) {
  return (
    <header className="dy-topbar">
       <p className="dy-welcome-text">
        Hoş geldiniz, {fullName}
      </p>
        
    </header>
  );
}
export default DiyetisyenTopbar;