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
import DanisanPanel from "./Danisan/DanisanPanel";
import DiyetisyenPanel from "./Diyetisyen/DiyetisyenPanel";

function getUserFromStorage() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    return null;
  }
}
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [role, setRole] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);

  const authMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const token = localStorage.getItem("token");
  const user = getUserFromStorage();

  if (token && user?.role === "danisan") {
    return <Navigate to="/danisan-panel" replace />;
  }

  if (token && user?.role === "diyetisyen") {
    return <Navigate to="/diyetisyen-panel" replace />;
  }

  const switchMode = (mode) => {
    setForgotPassword(false);
    setRole("");

    if (mode === "register") {
      setSearchParams({ mode: "register" });
    } else {
      setSearchParams({});
    }
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

        if (r === "diyetisyen") {
          navigate("/diyetisyen-panel", { replace: true });
        } else if (r === "danisan") {
          navigate("/danisan-panel", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
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
          <ProtectedRoute allowedRole="danisan">
            <DanisanPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/diyetisyen-panel"
        element={
          <ProtectedRoute allowedRole="diyetisyen">
            <DiyetisyenPanel />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

}


export default App;