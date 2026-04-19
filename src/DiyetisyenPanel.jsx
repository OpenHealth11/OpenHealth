import { useNavigate } from "react-router-dom";
import { logout } from "./auth";
import "./Panel.css";

export default function DiyetisyenPanel() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  return (
    <div className="panel-page">
      <header className="panel-header">
        <h1>Diyetisyen paneli</h1>
        <button type="button" className="panel-logout" onClick={() => logout(navigate)}>
          Çıkış
        </button>
      </header>
      <p className="panel-welcome">
        {user?.fullName ? `Hoş geldin, ${user.fullName}.` : "Giriş yapıldı."}
      </p>
    </div>
  );
}
