import { useState, useEffect } from "react";
function DiyetisyenTopbar() {
  const [talepler, setTalepler] = useState([]);

  useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/diyetisyen/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setTalepler(data.requests);
    } catch (err) {
      console.error("Talepler alınamadı:", err);
    }
  };

  fetchRequests();
}, []);

const onaylaTalep = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3001/api/diyetisyen/requests/${id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ekrandan kaldır
    setTalepler((prev) => prev.filter((t) => t.id !== id));
  } catch (err) {
    console.error("Onaylama hatası:", err);
  }
};

const reddetTalep = async (id) => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:3001/api/diyetisyen/requests/${id}/reject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTalepler((prev) => prev.filter((t) => t.id !== id));
  } catch (err) {
    console.error("Reddetme hatası:", err);
  }
};



  return (
    <div className="dy-page">
      <h2 className="dy-page-title">Onay Bekleyenler</h2>

      <div className="dy-card">
        <div className="dy-list">
          {talepler.length === 0 ? (
            <p>Bekleyen talep yok.</p>
          ) : (
            talepler.map((item) => (
              <div className="dy-list-item" key={item.id}>
                <div>
                  <strong>{item.danisanAdi}</strong>
                  <p>{item.talep}</p>
                  <small>{item.tarih}</small>
                </div>

                <div className="dy-action-group">
                  <button
                    className="dy-secondary-btn"
                    onClick={() => onaylaTalep(item.id)}
                  >
                    Onayla
                  </button>
                  <button
                    className="dy-danger-btn"
                    onClick={() => reddetTalep(item.id)}
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default DiyetisyenTopbar;
