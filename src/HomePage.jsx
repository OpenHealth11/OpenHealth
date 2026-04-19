import { useNavigate } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page">
      <header className="navbar">
        <div className="logo">Diyet Dostu</div>

        <nav className="nav-links">
          <a href="#anasayfa">Anasayfa</a>
          <a href="#hakkinda">Hakkında</a>
          <button className="nav-outline-btn" onClick={() => navigate("/login")}>
            Giriş Yap
          </button>
          <button
            className="nav-solid-btn"
            onClick={() => navigate("/login?mode=register")}
          >
            Kayıt Ol
          </button>
        </nav>
      </header>

      <section className="hero" id="anasayfa">
        <div className="hero-content">
          <div className="hero-badge">
            Sağlıklı yaşamı dijital takip ile destekleyen sistem
          </div>

          <h1>Diyet Dostu</h1>

          <p>
            Diyet Dostu; ücretsiz kullanım sunan, besin takası sağlayan, su
            takibi ve günlük besin alımı takibini destekleyen modern ve kullanıcı
            odaklı bir beslenme takip platformudur. Sağlıklı yaşam sürecini daha
            düzenli, erişilebilir ve sürdürülebilir hale getirmeyi amaçlar. 🍏
          </p>

          <div className="hero-buttons">
            <button className="primary-btn" onClick={() => navigate("/login")}>
              Giriş Yap
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate("/login?mode=register")}
            >
              Kayıt Ol
            </button>
          </div>

          <div className="hero-cards">
            <div className="hero-card">
              <h3>Ücretsiz Kullanım</h3>
              <p>
                Kullanıcıların sisteme ücretsiz şekilde erişebilmesini sağlar.
              </p>
            </div>

            <div className="hero-card">
              <h3>Besin Takası</h3>
              <p>
                Alternatif besin seçenekleri sunarak daha esnek bir kullanım
                sağlar.
              </p>
            </div>

            <div className="hero-card">
              <h3>Günlük Takip</h3>
              <p>
                Su tüketimi ve besin alımı verilerinin düzenli kaydını destekler.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="hakkinda">
        <div className="section-header">
          <div className="section-badge">Hakkında</div>
          <h2 className="section-title">Diyet Dostu Nedir?</h2>
          <p className="section-desc">
            Kullanıcıların beslenme süreçlerini daha kontrollü ve daha kolay
            şekilde yönetebilmesi için tasarlanmıştır.
          </p>
        </div>

        <div className="about-box">
          <p>
            Diyet Dostu, sağlıklı yaşam alışkanlıklarını desteklemek amacıyla
            geliştirilmiş dijital bir web uygulamasıdır. Sistem, bireylerin günlük
            besin tüketimini ve su alımını takip etmesine yardımcı olurken, besin
            takası özelliği ile alternatif tüketim önerileri sunar. Ücretsiz yapısı
            sayesinde erişilebilir bir deneyim sağlarken, modern arayüzü ile
            kullanıcı dostu bir kullanım sunmayı hedefler.
          </p>
        </div>
      </section>

      <section className="section features-section">
        <div className="section-header">
          <div className="section-badge">Özellikler</div>
          <h2 className="section-title">Öne Çıkan Özellikler</h2>
          <p className="section-desc">
            Diyet Dostu, temel takip süreçlerini tek bir arayüzde bir araya
            getirerek daha işlevsel bir deneyim sunar.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💚</div>
            <h3>Ücretsiz Kullanım</h3>
            <p>
              Kullanıcıların sisteme herhangi bir ücret ödemeden erişebilmesini
              sağlar.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Besin Takası</h3>
            <p>
              Belirli besinler yerine tercih edilebilecek alternatif seçenekler
              sunar.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💧</div>
            <h3>Su Takibi</h3>
            <p>
              Gün içerisinde tüketilen su miktarının düzenli şekilde
              kaydedilmesini destekler.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🥗</div>
            <h3>Günlük Besin Alımı Takibi</h3>
            <p>
              Kullanıcının gün boyunca tükettiği besinleri takip edebilmesine
              yardımcı olur.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <div className="section-badge">Süreç</div>
          <h2 className="section-title">Nasıl Çalışır?</h2>
          <p className="section-desc">
            Kullanıcı birkaç basit adımda sisteme dahil olarak takip sürecini
            başlatabilir.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Sistemi İncele</h3>
            <p>
              Kullanıcı anasayfada sistemin amacı ve sunduğu temel hizmetler
              hakkında bilgi edinir.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Giriş Yap veya Kayıt Ol</h3>
            <p>
              Kullanıcı hesabına giriş yapar ya da yeni bir kayıt oluşturarak
              sisteme erişim sağlar.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Takibini Başlat</h3>
            <p>
              Kullanıcı günlük besin alımı, su tüketimi ve besin alternatifleri
              gibi verileri sistem üzerinden takip eder.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>Diyet Dostu</h3>
            <p>
              Sağlıklı yaşamı destekleyen, ücretsiz erişim sunan ve günlük
              beslenme takibini kolaylaştıran dijital beslenme platformu.
            </p>
          </div>

          <div className="footer-menu">
            <a href="#anasayfa">Anasayfa</a>
            <a href="#hakkinda">Hakkında</a>
            <button onClick={() => navigate("/login")}>Giriş Yap</button>
            <button onClick={() => navigate("/login?mode=register")}>Kayıt Ol</button>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 Diyet Dostu | Tüm Hakları Saklıdır
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
