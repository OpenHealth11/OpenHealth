import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const OGUN_STILI = [
  { ad: "Sabah", emoji: "🌅", renk: "#f59e0b", arkaPlan: "#fffbeb" },
  { ad: "Öğle", emoji: "☀️", renk: "#3b82f6", arkaPlan: "#eff6ff" },
  { ad: "Akşam", emoji: "🌙", renk: "#8b5cf6", arkaPlan: "#f5f3ff" },
  { ad: "Ara Öğün", emoji: "🍎", renk: "#10b981", arkaPlan: "#ecfdf5" },
];

function ogunForKayit(item) {
  if (item.kind === "activity") return null;
  return item.ogun || "Sabah";
}

/** @param {{ gunlukKayitlar?: object[], assignedClients?: { fullName?: string }[] }} props */
function GunlukTakip({ gunlukKayitlar = [], assignedClients = [] }) {
  const [secilenDanisan, setSecilenDanisan] = useState("");
  const [secilenTarih, setSecilenTarih] = useState("");
  const [topluDetayTarih, setTopluDetayTarih] = useState(null);

  const danisanSecenekleri = useMemo(() => {
    const names = (assignedClients || [])
      .map((c) => (typeof c.fullName === "string" ? c.fullName.trim() : ""))
      .filter(Boolean);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "tr"));
  }, [assignedClients]);

  useEffect(() => {
    if (secilenDanisan || danisanSecenekleri.length !== 1) return;
    setSecilenDanisan(danisanSecenekleri[0]);
  }, [danisanSecenekleri, secilenDanisan]);

  const filtreliKayitlar = useMemo(() => {
    const list = Array.isArray(gunlukKayitlar) ? gunlukKayitlar : [];
    if (!secilenDanisan) return [];
    return list.filter((item) => {
      const danisanUygun = item.danisanAdi === secilenDanisan;
      const tarihUygun = !secilenTarih || item.tarih === secilenTarih;
      return danisanUygun && tarihUygun;
    });
  }, [gunlukKayitlar, secilenDanisan, secilenTarih]);

  const ogunluKayitlar = useMemo(
    () => filtreliKayitlar.filter((item) => item.kind !== "activity"),
    [filtreliKayitlar]
  );

  const aktiviteKayitlari = useMemo(
    () => filtreliKayitlar.filter((item) => item.kind === "activity"),
    [filtreliKayitlar]
  );

  const toplamKalori = ogunluKayitlar.reduce(
    (toplam, item) => toplam + Number(item.kalori || 0),
    0
  );

  const toplamYakilan = aktiviteKayitlari.reduce(
    (toplam, item) => toplam + Number(item.yakilanKalori || 0),
    0
  );

  const toplamSu = filtreliKayitlar.reduce(
    (toplam, item) => toplam + Number(item.su || 0),
    0
  );

  const netKalori = toplamKalori - toplamYakilan;
  const hedefKalori = 1600;
  const suHedefi = 8;

  const kaloriDurumu =
    toplamKalori > hedefKalori
      ? "Hedef üstü"
      : toplamKalori >= hedefKalori * 0.8
        ? "Uygun"
        : "Eksik";

  const suDurumu = toplamSu >= suHedefi ? "Tamamlandı" : "Eksik";

  const tarihler = useMemo(() => {
    const set = new Set(filtreliKayitlar.map((i) => i.tarih).filter(Boolean));
    return [...set].sort((a, b) => String(b).localeCompare(String(a)));
  }, [filtreliKayitlar]);

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Günlük Takip</h2>

      <div className="dy-card">
        <h3>Filtreler</h3>
        <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0 }}>
          Önce danışan seçin; kayıtlar ve aktiviteler yalnızca seçili danışana göre listelenir.
        </p>

        <div className="dy-form-grid">
          <select
            value={secilenDanisan}
            onChange={(e) => {
              setSecilenDanisan(e.target.value);
              setTopluDetayTarih(null);
            }}
          >
            <option value="">— Danışan seçin —</option>
            {danisanSecenekleri.map((isim) => (
              <option key={isim} value={isim}>
                {isim}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={secilenTarih}
            onChange={(e) => setSecilenTarih(e.target.value)}
          />

          <button
            type="button"
            className="dy-secondary-btn"
            onClick={() => {
              setSecilenTarih("");
              setTopluDetayTarih(null);
            }}
          >
            Tarihi Temizle
          </button>
        </div>
      </div>

      {!secilenDanisan ? (
        <div className="dy-card">
          <p>Görüntülenecek günlük kayıtları için yukarıdan bir danışan seçin.</p>
        </div>
      ) : (
        <>
          <div className="dy-stats-grid">
            <div className="dy-card dy-stat-card">
              <h3>Toplam Kalori (öğün)</h3>
              <p>{toplamKalori} kcal</p>
            </div>

            <div className="dy-card dy-stat-card">
              <h3>Hedef Kalori</h3>
              <p>{hedefKalori} kcal</p>
            </div>

            <div className="dy-card dy-stat-card">
              <h3>Yakılan (aktivite)</h3>
              <p>{toplamYakilan} kcal</p>
            </div>

            <div className="dy-card dy-stat-card">
              <h3>Net (öğün − aktivite)</h3>
              <p>{netKalori} kcal</p>
            </div>

            <div className="dy-card dy-stat-card">
              <h3>İçilen Su</h3>
              <p>{toplamSu} bardak</p>
            </div>

            <div className="dy-card dy-stat-card">
              <h3>Su Hedefi</h3>
              <p>{suHedefi} bardak</p>
            </div>
          </div>

          <div className="dy-card">
            <h3>Günlük Değerlendirme</h3>
            <p>
              <strong>Kalori Durumu:</strong> {kaloriDurumu}
            </p>
            <p>
              <strong>Su Durumu:</strong> {suDurumu}
            </p>
            <p style={{ color: "#64748b", fontSize: "14px", marginBottom: 0 }}>
              Her tarih için tek bir <strong>günün özet detayı</strong> ile tüm öğün ve aktiviteleri birlikte
              görebilirsiniz.
            </p>
          </div>

          <div className="dy-card">
            <h3>Günlük Kayıtlar — {secilenDanisan}</h3>

            {filtreliKayitlar.length === 0 ? (
              <p>Bu danışan için seçilen filtrelere uygun kayıt yok.</p>
            ) : (
              tarihler.map((gun) => {
                const gunItems = filtreliKayitlar.filter((i) => i.tarih === gun);
                const gunOgun = gunItems.filter((i) => i.kind !== "activity");
                const gunAktivite = gunItems.filter((i) => i.kind === "activity");

                return (
                  <div
                    key={gun}
                    style={{
                      marginBottom: "28px",
                      paddingBottom: "20px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <h4 style={{ margin: 0, color: "#1e4d3b" }}>{gun}</h4>
                      <button
                        type="button"
                        className="dy-primary-btn"
                        onClick={() => setTopluDetayTarih(gun)}
                      >
                        Günün toplu detayı
                      </button>
                    </div>

                    {OGUN_STILI.map((ogun) => {
                      const items = gunOgun.filter((it) => ogunForKayit(it) === ogun.ad);
                      const ogunToplam = items.reduce(
                        (s, it) => s + Number(it.kalori || 0),
                        0
                      );

                      return (
                        <div
                          key={`${gun}-${ogun.ad}`}
                          style={{
                            marginBottom: "16px",
                            padding: "14px 16px",
                            borderRadius: "14px",
                            backgroundColor: ogun.arkaPlan,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "10px",
                            }}
                          >
                            <strong style={{ color: ogun.renk }}>
                              {ogun.emoji} {ogun.ad}
                            </strong>
                            <span style={{ color: ogun.renk, fontWeight: 700 }}>
                              {ogunToplam} kcal
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p style={{ color: "#94a3b8", margin: 0, fontSize: "14px" }}>
                              Bu öğün için kayıt yok.
                            </p>
                          ) : (
                            <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
                              {items.map((item) => (
                                <li key={item.id} style={{ marginBottom: "8px" }}>
                                  <strong>{item.detay}</strong>
                                  <span style={{ color: "#64748b" }}>
                                    {" "}
                                    — {item.kalori} kcal ({item.ogun})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}

                    {(() => {
                      const bilinen = new Set(OGUN_STILI.map((o) => o.ad));
                      const diger = gunOgun.filter((it) => !bilinen.has(ogunForKayit(it) || ""));
                      if (diger.length === 0) return null;
                      const digerToplam = diger.reduce((s, it) => s + Number(it.kalori || 0), 0);
                      return (
                        <div
                          style={{
                            marginBottom: "16px",
                            padding: "14px 16px",
                            borderRadius: "14px",
                            backgroundColor: "#f1f5f9",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "10px",
                            }}
                          >
                            <strong style={{ color: "#475569" }}>🍽️ Diğer öğün</strong>
                            <span style={{ color: "#475569", fontWeight: 700 }}>
                              {digerToplam} kcal
                            </span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#334155" }}>
                            {diger.map((item) => (
                              <li key={item.id} style={{ marginBottom: "8px" }}>
                                <strong>{item.detay}</strong>
                                <span style={{ color: "#64748b" }}>
                                  {" "}
                                  — {item.kalori} kcal ({item.ogun})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}

                    <div
                      style={{
                        marginTop: "12px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        backgroundColor: "#ecfdf5",
                      }}
                    >
                      <strong style={{ color: "#047857" }}>🏃 Aktiviteler</strong>
                      {gunAktivite.length === 0 ? (
                        <p style={{ color: "#64748b", margin: "8px 0 0", fontSize: "14px" }}>
                          Bu gün için aktivite kaydı yok.
                        </p>
                      ) : (
                        <ul style={{ margin: "10px 0 0", paddingLeft: "1.25rem", color: "#065f46" }}>
                          {gunAktivite.map((item) => (
                            <li key={item.id} style={{ marginBottom: "8px" }}>
                              <strong>{item.detay}</strong>
                              <span style={{ color: "#047857" }}>
                                {" "}
                                — {item.aktiviteSure ?? item.sure ?? "—"} dk, yakılan{" "}
                                {item.yakilanKalori ?? 0} kcal
                              </span>
                              {item.not ? (
                                <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                                  {item.not}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {topluDetayTarih && secilenDanisan
        ? (() => {
            const gun = topluDetayTarih;
            const gunItems = filtreliKayitlar.filter((i) => i.tarih === gun);
            const gunOgun = gunItems.filter((i) => i.kind !== "activity");
            const gunAktivite = gunItems.filter((i) => i.kind === "activity");
            const bilinen = new Set(OGUN_STILI.map((o) => o.ad));
            const gunKalori = gunOgun.reduce((s, it) => s + Number(it.kalori || 0), 0);
            const gunYakilan = gunAktivite.reduce(
              (s, it) => s + Number(it.yakilanKalori || 0),
              0
            );

            return createPortal(
              <div
                className="dy-modal-overlay"
                role="presentation"
                onClick={() => setTopluDetayTarih(null)}
              >
                <div
                  className="dy-modal-dialog dy-detail-card"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="gun-toplu-detay-baslik"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="dy-detail-header">
                    <div>
                      <p style={{ margin: 0 }}>Günün toplu detayı</p>
                      <h3 id="gun-toplu-detay-baslik">{gun}</h3>
                      <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>
                        {secilenDanisan}
                      </p>
                    </div>
                    <button type="button" onClick={() => setTopluDetayTarih(null)}>
                      ✕
                    </button>
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <h4 style={{ color: "#1e4d3b", marginBottom: "10px", fontSize: "16px" }}>
                      Öğünler
                    </h4>
                    {gunOgun.length === 0 ? (
                      <p style={{ color: "#94a3b8" }}>Bu gün için öğün kaydı yok.</p>
                    ) : (
                      OGUN_STILI.map((ogun) => {
                        const items = gunOgun.filter((it) => ogunForKayit(it) === ogun.ad);
                        if (items.length === 0) return null;
                        const sub = items.reduce((s, it) => s + Number(it.kalori || 0), 0);
                        return (
                          <div key={ogun.ad} style={{ marginBottom: "14px" }}>
                            <strong style={{ color: ogun.renk }}>
                              {ogun.emoji} {ogun.ad}
                            </strong>
                            <span style={{ color: "#64748b", marginLeft: "8px" }}>({sub} kcal)</span>
                            <ul style={{ margin: "6px 0 0", paddingLeft: "1.25rem" }}>
                              {items.map((item) => (
                                <li key={item.id}>
                                  {item.detay} — <strong>{item.kalori} kcal</strong>
                                  {item.not ? (
                                    <span style={{ color: "#64748b" }}> · {item.not}</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })
                    )}
                    {gunOgun.some((it) => !bilinen.has(ogunForKayit(it) || "")) ? (
                      <div style={{ marginBottom: "14px" }}>
                        <strong style={{ color: "#475569" }}>🍽️ Diğer öğün</strong>
                        <ul style={{ margin: "6px 0 0", paddingLeft: "1.25rem" }}>
                          {gunOgun
                            .filter((it) => !bilinen.has(ogunForKayit(it) || ""))
                            .map((item) => (
                              <li key={item.id}>
                                {item.detay} ({item.ogun}) — <strong>{item.kalori} kcal</strong>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>

                  <div
                    style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}
                  >
                    <h4 style={{ color: "#047857", marginBottom: "10px", fontSize: "16px" }}>
                      Aktiviteler
                    </h4>
                    {gunAktivite.length === 0 ? (
                      <p style={{ color: "#94a3b8" }}>Bu gün için aktivite kaydı yok.</p>
                    ) : (
                      <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                        {gunAktivite.map((item) => (
                          <li key={item.id} style={{ marginBottom: "8px" }}>
                            <strong>{item.detay}</strong> — {item.aktiviteSure ?? item.sure ?? "—"}{" "}
                            dk, yakılan {item.yakilanKalori ?? 0} kcal
                            {item.not ? (
                              <div style={{ color: "#64748b", fontSize: "13px" }}>{item.not}</div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      padding: "14px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Öğün toplamı:</strong> {gunKalori} kcal
                    </p>
                    <p style={{ margin: "0 0 6px" }}>
                      <strong>Aktivitede yakılan:</strong> {gunYakilan} kcal
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Net:</strong> {gunKalori - gunYakilan} kcal
                    </p>
                  </div>

                  <button
                    type="button"
                    className="dy-secondary-btn"
                    style={{ marginTop: "20px", width: "100%" }}
                    onClick={() => setTopluDetayTarih(null)}
                  >
                    Kapat
                  </button>
                </div>
              </div>,
              document.body
            );
          })()
        : null}
    </div>
  );
}

export default GunlukTakip;
