function OnayBekleyenler({
  talepler = [],
  onaylaTalep,
  reddetTalep,
}) {
  const liste = Array.isArray(talepler) ? talepler : [];

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Onay Bekleyenler</h2>

      <div className="dy-card">
        <div className="dy-list">
          {liste.length === 0 ? (
            <p>Bekleyen talep yok.</p>
          ) : (
            liste.map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.danisanAdi}</strong>
                  <p>{item.talep}</p>
                  <small>{item.tarih}</small>
                </div>

                <div className="dy-action-group">
                  <button
                    type="button"
                    className="dy-secondary-btn"
                    onClick={() => onaylaTalep?.(item.id)}
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    className="dy-danger-btn"
                    onClick={() => reddetTalep?.(item.id)}
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default OnayBekleyenler;
