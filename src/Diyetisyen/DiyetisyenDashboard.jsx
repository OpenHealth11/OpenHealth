function DiyetisyenDashboard({ data }) {
  const aktifDanisanSayisi = data.danisanlar.filter(
    (item) => item.durum === "Aktif"
  ).length;

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Genel Bakış</h2>

      <div className="dy-stats-grid">
        <div className="dy-card dy-stat-card">
          <h3>Toplam Danışan</h3>
          <p>{data.danisanlar.length}</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>Aktif Danışan</h3>
          <p>{aktifDanisanSayisi}</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>Aktif Plan</h3>
          <p>{data.planlar.length}</p>
        </div>

        <div className="dy-card dy-stat-card">
          <h3>Bekleyen Talep</h3>
          <p>{data.onayBekleyenler.length}</p>
        </div>
      </div>

      <div className="dy-two-column">
        <div className="dy-card">
          <h3>Son Bildirimler</h3>
          <div className="dy-list">
            {data.bildirimler.slice(0, 3).map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.mesaj}</strong>
                  <p>{item.saat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dy-card">
          <h3>Son Günlük Kayıtlar</h3>
          <div className="dy-list">
            {data.gunlukKayitlar.slice(0, 3).map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.danisanAdi}</strong>
                  <p>
                    {item.ogun} • {item.detay}
                  </p>
                </div>
                <span>{item.kalori} kcal</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default DiyetisyenDashboard;