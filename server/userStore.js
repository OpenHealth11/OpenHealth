import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildWeeklyReportSummary } from "./reportSummary.js";
import { resolveDailyTrackingKind } from "./dailyTrackingKind.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "users.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ users: [], nextId: 1 }, null, 2));
  }
}

export function loadDb() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

export function saveDb(db) {
  ensureFile();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

export function findUserByEmail(email) {
  const { users } = loadDb();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function getUserById(id) {
  const db = loadDb();
  const target = Number(id);
  return db.users.find((u) => u.id === target) ?? null;
}

export function listApprovedDanisanlar() {
  const { users } = loadDb();
  return users
    .filter(
      (u) =>
        u.role === "danisan" && (u.status ?? "approved") === "approved"
    )
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
    }));
}

export function listApprovedDietitians() {
  const { users } = loadDb();
  return users
    .filter(
      (u) =>
        u.role === "diyetisyen" && (u.status ?? "approved") === "approved"
    )
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
    }));
}

export function createUser({ fullName, email, passwordHash, role }) {
  const db = loadDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return null;
  }
  const id = db.nextId++;
  const status = role === "diyetisyen" ? "pending" : "approved";
 const user = {
  id,
  fullName,
  email: email.trim().toLowerCase(),
  passwordHash,
  role,
  status,
  
  sonGorusme: "",
  durum: "Pasif",
  diyetisyenId: null,

  boy: "",
  kilo: "",
  hedef: "",
  alerji: "",
  hastalik: "",
  kanGrubu: "",
  dogumTarihi: "",
  cinsiyet: "",
  aktiviteSeviyesi: "",
  kronikRahatsizlik: "",
  kullanilanIlaclar: "",
  ameliyatGecmisi: "",
  sigaraAlkol: "",
  saglikNotu: "",
  measurements: [],
  dailyTracking: [],
  createdAt: new Date().toISOString(),
};
  db.users.push(user);
  saveDb(db);
  return user;
}

export function getUserMeasurements(userId) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  return Array.isArray(user.measurements) ? user.measurements : [];
}

export function addUserMeasurement(userId, measurementData) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  if (!Array.isArray(user.measurements)) {
    user.measurements = [];
  }

  const measurement = {
    id: Date.now(),
    tarih: measurementData.tarih,
    kilo: measurementData.kilo ?? "",
    boy: measurementData.boy ?? "",
    belCevresi: measurementData.belCevresi ?? "",
    kalcaCevresi: measurementData.kalcaCevresi ?? "",
    yagOrani: measurementData.yagOrani ?? "",
    not: typeof measurementData.not === "string" ? measurementData.not.trim() : "",
    createdAt: new Date().toISOString(),
  };

  user.measurements.push(measurement);
  user.updatedAt = new Date().toISOString();

  saveDb(db);
  return measurement;
}

export function setResetToken(email, resetToken, resetTokenExpiresAt) {
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user) return null;

  user.resetToken = resetToken;
  user.resetTokenExpiresAt = resetTokenExpiresAt;
  saveDb(db);
  return user;
}

export function findUserByResetToken(token) {
  const { users } = loadDb();
  return users.find((u) => u.resetToken === token) ?? null;
}

export function updateUserPassword(userId, passwordHash) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  user.passwordHash = passwordHash;
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  user.updatedAt = new Date().toISOString();

  saveDb(db);
  return user;
}
export function updateUserProfile(userId, profileData) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  user.fullName = typeof profileData.fullName === "string"
    ? profileData.fullName.trim()
    : user.fullName;

  user.boy = profileData.boy ?? user.boy;
  user.kilo = profileData.kilo ?? user.kilo;
  user.hedef = profileData.hedef ?? user.hedef;
  user.alerji = typeof profileData.alerji === "string"
    ? profileData.alerji.trim()
    : user.alerji;
  user.hastalik = typeof profileData.hastalik === "string"
    ? profileData.hastalik.trim()
    : user.hastalik;

  user.kullanilanIlaclar =
    typeof profileData.kullanilanIlaclar === "string"
      ? profileData.kullanilanIlaclar.trim()
      : user.kullanilanIlaclar;

  user.updatedAt = new Date().toISOString();

  saveDb(db);
  return user;
}

