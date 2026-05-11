import { useState } from "react";
import { FiUser, FiSave, FiUpload, FiHeart, FiActivity, FiFileText } from "react-icons/fi";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    boy: user?.boy || "",
    kilo: user?.kilo || "",
    hedef: user?.hedef || "",
    alerji: user?.alerji || "Yok",
    hastalik: user?.hastalik || "Yok",
    ilaclar: user?.ilaclar || "",
    kanDegerleriDosya: user?.kanDegerleriDosya || null,
  });

  const [saved, setSaved] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setForm({
      ...form,
      kanDegerleriDosya: file,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(form);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={pageTitleStyle}>
        Profil Bilgilerim
      </h2>

      <div style={pageGridStyle}>
        {/* SOL KART */}
        <div className="card" style={leftCardStyle}>
          <div style={avatarStyle}>
            <FiUser size={50} />
          </div>

          <h3 style={{ margin: "0 0 5px 0", color: "#1e4d3b" }}>
            {form.fullName || "Kullanıcı"}
          </h3>

          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "25px" }}>
            Danışan Hesabı
          </p>

          <div style={statRowStyle}>
            <div>
              <div style={statLabelStyle}>BOY</div>
              <div style={statValueStyle}>{form.boy || "-"} cm</div>
            </div>

            <div style={middleStatStyle}>
              <div style={statLabelStyle}>KİLO</div>
              <div style={statValueStyle}>{form.kilo || "-"} kg</div>
            </div>

            <div>
              <div style={statLabelStyle}>HEDEF</div>
              <div style={{ ...statValueStyle, color: "#10b981" }}>
                {form.hedef || "-"} kg
              </div>
            </div>
          </div>

          {/* SOL TARAFI DOLDURAN SAĞLIK ÖZETİ */}
          <div style={healthBoxWrapperStyle}>
            <h4 style={healthTitleStyle}>Sağlık Özeti</h4>

            <div style={infoBoxStyle}>
              <div style={iconCircleStyle}>
                <FiHeart />
              </div>
              <div>
                <span style={infoLabelStyle}>Alerjiler</span>
                <p style={infoTextStyle}>{form.alerji || "Belirtilmedi"}</p>
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={iconCircleStyle}>
                <FiActivity />
              </div>
              <div>
                <span style={infoLabelStyle}>Hastalıklar</span>
                <p style={infoTextStyle}>{form.hastalik || "Belirtilmedi"}</p>
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={iconCircleStyle}>
                <FiFileText />
              </div>
              <div>
                <span style={infoLabelStyle}>Kullandığı İlaçlar</span>
                <p style={infoTextStyle}>
                  {form.ilaclar ? form.ilaclar : "Henüz ilaç bilgisi girilmedi"}
                </p>
              </div>
            </div>

            <div style={infoBoxStyle}>
              <div style={iconCircleStyle}>
                <FiUpload />
              </div>
              <div>
                <span style={infoLabelStyle}>Kan Değerleri</span>
                <p style={infoTextStyle}>
                  {form.kanDegerleriDosya
                    ? form.kanDegerleriDosya.name
                    : "Henüz dosya yüklenmedi"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ FORM */}
        <div className="card" style={rightCardStyle}>
          <form onSubmit={handleSubmit} style={formGridStyle}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>AD SOYAD</label>
              <input
                type="text"
                style={inputStyle}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>BOY (CM)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.boy}
                onChange={(e) => setForm({ ...form, boy: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>KİLO (KG)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.kilo}
                onChange={(e) => setForm({ ...form, kilo: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>HEDEF KİLO (KG)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.hedef}
                onChange={(e) => setForm({ ...form, hedef: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>ALERJİLER</label>
              <input
                type="text"
                style={inputStyle}
                value={form.alerji}
                onChange={(e) => setForm({ ...form, alerji: e.target.value })}
              />
            </div>

            <div>
              <label style={labelStyle}>HASTALIKLAR</label>
              <input
                type="text"
                style={inputStyle}
                value={form.hastalik}
                onChange={(e) => setForm({ ...form, hastalik: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>KULLANDIĞI İLAÇLAR</label>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "90px",
                  resize: "vertical",
                }}
                placeholder="Örn: D vitamini, demir ilacı, tiroid ilacı..."
                value={form.ilaclar}
                onChange={(e) => setForm({ ...form, ilaclar: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>KAN DEĞERLERİ YÜKLE</label>

              <label style={uploadBoxStyle}>
                <FiUpload />
                {form.kanDegerleriDosya
                  ? form.kanDegerleriDosya.name
                  : "PDF / Görsel dosya seç"}

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <button
              type="submit"
              style={{
                ...buttonStyle,
                backgroundColor: saved ? "#10b981" : "#1e4d3b",
              }}
            >
              <FiSave />
              {saved ? "Değişiklikler Kaydedildi!" : "Bilgileri Güncelle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const pageTitleStyle = {
  marginBottom: "30px",
  fontWeight: "800",
  color: "#1e4d3b",
};

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "30px",
};

const leftCardStyle = {
  padding: "40px",
  borderRadius: "24px",
  textAlign: "center",
  backgroundColor: "white",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
};

const rightCardStyle = {
  padding: "30px",
  borderRadius: "24px",
  backgroundColor: "white",
  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
};

const avatarStyle = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  backgroundColor: "#f1f5f9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px auto",
  border: "4px solid #10b981",
  color: "#10b981",
};

const statRowStyle = {
  display: "flex",
  justifyContent: "space-around",
  borderTop: "1px solid #f1f5f9",
  paddingTop: "20px",
};

const statLabelStyle = {
  fontSize: "12px",
  color: "#94a3b8",
  fontWeight: "700",
};

const statValueStyle = {
  fontWeight: "800",
  color: "#1e4d3b",
};

const middleStatStyle = {
  borderLeft: "1px solid #f1f5f9",
  borderRight: "1px solid #f1f5f9",
  padding: "0 20px",
};

const healthBoxWrapperStyle = {
  marginTop: "30px",
  paddingTop: "25px",
  borderTop: "1px solid #f1f5f9",
  textAlign: "left",
};

const healthTitleStyle = {
  color: "#1e4d3b",
  fontSize: "17px",
  fontWeight: "800",
  marginBottom: "15px",
};

const infoBoxStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  borderRadius: "16px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  marginBottom: "12px",
};

const iconCircleStyle = {
  width: "38px",
  height: "38px",
  minWidth: "38px",
  borderRadius: "50%",
  backgroundColor: "#ecfdf5",
  color: "#10b981",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
};

const infoLabelStyle = {
  display: "block",
  color: "#64748b",
  fontWeight: "700",
  fontSize: "12px",
  marginBottom: "3px",
};

const infoTextStyle = {
  margin: 0,
  color: "#1e4d3b",
  fontWeight: "700",
  fontSize: "14px",
  wordBreak: "break-word",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "700",
  color: "#64748b",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  outline: "none",
};

const uploadBoxStyle = {
  border: "2px dashed #cbd5e1",
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  cursor: "pointer",
  color: "#1e4d3b",
  fontWeight: "700",
  backgroundColor: "#f8fafc",
};

const buttonStyle = {
  gridColumn: "span 2",
  padding: "15px",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  transition: "0.3s",
  marginTop: "10px",
};

export default ProfilPage;