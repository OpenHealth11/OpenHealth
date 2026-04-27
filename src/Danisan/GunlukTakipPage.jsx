import React, { useState } from "react";
import { FiPlus, FiTrash2, FiActivity, FiEdit3 } from "react-icons/fi";

// --- GÖRSEL EŞLEŞTİRME MANTIĞI ---
// Kullanıcının yazdığı kelimeye göre çıkacak emojiyi belirleyen sözlük
// Buraya istediğin kadar Türkçe kelime ve emoji ekleyebilirsin.
const foodEmojiMap = {
  // Meyveler
  elma: "🍎",
  armut: "🍐",
  muz: "🍌",
  üzüm: "🍇",
  çilek: "🍓",
  kavun: "🍈",
  karpuz: "🍉",
  portakal: "🍊",
  // Sebzeler
  havuç: "🥕",
  domates: "🍅",
  salatalık: "🥒",
  soğan: "🧅",
  sarımsak: "🧄",
  patates: "🥔",
  mısır: "🌽",
  // Yemekler/Makarnalar/Ekmek
  makarna: "🍝",
  spagetti: "🍝",
  pilav: "🍚",
  pide: "🍕",
  pizza: "🍕",
  lahmacun: "🥘",
  kebap: "🥘",
  ekmek: "🍞",
  tavuk: "🍗",
  et: "🥩",
  köfte: "🧆",
  balık: "🐟",
  yumurta: "🥚",
  çorba: "🥣",
  // Süt/Atıştırmalık/İçecek
  süt: "🥛",
  yoğurt: "🥛",
  su: "💧",
  kahve: "☕",
  çay: "🍵",
  çikolata: "🍫",
  kek: "🍰",
  pasta: "🎂",
  burger: "🍔",
  sosis: "🌭",
};

// Yemeğin ismine bakıp doğru emojiyi bulan yardımcı fonksiyon
const getFoodVisual = (foodName) => {
  const lowerFood = foodName.toLowerCase().trim();
  
  // Sözlükteki her kelimeyi kontrol et
  for (const [keyword, emoji] of Object.entries(foodEmojiMap)) {
    // Eğer yemeğin isminin İÇİNDE bu kelime geçiyorsa (Örn: "1 kase makarna")
    if (lowerFood.includes(keyword)) {
      return emoji;
    }
  }
  
  // Eğer hiçbir şey bulamazsa varsayılan olarak çatal-bıçak çıkar
  return "🍽️"; 
};
// --- MANTIK SONU ---


function GunlukTakipPage({ kayitlar, addGunlukKayit, deleteGunlukKayit }) {
  const [form, setForm] = useState({ besin: "", kalori: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.besin.trim() || !form.kalori) return; // Boş kayıtları engelle
    addGunlukKayit(form);
    setForm({ besin: "", kalori: "" });
  };

  const toplamKalori = kayitlar.reduce((sum, item) => sum + item.kalori, 0);

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "25px", fontWeight: "800", color: "#1e4d3b" }}>
        Günlük Takip
      </h2>

      {/* Üst Kısım: Besin Ekleme Formu */}
      <div 
        className="card" 
        style={{ 
          padding: "25px", 
          borderRadius: "20px", 
          backgroundColor: "white", 
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
          marginBottom: "30px",
          borderTop: "5px solid #3b82f6" 
        }}
      >
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e4d3b", marginBottom: "20px", fontSize: "18px", fontWeight: "700" }}>
          <FiEdit3 color="#3b82f6" /> Yeni Besin Ekle
        </h3>
        
        <form 
          onSubmit={handleSubmit} 
          style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Ne yedin? (Örn: Havuçlu Kek)"
            value={form.besin}
            onChange={(e) => setForm({ ...form, besin: e.target.value })}
            style={{ 
              flex: "2", minWidth: "200px", padding: "14px 15px", border: "1px solid #e2e8f0", 
              borderRadius: "12px", outline: "none", fontSize: "15px", backgroundColor: "#f8fafc" 
            }}
          />
          <input
            type="number"
            placeholder="Kalori (kcal)"
            value={form.kalori}
            onChange={(e) => setForm({ ...form, kalori: e.target.value })}
            style={{ 
              flex: "1", minWidth: "120px", padding: "14px 15px", border: "1px solid #e2e8f0", 
              borderRadius: "12px", outline: "none", fontSize: "15px", backgroundColor: "#f8fafc" 
            }}
          />
          <button
            type="submit"
            style={{ 
              padding: "14px 25px", backgroundColor: "#10b981", color: "white", border: "none", 
              borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", 
              gap: "8px", fontWeight: "700", fontSize: "15px", transition: "0.2s" 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
          >
            <FiPlus size={18} /> Ekle
          </button>
        </form>
      </div>

      {/* Alt Kısım: Günlük Kayıtlar Listesi */}
      <div 
        className="card" 
        style={{ 
          padding: "25px", 
          borderRadius: "20px", 
          backgroundColor: "white", 
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)" 
        }}
      >
        <div style={{ 
          display: "flex", justifyContent: "space-between", alignItems: "center", 
          marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid #f1f5f9" 
        }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e4d3b", margin: 0, fontSize: "18px", fontWeight: "700" }}>
            <FiActivity color="#f59e0b" /> Bugünden Kayıtlar
          </h3>
          <div style={{ 
            backgroundColor: "#fef3c7", color: "#d97706", padding: "8px 16px", 
            borderRadius: "12px", fontWeight: "800", fontSize: "15px" 
          }}>
            Toplam: {toplamKalori} kcal
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {kayitlar.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "30px 0", fontWeight: "500" }}>
              Bugün henüz bir kayıt eklemedin. Hadi başlayalım! 🥗
            </p>
          ) : (
            // Kayıtları ters sırada (en son eklenen en üstte) göster
            [...kayitlar].reverse().map((item) => (
              <div 
                key={item.id} 
                style={{ 
                  display: "flex", justifyContent: "space-between", alignItems: "center", 
                  padding: "15px 20px", backgroundColor: "#f8fafc", borderRadius: "15px",
                  transition: "transform 0.2s"
                }}
              >
                {/* SOL TARAF: Görsel (Emoji) + Besin Bilgisi */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {/* Görsel Kutusu */}
                  <div style={{ 
                    fontSize: "30px", backgroundColor: "white", width: "60px", height: "60px", 
                    borderRadius: "15px", display: "flex", alignItems: "center", 
                    justifyContent: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                  }}>
                    {/* Yemeğin ismine bakıp emojiyi hesaplayan fonksiyonu çağır */}
                    {getFoodVisual(item.besin)}
                  </div>
                  
                  {/* Yazı Bölümü */}
                  <div>
                    <strong style={{ color: "#334155", display: "block", fontSize: "16px", marginBottom: "4px" }}>
                      {item.besin}
                    </strong>
                    <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "700" }}>
                      {item.kalori} kcal
                    </span>
                  </div>
                </div>

                {/* SAĞ TARAF: Sil Butonu */}
                <button
                  onClick={() => deleteGunlukKayit(item.id)}
                  style={{ 
                    backgroundColor: "#fee2e2", color: "#ef4444", border: "none", 
                    padding: "12px", borderRadius: "10px", cursor: "pointer", 
                    display: "flex", alignItems: "center", transition: "0.2s" 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
                  title="Sil"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default GunlukTakipPage;