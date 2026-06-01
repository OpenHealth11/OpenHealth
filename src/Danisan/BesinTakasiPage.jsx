import React, { useMemo, useState } from "react";
import {
  FiRefreshCw,
  FiSearch,
  FiAlertTriangle,
  FiPlusCircle,
  FiFilter,
  FiInfo,
  FiTrendingDown,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";

import { initialDanisanData } from "./DanisanMockData";


const foodDictionary = {
  pirinç: { icon: "🍚", color: "#f59e0b" },
  pirinc: { icon: "🍚", color: "#f59e0b" },
  bulgur: { icon: "🌾", color: "#10b981" },
  makarna: { icon: "🍝", color: "#f59e0b" },
  yulaf: { icon: "🥣", color: "#10b981" },
  kinoa: { icon: "🌾", color: "#10b981" },
  ekmek: { icon: "🍞", color: "#f59e0b" },
  buğday: { icon: "🥖", color: "#10b981" },
  bugday: { icon: "🥖", color: "#10b981" },
  tost: { icon: "🥪", color: "#f59e0b" },
  simit: { icon: "🥯", color: "#f59e0b" },
  poğaça: { icon: "🥐", color: "#ef4444" },
  pogaca: { icon: "🥐", color: "#ef4444" },

  gazlı: { icon: "🥤", color: "#ef4444" },
  gazli: { icon: "🥤", color: "#ef4444" },
  kola: { icon: "🥤", color: "#ef4444" },
  maden: { icon: "💧", color: "#10b981" },
  su: { icon: "💧", color: "#10b981" },
  ayran: { icon: "🥛", color: "#10b981" },
  süt: { icon: "🥛", color: "#10b981" },
  sut: { icon: "🥛", color: "#10b981" },
  kahve: { icon: "☕", color: "#92400e" },
  çay: { icon: "🍵", color: "#10b981" },
  cay: { icon: "🍵", color: "#10b981" },

  tavuk: { icon: "🍗", color: "#f59e0b" },
  balık: { icon: "🐟", color: "#10b981" },
  balik: { icon: "🐟", color: "#10b981" },
  et: { icon: "🥩", color: "#ef4444" },
  köfte: { icon: "🍖", color: "#ef4444" },
  kofte: { icon: "🍖", color: "#ef4444" },
  yumurta: { icon: "🥚", color: "#f59e0b" },
  peynir: { icon: "🧀", color: "#f59e0b" },
  yoğurt: { icon: "🥣", color: "#10b981" },
  yogurt: { icon: "🥣", color: "#10b981" },

  elma: { icon: "🍎", color: "#ef4444" },
  muz: { icon: "🍌", color: "#f59e0b" },
  portakal: { icon: "🍊", color: "#f97316" },
  çilek: { icon: "🍓", color: "#ef4444" },
  cilek: { icon: "🍓", color: "#ef4444" },
  üzüm: { icon: "🍇", color: "#8b5cf6" },
  uzum: { icon: "🍇", color: "#8b5cf6" },
  karpuz: { icon: "🍉", color: "#10b981" },
  avokado: { icon: "🥑", color: "#10b981" },

  salata: { icon: "🥗", color: "#10b981" },
  domates: { icon: "🍅", color: "#ef4444" },
  salatalık: { icon: "🥒", color: "#10b981" },
  salatalik: { icon: "🥒", color: "#10b981" },
  havuç: { icon: "🥕", color: "#f97316" },
  havuc: { icon: "🥕", color: "#f97316" },
  brokoli: { icon: "🥦", color: "#10b981" },
  patates: { icon: "🥔", color: "#f59e0b" },
  kızartma: { icon: "🍟", color: "#ef4444" },
  kizartma: { icon: "🍟", color: "#ef4444" },

  çikolata: { icon: "🍫", color: "#92400e" },
  cikolata: { icon: "🍫", color: "#92400e" },
  pasta: { icon: "🍰", color: "#ef4444" },
  tatlı: { icon: "🍮", color: "#ef4444" },
  tatli: { icon: "🍮", color: "#ef4444" },
  dondurma: { icon: "🍨", color: "#38bdf8" },
  cips: { icon: "🍟", color: "#ef4444" },
  kuruyemiş: { icon: "🥜", color: "#f59e0b" },
  kuruyemis: { icon: "🥜", color: "#f59e0b" },
};

const kategoriSecenekleri = [
  "Tümü",
  "Tahıllar",
  "Ekmekler",
  "İçecekler",
  "Proteinler",
  "Sebzeler",
  "Meyveler",
  "Süt Ürünleri",
  "Tatlılar",
  "Atıştırmalıklar",
];

const basicSwapSuggestions = {
  kola: ["Maden suyu", "Ayran", "Limonlu su", "Şekersiz soğuk çay"],
  gazoz: ["Maden suyu", "Ayran", "Su"],
  gazlı: ["Maden suyu", "Ayran", "Su"],
  gazli: ["Maden suyu", "Ayran", "Su"],

  çikolata: ["Meyve", "Yoğurt", "Bitter çikolata", "Sütlü tatlı"],
  cikolata: ["Meyve", "Yoğurt", "Bitter çikolata", "Sütlü tatlı"],
  tatlı: ["Meyve", "Yoğurt", "Sütlü tatlı"],
  tatli: ["Meyve", "Yoğurt", "Sütlü tatlı"],
  dondurma: ["Yoğurtlu meyve", "Sütlü tatlı", "Meyve"],

  cips: ["Fırınlanmış nohut", "Patlamış mısır", "Kuruyemiş"],
  kraker: ["Tam tahıllı galeta", "Kuruyemiş", "Yoğurt"],
  bisküvi: ["Meyve", "Yulaflı yoğurt", "Kuruyemiş"],
  biskuvi: ["Meyve", "Yulaflı yoğurt", "Kuruyemiş"],

  pirinç: ["Bulgur", "Kinoa", "Karabuğday"],
  pirinc: ["Bulgur", "Kinoa", "Karabuğday"],
  pilav: ["Bulgur pilavı", "Kinoa", "Sebzeli bulgur"],
  makarna: ["Tam buğday makarna", "Sebzeli makarna", "Bulgur"],

  "beyaz ekmek": ["Tam buğday ekmeği", "Çavdar ekmeği", "Kepekli ekmek"],
  ekmek: ["Tam buğday ekmeği", "Çavdar ekmeği", "Kepekli ekmek"],
  tost: ["Tam buğday tost", "Peynirli sandviç", "Yulaflı kahvaltı"],

  kızartma: ["Fırında patates", "Haşlanmış patates", "Izgara sebze"],
  kizartma: ["Fırında patates", "Haşlanmış patates", "Izgara sebze"],
  patates: ["Fırında patates", "Haşlanmış patates", "Bulgur"],

  sucuk: ["Hindi füme", "Yumurta", "Izgara tavuk"],
  sosis: ["Izgara tavuk", "Hindi", "Yumurta"],
  hamburger: ["Izgara tavuk sandviç", "Tam buğday sandviç", "Ev yapımı burger"],
  pizza: ["Tam buğday pizza", "Sebzeli tost", "Izgara tavuk"],

  şeker: ["Meyve", "Hurma", "Yoğurt"],
  seker: ["Meyve", "Hurma", "Yoğurt"],
  "meyve suyu": ["Taze meyve", "Su", "Şekersiz komposto"],
  meyve_suyu: ["Taze meyve", "Su", "Şekersiz komposto"],
};

function getFoodStyle(foodName = "") {
  const lowerFood = foodName.toLowerCase().trim();

  for (const [keyword, style] of Object.entries(foodDictionary)) {
    if (lowerFood.includes(keyword)) return style;
  }

  return { icon: "🍽️", color: "#64748b" };
}

function BesinTakasPage({ takasOnerileri: takasOnerileriProp = [] }) {
  const takasOnerileri =
    Array.isArray(takasOnerileriProp) && takasOnerileriProp.length > 0
      ? takasOnerileriProp
      : initialDanisanData?.takasOnerileri || [];

  const [seciliTakas, setSeciliTakas] = useState(null);
  const [aramaKelimesi, setAramaKelimesi] = useState("");
  const [kategori, setKategori] = useState("Tümü");
  const [fatsecretFoods, setFatsecretFoods] = useState([]);
  const [fatsecretLoading, setFatsecretLoading] = useState(false);
  const [fatsecretSearchedQuery, setFatsecretSearchedQuery] = useState("");
  const [fatsecretError, setFatsecretError] = useState("");

  const getSwapSuggestions = () => {
  const query = aramaKelimesi.trim().toLowerCase();

  if (!query) return [];

  const matchedKey = Object.keys(basicSwapSuggestions).find((key) =>
    query.includes(key)
  );

  return matchedKey ? basicSwapSuggestions[matchedKey] : [];
};

const swapSuggestions = getSwapSuggestions();

  const searchFatSecretFoods = async () => {
  const query = aramaKelimesi.trim();

  if (!query) {
    setFatsecretFoods([]);
    setFatsecretSearchedQuery("");
    setFatsecretError("");
    return;
  }

  setFatsecretLoading(true);
  setFatsecretError("");

  try {
    const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) {
      setFatsecretError(data.error || "Besin araması yapılamadı.");
      return;
    }

    setFatsecretFoods(data.foods || []);
    setFatsecretSearchedQuery(data.searchedQuery || query);
  } catch {
    setFatsecretError("Sunucuya bağlanılamadı.");
  } finally {
    setFatsecretLoading(false);
  }
};

  const toplamKaloriTasarrufu = takasOnerileri.reduce((toplam, item) => {
    const eskiKalori = Number(item.eskiKalori || 0);
    const yeniKalori = Number(item.yeniKalori || 0);

    return toplam + Math.max(0, eskiKalori - yeniKalori);
  }, 0);

  const filtreliTakaslar = useMemo(() => {
    return takasOnerileri.filter((item) => {
      const aranan = aramaKelimesi.toLowerCase();

      const eski = item.eski || "";
      const yeni = item.yeni || "";
      const kategoriAdi = item.kategori || "";

      const aramaUyumlu =
        eski.toLowerCase().includes(aranan) ||
        yeni.toLowerCase().includes(aranan) ||
        kategoriAdi.toLowerCase().includes(aranan);

      const kategoriUyumlu = kategori === "Tümü" || kategoriAdi === kategori;

      return aramaUyumlu && kategoriUyumlu;
    });
  }, [aramaKelimesi, kategori, takasOnerileri]);

  return (
    <div className="page" style={styles.page}>
      <div style={styles.hero}>
        <div>
          <h2 style={styles.title}>Besin Değişim Rehberi</h2>
          <p style={styles.subtitle}>
            Öğünlerinde daha sağlıklı alternatifleri keşfet.
          </p>
        </div>

        <div style={styles.filterArea}>
          <div style={styles.inputBox}>
            <FiSearch style={styles.inputIcon} />
            <input
              type="text"
              placeholder="Besin ara..."
              value={aramaKelimesi}
              onChange={(e) => setAramaKelimesi(e.target.value)}
              style={styles.input}
            />
          </div>
           
            <button
    type="button"
    onClick={searchFatSecretFoods}
    style={{
      padding: "12px 18px",
      borderRadius: "12px",
      border: "none",
      backgroundColor: "#10b981",
      color: "white",
      fontWeight: "700",
      cursor: "pointer",
    }}
  >
    FatSecret'te Ara
  </button>
            
          <div style={styles.inputBox}>
            <FiFilter style={styles.inputIcon} />
            <select
              value={kategori}
              onChange={(e) => {
                setKategori(e.target.value);
                setSeciliTakas(null);
              }}
              style={styles.select}
            >
              {kategoriSecenekleri.map((kat) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<FiRefreshCw />}
          title="Toplam Takas"
          value={takasOnerileri.length}
          text="Kayıtlı alternatif"
        />

        <StatCard
          icon={<FiCheckCircle />}
          title="Kategori"
          value={kategoriSecenekleri.length - 1}
          text="Filtre seçeneği"
        />

        <StatCard
          icon={<FiTrendingDown />}
          title="Kalori Tasarrufu"
          value={`${toplamKaloriTasarrufu} kcal`}
          text="Toplam fark"
        />
      </div>

          {swapSuggestions.length > 0 && (
  <div
    className="card"
    style={{
      padding: "25px",
      borderRadius: "20px",
      backgroundColor: "white",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      marginBottom: "25px",
      borderLeft: "6px solid #10b981",
    }}
  >
    <h3 style={styles.sectionTitle}>Önerilen Alternatifler</h3>
    <p style={styles.sectionText}>
      Aradığın besine göre daha dengeli seçenekler:
    </p>

    <div
      style={{
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "15px",
      }}
    >
      {swapSuggestions.map((suggestion) => (
        <span
          key={suggestion}
          style={{
            padding: "10px 14px",
            borderRadius: "999px",
            backgroundColor: "#dcfce7",
            color: "#166534",
            fontWeight: "700",
          }}
        >
          {suggestion}
        </span>
      ))}
    </div>
  </div>
)}

      {(fatsecretLoading || fatsecretError || fatsecretFoods.length > 0) && (
  <div
    className="card"
    style={{
      padding: "25px",
      borderRadius: "20px",
      backgroundColor: "white",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
      marginBottom: "25px",
    }}
  >
    <h3 style={styles.sectionTitle}>FatSecret Besin Sonuçları</h3>
    {fatsecretSearchedQuery && (
  <p style={styles.sectionText}>
    FatSecret araması: {fatsecretSearchedQuery}
  </p>
)}

    {fatsecretLoading && (
      <p style={{ color: "#64748b", fontWeight: "600" }}>
        Aranıyor...
      </p>
    )}

    {fatsecretError && (
      <p style={{ color: "#ef4444", fontWeight: "600" }}>
        {fatsecretError}
      </p>
    )}

    {!fatsecretLoading && !fatsecretError && fatsecretFoods.length > 0 && (
      <div style={{ display: "grid", gap: "12px" }}>
        {fatsecretFoods.map((food) => (
          <div
            key={food.id}
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <strong style={{ color: "#1e4d3b" }}>{food.name}</strong>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              {food.description || "Açıklama bulunamadı."}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      <div style={styles.mainGrid}>
        <div style={styles.leftPanel}>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.sectionTitle}>Takas Önerileri</h3>
              <p style={styles.sectionText}>
                Seçilen kategoriye göre uygun alternatifler listelenir.
              </p>
            </div>

            <span style={styles.resultBadge}>{filtreliTakaslar.length} sonuç</span>
          </div>

          <div style={styles.cardGrid}>
            {filtreliTakaslar.length === 0 ? (
              <div style={styles.noResultBox}>
                <FiAlertTriangle size={34} />
                <h3>Bu kategoride kayıt yok</h3>
                <p>
                  Bu kategori seçeneği hazırlandı. Data eklenince burada
                  görünecek.
                </p>
              </div>
            ) : (
              filtreliTakaslar.map((item) => {
                const eskiStyle = getFoodStyle(item.eski);
                const yeniStyle = getFoodStyle(item.yeni);

                const eskiKalori = Number(item.eskiKalori || 0);
                const yeniKalori = Number(item.yeniKalori || 0);
                const kaloriFarki = Math.max(0, eskiKalori - yeniKalori);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSeciliTakas(item)}
                    style={{
                      ...styles.card,
                      border:
                        seciliTakas?.id === item.id
                          ? `3px solid ${yeniStyle.color}`
                          : "3px solid transparent",
                    }}
                  >
                    <div style={styles.cardTop}>
                      <span style={styles.categoryBadge}>
                        {item.kategori || "Kategori yok"}
                      </span>
                      <span style={styles.statusBadge}>Uygun</span>
                    </div>

                    <div style={styles.foodChange}>
                      <div style={styles.foodSide}>
                        <div style={styles.foodIcon}>{eskiStyle.icon}</div>
                        <strong style={styles.foodName}>
                          {item.eski || "Eski besin yok"}
                        </strong>
                        <span style={{ ...styles.kcal, color: eskiStyle.color }}>
                          {eskiKalori} kcal
                        </span>
                      </div>

                      <div style={styles.changeIcon}>
                        <FiRefreshCw size={22} />
                      </div>

                      <div style={styles.foodSide}>
                        <div style={styles.foodIcon}>{yeniStyle.icon}</div>
                        <strong style={styles.foodName}>
                          {item.yeni || "Yeni besin yok"}
                        </strong>
                        <span style={{ ...styles.kcal, color: yeniStyle.color }}>
                          {yeniKalori} kcal
                        </span>
                      </div>
                    </div>

                    <div style={styles.cardBottom}>
                      <span style={styles.calorieSave}>
                        {kaloriFarki > 0
                          ? `-${kaloriFarki} kcal avantaj`
                          : "Kalori bilgisi yok"}
                      </span>
                    </div>

                    <div style={styles.tagArea}>
                      {item.etiketler?.map((etiket) => (
                        <span key={etiket} style={styles.tag}>
                          {etiket}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.detailPanel}>
          {!seciliTakas ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <FiAlertTriangle size={44} />
              </div>

              <h3 style={styles.detailTitle}>Değişim Seçilmedi</h3>

              <p style={styles.detailText}>
                Sol taraftaki kartlardan birini seçerek detayları görebilirsin.
              </p>
            </div>
          ) : (
            <div>
              <div style={styles.bigIcons}>
                <span>{getFoodStyle(seciliTakas.eski).icon}</span>
                <FiRefreshCw size={26} color="#94a3b8" />
                <span>{getFoodStyle(seciliTakas.yeni).icon}</span>
              </div>

              <h3 style={styles.detailTitle}>
                {seciliTakas.eski || "Eski besin"} →{" "}
                {seciliTakas.yeni || "Yeni besin"}
              </h3>

              <p style={styles.detailText}>
                {seciliTakas.neden || "Bu değişim için açıklama girilmedi."}
              </p>

              <div style={styles.healthSection}>
                <div style={styles.healthHeader}>
                  <span>Sağlıklı Tercih Skoru</span>
                  <strong>85%</strong>
                </div>

                <div style={styles.healthBar}>
                  <div style={styles.healthFill}></div>
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.smallTitle}>Kalori Karşılaştırması</h4>

                <div style={styles.infoGrid}>
                  <InfoBox
                    title="Eski Kalori"
                    value={`${Number(seciliTakas.eskiKalori || 0)} kcal`}
                  />

                  <InfoBox
                    title="Yeni Kalori"
                    value={`${Number(seciliTakas.yeniKalori || 0)} kcal`}
                  />
                </div>

                <div style={styles.compareBox}>
                  <span>Kalori farkı</span>
                  <strong>
                    -
                    {Math.max(
                      0,
                      Number(seciliTakas.eskiKalori || 0) -
                        Number(seciliTakas.yeniKalori || 0)
                    )}{" "}
                    kcal
                  </strong>
                </div>
              </div>

              <div style={styles.detailSection}>
                <h4 style={styles.smallTitle}>Avantajları</h4>

                <div style={styles.tagArea}>
                  {seciliTakas.etiketler?.map((etiket) => (
                    <span key={etiket} style={styles.tag}>
                      {etiket}
                    </span>
                  ))}
                </div>
              </div>

              <div style={styles.tipBox}>
                <FiActivity size={18} />
                <span>
                  Diyetisyen önerisi: Bu değişimi yaparken porsiyon kontrolünü
                  korumaya dikkat et.
                </span>
              </div>

              <div style={styles.warningBox}>
                <FiInfo size={18} />
                <span>
                  Bu bilgiler genel öneridir. Özel hastalık veya diyet planı
                  varsa diyetisyen kontrolü önemlidir.
                </span>
              </div>

              <button style={styles.button}>
                <FiPlusCircle size={20} />
                Planıma Ekle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, text }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <h3 style={styles.statValue}>{value}</h3>
        <p style={styles.statTitle}>{title}</p>
        <span style={styles.statText}>{text}</span>
      </div>
    </div>
  );
}

function InfoBox({ title, value }) {
  return (
    <div style={styles.infoBox}>
      <span style={styles.infoTitle}>{title}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    animation: "fadeIn 0.5s ease-in-out",
  },

  hero: {
    background: "linear-gradient(135deg, #ffffff, #f0fdf4)",
    borderRadius: "26px",
    padding: "28px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
    boxShadow: "0 15px 30px rgba(15, 23, 42, 0.05)",
  },

  title: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#134e4a",
    margin: 0,
  },

  subtitle: {
    color: "#64748b",
    margin: "8px 0 0 0",
    fontWeight: "600",
  },

  filterArea: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  inputBox: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },

  input: {
    padding: "14px 16px 14px 45px",
    borderRadius: "16px",
    border: "1px solid #dbe4ef",
    outline: "none",
    fontSize: "14px",
    width: "240px",
    backgroundColor: "white",
    color: "#334155",
  },

  select: {
    padding: "14px 16px 14px 45px",
    borderRadius: "16px",
    border: "1px solid #dbe4ef",
    outline: "none",
    fontSize: "14px",
    backgroundColor: "white",
    color: "#334155",
    minWidth: "180px",
    fontWeight: "700",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },

  statCard: {
    backgroundColor: "white",
    borderRadius: "22px",
    padding: "20px",
    display: "flex",
    gap: "15px",
    alignItems: "center",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
  },

  statIcon: {
    width: "52px",
    height: "52px",
    borderRadius: "16px",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  statValue: {
    margin: 0,
    color: "#0f172a",
    fontSize: "23px",
    fontWeight: "900",
  },

  statTitle: {
    margin: "3px 0",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "900",
  },

  statText: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: "700",
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.7fr 1fr",
    gap: "28px",
    alignItems: "start",
  },

  leftPanel: {
    backgroundColor: "white",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    color: "#134e4a",
    fontSize: "22px",
    fontWeight: "900",
  },

  sectionText: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
  },

  resultBadge: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "900",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "18px",
  },

  noResultBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "20px",
    padding: "42px",
    textAlign: "center",
    color: "#64748b",
    gridColumn: "1 / -1",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "22px",
    boxShadow: "0 10px 20px rgba(15, 23, 42, 0.05)",
    cursor: "pointer",
    transition: "0.25s",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  categoryBadge: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "900",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  statusBadge: {
    backgroundColor: "#dcfce7",
    color: "#047857",
    fontSize: "11px",
    fontWeight: "900",
    padding: "6px 10px",
    borderRadius: "999px",
  },

  foodChange: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  foodSide: {
    flex: 1,
    textAlign: "center",
  },

  foodIcon: {
    fontSize: "38px",
    marginBottom: "6px",
  },

  foodName: {
    display: "block",
    color: "#334155",
    fontSize: "15px",
    minHeight: "38px",
  },

  kcal: {
    fontSize: "12px",
    fontWeight: "900",
  },

  changeIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardBottom: {
    marginTop: "18px",
    textAlign: "center",
  },

  calorieSave: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "900",
    padding: "8px 12px",
    borderRadius: "999px",
  },

  tagArea: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "16px",
  },

  tag: {
    backgroundColor: "#f0fdf4",
    color: "#047857",
    fontSize: "12px",
    fontWeight: "800",
    padding: "7px 10px",
    borderRadius: "999px",
  },

  detailPanel: {
    backgroundColor: "white",
    borderRadius: "26px",
    padding: "28px",
    minHeight: "530px",
    boxShadow: "0 12px 24px rgba(15, 23, 42, 0.05)",
    textAlign: "center",
    position: "sticky",
    top: "20px",
  },

  emptyState: {
    minHeight: "470px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: "92px",
    height: "92px",
    backgroundColor: "#f0f9ff",
    color: "#0284c7",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },

  bigIcons: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "12px",
    fontSize: "50px",
    marginBottom: "18px",
  },

  detailTitle: {
    fontSize: "22px",
    fontWeight: "900",
    color: "#134e4a",
    marginBottom: "10px",
  },

  detailText: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.6",
    marginBottom: "20px",
  },

  healthSection: {
    marginBottom: "18px",
  },

  healthHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "900",
    color: "#334155",
    marginBottom: "8px",
  },

  healthBar: {
    width: "100%",
    height: "10px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },

  healthFill: {
    width: "85%",
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: "999px",
  },

  detailSection: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "15px",
    marginBottom: "15px",
    textAlign: "left",
  },

  smallTitle: {
    margin: "0 0 12px 0",
    color: "#1e293b",
    fontSize: "15px",
    fontWeight: "900",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },

  infoBox: {
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    padding: "12px",
    textAlign: "left",
  },

  infoTitle: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "800",
    marginBottom: "4px",
  },

  infoValue: {
    fontSize: "14px",
    color: "#1e293b",
  },

  compareBox: {
    marginTop: "12px",
    backgroundColor: "#ecfdf5",
    color: "#047857",
    borderRadius: "14px",
    padding: "12px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    fontWeight: "900",
  },

  tipBox: {
    backgroundColor: "#f0f9ff",
    color: "#0369a1",
    borderRadius: "16px",
    padding: "12px",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "14px",
    display: "flex",
    gap: "8px",
    textAlign: "left",
  },

  warningBox: {
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    borderRadius: "16px",
    padding: "12px",
    fontSize: "13px",
    lineHeight: "1.5",
    marginBottom: "18px",
    display: "flex",
    gap: "8px",
    textAlign: "left",
  },

  button: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#134e4a",
    color: "white",
    border: "none",
    borderRadius: "16px",
    fontWeight: "800",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "16px",
  },
};

export default BesinTakasPage;