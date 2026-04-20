import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialDiyetisyenData } from "./DiyetisyenMockData";
import "./Diyetisyen.css";

import DiyetisyenSidebar from "./DiyetisyenSidebar";
import DiyetisyenTopbar from "./DiyetisyenTopbar";
import DiyetisyenDashboard from "./DiyetisyenDashboard";
import Danisanlar from "./Danisanlar";
import PlanYonetimi from "./PlanYonetimi";
import GunlukTakip from "./GunlukTakip";
import OnayBekleyenler from "./OnayBekleyenler";
import Bildirimler from "./Bildirimler";

export default function DiyetisyenPanel() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(initialDiyetisyenData || {});

  const addPlan = (newPlan) => {
    if (!newPlan.danisanAdi.trim() || !newPlan.baslik.trim()) return;

    setData((prev) => ({
      ...prev,
      planlar: [
        ...(prev.planlar || []),
        {
          id: Date.now(),
          danisanAdi: newPlan.danisanAdi,
          baslik: newPlan.baslik,
          durum: "Aktif",
        },
      ],
    }));
  };

  const deletePlan = (id) => {
    setData((prev) => ({
      ...prev,
      planlar: (prev.planlar || []).filter((plan) => plan.id !== id),
    }));
  };

  const onaylaTalep = (id) => {
    const secilen = (data.onayBekleyenler || []).find((item) => item.id === id);

    setData((prev) => ({
      ...prev,
      onayBekleyenler: (prev.onayBekleyenler || []).filter(
        (item) => item.id !== id
      ),
      bildirimler: secilen
        ? [
            {
              id: Date.now(),
              mesaj: `${secilen.danisanAdi} adlı danışanın talebi onaylandı.`,
              saat: "Şimdi",
            },
            ...(prev.bildirimler || []),
          ]
        : prev.bildirimler || [],
    }));
  };

  const reddetTalep = (id) => {
    const secilen = (data.onayBekleyenler || []).find((item) => item.id === id);

    setData((prev) => ({
      ...prev,
      onayBekleyenler: (prev.onayBekleyenler || []).filter(
        (item) => item.id !== id
      ),
      bildirimler: secilen
        ? [
            {
              id: Date.now(),
              mesaj: `${secilen.danisanAdi} adlı danışanın talebi reddedildi.`,
              saat: "Şimdi",
            },
            ...(prev.bildirimler || []),
          ]
        : prev.bildirimler || [],
    }));
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DiyetisyenDashboard data={data} />;
      case "danisanlar":
        return <Danisanlar danisanlar={data.danisanlar || []} />;
      case "plan":
        return (
          <PlanYonetimi
            planlar={data.planlar || []}
            addPlan={addPlan}
            deletePlan={deletePlan}
          />
        );
      case "gunluk":
        return <GunlukTakip gunlukKayitlar={data.gunlukKayitlar || []} />;
      case "onay":
        return (
          <OnayBekleyenler
            talepler={data.onayBekleyenler || []}
            onaylaTalep={onaylaTalep}
            reddetTalep={reddetTalep}
          />
        );
      case "bildirim":
        return <Bildirimler bildirimler={data.bildirimler || []} />;
      default:
        return <DiyetisyenDashboard data={data} />;
    }
  };

  return (
    <div className="dy-panel-layout">
      <DiyetisyenSidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="dy-main-content">
        <DiyetisyenTopbar
          fullName={data?.diyetisyen?.fullName || "Diyetisyen"}
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
        />

        {renderPage()}
      </main>
    </div>
  );
}