import React from "react";

function DanisanDashboard({ data }) {
  // Toplam kaloriyi hesaplama
  const toplamKalori = data.gunlukKayitlar.reduce(
    (total, item) => total + item.kalori,
    0
  );

  // Öğün ismine göre otomatik emoji seçen küçük bir zeka
  const getMealIcon = (ogunAdi) => {
    if (!ogunAdi) return "🍽️";
    const ad = ogunAdi.toLowerCase();
    if (ad.includes("sabah") || ad.includes("kahvaltı")) return "🍳";
    if (ad.includes("öğle")) return "🥗";
    if (ad.includes("akşam")) return "🍲";
    return "🍎";
  };

  // Su ilerleme yüzdesini hesaplama
  const suYuzdesi = Math.min((data.water.icilen / data.water.hedef) * 100, 100);

  return (
    <div style={{ padding: "10px", maxWidth: "1200px" }}>
      
      {/* Üst Başlık ve Tarih Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "28px", color: "#1f2937", margin: 0, fontWeight: "800" }}>
          Genel Bakış
        </h2>
        <span style={{ backgroundColor: "#e6f4ea", color: "#1b5e20", padding: "10px 20px", borderRadius: "30px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          📅 {new Date().toLocaleDateString("tr-TR", { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </div>

      {/* Üstteki 4'lü İstatistik Kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        
        {/* Kalori Kartı */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)", borderLeft: "6px solid #f59e0b", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600", fontSize: "15px" }}>
            <span style={{ fontSize: "22px" }}>🔥</span> Günlük Kalori
          </div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
            {toplamKalori} <span style={{ fontSize: "16px", fontWeight: "600", color: "#9ca3af" }}>kcal</span>
          </div>
        </div>

        {/* Su Kartı */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)", borderLeft: "6px solid #3b82f6", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600", fontSize: "15px" }}>
            <span style={{ fontSize: "22px" }}>💧</span> Su Takibi
          </div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
            {data.water.icilen} <span style={{ fontSize: "20px", color: "#9ca3af" }}>/ {data.water.hedef}</span> <span style={{ fontSize: "16px", fontWeight: "600", color: "#9ca3af" }}>brdk</span>
          </div>
          {/* Su Barı */}
          <div style={{ width: "100%", height: "8px", backgroundColor: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginTop: "4px" }}>
            <div style={{ width: `${suYuzdesi}%`, height: "100%", backgroundColor: "#3b82f6", borderRadius: "10px", transition: "width 0.5s ease" }}></div>
          </div>
        </div>

        {/* Mevcut Kilo Kartı */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)", borderLeft: "6px solid #10b981", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600", fontSize: "15px" }}>
            <span style={{ fontSize: "22px" }}>⚖️</span> Mevcut Kilo
          </div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
            {data.user.kilo || "-"} <span style={{ fontSize: "16px", fontWeight: "600", color: "#9ca3af" }}>kg</span>
          </div>
        </div>

        {/* Hedef Kilo Kartı */}
        <div style={{ backgroundColor: "#ffffff", padding: "24px", borderRadius: "20px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)", borderLeft: "6px solid #8b5cf6", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#64748b", fontWeight: "600", fontSize: "15px" }}>
            <span style={{ fontSize: "22px" }}>🎯</span> Hedef Kilo
          </div>
          <div style={{ fontSize: "36px", fontWeight: "800", color: "#1f2937" }}>
            {data.user.hedef || "-"} <span style={{ fontSize: "16px", fontWeight: "600", color: "#9ca3af" }}>kg</span>
          </div>
        </div>
      </div>

      {/* Alt Listeler (İki Kolon) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        
        {/* Öğün Planı Kutusu */}
        <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "24px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "20px", color: "#1f2937", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "800" }}>
            <span style={{ fontSize: "24px" }}>🍽️</span> Bugünkü Öğün Planı
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.meals.map((meal) => (
              <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9", transition: "transform 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "50px", height: "50px", backgroundColor: "#ffffff", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                    {getMealIcon(meal.ogun)}
                  </div>
                  <div>
                    <strong style={{ display: "block", fontSize: "16px", color: "#1e293b", marginBottom: "4px" }}>{meal.ogun}</strong>
                    <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>{meal.saat}</span> • {meal.yemek}
                    </p>
                  </div>
                </div>
                <span style={{ backgroundColor: "#e2e8f0", color: "#334155", padding: "8px 14px", borderRadius: "20px", fontSize: "14px", fontWeight: "800" }}>
                  {meal.kalori} kcal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Son Kayıtlar Kutusu */}
        <div style={{ backgroundColor: "#ffffff", padding: "30px", borderRadius: "24px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }}>
          <h3 style={{ fontSize: "20px", color: "#1f2937", marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "800" }}>
            <span style={{ fontSize: "24px" }}>📝</span> Son Günlük Kayıtlar
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {data.gunlukKayitlar.length > 0 ? (
              data.gunlukKayitlar.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "12px", height: "12px", backgroundColor: "#10b981", borderRadius: "50%" }}></div>
                    <strong style={{ fontSize: "16px", color: "#334155" }}>{item.besin}</strong>
                  </div>
                  <span style={{ color: "#ef4444", fontWeight: "800", fontSize: "15px", backgroundColor: "#fef2f2", padding: "6px 12px", borderRadius: "8px" }}>
                    +{item.kalori} kcal
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af", backgroundColor: "#f8fafc", borderRadius: "16px", fontWeight: "500" }}>
                Bugün henüz kalori kaydı girmedin.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DanisanDashboard;