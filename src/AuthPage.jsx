import { useEffect, useState } from "react";
import { validateEmail } from "../validation.js";
import "./AuthPage.css";

function AuthPage({
  goHome,
  authMode,
  switchMode,
  role,
  setRole,
  forgotPassword,
  setForgotPassword,
  onAuthSuccess,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [registerNotice, setRegisterNotice] = useState("");

  useEffect(() => {
    setAuthError("");
    if (authMode === "register") setRegisterNotice("");
  }, [authMode, role]);

  function messageFromBody(status, raw) {
    try {
      const j = JSON.parse(raw);
      if (j && typeof j.error === "string") return j.error;
    } catch {
      /* not JSON */
    }
    if (status === 404 || status === 502) {
      return "API yanıt vermiyor. Ayrı bir terminalde `npm run server` çalıştır (port 3001), ardından `npm run dev` ile sayfayı aç.";
    }
    if (status === 500 && !raw.trim()) {
      return "Sunucu hatası (500). `npm run server` çalışan terminaldeki kırmızı log satırına bak.";
    }
    return raw.trim()
      ? `Sunucu (${status}): ${raw.slice(0, 200)}`
      : `İstek başarısız (${status}).`;
  }

  function submitForgotPassword() {
    setResetMsg("");
    setAuthError("");
    const check = validateEmail(resetEmail);
    if (!check.ok) {
      setAuthError(check.error);
      return;
    }
    setResetMsg("Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.");
  }

  async function submitLogin() {
    if (role !== "danisan" && role !== "diyetisyen") return;
    setAuthError("");
    if (!password) {
      setAuthError("E-posta ve şifre gerekli.");
      return;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      setAuthError(emailCheck.error);
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailCheck.value,
          password,
          role,
        }),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setAuthError(
          res.status === 404 || res.status === 502
            ? "API yanıt vermiyor. `npm run server` çalıştır (3001), ardından Vite ile sayfayı aç (5173)."
            : `Sunucu (${res.status}): ${raw.slice(0, 200)}`
        );
        return;
      }
      if (!res.ok) {
        setAuthError(
          data.error ||
            "Giriş başarısız. Rol seçimin hesaptaki rol ile aynı mı kontrol et."
        );
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess?.(data);
    } catch {
      setAuthError(
        "Bağlantı kurulamadı. Node API açık mı? (`npm run server` → http://localhost:3001)"
      );
    } finally {
      setAuthLoading(false);
    }
  }

  async function submitRegister() {
    if (role !== "danisan" && role !== "diyetisyen") return;
    setAuthError("");
    if (password !== passwordConfirm) {
      setAuthError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 8) {
      setAuthError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (!fullName.trim()) {
      setAuthError("Ad soyad zorunlu.");
      return;
    }
    const emailCheck = validateEmail(email);
    if (!emailCheck.ok) {
      setAuthError(emailCheck.error);
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailCheck.value,
          password,
          passwordConfirm,
          fullName: fullName.trim(),
          role,
        }),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setAuthError(messageFromBody(res.status, raw));
        return;
      }
      if (!res.ok) {
        setAuthError(data.error || messageFromBody(res.status, raw));
        return;
      }
      if (data.token) {
        if (role === "danisan") {
          setRegisterNotice(
            "Kayıt tamamlandı. Giriş bilgilerinizle giriş yapabilirsiniz."
          );
          switchMode("login");
          setRole("");
          setPassword("");
          setPasswordConfirm("");
          setFullName("");
          setEmail("");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          onAuthSuccess?.(data);
        }
      } else {
        setRegisterNotice(
          typeof data.message === "string"
            ? data.message
            : "Kaydınız alındı. Hesabınız admin onayından sonra aktif olacak."
        );
        switchMode("login");
        setRole("");
        setPassword("");
        setPasswordConfirm("");
        setFullName("");
        setEmail("");
      }
    } catch {
      setAuthError(
        "Bağlantı kurulamadı. Node API açık mı? (`npm run server` → http://localhost:3001)"
      );
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-right">
          <div className="auth-topbar">
            <button className="text-btn" onClick={goHome}>
              ← Anasayfaya Dön
            </button>

            <div className="mode-switch">
              <button
                type="button"
                className={authMode === "login" ? "mode-btn active" : "mode-btn"}
                disabled={authLoading}
                onClick={() => switchMode("login")}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                className={authMode === "register" ? "mode-btn active" : "mode-btn"}
                disabled={authLoading}
                onClick={() => switchMode("register")}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="auth-panel">
            {registerNotice && authMode === "login" && !forgotPassword ? (
              <p className="auth-success">{registerNotice}</p>
            ) : null}

            {forgotPassword && (
              <div className="form-wrap">
                <button
                  className="text-btn back-inline"
                  onClick={() => {
                    setForgotPassword(false);
                    setResetEmail("");
                    setResetMsg("");
                    setAuthError("");
                  }}
                >
                  ← Girişe Dön
                </button>

                <h2 className="form-title">Şifre Sıfırlama</h2>
                <p className="form-subtitle">
                  Kayıtlı e-posta adresinizi giriniz.
                </p>

                {authError && <p className="auth-error">{authError}</p>}
                {resetMsg && <p className="auth-success">{resetMsg}</p>}

                {!resetMsg && (
                  <>
                    <div className="form-group">
                      <label>E-posta</label>
                      <input
                        className="form-control"
                        type="email"
                        placeholder="ornek@mail.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>

                    <button
                      type="button"
                      className="submit-btn"
                      disabled={authLoading}
                      onClick={submitForgotPassword}
                    >
                      {authLoading ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
                    </button>
                  </>
                )}
              </div>
            )}

            {role === "" && !forgotPassword && (
              <>
                <h1 className="auth-title">
                  {authMode === "login"
                    ? "Rolünü seç ve giriş yap"
                    : "Rolünü seç ve kayıt ol"}
                </h1>

                <p className="auth-subtitle">
                  {authMode === "login"
                    ? "Sisteme erişmek için kullanıcı tipinizi seçiniz."
                    : "Hesap oluşturmak için kullanıcı tipinizi seçiniz."}
                </p>

                <div className="role-grid">
                  <div className="role-card">
                    <div className="role-card-icon">🧍</div>
                    <h2>Danışan</h2>
                    <p>
                      Günlük besin alımı, su takibi ve besin takası işlemleri için.
                    </p>
                    <button
                      className="role-btn"
                      onClick={() => setRole("danisan")}
                    >
                      {authMode === "login"
                        ? "Danışan Girişi"
                        : "Danışan Kaydı"}
                    </button>
                  </div>

                  <div className="role-card">
                    <div className="role-card-icon">🩺</div>
                    <h2>Diyetisyen</h2>
                    <p>
                      Danışan yönetimi, plan oluşturma ve takip süreçleri için.
                    </p>
                    <button
                      className="role-btn"
                      onClick={() => setRole("diyetisyen")}
                    >
                      {authMode === "login"
                        ? "Diyetisyen Girişi"
                        : "Diyetisyen Kaydı"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {role === "danisan" && !forgotPassword && (
              <div className="form-wrap">
                <button className="text-btn back-inline" onClick={() => setRole("")}>
                  ← Rol Seçimine Dön
                </button>

                <h2 className="form-title">
                  {authMode === "login" ? "Danışan Girişi" : "Danışan Kaydı"}
                </h2>

                <p className="form-subtitle">
                  {authMode === "login"
                    ? "Danışan hesabınız ile sisteme giriş yapınız."
                    : "Danışan hesabı oluşturunuz."}
                </p>

                {authError ? <p className="auth-error">{authError}</p> : null}

                {authMode === "register" && (
                  <p className="auth-hint">
                    Kayıt: ad soyad ve e-posta zorunlu; şifre en az 8 karakterli olmalıdır.
                  </p>
                )}

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Adınızı ve soyadınızı giriniz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Şifrenizi giriniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                  />

                  {authMode === "login" && (
                    <p
                      className="switch-link forgot-link"
                      onClick={() => setForgotPassword(true)}
                    >
                      Şifremi Unuttum?
                    </p>
                  )}
                </div>

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Şifre Tekrar</label>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Şifrenizi tekrar giriniz"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="submit-btn"
                  disabled={authLoading}
                  onClick={authMode === "login" ? submitLogin : submitRegister}
                >
                  {authLoading
                    ? authMode === "login"
                      ? "Giriş yapılıyor…"
                      : "Kayıt olunuyor…"
                    : authMode === "login"
                      ? "Danışan Girişi Yap"
                      : "Danışan Kaydı Oluştur"}
                </button>

                <p className="switch-text">
                  {authMode === "login"
                    ? "Hesabınız yok mu?"
                    : "Zaten hesabınız var mı?"}
                  <span
                    className="switch-link"
                    onClick={() =>
                      switchMode(authMode === "login" ? "register" : "login")
                    }
                  >
                    {authMode === "login" ? " Kayıt Ol" : " Giriş Yap"}
                  </span>
                </p>
              </div>
            )}

            {role === "diyetisyen" && !forgotPassword && (
              <div className="form-wrap">
                <button className="text-btn back-inline" onClick={() => setRole("")}>
                  ← Rol Seçimine Dön
                </button>

                <h2 className="form-title">
                  {authMode === "login"
                    ? "Diyetisyen Girişi"
                    : "Diyetisyen Kaydı"}
                </h2>

                <p className="form-subtitle">
                  {authMode === "login"
                    ? "Diyetisyen hesabınız ile sisteme giriş yapınız."
                    : "Diyetisyen hesabı oluşturunuz."}
                </p>

                {authError ? <p className="auth-error">{authError}</p> : null}

                {authMode === "register" && (
                  <p className="auth-hint">
                    Kayıt: ad soyad ve e-posta zorunlu; şifre en az 8 karakterli olmalıdır.
                  </p>
                )}

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Adınızı ve soyadınızı giriniz"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Şifrenizi giriniz"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={
                      authMode === "login" ? "current-password" : "new-password"
                    }
                  />

                  {authMode === "login" && (
                    <p
                      className="switch-link forgot-link"
                      onClick={() => setForgotPassword(true)}
                    >
                      Şifremi Unuttum?
                    </p>
                  )}
                </div>

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Şifre Tekrar</label>
                    <input
                      className="form-control"
                      type="password"
                      placeholder="Şifrenizi tekrar giriniz"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="submit-btn"
                  disabled={authLoading}
                  onClick={authMode === "login" ? submitLogin : submitRegister}
                >
                  {authLoading
                    ? authMode === "login"
                      ? "Giriş yapılıyor…"
                      : "Kayıt olunuyor…"
                    : authMode === "login"
                      ? "Diyetisyen Girişi Yap"
                      : "Diyetisyen Kaydı Oluştur"}
                </button>

                <p className="switch-text">
                  {authMode === "login"
                    ? "Hesabınız yok mu?"
                    : "Zaten hesabınız var mı?"}
                  <span
                    className="switch-link"
                    onClick={() =>
                      switchMode(authMode === "login" ? "register" : "login")
                    }
                  >
                    {authMode === "login" ? " Kayıt Ol" : " Giriş Yap"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
