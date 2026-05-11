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
import ProfilPage from "./ProfilPage";
import { FiFileText } from "react-icons/fi";

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
  const [kartProfilDanisan, setKartProfilDanisan] = useState(null);
  const [diyetisyenGunlukKayitlar, setDiyetisyenGunlukKayitlar] = useState([]);
  const [diyetisyenGunlukClients, setDiyetisyenGunlukClients] = useState([]);

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
    if (activePage !== "gunluk") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let cancelled = false;

    (async () => {
      try {
        const [resTrack, resClients] = await Promise.all([
          fetch("/api/diyetisyen/daily-tracking", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/diyetisyen/clients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const rawT = await resTrack.text();
        const rawC = await resClients.text();
        let bodyT = {};
        let bodyC = {};
        try {
          bodyT = rawT ? JSON.parse(rawT) : {};
        } catch {
          bodyT = {};
        }
        try {
          bodyC = rawC ? JSON.parse(rawC) : {};
        } catch {
          bodyC = {};
        }
        if (!resTrack.ok || cancelled) return;
        setDiyetisyenGunlukKayitlar(
          Array.isArray(bodyT.entries) ? bodyT.entries : []
        );
        if (resClients.ok && !cancelled) {
          setDiyetisyenGunlukClients(
            Array.isArray(bodyC.clients) ? bodyC.clients : []
          );
        } else if (!cancelled) {
          setDiyetisyenGunlukClients([]);
        }
      } catch {
        if (!cancelled) {
          setDiyetisyenGunlukKayitlar([]);
          setDiyetisyenGunlukClients([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activePage]);

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

  function bmiHesapla(kilo, boy) {
    if (!kilo || !boy) return "-";
    const metre = boy / 100;
    return (Number(kilo) / (metre * metre)).toFixed(1);
  }

  function kanDosyasiAc(dosyaUrl) {
    if (!dosyaUrl) {
      alert("Bu danışanın yüklenmiş kan değeri dosyası yok.");
      return;
    }
    window.open(dosyaUrl, "_blank");
  }

  const dashboardWithProfil = (
    <DiyetisyenDashboard onProfilGor={(d) => setKartProfilDanisan(d)} />
  );

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return dashboardWithProfil;
      case "danisanlar":
        return <Danisanlar />;
      case "plan":
        return <PlanYonetimi onPlansChanged={handlePlansChanged} />;
      case "gunluk":
        return (
          <GunlukTakip
            gunlukKayitlar={diyetisyenGunlukKayitlar}
            assignedClients={diyetisyenGunlukClients}
          />
        );
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
      case "profil":
        return <ProfilPage profile={data.diyetisyen || {}} />;
      default:
        return dashboardWithProfil;
    }
  };

  const detay = kartProfilDanisan;

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

      {detay && (
        <div
          className="dy-modal-overlay"
          role="presentation"
          onClick={() => setKartProfilDanisan(null)}
        >
          <div
            className="dy-modal-dialog dy-detail-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dy-kart-profil-baslik"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dy-detail-header">
              <div>
                <p>Danışan profili</p>
                <h3 id="dy-kart-profil-baslik">{detay.fullName}</h3>
              </div>

              <button type="button" onClick={() => setKartProfilDanisan(null)}>
                ✕
              </button>
            </div>

            <div className="dy-detail-grid">
              <p>
                <strong>Yaş</strong>
                <br />
                {detay.yas || "-"}
              </p>

              <p>
                <strong>Boy</strong>
                <br />
                {detay.boy ? `${detay.boy} cm` : "-"}
              </p>

              <p>
                <strong>Kilo</strong>
                <br />
                {detay.kilo ? `${detay.kilo} kg` : "-"}
              </p>

              <p>
                <strong>Hedef</strong>
                <br />
                {detay.hedef ? `${detay.hedef} kg` : "-"}
              </p>

              <p>
                <strong>BMI</strong>
                <br />
                {bmiHesapla(detay.kilo, detay.boy)}
              </p>

              <p>
                <strong>Alerji</strong>
                <br />
                {detay.alerji || "Yok"}
              </p>

              <p>
                <strong>Hastalık</strong>
                <br />
                {detay.hastalik || "Yok"}
              </p>

              <p>
                <strong>Durum</strong>
                <br />
                {detay.durum || "-"}
              </p>

              <p>
                <strong>Kullanılan ilaçlar</strong>
                <br />
                {detay.ilaclar || "Bilgi yok"}
              </p>

              <p>
                <strong>Kan değerleri</strong>
                <br />
                {detay.kanDegerleriDosyaUrl || detay.kanDegerleriDosya ? (
                  <button
                    type="button"
                    className="dy-file-btn"
                    onClick={() =>
                      kanDosyasiAc(
                        detay.kanDegerleriDosyaUrl || detay.kanDegerleriDosya
                      )
                    }
                  >
                    <FiFileText />
                    Dosyayı aç
                  </button>
                ) : (
                  "Dosya yüklenmemiş veya diyetisyen erişimi henüz yok."
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}