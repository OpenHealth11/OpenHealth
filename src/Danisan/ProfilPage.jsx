import { useEffect, useRef, useState } from "react";
import { FiUser, FiSave, FiHeart, FiActivity, FiFileText, FiUpload } from "react-icons/fi";
import { validateProfileMetrics } from "../../validation.js";

function ProfilPage({ user, updateProfile }) {
  const [form, setForm] = useState({
    fullName: "",
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
      boy: user?.boy ?? "",
      kilo: user?.kilo ?? "",
      hedef: user?.hedef ?? "",
      alerji: user?.alerji || "Yok",
      hastalik: user?.hastalik || "Yok",
      ilaclar: user?.kullanilanIlaclar || "",
    });
  }, [
    user?.id,
    user?.fullName,
    user?.boy,
    user?.kilo,
    user?.hedef,
    user?.alerji,
    user?.hastalik,
    user?.kullanilanIlaclar,
  ]);

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
    const pdfMi =
      f.type === "application/pdf" || String(f.name).toLowerCase().endsWith(".pdf");
    if (!pdfMi) {
      alert("Lütfen PDF dosyası seçin.");
      return;
    }
    const maxMb = 15;
    if (f.size > maxMb * 1024 * 1024) {
      alert(`Dosya boyutu en fazla ${maxMb} MB olabilir.`);
      return;
    }
    setKanPdfSecimi({ file: f });
  }

  function kanPdfSurukleOlay(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={pageTitleStyle}>
        Profil Bilgilerim
      </h2>

      <div style={pageGridStyle}>
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

          <div
            style={{
              ...statRowStyle,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
              textAlign: "center",
            }}
          >
            <div>
              <div style={statLabelStyle}>BOY</div>
              <div style={statValueStyle}>{form.boy || "-"} cm</div>
            </div>

            <div>
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
          </div>
        </div>

        <div className="card" style={rightCardStyle}>
          <form onSubmit={handleSubmit} style={formGridStyle}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>AD SOYAD</label>
              <input
                type="text"
                style={inputStyle}
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>BOY (CM)</label>
              <input
                type="number"
                style={inputStyle}
                min={40}
                max={250}
                step={0.1}
                value={form.boy}
                onChange={(e) => setForm({ ...form, boy: e.target.value })}
              />
              <small style={{ color: "#94a3b8" }}>İzinli: 40–250 cm (boş bırakılabilir)</small>
            </div>

            <div>
              <label style={labelStyle}>KİLO (KG)</label>
              <input
                type="number"
                style={inputStyle}
                min={25}
                max={350}
                step={0.1}
                value={form.kilo}
                onChange={(e) => setForm({ ...form, kilo: e.target.value })}
              />
              <small style={{ color: "#94a3b8" }}>İzinli: 25–350 kg</small>
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={labelStyle}>HEDEF KİLO (KG)</label>
              <input
                type="number"
                style={inputStyle}
                min={25}
                max={350}
                step={0.1}
                value={form.hedef}
                onChange={(e) => setForm({ ...form, hedef: e.target.value })}
              />
              <small style={{ color: "#94a3b8" }}>İzinli: 25–350 kg</small>
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
                maxLength={4000}
                value={form.ilaclar}
                onChange={(e) => setForm({ ...form, ilaclar: e.target.value })}
              />
            </div>

            <div
              style={{
                gridColumn: "span 2",
                marginTop: "8px",
                paddingTop: "20px",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <label style={labelStyle}>KAN TETKİK RAPORU (PDF)</label>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 14px", lineHeight: 1.5 }}>
                Kan değerlerinizi içeren raporu PDF olarak ekleyebilirsiniz. Sunucu ve veritabanı
                tarafı hazır olduğunda kayıt bağlanacak; şimdilik seçim yalnızca bu sayfada önizlenir.
              </p>

              <input
                ref={kanPdfInputRef}
                type="file"
                accept="application/pdf,.pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  kanPdfDosyaSec(e.target.files);
                  e.target.value = "";
                }}
              />

              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    kanPdfInputRef.current?.click();
                  }
                }}
                onDragEnter={(e) => {
                  kanPdfSurukleOlay(e);
                  setKanPdfDrag(true);
                }}
                onDragOver={kanPdfSurukleOlay}
                onDragLeave={(e) => {
                  kanPdfSurukleOlay(e);
                  setKanPdfDrag(false);
                }}
                onDrop={(e) => {
                  kanPdfSurukleOlay(e);
                  setKanPdfDrag(false);
                  kanPdfDosyaSec(e.dataTransfer.files);
                }}
                onClick={() => kanPdfInputRef.current?.click()}
                style={{
                  border: `2px dashed ${kanPdfDrag ? "#10b981" : "#cbd5e1"}`,
                  borderRadius: "16px",
                  padding: "28px 20px",
                  textAlign: "center",
                  backgroundColor: kanPdfDrag ? "#ecfdf5" : "#f8fafc",
                  cursor: "pointer",
                  transition: "border-color 0.2s, background-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    margin: "0 auto 12px",
                    borderRadius: "14px",
                    backgroundColor: "#ecfdf5",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiUpload size={26} />
                </div>
                <strong style={{ color: "#1e4d3b", display: "block", marginBottom: "6px" }}>
                  PDF sürükleyip bırakın veya tıklayarak seçin
                </strong>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                  Yalnızca .pdf · en fazla 15 MB
                </span>
              </div>

              {kanPdfSecimi ? (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <FiFileText color="#15803d" size={22} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#166534", fontSize: "14px" }}>
                        Seçilen dosya
                      </div>
                      <div
                        style={{
                          color: "#15803d",
                          fontSize: "13px",
                          wordBreak: "break-all",
                        }}
                      >
                        {kanPdfSecimi.file.name}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setKanPdfSecimi(null);
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1px solid #fca5a5",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  >
                    Seçimi kaldır
                  </button>
                </div>
              ) : null}

              <p style={{ color: "#94a3b8", fontSize: "12px", margin: "14px 0 0" }}>
                Not: Sayfayı yenilerseniz seçim sıfırlanır (kalıcı kayıt henüz yok).
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...buttonStyle,
                backgroundColor: saved ? "#10b981" : "#1e4d3b",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <FiSave />
              {saving ? "Kaydediliyor…" : saved ? "Kaydedildi!" : "Bilgileri Güncelle"}
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
