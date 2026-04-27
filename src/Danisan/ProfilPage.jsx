import { useState } from "react";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState(user);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
  };

  // İsimden baş harfleri çıkaran yardımcı fonksiyon
  const getInitials = (name) => {
    if (!name) return "D";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Tekrar eden stiller
  const labelStyle = { fontSize: "14px", fontWeight: "700", color: "#475569", marginLeft: "4px", display: "block", marginBottom: "8px" };
  const inputStyle = { width: "100%", padding: "16px 20px", fontSize: "16px", borderRadius: "16px", border: "2px solid #f1f5f9", backgroundColor: "#f8fafc", outline: "none", color: "#334155", boxSizing: "border-box", transition: "all 0.2s" };

  return (
    <div style={{ padding: "10px", maxWidth: "1000px", margin: "0 auto" }}>
      
      {/* Başlık Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "#1f2937", margin: "0 0 8px 0", fontWeight: "800" }}>
            Profil Bilgilerim
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "15px", fontWeight: "500" }}>
            Kişisel verilerini ve sağlık hedeflerini buradan yönetebilirsin.
          </p>
        </div>
        <span style={{ backgroundColor: "#e6f4ea", color: "#1b5e20", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          👤 Danışan Profili
        </span>
      </div>

      {/* Profil Kartı */}
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '24px', 
        backgroundColor: '#ffffff', padding: '32px', 
        borderRadius: '24px', marginBottom: '32px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
        borderTop: '6px solid #10b981'
      }}>
        <div style={{ 
          width: '85px', height: '85px', 
          background: 'linear-gradient(135deg, #10b981, #059669)', 
          color: 'white', borderRadius: '24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          fontSize: '32px', fontWeight: '800',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
          transform: 'rotate(-5deg)'
        }}>
          <div style={{ transform: 'rotate(5deg)' }}>
            {getInitials(form.fullName)}
          </div>
        </div>
        
        <div>
          <h2 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '26px', fontWeight: '800' }}>
            {form.fullName || "Sevgili Danışan"}
          </h2>
          <span style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '800' }}>
            🌟 Aktif Danışan
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Sol: Fiziksel Bilgiler */}
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
              <span style={{ fontSize: '24px' }}>📏</span> Fiziksel Ölçümler
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Ad Soyad</label>
                <input 
                  type="text" 
                  value={form.fullName} 
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })} 
                  style={inputStyle}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Boy (cm)</label>
                  <input type="number" value={form.boy} onChange={(e) => setForm({ ...form, boy: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Kilo (kg)</label>
                  <input type="number" value={form.kilo} onChange={(e) => setForm({ ...form, kilo: e.target.value })} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Hedef Kilo (kg)</label>
                <input 
                  type="number" 
                  value={form.hedef} 
                  onChange={(e) => setForm({ ...form, hedef: e.target.value })} 
                  style={{...inputStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534'}}
                />
              </div>
            </div>
          </div>

          {/* Sağ: Sağlık Bilgileri */}
          <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
              <span style={{ fontSize: '24px' }}>🩺</span> Sağlık Durumu
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Besin Alerjileri</label>
                <input 
                  type="text" 
                  placeholder="Alerjilerinizi yazın..." 
                  value={form.alerji} 
                  onChange={(e) => setForm({ ...form, alerji: e.target.value })} 
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={labelStyle}>Kronik Hastalıklar</label>
                <textarea 
                  placeholder="Hastalıklarınızı yazın..." 
                  value={form.hastalik} 
                  onChange={(e) => setForm({ ...form, hastalik: e.target.value })} 
                  style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
          <button 
            type="submit" 
            style={{ 
              padding: '18px 48px', fontSize: '18px', fontWeight: '800', 
              color: '#ffffff', backgroundColor: '#1f2937', border: 'none', 
              borderRadius: '20px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: '12px', boxShadow: '0 10px 25px rgba(31, 41, 55, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            <span>💾</span> Değişiklikleri Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProfilPage;