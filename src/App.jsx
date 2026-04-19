import { useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import AuthPage from "./AuthPage";
import DanisanPanel from "./DanisanPanel";
import DiyetisyenPanel from "./DiyetisyenPanel";

function Protected({ children }) {
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [role, setRole] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const authMode = searchParams.get("mode") === "register" ? "register" : "login";

  const switchMode = (mode) => {
    setForgotPassword(false);
    setRole("");
    if (mode === "register") setSearchParams({ mode: "register" });
    else setSearchParams({});
  };

  return (
    <AuthPage
      goHome={() => navigate("/")}
      authMode={authMode}
      switchMode={switchMode}
      role={role}
      setRole={setRole}
      forgotPassword={forgotPassword}
      setForgotPassword={setForgotPassword}
      onAuthSuccess={(data) => {
        const r = data?.user?.role;
        if (r === "diyetisyen") navigate("/diyetisyen-panel", { replace: true });
        else if (r === "danisan") navigate("/danisan-panel", { replace: true });
        else navigate("/", { replace: true });
      }}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/danisan-panel"
        element={
          <Protected>
            <DanisanPanel />
          </Protected>
        }
      />
      <Route
        path="/diyetisyen-panel"
        element={
          <Protected>
            <DiyetisyenPanel />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
