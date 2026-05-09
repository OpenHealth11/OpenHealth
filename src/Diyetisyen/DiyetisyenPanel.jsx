import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initialDiyetisyenData } from "./DiyetisyenMockData";

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

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DiyetisyenDashboard />;
      case "danisanlar": return <Danisanlar />;
      case "plan": return <PlanYonetimi onPlansChanged={(api) => setData(p => ({...p, planlar: api}))} />;
      case "gunluk": return <GunlukTakip gunlukKayitlar={data.gunlukKayitlar || []} />;
      case "onay": return <OnayBekleyenler talepler={data.onayBekleyenler || []} onaylaTalep={(id) => setData(p => ({...p, onayBekleyenler: p.onayBekleyenler.filter(t => t.id !== id)}))} reddetTalep={(id) => setData(p => ({...p, onayBekleyenler: p.onayBekleyenler.filter(t => t.id !== id)}))} />;
      case "bildirim": return <Bildirimler bildirimler={data.bildirimler || []} />;
      default: return <DiyetisyenDashboard />;
    }
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "280px 1fr", 
      height: "100vh", 
      width: "100vw",
      backgroundColor: "#f8fafc",
      overflow: "hidden"
    }}>
      
      {/* SOL: Sabit Sidebar */}
      <div style={{ height: "100vh", borderRight: "1px solid #e2e8f0" }}>
        <DiyetisyenSidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* SAĞ: İçerik Alanı */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "100vh",
        overflow: "hidden" 
      }}>
        
        <DiyetisyenTopbar fullName={data?.diyetisyen?.fullName || "Dyt. Mustafa Yalçın"} />
        
        <main style={{ 
          flex: 1,
          overflowY: "auto", 
          padding: "30px 20px", 
          display: "flex",
          justifyContent: "center", // İçeriği yatayda ortalar
          alignItems: "flex-start" 
        }}>
          {/* Sayfa İçeriği Sınırlayıcı */}
          <div style={{ width: "100%", maxWidth: "1200px" }}>
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}