import { useState } from "react";
import { 
  FiActivity, 
  FiFilter, 
  FiDroplet, 
  FiPieChart, 
  FiList, 
  FiTarget, 
  FiXCircle, 
  FiClock 
} from "react-icons/fi";

function GunlukTakip({ gunlukKayitlar = [] }) {
  const [secilenDanisan, setSecilenDanisan] = useState("Tümü");
  const [secilenTarih, setSecilenTarih] = useState("");
  const [secilenKayit, setSecilenKayit] = useState(null);

  const danisanIsimleri = [
    "Tümü",
    ...new Set(gunlukKayitlar.map((item) => item.danisanAdi)),
  ];

  const filtreliKayitlar = gunlukKayitlar.filter((item) => {
    const danisanUygun =
      secilenDanisan === "Tümü" || item.danisanAdi === secilenDanisan;
    const tarihUygun = !secilenTarih || item.tarih === secilenTarih;
    return danisanUygun && tarihUygun;
  });

  const toplamKalori = filtreliKayitlar.reduce(
    (toplam, item) => toplam + Number(item.kalori || 0),
    0
  );

  const toplamSu = filtreliKayitlar.reduce(
    (toplam, item) => toplam + Number(item.su || 0),
    0
  );

  const hedefKalori = filtreliKayitlar[0]?.hedefKalori || 1600;
  const suHedefi = filtreliKayitlar[0]?.suHedefi || 8;

  const kaloriDurumu =
    toplamKalori > hedefKalori
      ? "Hedef üstü"
      : toplamKalori >= hedefKalori * 0.8
      ? "Uygun"
      : "Eksik";

  const suDurumu = toplamSu >= suHedefi ? "Tamamlandı" : "Eksik";

  const styles = {
    page: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", marginLeft: "280px", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" },
    headerCard: { backgroundColor: "white", padding: "24px 30px", borderRadius: "20px", marginBottom: "25px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" },
    card: { backgroundColor: "white", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", marginBottom: "25px" },
    filterGrid: { display: "grid", gridTemplateColumns: "2fr 2fr auto", gap: "15px", alignItems: "center" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "0.2s" },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "15px", marginBottom: "25px" },
    statBox: { backgroundColor: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9", textAlign: "center" },
    btnPrimary: { backgroundColor: "#39d373", color: "#1e4d3b", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" },
    btnSecondary: { backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "0.2s", display: "flex", alignItems: "center", gap: "6px" },
    listItem: { backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "15px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "0.2s" },
    badgeSuccess: { backgroundColor: "#e6f4ea", color: "#1e4d3b", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
    badgeWarning: { backgroundColor: "#fef3c7", color: "#b45309", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
    badgeDanger: { backgroundColor: "#fee2e2", color: "#ef4444", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" },
    badgeNeutral: { backgroundColor: "#f1f5f9", color: "#64748b", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }
  };

  const getBadgeStyle = (durum) => {
    if (durum === "Uygun" || durum === "Tamamlandı" || durum === "Onaylandı") return styles.badgeSuccess;
    if (durum === "Hedef üstü") return styles.badgeWarning;
    if (durum === "Eksik") return styles.badgeDanger;
    return styles.badgeNeutral;
  };

  return (
    <div style={styles.page}>
      {/* ÜST BAŞLIK */}
      <div style={styles.headerCard}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
          <FiActivity color="#39d373" /> Günlük Takip
        </h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>Danışanlarınızın günlük su ve öğün bildirimlerini analiz edin.</p>
      </div>

      {/* DETAY GÖRÜNÜMÜ */}
      {secilenKayit && (
        <div style={{ ...styles.card, backgroundColor: "#1e4d3b", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "22px", color: "#39d373" }}>{secilenKayit.danisanAdi}</h3>
              <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.8, display: "flex", alignItems: "center", gap: "5px" }}>
                <FiClock /> {secilenKayit.tarih || "Tarih Yok"} • {secilenKayit.ogun}
              </p>
            </div>
            <span style={getBadgeStyle(secilenKayit.durum)}>{secilenKayit.durum || "Takipte"}</span>
          </div>

          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "16px", marginBottom: "20px" }}>
            <p style={{ margin: "0 0 10px 0", fontSize: "15px", lineHeight: "1.5" }}>
              <strong>Öğün İçeriği:</strong> <br/>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{secilenKayit.detay}</span>
            </p>
            {secilenKayit.not && (
              <p style={{ margin: 0, fontSize: "14px", fontStyle: "italic", color: "#39d373" }}>
                " {secilenKayit.not} "
              </p>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <FiPieChart /> ALINAN KALORİ
              </small>
              <div style={{ fontWeight: "800", fontSize: "18px", marginTop: "5px" }}>{secilenKayit.kalori} kcal</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                <FiDroplet /> İÇİLEN SU
              </small>
              <div style={{ fontWeight: "800", fontSize: "18px", marginTop: "5px" }}>{secilenKayit.su || 0} bardak</div>
            </div>
          </div>

          <button style={{ ...styles.btnSecondary, width: "100%", marginTop: "20px", backgroundColor: "rgba(255,255,255,0.1)", color: "white", justifyContent: "center" }} onClick={() => setSecilenKayit(null)}>
            <FiXCircle /> Detayı Kapat
          </button>
        </div>
      )}

      {/* FİLTRELER */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 15px 0", color: "#1e293b", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiFilter color="#64748b" /> Filtrele
        </h3>
        <div style={styles.filterGrid}>
          <select style={styles.input} value={secilenDanisan} onChange={(e) => setSecilenDanisan(e.target.value)}>
            {danisanIsimleri.map((isim) => (
              <option key={isim} value={isim}>{isim}</option>
            ))}
          </select>
          <input style={styles.input} type="date" value={secilenTarih} onChange={(e) => setSecilenTarih(e.target.value)} />
          <button style={{...styles.btnSecondary, justifyContent: "center"}} type="button" onClick={() => { setSecilenDanisan("Tümü"); setSecilenTarih(""); setSecilenKayit(null); }}>
            <FiXCircle /> Temizle
          </button>
        </div>
      </div>

      {/* ANALİZ KARTLARI */}
      <div style={styles.statGrid}>
        <div style={styles.statBox}>
          <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <FiPieChart /> TOPLAM KALORİ
          </small>
          <h3 style={{ fontSize: "24px", color: "#1e4d3b", margin: "5px 0 10px 0", fontWeight: "800" }}>{toplamKalori}</h3>
          <span style={getBadgeStyle(kaloriDurumu)}>{kaloriDurumu}</span>
        </div>

        <div style={styles.statBox}>
          <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <FiTarget /> HEDEF KALORİ
          </small>
          <h3 style={{ fontSize: "24px", color: "#1e293b", margin: "5px 0", fontWeight: "800" }}>{hedefKalori}</h3>
        </div>

        <div style={styles.statBox}>
          <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <FiDroplet color="#0ea5e9" /> İÇİLEN SU
          </small>
          <h3 style={{ fontSize: "24px", color: "#0ea5e9", margin: "5px 0 10px 0", fontWeight: "800" }}>{toplamSu}</h3>
          <span style={getBadgeStyle(suDurumu)}>{suDurumu}</span>
        </div>

        <div style={styles.statBox}>
          <small style={{ color: "#64748b", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <FiTarget /> SU HEDEFİ
          </small>
          <h3 style={{ fontSize: "24px", color: "#1e293b", margin: "5px 0", fontWeight: "800" }}>{suHedefi}</h3>
        </div>
      </div>

      {/* GÜNLÜK KAYITLAR LİSTESİ */}
      <div style={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
          <FiList color="#39d373" /> Kayıt Geçmişi
        </h3>

        <div>
          {filtreliKayitlar.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "16px" }}>
              Seçilen kriterlere uygun kayıt bulunamadı.
            </div>
          ) : (
            filtreliKayitlar.map((item) => (
              <div 
                style={styles.listItem} 
                key={item.id}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#39d373"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                    <strong style={{ fontSize: "16px", color: "#1e4d3b" }}>{item.danisanAdi}</strong>
                    <span style={getBadgeStyle(item.durum || "Takipte")}>{item.durum || "Takipte"}</span>
                  </div>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "5px" }}>
                    <FiClock /> {item.tarih || "-"} • <strong>{item.ogun}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "400px" }}>
                    {item.detay}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", fontSize: "13px", color: "#1e4d3b", fontWeight: "700" }}>
                      {item.kalori} kcal
                    </span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", fontSize: "12px", color: "#0ea5e9", fontWeight: "600" }}>
                      <FiDroplet /> {item.su || 0} bardak
                    </span>
                  </div>
                  <button style={styles.btnPrimary} onClick={() => setSecilenKayit(item)}>
                    İncele
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GunlukTakip;