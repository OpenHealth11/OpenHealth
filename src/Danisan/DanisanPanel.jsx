import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialDanisanData } from "./DanisanMockData";
import "./Danisan.css";

import DanisanSidebar from "./DanisanSidebar";
import Dashboard from "./DanisanDashboard";
import PlanPage from "./PlanPage";
import GunlukTakipPage from "./GunlukTakipPage";
import SuTakipPage from "./SuTakipPage";
import BesinTakasiPage from "./BesinTakasiPage";
import RaporPage from "./RaporPage";
import ProfilPage from "./ProfilPage";

export default function DanisanPanel() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(initialDanisanData);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

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
        { id: Date.now(), besin: newItem.besin, kalori: Number(newItem.kalori) },
      ],
    }));
  };

  const deleteGunlukKayit = (id) => {
    setData((prev) => ({
      ...prev,
      gunlukKayitlar: prev.gunlukKayitlar.filter((item) => item.id !== id),
    }));
  };

  const updateProfile = async (updatedUser) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const raw = await res.text();
      let result = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        alert("Sunucu cevabı okunamadı.");
        return;
      }

      if (!res.ok) {
        alert(result.error || "Profil güncellenemedi.");
        return;
      }

      setData((prev) => ({ ...prev, user: result.user }));
      localStorage.setItem("user", JSON.stringify(result.user));
      alert(result.message || "Profil bilgileri güncellendi.");
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard data={data} />;
      case "plan": return <PlanPage meals={data.meals} />;
      case "gunluk": return <GunlukTakipPage kayitlar={data.gunlukKayitlar} addGunlukKayit={addGunlukKayit} deleteGunlukKayit={deleteGunlukKayit} />;
      case "su": return <SuTakipPage water={data.water} addWater={addWater} removeWater={removeWater} />;
      case "takas": return <BesinTakasiPage takasOnerileri={data.takasOnerileri} />;
      case "rapor": return <RaporPage rapor={data.haftalikRapor} />;
      case "profil": return <ProfilPage user={data.user} updateProfile={updateProfile} />;
      default: return <Dashboard data={data} />;
    }
  };

  if (profileLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Profil yükleniyor...</div>;
  if (profileError) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>{profileError}</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <DanisanSidebar activePage={activePage} setActivePage={setActivePage} />

      <main style={{ flex: 1, marginLeft: "280px", padding: "40px", backgroundColor: "#f8fafc" }}>
        <header className="panel-header" style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e4d3b", margin: 0 }}>Danışan Paneli</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Sağlık takibini ve günlük planını buradan yönetebilirsin.</p>
        </header>

        <div className="content-container">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}