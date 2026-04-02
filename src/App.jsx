import { useState } from "react";
import "./App.css";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [role, setRole] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const openLogin = () => {
    setAuthMode("login");
    setRole("");
    setForgotPassword(false);
    setPage("auth");
  };

  const openRegister = () => {
    setAuthMode("register");
    setRole("");
    setForgotPassword(false);
    setPage("auth");
  };

  const goHome = () => {
    setPage("home");
    setRole("");
    setForgotPassword(false);
  };

  const switchMode = (newMode) => {
    setAuthMode(newMode);
    setForgotPassword(false);
  };

  return (
    <>
      {page === "home" && (
        <HomePage openLogin={openLogin} openRegister={openRegister} />
      )}

      {page === "auth" && (
        <AuthPage
          goHome={goHome}
          authMode={authMode}
          switchMode={switchMode}
          role={role}
          setRole={setRole}
          forgotPassword={forgotPassword}
          setForgotPassword={setForgotPassword}
        />
      )}
    </>
  );
}

export default App;
