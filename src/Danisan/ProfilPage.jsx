import { useState } from "react";
import { FiUser, FiSave, FiInfo, FiActivity, FiTarget } from "react-icons/fi";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // 3 saniye sonra başarı mesajını kaldır
  };

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "30px", fontWeight: "800", color: "#1e4d3b" }}>
        Profil Bilgilerim
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
        
        {/* SOL TARAF: Kullanıcı Özet Kartı */}
        <div className="card" style={{ padding: "40px", borderRadius: "24px", textAlign: "center", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <div style={{ 
            width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#f1f5f9", 
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto",
            border: "4px solid #10b981", color: "#10b981"
          }}>
            <FiUser size={50} />
          </div>
          <h3 style={{ margin: "0 0 5px 0", color: "#1e4d3b" }}>{form.fullName || "Kullanıcı"}</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "25px" }}>Danışan Hesabı</p>
          
          <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>BOY</div>
              <div style={{ fontWeight: "800", color: "#1e4d3b" }}>{form.boy} cm</div>
            </div>
            <div style={{ borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", padding: "0 20px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>KİLO</div>
              <div style={{ fontWeight: "800", color: "#1e4d3b" }}>{form.kilo} kg</div>
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700" }}>HEDEF</div>
              <div style={{ fontWeight: "800", color: "#10b981" }}>{form.hedef} kg</div>
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Düzenleme Formu */}
        <div className="card" style={{ padding: "30px", borderRadius: "24px", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>AD SOYAD</label>
              <input
                type="text"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>BOY (CM)</label>
              <input
                type="number"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.boy}
                onChange={(e) => setForm({ ...form, boy: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>KİLO (KG)</label>
              <input
                type="number"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.kilo}
                onChange={(e) => setForm({ ...form, kilo: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>HEDEF KİLO (KG)</label>
              <input
                type="number"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.hedef}
                onChange={(e) => setForm({ ...form, hedef: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>ALERJİLER</label>
              <input
                type="text"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.alerji}
                onChange={(e) => setForm({ ...form, alerji: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" }}>HASTALIKLAR</label>
              <input
                type="text"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }}
                value={form.hastalik}
                onChange={(e) => setForm({ ...form, hastalik: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                gridColumn: "span 2", padding: "15px", backgroundColor: saved ? "#10b981" : "#1e4d3b", 
                color: "white", border: "none", borderRadius: "12px", fontWeight: "700", 
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                transition: "0.3s", marginTop: "10px"
              }}
            >
              <FiSave /> {saved ? "Değişiklikler Kaydedildi!" : "Bilgileri Güncelle"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default ProfilPage;