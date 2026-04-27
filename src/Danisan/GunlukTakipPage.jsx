import { useState } from "react";

function GunlukTakipPage({
  kayitlar,
  addGunlukKayit,
  deleteGunlukKayit,
}) {
  const [form, setForm] = useState({
    besin: "",
    kalori: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addGunlukKayit(form);
    setForm({ besin: "", kalori: "" });
  };

  const toplamKalori = kayitlar.reduce((sum, item) => sum + item.kalori, 0);

  // Süper Zenginleştirilmiş Akıllı Emoji Fonksiyonu (Türk Mutfağı ve Diyet Menüsü)
  const getFoodIcon = (besinAdi) => {
    if (!besinAdi) return "🍽️";
    const ad = besinAdi.toLowerCase();
    
    // Kahvaltılıklar & Diyet
    if (ad.includes("yulaf") || ad.includes("müsli") || ad.includes("granola")) return "🥣";
    if (ad.includes("yumurta") || ad.includes("menemen") || ad.includes("omlet")) return "🍳";
    if (ad.includes("peynir") || ad.includes("lor") || ad.includes("kaşar")) return "🧀";
    if (ad.includes("zeytin")) return "🫒";

    // Sebzeler & Salatalar
    if (ad.includes("salata") || ad.includes("marul") || ad.includes("yeşillik") || ad.includes("roka") || ad.includes("kısır")) return "🥗";
    if (ad.includes("havuç")) return "🥕";
    if (ad.includes("domates") || ad.includes("menemen")) return "🍅";
    if (ad.includes("patates") || ad.includes("kumpir")) return "🥔";
    if (ad.includes("brokoli") || ad.includes("karnabahar") || ad.includes("sebze")) return "🥦";

    // Et ve Proteinler
    if (ad.includes("et") || ad.includes("kavurma") || ad.includes("biftek") || ad.includes("pirzola")) return "🥩";
    if (ad.includes("tavuk") || ad.includes("hindi") || ad.includes("kanat")) return "🍗";
    if (ad.includes("balık") || ad.includes("somon") || ad.includes("ton") || ad.includes("kalamar")) return "🐟";
    if (ad.includes("köfte") || ad.includes("kebap") || ad.includes("sucuk") || ad.includes("sosis")) return "🧆";

    // Karbonhidrat & Unlular
    if (ad.includes("makarna") || ad.includes("spagetti") || ad.includes("erişte") || ad.includes("mantı")) return "🍝";
    if (ad.includes("pilav") || ad.includes("pirinç") || ad.includes("bulgur")) return "🍚";
    if (ad.includes("ekmek") || ad.includes("simit") || ad.includes("poğaça") || ad.includes("börek") || ad.includes("tost") || ad.includes("gevrek")) return "🍞";
    if (ad.includes("pizza") || ad.includes("lahmacun") || ad.includes("pide")) return "🍕";
    if (ad.includes("burger") || ad.includes("hamburger")) return "🍔";
    if (ad.includes("dürüm") || ad.includes("çiğ köfte") || ad.includes("taco") || ad.includes("şavurma")) return "🌯";

    // Çorbalar ve Sulu Yemekler
    if (ad.includes("çorba") || ad.includes("mercimek") || ad.includes("kelle")) return "🍲";

    // Meyveler
    if (ad.includes("elma") || ad.includes("armut")) return "🍏";
    if (ad.includes("muz")) return "🍌";
    if (ad.includes("çilek") || ad.includes("meyve")) return "🍓";
    if (ad.includes("karpuz") || ad.includes("kavun")) return "🍉";

    // Süt ve Süt Ürünleri
    if (ad.includes("süt") || ad.includes("ayran") || ad.includes("kefir") || ad.includes("shake")) return "🥛";
    if (ad.includes("yoğurt") || ad.includes("cacık")) return "🥣";

    // Tatlılar ve Atıştırmalıklar
    if (ad.includes("tatlı") || ad.includes("çikolata") || ad.includes("pasta") || ad.includes("baklava") || ad.includes("kek") || ad.includes("waffle") || ad.includes("krep")) return "🍰";
    if (ad.includes("dondurma")) return "🍦";
    if (ad.includes("kuruyemiş") || ad.includes("ceviz") || ad.includes("badem") || ad.includes("fıstık")) return "🥜";
    if (ad.includes("cips")) return "🍟";

    // İçecekler
    if (ad.includes("kahve") || ad.includes("latte") || ad.includes("filtre")) return "☕";
    if (ad.includes("çay")) return "🍵";
    if (ad.includes("su") || ad.includes("soda") || ad.includes("kola") || ad.includes("meyve suyu")) return "🥤";

    // Hiçbiri eşleşmezse (Güvenlik Ağı)
    return "🍽️"; 
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px" }}>
      
      {/* Üst Başlık Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "28px", color: "#1f2937", margin: 0, fontWeight: "800" }}>
          Günlük Takip
        </h2>
        <span style={{ backgroundColor: "#e6f4ea", color: "#1b5e20", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          ✏️ Yediklerini Kaydet
        </span>
      </div>

      {/* Yeni Besin Ekleme Kartı */}
      <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", marginBottom: "32px", borderTop: "6px solid #10b981" }}>
        <h3 style={{ fontSize: "20px", color: "#1f2937", marginBottom: "20px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "24px" }}>➕</span> Yeni Besin Ekle
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Ne yedin? (Örn: Havuç, Makarna)"
            value={form.besin}
            onChange={(e) => setForm({ ...form, besin: e.target.value })}
            style={{ flex: "2 1 250px", padding: "16px 20px", fontSize: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", color: "#334155" }}
          />
          <input
            type="number"
            placeholder="Kalori (kcal)"
            value={form.kalori}
            onChange={(e) => setForm({ ...form, kalori: e.target.value })}
            style={{ flex: "1 1 150px", padding: "16px 20px", fontSize: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", outline: "none", color: "#334155" }}
          />
          <button 
            type="submit" 
            style={{ flex: "0 0 auto", padding: "16px 32px", fontSize: "16px", fontWeight: "700", color: "#ffffff", backgroundColor: "#10b981", border: "none", borderRadius: "16px", cursor: "pointer", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", transition: "transform 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            Ekle
          </button>
        </form>
      </div>

      {/* Günlük Kayıtlar Listesi Kartı */}
      <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "10px" }}>
          <h3 style={{ fontSize: "20px", color: "#1f2937", margin: 0, fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "24px" }}>🍽️</span> Günlük Kayıtlar
          </h3>
          <span style={{ backgroundColor: "#fff7ed", color: "#ea580c", padding: "10px 20px", borderRadius: "20px", fontSize: "16px", fontWeight: "800", boxShadow: "0 2px 8px rgba(234, 88, 12, 0.15)" }}>
            🔥 Toplam: {toplamKalori} kcal
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {kayitlar.length > 0 ? (
            kayitlar.map((item) => (
              <div 
                key={item.id} 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9", transition: "all 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#f1f5f9"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "50px", height: "50px", backgroundColor: "#ffffff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 4px 10px rgba(0,0,0,0.04)" }}>
                    {getFoodIcon(item.besin)}
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "17px", color: "#1e293b", marginBottom: "4px", textTransform: "capitalize" }}>
                      {item.besin}
                    </strong>
                    <span style={{ fontSize: "15px", color: "#10b981", fontWeight: "800" }}>
                      {item.kalori} kcal
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteGunlukKayit(item.id)}
                  style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "none", padding: "12px 20px", borderRadius: "12px", cursor: "pointer", fontWeight: "700", fontSize: "14px", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee2e2";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  🗑️ Sil
                </button>
              </div>
            ))
          ) : (
            <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "16px", border: "2px dashed #e2e8f0" }}>
              <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🍽️</span>
              <p style={{ margin: 0, fontSize: "16px", color: "#64748b", fontWeight: "500" }}>
                Bugün henüz bir kayıt girmedin. Hadi ilk öğününü ekle!
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default GunlukTakipPage;