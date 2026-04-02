import "./AuthPage.css";

function AuthPage({
  goHome,
  authMode,
  switchMode,
  role,
  setRole,
  forgotPassword,
  setForgotPassword,
}) {
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
                className={authMode === "login" ? "mode-btn active" : "mode-btn"}
                onClick={() => switchMode("login")}
              >
                Giriş Yap
              </button>
              <button
                className={authMode === "register" ? "mode-btn active" : "mode-btn"}
                onClick={() => switchMode("register")}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          <div className="auth-panel">
            {forgotPassword && (
              <div className="form-wrap">
                <button
                  className="text-btn back-inline"
                  onClick={() => setForgotPassword(false)}
                >
                  ← Girişe Dön
                </button>

                <h2 className="form-title">Şifre Sıfırlama</h2>
                <p className="form-subtitle">
                  E-posta adresinizi giriniz. Eğer bu e-posta adresine ait bir
                  hesap varsa, şifre sıfırlama bağlantısı gönderilecektir.
                </p>

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="ornek@mail.com"
                  />
                </div>

                <button className="submit-btn">
                  Sıfırlama Bağlantısı Gönder
                </button>
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

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Adınızı ve soyadınızı giriniz"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="ornek@mail.com"
                  />
                </div>

                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Şifrenizi giriniz"
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
                    />
                  </div>
                )}

                <button className="submit-btn">
                  {authMode === "login"
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

                {authMode === "register" && (
                  <div className="form-group">
                    <label>Ad Soyad</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Adınızı ve soyadınızı giriniz"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="ornek@mail.com"
                  />
                </div>

                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Şifrenizi giriniz"
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
                    />
                  </div>
                )}

                <button className="submit-btn">
                  {authMode === "login"
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
