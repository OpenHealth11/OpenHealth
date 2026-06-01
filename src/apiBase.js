/** Opsiyonel: doğrudan API kökü (örn. http://127.0.0.1:3001). Boşsa göreli /api ... kullanılır. */
export function apiUrl(path) {
  const base = String(import.meta.env.VITE_API_ORIGIN || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
