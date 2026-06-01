import { useEffect, useRef, useState } from "react";
import { FiUser, FiSave, FiHeart, FiActivity, FiFileText, FiUpload, FiUploadCloud, FiCalendar } from "react-icons/fi";
import { validateProfileMetrics } from "../../validation.js";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState({
    fullName: "",
    yas: "", // Yeni: Yaş alanı
    boy: "",
    kilo: "",
    hedef: "",
    alerji: "Yok",
    hastalik: "Yok",
    ilaclar: "",
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const kanPdfInputRef = useRef(null);
  const [kanPdfDrag, setKanPdfDrag] = useState(false);
  const [kanPdfSecimi, setKanPdfSecimi] = useState(null);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      yas: user?.yas ?? "", // Yeni
      boy: user?.boy ?? "",
      kilo: user?.kilo ?? "",
      hedef: user?.hedef ?? "",
      alerji: user?.alerji || "Yok",
      hastalik: user?.hastalik || "Yok",
      ilaclar: user?.kullanilanIlaclar || "",
    });
  }, [user]);

  // Sayısal girişleri ve karakter uzunluğunu kontrol eden yardımcı fonksiyon
  const handleNumericInput = (field, value, maxLength) => {
    if (value.length <= maxLength) {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const metrics = validateProfileMetrics({
      boy: form.boy,
      kilo: form.kilo,
      hedef: form.hedef,
    });

    if (!metrics.ok) {
      alert(metrics.error);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        yas: form.yas, // Yeni
        boy: form.boy,
        kilo: form.kilo,
        hedef: form.hedef,
        alerji: form.alerji,
        hastalik: form.hastalik,
        kullanilanIlaclar: form.ilaclar,
      };

      const result = await updateProfile(payload);

      if (result?.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  function kanPdfDosyaSec(fileList) {
    const f = fileList?.[0];
    if (!f) return;
    const pdfMi = f.type === "application/pdf" || String(f.name).toLowerCase().endsWith(".pdf");
    
    if (!pdfMi) {
      alert("Lütfen geçerli bir PDF dosyası seçin.");
      return;
    }

    const maxMb = 15;
    if (f.size > maxMb * 1024 * 1024) {
      alert(`Dosya boyutu en fazla ${maxMb} MB olabilir.`);
      return;
    }
    setKanPdfSecimi({ file: f });
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={pageTitleStyle}>Profil Bilgilerim</h2>

      <div style={pageGridStyle}>
        {/* SOL KART - ÖZET */}
        <div className="card" style={leftCardStyle}>
          <div style={avatarStyle}>
            <FiUser size={50} />
          </div>

          <h3 style={{ margin: "0 0 5px 0", color: "#1e4d3b" }}>{form.fullName || "Kullanıcı"}</h3>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "25px" }}>Danışan Hesabı</p>

          <div style={statRowStyle}>
            <div>
              <div style={statLabelStyle}>YAŞ</div>
              <div style={statValueStyle}>{form.yas || "-"}</div>
            </div>
            <div style={middleStatStyle}>
              <div style={statLabelStyle}>BOY</div>
              <div style={statValueStyle}>{form.boy || "-"} cm</div>
            </div>
            <div>
              <div style={statLabelStyle}>KİLO</div>
              <div style={statValueStyle}>{form.kilo || "-"} kg</div>
            </div>
          </div>

          <div style={healthBoxWrapperStyle}>
            <h4 style={healthTitleStyle}>Sağlık Özeti</h4>

            <div style={infoBoxStyle}><div style={iconCircleStyle}><FiHeart /></div>
              <div><span style={infoLabelStyle}>Alerjiler</span><p style={infoTextStyle}>{form.alerji}</p></div>
            </div>

            <div style={infoBoxStyle}><div style={iconCircleStyle}><FiActivity /></div>
              <div><span style={infoLabelStyle}>Hastalıklar</span><p style={infoTextStyle}>{form.hastalik}</p></div>
            </div>

            <div style={infoBoxStyle}><div style={iconCircleStyle}><FiFileText /></div>
              <div><span style={infoLabelStyle}>Kullandığı İlaçlar</span><p style={infoTextStyle}>{form.ilaclar || "Henüz girilmedi"}</p></div>
            </div>

            <div style={{ ...infoBoxStyle, backgroundColor: kanPdfSecimi ? "#ecfdf5" : "#f8fafc" }}>
              <div style={{ ...iconCircleStyle, backgroundColor: kanPdfSecimi ? "#10b981" : "#ecfdf5", color: kanPdfSecimi ? "white" : "#10b981" }}>
                <FiUpload />
              </div>
              <div>
                <span style={infoLabelStyle}>Kan Değerleri</span>
                <p style={infoTextStyle}>{kanPdfSecimi ? kanPdfSecimi.file.name : "Henüz dosya yüklenmedi"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ KART - FORM */}
        <div className="card" style={rightCardStyle}>
          <form onSubmit={handleSubmit} style={formGridStyle}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>AD SOYAD</label>
              <input type="text" style={inputStyle} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>YAŞ</label>
              <input 
                type="number" 
                style={inputStyle} 
                value={form.yas} 
                placeholder="Örn: 25"
                onChange={(e) => handleNumericInput("yas", e.target.value, 3)} 
              />
            </div>

            <div>
              <label style={labelStyle}>BOY (CM)</label>
              <input 
                type="number" 
                step="0.1" 
                style={inputStyle} 
                value={form.boy} 
                placeholder="Örn: 175"
                onChange={(e) => handleNumericInput("boy", e.target.value, 3)} 
              />
            </div>

            <div>
              <label style={labelStyle}>KİLO (KG)</label>
              <input 
                type="number" 
                step="0.1" 
                style={inputStyle} 
                value={form.kilo} 
                placeholder="Örn: 70.5"
                onChange={(e) => handleNumericInput("kilo", e.target.value, 4)} 
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>HEDEF KİLO (KG)</label>
              <input 
                type="number" 
                step="0.1" 
                style={inputStyle} 
                value={form.hedef} 
                placeholder="Örn: 65"
                onChange={(e) => handleNumericInput("hedef", e.target.value, 4)} 
              />
            </div>

            <div><label style={labelStyle}>ALERJİLER</label><input type="text" style={inputStyle} value={form.alerji} onChange={(e) => setForm({ ...form, alerji: e.target.value })} /></div>
            <div><label style={labelStyle}>HASTALIKLAR</label><input type="text" style={inputStyle} value={form.hastalik} onChange={(e) => setForm({ ...form, hastalik: e.target.value })} /></div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>KULLANDIĞI İLAÇLAR</label>
              <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={form.ilaclar} onChange={(e) => setForm({ ...form, ilaclar: e.target.value })} />
            </div>

            <div style={{ gridColumn: "span 2", marginTop: "10px", paddingTop: "20px", borderTop: "1px solid #f1f5f9" }}>
              <label style={labelStyle}>KAN TETKİK RAPORU (PDF)</label>
              <input ref={kanPdfInputRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => kanPdfDosyaSec(e.target.files)} />
              
              <div
                onClick={() => kanPdfInputRef.current?.click()}
                onDragEnter={(e) => { handleDrag(e); setKanPdfDrag(true); }}
                onDragOver={handleDrag}
                onDragLeave={(e) => { handleDrag(e); setKanPdfDrag(false); }}
                onDrop={(e) => { handleDrag(e); setKanPdfDrag(false); kanPdfDosyaSec(e.dataTransfer.files); }}
                style={{
                  ...uploadBoxStyle,
                  border: `2px dashed ${kanPdfDrag ? "#10b981" : "#cbd5e1"}`,
                  backgroundColor: kanPdfDrag ? "#ecfdf5" : "#f8fafc"
                }}
              >
                <FiUploadCloud size={30} style={{ marginBottom: "10px", color: "#10b981" }} />
                <strong style={{ display: "block", color: "#1e4d3b" }}>PDF sürükleyin veya tıklayın</strong>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>Maksimum 15 MB</span>
              </div>

              {kanPdfSecimi && (
                <div style={selectedFileBadgeStyle}>
                  <FiFileText /> <span>{kanPdfSecimi.file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setKanPdfSecimi(null); }} style={removeFileBtnStyle}>Kaldır</button>
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} style={{ ...buttonStyle, backgroundColor: saved ? "#10b981" : "#1e4d3b" }}>
              <FiSave /> {saving ? "Kaydediliyor..." : saved ? "Değişiklikler Kaydedildi!" : "Bilgileri Güncelle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// STİLLER (Mevcut stilleriniz korunmuştur)
const pageTitleStyle = { marginBottom: "30px", fontWeight: "800", color: "#1e4d3b" };
const pageGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" };
const leftCardStyle = { padding: "40px", borderRadius: "24px", textAlign: "center", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" };
const rightCardStyle = { padding: "30px", borderRadius: "24px", backgroundColor: "white", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" };
const avatarStyle = { width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px auto", border: "4px solid #10b981", color: "#10b981" };
const statRowStyle = { display: "flex", justifyContent: "space-around", borderTop: "1px solid #f1f5f9", paddingTop: "20px" };
const statLabelStyle = { fontSize: "12px", color: "#94a3b8", fontWeight: "700" };
const statValueStyle = { fontWeight: "800", color: "#1e4d3b" };
const middleStatStyle = { borderLeft: "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", padding: "0 20px" };
const healthBoxWrapperStyle = { marginTop: "30px", paddingTop: "25px", borderTop: "1px solid #f1f5f9", textAlign: "left" };
const healthTitleStyle = { color: "#1e4d3b", fontSize: "17px", fontWeight: "800", marginBottom: "15px" };
const infoBoxStyle = { display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "12px" };
const iconCircleStyle = { width: "38px", height: "38px", minWidth: "38px", borderRadius: "50%", backgroundColor: "#ecfdf5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" };
const infoLabelStyle = { display: "block", color: "#64748b", fontWeight: "700", fontSize: "12px", marginBottom: "3px" };
const infoTextStyle = { margin: 0, color: "#1e4d3b", fontWeight: "700", fontSize: "14px", wordBreak: "break-word" };
const formGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" };
const labelStyle = { display: "block", marginBottom: "8px", fontWeight: "700", color: "#64748b", fontSize: "13px" };
const inputStyle = { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" };
const uploadBoxStyle = { border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "30px", textAlign: "center", cursor: "pointer", transition: "0.2s" };
const selectedFileBadgeStyle = { marginTop: "12px", padding: "10px", backgroundColor: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#15803d", border: "1px solid #bbf7d0" };
const removeFileBtnStyle = { marginLeft: "auto", border: "none", background: "none", color: "#ef4444", fontWeight: "700", cursor: "pointer" };
const buttonStyle = { gridColumn: "span 2", padding: "15px", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "0.3s", marginTop: "10px" };

export default ProfilPage;