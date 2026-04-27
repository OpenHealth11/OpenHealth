import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUserById } from "./userStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "plans.json");

function ensureFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify({ nextPlanId: 1, nextPlanOgunId: 1, plans: [] }, null, 2)
    );
  }
}

function load() {
  ensureFile();
  let db;
  try {
    db = JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    db = { nextPlanId: 1, nextPlanOgunId: 1, plans: [] };
    save(db);
    return db;
  }
  return normalizeDb(db);
}

function save(db) {
  ensureFile();
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
}

/** Bozuk / elle düzenlenmiş plans.json: null id, yanlış nextId vb. */
function normalizeDb(db) {
  let dirty = false;
  if (!db || typeof db !== "object") {
    db = { nextPlanId: 1, nextPlanOgunId: 1, plans: [] };
    dirty = true;
  }
  if (!Array.isArray(db.plans)) {
    db.plans = [];
    dirty = true;
  }
  if (db.nextId != null) {
    const n = Number(db.nextId);
    if (db.nextPlanId == null || !Number.isFinite(db.nextPlanId)) {
      db.nextPlanId = Number.isFinite(n) && n >= 1 ? n : 1;
    }
    delete db.nextId;
    dirty = true;
  }
  let maxPlanId = 0;
  for (const p of db.plans) {
    if (p == null || p.id === undefined || p.id === null || p.id === "") continue;
    const id = Number(p.id);
    if (Number.isFinite(id) && id > maxPlanId) maxPlanId = id;
  }
  if (
    typeof db.nextPlanId !== "number" ||
    !Number.isFinite(db.nextPlanId) ||
    db.nextPlanId < 1
  ) {
    db.nextPlanId = Math.max(1, maxPlanId + 1);
    dirty = true;
  }
  if (db.nextPlanId <= maxPlanId) {
    db.nextPlanId = maxPlanId + 1;
    dirty = true;
  }

  for (const p of db.plans) {
    if (p == null) continue;
    const missing =
      p.id === undefined ||
      p.id === null ||
      p.id === "" ||
      !Number.isFinite(Number(p.id));
    if (missing) {
      p.id = db.nextPlanId++;
      dirty = true;
    }
  }

  let maxOgun = 0;
  for (const p of db.plans) {
    if (!Array.isArray(p.ogunler)) continue;
    for (const r of p.ogunler) {
      if (r == null || r.planOgunId === undefined || r.planOgunId === null) continue;
      const oid = Number(r.planOgunId);
      if (Number.isFinite(oid) && oid > maxOgun) maxOgun = oid;
    }
  }
  if (
    typeof db.nextPlanOgunId !== "number" ||
    !Number.isFinite(db.nextPlanOgunId) ||
    db.nextPlanOgunId < 1
  ) {
    db.nextPlanOgunId = Math.max(1, maxOgun + 1);
    dirty = true;
  }
  if (db.nextPlanOgunId <= maxOgun) {
    db.nextPlanOgunId = maxOgun + 1;
    dirty = true;
  }

  for (const p of db.plans) {
    if (!Array.isArray(p.ogunler)) continue;
    for (const r of p.ogunler) {
      if (r == null) continue;
      const missing =
        r.planOgunId === undefined ||
        r.planOgunId === null ||
        r.planOgunId === "" ||
        !Number.isFinite(Number(r.planOgunId));
      if (missing) {
        r.planOgunId = db.nextPlanOgunId++;
        dirty = true;
      }
    }
  }

  if (dirty) save(db);
  return db;
}

function normalizeOgunRows(rows, allocateIds, db) {
  if (!Array.isArray(rows)) return [];
  const out = [];
  for (const o of rows) {
    if (!o || typeof o.gun !== "string" || !o.gun.trim()) continue;
    const text =
      typeof o.ogunler === "string" ? o.ogunler.trim() : String(o.ogunler ?? "");
    if (!text) continue;
    let planOgunId;
    if (allocateIds) {
      planOgunId = db.nextPlanOgunId++;
    } else {
      const n = Number(o.planOgunId);
      planOgunId = Number.isFinite(n) ? n : db.nextPlanOgunId++;
    }
    out.push({
      planOgunId,
      gun: o.gun.trim(),
      ogunler: text,
    });
  }
  return out;
}

