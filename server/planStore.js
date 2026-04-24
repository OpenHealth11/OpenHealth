import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const plansFile = path.join(dataDir, "plans.json");

function ensurePlansFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(plansFile)) {
    fs.writeFileSync(plansFile, JSON.stringify({ plans: [] }, null, 2));
  }
}

function loadPlansDb() {
  ensurePlansFile();
  return JSON.parse(fs.readFileSync(plansFile, "utf8"));
}

function savePlansDb(db) {
  ensurePlansFile();
  fs.writeFileSync(plansFile, JSON.stringify(db, null, 2));
}

export function getPlansByDietitianId(diyetisyenId) {
  const db = loadPlansDb();
  return db.plans.filter((p) => p.createdBy === Number(diyetisyenId));
}

export function createPlan({ danisanAdi, baslik, createdBy }) {
  const db = loadPlansDb();

  const plan = {
    id: Date.now(),
    danisanId: null,
    danisanAdi: typeof danisanAdi === "string" ? danisanAdi.trim() : "",
    baslik: typeof baslik === "string" ? baslik.trim() : "",
    durum: "Aktif",
    createdBy: Number(createdBy),
    meals: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.plans.push(plan);
  savePlansDb(db);

  return plan;
}

export function deletePlan(planId, dietitianId) {
  const db = loadPlansDb();

  const index = db.plans.findIndex(
    (p) => p.id === Number(planId) && p.createdBy === Number(dietitianId)
  );

  if (index === -1) return null;

  const [deletedPlan] = db.plans.splice(index, 1);
  savePlansDb(db);

  return deletedPlan;
}