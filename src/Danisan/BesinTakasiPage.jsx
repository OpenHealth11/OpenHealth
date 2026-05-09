import React, { useState } from "react";
import { FiRefreshCw, FiSearch, FiAlertTriangle, FiPlusCircle } from "react-icons/fi";

// --- GÖRSEL VE RENK MANTIĞI ---
// Havuçlu kek mantığı gibi kelimeleri analiz edip emoji ve renk atayan sözlük
const foodDictionary = {
  pirinc: { icon: "🍚", color: "#f59e0b" }, // Amber
  bulgur: { icon: "🌾", color: "#10b981" }, // Zümrüt
  ekmek: { icon: "🍞", color: "#f59e0b" },  // Amber (Beyaz ekmek)
  bugday: { icon: "🥖", color: "#10b981" }, // Zümrüt (Tam buğday)
  gazli: { icon: "🥤", color: "#ef4444" },  // Kırmızı
  maden: { icon: "💧", color: "#10b981" },  // Zümrüt
  tavuk: { icon: "🍗", color: "#f59e0b" },  // Amber (Kızarmış)
  balik: { icon: "🐟", color: "#10b981" },  // Zümrüt (Izgara)
};

// Yemeğin ismine bakıp doğru ikonu ve rengi bulan yardımcı fonksiyon
const getFoodStyle = (foodName) => {
  const lowerFood = foodName.toLowerCase().trim();
  
  // Sözlükteki her kelimeyi kontrol et
  for (const [keyword, style] of Object.entries(foodDictionary)) {
    if (lowerFood.includes(keyword)) {
      return style;
    }
  }
  
  // Eğer hiçbir şey bulamazsa varsayılan
  return { icon: "🍽️", color: "#64748b" }; // Slate gri
};
// --- MANTIK SONU ---


// --- TAKAS VERİLERİ (Örnek) ---
const takasOnerileri = [
  { id: 1, eski: "Pirinç pilavı", yeni: "Bulgur pilavı" },
  { id: 2, eski: "Beyaz ekmek", yeni: "Tam buğday ekmeği" },
  { id: 3, eski: "Gazlı içecek", yeni: "Maden suyu" },
  { id: 4, eski: "Kızarmış tavuk", yeni: "Izgara balık" }, // Yeni örnek ekledim
];
// --- VERİ SONU ---


