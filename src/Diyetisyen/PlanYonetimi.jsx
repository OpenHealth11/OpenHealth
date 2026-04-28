import { useCallback, useEffect, useState } from "react";

const META_V = 1;

function todayIsoLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildOgunlerPayload(form, toplamKalori, kaloriDurumu) {
  const meta = {
    v: META_V,
    planTuru: form.planTuru,
    danisanKilo: form.danisanKilo,
    hedefKalori: form.hedefKalori,
    suHedefi: form.suHedefi,
    durum: form.durum,
    not: form.not,
    toplamKalori,
    kaloriDurumu,
    meals: form.ogunler,
  };
  return [
    {
      gun: form.baslangicTarihi.trim(),
      ogunler: JSON.stringify(meta),
    },
  ];
}

function parseMetaFromPlan(plan) {
  const raw = plan?.ogunler?.[0]?.ogunler;
  if (typeof raw !== "string" || !raw.trim().startsWith("{")) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formFromApiPlan(plan, fallbackOgunler) {
  const meta = parseMetaFromPlan(plan) || {};
  const meals =
    Array.isArray(meta.meals) && meta.meals.length > 0
      ? meta.meals
      : fallbackOgunler;

  return {
    clientUserId: plan.clientUserId != null ? String(plan.clientUserId) : "",
    baslik: plan.planAdi || "",
    planTuru: meta.planTuru || "Kilo Verme",
    baslangicTarihi: plan.baslangicTarihi || "",
    bitisTarihi: plan.bitisTarihi ?? "",
    danisanKilo: meta.danisanKilo ?? "",
    hedefKalori: meta.hedefKalori ?? "",
    suHedefi: meta.suHedefi ?? "",
    durum: meta.durum || "Aktif",
    not: meta.not ?? "",
    ogunler: meals.map((m, idx) => ({
      id: m.id ?? idx + 1,
      ogunAdi: m.ogunAdi ?? "",
      saat: m.saat ?? "",
      icerik: m.icerik ?? "",
      kalori: m.kalori ?? "",
    })),
  };
}

export default function PlanYonetimi({ onPlansChanged }) {
  const bosForm = {
    clientUserId: "",
    baslik: "",
    danisanKilo: "",
    planTuru: "Kilo Verme",
    baslangicTarihi: "",
    bitisTarihi: "",
    hedefKalori: "",
    suHedefi: "",
    durum: "Aktif",
    not: "",
    ogunler: [
      { id: 1, ogunAdi: "Kahvaltı", saat: "08:30", icerik: "", kalori: "" },
      { id: 2, ogunAdi: "Öğle", saat: "13:00", icerik: "", kalori: "" },
      { id: 3, ogunAdi: "Akşam", saat: "19:00", icerik: "", kalori: "" },
    ],
  };

  const [danisanlar, setDanisanlar] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadState, setLoadState] = useState({ loading: true, err: "" });

  const [form, setForm] = useState(bosForm);
  const [duzenlenenPlanId, setDuzenlenenPlanId] = useState(null);
  const [goruntulenenPlan, setGoruntulenenPlan] = useState(null);

  const refreshPlans = useCallback(async () => {
    const r = await fetch("/api/diyetisyen/plans", { headers: authHeaders() });
    if (!r.ok) {
      throw new Error(r.status === 401 ? "Oturum gerekli." : "Planlar yüklenemedi.");
    }
    const data = await r.json();
    const list = data.plans || [];
    setPlans(list);
    onPlansChanged?.(list);
  }, [onPlansChanged]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState({ loading: true, err: "" });
      try {
        const [dRes, pRes] = await Promise.all([
          fetch("/api/diyetisyen/danisanlar", { headers: authHeaders() }),
          fetch("/api/diyetisyen/plans", { headers: authHeaders() }),
        ]);
        if (!dRes.ok || !pRes.ok) {
          const msg =
            dRes.status === 401 || pRes.status === 401
              ? "Oturum gerekli; lütfen tekrar giriş yapın."
              : "Veriler yüklenemedi.";
          if (!cancelled) setLoadState({ loading: false, err: msg });
          return;
        }
        const dJson = await dRes.json();
        const pJson = await pRes.json();
        if (cancelled) return;
        setDanisanlar(dJson.danisanlar || []);
        const list = pJson.plans || [];
        setPlans(list);
        onPlansChanged?.(list);
        setLoadState({ loading: false, err: "" });
      } catch {
        if (!cancelled) setLoadState({ loading: false, err: "Ağ hatası." });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onPlansChanged]);

  const toplamKalori = form.ogunler.reduce(
    (toplam, ogun) => toplam + Number(ogun.kalori || 0),
    0
  );

  const kaloriDurumu =
    form.hedefKalori && toplamKalori
      ? toplamKalori > Number(form.hedefKalori)
        ? "Hedef kalorinin üzerinde"
        : toplamKalori < Number(form.hedefKalori)
        ? "Hedef kalorinin altında"
        : "Hedef kaloriye eşit"
      : "Hedef kalori girilmedi";

  const todayMin = todayIsoLocal();
  const basTrim = form.baslangicTarihi?.trim() ?? "";
  const bitisMin = basTrim && basTrim >= todayMin ? basTrim : todayMin;

  const formGuncelle = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const ogunGuncelle = (id, field, value) => {
    setForm({
      ...form,
      ogunler: form.ogunler.map((ogun) =>
        ogun.id === id ? { ...ogun, [field]: value } : ogun
      ),
    });
  };

  const ogunEkle = () => {
    setForm({
      ...form,
      ogunler: [
        ...form.ogunler,
        { id: Date.now(), ogunAdi: "", saat: "", icerik: "", kalori: "" },
      ],
    });
  };

  const ogunSil = (id) => {
    setForm({
      ...form,
      ogunler: form.ogunler.filter((ogun) => ogun.id !== id),
    });
  };

  const formuTemizle = () => {
    setForm(bosForm);
    setDuzenlenenPlanId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.clientUserId) { alert("Danışan seçimi zorunludur."); return; }
    if (!form.baslik.trim()) { alert("Plan başlığı zorunludur."); return; }
    if (!form.baslangicTarihi?.trim()) { alert("Başlangıç tarihi zorunludur."); return; }

    const bas = form.baslangicTarihi.trim();
    const bugun = todayIsoLocal();
    if (bas < bugun) { alert("Başlangıç tarihi bugünden önce olamaz."); return; }
    
    const bit = form.bitisTarihi?.trim();
    if (bit) {
      if (bit < bugun) { alert("Bitiş tarihi bugünden önce olamaz."); return; }
      if (bit < bas) { alert("Bitiş tarihi başlangıçtan önce olamaz."); return; }
    }

    const ogunler = buildOgunlerPayload(form, toplamKalori, kaloriDurumu);

    const body = {
      clientUserId: Number(form.clientUserId),
      planAdi: form.baslik.trim(),
      baslangicTarihi: form.baslangicTarihi.trim(),
      bitisTarihi: form.bitisTarihi?.trim() || null,
      ogunler,
    };

    try {
      if (duzenlenenPlanId) {
        const r = await fetch(`/api/diyetisyen/plans/${duzenlenenPlanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          alert(j.error || "Güncelleme başarısız.");
          return;
        }
        alert("Diyet planı güncellendi.");
      } else {
        const r = await fetch("/api/diyetisyen/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body),
        });
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          alert(j.error || "Kayıt başarısız.");
          return;
        }
        alert("Diyet planı oluşturuldu.");
      }
      formuTemizle();
      await refreshPlans();
    } catch {
      alert("İstek gönderilemedi.");
    }
  };

  const planiDuzenle = (plan) => {
    setDuzenlenenPlanId(plan.id);
    setForm(formFromApiPlan(plan, bosForm.ogunler));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const planSil = async (id) => {
    if (id == null || !Number.isFinite(Number(id))) {
      alert("Geçersiz plan kimliği; sayfayı yenileyip tekrar deneyin.");
      return;
    }
    if (!window.confirm("Bu planı silmek istediğinize emin misiniz?")) return;
    try {
      const r = await fetch(`/api/diyetisyen/plans/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        alert(j.error || `Silinemedi (${r.status}).`);
        return;
      }
      if (duzenlenenPlanId === id) formuTemizle();
      if (goruntulenenPlan?.id === id) setGoruntulenenPlan(null);
      await refreshPlans();
    } catch {
      alert("İstek gönderilemedi.");
    }
  };

  const gMeta = goruntulenenPlan ? parseMetaFromPlan(goruntulenenPlan) : null;
  const detailMeals = gMeta?.meals?.length ? gMeta.meals : bosForm.ogunler;

  const styles = {
    page: { padding: "30px", backgroundColor: "#f8fafc", minHeight: "100vh", marginLeft: "280px", boxSizing: "border-box", fontFamily: "'Inter', sans-serif" },
    headerCard: { backgroundColor: "white", padding: "24px 30px", borderRadius: "20px", marginBottom: "25px", boxShadow: "0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #f1f5f9" },
    card: { backgroundColor: "white", padding: "25px", borderRadius: "24px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9", marginBottom: "25px" },
    input: { width: "100%", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "0.2s" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" },
    
    // YENİ: Öğün satırını yan yana dizen Grid yapısı
    mealGrid: { display: "grid", gridTemplateColumns: "2fr 1fr 3fr 1fr auto", gap: "12px", alignItems: "center" },
    
    btnPrimary: { backgroundColor: "#39d373", color: "#1e4d3b", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px", transition: "0.2s" },
    btnSecondary: { backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "12px 24px", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "0.2s" },
    btnDanger: { backgroundColor: "#fee2e2", color: "#ef4444", border: "none", padding: "12px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
    listItem: { backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "15px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" },
    mealBox: { backgroundColor: "white", padding: "15px", borderRadius: "16px", marginBottom: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" },
    statusBadge: { backgroundColor: "#e6f4ea", color: "#1e4d3b", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700" }
  };

  return (
    <div style={styles.page}>
      <div style={styles.headerCard}>
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>Plan Yönetimi</h2>
        <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#64748b" }}>Yeni diyet planları oluşturun veya mevcutları düzenleyin.</p>
      </div>

      {loadState.err && (
        <div style={{ ...styles.card, backgroundColor: "#fee2e2", color: "#ef4444", padding: "15px", borderColor: "#fca5a5" }}>
          {loadState.err}
        </div>
      )}

      {goruntulenenPlan && (
        <div style={{ ...styles.card, backgroundColor: "#1e4d3b", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "22px", color: "#39d373" }}>{goruntulenenPlan.planAdi}</h3>
              <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.8 }}>Danışan: {goruntulenenPlan.clientFullName || `#${goruntulenenPlan.clientUserId}`}</p>
            </div>
            <span style={styles.statusBadge}>{gMeta?.durum || "Aktif"}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "16px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700" }}>TÜR</small>
              <div style={{ fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{gMeta?.planTuru || "-"}</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "16px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700" }}>TOPLAM KALORİ</small>
              <div style={{ fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{gMeta?.toplamKalori ?? 0} kcal</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "16px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700" }}>HEDEF KALORİ</small>
              <div style={{ fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{gMeta?.hedefKalori || "-"} kcal</div>
            </div>
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "16px", textAlign: "center" }}>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", fontWeight: "700" }}>SU HEDEFİ</small>
              <div style={{ fontWeight: "800", fontSize: "16px", marginTop: "5px" }}>{gMeta?.suHedefi || "-"} ml</div>
            </div>
          </div>

          {gMeta?.not && (
             <p style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "15px", borderRadius: "12px", fontSize: "14px", fontStyle: "italic" }}>
               "{gMeta.not}"
             </p>
          )}

          <h4 style={{ color: "#39d373", marginTop: "20px", marginBottom: "15px" }}>Öğün İçerikleri</h4>
          <div style={{ display: "grid", gap: "10px" }}>
            {(detailMeals || []).map((ogun) => (
              <div key={ogun.id ?? ogun.ogunAdi} style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "15px", color: "white" }}>{ogun.ogunAdi} <span style={{ opacity: 0.6, fontSize: "12px", marginLeft: "10px" }}>{ogun.saat || "-"}</span></strong>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", display: "block", marginTop: "4px" }}>{ogun.icerik || "İçerik girilmedi"}</span>
                </div>
                <div style={{ backgroundColor: "#39d373", color: "#1e4d3b", padding: "5px 10px", borderRadius: "8px", fontWeight: "700", fontSize: "12px" }}>
                  {ogun.kalori || 0} kcal
                </div>
              </div>
            ))}
          </div>

          <button style={{ ...styles.btnSecondary, width: "100%", marginTop: "20px", backgroundColor: "rgba(255,255,255,0.1)", color: "white" }} onClick={() => setGoruntulenenPlan(null)}>
            Detayı Kapat
          </button>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>
          {duzenlenenPlanId ? "✍️ Diyet Planını Güncelle" : "✨ Yeni Diyet Planı Oluştur"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <select style={styles.input} value={form.clientUserId} onChange={(e) => formGuncelle("clientUserId", e.target.value)} disabled={loadState.loading || danisanlar.length === 0}>
              <option value="">{danisanlar.length === 0 ? "Onaylı danışan yok" : "Danışan seçin..."}</option>
              {danisanlar.map((d) => (<option key={d.id} value={String(d.id)}>{d.fullName}</option>))}
            </select>
            <input style={styles.input} type="text" placeholder="Plan Başlığı (Örn: Yaz Detoksu)" value={form.baslik} onChange={(e) => formGuncelle("baslik", e.target.value)} />
            <select style={styles.input} value={form.planTuru} onChange={(e) => formGuncelle("planTuru", e.target.value)}>
              <option>Kilo Verme</option><option>Kilo Alma</option><option>Kilo Koruma</option><option>Sporcu Beslenmesi</option>
            </select>
          </div>

          <div style={styles.grid}>
            {/* KİLO: Max 3 Hane Sınırı */}
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Danışan Kilosu (kg)" 
              value={form.danisanKilo} 
              onChange={(e) => { if(e.target.value.length <= 3) formGuncelle("danisanKilo", e.target.value); }} 
            />
            {/* KALORİ: Max 5 Hane Sınırı */}
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Hedef Kalori (kcal)" 
              value={form.hedefKalori} 
              onChange={(e) => { if(e.target.value.length <= 5) formGuncelle("hedefKalori", e.target.value); }} 
            />
            {/* SU: Max 5 Hane Sınırı */}
            <input 
              style={styles.input} 
              type="number" 
              placeholder="Su Hedefi (ml)" 
              value={form.suHedefi} 
              onChange={(e) => { if(e.target.value.length <= 5) formGuncelle("suHedefi", e.target.value); }} 
            />
          </div>

          <div style={styles.grid}>
            <input style={styles.input} type="date" min={todayMin} value={form.baslangicTarihi} onChange={(e) => formGuncelle("baslangicTarihi", e.target.value)} />
            <input style={styles.input} type="date" min={bitisMin} value={form.bitisTarihi} onChange={(e) => formGuncelle("bitisTarihi", e.target.value)} />
            <select style={styles.input} value={form.durum} onChange={(e) => formGuncelle("durum", e.target.value)}>
              <option>Aktif</option><option>Pasif</option><option>Tamamlandı</option>
            </select>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <input style={styles.input} type="text" placeholder="Diyetisyen Notu (Opsiyonel)" value={form.not} onChange={(e) => formGuncelle("not", e.target.value)} />
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, color: "#1e293b", fontSize: "16px" }}>🍽️ Plan Öğünleri</h4>
              {/* ÖĞÜN EKLE BUTONU ARTIK RENKLİ (YEŞİL) */}
              <button type="button" style={{ ...styles.btnPrimary, padding: "8px 16px", marginTop: 0 }} onClick={ogunEkle}>+ Öğün Ekle</button>
            </div>

            {form.ogunler.map((ogun) => (
              <div key={ogun.id} style={styles.mealBox}>
                {/* YENİ: grid yerine mealGrid kullandık, hepsi tek satırda ve SİL butonu sonda */}
                <div style={styles.mealGrid}>
                  <input style={styles.input} type="text" placeholder="Öğün Adı" value={ogun.ogunAdi} onChange={(e) => ogunGuncelle(ogun.id, "ogunAdi", e.target.value)} />
                  <input style={styles.input} type="time" value={ogun.saat} onChange={(e) => ogunGuncelle(ogun.id, "saat", e.target.value)} />
                  <input style={styles.input} type="text" placeholder="İçerik" value={ogun.icerik} onChange={(e) => ogunGuncelle(ogun.id, "icerik", e.target.value)} />
                  
                  {/* ÖĞÜN KALORİ: Max 4 Hane Sınırı */}
                  <input 
                    style={styles.input} 
                    type="number" 
                    placeholder="Kalori" 
                    value={ogun.kalori} 
                    onChange={(e) => { if(e.target.value.length <= 4) ogunGuncelle(ogun.id, "kalori", e.target.value); }} 
                  />
                  
                  <button type="button" style={styles.btnDanger} onClick={() => ogunSil(ogun.id)}>Sil</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "15px" }}>
            <button type="submit" style={styles.btnPrimary} disabled={loadState.loading}>
              {duzenlenenPlanId ? "Güncellemeyi Kaydet" : "Planı Oluştur"}
            </button>
            {duzenlenenPlanId && (
              <button type="button" style={styles.btnSecondary} onClick={formuTemizle}>
                İptal Et
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "20px" }}>📋 Mevcut Planlar</h3>

        {loadState.loading ? (
          <p style={{ color: "#64748b" }}>Planlar yükleniyor...</p>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "16px" }}>
            Henüz hiç plan oluşturmadınız.
          </div>
        ) : (
          plans.map((plan) => {
            const meta = parseMetaFromPlan(plan);
            const durum = meta?.durum || "Aktif";
            return (
              <div style={styles.listItem} key={plan.id}>
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#1e4d3b", fontSize: "16px", fontWeight: "700" }}>{plan.planAdi}</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                    <strong>Danışan:</strong> {plan.clientFullName || `#${plan.clientUserId}`} &nbsp;|&nbsp; 
                    <strong>Tür:</strong> {meta?.planTuru || "-"} &nbsp;|&nbsp; 
                    <strong>Kalori:</strong> {meta?.toplamKalori ?? 0} kcal
                  </p>
                  <span style={{ display: "inline-block", marginTop: "8px", ...styles.statusBadge }}>{durum}</span>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="button" style={{ ...styles.btnSecondary, padding: "8px 16px" }} onClick={() => setGoruntulenenPlan(plan)}>Görüntüle</button>
                  <button type="button" style={{ ...styles.btnPrimary, padding: "8px 16px" }} onClick={() => planiDuzenle(plan)}>Düzenle</button>
                  <button type="button" style={styles.btnDanger} onClick={() => planSil(plan.id)}>Sil</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}