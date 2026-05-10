import { useEffect, useState } from "react";
import {
  FiSearch,
  FiStar,
  FiMapPin,
  FiUser,
  FiCheckCircle,
  FiArrowRight,
  FiAward,
  FiClock,
  FiHeart,
} from "react-icons/fi";
import "./Danisan.css";

function DiyetisyenlerPage() {
  const [diyetisyenler, setDiyetisyenler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");

  useEffect(() => {
    const fetchDiyetisyenler = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:3001/api/danisan/diyetisyenler", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : {};

        setDiyetisyenler(data.diyetisyenler || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiyetisyenler();
  }, []);

  const diyetisyenSec = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3001/api/danisan/diyetisyen-sec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ diyetisyenId: id }),
      });

      if (!res.ok) {
        alert("Diyetisyen seçilemedi.");
        return;
      }

      alert("Diyetisyen seçildi.");
    } catch {
      alert("Sunucuya bağlanılamadı.");
    }
  };

  const filtreliDiyetisyenler = diyetisyenler.filter((item) => {
    const metin = `${item.fullName || ""} ${item.uzmanlik || ""} ${item.city || ""}`;
    return metin.toLowerCase().includes(arama.toLowerCase());
  });

  
  return (
    <div className="dyt-list-page">
      <div className="dyt-top-panel">
        <div>
          <span className="dyt-page-label">Diyetisyen ağı</span>
          <h2>Diyetisyenler</h2>
          <p>Uzmanları incele, profil bilgilerine bak ve çalışmak istediğin diyetisyeni seç.</p>
        </div>

        <div className="dyt-top-count">
          <strong>{filtreliDiyetisyenler.length}</strong>
          <span>Diyetisyen</span>
        </div>
      </div>

      <div className="dyt-list-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Diyetisyen adı, uzmanlık veya şehir ara..."
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
      </div>

      <div className="dyt-block-list">
        {filtreliDiyetisyenler.length === 0 ? (
          <div className="dyt-empty-box">Diyetisyen bulunamadı.</div>
        ) : (
          filtreliDiyetisyenler.map((item, index) => (
            <div className="dyt-pro-card" key={item.id}>
              <div className="dyt-rank">#{index + 1}</div>

              <div className="dyt-pro-left">
                <div className="dyt-pro-avatar">
                  {item.fullName?.charAt(0) || <FiUser />}
                </div>

                <div className="dyt-pro-main">
                  <div className="dyt-pro-name-row">
                    <h3>{item.fullName || "Diyetisyen"}</h3>

                    <span className="dyt-status">
                      <span></span>
                      Müsait
                    </span>
                  </div>

                  <p className="dyt-pro-speciality">
                    {item.uzmanlik || "Uzman Diyetisyen"}
                  </p>

                  <p className="dyt-pro-desc">
                    Sağlıklı yaşam, kilo kontrolü ve sürdürülebilir beslenme alışkanlıkları üzerine danışmanlık verir.
                  </p>

                  <div className="dyt-pro-tags">
                    <span><FiAward /> Sertifikalı</span>
                    <span><FiHeart /> Kişiye özel plan</span>
                    <span><FiClock /> Hızlı dönüş</span>
                  </div>
                </div>
              </div>

              <div className="dyt-pro-middle">
                <div className="dyt-pro-info">
                  <FiMapPin />
                  <div>
                    <strong>{item.city || "Şehir yok"}</strong>
                    <small>Konum</small>
                  </div>
                </div>

                <div className="dyt-pro-info">
                  <FiStar />
                  <div>
                    <strong>4.9</strong>
                    <small>Puan</small>
                  </div>
                </div>

                <div className="dyt-pro-info">
                  <FiCheckCircle />
                  <div>
                    <strong>Online</strong>
                    <small>Görüşme</small>
                  </div>
                </div>
              </div>

              <div className="dyt-pro-actions">
                <button className="dyt-profile-small-btn">
                  Profili Gör
                </button>

                <button
                  className="dyt-select-btn"
                  onClick={() => diyetisyenSec(item.id)}
                >
                  Seç
                  <FiArrowRight />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DiyetisyenlerPage;