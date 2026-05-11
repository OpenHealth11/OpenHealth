import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const KAN_UPLOAD_ROOT = path.join(__dirname, "uploads");

const ALLOWED_EXT = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

export function ensureUploadDirs() {
  const kanDir = path.join(KAN_UPLOAD_ROOT, "kan");
  fs.mkdirSync(kanDir, { recursive: true });
}

/**
 * @param {number} userId
 * @param {string} extWithDot örn. ".pdf"
 * @returns {string} posix kan/12_173.pdf
 */
export function buildKanStorageRelativePath(userId, extWithDot) {
  const e =
    extWithDot && ALLOWED_EXT.has(String(extWithDot).toLowerCase())
      ? String(extWithDot).toLowerCase()
      : ".pdf";
  return path.posix.join("kan", `${Number(userId)}_${Date.now()}${e}`);
}

/** Güvenli mutlak dosya yolu; traversal reddedilir. */
export function resolveKanAbsolute(relativePosix) {
  if (!relativePosix || typeof relativePosix !== "string") return null;
  if (relativePosix.includes("..")) return null;
  const normalized = path.normalize(relativePosix.replace(/\//g, path.sep));
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;
  const abs = path.resolve(KAN_UPLOAD_ROOT, normalized);
  const root = path.resolve(KAN_UPLOAD_ROOT);
  if (!abs.startsWith(root)) return null;
  return abs;
}

export function unlinkQuiet(absPath) {
  try {
    if (absPath && fs.existsSync(absPath)) fs.unlinkSync(absPath);
  } catch {
    /* ignore */
  }
}
