import { useMemo, useState } from "react";

function BesinTakasiPage({ takasOnerileri = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState("");

  const filteredOneriler = useMemo(() => {
    return takasOnerileri.filter((item) => {
      const kaynak = item.kaynak?.toLowerCase() || "";
      const alternatiflerText = Array.isArray(item.alternatifler)
        ? item.alternatifler.join(" ").toLowerCase()
        : (item.alternatif || "").toLowerCase();

      const search = searchTerm.toLowerCase();
      return kaynak.includes(search) || alternatiflerText.includes(search);
    });
  }, [takasOnerileri, searchTerm]);

  const handleSelectFood = (item) => {
    setSelectedFood(item);
    if (Array.isArray(item.alternatifler) && item.alternatifler.length > 0) {
      setSelectedAlternative(item.alternatifler[0]);
    } else {
      setSelectedAlternative(item.alternatif || "");
    }
  };

  const handleApplySwap = () => {
    if (!selectedFood || !selectedAlternative) return;
    alert(`🎉 Harika seçim! "${selectedFood.kaynak}" yerine "${selectedAlternative}" eklendi.`);
  };

  // Akıllı İkon Fonksiyonu
  const getFoodIcon = (besinAdi) => {
    if (!besinAdi) return "🍽️";
    const ad = besinAdi.toLowerCase();
    if (ad.includes("ekmek") || ad.includes("poğaça") || ad.includes("simit")) return "🍞";
    if (ad.includes("pilav") || ad.includes("pirinç") || ad.includes("bulgur")) return "🍚";
    if (ad.includes("makarna")) return "🍝";
    if (ad.includes("içecek") || ad.includes("kola") || ad.includes("gazoz")) return "🥤";
    if (ad.includes("tatlı") || ad.includes("şeker") || ad.includes("çikolata")) return "🍫";
    if (ad.includes("cips") || ad.includes("kızartma")) return "🍟";
    if (ad.includes("tavuk")) return "🍗";
    if (ad.includes("et")) return "🥩";
    if (ad.includes("salata") || ad.includes("yeşillik")) return "🥗";
    if (ad.includes("meyve") || ad.includes("elma") || ad.includes("muz")) return "🍎";
    if (ad.includes("su") || ad.includes("soda") || ad.includes("ayran")) return "💧";
    return "🍽️";
  };

  return (
    <div style={{ padding: "10px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Üst Başlık ve Arama Alanı */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ fontSize: "28px", color: "#1f2937", margin: "0 0 8px 0", fontWeight: "800" }}>
            Besin Takası
          </h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "15px", fontWeight: "500" }}>
            Öğünündeki besinler için eşdeğer alternatifleri görüntüle ve seçim yap.
          </p>
        </div>

        {/* Arama Kutusu */}
        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: "400px" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>🔍</span>
          <input
            type="text"
            placeholder="Değiştirmek istediğin besini ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "16px 20px 16px 48px", fontSize: "15px", borderRadius: "20px", border: "2px solid #e2e8f0", backgroundColor: "#ffffff", outline: "none", color: "#334155", transition: "border-color 0.2s", boxSizing: "border-box" }}
            onFocus={(e) => e.target.style.borderColor = "#10b981"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
      </div>

      {/* Ana İçerik: İki Kolonlu Yapı */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "32px", alignItems: "start" }}>
        
        {/* SOL TARAF: Takas Önerileri Listesi */}
        <div>
          <h3 style={{ fontSize: "18px", color: "#1f2937", marginBottom: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>📋</span> Takas Önerileri
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {filteredOneriler.length > 0 ? (
              filteredOneriler.map((item) => {
                const isActive = selectedFood?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFood(item)}
                    style={{
                      backgroundColor: isActive ? "#ecfdf5" : "#ffffff",
                      borderRadius: "20px",
                      padding: "20px",
                      boxShadow: isActive ? "0 8px 20px rgba(16, 185, 129, 0.15)" : "0 4px 10px rgba(0,0,0,0.03)",
                      border: isActive ? "2px solid #10b981" : "2px solid #f1f5f9",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px"
                    }}
                    onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {/* Eski Besin */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Eski</span>
                      <div style={{ fontSize: "24px", margin: "4px 0" }}>{getFoodIcon(item.kaynak)}</div>
                      <h4 style={{ margin: 0, fontSize: "15px", color: "#1f2937", fontWeight: "600" }}>{item.kaynak}</h4>
                    </div>

                    {/* Ok İşareti */}
                    <div style={{ color: isActive ? "#10b981" : "#cbd5e1", fontSize: "24px", fontWeight: "bold" }}>
                      ⇄
                    </div>

                    {/* Yeni Besin */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>Yeni</span>
                      <div style={{ fontSize: "24px", margin: "4px 0" }}>{getFoodIcon(Array.isArray(item.alternatifler) ? item.alternatifler[0] : item.alternatif)}</div>
                      <h4 style={{ margin: 0, fontSize: "15px", color: "#1f2937", fontWeight: "600" }}>
                        {Array.isArray(item.alternatifler) ? item.alternatifler[0] : item.alternatif}
                      </h4>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: "20px", border: "2px dashed #e2e8f0", color: "#64748b" }}>
                Aramaya uygun besin bulunamadı.
              </div>
            )}
          </div>
        </div>

        {/* SAĞ TARAF: Seçim ve Detay Kutusu */}
        <div style={{ position: "sticky", top: "20px" }}>
          {!selectedFood ? (
            // Boş Durum (Empty State)
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "60px 30px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", border: "2px dashed #e2e8f0" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.5 }}>🔄</div>
              <h3 style={{ fontSize: "22px", color: "#1f2937", marginBottom: "12px", fontWeight: "800" }}>Besin Seçilmedi</h3>
              <p style={{ color: "#64748b", fontSize: "15px", margin: 0, lineHeight: "1.6" }}>
                Takas detaylarını ve sağlıklı alternatifleri görmek için sol taraftaki listeden bir öğeye tıkla.
              </p>
            </div>
          ) : (
            // Dolu Durum (Detaylar)
            <div style={{ backgroundColor: "#ffffff", borderRadius: "24px", padding: "32px", boxShadow: "0 15px 40px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              
              <h3 style={{ fontSize: "20px", color: "#1f2937", marginBottom: "24px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✨</span> Takas Detayı
              </h3>

              {/* Dev Karşılaştırma Kutusu */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc", padding: "24px", borderRadius: "20px", marginBottom: "32px" }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ display: "inline-block", backgroundColor: "#fef2f2", color: "#ef4444", padding: "6px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", marginBottom: "12px" }}>Çıkarılacak</div>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{getFoodIcon(selectedFood.kaynak)}</div>
                  <h4 style={{ margin: 0, fontSize: "18px", color: "#1f2937" }}>{selectedFood.kaynak}</h4>
                </div>

                <div style={{ fontSize: "32px", color: "#94a3b8", margin: "0 16px" }}>➡️</div>

                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ display: "inline-block", backgroundColor: "#ecfdf5", color: "#10b981", padding: "6px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", marginBottom: "12px" }}>Eklenecek</div>
                  <div style={{ fontSize: "36px", marginBottom: "8px" }}>{getFoodIcon(selectedAlternative)}</div>
                  <h4 style={{ margin: 0, fontSize: "18px", color: "#1f2937", color: "#10b981" }}>{selectedAlternative}</h4>
                </div>
              </div>

              {/* Alternatif Seçenekler */}
              <div style={{ marginBottom: "32px" }}>
                <h4 style={{ fontSize: "15px", color: "#64748b", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700" }}>Diğer Alternatifler</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {Array.isArray(selectedFood.alternatifler) && selectedFood.alternatifler.length > 0 ? (
                    selectedFood.alternatifler.map((alt, index) => {
                      const isAltSelected = selectedAlternative === alt;
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedAlternative(alt)}
                          style={{
                            padding: "10px 20px",
                            borderRadius: "16px",
                            fontSize: "15px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            border: isAltSelected ? "none" : "1px solid #e2e8f0",
                            backgroundColor: isAltSelected ? "#10b981" : "#ffffff",
                            color: isAltSelected ? "#ffffff" : "#475569",
                            boxShadow: isAltSelected ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none"
                          }}
                        >
                          {alt}
                        </button>
                      );
                    })
                  ) : (
                    <span style={{ padding: "10px 20px", borderRadius: "16px", fontSize: "15px", fontWeight: "600", backgroundColor: "#10b981", color: "#ffffff" }}>
                      {selectedFood.alternatif}
                    </span>
                  )}
                </div>
              </div>

              {/* Aksiyon Butonları */}
              <div style={{ display: "flex", gap: "16px" }}>
                <button
                  onClick={handleApplySwap}
                  style={{ flex: 2, padding: "16px", backgroundColor: "#1f2937", color: "#ffffff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "center", gap: "10px" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#111827"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#1f2937"}
                >
                  <span>✅</span> Takası Uygula
                </button>
                <button
                  onClick={() => { setSelectedFood(null); setSelectedAlternative(""); }}
                  style={{ flex: 1, padding: "16px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#e2e8f0"; e.currentTarget.style.color = "#1e293b"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
                >
                  İptal
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default BesinTakasiPage;