export function updateUserHealthInfo(userId, healthData) {
  const db = loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  user.kanGrubu = typeof healthData.kanGrubu === "string"
    ? healthData.kanGrubu.trim()
    : user.kanGrubu;

  user.dogumTarihi = typeof healthData.dogumTarihi === "string"
    ? healthData.dogumTarihi.trim()
    : user.dogumTarihi;

  user.cinsiyet = typeof healthData.cinsiyet === "string"
    ? healthData.cinsiyet.trim()
    : user.cinsiyet;

  user.aktiviteSeviyesi = typeof healthData.aktiviteSeviyesi === "string"
    ? healthData.aktiviteSeviyesi.trim()
    : user.aktiviteSeviyesi;

  user.kronikRahatsizlik = typeof healthData.kronikRahatsizlik === "string"
    ? healthData.kronikRahatsizlik.trim()
    : user.kronikRahatsizlik;

  user.kullanilanIlaclar = typeof healthData.kullanilanIlaclar === "string"
    ? healthData.kullanilanIlaclar.trim()
    : user.kullanilanIlaclar;

  user.ameliyatGecmisi = typeof healthData.ameliyatGecmisi === "string"
    ? healthData.ameliyatGecmisi.trim()
    : user.ameliyatGecmisi;

  user.sigaraAlkol = typeof healthData.sigaraAlkol === "string"
    ? healthData.sigaraAlkol.trim()
    : user.sigaraAlkol;

  user.saglikNotu = typeof healthData.saglikNotu === "string"
    ? healthData.saglikNotu.trim()
    : user.saglikNotu;

  user.updatedAt = new Date().toISOString();

  saveDb(db);
  return user;
}

export function getClientsByDiyetisyenId(diyetisyenId) {
  const db = loadDb();

  return db.users.filter(
    (u) => u.role === "danisan" && u.diyetisyenId === diyetisyenId
  );
}

export function getRequestsByDiyetisyenId(diyetisyenId) {
  const db = loadDb();

 return db.requests.filter(
  (r) =>
    Number(r.diyetisyenId) === Number(diyetisyenId) &&
    r.durum === "pending"
);
}

export function approveRequest(requestId) {
  const db = loadDb();

  const request = db.requests.find((r) => r.id === requestId);
  if (!request) return null;

  const user = db.users.find((u) => u.id === request.danisanId);
  if (!user) return null;

  user.diyetisyenId = request.diyetisyenId;
  user.durum = "Aktif";

  request.durum = "approved";

  saveDb(db);

  return user;
}

export function rejectRequest(requestId) {
  const db = loadDb();

  const request = db.requests.find((r) => r.id === requestId);
  if (!request) return null;

  request.durum = "rejected";

  saveDb(db);

  return request;
}

export function createRequest(danisanId, diyetisyenId) {
  const db = loadDb();

  if (!db.requests) {
    db.requests = [];
  }


  const user = db.users.find(
  (u) => Number(u.id) === Number(danisanId)
);

  const yeniTalep = {
    id: Date.now(),
    danisanId,
    diyetisyenId,
    danisanAdi: user?.fullName || "",
    talep: "Diyetisyen atanma isteği",
    tarih: new Date().toLocaleDateString("tr-TR"),
    durum: "pending",
  };

  db.requests.push(yeniTalep);

  saveDb(db);

  return yeniTalep;
}

const ADMIN_ACCOUNT_STATUSES = new Set(["approved", "rejected", "pending"]);

export function listPendingDietitianAccounts() {
  const { users } = loadDb();
  return users
    .filter(
      (u) =>
        u.role === "diyetisyen" && (u.status ?? "approved") === "pending"
    )
    .map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      status: u.status ?? "pending",
      createdAt: u.createdAt ?? "",
    }))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function setDietitianAccountStatus(userId, statusCode) {
  if (!ADMIN_ACCOUNT_STATUSES.has(statusCode)) return null;
  const db = loadDb();
  const user = db.users.find(
    (u) => u.role === "diyetisyen" && Number(u.id) === Number(userId)
  );
  if (!user) return null;
  user.status = statusCode;
  user.updatedAt = new Date().toISOString();
  saveDb(db);
  return user;
}

function filterDailyByRange(entries, range = {}) {
  let list = Array.isArray(entries) ? [...entries] : [];
  if (range.from && typeof range.from === "string") {
    list = list.filter((e) => (e.tarih ?? "") >= range.from.slice(0, 10));
  }
  if (range.to && typeof range.to === "string") {
    list = list.filter((e) => (e.tarih ?? "") <= range.to.slice(0, 10));
  }
  list.sort(
    (a, b) =>
      String(b.tarih ?? "").localeCompare(String(a.tarih ?? "")) ||
      (Number(b.id) || 0) - (Number(a.id) || 0)
  );
  return list;
}

/** @param {{ from?: string, to?: string }} [range] */
export function listDailyTrackingForClientUser(userId, range = {}) {
  const user = getUserById(userId);
  if (!user || user.role !== "danisan") return [];
  const entries = Array.isArray(user.dailyTracking) ? user.dailyTracking : [];
  const normalized = entries.map((e) =>
    e.kind === "activity" ? e : { ...e, kind: "meal" }
  );
  return filterDailyByRange(normalized, range);
}

