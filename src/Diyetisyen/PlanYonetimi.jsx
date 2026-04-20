import { useState } from "react";

function PlanYonetimi({ planlar, addPlan, deletePlan }) {
  const [form, setForm] = useState({
    danisanAdi: "",
    baslik: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPlan(form);
    setForm({ danisanAdi: "", baslik: "" });
  };

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Plan Yönetimi</h2>

      <div className="dy-card">
        <h3>Yeni Plan Oluştur</h3>
        <form className="dy-form-grid" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Danışan adı"
            value={form.danisanAdi}
            onChange={(e) =>
              setForm({ ...form, danisanAdi: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Plan başlığı"
            value={form.baslik}
            onChange={(e) => setForm({ ...form, baslik: e.target.value })}
          />
          <button type="submit" className="dy-primary-btn">
            Ekle
          </button>
        </form>
      </div>

      <div className="dy-card">
        <h3>Mevcut Planlar</h3>
        <div className="dy-list">
          {planlar.map((plan) => (
            <div className="dy-list-item" key={plan.id}>
              <div>
                <strong>{plan.baslik}</strong>
                <p>{plan.danisanAdi}</p>
              </div>

              <button
                className="dy-danger-btn"
                onClick={() => deletePlan(plan.id)}
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
export default PlanYonetimi;