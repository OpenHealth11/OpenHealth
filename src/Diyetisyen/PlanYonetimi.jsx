import { useCallback, useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiSave, FiEye, FiEdit, FiX, FiInfo } from "react-icons/fi";

const META_V = 1;

/** Yerel takvim günü (date input ile uyumlu YYYY-MM-DD). */
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
    if (r.ok) {
      const data = await r.json();
      const list = data.plans || [];
      setPlans(list);
      onPlansChanged?.(list);
    }
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
        if (cancelled) return;
        const dJson = await dRes.json();
        const pJson = await pRes.json();
        setDanisanlar(dJson.danisanlar || []);
        const list = pJson.plans || [];
        setPlans(list);
        onPlansChanged?.(list);
        setLoadState({ loading: false, err: "" });
      } catch {
        if (!cancelled) setLoadState({ loading: false, err: "Bağlantı hatası." });
      }
    })();
    return () => { cancelled = true; };
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
  const bitisMin = form.baslangicTarihi && form.baslangicTarihi >= todayMin ? form.baslangicTarihi : todayMin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientUserId || !form.baslik.trim() || !form.baslangicTarihi) {
      alert("Lütfen zorunlu alanları (*) doldurun.");
      return;
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
      const url = duzenlenenPlanId ? `/api/diyetisyen/plans/${duzenlenenPlanId}` : "/api/diyetisyen/plans";
      const r = await fetch(url, {
        method: duzenlenenPlanId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        alert(duzenlenenPlanId ? "Diyet planı güncellendi." : "Diyet planı oluşturuldu.");
        setForm(bosForm);
        setDuzenlenenPlanId(null);
        await refreshPlans();
      }
    } catch {
      alert("İstek gönderilemedi.");
    }
  };

  const inputStyle = {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    width: "100%",
    outline: "none"
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    marginBottom: "30px"
  };

  return (
    /* GÜNCELLEME: marginLeft ve minHeight kaldırıldı */
    <div style={{ width: "100%" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1e4d3b", marginBottom: "30px" }}>Plan Yönetimi</h2>

      {/* Form Bölümü */}
      <div style={cardStyle}>
        <h3 style={{ marginBottom: "25px", fontSize: "18px", color: "#1e293b" }}>
          {duzenlenenPlanId ? "Planı Güncelle" : "Yeni Diyet Planı Oluştur"}
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
            <select style={inputStyle} value={form.clientUserId} onChange={(e) => setForm({...form, clientUserId: e.target.value})}>
              <option value="">Danışan Seçin *</option>
              {danisanlar.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
            </select>
            <input style={inputStyle} type="text" placeholder="Plan Başlığı *" value={form.baslik} onChange={(e) => setForm({...form, baslik: e.target.value})} />
            <select style={inputStyle} value={form.planTuru} onChange={(e) => setForm({...form, planTuru: e.target.value})}>
              <option>Kilo Verme</option><option>Kilo Alma</option><option>Kilo Koruma</option><option>Sporcu Beslenmesi</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "15px" }}>
            <input 
              style={inputStyle} 
              type="number" 
              placeholder="Danışan Kilosu (kg)" 
              value={form.danisanKilo} 
              onInput={(e) => e.target.value = e.target.value.slice(0, 3)}
              onChange={(e) => setForm({...form, danisanKilo: e.target.value})} 
            />
            <input 
              style={inputStyle} 
              type="number" 
              placeholder="Hedef Kalori (kcal)" 
              value={form.hedefKalori} 
              onInput={(e) => e.target.value = e.target.value.slice(0, 4)}
              onChange={(e) => setForm({...form, hedefKalori: e.target.value})} 
            />
            <input 
              style={inputStyle} 
              type="number" 
              placeholder="Su Hedefi (ml)" 
              value={form.suHedefi} 
              onInput={(e) => e.target.value = e.target.value.slice(0, 4)}
              onChange={(e) => setForm({...form, suHedefi: e.target.value})} 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginBottom: "20px" }}>
            <label style={{ fontSize: "12px", color: "#64748b" }}>Başlangıç Tarihi *
              <input style={{...inputStyle, marginTop: "5px"}} type="date" min={todayMin} value={form.baslangicTarihi} onChange={(e) => setForm({...form, baslangicTarihi: e.target.value})} />
            </label>
            <label style={{ fontSize: "12px", color: "#64748b" }}>Bitiş Tarihi
              <input style={{...inputStyle, marginTop: "5px"}} type="date" min={bitisMin} value={form.bitisTarihi} onChange={(e) => setForm({...form, bitisTarihi: e.target.value})} />
            </label>
            <label style={{ fontSize: "12px", color: "#64748b" }}>Plan Durumu
              <select style={{...inputStyle, marginTop: "5px"}} value={form.durum} onChange={(e) => setForm({...form, durum: e.target.value})}>
                <option>Aktif</option><option>Pasif</option><option>Tamamlandı</option>
              </select>
            </label>
          </div>

          <textarea 
            style={{...inputStyle, minHeight: "80px", marginBottom: "25px", resize: "none"}} 
            placeholder="Diyetisyen Notu" 
            value={form.not} 
            onChange={(e) => setForm({...form, not: e.target.value})} 
          />

          <div style={{ backgroundColor: "#f8fafc", padding: "20px", borderRadius: "15px", marginBottom: "25px", overflowX: "auto" }}>
            <h4 style={{ marginBottom: "15px", fontSize: "15px" }}>Plan Öğünleri</h4>
            <div style={{ minWidth: "600px" }}> {/* Yatayda sıkışmaması için */}
              {form.ogunler.map((ogun, idx) => (
                <div key={ogun.id} style={{ display: "grid", gridTemplateColumns: "150px 100px 1fr 100px 50px", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                  <input style={inputStyle} type="text" placeholder="Öğün" value={ogun.ogunAdi} onChange={(e) => {
                    const n = [...form.ogunler]; n[idx].ogunAdi = e.target.value; setForm({...form, ogunler: n});
                  }} />
                  <input style={inputStyle} type="time" value={ogun.saat} onChange={(e) => {
                    const n = [...form.ogunler]; n[idx].saat = e.target.value; setForm({...form, ogunler: n});
                  }} />
                  <input style={inputStyle} type="text" placeholder="İçerik" value={ogun.icerik} onChange={(e) => {
                    const n = [...form.ogunler]; n[idx].icerik = e.target.value; setForm({...form, ogunler: n});
                  }} />
                  <input 
                    style={inputStyle} 
                    type="number" 
                    placeholder="kcal" 
                    value={ogun.kalori} 
                    onInput={(e) => e.target.value = e.target.value.slice(0, 4)}
                    onChange={(e) => {
                      const n = [...form.ogunler]; n[idx].kalori = e.target.value; setForm({...form, ogunler: n});
                    }} 
                  />
                  <button type="button" onClick={() => setForm({...form, ogunler: form.ogunler.filter(o => o.id !== ogun.id)})} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer" }}><FiTrash2 /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setForm({...form, ogunler: [...form.ogunler, {id: Date.now(), ogunAdi: "", saat: "", icerik: "", kalori: ""}]})} style={{ width: "100%", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "10px", color: "#64748b", cursor: "pointer", background: "white", marginTop: "10px" }}>+ Öğün Ekle</button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e4d3b" }}>
              Toplam: {toplamKalori} kcal <span style={{ color: "#10b981", marginLeft: "10px" }}>({kaloriDurumu})</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {duzenlenenPlanId && <button type="button" onClick={() => {setForm(bosForm); setDuzenlenenPlanId(null);}} style={{ padding: "12px 25px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer" }}>İptal</button>}
              <button type="submit" style={{ padding: "12px 35px", borderRadius: "12px", border: "none", backgroundColor: "#10b981", color: "white", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                <FiSave /> {duzenlenenPlanId ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Plan Listesi Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" }}>
        {plans.map(plan => {
          const m = parseMetaFromPlan(plan);
          return (
            <div key={plan.id} style={{ backgroundColor: "white", borderRadius: "20px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "800", backgroundColor: "#ecfdf5", padding: "4px 10px", borderRadius: "20px" }}>{m?.planTuru}</span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{plan.baslangicTarihi}</span>
              </div>
              <h4 style={{ margin: "0 0 5px 0", fontSize: "17px", color: "#1e293b" }}>{plan.planAdi}</h4>
              <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "#64748b" }}>Danışan: <strong>{plan.clientFullName}</strong></p>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1, padding: "10px", background: "#f8fafc", borderRadius: "10px", fontSize: "13px", textAlign: "center" }}><strong>{m?.toplamKalori}</strong> kcal</div>
                <div style={{ flex: 1, padding: "10px", background: "#f8fafc", borderRadius: "10px", fontSize: "13px", textAlign: "center" }}><strong>{m?.suHedefi}</strong> ml Su</div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setGoruntulenenPlan(plan)} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><FiEye /> İzle</button>
                <button onClick={() => { setDuzenlenenPlanId(plan.id); setForm(formFromApiPlan(plan, bosForm.ogunler)); window.scrollTo({top:0, behavior:"smooth"}); }} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "none", backgroundColor: "#eff6ff", color: "#3b82f6", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}><FiEdit /> Düzenle</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detay Modal */}
      {goruntulenenPlan && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ backgroundColor: "white", padding: "35px", borderRadius: "25px", maxWidth: "600px", width: "90%", maxHeight: "85vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setGoruntulenenPlan(null)} style={{ position: "absolute", top: "20px", right: "20px", border: "none", background: "none", cursor: "pointer", fontSize: "20px", color: "#64748b" }}><FiX /></button>
            <h3 style={{ fontSize: "22px", marginBottom: "5px" }}>{goruntulenenPlan.planAdi}</h3>
            <p style={{ color: "#10b981", fontWeight: "700", marginBottom: "20px" }}>{goruntulenenPlan.clientFullName} için hazırlanan plan</p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "25px" }}>
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", fontSize: "14px" }}><strong>Tür:</strong> {parseMetaFromPlan(goruntulenenPlan)?.planTuru}</div>
              <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "12px", fontSize: "14px" }}><strong>Hedef:</strong> {parseMetaFromPlan(goruntulenenPlan)?.hedefKalori} kcal</div>
            </div>

            <h4 style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px" }}>Öğün Listesi</h4>
            {(parseMetaFromPlan(goruntulenenPlan)?.meals || []).map((o, i) => (
              <div key={i} style={{ padding: "15px 0", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <strong style={{ color: "#1e4d3b" }}>{o.saat} - {o.ogunAdi}</strong>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{o.kalori} kcal</span>
                </div>
                <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>{o.icerik}</p>
              </div>
            ))}

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fffbeb", borderRadius: "12px", border: "1px solid #fef3c7" }}>
              <strong style={{ fontSize: "13px", color: "#92400e" }}>Diyetisyen Notu:</strong>
              <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#b45309" }}>{parseMetaFromPlan(goruntulenenPlan)?.not || "Not eklenmemiş."}</p>
            </div>

            <button onClick={() => setGoruntulenenPlan(null)} style={{ marginTop: "30px", width: "100%", padding: "15px", borderRadius: "15px", border: "none", backgroundColor: "#1e4d3b", color: "white", fontWeight: "700", cursor: "pointer" }}>Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
}