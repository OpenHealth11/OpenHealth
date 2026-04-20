function DiyetisyenTopbar({
  talepler,
  onaylaTalep,
  reddetTalep,
}) {
  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Onay Bekleyenler</h2>

      <div className="dy-card">
        <div className="dy-list">
          {talepler.length === 0 ? (
            <p>Bekleyen talep yok.</p>
          ) : (
            talepler.map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.danisanAdi}</strong>
                  <p>{item.talep}</p>
                  <small>{item.tarih}</small>
                </div>

                <div className="dy-action-group">
                  <button
                    className="dy-secondary-btn"
                    onClick={() => onaylaTalep(item.id)}
                  >
                    Onayla
                  </button>
                  <button
                    className="dy-danger-btn"
                    onClick={() => reddetTalep(item.id)}
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
export default DiyetisyenTopbar;
