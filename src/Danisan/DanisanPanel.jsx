import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialDanisanData, buildHaftalikRaporSnapshot } from "./DanisanMockData";
import { mealsFromLatestPlan } from "./planDisplay";
import "./Danisan.css";

import DanisanSidebar from "./DanisanSidebar";
import Dashboard from "./DanisanDashboard";
import PlanPage from "./PlanPage";
import GunlukTakipPage from "./GunlukTakipPage";
import SuTakipPage from "./SuTakipPage";
import BesinTakasiPage from "./BesinTakasiPage";
import RaporPage from "./RaporPage";
import ProfilPage from "./ProfilPage";
import DiyetisyenlerPage from "./DiyetisyenlerPage";
import { validateProfileMetrics } from "../../validation.js";
import { apiUrl } from "../apiBase.js";

export default function DanisanPanel() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(initialDanisanData);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [plansLoadState, setPlansLoadState] = useState({ loading: true, err: "" });
  const plansInitialFetchDone = useRef(false);
  const [reportRemote, setReportRemote] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportFetchErr, setReportFetchErr] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        const res = await fetch(apiUrl("/api/profile"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        let profileData = {};
        try {
          profileData = raw ? JSON.parse(raw) : {};
        } catch {
          setProfileError("Profil bilgileri okunamadı.");
          return;
        }

        if (!res.ok) {
          if (res.status === 401) {
            sessionStorage.setItem(
              "authFlash",
              "Oturum doğrulanamadı veya hesap bulunamadı. Tekrar giriş yapın."
            );
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login", { replace: true });
            return;
          }
          setProfileError(profileData.error || "Profil bilgileri alınamadı.");
          return;
        }

        setData((prev) => ({
          ...prev,
          user: { ...prev.user, ...profileData },
        }));
      } catch {
        setProfileError("Sunucuya bağlanılamadı.");
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadGunlukKayitlari() {
      const token = localStorage.getItem("token");
      if (!token?.trim()) return;
      try {
        const res = await fetch(apiUrl("/api/danisan/daily-tracking"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let body = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          body = {};
        }
        if (!res.ok || cancelled) return;
        const entries = Array.isArray(body.entries) ? body.entries : [];
        setData((prev) => ({
          ...prev,
          gunlukKayitlar: entries.map((e) =>
            e.kind === "activity"
              ? {
                  id: e.id,
                  kind: "activity",
                  tarih: e.tarih,
                  aktivite: e.aktivite,
                  sure: e.sure,
                  yakilanKalori: e.yakilanKalori ?? 0,
                  not: e.not ?? "",
                }
              : {
                  id: e.id,
                  kind: "meal",
                  tarih: e.tarih,
                  besin: e.besin,
                  kalori: e.kalori,
                  ogun: e.ogun,
                }
          ),
        }));
      } catch {
        /* ignore */
      }
    }
    loadGunlukKayitlari();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activePage !== "dashboard" && activePage !== "plan") {
      return;
    }

    let cancelled = false;

    async function fetchNutritionPlans() {
      const token = localStorage.getItem("token");
      if (!token?.trim()) {
        if (!cancelled) {
          setNutritionPlans([]);
          setPlansLoadState({ loading: false, err: "" });
        }
        return;
      }

      const showSpinner = !plansInitialFetchDone.current;
      if (!cancelled && showSpinner) {
        setPlansLoadState({ loading: true, err: "" });
      }

      try {
        const res = await fetch(apiUrl("/api/danisan/plans"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let body = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          body = {};
        }

        if (!res.ok) {
          if (!cancelled) {
            setNutritionPlans([]);
            const hint =
              body.error ||
              (res.status === 403
                ? "Bu sayfa danışan hesabı gerektirir veya erişim reddedildi."
                : null) ||
              (res.status === 401 ? "Oturum süresi dolmuş olabilir; çıkış yapıp danışan olarak yeniden giriş yapın." : null) ||
              `Beslenme planları alınamadı (HTTP ${res.status}).`;
            setPlansLoadState({
              loading: false,
              err: hint,
            });
          }
          return;
        }

        if (!cancelled) {
          setNutritionPlans(Array.isArray(body.plans) ? body.plans : []);
          setPlansLoadState({ loading: false, err: "" });
          plansInitialFetchDone.current = true;
        }
      } catch {
        if (!cancelled) {
          setNutritionPlans([]);
          setPlansLoadState({ loading: false, err: "Sunucuya bağlanılamadı." });
        }
      }
    }

    fetchNutritionPlans();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "rapor") return;
    const token = localStorage.getItem("token");
    if (!token?.trim()) {
      setReportRemote(null);
      setReportFetchErr("");
      setReportLoading(false);
      return;
    }
    let cancelled = false;
    setReportRemote(null);
    setReportFetchErr("");
    setReportLoading(true);
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/danisan/report-summary?days=7"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const raw = await res.text();
        let body = {};
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          body = {};
        }
        if (!res.ok) {
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        if (!cancelled) {
          setReportRemote(body);
          setReportFetchErr("");
        }
      } catch (e) {
        if (!cancelled) {
          setReportFetchErr(e?.message || "Rapor alınamadı.");
          setReportRemote(null);
        }
      } finally {
        if (!cancelled) setReportLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activePage]);

  const dashboardMeals = useMemo(() => mealsFromLatestPlan(nutritionPlans), [nutritionPlans]);

  const addWater = () => {
    setData((prev) => ({
      ...prev,
      water: { ...prev.water, icilen: Math.min(prev.water.icilen + 1, prev.water.hedef) },
    }));
  };

  const removeWater = () => {
    setData((prev) => ({
      ...prev,
      water: { ...prev.water, icilen: Math.max(prev.water.icilen - 1, 0) },
    }));
  };

  const addGunlukKayit = async (newItem) => {
    const token = localStorage.getItem("token");
    if (!token?.trim()) {
      alert("Oturum bulunamadı.");
      return;
    }

    const tarihStr =
      newItem.tarih || new Date().toISOString().split("T")[0];

    const resolvedKind =
      newItem.kind === "activity"
        ? "activity"
        : String(newItem.aktivite ?? "").trim() !== "" &&
            String(newItem.besin ?? "").trim() === ""
          ? "activity"
          : "meal";

    let bodyPayload;
    if (resolvedKind === "activity") {
      const sureNum = Number(newItem.sure);
      if (
        !String(newItem.aktivite ?? "").trim() ||
        !Number.isFinite(sureNum) ||
        sureNum <= 0
      ) {
        return;
      }
      bodyPayload = {
        kind: "activity",
        aktivite: String(newItem.aktivite).trim(),
        sure: sureNum,
        yakilanKalori: Number(newItem.yakilanKalori || 0),
        not: typeof newItem.not === "string" ? newItem.not : "",
        tarih: tarihStr,
      };
    } else {
      if (
        !String(newItem.besin ?? "").trim() ||
        newItem.kalori == null ||
        newItem.kalori === ""
      ) {
        return;
      }
      bodyPayload = {
        besin: String(newItem.besin).trim(),
        kalori: Number(newItem.kalori),
        ogun: newItem.ogun || "Sabah",
        tarih: tarihStr,
      };
    }

    try {
      const res = await fetch(apiUrl("/api/danisan/daily-tracking"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });
      const raw = await res.text();
      let body = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = {};
      }
      if (!res.ok) {
        alert(body.error || "Günlük kayıt eklenemedi.");
        return;
      }
      const entry = body.entry;
      if (!entry) return;
      setData((prev) => ({
        ...prev,
        gunlukKayitlar: [
          ...prev.gunlukKayitlar,
          entry.kind === "activity"
            ? {
                id: entry.id,
                kind: "activity",
                tarih: entry.tarih,
                aktivite: entry.aktivite,
                sure: entry.sure,
                yakilanKalori: entry.yakilanKalori ?? 0,
                not: entry.not ?? "",
              }
            : {
                id: entry.id,
                kind: "meal",
                tarih: entry.tarih,
                besin: entry.besin,
                kalori: entry.kalori,
                ogun: entry.ogun,
              },
        ],
      }));
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const deleteGunlukKayit = async (id) => {
    const token = localStorage.getItem("token");
    if (!token?.trim()) return;
    try {
      const res = await fetch(
        apiUrl(`/api/danisan/daily-tracking/${encodeURIComponent(id)}`),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const raw = await res.text();
      let body = {};
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = {};
      }
      if (!res.ok) {
        alert(body.error || "Kayıt silinemedi.");
        return;
      }
      setData((prev) => ({
        ...prev,
        gunlukKayitlar: prev.gunlukKayitlar.filter((item) => item.id !== id),
      }));
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  /**
   * @param {object} payload Profil alanları (JSON ile gider)
   * @returns {Promise<{ ok: boolean, error?: string, user?: object }>}
   */
  const updateProfile = async (payload) => {
    const token = localStorage.getItem("token");
    if (!token?.trim()) {
      alert("Oturum bulunamadı.");
      return { ok: false, error: "Oturum yok." };
    }

    const metrics = validateProfileMetrics({
      boy: payload.boy,
      kilo: payload.kilo,
      hedef: payload.hedef,
    });
    if (!metrics.ok) {
      alert(metrics.error);
      return { ok: false, error: metrics.error };
    }

    const body = {
      fullName: payload.fullName,
      boy: payload.boy,
      kilo: payload.kilo,
      hedef: payload.hedef,
      alerji: payload.alerji,
      hastalik: payload.hastalik,
      kullanilanIlaclar:
        typeof payload.kullanilanIlaclar === "string"
          ? payload.kullanilanIlaclar
          : typeof payload.ilaclar === "string"
            ? payload.ilaclar
            : "",
    };

    try {
      const res = await fetch(apiUrl("/api/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      let result = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        alert("Sunucu cevabı okunamadı.");
        return { ok: false, error: "Sunucu cevabı okunamadı." };
      }

      if (!res.ok) {
        alert(result.error || "Profil güncellenemedi.");
        return { ok: false, error: result.error || "Profil güncellenemedi." };
      }

      const mergedUser = result.user;

      setData((prev) => ({ ...prev, user: mergedUser }));
      localStorage.setItem("user", JSON.stringify(mergedUser));
      alert(result.message || "Profil bilgileri güncellendi.");
      return { ok: true, user: mergedUser };
    } catch {
      alert("Sunucuya bağlanılamadı.");
      return { ok: false, error: "Sunucuya bağlanılamadı." };
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard data={{ ...data, meals: dashboardMeals }} />;
      case "plan":
        return (
          <PlanPage plans={nutritionPlans} loading={plansLoadState.loading} error={plansLoadState.err} />
        );
      case "gunluk":
        return (
          <GunlukTakipPage
            kayitlar={data.gunlukKayitlar}
            addGunlukKayit={addGunlukKayit}
            deleteGunlukKayit={deleteGunlukKayit}
          />
        );
      case "su": return <SuTakipPage water={data.water} addWater={addWater} removeWater={removeWater} />;
      case "takas": return <BesinTakasiPage takasOnerileri={data.takasOnerileri} />;
      case "rapor": {
        const fallback = buildHaftalikRaporSnapshot(data);
        const suFallback = Number(data.water?.icilen) || fallback.suOrtalama;
        if (reportLoading) {
          return (
            <div className="page">
              <p style={{ color: "#64748b" }}>Rapor yükleniyor…</p>
            </div>
          );
        }
        const remote = reportRemote;
        const merged =
          remote != null
            ? {
                ortalamaKalori: remote.ortalamaKalori ?? fallback.ortalamaKalori,
                suOrtalama:
                  remote.suOrtalama != null && Number.isFinite(Number(remote.suOrtalama))
                    ? Number(remote.suOrtalama)
                    : suFallback,
                kiloDegisim: remote.kiloDegisim ?? fallback.kiloDegisim,
                uyumOrani: remote.uyumOrani ?? fallback.uyumOrani,
                periodFrom: remote.periodFrom,
                periodTo: remote.periodTo,
                days: remote.days ?? 7,
              }
            : {
                ...fallback,
                suOrtalama: suFallback,
                periodFrom: undefined,
                periodTo: undefined,
                days: 7,
              };
        return (
          <>
            {reportFetchErr ? (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 16px",
                  background: "#fffbeb",
                  borderRadius: "12px",
                  color: "#92400e",
                  fontSize: "14px",
                }}
              >
                Sunucu özeti alınamadı; yerel özet gösteriliyor. ({reportFetchErr})
              </div>
            ) : null}
            <RaporPage rapor={merged} />
          </>
        );
      }
      case "profil": return <ProfilPage user={data.user} updateProfile={updateProfile} />;
      case "diyetisyenler": return <DiyetisyenlerPage />;
      default: return <Dashboard data={{ ...data, meals: dashboardMeals }} />;
    }
  };

  if (profileLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Profil yükleniyor...</div>;
  if (profileError) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{profileError}</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <DanisanSidebar activePage={activePage} setActivePage={setActivePage} />

      <main style={{ flex: 1, marginLeft: "280px", padding: "40px", backgroundColor: "#f8fafc" }}>
        <header className="panel-header" style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e4d3b", margin: 0 }}>Sağlıklı Yaşam</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Sağlık takibini ve günlük planını buradan yönetebilirsin.</p>
        </header>

        <div className="content-container">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}