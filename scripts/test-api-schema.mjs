/**
 * Yeni SQL şeması + backend bağlantı duman testi.
 * Çalıştır: node scripts/test-api-schema.mjs
 * Önkoşul: Docker MSSQL + .env + API çalışıyor olabilir (doğrudan repo da test eder).
 */
import "dotenv/config";
import * as sqlRepo from "../server/userRepositorySql.js";
import * as planStore from "../server/planStore.js";

const BASE = process.env.TEST_API_BASE || "http://127.0.0.1:3001";
const stamp = Date.now();
const danisanEmail = `test.danisan.${stamp}@openhealth.test`;
const diyetEmail = `test.diyetisyen.${stamp}@openhealth.test`;
const password = "TestPass123!";

const results = [];

function pass(name) {
  results.push({ name, ok: true });
  console.log(`OK  ${name}`);
}

function fail(name, err) {
  const msg = err?.message || String(err);
  results.push({ name, ok: false, msg });
  console.error(`FAIL ${name}: ${msg}`);
}

async function api(method, path, { token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { res, data };
}

async function run() {
  if (!process.env.MSSQL_CONNECTION_STRING?.trim()) {
    fail("MSSQL_CONNECTION_STRING", new Error("Tanımlı değil"));
    return;
  }

  let danisan;
  let diyetisyen;
  let danisanToken;
  let diyetToken;

  try {
    danisan = await sqlRepo.createUser({
      fullName: "Test Danışan",
      email: danisanEmail,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuv", // sadece DB kaydı
      role: "danisan",
    });
    if (!danisan) throw new Error("danışan createUser null");
    pass("createUser (danışan)");

    diyetisyen = await sqlRepo.createUser({
      fullName: "Test Diyetisyen",
      email: diyetEmail,
      passwordHash: "$2a$10$abcdefghijklmnopqrstuv",
      role: "diyetisyen",
    });
    if (!diyetisyen) throw new Error("diyetisyen createUser null");
    pass("createUser (diyetisyen)");

    await sqlRepo.setDietitianAccountStatus(diyetisyen.id, "approved");
    pass("setDietitianAccountStatus approved");

    const req = await sqlRepo.createRequest(danisan.id, diyetisyen.id);
    if (!req?.id) throw new Error("createRequest null");
    pass("createRequest (DietitianUserID)");

    const approved = await sqlRepo.approveRequest(req.id);
    if (!approved?.diyetisyenId) throw new Error("approveRequest başarısız");
    pass("approveRequest (Clients.DietitianUserID)");

    const clients = await sqlRepo.getClientsByDiyetisyenId(diyetisyen.id);
    if (!clients.some((c) => c.id === danisan.id)) {
      throw new Error("getClientsByDiyetisyenId danışanı görmüyor");
    }
    pass("getClientsByDiyetisyenId");

    const planResult = await planStore.createPlanForDietitian(diyetisyen.id, {
      clientUserId: danisan.id,
      planAdi: "Test Plan",
      baslangicTarihi: "2026-06-01",
      bitisTarihi: "2026-06-30",
      ogunler: [
        {
          gun: "2026-06-01",
          ogunler: JSON.stringify([{ ogun: "Kahvaltı", icerik: "Yumurta" }]),
        },
      ],
    });
    if (!planResult.ok || !planResult.plan?.id) {
      throw new Error(planResult.code || "plan oluşturulamadı");
    }
    pass("createPlanForDietitian (trigger + SCOPE_IDENTITY)");

    const meal = await sqlRepo.insertDailyMealForClientUser(danisan.id, {
      besin: "Elma",
      kalori: 80,
      ogun: "Ara öğün",
      tarih: "2026-06-01",
    });
    if (!meal?.id) throw new Error("insertDailyMeal null");
    pass("insertDailyMealForClientUser");

    const water = await sqlRepo.upsertWaterTrackingForClientUser(danisan.id, {
      consumedGlasses: 3,
      targetGlasses: 8,
      recordDate: "2026-06-01",
    });
    if (water?.icilen !== 3) throw new Error("water upsert");
    pass("upsertWaterTrackingForClientUser");

    const summary = await sqlRepo.getWeeklyReportSummaryForClientUser(danisan.id, {
      days: 7,
    });
    if (summary.suOrtalama == null && summary.ortalamaKalori === 0) {
      /* su veya öğün yoksa null kalabilir — en azından hata atmamalı */
    }
    pass("getWeeklyReportSummaryForClientUser");

    const notifs = await sqlRepo.listNotificationsForUser(diyetisyen.id, 20);
    if (!Array.isArray(notifs)) throw new Error("notifications not array");
    pass(`listNotificationsForUser (${notifs.length} kayıt)`);
  } catch (e) {
    fail("SQL repo akışı", e);
  }

  try {
    const regD = await api("POST", "/api/auth/register", {
      body: {
        email: `api.danisan.${stamp}@openhealth.test`,
        password,
        passwordConfirm: password,
        fullName: "API Danışan",
        role: "danisan",
      },
    });
    if (!regD.res.ok || !regD.data.token) {
      throw new Error(regD.data.error || `HTTP ${regD.res.status}`);
    }
    danisanToken = regD.data.token;
    pass("HTTP POST /api/auth/register (danışan)");

    const regY = await api("POST", "/api/auth/register", {
      body: {
        email: `api.diyet.${stamp}@openhealth.test`,
        password,
        passwordConfirm: password,
        fullName: "API Diyetisyen",
        role: "diyetisyen",
      },
    });
    if (!regY.res.ok) throw new Error(regY.data.error || `HTTP ${regY.res.status}`);
    pass("HTTP POST /api/auth/register (diyetisyen)");

    const waterGet = await api("GET", "/api/danisan/water", { token: danisanToken });
    if (!waterGet.res.ok) throw new Error(waterGet.data.error || `HTTP ${waterGet.res.status}`);
    pass("HTTP GET /api/danisan/water");

    const notifGet = await api("GET", "/api/notifications", { token: danisanToken });
    if (!notifGet.res.ok) throw new Error(notifGet.data.error || `HTTP ${notifGet.res.status}`);
    pass("HTTP GET /api/notifications");
  } catch (e) {
    fail("HTTP API", e);
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n--- Özet ---");
  console.log(`Geçen: ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.log("Başarısız:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.msg}`);
    process.exit(1);
  }
  console.log("Tüm kontroller geçti.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
