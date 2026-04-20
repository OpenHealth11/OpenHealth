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
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  saveDb(db);
  return user;
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