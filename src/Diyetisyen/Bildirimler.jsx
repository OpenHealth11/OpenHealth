import { useEffect, useState } from "react";

function Bildirimler() {
  const [bildirimler, setBildirimler] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("/api/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
     .then((data) => {
  console.log("API RESPONSE:", data);
  console.log("NOTIFICATIONS:", data.notifications);

  setBildirimler(data.notifications || []);
})
      .catch((err) => {
        console.error("Bildirimler alınamadı:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Bildirimler</h2>

      <div className="dy-card">
        {loading ? (
          <p>Yükleniyor...</p>
        ) : bildirimler.length === 0 ? (
          <p>Henüz bildirim bulunmuyor.</p>
        ) : (
          <div className="dy-list">
            {bildirimler.map((item) => (
              <div
                className="dy-list-item"
                key={item.NotificationID}
              >
                <div>
                  <strong>{item.Title}</strong>

                  <p>{item.Body}</p>

                  <small>
                    {new Date(item.CreatedAt).toLocaleString("tr-TR")}
                  </small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Bildirimler;