/**
 * Ortak e-posta doğrulama (Node API + Vite). Kuralları değiştirirken tek dosyadan güncelle.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ASCII harf/rakam + yaygın özel karakterler (\p{} kullanılmıyor — bazı tarayıcı/Vite ortamlarında boş sayfa riski) */
const LOCAL_PART = /^[a-zA-Z0-9._%+-]+$/;
const DOMAIN_LABEL = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;

/**
 * @param {unknown} raw
 * @returns {{ ok: true, value: string } | { ok: false, error: string }}
 */
export function validateEmail(raw) {
  if (raw == null || typeof raw !== "string") {
    return { ok: false, error: "E-posta gerekli." };
  }
  const trimmed = raw.trim();
  const email = trimmed.toLowerCase();
  if (!email) {
    return { ok: false, error: "E-posta gerekli." };
  }
  if (/\s/.test(trimmed)) {
    return { ok: false, error: "E-posta adresinde boşluk olamaz." };
  }
  if (email.length > 254) {
    return { ok: false, error: "E-posta adresi çok uzun." };
  }
  const at = email.indexOf("@");
  if (at < 1) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (email.indexOf("@", at + 1) !== -1) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || !domain) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (local.length > 64) {
    return { ok: false, error: "E-posta adresinin kullanıcı kısmı çok uzun." };
  }
  if (
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (!LOCAL_PART.test(local)) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..") ||
    !domain.includes(".")
  ) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  const labels = domain.split(".");
  for (const label of labels) {
    if (!label || label.length > 63 || !DOMAIN_LABEL.test(label)) {
      return { ok: false, error: "Geçerli bir e-posta girin." };
    }
  }
  const tld = labels[labels.length - 1];
  if (tld.length < 2) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Geçerli bir e-posta girin." };
  }
  return { ok: true, value: email };
}

/** Danışan profili: boy (cm), kilo/hedef (kg) — boş alanlar izinli (null). */
export function validateProfileMetrics({ boy, kilo, hedef }) {
  const BOY_MIN = 40;
  const BOY_MAX = 250;
  const KG_MIN = 25;
  const KG_MAX = 350;

  const parseOpt = (v) => {
    if (v === null || v === undefined) return { empty: true };
    if (typeof v === "string" && v.trim() === "") return { empty: true };
    const n = Number(v);
    if (!Number.isFinite(n)) return { invalid: true };
    return { empty: false, n };
  };

  const b = parseOpt(boy);
  if (b.invalid) return { ok: false, error: "Boy için geçerli bir sayı girin." };
  if (!b.empty && (b.n < BOY_MIN || b.n > BOY_MAX)) {
    return { ok: false, error: `Boy ${BOY_MIN}–${BOY_MAX} cm arasında olmalıdır.` };
  }

  const k = parseOpt(kilo);
  if (k.invalid) return { ok: false, error: "Kilo için geçerli bir sayı girin." };
  if (!k.empty && (k.n < KG_MIN || k.n > KG_MAX)) {
    return { ok: false, error: `Kilo ${KG_MIN}–${KG_MAX} kg arasında olmalıdır.` };
  }

  const h = parseOpt(hedef);
  if (h.invalid) return { ok: false, error: "Hedef kilo için geçerli bir sayı girin." };
  if (!h.empty && (h.n < KG_MIN || h.n > KG_MAX)) {
    return { ok: false, error: `Hedef kilo ${KG_MIN}–${KG_MAX} kg arasında olmalıdır.` };
  }

  return { ok: true };
}

/** NVARCHAR(4000) ile uyum için metin kırpma */
export function clampNvarcharMax4000(s) {
  if (s == null || typeof s !== "string") return "";
  const t = s.trim();
  return t.length <= 4000 ? t : t.slice(0, 4000);
}
