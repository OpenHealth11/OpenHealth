function SuTakipPage({ water, addWater, removeWater }) {
  const yuzde = Math.round((water.icilen / water.hedef) * 100);

  return (
    <div className="page">
      <h2 className="page-title">Su Takibi</h2>

      <div className="card water-card">
        <h3>Bugünkü Su Tüketimi</h3>
        <div className="water-count">
          {water.icilen} / {water.hedef} bardak
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${yuzde}%` }} />
        </div>

        <p className="progress-text">%{yuzde} tamamlandı</p>

        <div className="water-actions">
          <button className="secondary-btn" onClick={removeWater}>
            -1 Bardak
          </button>
          <button className="primary-btn" onClick={addWater}>
            +1 Bardak
          </button>
        </div>
      </div>
    </div>
  );
}
export default SuTakipPage;