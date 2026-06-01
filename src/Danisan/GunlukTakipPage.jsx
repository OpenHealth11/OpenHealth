import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiTrash2,
  FiActivity,
  FiEdit3,
  FiClock,
  FiDroplet,
  FiMinus,
} from "react-icons/fi";

const foodEmojiMap = {
  elma: "🍎",
  armut: "🍐",
  muz: "🍌",
  üzüm: "🍇",
  çilek: "🍓",
  kavun: "🍈",
  karpuz: "🍉",
  portakal: "🍊",
  havuç: "🥕",
  domates: "🍅",
  salatalık: "🥒",
  soğan: "🧅",
  sarımsak: "🧄",
  patates: "🥔",
  mısır: "🌽",
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

const getFoodVisual = (foodName) => {
  const lowerFood = foodName.toLowerCase().trim();

  for (const [keyword, emoji] of Object.entries(foodEmojiMap)) {
    if (lowerFood.includes(keyword)) {
      return emoji;
    }
  }

  return "🍽️";
};

const getActivityVisual = (activityName) => {
  const lower = activityName.toLowerCase().trim();

  if (lower.includes("yürüyüş")) return "🚶‍♀️";
  if (lower.includes("koşu")) return "🏃‍♀️";
  if (lower.includes("bisiklet")) return "🚴‍♀️";
  if (lower.includes("pilates")) return "🧘‍♀️";
  if (lower.includes("yoga")) return "🧘‍♀️";
  if (lower.includes("fitness")) return "🏋️‍♀️";
  if (lower.includes("spor")) return "🏋️‍♀️";
  if (lower.includes("yüzme")) return "🏊‍♀️";
  if (lower.includes("dans")) return "💃";

  return "🔥";
};

function GunlukTakipPage({
  kayitlar = [],
  addGunlukKayit,
  deleteGunlukKayit,
  water,
  addWater,
  removeWater,
}) {
  const liste = Array.isArray(kayitlar) ? kayitlar : [];
  const [form, setForm] = useState({
    besin: "",
    kalori: "",
    ogun: "Sabah",
  });

  const [aktiviteForm, setAktiviteForm] = useState({
    aktivite: "",
    sure: "",
    yakilanKalori: "",
    not: "",
  });

  const guvenliWater =
  water && typeof water === "object"
    ? water
    : { icilen: 0, hedef: 8 };

const suBardak = Number(guvenliWater.icilen) || 0;
const hedefBardak = Number(guvenliWater.hedef) || 8;

  const mealListe = liste.filter((item) => item.kind !== "activity");
  const aktiviteKayitlari = liste.filter((item) => item.kind === "activity");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.besin.trim() || !form.kalori) return;

    await addGunlukKayit({
      ...form,
      kalori: Number(form.kalori),
      tarih: new Date().toISOString().split("T")[0],
    });

    setForm({
      besin: "",
      kalori: "",
      ogun: "Sabah",
    });
  };

  const handleAktiviteSubmit = async (e) => {
    e.preventDefault();

    if (!aktiviteForm.aktivite.trim() || !aktiviteForm.sure) return;

    await addGunlukKayit({
      kind: "activity",
      aktivite: aktiviteForm.aktivite.trim(),
      sure: Number(aktiviteForm.sure),
      yakilanKalori: Number(aktiviteForm.yakilanKalori || 0),
      not: aktiviteForm.not,
      tarih: new Date().toISOString().split("T")[0],
    });

    setAktiviteForm({
      aktivite: "",
      sure: "",
      yakilanKalori: "",
      not: "",
    });
  };

  const deleteAktiviteKayit = async (id) => {
    await deleteGunlukKayit(id);
  };

  const toplamKalori = mealListe.reduce(
    (sum, item) => sum + Number(item.kalori ?? 0),
    0
  );

  const toplamYakilanKalori = aktiviteKayitlari.reduce(
    (sum, item) => sum + Number(item.yakilanKalori),
    0
  );

  const toplamAktiviteSuresi = aktiviteKayitlari.reduce(
    (sum, item) => sum + Number(item.sure),
    0
  );

  const netKalori = toplamKalori - toplamYakilanKalori;

  const ogunler = [
    { ad: "Sabah", emoji: "🌅", renk: "#f59e0b", arkaPlan: "#fffbeb" },
    { ad: "Öğle", emoji: "☀️", renk: "#3b82f6", arkaPlan: "#eff6ff" },
    { ad: "Akşam", emoji: "🌙", renk: "#8b5cf6", arkaPlan: "#f5f3ff" },
    { ad: "Ara Öğün", emoji: "🍎", renk: "#10b981", arkaPlan: "#ecfdf5" },
  ];

  const ogunForItem = (item) => item.ogun || "Sabah";

  const renderKayit = (item) => (
    <div
      key={item.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        backgroundColor: "#f8fafc",
        borderRadius: "15px",
        marginBottom: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div
          style={{
            fontSize: "30px",
            backgroundColor: "white",
            width: "60px",
            height: "60px",
            borderRadius: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {getFoodVisual(item.besin)}
        </div>

        <div>
          <strong style={{ color: "#334155", display: "block" }}>
            {item.besin}
          </strong>
          <span style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "4px" }}>
            {(item.tarih ? `${item.tarih} · ` : "")}
            {ogunForItem(item)}
          </span>
          <span style={{ color: "#10b981", fontSize: "14px", fontWeight: "700" }}>
            {item.kalori} kcal
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={async () => {
          await deleteGunlukKayit(item.id);
        }}
        style={{
          backgroundColor: "#fee2e2",
          color: "#ef4444",
          border: "none",
          padding: "12px",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        <FiTrash2 size={18} />
      </button>
    </div>
  );

  return (
    <div className="page" style={{ animation: "fadeIn 0.5s ease-in-out" }}>
      <h2 className="page-title" style={{ marginBottom: "25px", fontWeight: "800", color: "#1e4d3b" }}>
        Günlük Takip
      </h2>

      <p style={{ margin: "-12px 0 22px", color: "#64748b", fontSize: "14px", maxWidth: "720px" }}>
        Eklediğin öğünler diyetisyeninin panelindeki <strong>Günlük Takip</strong> sayfasına düşer (aynı veritabanı kaydı).
      </p>

      <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", marginBottom: "30px", borderTop: "5px solid #3b82f6" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e4d3b" }}>
          <FiEdit3 color="#3b82f6" /> Yeni Besin Ekle
        </h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Ne yedin? Örn: Tavuklu pilav"
            value={form.besin}
            onChange={(e) => setForm({ ...form, besin: e.target.value })}
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Kalori"
            value={form.kalori}
            onChange={(e) => setForm({ ...form, kalori: e.target.value })}
            style={inputStyle}
          />

          <select
            value={form.ogun}
            onChange={(e) => setForm({ ...form, ogun: e.target.value })}
            style={inputStyle}
          >
            <option value="Sabah">🌅 Sabah</option>
            <option value="Öğle">☀️ Öğle</option>
            <option value="Akşam">🌙 Akşam</option>
            <option value="Ara Öğün">🍎 Ara Öğün</option>
          </select>

          <button type="submit" style={buttonStyle}>
            <FiPlus size={18} /> Ekle
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
          <h3 style={{ color: "#1e4d3b" }}>
            <FiActivity color="#f59e0b" /> Bugünkü Besin Kayıtları
          </h3>

          <strong style={{ color: "#d97706" }}>
            Toplam: {toplamKalori} kcal
          </strong>
        </div>

        {mealListe.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>
            Bugün henüz besin kaydı eklemedin.
          </p>
        ) : (
          ogunler.map((ogun) => {
            const ogunKayitlari = mealListe.filter((item) => ogunForItem(item) === ogun.ad);
            const ogunToplam = ogunKayitlari.reduce((sum, item) => sum + Number(item.kalori ?? 0), 0);

            return (
              <div
                key={ogun.ad}
                style={{
                  marginBottom: "25px",
                  padding: "18px",
                  borderRadius: "18px",
                  backgroundColor: ogun.arkaPlan,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <h3 style={{ color: ogun.renk, margin: 0 }}>
                    {ogun.emoji} {ogun.ad}
                  </h3>
                  <span style={{ color: ogun.renk, fontWeight: "800" }}>
                    {ogunToplam} kcal
                  </span>
                </div>

                {ogunKayitlari.length === 0 ? (
                  <p style={{ color: "#94a3b8", margin: 0 }}>
                    Bu öğün için henüz kayıt yok.
                  </p>
                ) : (
                  [...ogunKayitlari].reverse().map(renderKayit)
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SU TAKİBİ KARTI */}
      <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", marginBottom: "30px", borderTop: "5px solid #3b82f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ fontSize: "24px", backgroundColor: "#eff6ff", color: "#3b82f6", width: "55px", height: "55px", borderRadius: "15px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiDroplet />
          </div>
          <div>
            <h3 style={{ margin: 0, color: "#1e4d3b", display: "flex", alignItems: "center", gap: "8px" }}>
              Günlük Su Tüketimi
            </h3>
            <span style={{ color: "#64748b", fontSize: "14px" }}>Hedef: {hedefBardak} Bardak</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6" }}>{suBardak}</span>
            <span style={{ color: "#94a3b8", fontSize: "16px", fontWeight: "600" }}> / {hedefBardak}</span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={removeWater}style={{ padding: "10px", backgroundColor: "#f1f5f9", color: "#64748b", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiMinus size={20} />
            </button>
            <button
  type="button"
  onClick={addWater}
  disabled={suBardak >= hedefBardak} style={{ padding: "10px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "25px", borderRadius: "20px", backgroundColor: "white", borderTop: "5px solid #10b981" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1e4d3b" }}>
          <FiActivity color="#10b981" /> Günlük Fiziksel Aktivite Ekle
        </h3>

        <form onSubmit={handleAktiviteSubmit} style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "25px" }}>
          <input
            type="text"
            placeholder="Aktivite adı: yürüyüş, koşu, pilates..."
            value={aktiviteForm.aktivite}
            onChange={(e) =>
              setAktiviteForm({ ...aktiviteForm, aktivite: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Süre / dk"
            value={aktiviteForm.sure}
            onChange={(e) =>
              setAktiviteForm({ ...aktiviteForm, sure: e.target.value })
            }
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Yakılan kalori"
            value={aktiviteForm.yakilanKalori}
            onChange={(e) =>
              setAktiviteForm({
                ...aktiviteForm,
                yakilanKalori: e.target.value,
              })
            }
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Not: hafif tempo, yorucu geçti..."
            value={aktiviteForm.not}
            onChange={(e) =>
              setAktiviteForm({ ...aktiviteForm, not: e.target.value })
            }
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>
            <FiPlus size={18} /> Aktivite Ekle
          </button>
        </form>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "25px",
          }}
        >
          <div style={summaryBoxStyle}>
            <strong>🔥 Yakılan Kalori</strong>
            <span>{toplamYakilanKalori} kcal</span>
          </div>

          <div style={summaryBoxStyle}>
            <strong>⏱️ Toplam Süre</strong>
            <span>{toplamAktiviteSuresi} dk</span>
          </div>

          <div style={summaryBoxStyle}>
            <strong>⚖️ Net Kalori</strong>
            <span>{netKalori} kcal</span>
          </div>
        </div>

        {aktiviteKayitlari.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center" }}>
            Bugün henüz fiziksel aktivite eklenmedi.
          </p>
        ) : (
          aktiviteKayitlari.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 20px",
                backgroundColor: "#ecfdf5",
                borderRadius: "15px",
                marginBottom: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                <div
                  style={{
                    fontSize: "30px",
                    backgroundColor: "white",
                    width: "60px",
                    height: "60px",
                    borderRadius: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getActivityVisual(item.aktivite)}
                </div>

                <div>
                  <strong style={{ color: "#064e3b", display: "block" }}>
                    {item.aktivite}
                  </strong>

                  <span style={{ color: "#047857", fontSize: "14px", fontWeight: "700" }}>
                    <FiClock /> {item.sure} dk | {item.yakilanKalori} kcal
                  </span>

                  {item.not && (
                    <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "13px" }}>
                      {item.not}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteAktiviteKayit(item.id)}
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#ef4444",
                  border: "none",
                  padding: "12px",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  flex: "1",
  minWidth: "180px",
  padding: "14px 15px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  outline: "none",
  fontSize: "15px",
  backgroundColor: "#f8fafc",
};

const buttonStyle = {
  padding: "14px 25px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "700",
  fontSize: "15px",
};

const summaryBoxStyle = {
  backgroundColor: "#f8fafc",
  padding: "18px",
  borderRadius: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  color: "#1e4d3b",
};

export default GunlukTakipPage;