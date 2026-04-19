/**
 * Ortak e-posta doğrulama (Node API + Vite). Kuralları değiştirirken tek dosyadan güncelle.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Unicode harf/rakam + yaygın özel karakterler (emoji vb. hariç) */
const LOCAL_PART = /^[\p{L}\p{N}._%+-]+$/u;
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
