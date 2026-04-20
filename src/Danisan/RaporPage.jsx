function RaporPage({ rapor }) {
  return (
    <div className="page">
      <h2 className="page-title">Haftalık Rapor</h2>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Ortalama Kalori</h3>
          <p>{rapor.ortalamaKalori} kcal</p>
        </div>

        <div className="card stat-card">
          <h3>Su Ortalaması</h3>
          <p>{rapor.suOrtalama} bardak</p>
        </div>

        <div className="card stat-card">
          <h3>Kilo Değişimi</h3>
          <p>{rapor.kiloDegisim}</p>
        </div>

        <div className="card stat-card">
          <h3>Uyum Oranı</h3>
          <p>{rapor.uyumOrani}</p>
        </div>
      </div>
    </div>
  );
}
export default RaporPage;