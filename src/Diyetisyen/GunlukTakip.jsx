import { useState } from "react";
import { FiFilter, FiCalendar, FiUser, FiDroplet, FiZap, FiCheckCircle, FiX } from "react-icons/fi";

function GunlukTakip({ gunlukKayitlar = [] }) {
  const [secilenDanisan, setSecilenDanisan] = useState("Tümü");
  const [secilenTarih, setSecilenTarih] = useState("");
  const [secilenKayit, setSecilenKayit] = useState(null);

  const danisanIsimleri = [
    "Tümü",
    ...new Set(gunlukKayitlar.map((item) => item.danisanAdi)),
  ];

  const filtreliKayitlar = gunlukKayitlar.filter((item) => {
    const danisanUygun = secilenDanisan === "Tümü" || item.danisanAdi === secilenDanisan;
    const tarihUygun = !secilenTarih || item.tarih === secilenTarih;
    return danisanUygun && tarihUygun;
  });

  const toplamKalori = filtreliKayitlar.reduce((toplam, item) => toplam + Number(item.kalori || 0), 0);
  const toplamSu = filtreliKayitlar.reduce((toplam, item) => toplam + Number(item.su || 0), 0);
  
  const hedefKalori = filtreliKayitlar[0]?.hedefKalori || 1600;
  const suHedefi = filtreliKayitlar[0]?.suHedefi || 8;

  const kaloriDurumu = toplamKalori > hedefKalori ? "Hedef üstü" : toplamKalori >= hedefKalori * 0.8 ? "Uygun" : "Eksik";
  const suDurumu = toplamSu >= suHedefi ? "Tamamlandı" : "Eksik";

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    marginBottom: "25px",
    border: "none"
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    width: "100%"
  };

  return (
    /* GÜNCELLEME: marginLeft ve minHeight kaldırıldı */
    <div style={{ width: "100%" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e4d3b", marginBottom: "30px" }}>Günlük Takip Analizi</h2>

      {/* Filtreler */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "#1e4d3b" }}>
          <FiFilter /> <h3 style={{ margin: 0, fontSize: "18px" }}>Veri Filtreleme</h3>
        </div>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Danışan Seçin</label>
            <select style={inputStyle} value={secilenDanisan} onChange={(e) => setSecilenDanisan(e.target.value)}>
              {danisanIsimleri.map((isim) => <option key={isim} value={isim}>{isim}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px", display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Tarih Seçin</label>
            <input style={inputStyle} type="date" value={secilenTarih} onChange={(e) => setSecilenTarih(e.target.value)} />
          </div>
          <button 
            onClick={() => { setSecilenDanisan("Tümü"); setSecilenTarih(""); }}
            style={{ alignSelf: "flex-end", padding: "12px 25px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer", fontWeight: "600", color: "#64748b" }}
          >
            Temizle
          </button>
        </div>
      </div>

      {/* İstatistik Özetleri Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "20px", 
        marginBottom: "30px" 
      }}>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <FiZap style={{ fontSize: "24px", color: "#f59e0b", marginBottom: "10px" }} />
          <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>TOPLAM KALORİ</span>
          <strong style={{ fontSize: "20px" }}>{toplamKalori} kcal</strong>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <FiCheckCircle style={{ fontSize: "24px", color: "#10b981", marginBottom: "10px" }} />
          <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>KALORİ DURUMU</span>
          <strong style={{ fontSize: "18px", color: kaloriDurumu === "Uygun" ? "#10b981" : "#ef4444" }}>{kaloriDurumu}</strong>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <FiDroplet style={{ fontSize: "24px", color: "#3b82f6", marginBottom: "10px" }} />
          <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>İÇİLEN SU</span>
          <strong style={{ fontSize: "20px" }}>{toplamSu} Bardak</strong>
        </div>
        <div style={{ ...cardStyle, marginBottom: 0, textAlign: "center" }}>
          <FiCheckCircle style={{ fontSize: "24px", color: "#3b82f6", marginBottom: "10px" }} />
          <span style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "700" }}>SU DURUMU</span>
          <strong style={{ fontSize: "18px", color: suDurumu === "Tamamlandı" ? "#3b82f6" : "#f59e0b" }}>{suDurumu}</strong>
        </div>
      </div>

      {/* Kayıt Listesi */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "20px", fontSize: "18px" }}>Günlük Kayıt Detayları</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filtreliKayitlar.length === 0 ? (
            <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>Filtreye uygun kayıt bulunamadı.</p>
          ) : (
            filtreliKayitlar.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "15px", border: "1px solid #f1f5f9", flexWrap: "wrap", gap: "15px" }}>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                   <div style={{ width: "45px", height: "45px", backgroundColor: "white", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e4d3b", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>
                    {item.danisanAdi[0]}
                   </div>
                   <div>
                    <strong style={{ fontSize: "15px" }}>{item.danisanAdi}</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>{item.tarih} • {item.ogun}</p>
                   </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "20px", marginLeft: "auto" }}>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: "700" }}>{item.kalori} kcal</span>
                    <span style={{ fontSize: "12px", color: "#3b82f6" }}>{item.su || 0} Bardak Su</span>
                  </div>
                  <button 
                    onClick={() => setSecilenKayit(item)}
                    style={{ padding: "8px 16px", borderRadius: "10px", border: "none", backgroundColor: "#1e4d3b", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                  >
                    İncele
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Kayıt Detay Modal */}
      {secilenKayit && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: "500px", position: "relative", marginBottom: 0, margin: "20px" }}>
            <button onClick={() => setSecilenKayit(null)} style={{ position: "absolute", right: "20px", top: "20px", border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}><FiX /></button>
            <h3 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", marginBottom: "20px" }}>Öğün Detayı</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
              <p><strong>Danışan:</strong> {secilenKayit.danisanAdi}</p>
              <p><strong>Öğün:</strong> {secilenKayit.ogun}</p>
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <strong>Yenilenler:</strong><br/>{secilenKayit.detay}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "10px", backgroundColor: "#fff7ed", borderRadius: "10px", color: "#9a3412" }}>🔥 {secilenKayit.kalori} kcal</div>
                <div style={{ padding: "10px", backgroundColor: "#eff6ff", borderRadius: "10px", color: "#1e40af" }}>💧 {secilenKayit.su || 0} Bardak Su</div>
              </div>
              {secilenKayit.not && (
                <p style={{ marginTop: "10px", padding: "10px", borderLeft: "4px solid #4ade80", backgroundColor: "#f0fdf4" }}>
                  <strong>Danışan Notu:</strong> {secilenKayit.not}
                </p>
              )}
            </div>
            <button 
              onClick={() => setSecilenKayit(null)}
              style={{ width: "100%", marginTop: "25px", padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#1e4d3b", color: "white", fontWeight: "700", cursor: "pointer" }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GunlukTakip;