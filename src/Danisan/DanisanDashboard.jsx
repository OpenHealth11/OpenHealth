function DanisanDashboard({ data }) {
  const toplamKalori = data.gunlukKayitlar.reduce(
    (total, item) => total + item.kalori,
    0
  );

  return (
    <div className="page">
      <h2 className="page-title">Genel Bakış</h2>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Günlük Kalori</h3>
          <p>{toplamKalori} kcal</p>
        </div>

        <div className="card stat-card">
          <h3>Su Takibi</h3>
          <p>
            {data.water.icilen} / {data.water.hedef} bardak
          </p>
        </div>

        <div className="card stat-card">
          <h3>Mevcut Kilo</h3>
          <p>{data.user.kilo} kg</p>
        </div>

        <div className="card stat-card">
          <h3>Hedef Kilo</h3>
          <p>{data.user.hedef} kg</p>
        </div>
      </div>

      <div className="two-column">
        <div className="card">
          <h3>Bugünkü Öğün Planı</h3>
          <div className="list">
            {data.meals.map((meal) => (
              <div className="list-item" key={meal.id}>
                <div>
                  <strong>{meal.ogun}</strong>
                  <p>
                    {meal.saat} • {meal.yemek}
                  </p>
                </div>
                <span>{meal.kalori} kcal</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Son Günlük Kayıtlar</h3>
          <div className="list">
            {data.gunlukKayitlar.map((item) => (
              <div className="list-item" key={item.id}>
                <div>
                  <strong>{item.besin}</strong>
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
export default DanisanDashboard;