import { useEffect, useState } from "react";

function Bildirimler({ bildirimler: propsBildirimler = [] }) {
  const propsSafe = Array.isArray(propsBildirimler) ? propsBildirimler : [];
  const [liste, setListe] = useState(propsSafe);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (!cancelled) setListe(propsSafe);
          return;
        }

        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const fromApi = Array.isArray(data.notifications)
            ? data.notifications
            : [];
          if (!cancelled) {
            setListe(fromApi.length > 0 ? fromApi : propsSafe);
          }
          return;
        }
      } catch (err) {
        console.error("Bildirimler alınamadı:", err);
      }

      if (!cancelled) setListe(propsSafe);
    }

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ilk yüklemede API dene, yoksa prop mock
  }, []);

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Bildirimler</h2>

      <div className="dy-card">
        {loading ? (
          <p>Bildirimler yükleniyor...</p>
        ) : liste.length === 0 ? (
          <p>Henüz bildirim yok.</p>
        ) : (
          <div className="dy-list">
            {liste.map((item) => (
              <div
                className={`dy-list-item ${
                  item.tur === "kritik" ? "dy-critical-item" : ""
                }`}
                key={item.id}
              >
                <div>
                  <strong>{item.mesaj}</strong>
                  <p>{item.saat || item.createdAt}</p>
                </div>

                {item.tur === "kritik" && (
                  <span className="dy-critical-badge">Kritik</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bildirimler;