function BesinTakasPage() {
  const [seciliTakas, setSeciliTakas] = useState(null);
  const [aramaKelimesi, setAramaKelimesi] = useState("");

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      
      {/* Üst Header: Başlık ve Arama Barı (Profesyonel Layout) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "35px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#1e4d3b", margin: 0 }}>Besin Değişim Rehberi</h2>
          <p style={{ color: "#64748b", margin: "5px 0 0 0", fontWeight: "500" }}>
            Öğününüzdeki besinler için eşdeğer, sağlıklı alternatifleri keşfedin.
          </p>
        </div>
        
        {/* Arama Barı */}
        <div style={{ position: "relative" }}>
          <FiSearch style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input 
            type="text" 
            placeholder="Alternatif besin ara..."
            value={aramaKelimesi}
            onChange={(e) => setAramaKelimesi(e.target.value)}
            style={{ 
              padding: "12px 15px 12px 45px", borderRadius: "12px", 
              border: "1px solid #e2e8f0", backgroundColor: "white", outline: "none", 
              fontSize: "14px", width: "280px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }} 
          />
        </div>
      </div>

      {/* ANA İÇERİK: Sol Liste ve Sağ Detay */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", alignItems: "start" }}>
        
        {/* SOL TARAF: Takas Kartları (Ferahlatıldı) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {takasOnerileri
            .filter(item => item.eski.toLowerCase().includes(aramaKelimesi.toLowerCase()) || item.yeni.toLowerCase().includes(aramaKelimesi.toLowerCase()))
            .map((item) => {
              const eskiStyle = getFoodStyle(item.eski);
              const yeniStyle = getFoodStyle(item.yeni);
              
              return (
                <div 
                  key={item.id}
                  onClick={() => setSeciliTakas(item)}
                  style={{ 
                    backgroundColor: "white", padding: "25px", borderRadius: "20px", position: "relative",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)", 
                    border: seciliTakas?.id === item.id ? `3px solid ${yeniStyle.color}` : "3px solid transparent",
                    cursor: "pointer", transition: "all 0.2s ease", textAlign: "center",
                    display: "flex", flexDirection: "column", alignItems: "center"
                  }}
                  onMouseEnter={(e) => { if(seciliTakas?.id !== item.id) e.currentTarget.style.borderColor = "#f1f5f9" }}
                  onMouseLeave={(e) => { if(seciliTakas?.id !== item.id) e.currentTarget.style.borderColor = "transparent" }}
                >
                  {/* Durum Rozeti */}
                  <span style={{ 
                    position: "absolute", top: "-10px", right: "20px", 
                    backgroundColor: `${yeniStyle.color}15`, color: yeniStyle.color, 
                    fontSize: "11px", fontWeight: "800", padding: "5px 12px", 
                    borderRadius: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                  }}>
                    Değişime Uygun
                  </span>
                  
                  {/* Besin Görselleri ve İkon */}
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "10px", width: "100%", justifyContent: "space-around" }}>
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: "35px", marginBottom: "5px" }}>{eskiStyle.icon}</div>
                      <div style={{ fontWeight: "700", color: "#334155", fontSize: "15px" }}>{item.eski}</div>
                      <span style={{ fontSize: "12px", color: eskiStyle.color, fontWeight: "700" }}>(Eski)</span>
                    </div>
                    
                    <FiRefreshCw size={24} color="#10b981" style={{ flexShrink: 0 }} />
                    
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ fontSize: "35px", marginBottom: "5px" }}>{yeniStyle.icon}</div>
                      <div style={{ fontWeight: "700", color: "#334155", fontSize: "15px" }}>{item.yeni}</div>
                      <span style={{ fontSize: "12px", color: yeniStyle.color, fontWeight: "700" }}>(Yeni)</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* SAĞ TARAF: Detay Paneli (Makyajlandı) */}
        <div style={{ 
          backgroundColor: "white", borderRadius: "25px", padding: "40px", 
          minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          boxShadow: "0 15px 25px -5px rgba(0,0,0,0.05)", textAlign: "center", position: "sticky", top: "20px"
        }}>
          {!seciliTakas ? (
            // BOŞ DURUM
            <>
              <div style={{ width: "100px", height: "100px", backgroundColor: "#f8fafc", color: "#0ea5e9", borderRadius: "25px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "25px" }}>
                <FiAlertTriangle size={50} />
              </div>
              <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#1e4d3b", marginBottom: "12px" }}>Değişim Seçilmedi</h3>
              <p style={{ color: "#64748b", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>
                Takas detaylarını ve porsiyon bilgilerini görmek için sol taraftaki kartlardan birine tıkla.
              </p>
            </>
          ) : (
            // DOLU DURUM
            <div style={{ animation: "fadeIn 0.3s ease-in-out", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "30px" }}>
                <span style={{ fontSize: "55px" }}>{getFoodStyle(seciliTakas.eski).icon}</span>
                <FiRefreshCw size={30} color="#94a3b8" style={{ marginTop: "18px" }} />
                <span style={{ fontSize: "55px" }}>{getFoodStyle(seciliTakas.yeni).icon}</span>
              </div>
              
              <h3 style={{ fontSize: "24px", fontWeight: "900", color: "#1e4d3b", marginBottom: "10px" }}>{seciliTakas.yeni}</h3>
              <p style={{ color: "#64748b", fontSize: "15px", marginBottom: "35px" }}>
                <b>{seciliTakas.eski}</b> yerine bu değişimi yaparak diyetini çeşitlendirebilir ve daha iyi bir besin değeri alabilirsin.
              </p>
              
              <button style={{ 
                width: "100%", padding: "16px", backgroundColor: "#1e4d3b", color: "white", 
                border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", 
                fontSize: "16px", boxShadow: "0 4px 12px rgba(30, 77, 59, 0.2)"
              }}>
                <FiPlusCircle size={20} /> Bu Değişimi Planıma Ekle
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BesinTakasPage;