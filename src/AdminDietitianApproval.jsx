import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDietitianApproval.css";

const STORAGE_KEY = "openhealth_admin_key";

export default function AdminDietitianApproval() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [inputKey, setInputKey] = useState(adminKey);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchListWithKey = useCallback(async (k) => {
    const key = k.trim();
    if (!key) {
      setError("Önce yönetici anahtarını kaydedin.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/pending-dietitians", {
        headers: { "X-Admin-Key": key },
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setError("Sunucu yanıtı JSON değil.");
        return;
      }
      if (!res.ok) {
        setError(data.error || `İstek başarısız (${res.status}).`);
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setError(
        "Bağlantı kurulamadı. API çalışıyor mu ve .env içinde ADMIN_API_KEY tanımlı mı?"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)?.trim();
    if (saved) {
      setAdminKey(saved);
      setInputKey(saved);
      fetchListWithKey(saved);
    }
  }, [fetchListWithKey]);

  async function saveKey() {
    const k = inputKey.trim();
    setAdminKey(k);
    sessionStorage.setItem(STORAGE_KEY, k);
    setMessage("");
    setError("");
    await fetchListWithKey(k);
  }

  async function loadList() {
    await fetchListWithKey(adminKey);
  }

  async function setStatus(userId, status) {
    const k = adminKey.trim();
    if (!k) return;
    setBusyId(userId);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/admin/users/${userId}/account-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": k,
        },
        body: JSON.stringify({ status }),
      });
      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        setError("Sunucu yanıtı okunamadı.");
        return;
      }
      if (!res.ok) {
        setError(data.error || `İşlem başarısız (${res.status}).`);
        return;
      }
      setMessage(data.message || "Tamam.");
      await fetchListWithKey(k);
    } catch {
      setError("Bağlantı kurulamadı.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-panel">
        <Link className="admin-back" to="/">
          ← Ana sayfa
        </Link>
        <h1>Diyetisyen hesap onayı</h1>
        <p className="admin-lead">
          Bekleyen diyetisyen başvurularını buradan onaylayabilir veya
          reddedebilirsiniz. Anahtar sunucudaki{" "}
          <code className="admin-code">ADMIN_API_KEY</code> ile aynı olmalıdır.
        </p>

        <div className="admin-key-row">
          <label className="admin-label" htmlFor="admin-key">
            Yönetici anahtarı (X-Admin-Key)
          </label>
          <input
            id="admin-key"
            type="password"
            autoComplete="off"
            className="admin-input"
            placeholder=".env içindeki ADMIN_API_KEY"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
          />
          <div className="admin-key-actions">
            <button type="button" className="admin-btn primary" onClick={saveKey}>
              Anahtarı kullan ve listele
            </button>
            <button
              type="button"
              className="admin-btn secondary"
              onClick={loadList}
              disabled={loading || !adminKey.trim()}
            >
              {loading ? "Yükleniyor…" : "Listeyi yenile"}
            </button>
          </div>
        </div>

        {error ? <div className="admin-banner error">{error}</div> : null}
        {message ? <div className="admin-banner ok">{message}</div> : null}

        <div className="admin-table-wrap">
          {loading && users.length === 0 ? (
            <p className="admin-empty">Liste yükleniyor…</p>
          ) : users.length === 0 ? (
            <p className="admin-empty">Onay bekleyen diyetisyen yok.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ad soyad</th>
                  <th>E-posta</th>
                  <th>Kayıt</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                    <td className="admin-actions">
                      <button
                        type="button"
                        className="admin-btn small ok"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "approved")}
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        className="admin-btn small danger"
                        disabled={busyId === u.id}
                        onClick={() => setStatus(u.id, "rejected")}
                      >
                        Reddet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
