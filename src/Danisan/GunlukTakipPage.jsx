import { useState } from "react";

function GunlukTakipPage({
  kayitlar,
  addGunlukKayit,
  deleteGunlukKayit,
}) {
  const [form, setForm] = useState({
    besin: "",
    kalori: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addGunlukKayit(form);
    setForm({ besin: "", kalori: "" });
  };

  const toplamKalori = kayitlar.reduce((sum, item) => sum + item.kalori, 0);

  return (
    <div className="page">
      <h2 className="page-title">Günlük Takip</h2>

      <div className="card form-card">
        <h3>Yeni Besin Ekle</h3>
        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Besin adı"
            value={form.besin}
            onChange={(e) => setForm({ ...form, besin: e.target.value })}
          />
          <input
            type="number"
            placeholder="Kalori"
            value={form.kalori}
            onChange={(e) => setForm({ ...form, kalori: e.target.value })}
          />
          <button type="submit" className="primary-btn">
            Ekle
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-head">
          <h3>Günlük Kayıtlar</h3>
          <span className="badge">{toplamKalori} kcal</span>
        </div>

        <div className="list">
          {kayitlar.map((item) => (
            <div className="list-item" key={item.id}>
              <div>
                <strong>{item.besin}</strong>
                <p>{item.kalori} kcal</p>
              </div>
              <button
                className="danger-btn"
                onClick={() => deleteGunlukKayit(item.id)}
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default GunlukTakipPage;