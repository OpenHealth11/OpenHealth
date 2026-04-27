function DiyetisyenDashboard({ danisanlar = [], planlar = [], gunlukKayitlar = [] }) {
  const toplamDanisan = danisanlar.length;
  const aktifDanisan = danisanlar.filter((d) => d.durum === "Aktif").length;
  const pasifDanisan = danisanlar.filter((d) => d.durum === "Pasif").length;
  const aktifPlan = planlar.filter((p) => p.durum === "Aktif").length;

  const takipGerekenler = danisanlar.filter(
    (d) => d.durum === "Pasif" || Math.abs(Number(d.kilo) - Number(d.hedef)) >= 8
  );

  const hedefeYakinlar = danisanlar.filter(
    (d) => Math.abs(Number(d.kilo) - Number(d.hedef)) <= 5
  );

  return (
    <div className="dy-page">
      <div className="dy-hero-dashboard">
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
        <div className="dy-modern-stat-card">
          <span>Aktif Danışan</span>
          <strong>{aktifDanisan}</strong>
        </div>

        <div className="dy-modern-stat-card">
          <span>Pasif Danışan</span>
          <strong>{pasifDanisan}</strong>
        </div>

        <div className="dy-modern-stat-card">
          <span>Aktif Plan</span>
          <strong>{aktifPlan}</strong>
        </div>

        <div className="dy-modern-stat-card">
          <span>Bugünkü Kayıt</span>
          <strong>{gunlukKayitlar.length}</strong>
        </div>
      </div>

      <div className="dy-dashboard-split">
        <div className="dy-card">
          <h3>Öncelikli Takip Gerekenler</h3>

          <div className="dy-priority-list">
            {takipGerekenler.length === 0 ? (
              <p>Şu an takip gerektiren danışan bulunmuyor.</p>
            ) : (
              takipGerekenler.map((d) => (
                <div className="dy-priority-item" key={d.id}>
                  <div>
                    <strong>{d.fullName}</strong>
                    <p>
                      {d.kilo} kg → hedef {d.hedef} kg
                    </p>
                  </div>
                  <span className="dy-status passive">Takip</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dy-card">
          <h3>Hedefe Yaklaşanlar</h3>

          <div className="dy-priority-list">
            {hedefeYakinlar.length === 0 ? (
              <p>Henüz hedefe yaklaşan danışan yok.</p>
            ) : (
              hedefeYakinlar.map((d) => (
                <div className="dy-priority-item" key={d.id}>
                  <div>
                    <strong>{d.fullName}</strong>
                    <p>
                      {d.kilo} kg → hedef {d.hedef} kg
                    </p>
                  </div>
                  <span className="dy-status active">Yakın</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dy-card">
        <h3>Danışan Kartları</h3>

        <div className="dy-client-card-grid">
          {danisanlar.map((d) => {
            const fark = Math.abs(Number(d.kilo) - Number(d.hedef));

            return (
              <div className="dy-client-card" key={d.id}>
                <div className="dy-client-top">
                  <div className="dy-client-avatar">
                    {d.fullName
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>

                  <div>
                    <h4>{d.fullName}</h4>
                    <p>{d.yas} yaş</p>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DiyetisyenDashboard;