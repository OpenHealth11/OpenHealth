import { useState } from "react";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
  };

  return (
    <div className="page">
      <h2 className="page-title">Profil Bilgilerim</h2>

      <div className="card form-card">
        <form className="profile-grid" onSubmit={handleSubmit}>
          <div>
            <label>Ad Soyad</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
          </div>

          <div>
            <label>Boy (cm)</label>
            <input
              type="number"
              value={form.boy}
              onChange={(e) => setForm({ ...form, boy: e.target.value })}
            />
          </div>

          <div>
            <label>Kilo (kg)</label>
            <input
              type="number"
              value={form.kilo}
              onChange={(e) => setForm({ ...form, kilo: e.target.value })}
            />
          </div>

          <div>
            <label>Hedef (kg)</label>
            <input
              type="number"
              value={form.hedef}
              onChange={(e) => setForm({ ...form, hedef: e.target.value })}
            />
          </div>

          <div>
            <label>Alerji</label>
            <input
              type="text"
              value={form.alerji}
              onChange={(e) => setForm({ ...form, alerji: e.target.value })}
            />
          </div>

          <div>
            <label>Hastalık</label>
            <input
              type="text"
              value={form.hastalik}
              onChange={(e) => setForm({ ...form, hastalik: e.target.value })}
            />
          </div>

          <button type="submit" className="primary-btn save-btn">
            Kaydet
          </button>
        </form>
      </div>
    </div>
  );
}
export default ProfilPage;