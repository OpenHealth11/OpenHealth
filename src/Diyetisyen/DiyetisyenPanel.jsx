import { useCallback, useEffect, useState } from "react";
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

function plansToDashboardRows(apiPlans) {
  if (!Array.isArray(apiPlans)) return [];
  return apiPlans.map((p) => {
    let durum = "Aktif";
    try {
      const raw = p.ogunler?.[0]?.ogunler;
      if (typeof raw === "string" && raw.trim().startsWith("{")) {
        const meta = JSON.parse(raw);
        if (meta.durum) durum = meta.durum;
      }
    } catch {
      /* ignore */
    }
    return {
      id: p.id,
      durum,
      baslik: p.planAdi,
      danisanAdi: p.clientFullName ?? "",
    };
  });
}

export default function DiyetisyenPanel() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [data, setData] = useState(initialDiyetisyenData || {});

  const handlePlansChanged = useCallback((apiPlans) => {
    setData((prev) => ({
      ...prev,
      planlar: plansToDashboardRows(apiPlans),
    }));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/diyetisyen/plans", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((body) => {
        setData((prev) => ({
          ...prev,
          planlar: plansToDashboardRows(body.plans || []),
        }));
      })
      .catch(() => {});
  }, []);

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
        return (
          <DiyetisyenDashboard/>
        );
      case "danisanlar":
        return <Danisanlar />;
      case "plan":
        return <PlanYonetimi onPlansChanged={handlePlansChanged} />;
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
        return (
        <DiyetisyenDashboard 
            danisanlar={data.danisanlar}
            planlar={data.planlar}
            gunlukKayitlar={data.gunlukKayitlar}
          />
        );

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