export function insertDailyMealForClientUser(userId, payload) {
  const db = loadDb();
  const user = db.users.find((u) => Number(u.id) === Number(userId));
  if (!user || user.role !== "danisan") return null;
  if (!Array.isArray(user.dailyTracking)) user.dailyTracking = [];

  const tarih =
    typeof payload.tarih === "string" && payload.tarih.trim()
      ? payload.tarih.trim().slice(0, 10)
      : new Date().toISOString().slice(0, 10);

  if (resolveDailyTrackingKind(payload) === "activity") {
    const aktivite = String(payload.aktivite ?? "").trim();
    const sure = Number(payload.sure);
    if (!aktivite || !Number.isFinite(sure) || sure <= 0) return null;
    const entry = {
      id: Date.now(),
      kind: "activity",
      tarih,
      aktivite,
      sure,
      yakilanKalori: Math.max(0, Number(payload.yakilanKalori) || 0),
      not: String(payload.not ?? "").trim(),
    };
    user.dailyTracking.push(entry);
    user.updatedAt = new Date().toISOString();
    saveDb(db);
    return entry;
  }

  const besin = String(payload.besin ?? "").trim();
  const kalori = Number(payload.kalori);
  const ogun = String(payload.ogun ?? "").trim() || "Öğün";
  if (!besin || !Number.isFinite(kalori) || kalori < 0) return null;

  const entry = {
    id: Date.now(),
    kind: "meal",
    besin,
    kalori,
    ogun,
    tarih,
  };
  user.dailyTracking.push(entry);
  user.updatedAt = new Date().toISOString();
  saveDb(db);
  return entry;
}

export function deleteDailyMealForClientUser(userId, trackingId) {
  const db = loadDb();
  const user = db.users.find((u) => Number(u.id) === Number(userId));
  if (!user || user.role !== "danisan") return false;
  if (!Array.isArray(user.dailyTracking)) user.dailyTracking = [];

  const tid = Number(trackingId);
  const idx = user.dailyTracking.findIndex((e) => Number(e.id) === tid);
  if (idx === -1) return false;
  user.dailyTracking.splice(idx, 1);
  user.updatedAt = new Date().toISOString();
  saveDb(db);
  return true;
}

/** @param {{ from?: string, to?: string }} [range] */
export function listDailyTrackingForDietitianUser(diyetisyenUserId, range = {}) {
  const clients = getClientsByDiyetisyenId(Number(diyetisyenUserId));
  const out = [];
  for (const c of clients) {
    const entries = listDailyTrackingForClientUser(c.id, range);
    for (const e of entries) {
      const kind = e.kind === "activity" ? "activity" : "meal";
      if (kind === "activity") {
        out.push({
          id: e.id,
          danisanAdi: c.fullName ?? "",
          tarih: e.tarih,
          kind: "activity",
          ogun: "Aktivite",
          detay: e.aktivite ?? "",
          kalori: 0,
          aktiviteSure: e.sure,
          yakilanKalori: e.yakilanKalori ?? 0,
          not: e.not ?? "",
          su: 0,
          durum: "Takipte",
        });
      } else {
        out.push({
          id: e.id,
          danisanAdi: c.fullName ?? "",
          tarih: e.tarih,
          kind: "meal",
          detay: e.besin,
          ogun: e.ogun,
          kalori: e.kalori,
          su: 0,
          durum: "Takipte",
          not: "",
        });
      }
    }
  }
  out.sort(
    (a, b) =>
      String(b.tarih ?? "").localeCompare(String(a.tarih ?? "")) ||
      (Number(b.id) || 0) - (Number(a.id) || 0)
  );
  return out;
}

export function getWeeklyReportSummaryForClientUser(userId, opts = {}) {
  const daysWindow = Math.min(Math.max(Number(opts.days) || 7, 1), 90);
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - (daysWindow - 1));
  const pad = (n) => String(n).padStart(2, "0");
  const isoLocal = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromStr = isoLocal(start);
  const toStr = isoLocal(end);

  const entries = listDailyTrackingForClientUser(userId, { from: fromStr, to: toStr });
  const allMeas = getUserMeasurements(userId);
  const measurements = (allMeas || []).filter((m) => {
    const t = (m.tarih ?? "").slice(0, 10);
    return t >= fromStr && t <= toStr;
  });
  const user = getUserById(userId);
  const core = buildWeeklyReportSummary({
    entries,
    measurements,
    profileKilo: user?.kilo,
    profileHedef: user?.hedef,
    daysWindow,
  });
  return {
    ...core,
    periodFrom: fromStr,
    periodTo: toStr,
    days: daysWindow,
  };
}