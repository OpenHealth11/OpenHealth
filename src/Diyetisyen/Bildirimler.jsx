import { useEffect, useState } from "react";

function Bildirimler() {
  const [bildirimler, setBildirimler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBildirimler = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3001/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setBildirimler(data.notifications || []);
      } catch (err) {
        console.error("Bildirimler alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBildirimler();
  }, []);

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Bildirimler</h2>

      <div className="dy-card">
        {loading ? (
          <p>Bildirimler yükleniyor...</p>
        ) : bildirimler.length === 0 ? (
          <p>Henüz bildirim yok.</p>
        ) : (
          <div className="dy-list">
            {bildirimler.map((item) => (
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