import { useState } from "react";
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

  const addWater = () => {
    setData((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        icilen: Math.min(prev.water.icilen + 1, prev.water.hedef),
      },
    }));
  };

  const removeWater = () => {
    setData((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        icilen: Math.max(prev.water.icilen - 1, 0),
      },
    }));
  };

  const addGunlukKayit = (newItem) => {
    if (!newItem.besin.trim() || !newItem.kalori) return;

    setData((prev) => ({
      ...prev,
      gunlukKayitlar: [
        ...prev.gunlukKayitlar,
        {
          id: Date.now(),
          besin: newItem.besin,
          kalori: Number(newItem.kalori),
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

  const updateProfile = (updatedUser) => {
    setData((prev) => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard data={data} />;
      case "plan":
        return <PlanPage meals={data.meals} />;
      case "gunluk":
        return (
          <GunlukTakipPage
            kayitlar={data.gunlukKayitlar}
            addGunlukKayit={addGunlukKayit}
            deleteGunlukKayit={deleteGunlukKayit}
          />
        );
      case "su":
        return (
          <SuTakipPage
            water={data.water}
            addWater={addWater}
            removeWater={removeWater}
          />
        );
      case "takas":
        return <BesinTakasiPage takasOnerileri={data.takasOnerileri} />;
      case "rapor":
        return <RaporPage rapor={data.haftalikRapor} />;
      case "profil":
        return <ProfilPage user={data.user} updateProfile={updateProfile} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="panel-layout">
      <DanisanSidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        <header className="panel-header">
          <div>
            <h1>Danışan Paneli</h1>
            <p>Sağlık takibini ve günlük planını buradan yönetebilirsin.</p>
          </div>

          <button className="logout-btn" 
          onClick={() => {
           localStorage.removeItem("token");
           localStorage.removeItem("user");
           navigate("/login");
           }}>
            Çıkış
          </button>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}