function publicPlan(p) {
  const client = getUserById(p.clientUserId);
  return {
    id: p.id,
    clientUserId: p.clientUserId,
    clientFullName: client?.fullName ?? "",
    planAdi: p.planAdi,
    baslangicTarihi: p.baslangicTarihi,
    bitisTarihi: p.bitisTarihi ?? null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt ?? p.createdAt,
    ogunler: Array.isArray(p.ogunler) ? p.ogunler : [],
  };
}

function assertClient(clientUserId) {
  const client = getUserById(clientUserId);
  if (!client || client.role !== "danisan") {
    return { ok: false, code: "CLIENT_INVALID" };
  }
  if ((client.status ?? "approved") !== "approved") {
    return { ok: false, code: "CLIENT_INACTIVE" };
  }
  return { ok: true, client };
}

export function listPlansByDietitian(dietitianUserId) {
  const { plans } = load();
  const did = Number(dietitianUserId);
  return plans.filter((p) => p.dietitianUserId === did).map(publicPlan);
}

export function getPlanByDietitian(dietitianUserId, planId) {
  const db = load();
  const did = Number(dietitianUserId);
  const pid = Number(planId);
  if (!Number.isFinite(pid)) return null;
  const p = db.plans.find((x) => x.id === pid && x.dietitianUserId === did);
  return p ? publicPlan(p) : null;
}

export function createPlanForDietitian(dietitianUserId, payload) {
  const check = assertClient(payload.clientUserId);
  if (!check.ok) return check;

  const name =
    typeof payload.planAdi === "string" ? payload.planAdi.trim() : "";
  const start =
    typeof payload.baslangicTarihi === "string"
      ? payload.baslangicTarihi.trim()
      : "";
  if (!name || !start) {
    return { ok: false, code: "VALIDATION" };
  }

  let bitisTarihi = null;
  if (payload.bitisTarihi != null && String(payload.bitisTarihi).trim()) {
    bitisTarihi = String(payload.bitisTarihi).trim();
  }

  const db = load();
  const ogunler = normalizeOgunRows(payload.ogunler, true, db);
  if (ogunler.length === 0) {
    return { ok: false, code: "NO_MEAL_CONTENT" };
  }

  const id = db.nextPlanId++;
  const now = new Date().toISOString();
  const plan = {
    id,
    dietitianUserId: Number(dietitianUserId),
    clientUserId: check.client.id,
    planAdi: name,
    baslangicTarihi: start,
    bitisTarihi,
    ogunler,
    createdAt: now,
    updatedAt: now,
  };
  db.plans.push(plan);
  save(db);
  return { ok: true, plan: publicPlan(plan) };
}

/** PB-10: plan meta + isteğe bağlı tüm öğün listesini değiştirir */
export function updatePlanForDietitian(dietitianUserId, planId, payload) {
  const db = load();
  const did = Number(dietitianUserId);
  const pid = Number(planId);
  if (!Number.isFinite(pid)) return { ok: false, code: "NOT_FOUND" };
  const idx = db.plans.findIndex(
    (x) => x.id === pid && x.dietitianUserId === did
  );
  if (idx === -1) return { ok: false, code: "NOT_FOUND" };

  const plan = db.plans[idx];

  if (payload.clientUserId != null) {
    const check = assertClient(Number(payload.clientUserId));
    if (!check.ok) return check;
    plan.clientUserId = check.client.id;
  }

  if (typeof payload.planAdi === "string" && payload.planAdi.trim()) {
    plan.planAdi = payload.planAdi.trim();
  }
  if (typeof payload.baslangicTarihi === "string" && payload.baslangicTarihi.trim()) {
    plan.baslangicTarihi = payload.baslangicTarihi.trim();
  }
  if (payload.bitisTarihi !== undefined) {
    plan.bitisTarihi =
      payload.bitisTarihi == null || !String(payload.bitisTarihi).trim()
        ? null
        : String(payload.bitisTarihi).trim();
  }

  if (Array.isArray(payload.ogunler)) {
    const next = normalizeOgunRows(payload.ogunler, true, db);
    if (next.length === 0) {
      return { ok: false, code: "NO_MEAL_CONTENT" };
    }
    plan.ogunler = next;
  }

  plan.updatedAt = new Date().toISOString();
  db.plans[idx] = plan;
  save(db);
  return { ok: true, plan: publicPlan(plan) };
}

