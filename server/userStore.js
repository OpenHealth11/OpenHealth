import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
  
  yas: "",
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
    (r) => r.diyetisyenId === diyetisyenId && r.durum === "pending"
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