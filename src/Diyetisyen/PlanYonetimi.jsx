import { useCallback, useEffect, useState } from "react";

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
  const bitisMin =
    basTrim && basTrim >= todayMin ? basTrim : todayMin;

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

    if (!form.clientUserId) {
      alert("Danışan seçimi zorunludur.");
      return;
    }
    if (!form.baslik.trim()) {
      alert("Plan başlığı zorunludur.");
      return;
    }
    if (!form.baslangicTarihi?.trim()) {
      alert("Başlangıç tarihi zorunludur.");
      return;
    }

    const bas = form.baslangicTarihi.trim();
    const bugun = todayIsoLocal();
    if (bas < bugun) {
      alert("Başlangıç tarihi bugünden önce olamaz.");
      return;
    }
    const bit = form.bitisTarihi?.trim();
    if (bit) {
      if (bit < bugun) {
        alert("Bitiş tarihi bugünden önce olamaz.");
        return;
      }
      if (bit < bas) {
        alert("Bitiş tarihi başlangıçtan önce olamaz.");
        return;
      }
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
  const detailMeals =
    gMeta?.meals?.length ? gMeta.meals : bosForm.ogunler;

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Plan Yönetimi</h2>

      {loadState.err && (
        <div className="dy-card" style={{ marginBottom: 16 }}>
          <p>{loadState.err}</p>
        </div>
      )}

      <div className="dy-card">
        <h3>
          {duzenlenenPlanId
            ? "Diyet Planını Güncelle"
            : "Yeni Diyet Planı Oluştur"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="dy-form-grid">
            <select
              value={form.clientUserId}
              onChange={(e) => formGuncelle("clientUserId", e.target.value)}
              disabled={loadState.loading || danisanlar.length === 0}
            >
              <option value="">
                {danisanlar.length === 0
                  ? "Onaylı danışan yok"
                  : "Danışan seçin"}
              </option>
              {danisanlar.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.fullName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Plan başlığı"
              value={form.baslik}
              onChange={(e) => formGuncelle("baslik", e.target.value)}
            />

            <select
              value={form.planTuru}
              onChange={(e) => formGuncelle("planTuru", e.target.value)}
            >
              <option>Kilo Verme</option>
              <option>Kilo Alma</option>
              <option>Kilo Koruma</option>
              <option>Sporcu Beslenmesi</option>
            </select>
          </div>

          <div className="dy-form-grid">
            <input
              type="number"
              placeholder="Danışan kilosu (kg)"
              value={form.danisanKilo}
              onChange={(e) => formGuncelle("danisanKilo", e.target.value)}
            />

            <input
              type="number"
              placeholder="Hedef kalori (kcal)"
              value={form.hedefKalori}
              onChange={(e) => formGuncelle("hedefKalori", e.target.value)}
            />

            <input
              type="number"
              placeholder="Su hedefi (ml)"
              value={form.suHedefi}
              onChange={(e) => formGuncelle("suHedefi", e.target.value)}
            />
          </div>

          <div className="dy-form-grid">
            <input
              type="date"
              min={todayMin}
              value={form.baslangicTarihi}
              onChange={(e) => formGuncelle("baslangicTarihi", e.target.value)}
            />

            <input
              type="date"
              min={bitisMin}
              value={form.bitisTarihi}
              onChange={(e) => formGuncelle("bitisTarihi", e.target.value)}
            />

            <select
              value={form.durum}
              onChange={(e) => formGuncelle("durum", e.target.value)}
            >
              <option>Aktif</option>
              <option>Pasif</option>
              <option>Tamamlandı</option>
            </select>
          </div>

          <div className="dy-form-grid">
            <input
              type="text"
              placeholder="Diyetisyen notu"
              value={form.not}
              onChange={(e) => formGuncelle("not", e.target.value)}
            />
          </div>

          <div className="dy-card" style={{ marginTop: "20px" }}>
            <h3>Plan Öğünleri</h3>

            <div className="dy-list">
              {form.ogunler.map((ogun) => (
                <div className="dy-list-item" key={ogun.id}>
                  <input
                    type="text"
                    placeholder="Öğün adı"
                    value={ogun.ogunAdi}
                    onChange={(e) =>
                      ogunGuncelle(ogun.id, "ogunAdi", e.target.value)
                    }
                  />

                  <input
                    type="time"
                    value={ogun.saat}
                    onChange={(e) =>
                      ogunGuncelle(ogun.id, "saat", e.target.value)
                    }
                  />

                  <input
                    type="text"
                    placeholder="Öğün içeriği"
                    value={ogun.icerik}
                    onChange={(e) =>
                      ogunGuncelle(ogun.id, "icerik", e.target.value)
                    }
                  />

                  <input
                    type="number"
                    placeholder="Kalori"
                    value={ogun.kalori}
                    onChange={(e) =>
                      ogunGuncelle(ogun.id, "kalori", e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="dy-danger-btn"
                    onClick={() => ogunSil(ogun.id)}
                  >
                    Sil
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="dy-secondary-btn"
              onClick={ogunEkle}
              style={{ marginTop: "14px" }}
            >
              + Öğün Ekle
            </button>
          </div>

          <div className="dy-action-group" style={{ marginTop: "16px" }}>
            <button type="submit" className="dy-primary-btn" disabled={loadState.loading}>
              {duzenlenenPlanId ? "Planı Güncelle" : "Planı Kaydet"}
            </button>

            {duzenlenenPlanId && (
              <button
                type="button"
                className="dy-secondary-btn"
                onClick={formuTemizle}
              >
                Güncellemeyi İptal Et
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="dy-card">
        <h3>Mevcut Planlar</h3>

        <div className="dy-list">
          {loadState.loading ? (
            <p>Yükleniyor…</p>
          ) : plans.length === 0 ? (
            <p>Henüz plan oluşturulmadı.</p>
          ) : (
            plans.map((plan) => {
              const meta = parseMetaFromPlan(plan);
              const durum = meta?.durum || "Aktif";
              const toplam = meta?.toplamKalori ?? 0;
              const su = meta?.suHedefi ?? "-";
              return (
                <div className="dy-list-item" key={plan.id}>
                  <div>
                    <strong>{plan.planAdi}</strong>
                    <p>Danışan: {plan.clientFullName || `#${plan.clientUserId}`}</p>
                    <p>Tür: {meta?.planTuru || "-"}</p>
                    <p>Toplam Kalori: {toplam} kcal</p>
                    <p>Su Hedefi: {su} ml</p>
                    <p>Durum: {durum}</p>
                  </div>

                  <div className="dy-action-group">
                    <button
                      type="button"
                      className="dy-primary-btn"
                      onClick={() => setGoruntulenenPlan(plan)}
                    >
                      Görüntüle
                    </button>

                    <button
                      type="button"
                      className="dy-secondary-btn"
                      onClick={() => planiDuzenle(plan)}
                    >
                      Güncelle
                    </button>

                    <button
                      type="button"
                      className="dy-danger-btn"
                      onClick={() => planSil(plan.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {goruntulenenPlan && (
        <div className="dy-card">
          <h3>Plan Detayı</h3>

          <p>
            <strong>Danışan:</strong>{" "}
            {goruntulenenPlan.clientFullName || `#${goruntulenenPlan.clientUserId}`}
          </p>
          <p>
            <strong>Başlık:</strong> {goruntulenenPlan.planAdi}
          </p>
          <p>
            <strong>Plan Türü:</strong> {gMeta?.planTuru || "-"}
          </p>
          <p>
            <strong>Toplam Kalori:</strong> {gMeta?.toplamKalori ?? 0} kcal
          </p>
          <p>
            <strong>Hedef Kalori:</strong> {gMeta?.hedefKalori || "-"} kcal
          </p>
          <p>
            <strong>Su Hedefi:</strong> {gMeta?.suHedefi || "-"} ml
          </p>
          <p>
            <strong>Durum:</strong> {gMeta?.durum || "Aktif"}
          </p>
          <p>
            <strong>Not:</strong> {gMeta?.not || "Not yok"}
          </p>

          <h4 style={{ marginTop: "18px" }}>Öğünler</h4>

          <div className="dy-list">
            {(detailMeals || []).map((ogun) => (
              <div className="dy-list-item" key={ogun.id ?? ogun.ogunAdi}>
                <div>
                  <strong>{ogun.ogunAdi}</strong>
                  <p>Saat: {ogun.saat || "-"}</p>
                  <p>İçerik: {ogun.icerik || "İçerik girilmedi"}</p>
                  <p>Kalori: {ogun.kalori || 0} kcal</p>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="dy-secondary-btn"
            onClick={() => setGoruntulenenPlan(null)}
            style={{ marginTop: "16px" }}
          >
            Detayı Kapat
          </button>
        </div>
      )}
    </div>
  );
}
