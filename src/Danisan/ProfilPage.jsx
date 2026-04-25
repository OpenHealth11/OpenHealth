import { useState } from "react";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
  };

  // İsimden baş harfleri çıkaran küçük bir yardımcı fonksiyon (Örn: Merve Yarız -> MY)
  const getInitials = (name) => {
    if (!name) return "D";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="page">
      <h2 className="page-title">Profil Bilgilerim</h2>

      {/* --- YENİ EKLENEN: Üst Profil Kartı (Avatar ve İsim) --- */}
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', gap: '20px', 
          backgroundColor: '#e8f5e9', padding: '24px', 
          borderRadius: '12px', marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}
      >
        <div 
          style={{ 
            width: '80px', height: '80px', backgroundColor: '#1b5e20', 
            color: 'white', borderRadius: '50%', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', fontWeight: 'bold' 
          }}
        >
          {getInitials(form.fullName)}
        </div>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#1b5e20' }}>
            {form.fullName || "Sevgili Danışan"}
          </h2>
          <span style={{ backgroundColor: '#c8e6c9', color: '#2e7d32', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' }}>
            🌟 Aktif Danışan
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* --- YENİ EKLENEN: Ekranı İkiye Bölen Grid Yapısı --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Sol Kart: Fiziksel Ölçümler */}
          <div className="card form-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
              📏 Fiziksel Ölçümler
            </h3>
            
            <div className="profile-grid">
              <div>
                <label>Ad Soyad</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label>Boy (cm)</label>
                <input type="number" value={form.boy} onChange={(e) => setForm({ ...form, boy: e.target.value })} />
              </div>
              <div>
                <label>Mevcut Kilo (kg)</label>
                <input type="number" value={form.kilo} onChange={(e) => setForm({ ...form, kilo: e.target.value })} />
              </div>
              <div>
                <label>Hedef Kilo (kg)</label>
                <input type="number" value={form.hedef} onChange={(e) => setForm({ ...form, hedef: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Sağ Kart: Sağlık Bilgileri */}
          <div className="card form-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#333' }}>
              🩺 Sağlık Durumu
            </h3>
            
            <div className="profile-grid">
              <div>
                <label>Alerjiler</label>
                <input type="text" placeholder="Örn: Yer fıstığı, Laktoz..." value={form.alerji} onChange={(e) => setForm({ ...form, alerji: e.target.value })} />
              </div>
              <div>
                <label>Kronik Hastalık</label>
                <input type="text" placeholder="Örn: Diyabet, Tansiyon..." value={form.hastalik} onChange={(e) => setForm({ ...form, hastalik: e.target.value })} />
              </div>
            </div>
          </div>

        </div>

        {/* Kaydet Butonu Alanı */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button 
            type="submit" 
            className="primary-btn save-btn" 
            style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            💾 Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilPage;