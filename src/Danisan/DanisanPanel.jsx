import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialDanisanData } from "./DanisanMockData";
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

export default function DanisanPanel() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(initialDanisanData);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [nutritionPlans, setNutritionPlans] = useState([]);
  const [plansLoadState, setPlansLoadState] = useState({ loading: true, err: "" });
  const plansInitialFetchDone = useRef(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setProfileLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/profile", {
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
        const res = await fetch("/api/danisan/plans", {
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

  const addGunlukKayit = (newItem) => {
    if (!newItem.besin.trim() || !newItem.kalori) return;
    setData((prev) => ({
      ...prev,
      gunlukKayitlar: [
        ...prev.gunlukKayitlar,
        {
        id: newItem.id || Date.now(),
        besin: newItem.besin,
        kalori: Number(newItem.kalori),
        ogun: newItem.ogun,
        tarih:
          newItem.tarih ||
          new Date().toISOString().split("T")[0],
      },
      ],
    }));
  };

  const deleteGunlukKayit = (id) => {
    setData((prev) => ({
      ...prev,
      gunlukKayitlar: prev.gunlukKayitlar.filter((item) => item.id !== id),
    }));
  };

  /**
   * @param {object} payload Profil alanları (JSON ile gider)
   * @param {File | null} kanFile Opsiyonel kan raporu — ayrı endpoint ile yüklenir
   * @returns {Promise<{ ok: boolean, error?: string, user?: object }>}
   */
  const updateProfile = async (payload, kanFile = null) => {
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
      const res = await fetch("/api/profile", {
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

      let mergedUser = result.user;

      if (kanFile instanceof File) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const s = String(reader.result || "");
            const i = s.indexOf(",");
            resolve(i >= 0 ? s.slice(i + 1) : s);
          };
          reader.onerror = reject;
          reader.readAsDataURL(kanFile);
        });

        const kres = await fetch("/api/profile/kan-raporu", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: kanFile.type || "application/pdf",
            originalName: kanFile.name,
          }),
        });

        const krb = await kres.text();
        let kj = {};
        try {
          kj = krb ? JSON.parse(krb) : {};
        } catch {
          alert("Profil kaydedildi; kan raporu yanıtı okunamadı.");
          setData((prev) => ({ ...prev, user: mergedUser }));
          localStorage.setItem("user", JSON.stringify(mergedUser));
          return { ok: false, error: "Kan raporu yanıtı okunamadı." };
        }

        if (!kres.ok) {
          alert(
            `Profil kaydedildi; kan raporu yüklenemedi: ${kj.error || kres.status}`
          );
          setData((prev) => ({ ...prev, user: mergedUser }));
          localStorage.setItem("user", JSON.stringify(mergedUser));
          return { ok: false, error: kj.error, user: mergedUser };
        }

        mergedUser = kj.user || mergedUser;
      }

      setData((prev) => ({ ...prev, user: mergedUser }));
      localStorage.setItem("user", JSON.stringify(mergedUser));
      alert(
        kanFile instanceof File
          ? "Profil ve kan raporu güncellendi."
          : result.message || "Profil bilgileri güncellendi."
      );
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
      case "gunluk": return <GunlukTakipPage kayitlar={data.gunlukKayitlar} addGunlukKayit={addGunlukKayit} deleteGunlukKayit={deleteGunlukKayit} />;
      case "su": return <SuTakipPage water={data.water} addWater={addWater} removeWater={removeWater} />;
      case "takas": return <BesinTakasiPage takasOnerileri={data.takasOnerileri} />;
      case "rapor": return <RaporPage rapor={data.haftalikRapor} />;
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