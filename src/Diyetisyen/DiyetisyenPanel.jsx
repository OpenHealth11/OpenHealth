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
  const [onayBekleyenler, setOnayBekleyenler] = useState([]);

  const handlePlansChanged = useCallback((apiPlans) => {
    setData((prev) => ({
      ...prev,
      planlar: plansToDashboardRows(apiPlans),
    }));
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const r = await fetch("/api/diyetisyen/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return;
      const body = await r.json();
      setOnayBekleyenler(Array.isArray(body.requests) ? body.requests : []);
    } catch {
      /* ignore */
    }
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

  useEffect(() => {
    if (activePage !== "onay") return;
    fetchPendingRequests();
  }, [activePage, fetchPendingRequests]);

  const onaylaTalep = async (id) => {
    const token = localStorage.getItem("token");
    const secilen = onayBekleyenler.find((item) => item.id === id);
    try {
      const res = await fetch(`/api/diyetisyen/requests/${id}/approve`, {
        method: "POST",
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
        alert(body.error || "Onaylanamadı.");
        return;
      }
      setOnayBekleyenler((prev) => prev.filter((item) => item.id !== id));
      setData((prev) => ({
        ...prev,
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
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const reddetTalep = async (id) => {
    const token = localStorage.getItem("token");
    const secilen = onayBekleyenler.find((item) => item.id === id);
    try {
      const res = await fetch(`/api/diyetisyen/requests/${id}/reject`, {
        method: "POST",
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
        alert(body.error || "Talep reddedilemedi.");
        return;
      }
      setOnayBekleyenler((prev) => prev.filter((item) => item.id !== id));
      setData((prev) => ({
        ...prev,
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
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
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
            talepler={onayBekleyenler}
            onaylaTalep={onaylaTalep}
            reddetTalep={reddetTalep}
          />
        );
      case "bildirim":
        return <Bildirimler bildirimler={data.bildirimler || []} />;
      default:
        return <DiyetisyenDashboard />;
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