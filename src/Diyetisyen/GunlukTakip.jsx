function GunlukTakip({ gunlukKayitlar }) {
  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Günlük Takip</h2>

      <div className="dy-card">
        <div className="dy-list">
          {gunlukKayitlar.map((item) => (
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
  );
}
export default GunlukTakip;