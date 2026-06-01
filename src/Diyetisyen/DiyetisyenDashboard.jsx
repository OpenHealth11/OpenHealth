import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClipboard,
  FiEdit3,
  FiAlertCircle,
  FiTarget,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";

function DiyetisyenDashboard({ onProfilGor }) {
  const [danisanlar, setDanisanlar] = useState([]);
  const [planlar, setPlanlar] = useState([]);
  const [gunlukKayitlar, setGunlukKayitlar] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/diyetisyen/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let clients = [];
        if (res.ok) {
          const data = await res.json();
          clients = Array.isArray(data.clients) ? data.clients : [];
        }
        setDanisanlar(clients);
      } catch (err) {
        console.error("Dashboard veri hatası:", err);
        setDanisanlar([]);
      }
    }

    fetchData();
  }, []);

  const liste = Array.isArray(danisanlar) ? danisanlar : [];
  const plans = Array.isArray(planlar) ? planlar : [];

  const toplamDanisan = liste.length;
  const aktifDanisan = liste.filter((d) => d.durum === "Aktif").length;
  const pasifDanisan = liste.filter((d) => d.durum === "Pasif").length;
  const aktifPlan = plans.filter((p) => p.durum === "Aktif").length;

  const takipGerekenler = liste.filter(
    (d) => d.durum === "Pasif" || Math.abs(Number(d.kilo) - Number(d.hedef)) >= 8
  );

  const hedefeYakinlar = liste.filter(
    (d) => Math.abs(Number(d.kilo) - Number(d.hedef)) <= 5
  );

  return (
    <div className="dy-page">
      <div className="dy-hero-dashboard dy-animated-card">
        <div>
          <p className="dy-hero-label">Danışan Yönetimi</p>
          <h2>Bugünkü danışan durum özeti</h2>
          <p>
            Aktif danışanları, hedefe yaklaşanları ve takip gerektiren kişileri
            bu ekrandan hızlıca görebilirsiniz.
          </p>
        </div>

        <div className="dy-hero-number">
          <span>{toplamDanisan}</span>
          <p>Toplam Danışan</p>
        </div>
      </div>

      <div className="dy-modern-stats">
        <div className="dy-modern-stat-card green-card">
          <div className="dy-stat-top">
            <span>Aktif Danışan</span>
            <div className="dy-stat-icon"><FiUserCheck /></div>
          </div>
          <strong>{aktifDanisan}</strong>
          <small>Takibi devam eden danışanlar</small>
        </div>

        <div className="dy-modern-stat-card blue-card">
          <div className="dy-stat-top">
            <span>Pasif Danışan</span>
            <div className="dy-stat-icon"><FiUserX /></div>
          </div>
          <strong>{pasifDanisan}</strong>
          <small>Uzun süredir işlem yapılmayanlar</small>
        </div>

        <div className="dy-modern-stat-card orange-card">
          <div className="dy-stat-top">
            <span>Aktif Plan</span>
            <div className="dy-stat-icon"><FiClipboard /></div>
          </div>
          <strong>{aktifPlan}</strong>
          <small>Şu an uygulanan beslenme planları</small>
        </div>

        <div className="dy-modern-stat-card pink-card">
          <div className="dy-stat-top">
            <span>Bugünkü Kayıt</span>
            <div className="dy-stat-icon"><FiEdit3 /></div>
          </div>
          <strong>{gunlukKayitlar.length}</strong>
          <small>Bugün girilen takip kayıtları</small>
        </div>
      </div>

      <div className="dy-dashboard-split">
        <div className="dy-card dy-animated-card">
          <h3><FiAlertCircle /> Öncelikli Takip Gerekenler</h3>

          <div className="dy-priority-list">
            {takipGerekenler.length === 0 ? (
              <p>Şu an takip gerektiren danışan bulunmuyor.</p>
            ) : (
              takipGerekenler.map((d) => (
                <div className="dy-priority-item" key={d.id}>
                  <div>
                    <strong>{d.fullName}</strong>
                    <p>{d.kilo} kg → hedef {d.hedef} kg</p>
                  </div>
                  <span className="dy-status passive">Takip</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dy-card dy-animated-card">
          <h3><FiTarget /> Hedefe Yaklaşanlar</h3>

          <div className="dy-priority-list">
            {hedefeYakinlar.length === 0 ? (
              <p>Henüz hedefe yaklaşan danışan yok.</p>
            ) : (
              hedefeYakinlar.map((d) => (
                <div className="dy-priority-item" key={d.id}>
                  <div>
                    <strong>{d.fullName}</strong>
                    <p>{d.kilo} kg → hedef {d.hedef} kg</p>
                  </div>
                  <span className="dy-status active">Yakın</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dy-card dy-long-section">
        <h3><FiActivity /> Günlük Özet</h3>

        <div className="dy-timeline">
          <div>
            <span><FiCalendar /></span>
            <p>Bugünkü danışan kontrolleri gözden geçirildi.</p>
          </div>

          <div>
            <span><FiUsers /></span>
            <p>Aktif danışanların hedef durumları kontrol edildi.</p>
          </div>

          <div>
            <span><FiClipboard /></span>
            <p>Plan yönetimi ve günlük kayıtlar takip edilmeye hazır.</p>
          </div>
        </div>
      </div>

      <div className="dy-card">
        <h3>Danışan Kartları</h3>

        <div className="dy-client-card-grid">
          {liste.map((d) => {
            const fark = Math.abs(Number(d.kilo) - Number(d.hedef));
            const hedefYuzde = Math.max(10, 100 - fark * 10);
            const initials = d.fullName
              ? d.fullName
                  .split(" ")
                  .filter(Boolean)
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)
              : "?";

            return (
              <div className="dy-client-card" key={d.id}>
                <div className="dy-client-top">
                  <div className="dy-client-avatar">{initials}</div>

                  <div>
                    <h4>{d.fullName}</h4>
                    <p>{d.yas != null && String(d.yas).trim() !== "" ? `${d.yas} yaş` : "—"}</p>
                  </div>
                </div>

                <div className="dy-client-info">
                  <p>
                    <span>Kilo</span>
                    <strong>{d.kilo} kg</strong>
                  </p>

                  <p>
                    <span>Hedef</span>
                    <strong>{d.hedef} kg</strong>
                  </p>

                  <p>
                    <span>Fark</span>
                    <strong>{fark} kg</strong>
                  </p>
                </div>

                <div className="dy-client-bottom">
                  <span
                    className={`dy-status ${
                      d.durum === "Aktif" ? "active" : "passive"
                    }`}
                  >
                    {d.durum}
                  </span>

                  <small>Son görüşme: {d.sonGorusme || "-"}</small>
                </div>

                <div className="dy-progress-area">
                  <div className="dy-progress-text">
                    <span>Hedef Süreci</span>
                    <strong>%{hedefYuzde}</strong>
                  </div>

                  <div className="dy-progress-bar">
                    <div
                      className="dy-progress-fill"
                      style={{ width: `${hedefYuzde}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="dy-client-btn"
                  onClick={() => onProfilGor?.(d)}
                >
                  Profili Gör
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DiyetisyenDashboard;