/** PB-09: tek öğün satırı ekle (PlanOgun benzeri) */
export function addPlanOgun(dietitianUserId, planId, body) {
  const db = load();
  const plan = db.plans.find(
    (x) => x.id === Number(planId) && x.dietitianUserId === Number(dietitianUserId)
  );
  if (!plan) return { ok: false, code: "NOT_FOUND" };

  const gun = typeof body.gun === "string" ? body.gun.trim() : "";
  const ogunler =
    typeof body.ogunler === "string" ? body.ogunler.trim() : String(body.ogunler ?? "");
  if (!gun || !ogunler) {
    return { ok: false, code: "VALIDATION" };
  }

  const row = {
    planOgunId: db.nextPlanOgunId++,
    gun,
    ogunler,
  };
  if (!Array.isArray(plan.ogunler)) plan.ogunler = [];
  plan.ogunler.push(row);
  plan.updatedAt = new Date().toISOString();
  save(db);
  return { ok: true, plan: publicPlan(plan), planOgun: row };
}

export function updatePlanOgun(dietitianUserId, planId, planOgunId, body) {
  const db = load();
  const plan = db.plans.find(
    (x) => x.id === Number(planId) && x.dietitianUserId === Number(dietitianUserId)
  );
  if (!plan || !Array.isArray(plan.ogunler)) {
    return { ok: false, code: "NOT_FOUND" };
  }
  const oid = Number(planOgunId);
  const row = plan.ogunler.find((r) => r.planOgunId === oid);
  if (!row) return { ok: false, code: "NOT_FOUND" };

  if (typeof body.gun === "string" && body.gun.trim()) {
    row.gun = body.gun.trim();
  }
  if (typeof body.ogunler === "string" && body.ogunler.trim()) {
    row.ogunler = body.ogunler.trim();
  }
  plan.updatedAt = new Date().toISOString();
  save(db);
  return { ok: true, plan: publicPlan(plan), planOgun: row };
}

export function deletePlanOgun(dietitianUserId, planId, planOgunId) {
  const db = load();
  const plan = db.plans.find(
    (x) => x.id === Number(planId) && x.dietitianUserId === Number(dietitianUserId)
  );
  if (!plan || !Array.isArray(plan.ogunler)) {
    return { ok: false, code: "NOT_FOUND" };
  }
  const oid = Number(planOgunId);
  const before = plan.ogunler.length;
  plan.ogunler = plan.ogunler.filter((r) => r.planOgunId !== oid);
  if (plan.ogunler.length === before) {
    return { ok: false, code: "NOT_FOUND" };
  }
  if (plan.ogunler.length === 0) {
    return { ok: false, code: "NO_MEAL_CONTENT" };
  }
  plan.updatedAt = new Date().toISOString();
  save(db);
  return { ok: true, plan: publicPlan(plan) };
}

export function deletePlanByDietitian(dietitianUserId, planId) {
  const db = load();
  const did = Number(dietitianUserId);
  const pid = Number(planId);
  if (!Number.isFinite(pid)) return { ok: false };
  const idx = db.plans.findIndex(
    (p) => p.id === pid && p.dietitianUserId === did
  );
  if (idx === -1) return { ok: false };
  db.plans.splice(idx, 1);
  save(db);
  return { ok: true };
}
