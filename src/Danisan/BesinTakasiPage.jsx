import { useMemo, useState } from "react";
import "./BesinTakasiPage.css";

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

    alert(
      `"${selectedFood.kaynak}" yerine "${selectedAlternative}" seçildi.`
    );
  };

  return (
    <div className="page besin-takasi-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Besin Takası</h2>
          <p className="page-subtitle">
            Öğünündeki besinler için eşdeğer alternatifleri görüntüle ve seçim yap.
          </p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Besin ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="swap-layout">
        <div className="swap-left">
          <h3 className="section-title">Takas Önerileri</h3>

          <div className="swap-grid">
            {filteredOneriler.length > 0 ? (
              filteredOneriler.map((item) => (
                <div
                  key={item.id}
                  className={`card swap-card ${
                    selectedFood?.id === item.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectFood(item)}
                >
                  <div className="swap-card-top">
                    <span className="swap-badge">Seçilen Besin</span>
                  </div>

                  <h3 className="swap-source">{item.kaynak}</h3>

                  <div className="swap-arrow">⇄</div>

                  <p className="swap-preview">
                    {Array.isArray(item.alternatifler)
                      ? item.alternatifler[0]
                      : item.alternatif}
                  </p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                Aramaya uygun besin bulunamadı.
              </div>
            )}
          </div>
        </div>

        <div className="swap-right card">
          {!selectedFood ? (
            <div className="detail-empty">
              <h3>Besin Seçilmedi</h3>
              <p>Soldaki kartlardan birine tıklayarak takas detayını görüntüleyin.</p>
            </div>
          ) : (
            <>
              <h3 className="section-title">Takas Detayı</h3>

              <div className="compare-wrapper">
                <div className="compare-box">
                  <span className="compare-label">Seçilen</span>
                  <h4>{selectedFood.kaynak}</h4>
                </div>

                <div className="equal-icon">=</div>

                <div className="compare-box">
                  <span className="compare-label">Alternatif</span>
                  <h4>{selectedAlternative}</h4>
                </div>
              </div>

              <div className="alternative-section">
                <h4 className="alternative-title">Alternatifler</h4>

                <div className="alternative-list">
                  {Array.isArray(selectedFood.alternatifler) &&
                  selectedFood.alternatifler.length > 0 ? (
                    selectedFood.alternatifler.map((alt, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`alternative-btn ${
                          selectedAlternative === alt ? "selected" : ""
                        }`}
                        onClick={() => setSelectedAlternative(alt)}
                      >
                        {alt}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      className="alternative-btn selected"
                    >
                      {selectedFood.alternatif}
                    </button>
                  )}
                </div>
              </div>

              <div className="summary-box">
                <div className="summary-item">
                  <span className="summary-label">Durum</span>
                  <span className="summary-value success">Eşdeğer Takas</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Kategori</span>
                  <span className="summary-value">Besin Değişimi</span>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  className="apply-btn"
                  onClick={handleApplySwap}
                >
                  Takası Uygula
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setSelectedFood(null);
                    setSelectedAlternative("");
                  }}
                >
                  Temizle
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BesinTakasiPage;