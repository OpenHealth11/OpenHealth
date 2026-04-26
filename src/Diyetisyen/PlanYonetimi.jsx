import { useState } from "react";

function PlanYonetimi({ planlar = [], addPlan, deletePlan }) {
  const bosForm = {
    danisanAdi: "",
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

  const [form, setForm] = useState(bosForm);
  const [duzenlenenPlanId, setDuzenlenenPlanId] = useState(null);
  const [goruntulenenPlan, setGoruntulenenPlan] = useState(null);

  const toplamKalori = form.ogunler.reduce(
    (toplam, ogun) => toplam + Number(ogun.kalori || 0),
    0
  );

  const otomatikSuHedefi = form.danisanKilo
    ? Math.round(Number(form.danisanKilo) * 35)
    : 0;

  const kaloriDurumu =
    form.hedefKalori && toplamKalori
      ? toplamKalori > Number(form.hedefKalori)
        ? "Hedef kalorinin üzerinde"
        : toplamKalori < Number(form.hedefKalori)
        ? "Hedef kalorinin altında"
        : "Hedef kaloriye eşit"
      : "Hedef kalori girilmedi";

  const formGuncelle = (field, value) => {
    if (field === "danisanKilo") {
      const hesaplananSu = value ? Math.round(Number(value) * 35) : "";

      setForm({
        ...form,
        danisanKilo: value,
        suHedefi: hesaplananSu,
      });

      return;
    }

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.danisanAdi.trim() || !form.baslik.trim()) {
      alert("Danışan adı ve plan başlığı zorunludur.");
      return;
    }

    const yeniPlan = {
      id: duzenlenenPlanId || Date.now(),
      ...form,
      toplamKalori,
      otomatikSuHedefi,
      kaloriDurumu,
      olusturmaTarihi: new Date().toLocaleDateString("tr-TR"),
    };

    if (duzenlenenPlanId) {
      deletePlan(duzenlenenPlanId);
      addPlan(yeniPlan);
      alert("Diyet planı güncellendi.");
    } else {
      addPlan(yeniPlan);
      alert("Diyet planı oluşturuldu.");
    }

    formuTemizle();
  };

  const planiDuzenle = (plan) => {
    setDuzenlenenPlanId(plan.id);

    setForm({
      danisanAdi: plan.danisanAdi || "",
      baslik: plan.baslik || "",
      danisanKilo: plan.danisanKilo || "",
      planTuru: plan.planTuru || "Kilo Verme",
      baslangicTarihi: plan.baslangicTarihi || "",
      bitisTarihi: plan.bitisTarihi || "",
      hedefKalori: plan.hedefKalori || "",
      suHedefi: plan.suHedefi || "",
      durum: plan.durum || "Aktif",
      not: plan.not || "",
      ogunler: plan.ogunler || bosForm.ogunler,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Plan Yönetimi</h2>

      <div className="dy-card">
        <h3>
          {duzenlenenPlanId
            ? "Diyet Planını Güncelle"
            : "Yeni Diyet Planı Oluştur"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="dy-form-grid">
            <input
              type="text"
              placeholder="Danışan adı"
              value={form.danisanAdi}
              onChange={(e) => formGuncelle("danisanAdi", e.target.value)}
            />

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
              value={form.baslangicTarihi}
              onChange={(e) => formGuncelle("baslangicTarihi", e.target.value)}
            />

            <input
              type="date"
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
            <button type="submit" className="dy-primary-btn">
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
          {planlar.length === 0 ? (
            <p>Henüz plan oluşturulmadı.</p>
          ) : (
            planlar.map((plan) => (
              <div className="dy-list-item" key={plan.id}>
                <div>
                  <strong>{plan.baslik}</strong>
                  <p>Danışan: {plan.danisanAdi}</p>
                  <p>Tür: {plan.planTuru || "-"}</p>
                  <p>Toplam Kalori: {plan.toplamKalori || 0} kcal</p>
                  <p>Su Hedefi: {plan.suHedefi || "-"} ml</p>
                  <p>Durum: {plan.durum || "Aktif"}</p>
                </div>

                <div className="dy-action-group">
                  <button
                    className="dy-primary-btn"
                    onClick={() => setGoruntulenenPlan(plan)}
                  >
                    Görüntüle
                  </button>

                  <button
                    className="dy-secondary-btn"
                    onClick={() => planiDuzenle(plan)}
                  >
                    Güncelle
                  </button>

                  <button
                    className="dy-danger-btn"
                    onClick={() => deletePlan(plan.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {goruntulenenPlan && (
        <div className="dy-card">
          <h3>Plan Detayı</h3>

          <p>
            <strong>Danışan:</strong> {goruntulenenPlan.danisanAdi}
          </p>
          <p>
            <strong>Başlık:</strong> {goruntulenenPlan.baslik}
          </p>
          <p>
            <strong>Plan Türü:</strong> {goruntulenenPlan.planTuru}
          </p>
          <p>
            <strong>Toplam Kalori:</strong> {goruntulenenPlan.toplamKalori} kcal
          </p>
          <p>
            <strong>Hedef Kalori:</strong>{" "}
            {goruntulenenPlan.hedefKalori || "-"} kcal
          </p>
          <p>
            <strong>Su Hedefi:</strong> {goruntulenenPlan.suHedefi || "-"} ml
          </p>
          <p>
            <strong>Durum:</strong> {goruntulenenPlan.durum}
          </p>
          <p>
            <strong>Not:</strong> {goruntulenenPlan.not || "Not yok"}
          </p>

          <h4 style={{ marginTop: "18px" }}>Öğünler</h4>

          <div className="dy-list">
            {goruntulenenPlan.ogunler?.map((ogun) => (
              <div className="dy-list-item" key={ogun.id}>
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

export default PlanYonetimi;